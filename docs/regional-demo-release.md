# Regional presentation release

Rollback point: `checkpoint/pre-regional-demo-20261028` at `c0d7dd7f612cf654cab56cb1894478304839b927` (previous Production). UI restoration uses `a6e5248` as reference; no reset/revert, migrations, data deletion or replacement of calculation modules.

Routes: `/uz` aliases Uzbek Latin; existing `/uz-latn`, `/uz-cyrl`, `/ru` remain. Familiar home/map/plot/recommendation shell restored. Farmer demo retains calculated stages 1/3/4, assumptions, actual registry facts, sources and uncertainty. The previous pilot overview remains at `/{locale}/pilot-overview`.

`/toshkent` is a separate Uzbek Latin regional DEMO. Only Piskent is enabled via a district registry. All statistics, including 448 farms, 20,000 ha, 68 bonitet, water status, 200,000 population and consumption/yield assumptions are explicitly internal DEMO, not official data. They never enter the database or six-plot pilot forecasts. Coverage is 16,600 / 20,000 = 83%; the remaining 3,400 ha is unknown, not unplanted. Forecast threshold and status boundaries are tested. Product production = planned ha × t/ha; demand = population × kg/person ÷ 1,000; balance = production − demand. These are scenario calculations, not guaranteed sales.

Map: simplified geographic boundaries from geoBoundaries/OCHA ROCCA, source year 2020, boundary `UZB-ADM2-79887680`, CC BY 3.0 IGO. Fifteen districts and seven cities; not a current cadastral authority. Source and license links appear on the page and in the JSON metadata. Reproduce SVG data with `node scripts/prepare-regional-map.mjs <downloaded-ADM2-GeoJSON>`; exact download URL is in generated metadata. No runtime map-data download is needed.

Navigation carries an allowlisted regional/product context to the original farmer map and plot card, with a link back and explicit separation from the pilot dataset. Public views remain key-free. Existing write authorization and server-only secrets remain intact.

Verification: TypeScript, ESLint, recommendation/modernization/presentation/regional tests, webpack production build, isolated PostGIS integration (no production test writes), browser checks at 375/768/1440 px, all locale routes, Piskent selection, product formula/dialog, map→plot→recommendation, stage switching. Vercel Git preview is checked before publishing the same commit to main/Production.
