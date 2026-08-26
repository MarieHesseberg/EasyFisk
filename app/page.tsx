"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import "./report.css";
import "./rules.css";
import "./violation.css";
import "./rule-center.css";
import "./feedback-form.css";
import "./home-status.css";
import "./navigation-pages.css";
import "./detail-pages.css";
type Screen = "home" | "map" | "rules" | "stats" | "more";
type SessionRecord = {
  start: number;
  end: number;
  duration: number;
  zone: string;
  result: string;
};
type CatchRecord = {
  id: string;
  caughtAt: number;
  submittedAt: number;
  sessionStart: number;
  species: string;
  result: string;
  length: number;
  weight: number;
  zone: string;
  violation: boolean;
  late: boolean;
  imageName?: string;
  imageData?: string;
  comment?: string;
  correction?: string;
};
const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600),
    m = Math.floor((seconds % 3600) / 60),
    s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};
const formatClock = (time: number | null) =>
  time
    ? new Intl.DateTimeFormat("nb-NO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(time))
    : "--:--";
const formatLongDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600),
    m = Math.floor((seconds % 3600) / 60),
    s = seconds % 60;
  return h ? `${h} t ${m} min` : m ? `${m} min ${s} sek` : `${s} sek`;
};
type DemoStatus =
  | "ok"
  | "noPermit"
  | "wrongZone"
  | "expiredDisinfection"
  | "otherRiver"
  | "noFee"
  | "dailyQuota"
  | "seasonQuota"
  | "lateReport"
  | "hotWater"
  | "closed"
  | "zoneBorder";
