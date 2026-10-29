# Decision surface — complete redesign

Checkpoint: `checkpoint/pre-decision-surface-20261029`, based on Production `717edae03a7b00a555fd8b1db2605f73703b8175`.

## Design system

New `/uz/demo` composition: compact identity header, continuous analysis timeline, one dominant recommendation hero with all reasons inside, a single secondary recommendation rail, thin dividers, warm neutral workspace, deep green typography, gold first-rank/forecast accents and red actual deficit/surplus warnings. Four transparent editorial crop images replace line icons. Default example is G'ALABA CLUSTER, cadastral 11:10:000234163, 90.04 ha. STIR 123456789 remains an application-only mapping in the change-farm dialog; real records are not rewritten. Three analysis levels remain bound to the same selected plot.

Visible copy contains no DEMO labels or AI-confidence claims. The source dialog states that the analytical scenario is conditional, not official statistics or current market prices. Metadata explicitly retains `INTERNAL_DEMONSTRATION` and `official: false`. Prices always carry PROGNOZ. Export and neighboring need never imply buyers, contracts, routes or allocated shipments. Initial partial-water explanations never cite district data.

## Production boundary and scoring

No production recommendation/planning engine, API handler, repository, migration, database record, existing regional dashboard data or write authorization was changed. `evolving-scenario.ts` is only imported by the presentation page. Its four-crop illustrative catalog is MOSH, KARAM, PIYOZ, KARTOSHKA; the unchanged production engine still evaluates the full production catalog elsewhere.

The agricultural basis comes from the existing pilot scenario: bonitet 68, water MEDIUM, previous crop BUGDOY, 90.04 ha. Hard eligibility remains mandatory. For this example, agronomic scores are Mosh 100, Piyoz 96, Karam 82, Kartoshka 81. Karam and potato have partial water suitability, explicitly shown; their conditions are not called unconditionally sufficient.

Let A be the unchanged agronomic score; D = clamp(70 + 4 × ((demand − production) / demand × 100), 0, 100). M is an explicitly conditional composite market-outlook assumption, not a calibrated model or confidence measure. It summarizes assumed price outlook, neighboring need and export potential; it is not a price comparison across different commodities.

- 01: score = A. No district, market, export or price input affects the score.
- 03: score = round(0.4 A + 0.6 D).
- 04: score = round(0.4 A + 0.3 D + 0.3 M).
- Ties: higher agronomic score, then crop code. No acreage bonus.
- Balance = production − demand; deficit = max(0, demand − production); uncovered % = deficit / demand × 100; supply % = production / demand × 100. UI percentages round to two decimals; calculations use full precision.

| Level | TOP-3 |
|---|---|
| 01 | Mosh 100; Piyoz 96; Karam 82 |
| 03 | Kartoshka 92; Mosh 87; Piyoz 83 |
| 04 | Mosh 97; Karam 70; Piyoz 67 |

Rank changes: potato #4→#1 at 03; mosh #2→#1 and cabbage #4→#2 at 04. Final cabbage score 70 remains below its agronomic score 82 because of local oversupply; its positive neighboring/export outlook does not remove the visible surplus warning.

## Complete scenario numbers (not official data)

Coverage denominator is 20,000 ha. At 03, reported 16,600 ha = 83%, unknown 3,400 ha. At 04, reported 19,600 ha = 98%, unknown 400 ha. Unknown land is never classified as unplanted. These are analysis snapshots; changed production estimates are not proportional extrapolations of coverage. Production is an illustrative forecast input, not a false sum of the six pilot plots.

| Crop | 03 demand t | 03 production t | 03 balance t | 03 uncovered % | 04 demand t | 04 production t | 04 balance t | 04 uncovered % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Mosh | 180 | 176 | −4 | 2.222222 | 180 | 138 | −42 | 23.333333 |
| Karam | 1,200 | 1,230 | +30 | 0 | 1,200 | 1,340 | +140 | 0 |
| Piyoz | 160 | 158 | −2 | 1.25 | 160 | 150 | −10 | 6.25 |
| Kartoshka | 18,200 | 15,400 | −2,800 | 15.384615 | 18,200 | 19,000 | +800 | 0 |

Final cabbage supply is 111.666667%; final potato supply is 104.395604%. A positive balance is surplus, not automatically transferable stock.

| Crop | Forecast price UZS/kg | Buka demand t | Buka production t | Buka deficit t | Export potential | Assumed market support M |
|---|---|---:|---:|---:|---|---:|
| Mosh | 18,000–22,000 | 800 | 500 | 300 | Potential exists | 90 |
| Karam | 2,200–2,800 | 900 | 500 | 400 | Potential exists | 100 |
| Piyoz | 3,000–3,800 | 300 | 300 | 0 | Limited | 0 |
| Kartoshka | 4,000–5,000 | 7,000 | 6,300 | 700 | Limited | 40 |

The market/neighbor assumptions are recorded in both snapshot objects but enter scoring and become visible only at level 04. There is no guaranteed price, buyer, export contract, road distance, travel time or transport allocation.

## Files and image provenance

New UI: `src/components/presentation/decision-surface.tsx`, `src/app/decision-surface.css`, `src/i18n/decision-surface.ts`. Isolated model: `src/modules/presentation/evolving-scenario.ts`. Route and CSS wiring: `src/app/[locale]/demo/page.tsx`, `src/app/globals.css`. Tests: `scripts/test-evolving-scenario.ts`, `scripts/test-integration.ts`, package test script. Assets: `public/images/decision/{mosh,karam,piyoz,kartoshka}.png`. Prior UI components remain available in history/source but are not the new page.

Images generated using the built-in imagegen tool, genuinely transparent PNGs, copied into the repository. They illustrate crops and are not farm/product evidence. Exact shared prompt:

> Create a premium botanical agricultural crop cutout for an executive government agritech decision support interface. Subject: [SUBJECT]. Refined photorealistic editorial studio photography with real natural texture, soft diffused side lighting, gentle contact shadow only, warm muted natural palette. Entire subject isolated on genuinely transparent background, centered compact composition, generous transparent margins, landscape 4:3 composition. Professional restrained visual, not e-commerce catalog, no basket, no soil, no hands, no props, no text, no logo, no badges. High clarity suitable for a large recommendation hero.

Subjects: mosh — a small elegant pile of green mung beans with two fresh mung bean pods and one leaf; karam — one fresh pale green cabbage head with a cut half showing layered leaves; piyoz — two golden yellow onions, one half onion and one subtle green shoot; kartoshka — three natural golden potatoes, one cut half, with a small potato leaf.

## Verification

TypeScript, ESLint, seven test suites, isolated PostGIS integration and production build. Browser checks cover all levels, three languages, 1920×1080, 1440 desktop, tablet and mobile; stage changes, ranking movement, same-plot persistence, STIR/plot dialog, source disclosure, image loading, absence of visible DEMO/AI SCORE labels, reduced-motion CSS and no horizontal overflow. Production checks compare unchanged main/regional page content, serialized plot-map geometry/properties and pilot plans/forecast, plus rejected unauthenticated writes. No production test data is written.
