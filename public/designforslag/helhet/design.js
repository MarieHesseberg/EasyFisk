/* Standalone visual proposal. No network requests, payments, device location or app storage. */
const pages = [];
const paths = {
  home: '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
  map: '<path d="m3 5 6-3 6 3 6-3v17l-6 3-6-3-6 3Z"/><path d="M9 2v17M15 5v17"/>',
  ticket:
    '<path d="M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4Z"/><path d="M16 7v2m0 3v1m0 3v1"/>',
  doc: '<path d="M5 2h10l4 4v16H5Z"/><path d="M9 8h5M9 12h6M9 16h6"/>',
  more: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  bell: '<path d="M5 17h14l-2-4V8a5 5 0 0 0-10 0v5Z"/><path d="M10 21h4M12 2V1"/>',
  drop: '<path d="M12 2S5 12 5 16a7 7 0 0 0 14 0c0-4-7-14-7-14Z"/>',
  hook: '<path d="M16 5v11a6 6 0 0 1-12 0v-3l3 3"/><circle cx="16" cy="3" r="2"/>',
  people:
    '<circle cx="12" cy="6" r="3"/><path d="M6 21v-5c0-5 12-5 12 0v5"/><path d="M4 4a3 3 0 0 0 0 6M20 4a3 3 0 0 1 0 6M2 20v-4c0-2 1-3 3-3M22 20v-4c0-2-1-3-3-3"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  back: '<path d="m14 5-7 7 7 7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  shield: '<path d="m12 2 9 4-1 10-8 6-8-6L3 6Z"/><path d="m7 11 4 4 6-7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  fish: '<path d="M4 12 1 7v10l3-5c6-9 13-7 19 0-6 7-13 9-19 0Z"/><circle cx="17" cy="10" r=".8"/>',
  camera: '<path d="M3 6h5l2-3h4l2 3h5v15H3Z"/><circle cx="12" cy="13" r="4"/>',
  chart: '<path d="M3 3v18h19M7 17v-5M12 17V7M17 17V3"/>',
  person: '<circle cx="12" cy="6" r="4"/><path d="M4 22v-4c0-8 16-8 16 0v4"/>',
  trash: '<path d="M3 5h18M9 5V2h6v3M5 5l1 17h12l1-17M10 9v8M14 9v8"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7v.1"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 5 10 8L22 5"/>',
};
const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.doc}</svg>`;
const btn = (label, to, style = "primary") => `<a class="${style}" href="#${to}">${label}</a>`;
const row = (name, title, sub, to, color = "") =>
  `<a class="row" href="#${to}"><span class="orb ${color}">${icon(name)}</span><span class="text">${title}${sub ? `<small>${sub}</small>` : ""}</span>${icon("chevron")}</a>`;
const field = (label, value = "", type = "text", help = "") =>
  `<label class="field">${label}<input type="${type}" value="${value}" autocomplete="off" />${help ? `<small>${help}</small>` : ""}</label>`;
const area = (label, value = "") =>
  `<label class="field">${label}<textarea>${value}</textarea></label>`;
const select = (label, opts) =>
  `<label class="field">${label}<select>${opts.map((x) => `<option>${x}</option>`).join("")}</select></label>`;
const choices = (label, opts) =>
  `<p class="field">${label}</p><div class="choice-set" role="group" aria-label="${label}">${opts.map((x, i) => `<button type="button" aria-pressed="${i === 0}">${x}</button>`).join("")}</div>`;
const check = (label, checked = false, id = "") =>
  `<label class="check"><input type="checkbox" ${checked ? "checked" : ""} ${id ? `id="${id}"` : ""} /><span>${label}</span></label>`;
const facts = (items) =>
  `<dl class="facts">${items.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl>`;
const note = (title, detail, style = "") =>
  `<div class="callout ${style}"><strong>${title}</strong>${detail}</div>`;
const card = (html) => `<div class="card">${html}</div>`;
const upload = () =>
  `<div class="upload">${icon("camera")}<label class="plain">Legg til bilde<input type="file" accept="image/*" hidden /></label><p class="small">Valgfritt · bilde eller dokument</p></div>`;
const step = (n, total, context) =>
  `<p class="step-label">${context} · ${n} av ${total}</p><div class="steps" aria-hidden="true">${Array.from({ length: total }, (_, i) => `<span class="${i < n ? "done" : ""}"></span>`).join("")}</div>`;
const success = (heading, text) =>
  `<div class="success">${icon("check")}</div><h1>${heading}</h1><p class="intro">${text}</p>`;
const ticket = (
  status = "Kommende",
  title = "Mandalselva",
  sub = "Sone 3 · Døgnkort",
  to = "permit",
  foot = "Mine fiskekort",
) =>
  `<article class="ticket"><div class="ticket-top"><img src="assets/landscape.png" alt="" /><div class="ticket-copy"><span class="badge">${status}</span><h2>${title}</h2><p>${sub}</p></div></div><a class="ticket-foot" href="#${to}">${foot}${icon("chevron")}</a></article>`;
const map = () =>
  `<div class="map"><svg viewBox="0 0 390 255" aria-hidden="true"><rect width="390" height="255" fill="#eaf0e8"/><path d="M0 50 390 185M30 255 340 0M0 205 390 78" stroke="#fff" stroke-width="9"/><path d="M215-30C60 35 325 90 165 135S290 205 140 290" stroke="#9bcddd" stroke-width="32" fill="none"/><path d="M70 30 315 46 292 205 60 182Z" fill="#9bbb9020" stroke="#698b73" stroke-width="2" stroke-dasharray="7 6"/></svg><a href="#zone" class="zone-marker">Sone 3</a><span>Illustrert kart</span></div>`;
const add = (id, title, group, nav, content, back) =>
  pages.push({ id, title, group, nav, content, back });
const homeRows = () =>
  `<h2 class="section-title">Før du drar</h2>${row("drop", "Desinfisering", "Registrer", "disinfection", "sage")}${row("doc", "Statlig fiskeravgift", "Registrer", "fee")}<hr class="divider" />${row("hook", "Registrer tidligere fisketur", "", "past-trip", "gray")}${row("people", "Meld fra til elveeigarlaget", "", "feedback", "sage")}`;

add(
  "home",
  "Hjem · uten fiskekort",
  "Hjem",
  "home",
  `<img class="hero-river" src="assets/river.png" alt="Illustrasjon av elva med steiner, siv og grønne bredder" />${btn("Kjøp fiskekort", "shop")}${homeRows()}`,
);
add(
  "home-permit",
  "Hjem · med fiskekort",
  "Hjem",
  "home",
  `${ticket("Kommende", "Mandalselva", "Sone 3 · Døgnkort", "permits")}${btn("Kjøp fiskekort", "shop")}${homeRows()}`,
);
add(
  "home-ready",
  "Hjem · klar til å starte",
  "Hjem",
  "home",
  `${ticket("I dag", "Mandalselva", "Sone 3 · Døgnkort", "permits")}${btn("Start fiske", "start-zone")}${btn("Kjøp fiskekort", "shop", "outline")}${row("shield", "Dokumentene er på plass", "Se fiskekort, desinfisering og avgift", "documents", "sage")}<hr class="divider"/>${row("hook", "Registrer tidligere fisketur", "", "past-trip")}${row("people", "Meld fra til elveeigarlaget", "", "feedback", "sage")}`,
);
add(
  "home-active",
  "Hjem · fiske pågår",
  "Hjem",
  "home",
  `<span class="badge sage">${icon("clock")}Fiske pågår</span><h1 class="section-title">God tur ved elva</h1><p class="intro">Mandalselva · Sone 3</p>${card('<p class="muted">Tid på tur</p><div class="timer">01:24:08</div><p class="small">Startet kl. 10.00</p>')}${btn("Registrer fangst", "catch")}${btn("Avslutt fisketuren", "stop", "outline")}${row("ticket", "Mine fiskekort", "Kort og dokumentasjon", "permit")}${row("doc", "Regler for denne sonen", "", "rule-zone")}${row("people", "Meld fra til elveeigarlaget", "", "feedback", "sage")}`,
);

add(
  "map",
  "Kart",
  "Kart og soner",
  "map",
  `<h1>Kart</h1>${select("Vassdrag", ["Mandalselva"])}${map()}${card('<span class="badge">Valgt sone</span><h2 class="section-title">Sone 3</h2><p>Se fiskeområder, kort og lokale regler.</p>' + btn("Se sonen", "zone", "outline"))}${row("map", "Velg sone fra liste", "Et alternativ til kartet", "zone-list")}`,
);
add(
  "zone-list",
  "Velg sone",
  "Kart og soner",
  "map",
  `<h1>Velg sone</h1><p class="intro">Mandalselva</p>${[1, 2, 3, 4].map((n) => row("map", `Sone ${n}`, "Se områder og fiskekort", "zone", n === 3 ? "sage" : "")).join("")}`,
  "map",
);
add(
  "zone",
  "Sonedetaljer",
  "Kart og soner",
  "map",
  `<h1>Sone 3</h1><p class="intro">Mandalselva</p>${map()}${btn("Kjøp fiskekort", "product")}${row("doc", "Regler og fisketider", "For valgt sone og dato", "rule-zone")}${row("people", "Kontakt kortselger", "", "seller", "sage")}${row("ticket", "Korttyper i sonen", "Døgnkort og sesongkort", "shop")}`,
  "map",
);

add(
  "shop",
  "Kjøp fiskekort",
  "Kjøp og egne kort",
  "permits",
  `<h1>Kjøp fiskekort</h1>${select("Sone", ["Sone 3", "Sone 1", "Sone 2", "Sone 4"])}${select("Område", ["Alle områder", "Velg et fiskeområde"])}${card('<span class="badge">Flere dager i én bestilling</span><h2 class="section-title">Døgnkort</h2><p>Velg de enkeltdagene du vil fiske.</p><p><strong>250 kr</strong> per dag</p>' + btn("Velg døgnkort", "product"))}${row("ticket", "Sesongkort", "Se kort og vilkår", "season")}${row("doc", "Registrer rapporteringsdøgn", "For deg med sesongkort", "reporting")}${row("ticket", "Mine fiskekort", "", "permits")}`,
);
add(
  "product",
  "Døgnkort · detaljer",
  "Kjøp og egne kort",
  "permits",
  `<h1>Døgnkort</h1><p class="intro">Mandalselva · Sone 3</p><img class="hero-river" src="assets/river.png" alt=""/>${facts(
    [
      ["Pris per dag", "250 kr"],
      ["Kortinnehaver", "Én fisker"],
      ["Varighet", "Valgte døgn"],
    ],
  )}${btn("Velg fiskedager", "dates")}${row("doc", "Regler for kortet", "Sesong, fisketid og kvoter", "rule-zone")}${row("people", "Kontakt kortselger", "", "seller", "sage")}`,
  "shop",
);
add(
  "season",
  "Sesongkort",
  "Kjøp og egne kort",
  "permits",
  `<h1>Sesongkort</h1><p class="intro">Mandalselva · Sone 3</p>${ticket("Sesong", "Mandalselva", "Sone 3 · Sesongkort", "rule-zone", "Se kortets regler")}${facts(
    [
      ["Kortinnehaver", "Én fisker"],
      ["Gyldighet", "Kortets angitte sesong"],
      ["Rapportering", "Registrer fiskedøgn"],
    ],
  )}${note("Velg sesong", "Pris og tilgjengelighet vises for sesongen du velger.")}${select("Sesong", ["Velg sesong", "Eksempelsesong"])}${btn("Fortsett", "buyer")}`,
  "shop",
);
add(
  "dates",
  "Velg flere fiskedager",
  "Kjøp og egne kort",
  "permits",
  `${step(1, 4, "Kjøp fiskekort")}<h1>Hvilke dager vil du fiske?</h1><p class="intro">Velg én eller flere enkeltdager.</p><h2>Juli 2026</h2><div class="calendar">${["M", "T", "O", "T", "F", "L", "S"].map((x) => `<span>${x}</span>`).join("")}${Array.from({ length: 2 }, () => "<span></span>").join("")}${Array.from({ length: 31 }, (_, i) => `<button aria-label="${i + 1}. juli" aria-pressed="${[18, 19].includes(i + 1)}" data-day="${i + 1}">${i + 1}</button>`).join("")}</div><p class="small">Datoer og priser er eksempler i designforslaget.</p><div id="selected-days" class="date-chips"><span>18. juli</span><span>19. juli</span></div>${card('<p id="day-count">2 døgnkort</p><strong id="day-total">500 kr totalt</strong>')}${btn("Fortsett", "buyer")}`,
  "product",
);
const buyerFields = () =>
  `${field("Fullt navn", "Kari Eksempel")}${field("Fødselsdato", "1990-06-12", "date")}${field("E-post", "kari@example.com", "email")}${field("Telefon", "400 00 000", "tel")}`;
add(
  "buyer",
  "Kjøper og fisker",
  "Kjøp og egne kort",
  "permits",
  `${step(2, 4, "Kjøp fiskekort")}<h1>Hvem skal fiske?</h1><p class="intro">Kontaktinformasjonen er hentet fra profilen.</p><h2>Kjøper</h2>${buyerFields()}${check("Kjøp til noen andre", false, "buy-other")}<div id="recipient-fields" hidden><h2>Fisker</h2><p>Kortet gjelder denne personen.</p>${field("Fiskerens navn")}${field("Fiskerens e-post", "", "email")}${field("Fiskerens fødselsdato", "", "date")}${field("Fiskerens telefon", "", "tel")}</div>${btn("Se bestillingen", "order")}`,
  "dates",
);
add(
  "recipient",
  "Kjøp til noen andre",
  "Kjøp og egne kort",
  "permits",
  `${step(2, 4, "Kjøp fiskekort")}<h1>Kjøp til noen andre</h1>${card("<h2>Kjøper</h2><p>Kari Eksempel<br/>kari@example.com</p>")}<h2>Fisker</h2><p class="intro">Kortet gjelder denne personen.</p>${field("Fullt navn", "Ola Eksempel")}${field("Fødselsdato", "1992-03-10", "date")}${field("E-post", "ola@example.com", "email")}${field("Telefon", "400 00 001", "tel")}${btn("Se bestillingen", "order")}`,
  "buyer",
);
add(
  "order",
  "Kontroller bestilling",
  "Kjøp og egne kort",
  "permits",
  `${step(3, 4, "Kjøp fiskekort")}<h1>Se over bestillingen</h1>${ticket("Bestilling", "Mandalselva", "Sone 3 · 2 døgnkort", "dates", "18. og 19. juli")}${facts(
    [
      ["Kjøper", "Kari Eksempel"],
      ["Fisker", "Kari Eksempel"],
      ["2 × døgnkort", "500 kr"],
      ["Totalt", "500 kr"],
    ],
  )}${check("Jeg har lest vilkårene for kjøpet")}${btn("Gå til betaling", "payment")}${btn("Endre opplysninger", "buyer", "outline")}`,
  "buyer",
);
add(
  "payment",
  "Betaling",
  "Kjøp og egne kort",
  "permits",
  `${step(4, 4, "Kjøp fiskekort")}<h1>Betaling</h1><p class="intro">To døgnkort · Sone 3</p><div class="amount">500 kr</div>${card("<h2>Betal med Vipps</h2><p>Du går videre til betaling og kommer tilbake hit etterpå.</p>")}${btn("Vis fullført betaling", "receipt")}${btn("Vis avbrutt betaling", "payment-error", "outline")}<p class="small">Forhåndsvisning: ingen betaling startes.</p>`,
  "order",
);
add(
  "receipt",
  "Kvittering",
  "Kjøp og egne kort",
  "permits",
  `${success("Fiskekortene er klare", "Du finner begge døgnkortene under Mine fiskekort.")}${ticket("Kjøpt", "Mandalselva", "18. og 19. juli · Sone 3", "permits")}${facts(
    [
      ["Bestilling", "EF–1042"],
      ["Betalt", "500 kr"],
      ["Fisker", "Kari Eksempel"],
    ],
  )}${btn("Mine fiskekort", "permits")}${btn("Til hjemskjermen", "home-permit", "outline")}`,
);
add(
  "payment-error",
  "Betaling avbrutt",
  "Kjøp og egne kort",
  "permits",
  `<h1>Betalingen ble avbrutt</h1>${note("Kjøpet er ikke fullført", "Du kan prøve igjen eller gå tilbake til bestillingen.", "warm")}${facts(
    [
      ["Bestilling", "2 døgnkort"],
      ["Beløp", "500 kr"],
    ],
  )}${btn("Prøv igjen", "payment")}${btn("Tilbake til bestillingen", "order", "outline")}`,
  "order",
);
add(
  "permits",
  "Mine fiskekort",
  "Kjøp og egne kort",
  "permits",
  `<h1>Mine fiskekort</h1><div class="tabs"><a class="selected" href="#permits">Kommende</a><a href="#permit-past">Tidligere</a></div>${ticket("Kommende", "Mandalselva", "18. juli · Sone 3", "permit", "Åpne fiskekort")}${ticket("Kommende", "Mandalselva", "19. juli · Sone 3", "permit", "Åpne fiskekort")}${btn("Kjøp fiskekort", "shop", "outline")}${row("doc", "Registrer et eksisterende kort", "", "manual-permit")}${row("people", "Gjestekort og oppsyn", "", "access", "sage")}`,
);
add(
  "permit",
  "Fiskekort · detaljer",
  "Kjøp og egne kort",
  "permits",
  `<h1>Ditt fiskekort</h1>${ticket("Kommende", "Mandalselva", "Sone 3 · Døgnkort", "control", "Vis ved kontroll")}${facts(
    [
      ["Fisker", "Kari Eksempel"],
      ["Fiskedag", "18. juli 2026"],
      ["Gyldig fra", "18. juli kl. 00.00"],
      ["Gyldig til", "19. juli kl. 00.00"],
      ["Kortnummer", "EF–1042–1"],
    ],
  )}${row("doc", "Regler for kortet", "", "rule-zone")}${row("doc", "Se kvitteringen", "", "receipt")}${btn("Fjern lokalt registrert kort", "delete-item", "outline")}`,
  "permits",
);
add(
  "permit-past",
  "Tidligere fiskekort",
  "Kjøp og egne kort",
  "permits",
  `<h1>Mine fiskekort</h1><div class="tabs"><a href="#permits">Kommende</a><a class="selected" href="#permit-past">Tidligere</a></div>${ticket("Utløpt", "Mandalselva", "12. juli · Sone 3", "trip", "Se fisketuren")}${btn("Kjøp fiskekort", "shop")}`,
  "permits",
);
add(
  "manual-permit",
  "Registrer eksisterende kort",
  "Dokumenter",
  "more",
  `<h1>Registrer fiskekort</h1>${select("Korttype", ["Døgnkort", "Sesongkort", "Grunneierkort"])}${field("Kortinnehaver", "Kari Eksempel")}${field("Kortnummer")}${select("Sone", ["Sone 3", "Sone 1", "Sone 2", "Sone 4"])}${field("Gyldig fra", "", "datetime-local")}${field("Gyldig til", "", "datetime-local")}${upload()}${btn("Lagre kort", "permits")}`,
  "permits",
);
add(
  "reporting",
  "Rapporteringsdøgn",
  "Kjøp og egne kort",
  "permits",
  `<h1>Registrer fiskedøgn</h1><p class="intro">Knyttes til sesongkortet ditt. Ingen betaling.</p>${select("Sesongkort", ["Mandalselva · Sone 3"])}${field("Fiskedato", "2026-07-18", "date")}${choices("Fangststatus", ["Føres senere", "Fangst", "Nullfangst"])}${btn("Registrer døgn", "reporting-done")}`,
  "shop",
);
add(
  "reporting-done",
  "Fiskedøgn registrert",
  "Kjøp og egne kort",
  "permits",
  `${success("Fiskedøgnet er registrert", "18. juli · Sone 3")}${btn("Registrer fangst", "catch")}${btn("Til Mine fiskekort", "permits", "outline")}`,
);
add(
  "seller",
  "Kontakt kortselger",
  "Kjøp og egne kort",
  "permits",
  `<h1>Kontakt kortselger</h1><p class="intro">Mandalselva · Sone 3</p>${card("<h2>Elveeigarlaget</h2><p>Spørsmål om fiskekort, fiskeområder eller lokale regler.</p>")}${row("mail", "Send en henvendelse", "", "feedback")}${row("doc", "Regler for sonen", "", "rule-zone")}`,
  "product",
);

add(
  "documents",
  "Mine dokumenter",
  "Dokumenter",
  "more",
  `<h1>Mine dokumenter</h1>${row("ticket", "Fiskekort", "2 kommende kort", "permits")}${row("drop", "Desinfisering", "Attest registrert", "disinfection", "sage")}${row("doc", "Statlig fiskeravgift", "Kvittering registrert", "fee")}${btn("Vis ved kontroll", "control")}${row("people", "Grunneierkort og tilganger", "", "access", "sage")}`,
  "more",
);
add(
  "disinfection",
  "Desinfisering",
  "Dokumenter",
  "more",
  `<h1>Desinfisering</h1><p class="intro">Registrer dokumentasjonen for utstyret ditt.</p>${card('<span class="badge sage">Registrert</span><h2 class="section-title">Desinfiseringsattest</h2><p>Kari Eksempel · 18. juli</p>')}${btn("Se attesten", "document-detail", "outline")}${btn("Registrer desinfisering", "disinfection-form")}${row("info", "Praktisk informasjon", "Hva du trenger å ha med", "document-info")}`,
  "documents",
);
add(
  "disinfection-form",
  "Registrer desinfisering",
  "Dokumenter",
  "more",
  `<h1>Registrer desinfisering</h1>${field("Navn", "Kari Eksempel")}${field("Dato og tidspunkt", "2026-07-18T08:30", "datetime-local")}${field("Desinfiseringssted")}${field("Attestnummer")}${upload()}${btn("Lagre attest", "disinfection")}`,
  "disinfection",
);
add(
  "fee",
  "Statlig fiskeravgift",
  "Dokumenter",
  "more",
  `<h1>Statlig fiskeravgift</h1><p class="intro">Ta vare på kvitteringen for betalt avgift.</p>${card('<span class="badge sage">Registrert</span><h2 class="section-title">Fiskeravgift 2026</h2><p>Kari Eksempel</p>')}${btn("Se kvitteringen", "document-detail", "outline")}${btn("Registrer fiskeravgift", "fee-form")}${row("info", "Om fiskeravgiften", "", "document-info")}`,
  "documents",
);
add(
  "fee-form",
  "Registrer fiskeravgift",
  "Dokumenter",
  "more",
  `<h1>Registrer fiskeravgift</h1>${field("Navn", "Kari Eksempel")}${select("År", ["2026", "2025"])}${field("Kvitteringsnummer")}${upload()}${btn("Lagre kvittering", "fee")}`,
  "fee",
);
add(
  "document-detail",
  "Dokument · detaljer",
  "Dokumenter",
  "more",
  `<h1>Dokumentasjon</h1><span class="badge sage">Registrert</span>${facts([
    ["Navn", "Kari Eksempel"],
    ["Dokument", "Desinfiseringsattest"],
    ["Registrert", "18. juli 2026"],
    ["Referanse", "AT–1042"],
  ])}${card(icon("doc") + '<h2 class="section-title">Vedlegg</h2><p>attest.jpg</p><p class="small">Forhåndsvisning av dokumentet vises her.</p>')}${btn("Endre opplysninger", "disinfection-form", "outline")}${btn("Slett dokument", "delete-item", "danger")}`,
  "documents",
);
add(
  "document-info",
  "Praktisk dokumentinformasjon",
  "Dokumenter",
  "more",
  `<h1>Før du drar</h1><div class="readable"><h2>Ha dokumentasjonen klar</h2><p>Samle fiskekort, desinfiseringsattest og kvittering for fiskeravgift, slik at de er enkle å finne ved kontroll.</p><h2>Se hva som gjelder lokalt</h2><p>Velg sonen du skal fiske i for å se relevante regler og informasjon om desinfisering.</p></div>${btn("Se lokale regler", "rule-zone")}${btn("Mine dokumenter", "documents", "outline")}`,
  "documents",
);
add(
  "control",
  "Vis ved kontroll",
  "Dokumenter",
  "more",
  `<h1>Dokumentene dine</h1><p class="intro">Kari Eksempel</p>${ticket("I dag", "Mandalselva", "Sone 3 · Døgnkort", "permit", "Se kortdetaljer")}${row("drop", "Desinfiseringsattest", "Åpne dokumentet", "document-detail", "sage")}${row("doc", "Fiskeravgift 2026", "Åpne kvitteringen", "document-detail")}${note("Ha originalene tilgjengelig", "Registrerte opplysninger vises sammen med vedleggene dine.")}`,
  "documents",
);

add(
  "access",
  "Grunneierkort og tilganger",
  "Gjestekort og oppsyn",
  "more",
  `<h1>Grunneierkort og tilganger</h1>${ticket("Grunneier", "Mandalselva", "Sone 3 · Kari Eksempel", "grant", "Tildel tilgang")}${row("people", "Tildelte tilganger", "1 gjestekort", "grant-detail", "sage")}${row("shield", "Tilgang du har fått", "Se mottatt tilgang", "received")}${btn("Registrer grunneierkort", "manual-permit", "outline")}`,
  "documents",
);
add(
  "grant",
  "Tildel gjestekort eller oppsyn",
  "Gjestekort og oppsyn",
  "more",
  `<h1>Tildel tilgang</h1>${select("Grunneierkort", ["Mandalselva · Sone 3"])}${field("Mottakerens navn", "Ola Eksempel")}${field("Mottakerens e-post", "ola@example.com", "email")}${select("Type tilgang", ["Gjestekort", "Oppsyn – uten fiskerett"])}${field("Gyldig fra", "2026-07-18T08:00", "datetime-local")}${field("Gyldig til", "2026-07-18T22:00", "datetime-local")}${note("Tilgangen gjelder Sone 3", "Gyldigheten må være innenfor grunneierkortets område og tidsrom.")}${btn("Se tildelt tilgang", "grant-detail")}`,
  "access",
);
add(
  "grant-detail",
  "Tilgang · detaljer",
  "Gjestekort og oppsyn",
  "more",
  `<h1>Gjestekort</h1><span class="badge sage">Tildelt</span>${facts([
    ["Gjelder", "Ola Eksempel"],
    ["Bruker", "ola@example.com"],
    ["Område", "Mandalselva · Sone 3"],
    ["Fra", "18. juli kl. 08.00"],
    ["Til", "18. juli kl. 22.00"],
    ["Tildelt av", "Kari Eksempel"],
  ])}${btn("Endre tilgang", "grant", "outline")}${btn("Trekk tilbake tilgang", "delete-item", "danger")}`,
  "access",
);
add(
  "received",
  "Mottatt oppsynstilgang",
  "Gjestekort og oppsyn",
  "more",
  `<h1>Din oppsynstilgang</h1><span class="badge">Oppsyn</span>${facts([
    ["Gjelder", "Kari Eksempel"],
    ["Område", "Mandalselva · Sone 3"],
    ["Gyldig", "18. juli kl. 08–22"],
    ["Tildelt av", "Ola Eksempel"],
  ])}${note("Oppsyn – uten fiskerett", "Denne tilgangen dokumenterer oppsynsrollen. Den gir ikke i seg selv rett til å fiske.")}${btn("Vis tilgangsbevis", "control", "outline")}`,
  "access",
);

add(
  "rules",
  "Regler",
  "Regler",
  "rules",
  `<h1>Regler</h1>${select("Sone", ["Sone 3", "Sone 1", "Sone 2", "Sone 4"])}${field("Fiskedato", "2026-07-18", "date")}${row("doc", "Regler for valgt sone", "Sesong, fisketid, størrelse og kvoter", "rule-zone")}${row("ticket", "Regler for mine kort", "", "permit-rules")}${row("clock", "Tidligere regelversjoner", "Se historikk og endringer", "rule-history")}${row("bell", "Siste regelendring", "Les hva som er endret", "rule-change", "sage")}`,
);
add(
  "rule-zone",
  "Lokale soneregler",
  "Regler",
  "rules",
  `<h1>Regler for Sone 3</h1><p class="intro">Mandalselva · valgt fiskedato</p><p class="small">Visningseksempel – fullstendige lokale regler må hentes fra godkjent regelgrunnlag.</p>${["Sesong og fisketid", "Tillatte størrelser", "Personlig fangstkvote", "Redskap og fiskemåte", "Desinfisering"].map((x, i) => `<details ${i === 0 ? "open" : ""}><summary>${x}</summary><p>Her vises ${x.toLowerCase()} for den valgte sonen og datoen, med kilde og gjeldende regelversjon.</p></details>`).join("")}${note("Kort og fangstkvote", "Antall kort som selges og fiskerens personlige fangstkvote vises hver for seg.")}${btn("Regelhistorikk", "rule-history", "outline")}`,
  "rules",
);
add(
  "permit-rules",
  "Regler for mine kort",
  "Regler",
  "rules",
  `<h1>Regler for mine kort</h1>${ticket("Kommende", "Mandalselva", "18. juli · Sone 3", "rule-zone", "Les tilhørende regler")}${row("doc", "Din regelbekreftelse", "Bekreftet versjon vises sammen med kortet", "rule-history")}`,
  "rules",
);
add(
  "rule-history",
  "Regelhistorikk",
  "Regler",
  "rules",
  `<h1>Regelhistorikk</h1><p class="intro">Tidligere versjoner beholdes, slik at du kan se hva som gjaldt da du fisket.</p>${card('<span class="badge sage">Gjeldende eksempelversjon</span><h2 class="section-title">Versjon 2</h2><p>Oppdaterte lokale bestemmelser.</p>' + btn("Se endringer", "rule-change", "outline"))}${row("doc", "Versjon 1", "Tidligere bekreftet", "rule-version")}`,
  "rules",
);
add(
  "rule-version",
  "Tidligere regelversjon",
  "Regler",
  "rules",
  `<h1>Regelversjon 1</h1><span class="badge">Historisk versjon</span>${note("Dette er en tidligere versjon", "Gå til gjeldende regler før en ny fisketur.", "warm")}<h2>Tidligere regeltekst</h2><p>Den arkiverte regelteksten, gyldighetsperioden og kilden vises samlet her.</p>${facts(
    [
      ["Din bekreftelse", "Bekreftet"],
      ["Gjelder for", "Tidligere fisketurer"],
    ],
  )}${btn("Se gjeldende regler", "rule-zone")}`,
  "rule-history",
);
add(
  "rule-change",
  "Ny bekreftelse ved regelendring",
  "Regler",
  "rules",
  `<h1>Reglene er oppdatert</h1><p class="intro">Les endringene før du starter å fiske.</p>${note("Dette er nytt", "En kort, konkret oversikt over endringene vises her sammen med gjeldende regeltekst.")}<div class="readable"><p>Bekreftelsen gjelder denne regelversjonen. Du trenger bare å bekrefte igjen dersom reglene endres.</p></div>${btn("Les reglene", "rule-zone", "outline")}${check("Jeg har lest og godtar denne regelversjonen", false, "accept-rules")}<button class="primary" id="accept-start" disabled>Bekreft og fortsett</button>`,
  "start-check",
);

add(
  "start-zone",
  "Start fiske · velg sted",
  "Fisketur",
  "home",
  `${step(1, 3, "Start fiske")}<h1>Hvor skal du fiske?</h1><p class="intro">Velg sonen og fiskeområdet.</p>${select("Sone", ["Sone 3", "Sone 1", "Sone 2", "Sone 4"])}${select("Fiskeområde", ["Velg område", "Område innenfor kortet"])}${map()}${btn("Fortsett", "start-check")}${btn("Finn sone fra posisjon", "location-fallback", "outline")}`,
  "home-ready",
);
add(
  "location-fallback",
  "Posisjon · manuelt alternativ",
  "Fisketur",
  "home",
  `<h1>Velg fiskested</h1>${note("Posisjon er ikke tilgjengelig", "Du kan velge sone manuelt og fortsette.", "warm")}${select("Sone", ["Sone 3", "Sone 1", "Sone 2", "Sone 4"])}${select("Fiskeområde", ["Velg område", "Område innenfor kortet"])}${btn("Fortsett med valgt sone", "start-check")}`,
  "start-zone",
);
add(
  "start-check",
  "Start fiske · dokumentkontroll",
  "Fisketur",
  "home",
  `${step(2, 3, "Start fiske")}<h1>Før du starter</h1><p class="intro">Mandalselva · Sone 3</p>${row("ticket", "Fiskekort", "Dekker valgt sone og tidspunkt", "permit")}${row("drop", "Desinfisering", "Attest registrert", "disinfection", "sage")}${row("doc", "Fiskeravgift", "Kvittering registrert", "fee")}${row("shield", "Regler", "Ny versjon må bekreftes", "rule-change", "warm")}${btn("Les og bekreft reglene", "rule-change")}${btn("Vis allerede bekreftet", "start-confirm", "outline")}`,
  "start-zone",
);
add(
  "start-blocked",
  "Start fiske · manglende dokument",
  "Fisketur",
  "home",
  `<h1>Litt gjenstår før start</h1>${note("Desinfiseringsattest mangler", "Registrer attesten før du starter fisketuren.", "warm")}${row("drop", "Registrer desinfisering", "", "disinfection-form", "sage")}${row("ticket", "Fiskekort", "Dekker valgt sone", "permit")}${row("doc", "Fiskeravgift", "Registrert", "fee")}${btn("Til hjemskjermen", "home-permit", "outline")}`,
  "start-zone",
);
add(
  "start-confirm",
  "Start fiske · bekreft",
  "Fisketur",
  "home",
  `${step(3, 3, "Start fiske")}<h1>Klar for fisketuren</h1>${facts([
    ["Vassdrag", "Mandalselva"],
    ["Sone", "Sone 3"],
    ["Dokumenter", "På plass"],
    ["Regler", "Bekreftet"],
  ])}${btn("Start fiske", "home-active")}${btn("Endre fiskested", "start-zone", "outline")}`,
  "start-check",
);
add(
  "stop",
  "Avslutt fisketur",
  "Fisketur",
  "home",
  `<h1>Avslutt fisketuren</h1><p class="intro">Mandalselva · Sone 3</p>${card('<p class="muted">Tid på tur</p><div class="timer">01:24:08</div>')}<h2>Fikk du fisk?</h2>${btn("Registrer fangst", "catch")}${btn("Avslutt uten fangst", "trip-summary", "outline")}${btn("Fortsett fisketuren", "home-active", "quiet")}`,
  "home-active",
);
add(
  "trip-summary",
  "Fisketur fullført",
  "Fisketur",
  "home",
  `${success("Takk for turen", "Fisketuren er registrert.")}${facts([
    ["Sted", "Mandalselva · Sone 3"],
    ["Tid", "10.00–11.24"],
    ["Varighet", "1 time og 24 minutter"],
    ["Fangst", "Ingen fangst"],
  ])}${btn("Se turhistorikken", "history")}${btn("Til hjemskjermen", "home-ready", "outline")}`,
);

add(
  "catch",
  "Registrer fangst · art",
  "Fangstrapportering",
  "home",
  `${step(1, 4, "Fangstrapport")}<h1>Hva fikk du?</h1>${choices("Art", ["Laks", "Sjøørret", "Annen art"])}${choices("Resultat", ["Gjenutsatt", "Avlivet"])}${btn("Neste: størrelse", "catch-size")}`,
  "home-active",
);
const catchFields = () =>
  `<div class="two">${field("Lengde (cm)", "65", "number")}${field("Vekt (kg)", "3.2", "number")}</div>${upload()}${area("Kommentar (valgfritt)")}`;
add(
  "catch-size",
  "Fangst · størrelse og bilde",
  "Fangstrapportering",
  "home",
  `${step(2, 4, "Fangstrapport")}<h1>Størrelse og dokumentasjon</h1>${catchFields()}${btn("Se over rapporten", "catch-review")}${btn("Vis eksempel med størrelsesavvik", "catch-deviation", "outline")}`,
  "catch",
);
add(
  "catch-deviation",
  "Avlivet fisk · størrelsesavvik",
  "Fangstrapportering",
  "home",
  `${step(3, 4, "Fangstrapport")}<h1>Fisk utenfor tillatt størrelse</h1>${note("Denne størrelsen er ikke lovlig å avlive", "Vi vet at uhell skjer. Takk for at du rapporterer det som faktisk skjedde.", "warm")}<p>Følg den lokale veiledningen for innlevering. Kontakt elveeigarlaget for avtalt innleveringssted.</p>${row("people", "Lokal veiledning og kontakt", "", "seller", "sage")}${area("Hva skjedde?", "Fisken ble skadet under landing.")}<p class="small">Endelig innleveringstekst må følge den valgte sonens regler.</p>${btn("Fortsett med forklaring", "catch-review")}`,
  "catch-size",
);
add(
  "catch-review",
  "Fangst · se over",
  "Fangstrapportering",
  "home",
  `${step(3, 4, "Fangstrapport")}<h1>Se over fangsten</h1>${facts([
    ["Art", "Laks"],
    ["Resultat", "Gjenutsatt"],
    ["Lengde", "65 cm"],
    ["Vekt", "3,2 kg"],
    ["Sted", "Mandalselva · Sone 3"],
    ["Tidspunkt", "18. juli kl. 11.10"],
  ])}${btn("Registrer fangsten", "catch-done")}${btn("Endre opplysninger", "catch-size", "outline")}`,
  "catch-size",
);
add(
  "catch-done",
  "Fangst · bekreftelse",
  "Fangstrapportering",
  "home",
  `${step(4, 4, "Fangstrapport")}${success("Fangsten er registrert", "Takk for at du rapporterer.")}${btn("Til fisketuren", "home-active")}${btn("Se fangstrapporten", "catch-detail", "outline")}${btn("Avslutt fisketuren", "trip-summary", "quiet")}`,
);
add(
  "catch-detail",
  "Fangstrapport · detaljer",
  "Fangstrapportering",
  "more",
  `<h1>Fangstrapport</h1><span class="badge sage">Gjenutsatt</span>${facts([
    ["Art", "Laks"],
    ["Lengde", "65 cm"],
    ["Vekt", "3,2 kg"],
    ["Sted", "Mandalselva · Sone 3"],
    ["Tidspunkt", "18. juli kl. 11.10"],
  ])}${btn("Rett opp rapporten", "catch-correct", "outline")}${btn("Slett rapport", "delete-item", "danger")}`,
  "history",
);
add(
  "catch-correct",
  "Rett opp fangstrapport",
  "Fangstrapportering",
  "more",
  `<h1>Rett opp fangsten</h1>${choices("Resultat", ["Gjenutsatt", "Avlivet"])}${catchFields()}${area("Hva retter du?")}<p class="small">Tidligere opplysninger og begrunnelse beholdes i rettingshistorikken.</p>${btn("Lagre rettelse", "catch-detail")}`,
  "catch-detail",
);

add(
  "history",
  "Mine fisketurer",
  "Historikk og statistikk",
  "more",
  `<h1>Mine fisketurer</h1><div class="tabs"><a class="selected" href="#history">Turer</a><a href="#catches">Fangster</a><a href="#my-stats">Statistikk</a></div>${row("hook", "18. juli · Sone 3", "1 t 24 min · 1 gjenutsatt laks", "trip")}${row("hook", "12. juli · Sone 3", "2 t 10 min · ingen fangst", "trip", "sage")}${btn("Registrer tidligere fisketur", "past-trip", "outline")}`,
  "more",
);
add(
  "catches",
  "Mine fangster",
  "Historikk og statistikk",
  "more",
  `<h1>Mine fangster</h1><div class="tabs"><a href="#history">Turer</a><a class="selected" href="#catches">Fangster</a><a href="#my-stats">Statistikk</a></div>${row("fish", "Laks · 65 cm", "18. juli · gjenutsatt", "catch-detail", "sage")}${btn("Registrer fangst", "catch", "outline")}`,
  "history",
);
add(
  "trip",
  "Fisketur · detaljer",
  "Historikk og statistikk",
  "more",
  `<h1>18. juli ved elva</h1><p class="intro">Mandalselva · Sone 3</p>${facts([
    ["Start", "10.00"],
    ["Slutt", "11.24"],
    ["Varighet", "1 time og 24 minutter"],
  ])}<h2 class="section-title">Fangster på turen</h2>${row("fish", "Laks · 65 cm", "Gjenutsatt · 3,2 kg", "catch-detail", "sage")}${btn("Endre fisketuren", "past-trip", "outline")}${btn("Slett fisketur", "delete-item", "danger")}`,
  "history",
);
add(
  "past-trip",
  "Tidligere tur · tidspunkt",
  "Historikk og statistikk",
  "more",
  `${step(1, 4, "Tidligere fisketur")}<h1>Når og hvor fisket du?</h1>${field("Dato", "2026-07-12", "date")}${select("Sone", ["Sone 3", "Sone 1", "Sone 2", "Sone 4"])}<div class="two">${field("Fra", "09:00", "time")}${field("Til", "11:10", "time")}</div>${btn("Neste: fangst", "past-catch")}`,
  "home",
);
add(
  "past-catch",
  "Tidligere tur · fangst",
  "Historikk og statistikk",
  "more",
  `${step(2, 4, "Tidligere fisketur")}<h1>Fikk du fisk på turen?</h1>${choices("Fangst", ["Ingen fangst", "Jeg fikk fisk"])}${note("Også turer uten fangst teller", "Registrer turen slik den faktisk var.")}${btn("Se over turen", "past-review")}${btn("Legg til en fangst", "catch", "outline")}`,
  "past-trip",
);
add(
  "past-review",
  "Tidligere tur · se over",
  "Historikk og statistikk",
  "more",
  `${step(3, 4, "Tidligere fisketur")}<h1>Se over fisketuren</h1>${facts([
    ["Dato", "12. juli 2026"],
    ["Sted", "Mandalselva · Sone 3"],
    ["Tid", "09.00–11.10"],
    ["Fangst", "Ingen fangst"],
  ])}${btn("Registrer fisketuren", "past-done")}${btn("Endre", "past-trip", "outline")}`,
  "past-catch",
);
add(
  "past-done",
  "Tidligere tur · bekreftelse",
  "Historikk og statistikk",
  "more",
  `${step(4, 4, "Tidligere fisketur")}${success("Fisketuren er registrert", "Du finner den i turhistorikken din.")}${btn("Se mine fisketurer", "history")}${btn("Til hjemskjermen", "home", "outline")}`,
);
add(
  "my-stats",
  "Min statistikk",
  "Historikk og statistikk",
  "more",
  `<h1>Min statistikk</h1>${select("Periode", ["Denne sesongen", "Alle turer"])}<div class="stat-grid">${[
    ["2", "Fisketurer"],
    ["3 t 34 m", "Tid ved elva"],
    ["1", "Gjenutsatt"],
    ["0", "Avlivet"],
  ]
    .map(([n, t]) => card(`<strong>${n}</strong><small>${t}</small>`))
    .join(
      "",
    )}</div>${row("hook", "Se turhistorikken", "", "history")}${row("chart", "Statistikk for vassdraget", "", "river-stats")}`,
  "history",
);
add(
  "river-stats",
  "Statistikk for vassdraget",
  "Historikk og statistikk",
  "more",
  `<h1>Mandalselva i tall</h1><p class="intro">Illustrerende tall for designforslaget.</p>${select("Sesong", ["2025", "2024", "2023"])}${card('<p>Rapporterte fangster</p><div class="amount">1 240</div><p class="small">Eksempeltall, ikke offisiell statistikk</p>')}<h2>Fangster per sesong</h2><div class="bars" role="img" aria-label="Eksempelgraf for fem sesonger">${[80, 105, 70, 120, 140].map((h, i) => `<div><i style="height:${h}px"></i>${2021 + i}</div>`).join("")}</div>${btn("Min statistikk", "my-stats", "outline")}`,
  "more",
);

add(
  "feedback",
  "Meld fra · beskrivelse",
  "Innmeldinger",
  "more",
  `${step(1, 3, "Meld fra")}<h1>Meld fra til elveeigarlaget</h1>${select("Hva gjelder det?", ["Forsøpling", "Syk fisk", "Mistenkelig fiske", "Feil eller annet"])}${area("Hva har du observert?", "Søppel ved stien ned til elva.")}${field("Hvor?", "Sone 3, ved stien")}${upload()}${btn("Se over innmeldingen", "feedback-review")}`,
  "home",
);
add(
  "feedback-review",
  "Meld fra · se over",
  "Innmeldinger",
  "more",
  `${step(2, 3, "Meld fra")}<h1>Se over innmeldingen</h1>${facts([
    ["Kategori", "Forsøpling"],
    ["Sted", "Sone 3, ved stien"],
  ])}${card("<h2>Beskrivelse</h2><p>Søppel ved stien ned til elva.</p>")}${btn("Vis bekreftelse", "feedback-done")}${btn("Endre", "feedback", "outline")}`,
  "feedback",
);
add(
  "feedback-done",
  "Meld fra · bekreftelse",
  "Innmeldinger",
  "more",
  `${step(3, 3, "Meld fra")}${success("Takk for at du sier fra", "Slik kan bekreftelsen på en innmelding se ut. Ingenting er sendt i dette designforslaget.")}${btn("Se mine innmeldinger", "reports")}${btn("Til hjemskjermen", "home", "outline")}`,
);
add(
  "reports",
  "Mine innmeldinger",
  "Innmeldinger",
  "more",
  `<h1>Mine innmeldinger</h1>${row("people", "Forsøpling ved elva", "18. juli · registrert", "report-detail", "sage")}${btn("Ny innmelding", "feedback", "outline")}`,
  "more",
);
add(
  "report-detail",
  "Innmelding · detaljer",
  "Innmeldinger",
  "more",
  `<h1>Forsøpling ved elva</h1><span class="badge">Registrert</span>${facts([
    ["Dato", "18. juli 2026"],
    ["Kategori", "Forsøpling"],
    ["Sted", "Sone 3, ved stien"],
  ])}<h2 class="section-title">Beskrivelse</h2><p>Søppel ved stien ned til elva.</p>${btn("Slett innmelding", "delete-item", "danger")}`,
  "reports",
);

add(
  "notices",
  "Varsler",
  "Profil og innstillinger",
  "more",
  `<h1>Varsler</h1><p class="intro">Viktig informasjon om fisket ditt.</p>${row("doc", "Reglene er oppdatert", "Les endringene før neste fisketur.", "notice-detail")}<p class="small">Åpnede varsler markeres som lest.</p>${btn("Varselinnstillinger", "preferences", "outline")}`,
);
add(
  "notice-detail",
  "Varsel · les mer",
  "Profil og innstillinger",
  "more",
  `<h1>Reglene er oppdatert</h1><span class="badge sage">Lest</span><div class="readable"><p class="section-title">Det finnes en ny regelversjon for vassdraget.</p><p>Les hva som er endret. Du blir bedt om å bekrefte den nye versjonen når du starter en ny fisketur.</p></div>${btn("Se regelendringene", "rule-change")}`,
  "notices",
);
add(
  "more",
  "Mer",
  "Profil og innstillinger",
  "more",
  `<h1>Mer</h1>${row("person", "Kari Eksempel", "Profil og personvern", "profile", "sage")}${row("shield", "Mine dokumenter", "", "documents")}${row("ticket", "Mine fiskekort", "", "permits")}${row("hook", "Mine fisketurer og fangster", "", "history")}${row("people", "Mine innmeldinger", "", "reports", "sage")}${row("chart", "Statistikk for vassdraget", "", "river-stats")}${row("bell", "Varsler og innstillinger", "", "preferences")}${row("trash", "Slett og tilbakestill", "", "reset", "gray")}${row("info", "Test av statusmotor", "Forhåndsvisning av ulike situasjoner", "status-demo")}`,
);
add(
  "profile",
  "Profil og personvern",
  "Profil og innstillinger",
  "more",
  `<h1>Profil og personvern</h1><div class="avatar">KE</div>${buyerFields()}${btn("Lagre profil", "profile-saved")}${row("shield", "Personvern og dine data", "", "privacy")}`,
  "more",
);
add(
  "profile-saved",
  "Profil · lagret",
  "Profil og innstillinger",
  "more",
  `${success("Profilen er oppdatert", "Opplysningene kan fylles inn automatisk når du kjøper fiskekort.")}${btn("Tilbake til Mer", "more")}`,
);
add(
  "privacy",
  "Personvern og dine data",
  "Profil og innstillinger",
  "more",
  `<h1>Dine opplysninger</h1><div class="readable"><h2>Du har oversikten</h2><p>Se profilopplysninger, registrerte turer, dokumenter og innmeldinger fra menyen.</p><h2>Slett det du ikke trenger</h2><p>Du kan slette enkelte registreringer eller tilbakestille lagrede data i nettleseren.</p></div>${btn("Slett og tilbakestill", "reset", "outline")}`,
  "profile",
);
add(
  "preferences",
  "Varsler og innstillinger",
  "Profil og innstillinger",
  "more",
  `<h1>Innstillinger</h1>${row("doc", "Språk", "Norsk bokmål", "language")}<h2 class="section-title">Varsler</h2><label class="switch-line"><span>Regelendringer<small class="small">Vis viktige oppdateringer</small></span><input type="checkbox" checked /></label><label class="switch-line"><span>Påminnelse om rapportering</span><input type="checkbox" checked /></label>${btn("Lagre innstillinger", "more")}${row("bell", "Se varsler", "", "notices")}`,
  "more",
);
add(
  "language",
  "Velg språk",
  "Profil og innstillinger",
  "more",
  `<h1>Velg språk</h1>${choices("Språk", ["Norsk bokmål", "English"])}${btn("Lagre språkvalg", "more")}<p class="small">Designforslaget viser norske skjermtekster.</p>`,
  "preferences",
);
add(
  "reset",
  "Slett og tilbakestill",
  "Profil og innstillinger",
  "more",
  `<h1>Slett og tilbakestill</h1><p class="intro">Velg hva du vil fjerne fra denne nettleseren.</p>${select("Hva vil du tilbakestille?", ["Alt – start med en tom app", "Fisketurer og fangster", "Dokumenter og tilganger", "Innmeldinger", "Profilopplysninger", "Innstillinger og regelbekreftelser", "Alle kladder"])}${note("Du velger selv omfanget", "Appens kart og regelinformasjon beholdes. Sletting av lokale data opphever ikke kjøp eller innsendte rapporter.", "warm")}${btn("Se hva som slettes", "reset-confirm", "outline")}`,
  "more",
);
add(
  "reset-confirm",
  "Bekreft tilbakestilling",
  "Profil og innstillinger",
  "more",
  `<h1>Tilbakestille appen?</h1><p>Dette fjerner lokale profilopplysninger, turer, fangster, dokumenter, kladder og innstillinger.</p>${note("Slettingen kan ikke angres", "Kontroller at du har tatt vare på dokumenter du trenger.", "warm")}${btn("Vis en helt tom app", "home", "danger")}${btn("Avbryt", "reset", "outline")}<p class="small">I designforslaget vises bare neste skjerm. Ingen data slettes.</p>`,
  "reset",
);
add(
  "delete-item",
  "Bekreft sletting",
  "Tomme sider og andre tilstander",
  "more",
  `<h1>Slette registreringen?</h1><p>Registreringen og eventuelle lokale vedlegg fjernes.</p>${btn("Vis oversikt etter sletting", "empty-history", "danger")}${btn("Avbryt", "history", "outline")}`,
  "history",
);
add(
  "empty-permits",
  "Ingen fiskekort",
  "Tomme sider og andre tilstander",
  "permits",
  `<h1>Mine fiskekort</h1><div class="empty"><span class="orb">${icon("ticket")}</span><h2>Ingen fiskekort ennå</h2><p class="muted">Kortene dine vises her når du har kjøpt eller registrert dem.</p></div>${btn("Kjøp fiskekort", "shop")}${btn("Registrer eksisterende kort", "manual-permit", "outline")}`,
  "more",
);
add(
  "empty-history",
  "Ingen fisketurer",
  "Tomme sider og andre tilstander",
  "more",
  `<h1>Mine fisketurer</h1><div class="empty"><span class="orb sage">${icon("hook")}</span><h2>Den første turen venter</h2><p class="muted">Registrerte fisketurer og fangster samles her.</p></div>${btn("Start fiske", "start-zone")}${btn("Registrer tidligere fisketur", "past-trip", "outline")}`,
  "more",
);
add(
  "empty-reports",
  "Ingen innmeldinger",
  "Tomme sider og andre tilstander",
  "more",
  `<h1>Mine innmeldinger</h1><div class="empty"><span class="orb sage">${icon("people")}</span><h2>Ingen innmeldinger</h2><p class="muted">Her finner du det du har meldt fra om.</p></div>${btn("Meld fra til elveeigarlaget", "feedback")}`,
  "more",
);
add(
  "load-error",
  "Kunne ikke laste inn",
  "Tomme sider og andre tilstander",
  "permits",
  `<h1>Mine fiskekort</h1><div class="empty"><span class="orb warm">${icon("info")}</span><h2>Vi fikk ikke lastet kortene</h2><p class="muted">Prøv igjen. Registreringene dine er ikke endret.</p></div>${btn("Prøv igjen", "permits")}${btn("Til hjemskjermen", "home", "outline")}`,
);
add(
  "form-error",
  "Skjema · manglende opplysning",
  "Tomme sider og andre tilstander",
  "more",
  `<h1>Registrer desinfisering</h1>${note("Sjekk opplysningene", "Fyll inn desinfiseringssted før du lagrer.", "error")}${field("Navn", "Kari Eksempel")}<label class="field">Desinfiseringssted<input aria-invalid="true" aria-describedby="field-error" /><small id="field-error" style="color:var(--red)">Skriv navnet på stedet.</small></label>${field("Dato", "2026-07-18", "date")}${btn("Lagre attest", "disinfection")}`,
  "disinfection",
);
add(
  "status-demo",
  "Test av statusmotor",
  "Tomme sider og andre tilstander",
  "more",
  `<h1>Forhåndsvis situasjon</h1><p class="intro">Velg en tilstand for å se hvordan den forklares.</p>${row("ticket", "Ingen fiskekort", "", "home")}${row("ticket", "Kommende fiskekort", "", "home-permit")}${row("drop", "Dokumentasjon mangler", "", "start-blocked", "sage")}${row("shield", "Klar til start", "", "home-ready")}${row("hook", "Fiske pågår", "", "home-active")}${row("doc", "Reglene er endret", "", "rule-change")}${btn("Til vanlig oversikt", "more", "outline")}`,
  "more",
);

let noticesRead = false;
const groupNames = [...new Set(pages.map((p) => p.group))];
const navItems = [
  ["home", "Hjem", "home"],
  ["map", "Kart", "map"],
  ["shop", "Fiskekort", "ticket"],
  ["rules", "Regler", "doc"],
  ["more", "Mer", "more"],
];
function render() {
  const id = window.location.hash.slice(1) || "home";
  const page = pages.find((p) => p.id === id) || pages[0];
  const screen = document.querySelector("#screen");
  screen.innerHTML =
    (page.back ? `<a class="back" href="#${page.back}">${icon("back")}Tilbake</a>` : "") +
    page.content;
  document.querySelector("#screen-name").textContent = page.title;
  document.title = `${page.title} · EasyFisk designforslag`;
  document.querySelector("#page-picker").value = page.id;
  document.querySelectorAll("#page-list a").forEach((a) => {
    if (a.hash === `#${page.id}`) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  document.querySelector("#bottom-nav").innerHTML = navItems
    .map(
      ([dest, label, name]) =>
        `<a href="#${dest}" ${page.nav === (dest === "shop" ? "permits" : dest) ? 'aria-current="page"' : ""}>${icon(name)}<span>${label}</span></a>`,
    )
    .join("");
  if (page.id === "notices" || page.id === "notice-detail") noticesRead = true;
  document.querySelector("#bell").innerHTML =
    icon("bell") + (noticesRead ? "" : '<span class="unread" aria-hidden="true"></span>');
  screen.focus({ preventScroll: true });
  if (!document.body.classList.contains("capture")) {
    if (window.innerWidth <= 740)
      document.querySelector(".phone").scrollIntoView({ block: "start" });
    else window.scrollTo(0, 0);
  }
  window.currentDesignPage = page.id;
}
document.querySelector("#page-picker").innerHTML = groupNames
  .map(
    (g) =>
      `<optgroup label="${g}">${pages
        .filter((p) => p.group === g)
        .map((p) => `<option value="${p.id}">${p.title}</option>`)
        .join("")}</optgroup>`,
  )
  .join("");
