# EasyFisk: questions to clarify before the next stage

Prepared 10 September 2026 from the current app source, domain rules, product research, architecture notes, and existing test scenarios. This is a product discovery review, not a fresh verification of fishing regulations or a live usability test. Rule values below describe what the prototype currently assumes; the responsible river managers should confirm the correct interpretation.

Use this as a question bank, not one long questionnaire. Start with the priority questions, then choose the relevant topics for each person. Ask fishermen about actual trips before showing the app, so our existing design does not shape all their answers.

## First meeting: the 12 decisions with the biggest consequences

| Ask                        | Question                                                                                                                                                            | Why it matters now                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Employer                   | What is the main outcome for the first release: easier reporting, permit sales, compliance guidance, or better fishing-effort data? What would demonstrate success? | The app currently serves all four. We need a basis for prioritizing.                         |
| Employer + river managers  | Is EasyFisk an official reporting/permit channel, or a companion to existing systems? Who has agreed to accept its records?                                         | Determines integrations, receipts, ownership, and what the app can promise.                  |
| Employer + river managers  | What exactly should “Du er klar til å fiske” guarantee, and when should the answer instead be “we cannot verify this”?                                              | The normal status calculation uses local documents and catches; it has no live closure feed. |
| River managers + sellers   | Does a fishing day for quotas reset at midnight, at 18:00, or according to the permit? Please work through catches at 17:50, 18:10, 23:50, and 00:10.               | The quota code uses Norwegian calendar days, while some permits cross midnight.              |
| River managers + sellers   | What precise stretch, riverbank, subzone, and fishing method does each permit allow?                                                                                | The current start flow primarily checks the main zone.                                       |
| Employer + fishermen       | Must fishermen start and stop a session, or should they be able to report a catch directly?                                                                         | The present reporting model is organized around sessions.                                    |
| River managers + fishermen | Which measurements are truly required for released fish, and may they be estimated or unknown?                                                                      | Both positive length and weight are currently required.                                      |
| Employer + fishermen       | What must work with no signal, a closed app, or a dead phone, and what counts as a report delivered on time?                                                        | Local saving and official receipt are different events.                                      |
| River managers             | What happens after each killed/released daily or season quota is reached? Does all fishing stop, or only certain activity?                                          | Daily limits currently block starting; season limits produce a warning.                      |
| Employer + sellers         | Will we sell permits ourselves, integrate with a seller, or send users to an existing checkout?                                                                     | The current shop simulates prices, availability, payment, and issuance.                      |
| Employer + river managers  | Who publishes rule changes and closures, approves translations, and responds when the information is wrong?                                                         | These need operational ownership, not just screens.                                          |
| Employer + fishermen       | Who can see identity, catches, locations, photos, and effort data, and what sharing is optional?                                                                    | Privacy choices affect trust, account design, and statistics.                                |

## 1. Purpose, audience, and launch scope

Current direction: a mobile-oriented Mandalselva app combining documents, a permit shop, map, rules, fishing sessions, reporting, statistics, and observations. There is no real account or administrative service in the current prototype.

**Ask your employer**

- Who is the primary user for the first release: local regulars, visiting anglers, first-time salmon fishermen, guides, families, or river management?
- What is the most costly or frustrating problem in the current process? Can we see a real example and how often it happens?
- Which three things must the first release do well, and which existing features can wait?
- Is Mandalselva the intended long-term scope, or a pilot for several rivers? Which pilot season and participating areas are we planning for?
- Who pays for running the app, customer support, integrations, and annual rule/product updates?
- What evidence would justify moving beyond the prototype: completed reports, less administrative work, successful purchases, repeat use, or something else? What is the baseline?

**Ask fishermen**

- “Talk me through your last trip, from deciding where to fish until you had finished all the reporting.”
- “Which websites, apps, paper documents, and people did you use? Where did you enter the same information twice?”
- “What went wrong or took longer than it should? Show me if you can.”
- “Which part would need to improve for you to use another app on your next trip?”

