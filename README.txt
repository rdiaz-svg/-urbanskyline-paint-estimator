UrbanSkyLine Paint Estimator V7.3.3 — Audited Cloud Restore

Fixes:
- Pins restore to the exact Google Drive backup file ID returned by metadata.
- Metadata returns exact total character count, chunk size, chunk count, and SHA-256.
- Each chunk is validated for file ID, index, byte/character boundaries, total length, and expected size.
- Full reconstructed backup is validated for exact length and SHA-256 before JSON parsing.
- Prevents restore from switching between same-named/stale Drive files during multi-request restore.
- Preserves V7.2.5 iPad keyboard behavior and existing backup logic.

Backend required: UrbanSkyLine Apps Script API v3.3.
