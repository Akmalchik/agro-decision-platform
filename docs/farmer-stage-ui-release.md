# Farmer stage presenter UI

Base Production: `62c05a561c8c5231c94fd1a7f1d6ee187879ca0a`. Rollback checkpoint: `checkpoint/pre-farmer-stage-ui-20261029`.

Only the existing farmer presentation UI, its translations, scoped styles and UI verification change. No calculation modules, formulas, scenario fixtures, API handlers, database repositories, migrations, credentials or persisted data are edited.

The DEMO-STIR and farm/plot lookup remain unchanged. After plot selection, setup collapses behind an explicit change button. A large 01 YER / 03 TUMAN / 04 BOZOR switch renders one stage at a time; selected crop lives above stage content and survives switching. Viewed stages show a check. The interface shows the existing evidence progression without implying agronomic suitability scores changed.

Land: crop illustrations are lightweight inline SVG, with actual rank/score, selected/suitability status and the existing score bar. The reason card uses the existing scenario's bonitet, water, previous crop and computed rotation score/flags. Missing evidence, partial water and exclusions produce qualified conclusions. An excluded crop can be inspected without turning regional data into a farm-specific planting or sales recommendation.

District: existing production, need, balance, area and 83% coverage are presented in a compact explanation. Conclusion depends on the existing balance sign or missing-data status. Missing forecast is a small selection state; offered replacements come only from eligible crops already covered by existing regional DEMO data. Unknown land is disclosed as unknown, not unplanted. Sources and longer formulas are expandable.

Market: existing Piskent +800 t and Buka −700 t potato scenario is compared side by side with a crop illustration and directional arrow, explicitly potential and not automatic shipment. The existing transfer option and eligibility gate the recommendation text; no road distances, buyers, contracts or transport volumes are invented. These remain labeled internal DEMO values.

Verification covers all three languages and 1920/1440/768/375 px, crop persistence through stage changes, single-stage rendering, reason cards, missing forecast replacement, reduced-motion styles, keyboard activation, TypeScript, ESLint, six test suites and production build. Current Production snapshots of main/regional pages, planning data and plot data are compared after deployment; unauthenticated write protection is smoke-tested without production writes.