## 2. Home screen, navigation, and starting a session

Current choice: a prominent start/stop flow; starting takes four steps: status, position, zone, and rule confirmation. Catch activity and history sit under Statistics. The position step in this flow currently advances without obtaining GPS; the map has a separate real position request.

**Ask your employer / river managers**

- Is starting a session an official obligation, an optional diary feature, or a way to measure fishing effort?
- Should missing documents prevent recording a session, or prevent only a positive readiness indication? How should someone record fishing that already happened without the right documentation?
- Does every session require accepting the rules again, or only the first visit and whenever relevant rules change?
- What counts as fishing time: active casting, breaks, travel between pools, or the entire visit? Is a pause function needed?
- When a permit expires, a quota is reached, or a closure arrives during an active session, what should the app tell the user and record?

**Ask fishermen**

- “Show me where you would go to report a fish, find your permit, and see yesterday’s trip.” Do this without naming a tab.
- “Imagine arriving at your usual spot. Start fishing in the app. Which steps seem necessary, repetitive, or unclear?”
- “When would you realistically remember to start and stop this timer?”
- “What happens on a typical trip when you change pools or zones, take a long break, or fish past midnight?”
- “You already reported your fish and now want to leave. What would you press?” The current stop screen asks whether there was a catch, with a no-catch option and an option to register a missing catch; test whether this is confusing.

## 3. Readiness, rules, quotas, and exceptions

Current choice: self-entered documents can satisfy readiness. Salmon quotas are calculated from catches on this browser. Daily quota reached blocks starting; season quota reached warns. One active 2026 rule version is used, including when evaluating historical catches. Temperature and closure scenarios are demonstrations.

**Ask river managers, with your employer responsible for the resulting product decision**

- Which checks are advisory, which must block starting, and which may be acknowledged and overridden? What should happen when a check is unavailable?
- Should the wording distinguish “documents recorded,” “documents verified,” and “fishing currently permitted”? Which phrase would you approve for the home screen?
- How do we obtain catches reported outside EasyFisk so the quota balance is complete? What should we display until that information is available?
- Confirm the quota reset time and whether changing permit, zone, or reporting number changes anything about a personal quota.
- Confirm the exact consequences separately for killed salmon, released salmon, and sea trout, at both daily and season limits. The research notes mention a sea-trout daily limit, while current quota calculations count salmon.
- How should the single larger-salmon allowance be tracked across the season? What happens if it has already been used? The current size validator does not inspect previous catches when describing the allowance as available.
- How should a fish exactly at a size boundary be treated? In particular, clarify “under 65 cm” versus “up to 65 cm,” including measurement rounding.
- Which rule version applies to a June catch entered after an August rule change? How do earlier catches contribute to revised season quotas?
- Which gear, bank, subzone, species, and date exceptions must the startup summary include? It currently presents a common gear/rule summary beneath a zone-specific title.
- What is the authoritative source for temperature closure and reopening? Is a measurement sufficient, or is a manager’s closure decision required?
- Are selling restrictions, fishing closures, and permit cancellations separate states? What should each do to already purchased permits?
- How should accidental killing, an injured fish that cannot be released, suspected farmed fish, and species outside the ordinary categories be recorded and assessed?

**Ask fishermen**

- “What do you understand the green, yellow, and red statuses to mean? What would you still check yourself?”
- “Tell me about a rule you were unsure about recently. How did you resolve it?”
- “If the app disagrees with a sign or a message from the river manager, what would you do?”

## 4. Permits, sales, and payment

Current choice: a native prototype shop with day/week/season/group products, dated product information, simulated availability/payment, buyer details, and saved local orders. Some products route to seller contact. The existing research already records unresolved prices, product coverage, capacities, and validity calculations.

**Ask your employer and permit sellers**

