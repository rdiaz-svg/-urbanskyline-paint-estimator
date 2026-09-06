UrbanSkyLine Paint Estimator V8.2.1 — Human-Readable Estimate Number

CHANGE
- Saved Estimates now display: Estimate # [house number + street address] — [MM/DD/YYYY].
- Example: Estimate # 3608 Carver Court Lane — 09/06/2026.
- Search includes the human-readable estimate number.
- The original hidden system estimateId is preserved for cloud integrity, Open, Duplicate, Delete, and overwrite behavior.
- Existing saved estimates automatically receive the readable display number from their saved address and estimate creation date; no migration is required.

UNCHANGED
- Pricing engine, direct cost, margin logic, proposal, rooms, photos, address autocomplete, cloud chunk verification, and iPad keyboard behavior.
- Apps Script API remains v5.3; no backend redeployment is required for this display-only release.

DEPLOY
Upload the 8 GitHub files. The installed PWA will detect V8.2.1 through version.json.
