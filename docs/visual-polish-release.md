# SMART EKIN visual polish — 2026-10-29

Base: `456b200`. Rollback: `checkpoint/pre-visual-polish-20261029`.

The accepted header, timeline, hero-left/alternatives-right composition and all stage calculations are retained. This release changes presentation only.

## Changes

- `src/components/presentation/decision-surface.tsx`: stage-aware, always-visible reasoning within each recommendation; proportional demand/production balance with deficit/surplus segments and accessible numeric description; compact Piskent → Bo‘ka diagram. Secondary evidence is arranged without repeated agronomic grids at stages 03/04; agronomic score, water limitation, previous crop and rotation remain in the reasoning. Market, export and neighbor evidence remain restricted to stage 04.
- `src/app/decision-polish.css`: scoped typography, contrast and spacing; primary text 14–15px, secondary labels approximately 12–13px, hero name 56px and score 82px, larger alternative names and balance KPIs. Stage 04 market and reasoning use adjacent columns. Deficit gold, surplus terracotta, near-balance neutral green. Balance/route animations respect reduced motion.
- `src/app/globals.css`: imports scoped polish styles.
- `src/i18n/decision-polish.ts`: Uzbek Latin, Uzbek Cyrillic and Russian labels.
- This release note.

## Interpretation correction

The request's suggested downward position for Karam conflicts with the existing scenario: Karam rises from #4 at stage 03 to #2 at stage 04. The actual movement remains visible. Its final score 70 is lower than its agronomic score 82; the heading therefore explains the lower **score**, not a false decline in rank. Surplus +140t and partial water suitability remain explicit. No scenario numbers or weights were changed to force a downward arrow.

## Preserved results

| Stage | #1 | #2 | #3 |
|---|---|---|---|
| 01 | Mosh 100 | Piyoz 96 | Karam 82 |
| 03 | Kartoshka 92 | Mosh 87 | Piyoz 83 |
| 04 | Mosh 97 | Karam 70 | Piyoz 67 |

The scenario data and production calculation engine have no diff from `456b200`. API, database, write protection, map and existing plots are untouched. Prices remain forecasts; export and Bo‘ka remain potential opportunities, with no guaranteed sale or buyer.

## Verification

TypeScript, ESLint, all seven existing test suites and Production build. Browser verification covers 01/03/04, all three languages and widths 1920/1440/768/375. At 1920×1080 the primary content fits without scrolling; smaller layouts retain readable content through normal vertical scrolling. Screenshots of all three stages are inspected before publication. Public Production regression checks compare the main and regional pages, map geometry/properties and six pilot plots/plans to the unchanged baseline; unauthorized writes must remain 401.