- Which sellers have agreed to participate, and who is responsible for selling and issuing each permit?
- Can they provide an approved complete product list with stable identifiers, exact coverage, capacities, prices, fees, age rules, sale windows, validity, and terms?
- Resolve the documented zone 1 contradiction: does a single permit cover the whole zone, or do the separate fisheries require separate permissions?
- For “optional start” day permits, does the buyer choose a start time, activate the permit on arrival, or receive a calendar-day permit? Confirm opening-day exceptions and week permits crossing season end.
- What does capacity count: permits, named fishermen, rods, boats, or simultaneous users? How is capacity shared with physical sellers and other websites?
- What should happen when two people try to buy the last available permit, or payment succeeds but issuance fails?
- Can users reserve, change dates, transfer a permit, cancel, or receive a refund? What happens during closures, low water, and stopped sales?
- Which payment methods and receipt details are needed for the intended users, including foreign visitors?
- Is the buyer necessarily the fisherman? How do buying for someone else, guides, and family purchases work?
- Are full birth date, email, and telephone all necessary? What identifying information does the issuer actually require?
- How do youth permits and fee exemptions differ, especially for an 18-year-old? Can free permissions be issued digitally?
- Which landowner, guest, boat, and restricted products belong in the first release, and how is eligibility established?

**Ask fishermen**

- “How did you choose and buy your last permit? What did you need to know before paying?”
- “Do you normally choose a fishing place first, or look for an available permit first?”
- “Show me how you would check which bank and stretch this permit covers, its start/end times, and how many people may use it.”
- “When plans change, what do you expect the seller to let you do?”

## 5. Group permits and daily reporting cards

Current choice: group checkout collects names. Season-permit reporting days are separate local records with pending/catch/no-catch status. Those records do not themselves contain the individual catch reports.

**Ask sellers and river managers**

- Does every participant need an account, personal reporting number, and their own permit view? Can the buyer distribute access to the others?
- Who reports for a group: each fisherman, a leader, or a guide? How do individual quotas stay separate?
- Can the participant list change after purchase or after fishing starts? Who may authorize that?
- Must the season-permit reporting card be obtained before fishing, and should a missing daily card affect readiness?
- What is the relationship between one reporting day, several sessions, multiple areas, and individual catches?
- Should ending the final session automatically complete the reporting day? Who can correct a day marked no-catch when a catch is added later?
- Must unused permits be reported as “did not fish,” separately from “fished without catching”? What deadlines apply to each?

**Ask fishermen**

- “If you hold a season permit, show me everything you currently do for each day you fish.”
- “When fishing as a group, who handles the paperwork and how do the others get their documents?”
- “Would ‘fishing session,’ ‘fishing day,’ and ‘reporting card’ mean different things to you? Explain them in your own words.”

## 6. Documents, disinfection, identity, and inspections

Current choice: a local document folder with optional attachments and manually entered validity. Document readiness is not external verification. Disinfection uses a 20-day window and a later-other-river field. Fee categories include individual, family, under-18 exemption, and dispensation.

**Ask river managers, inspectors, and disinfection providers**

- What evidence do inspectors actually accept: original issuer view, downloaded document, photo, paper, or a verifiable code? What should EasyFisk display at an inspection?
- Can permit, fee, and disinfection records be imported or verified from their issuers? Who may issue or revoke a record?
- How do we establish that all documents belong to the person fishing, including family fee coverage and group members?
- Is disinfection validity attached to a person, named equipment, or an equipment set? What happens when only some equipment has been used elsewhere?
- Does visiting another river invalidate the record, or specifically using equipment there? How should fishermen declare the event?
- What precise expiry time applies, and can the rules differ by station, equipment, or season?
- What information must remain available offline during an inspection, and how should expired or revoked evidence appear?

**Ask fishermen**

- “Show me the documents you normally carry and where they come from.”
- “How often do you switch rivers, borrow equipment, or use more than one equipment set?”
- “Could you find the right document quickly if an inspector approached now?”
- “Would uploading these documents feel useful, repetitive, or uncomfortable? Which details would you not want stored?”

## 7. Catch reporting and truthful error handling

