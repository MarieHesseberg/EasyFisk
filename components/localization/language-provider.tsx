"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type AppLanguage = "no" | "en";

const storageKey = "easyfisk-language";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "no",
  setLanguage: () => undefined,
});

const exactTranslations = new Map<string, string>([
  ["Hjem", "Home"],
  ["Kart", "Map"],
  ["Fiskekort", "Permits"],
  ["Regler", "Rules"],
  ["Mer", "More"],
  ["Din fiskeoversikt", "Your fishing overview"],
  ["Fiskesoner", "Fishing zones"],
  ["Kjøp fiskekort", "Buy fishing permit"],
  ["Fiskeregler", "Fishing rules"],
  ["Varsler", "Notifications"],
  ["Lukk varsler", "Close notifications"],
  ["VARSLER", "NOTIFICATIONS"],
  ["Kontrollerte meldinger og eksempelvarsler", "Verified messages and example alerts"],
  ["Registrer tidligere fisketur", "Register a previous fishing trip"],
  [
    "Etterregistrer en tur uten å starte en ny fiskeøkt",
    "Add a previous trip without starting a new session",
  ],
  ["FISKEØKT PÅGÅR", "FISHING SESSION ACTIVE"],
  ["HANDLING KREVES", "ACTION REQUIRED"],
  ["MÅ KONTROLLERES", "CHECK REQUIRED"],
  ["STATUS NÅ", "CURRENT STATUS"],
  ["STOPP FISKE", "STOP FISHING"],
  ["SE HVA SOM MANGLER", "SEE WHAT IS MISSING"],
  ["KONTROLLER OG START", "CHECK AND START"],
  ["START FISKE", "START FISHING"],
  ["Dokumentasjon mangler", "Documents missing"],
  ["Du er klar til å fiske", "You are ready to fish"],
  [
    "Alle dokumentkrav er registrert og gyldige i appen.",
    "All required documents are registered and valid in the app.",
  ],
  ["Faktisk status", "Current status"],
  ["Testsituasjon", "Test scenario"],
  ["Registrer dokumentasjon", "Register documents"],
  ["Dokumentasjon og status", "Documents and status"],
  ["Mine dokumenter", "My documents"],
  ["Desinfisering", "Disinfection"],
  ["Statlig fiskeravgift", "National fishing fee"],
  ["Ingen registrert – legg til dokumentasjon", "Not registered — add documentation"],
  ["Henter …", "Loading…"],
  ["Henter dokumenter …", "Loading documents…"],
  ["Mangler eller er utløpt", "Missing or expired"],
  ["TILBAKEMELDING OG OBSERVASJON", "FEEDBACK AND OBSERVATIONS"],
  ["Meld fra til elveeigarlaget", "Report to the river owners' association"],
  [
    "Rapporter feil, forsøpling, syk fisk eller mistenkelig fiske.",
    "Report errors, littering, sick fish or suspicious fishing activity.",
  ],
  ["Snarveier", "Shortcuts"],
  ["Finn riktig sone", "Find the right zone"],
  ["Regler for meg", "Rules for me"],
  ["Sesongkvote laks", "Season salmon quota"],
  ["REGLER OPPDATERT 1. AUGUST 2026", "RULES UPDATED 1 AUGUST 2026"],
  ["1 laks per fiskerdøgn", "1 salmon per fishing day"],
  [
    "Når én laks er avlivet, skal alt fiske stoppe til neste fiskerdøgn. Minstemålet er 35 cm. Én av sesongens 5 avlivede laks kan være opptil 90 cm. De øvrige må være under 65 cm.",
    "Once one salmon has been harvested, all fishing must stop until the next fishing day. The minimum size is 35 cm. One of the season's five harvested salmon may be up to 90 cm. The others must be under 65 cm.",
  ],
  ["Se komplett regelkontroll", "View the complete rules check"],
  ["Vis min posisjon", "Show my location"],
  ["Henter posisjon …", "Getting location…"],
  ["SESONG", "SEASON"],
  ["OMFANG", "AREA"],
  ["PROTOTYPEUTVALG", "PROTOTYPE SELECTION"],
  ["Fiskekort i sonen", "Permits in this zone"],
  ["Kontrollert 01.09.2026", "Verified 1 September 2026"],
  ["Kontroller kilde", "Check source"],
  [
    "Kartet er veiledende. Fysisk oppmerking og lokale regler gjelder alltid.",
    "The map is a guide. Signs on site and local rules always apply.",
  ],
  ["MANDALSELVA · VEILEDENDE KART", "MANDALSELVA · GUIDANCE MAP"],
  ["Interaktivt kart over Mandalselva", "Interactive map of the River Mandalselva"],
  ["Kart med grensene for fiskesone 1 til 4", "Map showing the boundaries of fishing zones 1 to 4"],
  ["Hele elva", "Entire river"],
  ["Lukk soneinformasjon", "Close zone information"],
  ["VALGT FISKEOMRÅDE", "SELECTED FISHING AREA"],
  ["Se offisiell soneinformasjon ↗", "View official zone information ↗"],
  [
    "Sonegrensene er basert på koordinatene i Norske Lakseelvers publiserte kart. Fysisk oppmerking langs elva gjelder ved avvik.",
    "Zone boundaries are based on coordinates in Norske Lakseelver's published map. Signs along the river take precedence.",
  ],
  ["DAGSKORT, SESONGKORT OG GRUPPEKORT", "DAY, SEASON AND GROUP PERMITS"],
  ["Fiskekortbutikk", "Permit shop"],
  ["Velg hovedsone", "Choose main zone"],
  ["Delsone eller salgsområde", "Sub-zone or sales area"],
  ["Tilgjengelighet kontrolleres for valgt dato", "Availability is checked for the selected date"],
  ["Velg rapporteringskort", "Choose reporting permit"],
  ["Se fiskekort", "View permit"],
  ["Se kontaktinformasjon", "View contact details"],
  ["Se produktinformasjon ↗", "View product information ↗"],
  ["Registrerte rapporteringsdøgn", "Registered reporting days"],
  ["Fiskedato og kortinnehaver", "Fishing date and permit holder"],
  [
    "Kortet utstedes til personen som skal være ansvarlig for kjøpet.",
    "The permit is issued to the person responsible for the purchase.",
  ],
  ["Valgt fiskedato", "Selected fishing date"],
  ["Datoen kan endres på produktsiden.", "The date can be changed on the product page."],
  ["Fullt navn", "Full name"],
  ["Fødselsdato", "Date of birth"],
  ["E-post", "Email"],
  ["Telefon", "Phone"],
  ["Neste · krav og deltakere", "Next · requirements and participants"],
  ["Deltakere og fiskekrav", "Participants and fishing requirements"],
  [
    "Dokumenter kontrolleres igjen når fisket starter",
    "Documents are checked again when fishing starts",
  ],
  ["✓ Fiskeravgift registrert", "✓ Fishing fee registered"],
  ["! Fiskeravgift mangler eller er utløpt", "! Fishing fee is missing or expired"],
  ["✓ Desinfisering registrert", "✓ Disinfection registered"],
  ["! Desinfisering mangler eller er utløpt", "! Disinfection is missing or expired"],
  [
    "Jeg har lest og forstått fiskereglene for Mandalselva.",
    "I have read and understood the fishing rules for the River Mandalselva.",
  ],
  [
    "Jeg godtar vilkårene for dette simulerte kjøpet.",
    "I accept the terms of this simulated purchase.",
  ],
  ["Tilbake", "Back"],
  ["Neste · kontroller", "Next · review"],
  ["Kontroller bestillingen", "Review your order"],
  ["Kort", "Permit"],
  ["Område", "Area"],
  ["Gyldig", "Valid"],
  ["Kortholder", "Permit holder"],
  ["Jeg bekrefter at opplysningene er riktige.", "I confirm that the information is correct."],
  ["Tilbake og endre", "Back and edit"],
  ["Gå til testbetaling", "Continue to test payment"],
  ["SIKKER TESTBETALING", "SECURE TEST PAYMENT"],
  ["Betal fiskekortet", "Pay for the permit"],
  ["Dette er en simulert betaling.", "This is a simulated payment."],
  [
    "Ingen kortopplysninger registreres, og ingen penger trekkes.",
    "No card details are recorded and no money is charged.",
  ],
  ["Betalingsmåte", "Payment method"],
  ["Testkort ···· 4242", "Test card ···· 4242"],
  ["Ingen ekte betaling gjennomføres.", "No real payment is made."],
  ["Fiskerprofil", "Angler profile"],
  ["Fiskekort og kjøp", "Permits and purchases"],
  ["Utforsk kort etter sone og korttype", "Browse permits by zone and type"],
  ["Statistikk og fiskehistorikk", "Statistics and fishing history"],
  [
    "Mandalselva og dine registrerte fiskeøkter",
    "Mandalselva and your registered fishing sessions",
  ],
  ["Registrer kvittering eller fritak", "Register receipt or exemption"],
  ["Statusmotor", "Status engine"],
  [
    "Velg situasjon for prototypens statuskontroll",
    "Choose a scenario for the prototype status check",
  ],
  ["Opprett melding", "Create report"],
  ["REGLER FOR MEG", "RULES FOR ME"],
  ["Registrer fiskekort", "Register permit"],
  ["Tilpasset ditt fiskekort", "Matched to your permit"],
  ["Sesong", "Season"],
  ["Kvote", "Quota"],
  ["Rapportering", "Reporting"],
  ["Redskap", "Tackle"],
  ["GJELDER ALLE FISKERE", "APPLIES TO ALL ANGLERS"],
  ["Generelle regler", "General rules"],
  [
    "Her finner du hele regelverket, også når personlig soneinformasjon mangler.",
    "Find all rules here, even when personal zone information is unavailable.",
  ],
  [
    "Vi mangler fiskekortet ditt. Registrer kortet for å se regler for riktig hovedsone og eventuell delsone.",
    "Your permit has not been registered. Add it to see the rules for the correct main zone and sub-zone.",
  ],
  [
    "Flue, sluk og mark etter gjeldende redskapsregler",
    "Fly, lure and worm fishing according to current tackle rules",
  ],
  ["Norsk", "Norwegian"],
  ["Engelsk", "English"],
  ["Velg språk", "Choose language"],
  ["Hovednavigasjon", "Main navigation"],
  ["All dokumentasjon mangler", "All documents are missing"],
  [
    "Fiskekort, desinfisering og statlig fiskeravgift er satt som manglende.",
    "The fishing permit, disinfection and national fishing fee are marked as missing.",
  ],
  ["Se dokumentasjon", "View documents"],
  ["Alt er i orden (oppstart tillatt)", "Everything is in order (fishing allowed)"],
  [
    "Alle krav er kontrollert. Du kan fortsette til sonevalg.",
    "All requirements have been checked. You can continue to zone selection.",
  ],
  ["Fiskekort mangler", "Fishing permit missing"],
  ["Du mangler fiskekort", "You need a fishing permit"],
  [
    "Det finnes ikke et gyldig fiskekort på profilen din.",
    "There is no valid fishing permit on your profile.",
  ],
  ["Kortet gjelder feil sone", "The permit is for the wrong zone"],
  ["Kortet gjelder ikke Sone 3", "The permit is not valid for Zone 3"],
  [
    "Kortet ditt gjelder Sone 2. Velg riktig sone eller registrer et annet kort.",
    "Your permit is valid for Zone 2. Choose the correct zone or register another permit.",
  ],
  ["Velg sone fra fiskekortet", "Choose the zone shown on the permit"],
  ["Desinfiseringen er utløpt", "Disinfection has expired"],
  ["Desinfisering må fornyes", "Disinfection must be renewed"],
  [
    "Beviset er utløpt. Utstyret må desinfiseres før fiske kan starte.",
    "The certificate has expired. Your equipment must be disinfected before fishing.",
  ],
  ["Finn desinfiseringsstasjon", "Find a disinfection station"],
  ["Besøkt et annet vassdrag", "Equipment used in another watercourse"],
  ["Ny desinfisering kreves", "New disinfection required"],
  [
    "Utstyret er brukt i et annet vassdrag etter siste desinfisering.",
    "The equipment has been used in another watercourse since its last disinfection.",
  ],
  ["Fiskeravgift mangler", "National fishing fee missing"],
  ["Fiskeravgiften mangler", "The national fishing fee is missing"],
  [
    "Betaling av statlig fiskeravgift må dokumenteres før laksefiske.",
    "Payment of the national fishing fee must be documented before salmon fishing.",
  ],
  ["Døgnkvoten er nådd", "Daily quota reached"],
  ["Sesongkvoten er nådd", "Season quota reached"],
  [
    "Én avlivet laks er registrert dette fiskerdøgnet. Fisket kan ikke fortsette før neste fiskerdøgn.",
    "One harvested salmon has been registered for this fishing day. Fishing cannot continue until the next fishing day.",
  ],
  [
    "Fem avlivede laks er registrert denne sesongen. Videre avliving er ikke tillatt.",
    "Five harvested salmon have been registered this season. No further harvesting is allowed.",
  ],
  ["Se kvoteregnskap", "View quota record"],
  ["Se regler for gjenutsetting", "View catch-and-release rules"],
  ["Fangstrapport er forsinket", "Catch report overdue"],
  ["En fangstrapport mangler", "A catch report is missing"],
  [
    "En tidligere fangst må ferdigstilles før en ny økt kan startes.",
    "A previous catch report must be completed before starting a new session.",
  ],
  ["Fullfør fangstrapport", "Complete catch report"],
  ["Fisket er stanset", "Fishing is closed"],
  ["Sonen eller elva er stengt", "The zone or river is closed"],
  ["Sone 3 er midlertidig stengt", "Zone 3 is temporarily closed"],
  [
    "Det er publisert et aktivt stengningsvarsel for valgt sone.",
    "An active closure notice has been published for the selected zone.",
  ],
  ["Se åpne soner", "View open zones"],
  ["GPS ved en sonegrense", "GPS near a zone boundary"],
  ["Posisjonen er nær en sonegrense", "Your position is near a zone boundary"],
  [
    "GPS-treffet er usikkert. Kontroller fysisk skilting og velg sone manuelt.",
    "The GPS result is uncertain. Check signs on site and select the zone manually.",
  ],
  ["Velg sone manuelt", "Choose zone manually"],
  ["Dokumentasjon", "Documentation"],
  ["Kort, avgift og desinfisering", "Permit, fee and disinfection"],
  ["Fisketider", "Fishing season"],
  ["Redskap", "Tackle"],
  ["Tillatte agn, kroker og forbud", "Permitted bait, hooks and restrictions"],
  ["Døgnkvoter", "Daily quotas"],
  ["Kvoter per fiskerdøgn", "Quotas per fishing day"],
  ["Sesongkvoter", "Season quotas"],
  ["Gjenutsetting", "Catch and release"],
  ["Størrelse, utstyr og behandling", "Size, equipment and handling"],
  ["Temperatur og stengning", "Temperature and closures"],
  ["Fangstrapportering", "Catch reporting"],
  ["Fangst, gjenutsetting og innsats", "Catch, release and fishing effort"],
  ["Soneregler", "Zone rules"],
  ["Gyldig område og lokale avvik", "Valid area and local variations"],
  ["Allmenne hensyn", "General conduct"],
  ["Natur, grunneiere og andre fiskere", "Nature, landowners and other anglers"],
  [
    "Fiskekortet er personlig og må stå i fiskerens navn.",
    "The fishing permit is personal and must be issued in the angler's name.",
  ],
  [
    "Gyldig fiskekort og dokumentasjon på betalt statlig fiskeravgift skal kunne vises til oppsynet.",
    "A valid fishing permit and proof of the paid national fishing fee must be available for inspection.",
  ],
  [
    "Alt fiskeutstyr, også båt, kano og motor, skal desinfiseres før bruk i Mandalselva.",
    "All fishing equipment, including boats, canoes and motors, must be disinfected before use in Mandalselva.",
  ],
  [
    "Desinfisering gjelder i 20 dager, men blir ugyldig straks utstyret har vært brukt i et annet vassdrag.",
    "Disinfection is valid for 20 days, but becomes invalid as soon as the equipment is used in another watercourse.",
  ],
  [
    "Flue, sluk og mark er tillatt i alle soner.",
    "Fly, lure and worm fishing are permitted in all zones.",
  ],
  [
    "Levende fisk som agn, krøking og utstyr som kan fylles med vann er forbudt.",
    "Live fish as bait, snagging and equipment that can fill with water are prohibited.",
  ],
  [
    "Maksimalt én treblekrok på hvert fiskeredskap.",
    "A maximum of one treble hook is permitted on each item of tackle.",
  ],
  [
    "Kroker skal være mothakeløse eller ha innklemt mothake. Sirkelkrok er påbudt ved markfiske.",
    "Hooks must be barbless or have the barb pinched down. Circle hooks are mandatory when worm fishing.",
  ],
  [
    "Kart på nett er veiledende. Oppmerking i elva og lokale regler bestemmer gyldig fiskeområde.",
    "Online maps are a guide. Signs along the river and local rules determine the valid fishing area.",
  ],
  [
    "Fiske er forbudt 50 meter ovenfor og nedenfor fisketrapper, støpte terskler og dammer.",
    "Fishing is prohibited within 50 metres upstream and downstream of fish ladders, concrete weirs and dams.",
  ],
  [
    "Fiske fra broer og ledgjerde for smolt i Manflåvatn er ikke tillatt.",
    "Fishing from bridges and from the smolt guide fence in Manflåvatn is prohibited.",
  ],
  [
    "Tre landfiskeområder og felles båtfiske. Båtkort gjelder hele sone 1 og to stenger per båt.",
    "Three bank-fishing areas and shared boat fishing. The boat permit covers all of Zone 1 and two rods per boat.",
  ],
  [
    "Personlige kort i delsoner som Hauge, Holmesland, Nøding, Fuskeland og Bringsdal. Fysisk skilting langs elva gjelder.",
    "Personal permits for sub-zones including Hauge, Holmesland, Nøding, Fuskeland and Bringsdal. Signs along the river apply.",
  ],
  [
    "Ett fiskekort dekker hele sonen. Variert fiske med store flueområder og dype kulper.",
    "One fishing permit covers the entire zone. Varied fishing with large fly-fishing areas and deep pools.",
  ],
  [
    "Hovedsone fra dam Manflå til Kavfossen og lakseførende del av Kosåna, samt seks navngitte delsoner.",
    "Main zone from Manflå dam to Kavfossen and the salmon-bearing section of Kosåna, plus six named sub-zones.",
  ],
  ["5 km · munningen–Vik", "5 km · river mouth–Vik"],
  ["14 km · 32 delsoner", "14 km · 32 sub-zones"],
  ["13 km · ett kort", "13 km · one permit"],
  ["18 km · Kosåna inkludert", "18 km · Kosåna included"],
  [
    "Utforsk fiskekort for Mandalselva. Dette er en kjøpsprototype med et datert produktøyeblikksbilde – betaling og reservasjon er ikke aktivert.",
    "Browse fishing permits for Mandalselva. This purchasing prototype uses a dated product snapshot — payment and reservations are not active.",
  ],
  [
    "Produktdata kontrollert 01.09.2026. Pris, kapasitet og tilgjengelighet må kontrolleres før et virkelig kjøp.",
    "Product data checked on 1 September 2026. Price, capacity and availability must be verified before a real purchase.",
  ],
  [
    "Produktdataene er et datert øyeblikksbilde. Tilgjengelighet og betaling simuleres i prototypen.",
    "Product data is a dated snapshot. Availability and payment are simulated in this prototype.",
  ],
]);