document.querySelector("#page-list").innerHTML = groupNames
  .map(
    (g) =>
      `<h2>${g}</h2>${pages
        .filter((p) => p.group === g)
        .map((p) => `<a href="#${p.id}">${p.title}</a>`)
        .join("")}`,
  )
  .join("");
document.querySelector("#page-picker").addEventListener("change", (e) => {
  window.location.hash = e.target.value;
});
document.addEventListener("click", (e) => {
  const choice = e.target.closest(".choice-set button");
  if (choice) {
    choice.parentElement
      .querySelectorAll("button")
      .forEach((b) => b.setAttribute("aria-pressed", "false"));
    choice.setAttribute("aria-pressed", "true");
  }
  const day = e.target.closest("[data-day]");
  if (day) {
    day.setAttribute("aria-pressed", String(day.getAttribute("aria-pressed") !== "true"));
    const days = [...document.querySelectorAll("[data-day][aria-pressed=true]")].map(
      (b) => b.dataset.day,
    );
    document.querySelector("#selected-days").innerHTML = days
      .map((d) => `<span>${d}. juli</span>`)
      .join("");
    document.querySelector("#day-count").textContent = `${days.length} døgnkort`;
    document.querySelector("#day-total").textContent = `${days.length * 250} kr totalt`;
  }
  if (e.target.closest("#accept-start") && !e.target.disabled)
    window.location.hash = "start-confirm";
});
document.addEventListener("change", (e) => {
  if (e.target.id === "buy-other")
    document.querySelector("#recipient-fields").hidden = !e.target.checked;
  if (e.target.id === "accept-rules")
    document.querySelector("#accept-start").disabled = !e.target.checked;
  if (e.target.type === "file") {
    const el = document.querySelector("#toast");
    el.textContent = "Bildet er valgt i forhåndsvisningen. Ingenting lastes opp.";
    el.classList.add("visible");
    setTimeout(() => el.classList.remove("visible"), 3500);
  }
});
if (new URLSearchParams(window.location.search).has("capture"))
  document.body.classList.add("capture");
window.addEventListener("hashchange", render);
new ResizeObserver(([entry]) => {
  document.documentElement.style.setProperty(
    "--nav-space",
    `${entry.target.getBoundingClientRect().height}px`,
  );
}).observe(document.querySelector("#bottom-nav"));
window.designPages = pages.map(({ id, title, group }) => ({ id, title, group }));
render();