Current choice: salmon, sea trout, or other species; killed or released; positive length and weight; optional photo/comment. Current catch time comes from the flow. Possible size violations can still be recorded. Corrections attach a note rather than updating the original measurements or quota calculation.

**Ask river managers and whoever receives reports**

- Which fields are officially mandatory, and which are only useful for research? Obtain the actual report form or data specification.
- Are estimated or unknown weight/length acceptable, especially for released fish? Should we distinguish measured from estimated values?
- Is the required time the landing time, release time, or reporting time? May a fisherman adjust the automatically suggested time?
- Is a main zone sufficient, or do reports require subzone, bank, permit, and personal reporting number?
- Is “other species” sufficient, or do you need explicit species and an “unsure” option? Are sex, gear, fin clipping, or samples relevant?
- What counts as meeting the reporting deadline offline: local capture, attempted sending, or confirmed receipt? What should the user do if the receiving service is down?
- Should potentially noncompliant catches always be accepted as factual reports? Who reviews them, and what language avoids presenting an unreviewed flag as a final finding?
- Can a fisherman correct species, outcome, size, time, or zone directly? When is approval required, and when should quota balances change?
- How are duplicate reports detected, including a fish reported through another service? Can a user withdraw an accidental duplicate?
- What evidence of successful delivery should be shown: receiver, timestamp, report number, and status? What should “pending” and “rejected” mean?

**Ask fishermen**

- “Describe exactly what you do in the first few minutes after landing and releasing a fish.”
- “Which of these fields could you answer accurately then? What would you guess or leave blank?”
- “Try reporting a fish with one hand. Where would you need to stop and think?”
- “You entered the wrong weight. Show me how you would correct it, and what you expect to happen to your record.”
- “Would wording about a possible rule violation make you less likely to report honestly? What wording would be clearer?”

## 8. Past trips, no-catch reports, and history

Current choice: past trips have a date, start/end time, zone/subzone, and optional multiple catches. Both times currently use the same selected date. Historical checks use the active season. Session history and individual catches are linked; a separate reporting-day system also exists.

**Ask your employer / river managers**

- How far back can people report, including previous seasons? What should happen when older rules or permit data cannot be verified?
- Should an out-of-season or undocumented historical trip be recordable with a flag rather than rejected?
- How should an overnight trip, overlapping sessions, or a forgotten running timer be corrected?
- Is no-catch reporting required per session, permit, fishing day, area, or person? What prevents duplicate effort records?
- Can people edit or delete completed sessions? Which changes need a history of who changed what?

**Ask fishermen**

- “How often do you report after getting home? What details can you still remember reliably?”
- “Would you enter start/end times if you caught nothing? What would make you keep doing it?”
- “What do you want to find again later: a permit, a catch photo, hours fished, a location, or a submitted report?”

## 9. Map, location, and practical river information

Current choice: an advisory map of four main zones with position lookup and permit listings. Main-zone selection is not the same as validating exact fishing rights. The startup text promises one-time position use rather than continuous tracking.

**Ask river managers and sellers**

- Who can provide and approve precise boundaries, riverbank rights, restricted stretches, and access routes? How will updates reach us?
- Can a permit authorize only one bank, part of a subzone, or boat fishing? How should that look on the map?
- What should the app do near a boundary or with inaccurate GPS: suggest an area, request confirmation, or show uncertainty?
- Which practical places belong on the map: parking, access paths, disinfection stations, boat launches, accessible fishing places, or closed routes? Who maintains them?
- Do we need to save any coordinates, or is the selected zone sufficient for the agreed purpose?

**Ask fishermen**

- “Show me how you would identify where this permit lets you fish on both sides of the river.”
- “When have maps or signs left you unsure where you may go?”
- “Would you allow one-time location access? Would saving a catch location change your answer?”
- “What map information do you need before arriving, and what do you need standing beside the river?”

## 10. Alerts, closures, and observations

