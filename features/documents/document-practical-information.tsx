import { useLanguage } from "@/components/localization/language-provider";
import { selectLocalized } from "@/locales";

// Checked against the linked official sources on 15 September 2026.
const information = {
  fee: [
    [
      "Ved oppsyn",
      "During an inspection",
      "Ha kvitteringen for betalt fiskeravgift tilgjengelig og vis den ved kontroll. Fiskeravgiften erstatter ikke det lokale fiskekortet.",
      "Keep your fishing fee receipt available and show it during an inspection. The national fee does not replace your local fishing permit.",
    ],
    [
      "Manglende betaling",
      "Unpaid fee",
      "Fiske etter laks, sjøørret eller sjørøye i vassdrag uten betalt fiskeravgift kan gi et overtredelsesgebyr på 3 000 kr.",
      "Fishing for salmon, sea trout or Arctic char in rivers without paying the required fee can result in an administrative penalty of NOK 3,000.",
    ],
    [
      "Under 18 år eller mistet kvitteringen?",
      "Under 18 or lost your receipt?",
      "Barn og unge under 18 år er fritatt for fiskeravgiften. Har du betalt, kan du bestille en ny kvittering hos Miljødirektoratet med e-postadressen du brukte ved betaling.",
      "Anglers under 18 are exempt from the national fee. If you have paid, you can request a replacement receipt from the Norwegian Environment Agency using the email address used for payment.",
    ],
  ],
  disinfection: [
    [
      "Dette må desinfiseres",
      "Equipment to disinfect",
      "Alt utstyr som skal brukes i Mandalselva må desinfiseres før bruk: vadere, håver, stenger, sneller og annet fiskeutstyr. Kravet gjelder også båter, kanoer og motorer.",
      "Disinfect all equipment before use in the Mandalselva: waders, landing nets, rods, reels and other fishing gear. This also applies to boats, canoes and motors.",
    ],
    [
      "Når må det gjøres på nytt?",
      "When must it be repeated?",
      "Desinfiseringen gjelder i 20 dager. Har du besøkt et annet vassdrag, må utstyret desinfiseres igjen før neste fisketur i Mandalselva.",
      "Disinfection is valid for 20 days. After visiting another watercourse, disinfect the equipment again before your next fishing trip in the Mandalselva.",
    ],
    [
      "Ved oppsyn",
      "During an inspection",
      "Ta vare på det stemplede fiskekortet eller desinfiseringsbeviset. Uten gyldig kvittering kan elveeigarlaget ilegge et gebyr på 4 000 kr. Fiskere uten godkjent desinfisering kan også bortvises fra elva.",
      "Keep your stamped fishing permit or disinfection certificate. Without a valid receipt, the river owners’ association may charge a NOK 4,000 fee. Anglers without approved disinfection may also be excluded from fishing in the river.",
    ],
  ],
} as const;

export function DocumentPracticalInformation({ kind }: { kind: "fee" | "disinfection" }) {
  const { language } = useLanguage();
  const fee = kind === "fee";
  return (
    <>
      {information[kind].map(([titleNo, titleEn, textNo, textEn]) => (
        <section className="document-practical-section" key={titleNo}>
          <h3>{selectLocalized(language, titleNo, titleEn)}</h3>
          <p>{selectLocalized(language, textNo, textEn)}</p>
        </section>
      ))}
      <a
        className="document-guidance-source"
        target="_blank"
        rel="noreferrer"
        href={
          fee
            ? "https://www.miljodirektoratet.no/ansvarsomrader/arter-naturtyper/fiske/nar-kan-jeg-fiske-laks-sjoorret-og-sjoroye/betale-fiskeravgift/"
            : "https://lakseelver.no/nb/elver/mandalselva/about"
        }
      >
        {fee
          ? selectLocalized(
              language,
              "Les mer hos Miljødirektoratet",
              "Read more from the Norwegian Environment Agency",
            )
          : selectLocalized(
              language,
              "Se Mandalselvas desinfiseringsregler",
              "Read the Mandalselva disinfection rules",
            )}{" "}
        ↗
      </a>
    </>
  );
}