const demoStatuses: {
  id: DemoStatus;
  label: string;
  title: string;
  detail: string;
  level: "ok" | "warning" | "blocked";
  action?: string;
}[] = [
  {
    id: "ok",
    label: "Alt er i orden",
    title: "Du er klar til å fiske",
    detail: "Alle krav er kontrollert. Du kan fortsette til sonevalg.",
    level: "ok",
  },
  {
    id: "noPermit",
    label: "Fiskekort mangler",
    title: "Du mangler fiskekort",
    detail: "Det finnes ikke et gyldig fiskekort på profilen din.",
    level: "blocked",
    action: "Registrer fiskekort",
  },
  {
    id: "wrongZone",
    label: "Kortet gjelder feil sone",
    title: "Kortet gjelder ikke Sone 3",
    detail:
      "Kortet ditt gjelder Sone 2. Velg riktig sone eller registrer et annet kort.",
    level: "blocked",
    action: "Velg sone fra fiskekortet",
  },
  {
    id: "expiredDisinfection",
    label: "Desinfiseringen er utløpt",
    title: "Desinfisering må fornyes",
    detail: "Beviset er utløpt. Utstyret må desinfiseres før fiske kan starte.",
    level: "blocked",
    action: "Finn desinfiseringsstasjon",
  },
  {
    id: "otherRiver",
    label: "Besøkt et annet vassdrag",
    title: "Ny desinfisering kreves",
    detail: "Utstyret er brukt i et annet vassdrag etter siste desinfisering.",
    level: "blocked",
    action: "Finn desinfiseringsstasjon",
  },
  {
    id: "noFee",
    label: "Fiskeravgift mangler",
    title: "Fiskeravgiften mangler",
    detail: "Betaling av statlig fiskeravgift må dokumenteres før laksefiske.",
    level: "blocked",
    action: "Registrer dokumentasjon",
  },
  {
    id: "dailyQuota",
    label: "Døgnkvoten er nådd",
    title: "Døgnkvoten er nådd",
    detail:
      "Én avlivet laks er registrert dette fiskerdøgnet. Fisket kan ikke fortsette før neste fiskerdøgn.",
    level: "blocked",
    action: "Se kvoteregnskap",
  },
  {
    id: "seasonQuota",
    label: "Sesongkvoten er nådd",
    title: "Sesongkvoten er nådd",
    detail:
      "Fem avlivede laks er registrert denne sesongen. Videre avliving er ikke tillatt.",
    level: "warning",
    action: "Se regler for gjenutsetting",
  },
  {
    id: "lateReport",
    label: "Fangstrapport er forsinket",
    title: "En fangstrapport mangler",
    detail: "En tidligere fangst må ferdigstilles før en ny økt kan startes.",
    level: "blocked",
    action: "Fullfør fangstrapport",
  },
  {
    id: "hotWater",
    label: "Vanntemperaturen er over 21 °C",
    title: "Fisket er stanset",
    detail:
      "Registrert vanntemperatur er 21,4 °C. Alt fiske er midlertidig stanset.",
    level: "blocked",
    action: "Se temperatur og varsel",
  },
  {
    id: "closed",
    label: "Sonen eller elva er stengt",
    title: "Sone 3 er midlertidig stengt",
    detail: "Det er publisert et aktivt stengningsvarsel for valgt sone.",
    level: "blocked",
    action: "Se åpne soner",
  },
  {
    id: "zoneBorder",
    label: "GPS ved en sonegrense",
    title: "Posisjonen er nær en sonegrense",
    detail:
      "GPS-treffet er usikkert. Kontroller fysisk skilting og velg sone manuelt.",
    level: "warning",
    action: "Velg sone manuelt",
  },
];
const zones = [
  {
    id: 1,
    name: "Sone 1 · Nedre Mandalselva",
    status: "Åpen",
    note: "5 km · munningen–Vik",
    color: "#8bb5d9",
    season: "1. juni–31. august",
    desc: "Tre landfiskeområder og felles båtfiske. Båtkort gjelder hele sone 1 og to stenger per båt.",
  },
  {
    id: 2,
    name: "Sone 2 · Leirkjær–Øyslebø",
    status: "Åpen",
    note: "14 km · 32 delsoner",
    color: "#5f91bd",
    season: "1. juni–31. august",
    desc: "Personlige kort i delsoner som Hauge, Holmesland, Nøding, Fuskeland og Bringsdal. Fysisk skilting langs elva gjelder.",
  },
  {
    id: 3,
    name: "Sone 3 · Øyslebø–Laudal",
    status: "Din sone",
    note: "13 km · ett kort",
    color: "#2563a6",
    season: "1. juni–31. august",
    desc: "Ett fiskekort dekker hele sonen. Variert fiske med store flueområder og dype kulper.",
  },
  {
    id: 4,
    name: "Sone 4 · Laudal–Kavfossen",
    status: "Åpen",
    note: "18 km · Kosåna inkludert",
    color: "#a8c7e0",
    season: "1. juni–15. september",
    desc: "Hovedsone fra Manflå til Kavfossen og Kosåna, samt seks navngitte delsoner.",
  },
];
const ruleSections = [
  {
    id: "documentation",
    icon: "shield",
    title: "Dokumentasjon",
    summary: "Kort, avgift og desinfisering",
    rules: [
      "Fiskekortet er personlig og må stå i fiskerens navn.",
      "Gyldig fiskekort og dokumentasjon på betalt statlig fiskeravgift skal kunne vises til oppsynet.",
      "Alt fiskeutstyr, også båt, kano og motor, skal desinfiseres før bruk i Mandalselva.",
      "Desinfisering gjelder i 20 dager, men blir ugyldig straks utstyret har vært brukt i et annet vassdrag.",
    ],
  },
  {
    id: "season",
    icon: "clock",
    title: "Fisketider",
    summary: "Sesong og utvidelser i 2026",
    rules: [
      "Sone 1, 2 og 3: 1. juni–31. august.",
      "Sone 4 er utvidet til 15. september 2026 etter midtsesongevalueringen.",
      "Delsonene Bjåhylen og Nodehylen i sone 4 stenger 31. august.",
      "Kosåna følger fisketidene for sone 4. Fisketidene kan endres dersom bestandssituasjonen krever det.",
    ],
  },
  {
    id: "gear",
    icon: "fish",
    title: "Redskap",
    summary: "Tillatte agn, kroker og forbud",
    rules: [
      "Flue, sluk og mark er tillatt i alle soner.",
      "Levende fisk som agn, krøking og utstyr som kan fylles med vann er forbudt.",
      "Maksimalt én treblekrok på hvert fiskeredskap.",
      "Kroker skal være mothakeløse eller ha innklemt mothake. Sirkelkrok er påbudt ved markfiske.",
    ],
  },
  {
    id: "daily",
    icon: "clock",
    title: "Døgnkvoter",
    summary: "Kvoter per fiskerdøgn",
    rules: [
      "Døgnkvote: 1 avlivet laks og 1 avlivet sjøaure per fisker.",
      "Når én laks er avlivet, skal alt fiske stoppe til neste fiskerdøgn, også fiske etter sjøørret.",
      "Døgnkvote for gjenutsatt laks er 2.",
      "Kvotedøgnet følger fiskekortdøgnet. I begrensede delsoner er dette normalt kl. 18.00–17.59.",
    ],
  },
  {
    id: "seasonquota",
    icon: "stats",
    title: "Sesongkvoter",
    summary: "Regler oppdatert 1. august",
    rules: [
      "Sesongkvote fra 1. august: 5 avlivede laks.",
      "Én av de fem kan være opptil 90 cm. De fire øvrige skal være under 65 cm.",
      "Sesongkvote for gjenutsatt laks er 20.",
      "Når fem laks er avlivet, skal alt fiske stoppe resten av sesongen, også etter sjøørret og med fang og slipp.",
    ],
  },
  {
    id: "release",
    icon: "leaf",
    title: "Gjenutsetting",
    summary: "Størrelse, utstyr og behandling",
    rules: [
      "Minstemålet for laks og sjøørret er 35 cm. Fisk under minstemålet skal gjenutsettes.",
      "Ha målebånd, krokløsertang og helst knuteløs håv tilgjengelig.",
      "Laksen skal ikke løftes ut av vannet. Eventuelle bilder tas mens fisken ligger i vannfilmen.",
      "All vinterstøing skal gjenutsettes. Fisk med soppsmitte, regnbueørret og pukkellaks skal ikke gjenutsettes, men leveres til oppsynet.",
    ],
  },
  {
    id: "closure",
    icon: "bell",
    title: "Temperatur og stengning",
    summary: "21 °C og ekstraordinære forhold",
    rules: [
      "Alt fiske stopper når vanntemperaturen overstiger 21 °C, målt på Kjølemo.",
      "Elveeigarlaget kan stenge hele eller deler av elva ved forhold som kan påvirke bestanden.",
      "Endringer publiseres på Mandalselvas nettsider. Fysisk skilting og siste publiserte varsel gjelder.",
    ],
  },
  {
    id: "reporting",
    icon: "book",
    title: "Fangstrapportering",
    summary: "Fangst, gjenutsetting og innsats",
    rules: [
      "Fangst skal rapporteres løpende, så raskt som mulig og innen 2 timer.",
      "Rapporten skal inneholde fangst, dato og vekt. Gjenutsatt fisk rapporteres med dato og omtrentlig vekt.",
      "Fiskeinnsats skal rapporteres. Nullfangst rapporteres for fiskedøgn uten fangst.",
      "Sesongkortfiskere må hente et rapporteringskort for hvert døgn de ønsker å fiske.",
    ],
  },
  {
    id: "zones",
    icon: "map",
    title: "Soneregler",
    summary: "Gyldig område og lokale avvik",
    rules: [
      "Kart på nett er veiledende. Oppmerking i elva og lokale regler bestemmer gyldig fiskeområde.",
      "Sone 2 og flere delsoner i sone 4 har begrenset kortsalg og egne korttider.",
      "Fiske er forbudt 50 meter ovenfor og nedenfor fisketrapper, støpte terskler og dammer.",
      "Fiske fra broer og ledgjerde for smolt i Manflåvatn er ikke tillatt.",
    ],
  },
  {
    id: "conduct",
    icon: "user",
    title: "Allmenne hensyn",
    summary: "Natur, grunneiere og andre fiskere",
    rules: [
      "Bevegelig fiske praktiseres: flytt noen meter nedstrøms etter hvert kast.",
      "Start ovenfor andre fiskere og vent til det er plass før du går ut.",
      "Ikke gå over dyrket mark eller gjennom gårdstun. Respekter private brygger og båtplasser.",
      "Ta med alt avfall. Ikke fell trær eller bryt kvist. Bålbrenning er ikke tillatt 15. april–15. september.",
    ],
  },
];
function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const p: Record<string, React.ReactNode> = {
    home: (
      <>
        <path d="m3 11 9-7 9 7" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    map: (
      <>
        <path d="m3 6 5-2 8 3 5-2v14l-5 2-8-3-5 2Z" />
        <path d="M8 4v14M16 7v14" />
      </>
    ),
    activity: (
      <>
        <path d="M12 3v18M3 12h18" />
      </>
    ),
    stats: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    fish: (
      <>
        <path d="M18 8c-4-4-10-3-13 1l-3-2v10l3-2c3 4 9 5 13 1l4 2V6Z" />
        <circle cx="16" cy="11" r=".6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    ticket: (
      <>
        <path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4Z" />
        <path d="M12 7v10" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6Z" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    book: (
      <>
        <path d="M4 5c4-1 6 0 8 2v13c-2-2-4-3-8-2ZM20 5c-4-1-6 0-8 2v13c2-2 4-3 8-2Z" />
      </>
    ),
    bell: (
      <>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
        <path d="M10 20h4" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1-5 4-7 8-7s7 2 8 7" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 4C10 4 5 9 5 16c4 1 10 0 15-12Z" />
        <path d="M4 20c3-6 7-9 12-12" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {p[name]}
    </svg>
  );
}
function Header({ title, eyebrow }: { title: string; eyebrow?: string }) {
  const [showAlerts,setShowAlerts]=useState(false);
  return (
    <header className="app-header">
      <div>
        <span className="brand-mark">
          <Icon name="fish" size={19} />
        </span>
        <span className="wordmark">easyfisk</span>
      </div>
      {eyebrow ? (
        <p>{eyebrow}</p>
      ) : (
        <button className="round-btn" aria-label="Varsler" onClick={()=>setShowAlerts(true)}>
          <Icon name="bell" size={20} />
          <i />
        </button>
      )}
      <h1>{title}</h1>
      {showAlerts&&<div className="header-alert-panel"><button onClick={()=>setShowAlerts(false)}>×</button><small>VARSLER</small><h3>Ingen kritiske varsler</h3><p><Icon name="check" size={15}/> Elva og Sone 3 er åpne.</p><p><Icon name="clock" size={15}/> Fiskekortet utløper i dag kl. 17:59.</p><p><Icon name="bell" size={15}/> Reglene ble oppdatert 1. august.</p></div>}
    </header>
  );
}
function Home({
  onStart,
  onRules,
  onFeedback,
  onControlCard,
  onCatchShortcut,
  onMapShortcut,
  active,
  elapsed,
  startTime,
  demoStatus,
  salmonKilled,
}: {
  onStart: () => void;
  onRules: () => void;
  onFeedback: () => void;
  onControlCard: () => void;
  onCatchShortcut: () => void;
  onMapShortcut: () => void;
  active: boolean;
  elapsed: number;
  startTime: number | null;
  demoStatus: DemoStatus;
  salmonKilled: number;
}) {
  const scenario = demoStatuses.find((s) => s.id === demoStatus)!;
  const stateFor = (ids: DemoStatus[]) =>
    ids.includes(demoStatus)
      ? scenario.level === "warning"
        ? "warning"
        : "error"
      : "ok";
  return (
    <div className="screen">
      <Header title="Din fiskeoversikt" />
      <section
        className={"status-card " + (active ? "active" : scenario.level)}
      >
        <div className="status-top">
          <span className="status-icon">
            <Icon
              name={
                active ? "clock" : scenario.level === "ok" ? "check" : "shield"
              }
              size={25}
            />
          </span>
          <div>
            <small>
              {active
                ? "FISKEØKT PÅGÅR"
                : scenario.level === "blocked"
                  ? "HANDLING KREVES"
                  : scenario.level === "warning"
                    ? "MÅ KONTROLLERES"
                    : "STATUS NÅ"}
            </small>
            <h2>{active ? "Du fisker i sone 3" : scenario.title}</h2>
          </div>
        </div>
        {active ? (
          <>
            <div className="timer">{formatDuration(elapsed)}</div>
            <p>Startet {formatClock(startTime)} · Sone 3</p>
          </>
        ) : (
          <p>{scenario.detail}</p>
        )}
        <button
          className={active ? "stop-button" : "start-button"}
          onClick={onStart}
        >
          <Icon name={active ? "clock" : "activity"} size={20} />
          {active
            ? "STOPP FISKE"
            : scenario.level === "blocked"
              ? "SE HVA SOM MANGLER"
              : scenario.level === "warning"
                ? "KONTROLLER OG START"
                : "START FISKE"}
        </button>
      </section>
      <section>
        <div className="section-head">
          <h3>Dokumentasjon og status</h3>
          <button onClick={onControlCard}>Vis kontrollkort</button>
        </div>
        <div className="check-grid">
          <Status
            icon="ticket"
            title={
              demoStatus === "noPermit"
                ? "Fiskekort mangler"
                : demoStatus === "wrongZone"
                  ? "Fiskekort · feil sone"
                  : "Fiskekort · Sone 3"
            }
            sub={
              demoStatus === "noPermit"
                ? "Ikke registrert"
                : demoStatus === "wrongZone"
                  ? "Kortet gjelder Sone 2"
                  : "Døgnkort · gyldig til 17:59"
            }
            state={stateFor(["noPermit", "wrongZone"])}
          />
          <Status
            icon="shield"
            title="Desinfisering"
            sub={
              demoStatus === "expiredDisinfection"
                ? "Utløpt"
                : demoStatus === "otherRiver"
                  ? "Nytt vassdrag registrert"
                  : "Gyldig 20 dager · ingen andre vassdrag"
            }
            state={stateFor(["expiredDisinfection", "otherRiver"])}
          />
          <Status
            icon="book"
            title="Statlig fiskeravgift"
            sub={
              demoStatus === "noFee"
                ? "Ikke dokumentert"
                : "Betalt og dokumentert"
            }
            state={stateFor(["noFee"])}
          />
          <Status
            icon="fish"
            title={
              demoStatus === "lateReport"
                ? "Fangstrapport mangler"
                : demoStatus === "dailyQuota"
                  ? "Døgnkvote laks"
                  : demoStatus === "seasonQuota"
                    ? "Sesongkvote laks"
                    : "Sesongkvote laks"
            }
            sub={
              demoStatus === "lateReport"
                ? "Tidligere rapport må fullføres"
                : demoStatus === "dailyQuota"
                  ? "Døgnkvoten er nådd"
                  : demoStatus === "seasonQuota"
                    ? "Sesongkvoten er nådd"
                    : `${Math.max(0, 4 - salmonKilled)} av 5 avlivet gjenstår`
            }
            quota
            state={stateFor(["dailyQuota", "seasonQuota", "lateReport"])}
          />
        </div>
      </section>
      <button className="home-feedback-card" onClick={onFeedback}>
        <span><Icon name="bell" /></span>
        <div>
          <small>TILBAKEMELDING OG OBSERVASJON</small>
          <b>Meld fra til elveeigarlaget</b>
          <p>Rapporter feil, forsøpling, syk fisk eller mistenkelig fiske.</p>
        </div>
        <Icon name="chevron" size={18} />
      </button>
      <section
        className={
          "notice " +
          (["hotWater", "closed"].includes(demoStatus) ? "error" : "")
        }
      >
        <div className="notice-icon">
          <Icon name="leaf" />
        </div>
        <div>
          <small>EKSEMPELDATA · KJØLEMO</small>
          <h3>
            {demoStatus === "hotWater"
              ? "Vanntemperatur 21,4 °C"
              : demoStatus === "closed"
                ? "Sone 3 er stengt"
                : "Vannføring 18 m³/s"}
          </h3>
          <p>
            {demoStatus === "hotWater"
              ? "Alt fiske er midlertidig stanset"
              : demoStatus === "closed"
                ? "Aktivt stengningsvarsel · se åpne soner"
                : "Vanntemperatur 11 °C · stans ved over 21 °C"}
          </p>
        </div>
        <span className="trend">→</span>
      </section>
      <section>
        <div className="section-head">
          <h3>Snarveier</h3>
        </div>
        <div className="quick-grid">
          <button onClick={onCatchShortcut}>
            <Icon name="fish" />
            <span>Registrer fangst</span>
          </button>
          <button onClick={onMapShortcut}>
            <Icon name="map" />
            <span>Finn riktig sone</span>
          </button>
          <button onClick={onRules}>
            <Icon name="book" />
            <span>Regler for meg</span>
          </button>
        </div>
      </section>
      <section className="info-card">
        <small>REGLER OPPDATERT 1. AUGUST 2026</small>
        <h3>Én laks per fiskerdøgn</h3>
        <p>
          Når én laks er avlivet, skal alt fiske stoppe til neste fiskerdøgn.
          Minstemålet er 35 cm. Én av sesongens fem avlivede laks kan være
          opptil 90 cm. De fire øvrige må være under 65 cm.
        </p>
        <button onClick={onRules}>
          Se komplett regelkontroll <Icon name="chevron" size={16} />
        </button>
      </section>
    </div>
  );
}
function Status({
  icon,
  title,
  sub,
  quota,
  state = "ok",
}: {
  icon: string;
  title: string;
  sub: string;
  quota?: boolean;
  state?: "ok" | "warning" | "error";
}) {
  return (
    <div className={"home-status " + state}>
      <span>
        <Icon name={icon} />
      </span>
      <p>
        <b>{title}</b>
        <small>{sub}</small>
      </p>
      {state !== "ok" ? (
        <i>!</i>
      ) : quota ? (
        <strong>4</strong>
      ) : (
        <Icon name="check" size={18} />
      )}
    </div>
  );
}
function MapScreen({
  selected,
  setSelected,
  onUseZone,
}: {
  selected: number;
  setSelected: (n: number) => void;
  onUseZone: (n: number) => void;
}) {
  const z = zones[selected - 1];
  const [locationStatus,setLocationStatus]=useState("");
  const locate=()=>{if(!navigator.geolocation)return setLocationStatus("Posisjon er ikke tilgjengelig i denne nettleseren.");setLocationStatus("Henter posisjon …");navigator.geolocation.getCurrentPosition(()=>{setSelected(3);setLocationStatus("Posisjon funnet · foreslått Sone 3")},()=>setLocationStatus("Kunne ikke hente posisjon. Velg sone manuelt."))};
  return (
    <div className="screen map-screen">
      <Header title="Fiskesoner" eyebrow="MANDALSELVA · VEILEDENDE KART" />
      <div className="map-canvas">
        <div className="map-label a">Mandal / Vik</div>
        <div className="map-label b">Øyslebø</div>
        <div className="map-label c">Laudal / Bjelland</div>
        <svg className="river" viewBox="0 0 400 500">
          <path d="M330-10C250 60 320 100 215 150S270 220 164 275 195 350 83 420C40 447 50 485 20 520" />
          <path
            className="glow"
            d="M330-10C250 60 320 100 215 150S270 220 164 275 195 350 83 420C40 447 50 485 20 520"
          />
        </svg>
        {zones.map((x, i) => (
          <button
            aria-label={"Vis " + x.name}
            key={x.id}
            onClick={() => setSelected(x.id)}
            className={
              "zone-pin z" + (i + 1) + (selected === x.id ? " selected" : "")
            }
          >
            <span>{x.id}</span>
          </button>
        ))}
        <button className="locate" aria-label="Finn min posisjon" onClick={locate}>
          <Icon name="pin" />
        </button>
        <div className="map-legend">
          <span /> Hovedsone <i /> Din posisjon
        </div>
        {locationStatus&&<div className="map-location-status">{locationStatus}</div>}
      </div>
      <article className="zone-sheet">
        <div className="sheet-handle" />
        <div className="zone-title">
          <span style={{ background: z.color }}>{z.id}</span>
          <div>
            <small>{z.status.toUpperCase()}</small>
            <h2>{z.name}</h2>
          </div>
        </div>
        <p className="zone-desc">{z.desc}</p>
        <div className="zone-facts">
          <div>
            <small>SESONG 2026</small>
            <b>{z.season}</b>
          </div>
          <div>
            <small>OMFANG</small>
            <b>{z.note}</b>
          </div>
        </div>
        <p className="zone-note">
          <Icon name="book" size={19} /> Kartet er veiledende. Fysisk oppmerking
          og lokale regler gjelder alltid.
        </p>
        <button className="primary" onClick={()=>onUseZone(z.id)}>Bruk sone {z.id} i fiskeøkten</button>
      </article>
    </div>
  );
}
function Activity({
  active,
  onStart,
  onStop,
  onAddPast,
  onCatch,
  onCatchFlowComplete,
  finishAfterCatch,
  catches,
  activeZone,
  requestedCatchTime,
  onCorrectCatch,
  onShowRules,
  lastSession,
  elapsed,
  startTime,
  embedded = false,
}: {
  active: boolean;
  onStart: () => void;
  onStop: () => void;
  onAddPast: (record: SessionRecord, catchRecords?: CatchRecord[]) => void;
  onCatch: (record: CatchRecord) => void;
  onCatchFlowComplete: () => void;
  finishAfterCatch: boolean;
  catches: CatchRecord[];
  activeZone: string;
  requestedCatchTime: number;
  onCorrectCatch: (id: string, note: string) => void;
  onShowRules: () => void;
  elapsed: number;
  startTime: number | null;
  lastSession: SessionRecord | null;
  embedded?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [step, setStep] = useState(1);
  const [species, setSpecies] = useState("Laks");
  const [result, setResult] = useState("Gjenutsatt");
  const [length, setLength] = useState("");
  const [weight, setWeight] = useState("");
  const [comment, setComment] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageData, setImageData] = useState("");
  const [catchTime, setCatchTime] = useState(0);
  const [selectedCatch, setSelectedCatch] = useState<CatchRecord | null>(null);
  const [showAllHistory,setShowAllHistory]=useState(false);
  const [touched, setTouched] = useState(false);
  const [violationConfirmed, setViolationConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const reset = () => {
    setStep(1);
    setSpecies("Laks");
    setResult("Gjenutsatt");
    setLength("");
    setWeight("");
    setComment("");
    setImageName("");
    setImageData("");
    setCatchTime(0);
    setTouched(false);
    setViolationConfirmed(false);
    setSubmitted(false);
  };
  const close = () => {
    setShow(false);
    reset();
  };
  const submitCatch = () => {
    if (submitted) return;
    onCatch({
      id: "pending",
      caughtAt: catchTime || requestedCatchTime,
      submittedAt: 0,
      sessionStart: startTime || catchTime || requestedCatchTime,
      species,
      result,
      length: lengthNo,
      weight: weightNo,
      zone: activeZone,
      violation: blocked,
      late: false,
      imageName,
      imageData,
      comment,
    });
    setSubmitted(true);
    setStep(4);
  };
  const lengthNo = Number(length.replace(",", ".")),
    weightNo = Number(weight.replace(",", "."));
  const detailsValid = lengthNo > 0 && weightNo > 0;
  const regulatedSpecies = species === "Laks" || species === "Sjøørret";
  const tooSmall = result === "Avlivet" && regulatedSpecies && lengthNo < 35;
  const largeSalmon =
    result === "Avlivet" &&
    species === "Laks" &&
    lengthNo > 65 &&
    lengthNo <= 90;
  const tooLarge = result === "Avlivet" && species === "Laks" && lengthNo > 90;
  const blocked = tooSmall || tooLarge;
  const sentCatch = submitted ? catches[catches.length - 1] : null;
  const ruleTitle = tooSmall
    ? `${species} under 35 cm skulle vært gjenutsatt`
    : tooLarge
      ? "Laks over 90 cm kan ikke avlives"
      : largeSalmon
        ? "Bruker sesongens storlaks-unntak"
        : "Valgene er innenfor størrelsesreglene";
  const ruleText = tooSmall
    ? `Minstemålet for laks og sjøørret er 35 cm. Denne ${species.toLowerCase()}en er ${lengthNo} cm og skulle vært gjenutsatt. Registrer likevel det som faktisk skjedde. Rapporten merkes som et mulig regelbrudd.`
    : tooLarge
      ? `Fra 1. august kan bare én laks på opptil 90 cm avlives. Denne laksen er ${lengthNo} cm. Registrer det som faktisk skjedde; rapporten merkes som et mulig regelbrudd.`
      : largeSalmon
        ? `Fra 1. august kan én av sesongens avlivede laks være opptil 90 cm. Unntaket er tilgjengelig og blir brukt ved innsending. De fire øvrige må være under 65 cm.`
        : result === "Avlivet" && regulatedSpecies
          ? `${species} på ${lengthNo} cm er innenfor gjeldende størrelsesregel. Døgn- og sesongkvoten oppdateres ved innsending.`
          : `${species} på ${lengthNo} cm registreres som gjenutsatt og bruker ikke avlivingskvoten.`;
  return (
    <div className={embedded ? "activity-embedded" : "screen"}>
      {!embedded && <Header title="Min aktivitet" />}
      {active ? (
        <section className="active-session">
          <span className="pulse" />
          <small>AKTIV FISKEØKT</small>
          <h2>{activeZone}</h2>
          <div className="big-time">{formatDuration(elapsed)}</div>
          <p>Startet i dag kl. {formatClock(startTime)} · GPS-sone bekreftet</p>
          <div className="session-actions">
            <button onClick={() => { setCatchTime(Date.now()); setShow(true); }}>
              <Icon name="fish" />
              Registrer fangst
            </button>
            <button onClick={onShowRules}>
              <Icon name="map" />
              Sone og regler
            </button>
          </div>
          <button className="outline-danger" onClick={onStop}>
            Stopp · bekreft fangst eller nullfangst
          </button>
        </section>
      ) : (
        <section className="empty">
          <span>
            <Icon name="clock" size={35} />
          </span>
          <h2>Ingen aktiv fiskeøkt</h2>
          <p>
            Start registrerer fisketid og sone. Ved stopp bekrefter du fangst
            eller nullfangst.
          </p>
          <button className="primary" onClick={onStart}>
            Kontroller status og start
          </button>
        </section>
      )}
      <button className="past-session-button" onClick={() => setShowPast(true)}>
        <Icon name="clock" />
        <span>
          <b>Registrer tidligere fisketur</b>
          <small>For turer og fangster du glemte å registrere</small>
        </span>
        <Icon name="chevron" size={18} />
      </button>
      {catches.length > 0 && (
        <section>
          <div className="section-head"><h3>Siste fangster</h3></div>
          {catches.slice().reverse().map((item) => (
            <button className="catch-history-card" key={item.id} onClick={() => setSelectedCatch(item)}>
              <span><Icon name="fish" /></span>
              <p><b>{item.species} · {item.result.toLowerCase()}</b><small>{item.zone} · {item.length} cm · {item.weight} kg</small><em>{formatClock(item.caughtAt)} · {item.late ? "forsinket rapport" : "rapportert innen fristen"}{item.correction ? " · rettelse meldt" : ""}</em></p>
              {item.violation ? <i className="catch-violation">!</i> : <Icon name="check" size={17} />}
            </button>
          ))}
        </section>
      )}
      <section>
        <div className="section-head">
          <h3>Siste fiskeøkter</h3>
          <button onClick={()=>setShowAllHistory(!showAllHistory)}>{showAllHistory?"Vis færre":"Se alle"}</button>
        </div>
        {lastSession && (
          <History
            day={String(new Date(lastSession.end).getDate()).padStart(2, "0")}
            title={lastSession.zone}
            time={`${formatClock(lastSession.start)}–${formatClock(lastSession.end)} · ${formatLongDuration(lastSession.duration)}`}
            result={lastSession.result}
          />
        )}
        <History
          day="16"
          title="Sone 2 · Fuskeland B"
          time="18:10–21:42 · 3 t 32 min"
          result="1 laks · gjenutsatt"
        />
        {showAllHistory&&<><History day="08" title="Sone 1 · Mandal–Krossen" time="19:20–20:55 · 1 t 35 min" result="1 sjøørret · gjenutsatt"/><History day="03" title="Sone 4 · Laudal–Kavfossen" time="06:40–09:05 · 2 t 25 min" result="Nullfangst rapportert"/></>}
        <History
          day="12"
          title="Sone 3 · Øyslebø–Laudal"
          time="07:15–10:03 · 2 t 48 min"
          result="Nullfangst rapportert"
        />
      </section>
      {(show || finishAfterCatch) && (
        <div className="modal-bg" onClick={finishAfterCatch ? undefined : close}>
          <div className="catch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="steps four">
              <span className={step >= 1 ? "on" : ""}>1</span>
              <i />
              <span className={step >= 2 ? "on" : ""}>2</span>
              <i />
              <span className={step >= 3 ? "on" : ""}>3</span>
              <i />
              <span className={step >= 4 ? "on" : ""}>4</span>
            </div>
            {step === 1 && (
              <>
                <small>STEG 1 AV 4 · FANGST</small>
                <h2>Hva fikk du?</h2>
                <label>Art</label>
                <div className="choice">
                  {["Laks", "Sjøørret", "Annen art"].map((x) => (
                    <button
                      key={x}
                      className={species === x ? "selected" : ""}
                      onClick={() => setSpecies(x)}
                    >
                      {x}
                    </button>
                  ))}
                </div>
                <label>Resultat</label>
                <div className="choice two">
                  {["Gjenutsatt", "Avlivet"].map((x) => (
                    <button
                      key={x}
                      className={result === x ? "selected" : ""}
                      onClick={() => setResult(x)}
                    >
                      {x}
                    </button>
                  ))}
                </div>
                <div className="selection-recap">
                  <Icon name="check" size={17} />
                  <span>
                    Valgt:{" "}
                    <b>
                      {species.toLowerCase()} · {result.toLowerCase()}
                    </b>
                  </span>
                </div>
                <button className="primary" onClick={() => setStep(2)}>
                  Neste · størrelse
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <small>STEG 2 AV 4 · DETALJER</small>
                <h2>Størrelse og dokumentasjon</h2>
                <div className="input-row">
                  <label>
                    Lengde <em>påkrevd</em>
                    <input
                      inputMode="decimal"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder="cm"
                      className={touched && !lengthNo ? "invalid" : ""}
                    />
                  </label>
                  <label>
                    Vekt <em>påkrevd</em>
                    <input
                      inputMode="decimal"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="kg"
                      className={touched && !weightNo ? "invalid" : ""}
                    />
                  </label>
                </div>
                {touched && !detailsValid && (
                  <p className="field-error">
                    Fyll inn både lengde og vekt med tall større enn 0.
                  </p>
                )}
                <label className="upload-box">
                  <Icon name="fish" />
                  <span>
                    <b>{imageName || "Legg til bilde"}</b>
                    <small>Valgfritt · bilde av fangsten</small>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setImageName(file?.name || "");
                      if (!file) return setImageData("");
                      const reader = new FileReader();
                      reader.onload = () => setImageData(String(reader.result || ""));
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                <label className="comment-label">
                  Kommentar <em>valgfritt</em>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={300}
                    placeholder="For eksempel observasjoner om fisken eller fangststedet"
                  />
                  <small>{comment.length}/300</small>
                </label>
                <button
                  className="primary"
                  onClick={() => {
                    setTouched(true);
                    if (detailsValid) setStep(3);
                  }}
                >
                  Neste · regelkontroll
                </button>
              </>
            )}
            {step === 3 && (
              <>
                <small>STEG 3 AV 4 · REGELKONTROLL</small>
                <h2>
                  {blocked
                    ? "Avlivingen bryter størrelsesreglene"
                    : "Rapporten er kontrollert"}
                </h2>
                <div
                  className={
                    "rule-result " +
                    (blocked ? "blocked" : largeSalmon ? "warning" : "approved")
                  }
                >
                  <span>{blocked ? "!" : <Icon name="check" />}</span>
                  <div>
                    <b>{ruleTitle}</b>
                    <p>{ruleText}</p>
                  </div>
                </div>
                <div className="applied-rules">
                  <b>Størrelsesregler som er kontrollert</b>
                  <p>
                    <span>Minstemål</span>
                    <strong>Laks og sjøørret: 35 cm</strong>
                  </p>
                  <p>
                    <span>Fra 1. august</span>
                    <strong>Én laks opptil 90 cm</strong>
                  </p>
                  <p>
                    <span>Øvrige avlivede laks</span>
                    <strong>Under 65 cm</strong>
                  </p>
                  <small>
                    Minstemålet er 35 cm. Regelversjon 01.08.2026 er brukt.
                  </small>
                </div>
                <div className="report-summary">
                  <p>
                    <b>
                      {species} · {result.toLowerCase()}
                    </b>
                    <small>
                      {lengthNo} cm · {weightNo} kg
                    </small>
                  </p>
                  <p>
                    <b>{activeZone}</b>
                    <small>Fangsttid {formatClock(catchTime || requestedCatchTime)} · økt og sone er lagt til automatisk</small>
                  </p>
                  {imageName && (
                    <p>
                      <b>Bilde vedlagt</b>
                      <small>{imageName}</small>
                    </p>
                  )}
                  {comment && (
                    <p>
                      <b>Kommentar</b>
                      <small>{comment}</small>
                    </p>
                  )}
                </div>
                {blocked ? (
                  <>
                    <label className="violation-confirm">
                      <input
                        type="checkbox"
                        checked={violationConfirmed}
                        onChange={(e) =>
                          setViolationConfirmed(e.target.checked)
                        }
                      />
                      <span>
                        <b>Jeg forstår at avlivingen ikke var tillatt</b>
                        <small>
                          Opplysningene over er riktige, og rapporten skal vise
                          det som faktisk skjedde.
                        </small>
                      </span>
                    </label>
                    <button
                      className="primary danger-submit"
                      disabled={!violationConfirmed}
                      onClick={submitCatch}
                    >
                      Send inn faktisk fangst
                    </button>
                  </>
                ) : (
                  <button className="primary" onClick={submitCatch}>
                    Send fangstrapport
                  </button>
                )}
                <button className="secondary" onClick={() => setStep(2)}>
                  Tilbake og endre
                </button>
              </>
            )}
            {step === 4 && (
              <>
                <div className="sent-icon">
                  <Icon name="check" size={32} />
                </div>
                <small>STEG 4 AV 4 · SENDT</small>
                <h2>Fangstrapporten er sendt</h2>
                <p className="sent-lead">{sentCatch?.late ? `Rapporten ble sendt ${formatLongDuration(Math.floor((sentCatch.submittedAt-sentCatch.caughtAt)/1000))} etter fangsten og er merket som forsinket.` : `Rapporten ble sendt ${sentCatch ? formatLongDuration(Math.max(0,Math.floor((sentCatch.submittedAt-sentCatch.caughtAt)/1000))) : "kort tid"} etter fangsten og innen fristen på 2 timer.`}</p>
                {sentCatch?.late && <div className="violation-sent late"><b>Forsinket fangstrapport</b><p>Det faktiske fangsttidspunktet er beholdt, og innsendingstidspunktet er registrert separat.</p></div>}
                {blocked && (
                  <div className="violation-sent">
                    <b>Rapportert regelavvik</b>
                    <p>
                      Fangsten er registrert som avlivet. Rapporten er merket
                      for mulig oppfølging fordi størrelsen er utenfor tillatt
                      grense.
                    </p>
                  </div>
                )}
                <div className="quota-update">
                  <h3>Oppdatert kvotestatus</h3>
                  <div>
                    <span>Døgnkvote</span>
                    <b>
                      {result === "Avlivet"
                        ? "0 av 1 gjenstår"
                        : "1 av 1 gjenstår"}
                    </b>
                  </div>
                  <div>
                    <span>Sesongkvote laks</span>
                    <b>
                      {`${Math.max(0, 4 - catches.filter((item) => item.species === "Laks" && item.result === "Avlivet").length)} av 5 gjenstår`}
                    </b>
                  </div>
                </div>
                {largeSalmon && (
                  <div className="large-salmon-used">
                    <b>Storlaks-unntaket er brukt</b>
                    <span>0 av 1 gjenstår</span>
                  </div>
                )}
                <div className="report-id">
                  <small>RAPPORT-ID</small>
                  <b>{sentCatch?.id || "Oppretter rapport-ID"}</b>
                </div>
                <button className="primary" onClick={() => { close(); if (finishAfterCatch) onCatchFlowComplete(); }}>
                  {finishAfterCatch ? "Se sammendrag for økten" : "Ferdig"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {showPast && (
        <PastSessionFormV2
          onClose={() => setShowPast(false)}
          existingCatches={catches}
          onSave={(record, catchRecords) => {
            onAddPast(record, catchRecords);
          }}
        />
      )}
      {selectedCatch && <CatchReportDetail report={selectedCatch} onClose={() => setSelectedCatch(null)} onCorrect={(note) => { onCorrectCatch(selectedCatch.id, note); setSelectedCatch({...selectedCatch, correction: note}); }} />}
    </div>
  );
}
function CatchReportDetail({report,onClose,onCorrect}:{report:CatchRecord;onClose:()=>void;onCorrect:(note:string)=>void}){const[note,setNote]=useState(report.correction||""),[editing,setEditing]=useState(false);return <div className="modal-bg" onClick={onClose}><div className="catch-modal report-detail-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button><small>INNSENDT FANGSTRAPPORT</small><h2>{report.species} · {report.result.toLowerCase()}</h2><div className={"report-status-banner "+(report.late?"late":"ok")}><Icon name={report.late?"clock":"check"}/><div><b>{report.late?"Rapportert etter fristen":"Rapportert innen fristen"}</b><span>Fangst {formatClock(report.caughtAt)} · sendt {formatClock(report.submittedAt)}</span></div></div>{report.imageData&&<img className="catch-report-image" src={report.imageData} alt="Vedlagt bilde av fangsten"/>}<div className="past-review"><p><small>RAPPORT-ID</small><b>{report.id}</b></p><p><small>ØKT OG SONE</small><b>{report.zone} · startet {formatClock(report.sessionStart)}</b></p><p><small>STØRRELSE</small><b>{report.length} cm · {report.weight} kg</b></p><p><small>RESULTAT</small><b>{report.result}</b></p><p><small>BILDE</small><b>{report.imageName||"Ikke vedlagt"}</b></p>{report.comment&&<p><small>KOMMENTAR</small><b>{report.comment}</b></p>}</div>{report.violation&&<div className="violation-sent"><b>Rapportert regelavvik</b><p>Fangsten er lagret slik den faktisk ble oppgitt, med tydelig merking for mulig oppfølging.</p></div>}{report.correction&&!editing&&<div className="correction-sent"><b>Rettelse er meldt</b><p>{report.correction}</p></div>}{editing?<><label className="correction-field">Hva er feil i rapporten?<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Beskriv hva som skal korrigeres"/></label><button className="primary" disabled={note.trim().length<5} onClick={()=>{onCorrect(note.trim());setEditing(false)}}>Send rettelsesmelding</button><button className="secondary" onClick={()=>setEditing(false)}>Avbryt</button></>:<button className="secondary" onClick={()=>setEditing(true)}>{report.correction?"Oppdater rettelsesmelding":"Meld feil i rapporten"}</button>}</div></div>}
function PastSessionFormV2({onClose,onSave,existingCatches}:{onClose:()=>void;onSave:(record:SessionRecord,catches?:CatchRecord[])=>void;existingCatches:CatchRecord[]}) {
  const [openedAt]=useState(()=>Date.now()),today=new Date(openedAt).toISOString().slice(0,10);
  const [step,setStep]=useState(1),[date,setDate]=useState(today),[from,setFrom]=useState("17:00"),[to,setTo]=useState("19:00"),[zone,setZone]=useState(3),[subzone,setSubzone]=useState(""),[caught,setCaught]=useState(false),[catchAt,setCatchAt]=useState("18:00"),[species,setSpecies]=useState("Laks"),[outcome,setOutcome]=useState("Gjenutsatt"),[length,setLength]=useState(""),[weight,setWeight]=useState(""),[comment,setComment]=useState(""),[imageName,setImageName]=useState(""),[imageData,setImageData]=useState(""),[reports,setReports]=useState<CatchRecord[]>([]),[touched,setTouched]=useState(false);
  const start=new Date(`${date}T${from}`).getTime(),end=new Date(`${date}T${to}`).getTime(),caughtAt=new Date(`${date}T${catchAt}`).getTime(),validTime=Boolean(date&&from&&to&&end>start&&end<=openedAt),validCatchTime=caughtAt>=start&&caughtAt<=end,lengthNo=Number(length.replace(",",".")),weightNo=Number(weight.replace(",",".")),zoneBase=zones.find(z=>z.id===zone)?.name||`Sone ${zone}`,zoneName=subzone?`${zoneBase} · ${subzone}`:zoneBase,seasonEnd=zone===4?"2026-09-15":"2026-08-31",withinSeason=date>="2026-06-01"&&date<=seasonEnd,permitValid=withinSeason,closedHistorically=false,killedBefore=existingCatches.filter(x=>x.species==="Laks"&&x.result==="Avlivet").length,killedHere=reports.filter(x=>x.species==="Laks"&&x.result==="Avlivet").length,quotaAvailable=killedBefore+killedHere<4,dailyValid=reports.filter(x=>x.species==="Laks"&&x.result==="Avlivet").length<=1,catchValid=lengthNo>0&&weightNo>0&&validCatchTime;
  const resetCatch=()=>{setSpecies("Laks");setOutcome("Gjenutsatt");setLength("");setWeight("");setComment("");setImageName("");setImageData("");setCatchAt(to)};
  const addCatch=(review:boolean)=>{setTouched(true);if(!catchValid)return;const violation=(outcome==="Avlivet"&&(species==="Laks"||species==="Sjøørret")&&lengthNo<35)||(outcome==="Avlivet"&&species==="Laks"&&lengthNo>90);const record:CatchRecord={id:`ME-ETTER-${openedAt}-${reports.length+1}`,caughtAt,submittedAt:openedAt,sessionStart:start,species,result:outcome,length:lengthNo,weight:weightNo,zone:zoneName,violation,late:true,imageName,imageData,comment};setReports(current=>[...current,record]);resetCatch();setTouched(false);setStep(review?3:2)};
  const submit=()=>{const result=reports.length?`${reports.length} fangst${reports.length===1?"":"er"} · etterregistrert`:"Nullfangst · etterregistrert";onSave({start,end,duration:Math.floor((end-start)/1000),zone:zoneName,result},reports);setStep(4)};
  const subzones=zone===2?["Fuskeland B","Hauge","Holmesland","Nøding","Bringsdal"]:zone===4?["Bjåhylen","Nodehylen","Kosåna","Manflå"]:[];
  return <div className="modal-bg" onClick={step===4?onClose:undefined}><div className="catch-modal past-session-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button><div className="steps four"><span className={step>=1?"on":""}>1</span><i/><span className={step>=2?"on":""}>2</span><i/><span className={step>=3?"on":""}>3</span><i/><span className={step>=4?"on":""}>4</span></div>
  {step===1&&<><small>ETTERREGISTRERING · TUR</small><h2>Når og hvor fisket du?</h2><p className="past-intro">Registrer det faktiske tidspunktet og området så nøyaktig du kan.</p><label>Dato <em>påkrevd</em><input type="date" max={today} value={date} onChange={e=>setDate(e.target.value)}/></label><div className="input-row"><label>Starttid <em>påkrevd</em><input type="time" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>Sluttid <em>påkrevd</em><input type="time" value={to} onChange={e=>{setTo(e.target.value);setCatchAt(e.target.value)}}/></label></div><label>Hovedsone <em>påkrevd</em><select value={zone} onChange={e=>{setZone(Number(e.target.value));setSubzone("")}}>{zones.map(z=><option value={z.id} key={z.id}>{z.name}</option>)}</select></label>{subzones.length>0&&<label>Delsone <em>påkrevd</em><select value={subzone} onChange={e=>setSubzone(e.target.value)}><option value="">Velg delsone</option>{subzones.map(x=><option key={x}>{x}</option>)}</select></label>}<label>Fikk du fangst?</label><div className="choice two"><button className={!caught?"selected":""} onClick={()=>setCaught(false)}>Nei · nullfangst</button><button className={caught?"selected":""} onClick={()=>setCaught(true)}>Ja · legg til fangst</button></div>{touched&&(!validTime||(subzones.length>0&&!subzone))&&<p className="field-error">Kontroller dato, tider og eventuell delsone.</p>}<button className="primary" onClick={()=>{setTouched(true);if(validTime&&(!subzones.length||subzone))setStep(caught?2:3)}}>{caught?"Neste · registrer fangst":"Neste · regelkontroll"}</button></>}
  {step===2&&<><small>ETTERREGISTRERING · FANGST {reports.length+1}</small><h2>Registrer fangsten</h2>{reports.length>0&&<div className="added-catches"><b>{reports.length} fangst{reports.length===1?"":"er"} lagt til</b>{reports.map(x=><span key={x.id}>{x.species} · {x.result.toLowerCase()} · {formatClock(x.caughtAt)}</span>)}</div>}<label>Faktisk fangsttid <em>påkrevd</em><input type="time" value={catchAt} onChange={e=>setCatchAt(e.target.value)}/></label><label>Art</label><div className="choice">{["Laks","Sjøørret","Annen art"].map(x=><button key={x} className={species===x?"selected":""} onClick={()=>setSpecies(x)}>{x}</button>)}</div><label>Resultat</label><div className="choice two">{["Gjenutsatt","Avlivet"].map(x=><button key={x} className={outcome===x?"selected":""} onClick={()=>setOutcome(x)}>{x}</button>)}</div><div className="input-row"><label>Lengde <em>påkrevd</em><input inputMode="decimal" value={length} onChange={e=>setLength(e.target.value)} placeholder="cm"/></label><label>Vekt <em>påkrevd</em><input inputMode="decimal" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="kg"/></label></div><label className="feedback-upload"><Icon name="fish"/><span><b>{imageName||"Legg til bilde"}</b><small>Valgfritt · lagres med fangstrapporten</small></span><input type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0];setImageName(file?.name||"");if(!file)return setImageData("");const reader=new FileReader();reader.onload=()=>setImageData(String(reader.result||""));reader.readAsDataURL(file)}}/></label><label>Kommentar <em>valgfritt</em><textarea value={comment} onChange={e=>setComment(e.target.value)} maxLength={300} placeholder="Observasjoner om fisken eller fangststedet"/></label>{touched&&!catchValid&&<p className="field-error">Fangsttid må være innenfor turen. Lengde og vekt må fylles ut.</p>}<button className="primary" onClick={()=>addCatch(true)}>Legg til og kontroller turen</button><button className="secondary" onClick={()=>addCatch(false)}>Lagre og legg til en fangst til</button></>}
  {step===3&&<><small>HISTORISK REGELKONTROLL</small><h2>Kontroller turen før innsending</h2><div className="flow-checks"><CheckRow title="Fiskekort på valgt dato" sub={permitValid?`Døgnkort funnet for ${zoneName}`:"Finner ikke gyldig fiskekort i kortarkivet"} state={permitValid?"ok":"error"}/><CheckRow title="Fiskesesong" sub={withinSeason?`Datoen er innenfor sesongen i ${zoneBase}`:`Valgt dato er utenfor sesongen 1. juni–${zone===4?"15. september":"31. august"}`} state={withinSeason?"ok":"error"}/><CheckRow title="Historisk stengning" sub={closedHistorically?"Sonen var registrert som stengt":"Ingen stengning registrert på valgt tidspunkt"} state={closedHistorically?"error":"ok"}/><CheckRow title="Sesongkvote" sub={quotaAvailable?`${Math.max(0,4-killedBefore-killedHere)} av 5 avlivet gjenstår etter rapporten`:"Sesongkvoten kan være nådd"} state={quotaAvailable?"ok":"warning"}/><CheckRow title="Døgnkvote" sub={dailyValid?"Maks én avlivet laks denne turen":"Flere enn én avlivet laks er registrert"} state={dailyValid?"ok":"error"}/><CheckRow title="Rapporteringsfrist" sub={`Etterregistreres omtrent ${formatLongDuration(Math.max(0,Math.floor((openedAt-end)/1000)))} etter turen`} state="warning"/></div>{reports.length>0?<div className="added-catches review">{reports.map((x,i)=><button key={x.id} onClick={()=>{setReports(reports.filter(r=>r.id!==x.id));setStep(2)}}><b>Fangst {i+1}: {x.species} · {x.result.toLowerCase()}</b><span>{formatClock(x.caughtAt)} · {x.length} cm · {x.weight} kg</span><em>Fjern og registrer på nytt</em></button>)}</div>:<div className="selection-recap"><Icon name="check" size={17}/><span>Nullfangst registreres for turen</span></div>}<div className="late-report-note"><Icon name="clock" size={18}/><p><b>Rapporten blir merket som etterregistrert</b><span>Faktisk tur- og fangsttid beholdes. Innsendingstid registreres separat.</span></p></div><button className="primary" onClick={submit}>Send inn tur og {reports.length} fangst{reports.length===1?"":"er"}</button>{caught&&<button className="secondary" onClick={()=>setStep(2)}>Legg til en fangst til</button>}<button className="text-button" onClick={()=>setStep(1)}>Tilbake til turen</button></>}
  {step===4&&<><div className="sent-icon"><Icon name="check" size={32}/></div><small>ETTERREGISTRERINGEN ER SENDT</small><h2>Tur og fangster er registrert</h2><p className="sent-lead">Den tidligere fisketuren er lagt til i historikken. Alle fangster er merket som etterregistrert.</p><div className="report-id"><small>ØKT</small><b>{new Intl.DateTimeFormat("nb-NO",{day:"2-digit",month:"long"}).format(new Date(start))} · {from}–{to}</b></div>{reports.map((x,i)=><div className="report-id" key={x.id}><small>RAPPORT-ID · FANGST {i+1}</small><b>{x.id}</b></div>)}<button className="primary" onClick={onClose}>Åpne historikken</button></>}
  </div></div>
}
// Kept temporarily as a comparison fixture while the richer prototype flow is tested.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PastSessionForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (record: SessionRecord, catchRecord?: CatchRecord) => void;
}) {
  const [now] = useState(() => Date.now());
  const today = new Date(now).toISOString().slice(0, 10);
  const [step, setStep] = useState(1),
    [date, setDate] = useState(today),
    [from, setFrom] = useState("17:00"),
    [to, setTo] = useState("19:00"),
    [zone, setZone] = useState(3),
    [caught, setCaught] = useState(false),
    [species, setSpecies] = useState("Laks"),
    [outcome, setOutcome] = useState("Gjenutsatt"),
    [length, setLength] = useState(""),
    [weight, setWeight] = useState(""),
    [touched, setTouched] = useState(false);
  const start = new Date(`${date}T${from}`).getTime(),
    end = new Date(`${date}T${to}`).getTime(),
    validTime = Boolean(date && from && to && end > start && end <= now),
    lengthNo = Number(length.replace(",", ".")),
    weightNo = Number(weight.replace(",", ".")),
    validCatch = !caught || (lengthNo > 0 && weightNo > 0),
    zoneName = zones.find((z) => z.id === zone)?.name || `Sone ${zone}`,
    tooSmall =
      caught &&
      outcome === "Avlivet" &&
      (species === "Laks" || species === "Sjøørret") &&
      lengthNo < 35;
  const next = () => {
    setTouched(true);
    if (step === 1 && validTime) setStep(caught ? 2 : 3);
    if (step === 2 && validCatch) setStep(3);
  };
  const submit = () => {
    const sessionRecord: SessionRecord = {
      start,
      end,
      duration: Math.floor((end - start) / 1000),
      zone: zoneName,
      result: caught
        ? `1 ${species.toLowerCase()} · ${outcome.toLowerCase()} · etterregistrert`
        : "Nullfangst · etterregistrert",
    };
    const catchRecord: CatchRecord | undefined = caught ? { id: "pending", caughtAt: end, submittedAt: 0, sessionStart: start, species, result: outcome, length: lengthNo, weight: weightNo, zone: zoneName, violation: tooSmall, late: true } : undefined;
    onSave(sessionRecord, catchRecord);
  };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div
        className="catch-modal past-session-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div className="steps">
          <span className={step >= 1 ? "on" : ""}>1</span>
          <i />
          <span className={step >= 2 ? "on" : ""}>2</span>
          <i />
          <span className={step >= 3 ? "on" : ""}>3</span>
        </div>
        {step === 1 && (
          <>
            <small>ETTERREGISTRERING · TUR</small>
            <h2>Når og hvor fisket du?</h2>
            <p className="past-intro">
              Bruk dette når du glemte å starte økten. Registrer det faktiske
              tidspunktet så nøyaktig du kan.
            </p>
            <label>
              Dato <em>påkrevd</em>
              <input
                type="date"
                max={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <div className="input-row">
              <label>
                Starttid <em>påkrevd</em>
                <input
                  type="time"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </label>
              <label>
                Sluttid <em>påkrevd</em>
                <input
                  type="time"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </label>
            </div>
            <label>
              Sone <em>påkrevd</em>
              <select
                value={zone}
                onChange={(e) => setZone(Number(e.target.value))}
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </label>
            <label>Fikk du fangst?</label>
            <div className="choice two">
              <button
                className={!caught ? "selected" : ""}
                onClick={() => setCaught(false)}
              >
                Nei · nullfangst
              </button>
              <button
                className={caught ? "selected" : ""}
                onClick={() => setCaught(true)}
              >
                Ja · legg til fangst
              </button>
            </div>
            {touched && !validTime && (
              <p className="field-error">
                Velg et tidligere tidspunkt. Sluttiden må være etter starttiden.
              </p>
            )}
            <button className="primary" onClick={next}>
              {caught ? "Neste · registrer fangst" : "Neste · kontroller turen"}
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <small>ETTERREGISTRERING · FANGST</small>
            <h2>Hva fikk du på turen?</h2>
            <label>Art</label>
            <div className="choice">
              {["Laks", "Sjøørret", "Annen art"].map((x) => (
                <button
                  key={x}
                  className={species === x ? "selected" : ""}
                  onClick={() => setSpecies(x)}
                >
                  {x}
                </button>
              ))}
            </div>
            <label>Resultat</label>
            <div className="choice two">
              {["Gjenutsatt", "Avlivet"].map((x) => (
                <button
                  key={x}
                  className={outcome === x ? "selected" : ""}
                  onClick={() => setOutcome(x)}
                >
                  {x}
                </button>
              ))}
            </div>
            <div className="input-row">
              <label>
                Lengde <em>påkrevd</em>
                <input
                  inputMode="decimal"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="cm"
                />
              </label>
              <label>
                Vekt <em>påkrevd</em>
                <input
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="kg"
                />
              </label>
            </div>
            {touched && !validCatch && (
              <p className="field-error">Fyll inn både lengde og vekt.</p>
            )}
            <button className="primary" onClick={next}>
              Neste · kontroller
            </button>
            <button className="secondary" onClick={() => setStep(1)}>
              Tilbake
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <small>KONTROLLER ETTERREGISTRERINGEN</small>
            <h2>{caught ? "Tur og fangst er klare" : "Turen er klar"}</h2>
            <div className="past-review">
              <p>
                <small>TID</small>
                <b>
                  {new Intl.DateTimeFormat("nb-NO", {
                    day: "2-digit",
                    month: "long",
                  }).format(new Date(start))}{" "}
                  · {from}–{to}
                </b>
              </p>
              <p>
                <small>SONE</small>
                <b>{zoneName}</b>
              </p>
              <p>
                <small>VARIGHET</small>
                <b>
                  {validTime
                    ? formatLongDuration(Math.floor((end - start) / 1000))
                    : ""}
                </b>
              </p>
              <p>
                <small>FANGST</small>
                <b>
                  {caught
                    ? `${species} · ${outcome.toLowerCase()} · ${lengthNo} cm · ${weightNo} kg`
                    : "Nullfangst"}
                </b>
              </p>
            </div>
            {tooSmall && (
              <div className="rule-result blocked">
                <span>!</span>
                <div>
                  <b>Avlivingen var ikke tillatt</b>
                  <p>
                    Minstemålet for laks og sjøørret er 35 cm. Rapporten kan
                    fortsatt sendes fordi den skal vise det som faktisk skjedde.
                  </p>
                </div>
              </div>
            )}
            <div className="late-report-note">
              <Icon name="clock" size={18} />
              <p>
                <b>Rapporten registreres som etterregistrert</b>
                <span>
                  Rapporten sendes omtrent {formatLongDuration(Math.max(0, Math.floor((now - end) / 1000)))} etter turen. Det opprinnelige tidspunktet beholdes, og rapporten merkes som forsinket.
                </span>
              </p>
            </div>
            <button className="primary" onClick={submit}>
              Send inn tur{caught ? " og fangst" : ""}
            </button>
            <button
              className="secondary"
              onClick={() => setStep(caught ? 2 : 1)}
            >
              Tilbake og endre
            </button>
          </>
        )}
      </div>
    </div>
  );
}
function History({
  day,
  title,
  time,
  result,
}: {
  day: string;
  title: string;
  time: string;
  result: string;
}) {
  return (
    <div className="history-card">
      <div className="date-box">
        <b>{day}</b>
        <small>JUN</small>
      </div>
      <div>
        <b>{title}</b>
        <small>{time}</small>
        <span>{result}</span>
      </div>
      <Icon name="chevron" />
    </div>
  );
}
function StatsContent() {
  const [area,setArea]=useState("Hele elva"),[period,setPeriod]=useState("Sesongen");
  return (
    <>
      <div className="filter-row">
        <button onClick={()=>setArea(area==="Hele elva"?"Sone 3":area==="Sone 3"?"Sone 4":"Hele elva")}>{area}⌄</button>
        <button onClick={()=>setPeriod(period==="Sesongen"?"Siste 30 dager":period==="Siste 30 dager"?"Denne uken":"Sesongen")}>{period}⌄</button>
      </div>
      <section className="hero-stat">
        <small>REGISTRERTE FANGSTER · EKSEMPEL</small>
        <strong>286</strong>
        <div>
          <span>Fangst + innsats</span> gir bedre forvaltningsdata
        </div>
      </section>
      <div className="stat-grid">
        <Stat icon="clock" label="FISKETIMER" value="4 820" />
        <Stat icon="stats" label="FANGST / 10 T" value="0,59" />
        <Stat icon="fish" label="GJENUTSATT" value="64 %" />
        <Stat icon="user" label="FISKEØKTER" value="418" />
      </div>
      <section className="chart-card">
        <h3>Fangst gjennom sesongen</h3>
        <div className="bar-chart">
          {[18, 32, 46, 66, 87, 74, 54, 41, 25].map((h, i) => (
            <div key={i}>
              <span style={{ height: h + "%" }} />
              <small>{i % 2 === 0 ? "U" + (23 + i) : ""}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="chart-card">
        <h3>Fangst per hovedsone</h3>
        {zones.map((z, i) => (
          <div className="zone-bar" key={z.id}>
            <span>Sone {z.id}</span>
            <div>
              <i style={{ width: [72, 91, 84, 58][i] + "%" }} />
            </div>
            <b>{[58, 79, 73, 46][i]}</b>
          </div>
        ))}
      </section>
      <p className="privacy-note">
        Tallene demonstrerer ønsket funksjon. De er ikke offisielle 2026-tall.
        Statistikk skal aggregeres uten å vise enkeltfiskeres posisjon.
      </p>
    </>
  );
}
function Stats({
  active,
  onStart,
  onStop,
  onAddPast,
  onCatch,
  onCatchFlowComplete,
  finishAfterCatch,
  catches,
  activeZone,
  requestedCatchTime,
  onCorrectCatch,
  onShowRules,
  openMine,
  elapsed,
  startTime,
  lastSession,
}: {
  active: boolean;
  onStart: () => void;
  onStop: () => void;
  onAddPast: (record: SessionRecord, catchRecords?: CatchRecord[]) => void;
  onCatch: (record: CatchRecord) => void;
  onCatchFlowComplete: () => void;
  finishAfterCatch: boolean;
  catches: CatchRecord[];
  activeZone: string;
  requestedCatchTime: number;
  onCorrectCatch: (id: string, note: string) => void;
  onShowRules: () => void;
  openMine: boolean;
  elapsed: number;
  startTime: number | null;
  lastSession: SessionRecord | null;
}) {
  const [view, setView] = useState<"general" | "mine">(
    active || openMine ? "mine" : "general",
  );
  return (
    <div className="screen">
      <Header title="Statistikk" eyebrow="FANGST, INNSATS OG HISTORIKK" />
      <div className="stats-tabs">
        <button
          className={view === "general" ? "selected" : ""}
          onClick={() => setView("general")}
        >
          Generell statistikk
        </button>
        <button
          className={view === "mine" ? "selected" : ""}
          onClick={() => setView("mine")}
        >
          Min fangst og fiskehistorikk
        </button>
      </div>
      {view === "general" ? (
        <StatsContent />
      ) : (
        <Activity
          embedded
          active={active}
          onStart={onStart}
          onStop={onStop}
          onAddPast={onAddPast}
          onCatch={onCatch}
          onCatchFlowComplete={onCatchFlowComplete}
          finishAfterCatch={finishAfterCatch}
          catches={catches}
          activeZone={activeZone}
          requestedCatchTime={requestedCatchTime}
          onCorrectCatch={onCorrectCatch}
          onShowRules={onShowRules}
          elapsed={elapsed}
          startTime={startTime}
          lastSession={lastSession}
        />
      )}
    </div>
  );
}
function Stat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <article>
      <Icon name={icon} />
      <small>{label}</small>
      <b>{value}</b>
    </article>
  );
}
function More() {
  const [detail, setDetail] = useState("");
  const items = [
    ["ticket", "Mine fiskekort", "Aktive, kommende og tidligere kort"],
    ["shield", "Desinfisering", "Gyldighet og registreringssted"],
    ["bell", "Varsler og stengninger", "Regelendringer, temperatur og frister"],
    ["map", "Favorittsoner", "Rask tilgang til soner og delsoner"],
    ["user", "Profil og personvern", "Språk, samtykker og konto"],
  ];
  return (
    <div className="screen">
      <Header title="Mer" />
      <button className="profile-card" onClick={()=>setDetail("Profil og personvern")}>
        <div className="avatar">MF</div>
        <div>
          <h2>Fiskerprofil</h2>
          <p>Fisker-ID · 10482</p>
        </div>
        <Icon name="chevron" />
      </button>
      <div className="menu-list">
        {items.map(([icon, title, sub]) => (
          <button key={title} onClick={() => setDetail(title)}>
            <span>
              <Icon name={icon} />
            </span>
            <p>
              <b>{title}</b>
              <small>{sub}</small>
            </p>
            <Icon name="chevron" size={18} />
          </button>
        ))}
      </div>
      <section className="feedback">
        <small>TILBAKEMELDING OG OBSERVASJON</small>
        <h3>Meld fra til elveeigarlaget</h3>
        <p>
          Velg kategori, legg ved bilde og valgfri posisjon, og følg status på
          meldingen.
        </p>
        <button onClick={() => setDetail("Tilbakemelding")}>
          Opprett melding
        </button>
      </section>
      <p className="version">
        Easyfisk prototype · innhold kontrollert 19.08.2026
      </p>
      {detail && <Detail title={detail} close={() => setDetail("")} />}
    </div>
  );
}
function RuleCenter() {
  const [open, setOpen] = useState("seasonquota");
  return (
    <div className="rule-center">
      <div className="rule-version">
        <span>
          <Icon name="check" size={18} />
        </span>
        <div>
          <small>AKTIV REGELVERSJON</small>
          <b>Mandalselva 2026 · oppdatert 1. august</b>
          <p>Kilder kontrollert 19. august 2026</p>
        </div>
      </div>
      <div className="season-alert">
        <Icon name="bell" size={18} />
        <div>
          <b>Midtsesongevalueringen er innarbeidet</b>
          <p>
            Sone 4 er forlenget til 15. september, med unntak for Bjåhylen og
            Nodehylen som stenger 31. august.
          </p>
        </div>
      </div>
      {ruleSections.map((section) => (
        <article className={open === section.id ? "open" : ""} key={section.id}>
          <button
            onClick={() => setOpen(open === section.id ? "" : section.id)}
          >
            <span>
              <Icon name={section.icon} />
            </span>
            <div>
              <b>{section.title}</b>
              <small>{section.summary}</small>
            </div>
            <i>{open === section.id ? "−" : "+"}</i>
          </button>
          {open === section.id && (
            <div className="rule-body">
              {section.rules.map((rule) => (
                <p key={rule}>
                  <Icon name="check" size={14} />
                  <span>{rule}</span>
                </p>
              ))}
            </div>
          )}
        </article>
      ))}
      <div className="rule-sources">
        <b>Offisielle kilder</b>
        <a
          href="https://lakseelver.no/nb/elver/mandalselva/about"
          target="_blank"
          rel="noreferrer"
        >
          Mandalselva Elveeigarlag · fullstendige regler
        </a>
        <a
          href="https://www.statsforvalteren.no/agder/miljo-og-klima/fiskeforvaltning/tema/lakse--og-sjoaurefiske-i-vassdrag/"
          target="_blank"
          rel="noreferrer"
        >
          Statsforvalteren i Agder · offentlige regler
        </a>
      </div>
    </div>
  );
}
function RulesScreen({ demoStatus,onRegisterPermit }: { demoStatus: DemoStatus;onRegisterPermit:()=>void }) {
  const missing = demoStatus === "noPermit";
  const personalZone =
    demoStatus === "wrongZone"
      ? "Sone 2 · Fuskeland–Hesså"
      : "Sone 3 · Øyslebø–Laudal";
  return (
    <div className="screen rules-screen">
      <Header
        title="Fiskeregler"
        eyebrow="MANDALSELVA · REGELVERSJON 1. AUGUST 2026"
      />
      <section className={"personal-rules " + (missing ? "missing" : "ready")}>
        <div className="personal-rules-title">
          <span>
            <Icon name={missing ? "ticket" : "book"} />
          </span>
          <div>
            <small>REGLER FOR MEG</small>
            <h2>
              {missing ? "Registrer fiskekort" : "Tilpasset ditt fiskekort"}
            </h2>
          </div>
        </div>
        {missing ? (
          <>
            <p>
              Vi mangler fiskekortet ditt. Registrer kortet for å se regler for
              riktig hovedsone og eventuell delsone.
            </p>
            <button onClick={onRegisterPermit}>Registrer fiskekort</button>
          </>
        ) : (
          <>
            <p className="permit-zone">
              <Icon name="pin" size={17} />
              <b>{personalZone}</b>
              <span>Døgnkort · gyldig til 17:59</span>
            </p>
            <div className="personal-rule-list">
              <p>
                <b>Sesong</b>
                <span>1. juni til 31. august</span>
              </p>
              <p>
                <b>Kvote</b>
                <span>1 avlivet laks per fiskerdøgn</span>
              </p>
              <p>
                <b>Rapportering</b>
                <span>Så raskt som mulig og innen 2 timer</span>
              </p>
              <p>
                <b>Redskap</b>
                <span>Flue, sluk og mark etter gjeldende redskapsregler</span>
              </p>
            </div>
            <small className="zone-note-text">
              Reglene er valgt ut fra fiskekortet. Kontroller alltid fysisk
              skilting og eventuelle dagsaktuelle stengninger.
            </small>
          </>
        )}
      </section>
      <div className="general-rules-heading">
        <small>GJELDER ALLE FISKERE</small>
        <h2>Generelle regler</h2>
        <p>
          Her finner du hele regelverket, også når personlig soneinformasjon
          mangler.
        </p>
      </div>
      <RuleCenter />
    </div>
  );
}
function FeedbackForm() {
  const [step, setStep] = useState(1),
    [category, setCategory] = useState(""),
    [description, setDescription] = useState(""),
    [imageName, setImageName] = useState(""),
    [position, setPosition] = useState(false),
    [touched, setTouched] = useState(false),
    [confirmed, setConfirmed] = useState(false);
  const categories = [
    "Ulovlig eller mistenkelig fiske",
    "Syk, skadet eller død fisk",
    "Forsøpling eller miljøproblem",
    "Hindring eller skade i elva",
    "Feil i kart, sone eller informasjon",
    "Annet",
  ];
  const valid = category !== "" && description.trim().length >= 10;
  if (step === 3)
    return (
      <div className="feedback-confirmation">
        <span>
          <Icon name="check" size={32} />
        </span>
        <small>MELDINGEN ER SENDT</small>
        <h3>Takk for at du meldte fra</h3>
        <p>
          Mandalselva Elveeigarlag har mottatt meldingen. Du kan bruke
          referansen dersom du kontakter laget senere.
        </p>
        <div>
          <small>REFERANSE</small>
          <b>ME-TIPS-2026-0819-047</b>
        </div>
        <button
          className="primary"
          onClick={() => {
            setStep(1);
            setCategory("");
            setDescription("");
            setImageName("");
            setPosition(false);
            setTouched(false);
            setConfirmed(false);
          }}
        >
          Send en ny melding
        </button>
      </div>
    );
  return (
    <div className="feedback-form">
      <div className="feedback-steps">
        <span className="on">1</span>
        <i />
        <span className={step >= 2 ? "on" : ""}>2</span>
        <i />
        <span className={step >= 3 ? "on" : ""}>3</span>
      </div>
      {step === 1 && (
        <>
          <div className="form-intro">
            <Icon name="bell" />
            <div>
              <b>Hva vil du melde fra om?</b>
              <p>
                Ikke bruk skjemaet ved akutt fare. Kontakt politiet eller
                oppsynet direkte dersom situasjonen pågår nå.
              </p>
            </div>
          </div>
          <label>
            Kategori <em>påkrevd</em>
          </label>
          <div className="feedback-categories">
            {categories.map((x) => (
              <button
                key={x}
                className={category === x ? "selected" : ""}
                onClick={() => setCategory(x)}
              >
                {category === x && <Icon name="check" size={14} />}
                <span>{x}</span>
              </button>
            ))}
          </div>
          <label>
            Beskrivelse <em>påkrevd</em>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              placeholder="Beskriv hva du observerte, hvor og omtrent når det skjedde"
            />
          </label>
          <div className="character-count">{description.length}/1000</div>
          {touched && !valid && (
            <p className="field-error">
              Velg kategori og skriv en beskrivelse på minst 10 tegn.
            </p>
          )}
          <label className="feedback-upload">
            <Icon name="fish" />
            <span>
              <b>{imageName || "Legg til bilde"}</b>
              <small>Valgfritt · JPG, PNG eller bilde fra kamera</small>
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageName(e.target.files?.[0]?.name || "")}
            />
          </label>
          <div className="position-card">
            <div>
              <Icon name="pin" />
              <span>
                <b>Legg ved posisjon</b>
                <small>Valgfritt · brukes bare til denne meldingen</small>
              </span>
            </div>
            <button
              className={position ? "active" : ""}
              onClick={() => setPosition(!position)}
            >
              {position ? "Lagt til" : "Legg til"}
            </button>
            {position && (
              <p>
                <Icon name="check" size={14} /> Sone 3 · posisjon hentet med
                samtykke
              </p>
            )}
          </div>
          <button
            className="primary"
            onClick={() => {
              setTouched(true);
              if (valid) setStep(2);
            }}
          >
            Kontroller meldingen
          </button>
        </>
      )}
      {step === 2 && (
        <>
          <small>KONTROLLER FØR INNSENDING</small>
          <h3>Er opplysningene riktige?</h3>
          <div className="feedback-review">
            <p>
              <small>KATEGORI</small>
              <b>{category}</b>
            </p>
            <p>
              <small>BESKRIVELSE</small>
              <b>{description}</b>
            </p>
            <p>
              <small>BILDE</small>
              <b>{imageName || "Ikke lagt ved"}</b>
            </p>
            <p>
              <small>POSISJON</small>
              <b>
                {position ? "Sone 3 · lagt ved med samtykke" : "Ikke lagt ved"}
              </b>
            </p>
          </div>
          <label className="privacy-confirm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>
              Jeg bekrefter at opplysningene er riktige. Meldingen kan behandles
              av Mandalselva Elveeigarlag.
            </span>
          </label>
          <button
            className="primary"
            disabled={!confirmed}
            onClick={() => setStep(3)}
          >
            Send melding
          </button>
          <button className="secondary" onClick={() => setStep(1)}>
            Tilbake og endre
          </button>
        </>
      )}
    </div>
  );
}
function MoreDetailContent({ title }: { title: string }) {
  const [saved, setSaved] = useState(false);
  const [showStations,setShowStations]=useState(false);
  const [favorites, setFavorites] = useState(["Sone 3 · Øyslebø–Laudal", "Sone 2 · Fuskeland B"]);
  if(title==="Kontrollkort")return <div className="specific-detail"><div className="detail-hero valid"><Icon name="check"/><div><small>KLAR FOR KONTROLL</small><h3>Dokumentasjonen er gyldig</h3><p>Vis denne siden til fiskeoppsynet</p></div></div><div className="control-code">EF<br/><b>10482</b><small>KONTROLLKODE · OPPDATERT NÅ</small></div><div className="detail-data"><p><span>Fisker</span><b>Fisker-ID 10482</b></p><p><span>Fiskekort</span><b>Sone 3 · gyldig til 17:59</b></p><p><span>Fiskeravgift</span><b className="green">Dokumentert</b></p><p><span>Desinfisering</span><b className="green">Gyldig</b></p><p><span>Kvote</span><b>Fiske tillatt</b></p></div><button className="primary" onClick={()=>setSaved(true)}>{saved?"Kontrollkort oppdatert":"Oppdater kontrollkort"}</button></div>;
  if (title === "Mine fiskekort")
    return <div className="specific-detail"><div className="detail-hero valid"><Icon name="ticket"/><div><small>AKTIVT FISKEKORT</small><h3>Sone 3 · Øyslebø–Laudal</h3><p>Døgnkort · gyldig i dag til kl. 17:59</p></div></div><div className="detail-data"><p><span>Kortnummer</span><b>ME-2026-10482-031</b></p><p><span>Kortholder</span><b>Fisker-ID 10482</b></p><p><span>Område</span><b>Hele hovedsone 3</b></p><p><span>Status</span><b className="green">Gyldig</b></p></div><button className="primary" onClick={()=>setSaved(true)}>{saved?"Nytt kort er lagt til":"Registrer nytt fiskekort"}</button><h3 className="detail-subtitle">Tidligere kort</h3><div className="detail-list"><p><b>Sone 2 · Fuskeland B</b><span>16. juni · utløpt</span></p><p><b>Sone 3 · Øyslebø–Laudal</b><span>12. juni · utløpt</span></p></div></div>;
  if (title === "Desinfisering")
    return <div className="specific-detail"><div className="detail-hero valid"><Icon name="shield"/><div><small>STATUS</small><h3>Desinfisering er gyldig</h3><p>Registrert ved Marnar Laksesenter</p></div></div><div className="detail-data"><p><span>Registrert</span><b>30. juli 2026 · 14:22</b></p><p><span>Gyldig til</span><b>19. august 2026 · 14:22</b></p><p><span>Andre vassdrag</span><b>Ingen registrert etterpå</b></p></div><div className="detail-warning"><Icon name="bell"/><p><b>Har du fisket i et annet vassdrag?</b><span>Da må utstyret desinfiseres på nytt før du fisker i Mandalselva.</span></p></div><button className="primary" onClick={()=>setSaved(true)}>{saved?"Nytt vassdrag er registrert":"Registrer besøk i annet vassdrag"}</button><button className="secondary" onClick={()=>setShowStations(!showStations)}>{showStations?"Skjul stasjoner":"Finn desinfiseringsstasjon"}</button>{showStations&&<div className="detail-list"><p><b>Marnar Laksesenter</b><span>Øyslebø · 2,4 km</span></p><p><b>Laudal kortutsalg</b><span>Laudal · 13 km</span></p><p><b>Mandal servicesenter</b><span>Mandal · 21 km</span></p></div>}</div>;
  if (title === "Varsler og stengninger")
    return <div className="specific-detail"><div className="detail-alert"><Icon name="check"/><div><small>STATUS NÅ</small><h3>Elva er åpen</h3><p>11 °C ved Kjølemo · ingen aktive stengninger</p></div></div><h3 className="detail-subtitle">Mine varsler</h3><div className="toggle-list">{[["Akutt stengning","Varsle dersom hele elva eller min sone stenges"],["Høy vanntemperatur","Varsle når temperaturen nærmer seg 21 °C"],["Regelendringer","Varsle når kvoter eller fisketider endres"],["Rapporteringsfrist","Påminnelse hvis en fangst ikke er ferdig rapportert"]].map(([a,b])=><label key={a}><span><b>{a}</b><small>{b}</small></span><input type="checkbox" defaultChecked/></label>)}</div><button className="primary" onClick={()=>setSaved(true)}>{saved?"Varselinnstillinger lagret":"Lagre varselinnstillinger"}</button></div>;
  if (title === "Favorittsoner")
    return <div className="specific-detail"><p className="detail-lead">Favoritter gir rask tilgang til kart, regler, temperatur og tilgjengelige fiskekort.</p><div className="favorite-list">{favorites.map((name,i)=><div key={name}><span className="favorite-number">{i+2}</span><p><b>{name}</b><small>{i===0?"Åpen · 11 °C · fiskekort registrert":"Åpen · delsone med eget fiskekort"}</small></p><button onClick={()=>setFavorites(favorites.filter(x=>x!==name))}>Fjern</button></div>)}</div><button className="primary" onClick={()=>setFavorites([...favorites,"Sone 4 · Laudal–Bjelland"])} disabled={favorites.includes("Sone 4 · Laudal–Bjelland")}>{favorites.includes("Sone 4 · Laudal–Bjelland")?"Sone 4 er lagt til":"Legg til Sone 4"}</button></div>;
  return <div className="specific-detail"><div className="profile-detail"><div className="avatar">MF</div><div><h3>Fiskerprofil</h3><p>Fisker-ID 10482</p></div></div><div className="detail-data"><p><span>Navn</span><b>Prototypebruker</b></p><p><span>Telefon</span><b>•• •• •• 82</b></p><p><span>Språk</span><b>Norsk bokmål</b></p></div><h3 className="detail-subtitle">Personvern og samtykker</h3><div className="toggle-list"><label><span><b>Posisjon ved soneforslag</b><small>Brukes bare når du ber om å finne riktig sone</small></span><input type="checkbox" defaultChecked/></label><label><span><b>Del anonymisert innsatsdata</b><small>Bidrar til statistikk uten å vise identiteten din</small></span><input type="checkbox" defaultChecked/></label></div><button className="primary" onClick={()=>setSaved(true)}>{saved?"Innstillingene er lagret":"Lagre innstillinger"}</button></div>;
}
function Detail({ title, close }: { title: string; close: () => void }) {
  return (
    <div className="detail-page">
      <button className="back" onClick={close}>
        ‹ Tilbake
      </button>
      <small>PROTOTYPEVISNING</small>
      <h2>{title}</h2>
      {title.includes("Fiskeregler") ? (
        <RuleCenter />
      ) : title === "Tilbakemelding" ? (
        <FeedbackForm />
      ) : (
        <MoreDetailContent title={title} />
      )}
      {title.includes("Fiskeregler") && (
        <p className="source-note">
          Regler og sonedata er basert på Mandalselva Elveeigarlags publiserte
          informasjon for 2026. Fysisk skilting og siste publiserte regelendring
          gjelder.
        </p>
      )}
    </div>
  );
}
type FlowMode = "start" | "stop" | "summary";
function FishingFlow({
  mode,
  finish,
  cancel,
  demoStatus,
  startTime,
  elapsed,
  lastSession,
  resolveBlock,
}: {
  mode: FlowMode;
  finish: (caught?: boolean, selectedZone?: number) => void;
  cancel: () => void;
  demoStatus: DemoStatus;
  startTime: number | null;
  elapsed: number;
  lastSession: SessionRecord | null;
  resolveBlock: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedZone, setSelectedZone] = useState(3);
  const scenario = demoStatuses.find((s) => s.id === demoStatus)!;
  const blocked = scenario.level === "blocked";
  const total = mode === "start" ? 4 : mode === "stop" ? 1 : 1;
  return (
    <div className="flow-overlay">
      <div className="flow-sheet">
        <div className="flow-top">
          <button onClick={cancel} aria-label="Lukk">
            ×
          </button>
          <span>
            {mode === "start"
              ? "START FISKE"
              : mode === "stop"
                ? "AVSLUTT ØKT"
                : "ØKT FULLFØRT"}
          </span>
          <em>{mode === "summary" ? "Ferdig" : `${step} av ${total}`}</em>
        </div>
        {mode === "start" && (
          <div className="flow-content">
            {step === 1 && (
              <>
                <FlowTitle
                  icon="shield"
                  eyebrow="STATUSKONTROLL"
                  title={scenario.title}
                  text={scenario.detail}
                />
                <div className={"scenario-banner " + scenario.level}>
                  <b>
                    {blocked
                      ? "Kan ikke starte"
                      : scenario.level === "warning"
                        ? "Krever bekreftelse"
                        : "Alle kontroller er godkjent"}
                  </b>
                  <span>{scenario.label}</span>
                </div>
                <div className="flow-checks">
                  <CheckRow
                    title="Fiskekort · Sone 3"
                    sub={
                      demoStatus === "noPermit"
                        ? "Ikke funnet"
                        : demoStatus === "wrongZone"
                          ? "Kortet gjelder Sone 2"
                          : "Gyldig til kl. 17:59"
                    }
                    state={
                      ["noPermit", "wrongZone"].includes(demoStatus)
                        ? "error"
                        : "ok"
                    }
                  />
                  <CheckRow
                    title="Statlig fiskeravgift"
                    sub={
                      demoStatus === "noFee"
                        ? "Ikke dokumentert"
                        : "Betalt og dokumentert"
                    }
                    state={demoStatus === "noFee" ? "error" : "ok"}
                  />
                  <CheckRow
                    title="Desinfisering"
                    sub={
                      demoStatus === "expiredDisinfection"
                        ? "Utløpt"
                        : demoStatus === "otherRiver"
                          ? "Nytt vassdrag registrert"
                          : "Gyldig · ikke besøkt annet vassdrag"
                    }
                    state={
                      ["expiredDisinfection", "otherRiver"].includes(demoStatus)
                        ? "error"
                        : "ok"
                    }
                  />
                  <CheckRow
                    title="Kvoter og rapportering"
                    sub={
                      demoStatus === "dailyQuota"
                        ? "Døgnkvote nådd"
                        : demoStatus === "seasonQuota"
                          ? "Sesongkvote nådd"
                          : demoStatus === "lateReport"
                            ? "Forsinket fangstrapport"
                            : "Kvoter tilgjengelig · rapporter ajour"
                    }
                    state={
                      demoStatus === "seasonQuota"
                        ? "warning"
                        : ["dailyQuota", "lateReport"].includes(demoStatus)
                          ? "error"
                          : "ok"
                    }
                  />
                  <CheckRow
                    title="Temperatur og stengning"
                    sub={
                      demoStatus === "hotWater"
                        ? "21,4 °C · fisket er stanset"
                        : demoStatus === "closed"
                          ? "Aktivt stengningsvarsel"
                          : "11 °C · elva er åpen"
                    }
                    state={
                      ["hotWater", "closed"].includes(demoStatus)
                        ? "error"
                        : "ok"
                    }
                  />
                  <CheckRow
                    title="Fiskesesong"
                    sub="Sone 3 · 1. juni–31. august"
                  />
                </div>
                {blocked ? (
                  <>
                    <button className="primary blocked-action" onClick={resolveBlock}>
                      {scenario.action}
                    </button>
                    <button className="secondary" onClick={cancel}>
                      Avbryt oppstart
                    </button>
                  </>
                ) : (
                  <button className="primary" onClick={() => setStep(2)}>
                    {scenario.level === "warning"
                      ? "Jeg forstår · fortsett"
                      : "Fortsett til posisjon"}
                  </button>
                )}
              </>
            )}
            {step === 2 && (
              <>
                <FlowTitle
                  icon="pin"
                  eyebrow="POSISJON"
                  title="Finn riktig fiskesone"
                  text="Posisjonen brukes én gang for å foreslå sone. Kontinuerlig sporing er ikke nødvendig."
                />
                <div className="permission-card">
                  <Icon name="pin" size={30} />
                  <b>Tillat posisjon når du starter</b>
                  <p>
                    Easyfisk lagrer bare sone og valgfri startposisjon sammen
                    med økten.
                  </p>
                </div>
                <button className="primary" onClick={() => setStep(3)}>
                  Tillat og finn sone
                </button>
                <button className="secondary" onClick={() => setStep(3)}>
                  Velg sone manuelt
                </button>
              </>
            )}
            {step === 3 && (
              <>
                <FlowTitle
                  icon="map"
                  eyebrow="SONEFORSLAG"
                  title={
                    demoStatus === "zoneBorder"
                      ? "Du er nær en sonegrense"
                      : "Vi fant Sone 3"
                  }
                  text={
                    demoStatus === "zoneBorder"
                      ? "GPS-posisjonen kan ligge i Sone 2 eller Sone 3. Velg sonen som stemmer med fysisk skilting."
                      : "Posisjonen din ser ut til å være i Sone 3 mellom Øyslebø og Laudal."
                  }
                />
                {demoStatus === "zoneBorder" && (
                  <div className="scenario-banner warning">
                    <b>GPS-treffet er usikkert</b>
                    <span>Ca. 18 meter fra registrert sonegrense</span>
                  </div>
                )}
                <div className="zone-confirm">
                  <div
                    className={
                      "mini-map " +
                      (demoStatus === "zoneBorder" ? "border-hit" : "")
                    }
                  >
                    <span>
                      {demoStatus === "zoneBorder"
                        ? "NÆR SONEGRENSE"
                        : "DIN POSISJON"}
                    </span>
                    <i />
                  </div>
                  <label>Hovedsone</label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(Number(e.target.value))}
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                  {selectedZone === 2 && (
                    <>
                      <label>Delsone</label>
                      <select>
                        <option>Fuskeland B</option>
                        <option>Hauge</option>
                        <option>Holmesland</option>
                        <option>Nøding</option>
                      </select>
                    </>
                  )}
                </div>
                <p className="auto-note">
                  <Icon name="book" size={17} /> Kontroller fysisk skilting
                  dersom du står nær en grense.
                </p>
                <button className="primary" onClick={() => setStep(4)}>
                  Bekreft sone og se regler
                </button>
              </>
            )}
            {step === 4 && (
              <>
                <FlowTitle
                  icon="book"
                  eyebrow="REGLER FOR VALGT SONE"
                  title={"Før du starter i Sone " + selectedZone}
                  text="Bekreft at du har lest de viktigste reglene for denne økten."
                />
                <div className="session-rules">
                  <p>
                    <b>Redskap</b>
                    <span>
                      Flue, sluk og mark. Mothakeløs krok. Sirkelkrok ved
                      markfiske.
                    </span>
                  </p>
                  <p>
                    <b>Kvote</b>
                    <span>
                      1 avlivet laks per fiskerdøgn. Maks 2 gjenutsatte laks.
                    </span>
                  </p>
                  <p>
                    <b>Fangst</b>
                    <span>
                      Rapporteres så raskt som mulig og innen 2 timer.
                    </span>
                  </p>
                  <p>
                    <b>Bevegelig fiske</b>
                    <span>
                      Flytt deg noen meter nedstrøms etter hvert kast.
                    </span>
                  </p>
                </div>
                <label className="confirm-line">
                  <input type="checkbox" defaultChecked /> Jeg har lest og
                  forstått reglene
                </label>
                <button
                  className="primary start-final"
                  onClick={() => finish(undefined, selectedZone)}
                >
                  Start fiske i Sone {selectedZone}
                </button>
              </>
            )}
          </div>
        )}
        {mode === "stop" && (
          <div className="flow-content">
            <FlowTitle
              icon="clock"
              eyebrow="AVSLUTT FISKEØKT"
              title="Fikk du fangst?"
              text="Alle økter lagres, også når du ikke fikk fisk. Dette gir bedre kunnskap om fiskeinnsatsen."
            />
            <div className="stop-summary">
              <span>
                <small>SONE</small>
                <b>Sone 3</b>
              </span>
              <span>
                <small>START</small>
                <b>{formatClock(startTime)}</b>
              </span>
              <span>
                <small>VARIGHET</small>
                <b>{formatLongDuration(elapsed)}</b>
              </span>
            </div>
            <button className="primary" onClick={() => finish(false)}>
              Nei · registrer nullfangst
            </button>
            <button className="secondary" onClick={() => finish(true)}>
              Ja · registrer manglende fangst
            </button>
            <button className="text-button" onClick={cancel}>
              Fortsett å fiske
            </button>
          </div>
        )}
        {mode === "summary" && lastSession && (
          <div className="flow-content">
            <FlowTitle
              icon="check"
              eyebrow="ØKTEN ER LAGRET"
              title="Takk for rapporteringen"
              text="Fiskeaktiviteten er lagret og lagt til i økthistorikken."
            />
            <div className="final-summary">
              <div>
                <small>SONE</small>
                <b>{lastSession.zone}</b>
              </div>
              <div>
                <small>TIDSPUNKT</small>
                <b>
                  {formatClock(lastSession.start)}–
                  {formatClock(lastSession.end)}
                </b>
              </div>
              <div>
                <small>VARIGHET</small>
                <b>{formatLongDuration(lastSession.duration)}</b>
              </div>
              <div>
                <small>FANGST</small>
                <b>{lastSession.result}</b>
              </div>
              <div>
                <small>RAPPORTSTATUS</small>
                <b className="green">Fullført og registrert</b>
              </div>
            </div>
            <button className="primary" onClick={() => finish()}>
              Tilbake til oversikten
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
function FlowTitle({
  icon,
  eyebrow,
  title,
  text,
}: {
  icon: string;
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flow-title">
      <span>
        <Icon name={icon} size={27} />
      </span>
      <small>{eyebrow}</small>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
function CheckRow({
  title,
  sub,
  state = "ok",
}: {
  title: string;
  sub: string;
  state?: "ok" | "warning" | "error";
}) {
  return (
    <div className={"check-row " + state}>
      <span>{state === "ok" ? <Icon name="check" size={16} /> : "!"}</span>
      <p>
        <b>{title}</b>
        <small>{sub}</small>
      </p>
    </div>
  );
}
export default function Page() {
  const [screen, setScreen] = useState<Screen>("home"),
    [active, setActive] = useState(false),
    [zone, setZone] = useState(3),
    [toast, setToast] = useState(""),
    [flow, setFlow] = useState<FlowMode | null>(null),
    [demoStatus, setDemoStatus] = useState<DemoStatus>("ok"),
    [startTime, setStartTime] = useState<number | null>(null),
    [elapsed, setElapsed] = useState(0),
    [lastSession, setLastSession] = useState<SessionRecord | null>(null),
    [globalDetail, setGlobalDetail] = useState(""),
    [catches, setCatches] = useState<CatchRecord[]>([]),
    [finishAfterCatch, setFinishAfterCatch] = useState(false),
    [sessionZone, setSessionZone] = useState(3),
    [requestedCatchTime, setRequestedCatchTime] = useState(0),
    [statsMineRequested,setStatsMineRequested]=useState(false);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!active || !startTime) return;
    const update = () =>
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [active, startTime]);
  const nav = [
    ["home", "Hjem", "home"],
    ["map", "Kart", "map"],
    ["rules", "Regler", "book"],
    ["stats", "Statistikk", "stats"],
    ["more", "Mer", "more"],
  ] as const;
  const openFlow = () => setFlow(active ? "stop" : "start");
  const finish = (caught?: boolean, selectedZone?: number) => {
    if (flow === "start") {
      const now = Date.now();
      setSessionZone(selectedZone ?? zone);
      setStartTime(now);
      setElapsed(0);
      setActive(true);
      setFlow(null);
      setToast(`Fiskeøkten er startet i Sone ${selectedZone ?? zone}`);
      setScreen("stats");
    } else if (flow === "stop") {
      if (caught) {
        setFlow(null);
        setScreen("stats");
        setFinishAfterCatch(true);
        setRequestedCatchTime(Date.now());
      } else {
        const end = Date.now(),
          start = startTime ?? end,
          duration = Math.max(1, Math.floor((end - start) / 1000));
        setElapsed(duration);
        setLastSession({
          start,
          end,
          duration,
          zone: zones.find(item=>item.id===sessionZone)?.name||"Sone 3 · Øyslebø–Laudal",
          result: "Nullfangst registrert",
        });
        setActive(false);
        setFlow("summary");
      }
    } else {
      setFlow(null);
      setScreen("home");
    }
  };
  const features = [
    "Samlet kontroll av fiskekort, avgift, desinfisering og kvote",
    "Start/stopp av fiskeøkt med GPS-forslag til sone",
    "Fangstrapport i tre steg med automatisk tid og sone",
    "Nullfangst, fiskehistorikk og personlig kvoteregnskap",
    "Veiledende kart over de fire faktiske hovedsonene",
    "Regler tilpasset sesong, sone og fangst",
    "Varsler om temperatur, stengninger og rapporteringsfrist",
    "Eksempel på aggregert fangst- og innsatsstatistikk",
    "Kontrollkort for oppsyn, favorittsoner og tilbakemeldinger",
  ];
  const selectedDemo = demoStatuses.find((s) => s.id === demoStatus)!;
  return (
    <main className="prototype-shell">
      <div className="phone-app">
        {screen === "home" && (
          <Home
            onStart={openFlow}
            onRules={() => setScreen("rules")}
            onFeedback={() => setGlobalDetail("Tilbakemelding")}
            onControlCard={()=>setGlobalDetail("Kontrollkort")}
            onCatchShortcut={()=>{setStatsMineRequested(true);setScreen("stats")}}
            onMapShortcut={()=>setScreen("map")}
            active={active}
            elapsed={elapsed}
            startTime={startTime}
            demoStatus={demoStatus}
            salmonKilled={catches.filter((item) => item.species === "Laks" && item.result === "Avlivet").length}
          />
        )}{" "}
        {screen === "map" && (
          <MapScreen selected={zone} setSelected={setZone} onUseZone={(selected)=>{setZone(selected);setSessionZone(selected);setScreen("home");setFlow("start")}} />
        )}{" "}
        {screen === "rules" && <RulesScreen demoStatus={demoStatus} onRegisterPermit={()=>setGlobalDetail("Mine fiskekort")} />}{" "}
        {screen === "stats" && (
          <Stats
            active={active}
            onStart={() => setFlow("start")}
            onStop={() => setFlow("stop")}
            onAddPast={(record, catchRecords) => {
              setLastSession(record);
              if (catchRecords?.length) {
                const submittedAt = Date.now();
                setCatches(current => [...current, ...catchRecords.map((catchRecord,index) => ({...catchRecord, id:catchRecord.id === "pending" ? `ME-${submittedAt}-${index+1}` : catchRecord.id, submittedAt, late: submittedAt-catchRecord.caughtAt > 2*60*60*1000}))]);
              }
              setToast("Tidligere fisketur er registrert");
            }}
            onCatch={(record) => {
              const now = Date.now();
              const savedRecord = { ...record, id: `ME-${now}`, submittedAt: now, late: now - record.caughtAt > 2 * 60 * 60 * 1000 };
              setCatches((current) => [...current, savedRecord]);
              setToast("Fangsten er lagret og kvoten er oppdatert");
              if (finishAfterCatch) {
                const end = Date.now();
                const start = startTime ?? end;
                setLastSession({
                  start,
                  end,
                  duration: Math.max(1, Math.floor((end - start) / 1000)),
                  zone: record.zone,
                  result: `1 ${record.species.toLowerCase()} · ${record.result.toLowerCase()}`,
                });
                setActive(false);
              }
            }}
            onCorrectCatch={(id, note) => setCatches(current => current.map(item => item.id === id ? {...item, correction: note} : item))}
            onShowRules={()=>setScreen("rules")}
            openMine={statsMineRequested}
            onCatchFlowComplete={() => {
              setFinishAfterCatch(false);
              setFlow("summary");
            }}
            finishAfterCatch={finishAfterCatch}
            catches={catches}
            activeZone={zones.find(item => item.id === sessionZone)?.name || "Sone 3 · Øyslebø–Laudal"}
            requestedCatchTime={requestedCatchTime}
            elapsed={elapsed}
            startTime={startTime}
            lastSession={lastSession}
          />
        )}{" "}
        {screen === "more" && <More />}
        <nav className="bottom-nav">
          {nav.map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => {if(id==="stats")setStatsMineRequested(false);setScreen(id)}}
              className={screen === id ? "selected" : ""}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {id === "stats" && active && <i />}
            </button>
          ))}
        </nav>
        {toast && (
          <div className="toast">
            <Icon name="check" size={18} />
            {toast}
          </div>
        )}
        {flow && (
          <FishingFlow
            mode={flow}
            finish={finish}
            cancel={() => setFlow(null)}
            demoStatus={demoStatus}
            startTime={startTime}
            elapsed={elapsed}
            lastSession={lastSession}
            resolveBlock={()=>{setFlow(null);setGlobalDetail(demoStatus==="noPermit"||demoStatus==="wrongZone"?"Mine fiskekort":demoStatus==="expiredDisinfection"||demoStatus==="otherRiver"?"Desinfisering":"Varsler og stengninger")}}
          />
        )}
        {globalDetail && (
          <Detail title={globalDetail} close={() => setGlobalDetail("")} />
        )}
      </div>
      <aside className="prototype-note feature-panel">
        <span>DEMONSTRASJONSMODUS</span>
        <h2>Prøv statusmotoren</h2>
        <p className="demo-intro">
          Velg en situasjon. Valget påvirker statuskontrollen og hva brukeren
          kan gjøre videre.
        </p>
        <label className="demo-select-label" htmlFor="demo-status">
          Situasjon
        </label>
        <select
          id="demo-status"
          className="demo-select"
          value={demoStatus}
          onChange={(e) => {
            setDemoStatus(e.target.value as DemoStatus);
            setActive(false);
            setFlow(null);
          }}
        >
          {demoStatuses.map((s) => (
            <option value={s.id} key={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <div className={"demo-result " + selectedDemo.level}>
          <b>
            {selectedDemo.level === "blocked"
              ? "Blokkerer oppstart"
              : selectedDemo.level === "warning"
                ? "Krever vurdering"
                : "Oppstart tillatt"}
          </b>
          <span>{selectedDemo.detail}</span>
        </div>
        <button
          className="demo-start"
          onClick={() => {
            setScreen("home");
            setFlow("start");
          }}
        >
          Test valgt situasjon
        </button>
        <div className="feature-divider" />
        <span>FUNKSJONER I PROTOTYPEN</span>
        <ul>
          {features.map((f) => (
            <li key={f}>
              <Icon name="check" size={16} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <small>
          Prototypen bruker realistiske 2026-regler. Kart, persondata, forhold
          og statistikk er demonstrasjonsdata.
        </small>
      </aside>
    </main>
  );
}