Current choice: notification preferences exist, but no live alert service. Observation categories include suspicious fishing, sick/dead fish, environmental problems, obstructions, and information errors. The observation submission currently simulates success rather than delivering a report.

**Ask your employer and the receiving organization**

- Who receives each observation category, during which hours, and who covers absence? What response can users reasonably expect?
- Which situations need a direct telephone/emergency route rather than a form? Who approves that routing and the contact details?
- Can reports be anonymous, or can users optionally allow follow-up? What location/photo information is necessary?
- Should users see received, under review, and resolved states? Who updates them?
- Which alerts apply to an active session, owned permits, a chosen zone, or the entire river?
- How are closure messages approved, corrected, and withdrawn? How quickly must they reach people already fishing?
- What should happen if notifications are disabled or unavailable? Is in-app information enough, or is another delivery channel required?
- How can the app remind someone about an unreported fish it does not yet know about? Would a quick “caught a fish” marker or a session-end reminder fit the intended workflow?

**Ask fishermen**

- “How do you currently hear about closures or rule changes? Tell me about a message you missed.”
- “Which alerts would be useful enough to keep enabled, and which would make you turn them off?”
- “Would you report suspicious fishing through this form? What would you need to know about who sees your identity?”

## 11. Statistics and data sharing

Current choice: general statistics show a stored river-wide historical dataset; personal statistics use local sessions and catches, including catches per ten hours. The setting for sharing anonymized effort data currently defaults to enabled, but no sharing service is connected.

**Ask your employer / river managers**

- What management decision will fishing-effort statistics support? What accuracy and completeness are needed?
- Should reports be public immediately, delayed, or aggregated? Which fields must never be public?
- How much geographic and time detail can be shared without revealing individual fishermen or favored fishing spots?
- Should optional data sharing start off until the user chooses it? How do we distinguish required reporting from optional research use?
- What counts in “catch per ten hours”: released fish, all species, active sessions, breaks, and estimated historic effort?
- Who supplies and updates official totals, and how do we distinguish provisional numbers from final statistics and personal records?

**Ask fishermen**

- “Which statistics would you actually return to look at, and what would you use them for?”
- “What would you be comfortable sharing: catch count, size, approximate area, exact spot, time, photo, or hours fished?”
- “Would knowing that other people could infer your fishing spot change what you report?”

## 12. Accounts, connectivity, language, and field use

Current choice: browser-local data and attachments, a prototype identity, Norwegian and English interfaces, and stored preferences. Local persistence does not establish offline availability of the whole app or synchronization between devices.

**Ask your employer**

- What is the minimum identity needed, and what sign-in method works for foreign visitors as well as Norwegian residents?
- Should reading rules/maps be possible without an account? At which action does identification become necessary?
- What must survive a lost phone, browser clearing, or device change? Is import/export of personal records needed?
- Which actions must work offline: opening documents, viewing maps/rules, starting/stopping, recording catches, or queuing reports? How long may downloaded information be trusted?
- Who owns the stored records, handles access/deletion requests, and decides retention periods for reports, purchases, photos, and observations?
- Which languages are required for launch, and who approves translations of rule wording and permit terms?
- What is the supported delivery format: mobile website, installable web app, or app-store app? Which actual devices must the pilot support?

**Ask fishermen**

- “Where do you lose reception, and for how long? What do you do with documents and reporting then?”
- “Do you share a phone, fish without one, or help someone else report?”
- “What becomes difficult with wet hands, gloves, bright sunlight, poor eyesight, or low battery?”
- “What language would you choose? Which Norwegian fishing terms still need an explanation?”
- “Would you use this through a web link, or expect to install an app? What would stop you completing setup?”

## Existing choices to explicitly approve or change

These are observable implementation choices, not confirmed stakeholder requirements.

