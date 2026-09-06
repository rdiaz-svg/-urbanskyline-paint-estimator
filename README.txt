UrbanSkyLine Paint Estimator V8.0.3 — Integrity Repair

This build is based on the V8 feature set, with regression repair anchored to the known-good V7.2.5 iPad input behavior.

FIXES
1. iPad keyboard: restores V7.2.5 native viewport/input behavior. No custom inputmode, visualViewport, focus scrolling, or keyboard CSS overrides are added.
2. Address autocomplete: backend radius corrected from 60,000 m to Google's 50,000 m maximum.
3. Cloud Sync 2.0: frontend now matches API v5 protocol names and byte-chunk contract exactly.
4. Version/cache integrity: visible version, CURRENT_VERSION, version.json, asset query strings, service-worker cache name and service-worker asset list are all build 803 / V8.0.3.

DEPLOYMENT ORDER
A. Replace the Apps Script code with UrbanSkyLine_AppsScript_API_v5_1_IntegrityFix.gs, save, and deploy a new Web App version using the same /exec URL.
B. Replace all 8 GitHub app files from this package together.
C. Wait for GitHub Pages deployment. Open the app, use its update flow or fully close/reopen the installed PWA.

QC GATES
- JavaScript syntax check passed.
- Project input markup matches known-good V7.2.5 field types/autocomplete behavior.
- Viewport exactly matches known-good V7.2.5: width=device-width,initial-scale=1.
- No stale V8.0.0/V8.0.1/V8.0.2 asset/version references.
- No V4 cloud action names remain.
- V5 frontend/backend action names reconciled.
- Address radius <= 50,000 m.
- Existing estimate/pricing logic was not intentionally modified.