const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();

function translateNorwegianText(value: string) {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const text = value.trim();
  let translated = exactTranslations.get(text);
  if (!translated) {
    translated = text
      .replace(/^Sone (\d)$/, "Zone $1")
      .replace(/^Bruk sone (\d) i fiskeøkten$/, "Use zone $1 for the fishing session")
      .replace(/^Se og velg fiskekort i sone (\d)$/, "View and choose permits in zone $1")
      .replace(/^Vis alle i sone (\d)$/, "Show all in zone $1")
      .replace(/^Ingen registrert/, "Not registered")
      .replace(
        /^Registrer gyldig fiskekort, gyldig desinfisering, fiskeravgift eller registrert fritak før du starter\.$/,
        "Register a valid fishing permit, valid disinfection, and the national fishing fee or an exemption before you start.",
      )
      .replace(
        /^Registrer (.+) før du starter\.$/,
        (_match, requirements: string) =>
          `Register ${requirements
            .replace("gyldig fiskekort", "a valid fishing permit")
            .replace("gyldig desinfisering", "valid disinfection")
            .replace(
              "fiskeravgift eller registrert fritak",
              "the national fishing fee or an exemption",
            )} before you start.`,
      )
      .replace(/^Testsituasjon:/, "Test scenario:")
      .replace(/^Startet /, "Started ")
      .replace(/^Døgnkvote nådd/, "Daily quota reached")
      .replace(/^Sesongkvote nådd/, "Season quota reached")
      .replace(/ av (\d+) avlivet gjenstår$/, " of $1 harvested salmon remaining")
      .replace(/ avlivet/g, " harvested")
      .replace(/ gjenutsatt/g, " released")
      .replace(/^Kontakt /, "Contact ")
      .replace(/ for pris og kjøp/, " for price and purchase")
      .replace(/døgnkort/gi, "day permit")
      .replace(/ukekort/gi, "week permit")
      .replace(/sesongkort/gi, "season permit")
      .replace(/gruppekort/gi, "group permit")
      .replace(/Pris ikke offentliggjort/g, "Price not published")
      .replace(/Tilgjengelighet/g, "Availability")
      .replace(/fiskerdøgn/g, "fishing day")
      .replace(/avlivet laks/g, "harvested salmon");
    translated = translated
      .replace(/gyldig til/gi, "valid until")
      .replace(/gyldig i dag/gi, "valid today")
      .replace(/utløpt/gi, "expired")
      .replace(/delsone(r)?/gi, (_match, plural) => (plural ? "sub-zones" : "sub-zone"))
      .replace(/personlig(e)?/gi, "personal")
      .replace(/hele hovedsonen/gi, "the entire main zone")
      .replace(/hele sonen/gi, "the entire zone")
      .replace(/Ingen offentlig kapasitet oppgitt/gi, "No public capacity stated")
      .replace(/Få kort igjen/gi, "Few permits remaining")
      .replace(/Utsolgt/gi, "Sold out")
      .replace(/Ikke i salg/gi, "Not on sale");
  }
  return `${leading}${translated}${trailing}`;
}

