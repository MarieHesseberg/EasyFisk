"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

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
  ["Dokumentasjon og status", "Documents and status"],
  ["Mine dokumenter", "My documents"],
  ["Desinfisering", "Disinfection"],
  ["Statlig fiskeravgift", "National fishing fee"],
  ["Ingen registrert – legg til dokumentasjon", "Not registered — add documentation"],
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
  }
  return `${leading}${translated}${trailing}`;
}

function localizeElement(root: ParentNode, language: AppLanguage) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  while (node) {
    const parent = node.parentElement;
    if (parent && !["SCRIPT", "STYLE"].includes(parent.tagName)) {
      if (!originalText.has(node)) originalText.set(node, node.nodeValue ?? "");
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
  const [language, setLanguage] = useState<AppLanguage>("no");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved !== "en") return;
    const timeout = window.setTimeout(() => setLanguage("en"), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, language);
    document.documentElement.lang = language === "en" ? "en" : "no";
    localizeElement(document.body, language);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const addedNode of mutation.addedNodes) {
          if (addedNode instanceof Element) localizeElement(addedNode, language);
          else if (addedNode instanceof Text && addedNode.parentNode)
            localizeElement(addedNode.parentNode, language);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
