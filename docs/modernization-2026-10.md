# SMART EKIN: presentation release, October 2026

## Rollback

Baseline commit: `a6e52489ec304b94f8be2a8f2ec9eec934479abe`.
Checkpoint tag: `checkpoint/pre-modernization-20261028`.
Previous Vercel production deployment: `dpl_8jVj1RVHsjaLxZ8PTXAFnFdERptJ`.
Rollback the application deployment to that build. Retain the additive planning table and operator key; the old application ignores both. No destructive database rollback is necessary.

## Data and compatibility

- No existing tables, pilot plots, recommendation records or seed data are replaced.
- The existing Prisma schema and migration history remain compatible.
- On the first authorized plan save, a transaction creates `smart_ekin_plans_v1` if absent. This is an additive versioned table, with a plot foreign key and `(plot_id, season, mode)` primary key. RLS is enabled and PUBLIC privileges revoked. Only the server's database role should write it. Reads never initialize storage.
- Plans have optimistic revisions. A stale save returns 409. Allocation sums cannot exceed the stored plot area. DEMO and USER_PLAN use separate keys.
- The planning denominator is explicitly the six pilot cadastral plots in `piskent-cadastre.ts`, not the whole Piskent district. No 80% district-wide claim is made.
- Existing integer recommendation columns remain unchanged. Missing rotation is represented in the API as null; historical storage uses zero plus `rotation.insufficientData` as a missingness marker, never as an input score.

## Recommendation policy

Water compatibility scores and soil curves retain established values. Water below 50 (the existing LOW/HIGH combination is 20), soil below crop minimum, and explicit RESTRICTED rotation are excluded before TOP-3. Partial water (60) produces a warning. Unknown rotation has no invented score: known soil/water weights are normalized by their sum, retaining the original 40:35 ratio. All explanations identify the evidence limitation.

The legacy scenario engine remains exported for comparison/rollback; the UI uses eligibility plus the common 40/35/25 ranking policy, without area bonuses or fixed district/market priorities. Existing scenario crop parameters are retained as clearly labeled demonstration assumptions, not approved agronomic norms. The upper optimal soil boundary is not made a penalty without a validated agronomic rule.

## Four stages

1. Plot suitability: factual fields and demo assumptions are separated. Missing plot geometry no longer hides the entire record. Fixed AI confidence percentages are no longer rendered.
2. Farmer intentions: one or more crop areas and optional target market, saved by an authorized operator. A selected contract/export option is unverified intention, not a confirmed transaction.
3. Preliminary forecast: starts at 80% of scoped land area. Replacements do not double count. Unreported area stays unknown. Historical farm yields precede district means; only years preceding the forecast qualify. Without evidence, tonnage is unknown. Demonstration yields are explicitly derived from the old demo production/area fixtures and must not be interpreted as observed farm history.
4. Transfer proposal engine separates production, need and confirmed flows. Road evidence orders candidates; missing routes prevent a proposed transfer volume. No real neighboring statistics, confirmed flows or road routes are supplied in this release. The Buka example is a labeled hypothetical candidate, never guaranteed demand or proven profitable logistics.

## Security and operation

Set server-only `WRITE_ACCESS_KEY` to at least 32 random characters, with separate production and preview values. Writes fail closed without it. The presentation operator supplies the key in a password field; it stays in component memory and is sent only in the Authorization header. It is never placed in browser storage, URLs or public environment variables. Origin checks additionally reject cross-origin browser writes.

This is a single-operator presentation safeguard, not farmer identity or multilevel RBAC. Production farmer onboarding requires an identity provider, farm/territory grants and individual audit attribution. Rotate the key when operator access changes. Never commit `.env.operator.local` or other secret files.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
`scripts/test-integration.ts` additionally checks the real API with PostGIS and refuses a database other than the isolated `smart_ekin_test` on localhost:55437. It creates only disposable local test records. Never run it against production. Browser checks cover all three languages, the map, plot cards, planning, authentication failure, and forecast presentation.

Dependencies are updated in the lockfile. `deepmerge-ts` is overridden to the fixed v8 line; Prisma generation, migration commands and build must be tested after future dependency changes.

Production builds explicitly use Next.js Webpack. Turbopack intermittently failed to start its CSS worker on the verification host; Webpack is used consistently for the tested release and the Vercel build.

## Still required for real operation

Validated crop water volumes and yield history; soil norms reviewed by agronomists; district/season source adapters; verified demand and contracts; real road routing between plot/market locations; identity/RBAC; and monitoring. The resource estimator already accepts yield and cubic meters per hectare, but returns unknown instead of inventing missing norms.