| Current choice or gap                                                  | Decision to record                                            | Source                                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------- |
| Four steps before a session; repeated rule acceptance                  | Required checks versus a shorter repeat-visit flow            | `features/fishing-session/fishing-flow.tsx`                     |
| Startup position button advances without requesting location           | Whether GPS belongs in startup and what the button promises   | `features/fishing-session/fishing-flow/steps/position-step.tsx` |
| Permit area text resolves to a main zone                               | Exact rights model before relying on permission checks        | `domain/documents/get-permit-zones.ts`                          |
| Local document and salmon-quota readiness; no live closure check       | Meaning of ready, unverified, and unavailable                 | `domain/fishing-rules/resolve-status-engine.ts`                 |
| Norwegian calendar-day quota counting                                  | Official definition of fishing day                            | `domain/quotas/get-fishing-start-quota-status.ts`               |
| Season quota is a warning; daily quota blocks start                    | Correct actions for each species/outcome/limit                | `domain/fishing-rules/resolve-status-engine.ts`                 |
| Size validator describes larger-salmon allowance without catch history | How prior allowance use and exact boundaries are assessed     | `domain/catches/validate-catch.ts`                              |
| Both length and weight required for every catch                        | Minimum report data and unknown/estimated measurements        | `domain/catches/validate-catch.ts`                              |
| Catch correction is a note                                             | Correction approval, record revision, and quota recalculation | `features/catch-report/catch-report-detail.tsx`                 |
| Reporting days and session/catch records are separate                  | How one satisfies the other without double reporting          | `domain/fishing-permits/permit-reporting-day.ts`                |
| Permit defaults use calendar days; week means selected day plus six    | Confirm actual seller validity semantics                      | `domain/fishing-permits/calculate-permit-validity.ts`           |
| Historical entry uses one date for start/end and active rules          | Overnight trips and historical rule versions                  | `features/history/hooks/use-past-session-controller.ts`         |
| Catch/history functions under Statistics                               | Whether fishermen can find the most frequent action           | `features/statistics/statistics-screen.tsx`                     |
| Optional anonymous-effort sharing defaults on                          | Explicit sharing defaults and explanation                     | `domain/preferences/preferences.ts`                             |
| Observation form has simulated submission                              | Recipient workflow and honest delivery states                 | `features/feedback/hooks/use-feedback-controller.ts`            |

## A practical way to run the conversations

**Employer/manager meeting, about 45–60 minutes:** start with the 12 priority decisions. Bring in a seller for permit rules and someone who receives reports for reporting semantics. Ask for real examples: a permit, group member list, daily reporting card, report correction, closure notice, and inspection checklist. Give unresolved items a named owner rather than guessing.

**Fisherman conversation, about 25–35 minutes:** begin with their last actual trip. Then let them try the prototype without explaining where buttons are. Use several different perspectives: a regular season-permit holder, a visitor, a group organizer, and someone who finds mobile apps difficult.

Suggested tasks:

1. Find a permit for a particular stretch and explain exactly where and when it is valid.
2. Find the documents you would show an inspector.
3. Start a session at your usual spot and explain what the readiness status means.
4. Report a released fish when you do not know its weight.
5. End a session after already reporting a catch; then try a trip without a catch.
6. Register yesterday’s trip, then explain how you would correct a wrong entry.
7. Explain what you would expect if there were no signal or a closure appeared.

Record whether they complete each task unaided, where they hesitate, what they think happened, and what they would do next. Scenario discussion about connectivity is not a substitute for a later real offline test.

Finish with: “What would make you avoid this app?” and “Which one change would make this worth using on your next trip?”

For every decision, keep a short record:

| Topic                      | Current assumption | Confirmed answer/example     | Person responsible | Keep/change/defer | Needed before          | Follow-up date |
| -------------------------- | ------------------ | ---------------------------- | ------------------ | ----------------- | ---------------------- | -------------- |
| Example: fishing-day reset | Norwegian midnight | Pending manager confirmation | To assign          | Undecided         | Production quota logic | To assign      |

The next implementation priorities should follow these answers. In particular, settle the official role, exact permit rights, quota/day definitions, reporting requirements, and offline delivery expectations before treating the prototype's existing flows as final requirements.
