# Farmer story release

Based on Production `7aacd0b5ddac58334bf636d87149eb7c832aa6bf`. New rollback checkpoint: `checkpoint/pre-farmer-story-20261029`. No database migrations, destructive operations or changes to recommendation, planning, eligibility or logistics engines.

The existing `/{locale}/demo` now starts with STIR entry, then farm/plot selection and one scrollable story: land (stage 1), district (stage 3), market (stage 4). No additional DEMO route was created. `/uz/demo` uses Uzbek Latin; existing locale routes have translated content. Animations are finite, progress starts when viewed, reduced-motion preferences are respected. Map is optional and loads on disclosure, not needed for farm lookup.

DEMO-STIR `123456789` is an application-only presentation alias anchored to existing cadastral `11:10:000005739`. It selects the existing G'ALABA CLUSTER farm by farm ID and its two pilot plots, total 130.44 ha. Real tax IDs and persisted records are never replaced. Other tax IDs return a demo-specific not-found message. This is not a production taxpayer-directory search.

Suitability comes from the unchanged calculation module. At 40.4 ha the actual TOP-3 is Mosh 100, Loviya 99, Karam 98; potato is available under other eligible crops at 95. It is not relabeled as TOP-3. Reasons, exclusions, partial water and missing rotation come from the computed result. Scenario bonitet/water/previous crop are explicitly DEMO; registry facts remain separately inspectable, with missing values left unknown.

District display reuses the existing internal regional DEMO (not the six-pilot planning scope): 16,600/20,000 ha = 83%, unknown remainder 3,400 ha. Potato area 1,200 ha × 24 t/ha = 28,800 t; 200,000 people × 140 kg/person ÷ 1,000 = 28,000 t; balance +800 t. Missing regional crop forecasts stay unavailable. The separate actual pilot-plan coverage is shown only in a labeled disclosure and stays at its independently calculated value.

Buka potato figures are new internal presentation assumptions: 50,000 people × 140 kg/person = 7,000 t demand; 262.5 ha × 24 t/ha = 6,300 t production; deficit 700 t. The existing `proposeTransfers` module evaluates the scenario with empty road/confirmed-flow evidence. No exact kilometers, minutes, allocated shipment or guaranteed buyer is displayed. Piskent surplus does not automatically close Buka's deficit.

Verification: TypeScript, ESLint, five unit suites (recommendation, modernization, presentation, regional, farmer story), production build, isolated PostGIS integration, browser journey at 1440/768/375 px in three languages, STIR validation, farm/plot/crop selection, reasons, coverage and neighboring-market rendering. Main and regional routes, public viewing, all six plots, plans and write protection are regression checked. Only isolated local test data is written by integration tests. Production verification uses reads plus rejected unauthenticated empty POST requests.
