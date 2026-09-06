UrbanSkyLine Paint Estimator V7.3.5 — Cursor-Based Cloud Restore

Fixes:
- Replaces index-based restore chunks with server-directed cursor/offset streaming.
- EOF is a valid terminal response; no out-of-range chunk request can fail the restore.
- Pins restore to one Google Drive backup file ID.
- Verifies total length and SHA-256 before parsing/restoring.
- Keeps V7.2.5 iPad keyboard behavior and V7.3 cloud backup behavior.

Backend required: UrbanSkyLine Apps Script API v3.5.
