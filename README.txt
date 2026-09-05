UrbanSkyLine Paint Estimator — Section 3.4

UrbanSkyLine Paint Estimator — Section 3.2 Material Audit Fix

Changes:
- Painter day rate remains $300 / 8 hours = $37.50/hr.
- Hourly rate displays with two decimals.
- Product/color material groups are combined before whole-gallon rounding.
- Material coverage assumption set to 400 sq ft per gallon for ProMar 200 Eggshell, ProMar 200 Flat, and Emerald Urethane Trim Enamel.
- Two finish coats plus 10% waste.
- Materials panel now shows coating gallons, waste-adjusted gallons required, and whole gallons to buy.
- Existing production rates and 15% project-level setup/cleanup remain unchanged.

Note: $48/gallon remains a temporary material-cost assumption until the product-cost section is finalized.

Build 3.4 cache-fix: app.js/styles.css asset keys bumped to v41 so browsers cannot reuse the prior 5% material logic.
