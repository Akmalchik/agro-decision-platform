# SMART EKIN presentation interface

## Release scope

Public executive dashboard at `/{locale}`, public farmer demonstration at `/{locale}/demo`, and read-only recommendation preview at `/api/recommendations/preview?plotId=<uuid>`.
All original map, plot, planning and protected persistence routes remain available. No schema, migration, seed, existing plan or crop coefficient changes are included.

Rollback baseline: commit `01c111361c8d6096ead4a6e8678bf7e3d04a3303`, tag `checkpoint/pre-presentation-ui-20261028`, previous deployment `dpl_BbUgahmCiuVCSwPfm3w9ngF5PGkb`.

## Read-only boundary

`loadPresentation` reads only the pilot scope, PostGIS geometries, saved DEMO submissions and existing scenario fixtures. It never reads USER_PLAN submissions, initializes storage or saves calculations. Server environment values are not included in presentation props.

`FirstStageRecommendationService.preview` runs the same evaluation as `calculate` but bypasses the repository save and returns `recommendationId: null`. The persisted POST endpoint continues to require the operator key; its ranking policy is unchanged. The existing plot UI offers the public preview first and keeps the protected save in a collapsed operator section.

## Honest stage progression

The farmer selects one farm/plot and switches between stages 1, 3 and 4. Stage 2 links to the existing plan collection screen. Each stage projects the existing engine on the same plot assumptions. Score differences are computed against the preceding analytical stage, never authored as marketing text. Since the current engine does not re-rank suitability from market indices, differences are zero and the UI states this explicitly.

Stage 3 adds the preliminary forecast for the included pilot area. Stage 4 adds logistics limitations; unknown road routes and confirmed flows remain unknown. Demonstration soil/water/rotation assumptions are separated from stored plot facts. Missing geometries do not remove plots from selectors.

## Visual verification

Check executive overview and farmer demo at mobile, tablet and desktop sizes in all three locales. Confirm synchronized plot/map selection, stage switching, crop explanations, chart expansion, no operator key in public presentation and no horizontal document overflow. Chart bars and coverage ring are calculated from the existing forecast, with no invented time series or growth figures.

`npm test` includes presentation projection, translated reason keys, scenario immutability and zero-write preview tests. `scripts/test-integration.ts` verifies public HTML without serialized operator secrets and unchanged recommendation history after public page reads, using only the isolated localhost test database.
