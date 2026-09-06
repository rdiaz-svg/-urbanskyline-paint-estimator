UrbanSkyLine Paint Estimator V8.2.0 — Saved Estimates & Project Retrieval
Release date: 2026-09-06

PURPOSE
V8.2 adds a real cloud Saved Estimates library without changing the working pricing engine, Project input behavior, address autocomplete, proposal calculations, or iPad keyboard handling.

NEW
- Save Current Draft from Home or Project.
- Saved Estimates cloud library.
- Search by customer, address, estimate ID, or status.
- Open and continue editing any saved estimate.
- Duplicate a saved estimate into a new independent draft.
- Delete a saved estimate from cloud.
- Draft payload includes project, rooms/scope, cabinets, colors, pricing, notes, workflow data, and project photos.
- Every save uses 24,000-byte chunks plus SHA-256 verification before the new cloud copy becomes active.
- Updating an existing estimate is transactional: the previous verified copy is retained until the replacement passes verification.

BACKEND
Deploy UrbanSkyLine_AppsScript_API_v5_3_SavedEstimates.gs as a NEW VERSION of the existing Apps Script Web App deployment. Keep the same /exec deployment URL.
The backend creates a Drive folder named "UrbanSkyLine Saved Estimates" automatically.

GITHUB / PWA
Upload the eight app files in the GitHub package to the existing repository:
index.html
app.js
styles.css
manifest.json
sw.js
version.json
urban-skyline-logo.png
README.txt

Do not remove/reinstall the iPad Home Screen app for this update. V8.2 intentionally preserves the V8.1 PWA identity.

QC / INTEGRITY
- V8.2 keeps the known-good viewport: width=device-width,initial-scale=1.
- No keyboard behavior changes were made. Project customer/address fields retain the V8.1 native iPad input behavior; no VisualViewport/focus/forced-keyboard code was added.
- Address autocomplete remains at Google Places radius 50,000 meters.
- Existing Cloud Sync 2.0 backup/restore actions remain unchanged.
- Existing estimating, pricing, materials, signature, proposal, project execution, change-order, and local Project History logic remain in place.