function localizeElement(root: ParentNode, language: AppLanguage, sourceMutation = false) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  while (node) {
    const parent = node.parentElement;
    if (
      parent &&
      !parent.closest('[translate="no"]') &&
      !["SCRIPT", "STYLE"].includes(parent.tagName)
    ) {
      const current = node.nodeValue ?? "";
      const stored = originalText.get(node);
      if (
        stored === undefined ||
        (language === "en" && current !== stored && current !== translateNorwegianText(stored)) ||
        (language === "no" && sourceMutation && current !== stored)
      ) {
        originalText.set(node, current);
      }
      const original = originalText.get(node) ?? "";
      const next = language === "en" ? translateNorwegianText(original) : original;
      if (node.nodeValue !== next) node.nodeValue = next;
    }
    node = walker.nextNode() as Text | null;
  }
  const elements =
    root instanceof Element
      ? [root, ...root.querySelectorAll("*")]
      : [...root.querySelectorAll("*")];
  for (const element of elements) {
    if (element.closest('[translate="no"]')) continue;
    let originals = originalAttributes.get(element);
    if (!originals) {
      originals = new Map();
      originalAttributes.set(element, originals);
    }
    for (const attribute of ["aria-label", "title", "placeholder"]) {
      const current = element.getAttribute(attribute);
      if (current !== null && !originals.has(attribute)) originals.set(attribute, current);
      const original = originals.get(attribute);
      if (original !== undefined)
        element.setAttribute(
          attribute,
          language === "en" ? translateNorwegianText(original) : original,
        );
    }
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<AppLanguage>("no");
  const savedLanguage = useRef<AppLanguage | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    savedLanguage.current = saved === "en" ? "en" : "no";
    if (saved !== "en") return;
    const timeout = window.setTimeout(() => updateLanguage("en"), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (savedLanguage.current === "en" && language === "no") return;
    window.localStorage.setItem(storageKey, language);
    document.documentElement.lang = language === "en" ? "en" : "no";
    localizeElement(document.body, language);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData" && mutation.target.parentNode) {
          localizeElement(mutation.target.parentNode, language, true);
          continue;
        }
        for (const addedNode of mutation.addedNodes) {
          if (addedNode instanceof Element) localizeElement(addedNode, language, true);
          else if (addedNode instanceof Text && addedNode.parentNode)
            localizeElement(addedNode.parentNode, language, true);
        }
      }
    });
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage(nextLanguage: AppLanguage) {
        savedLanguage.current = nextLanguage;
        updateLanguage(nextLanguage);
      },
    }),
    [language],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
