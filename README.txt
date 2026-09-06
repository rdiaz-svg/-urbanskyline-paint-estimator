UrbanSkyLine Paint Estimator V7.3.4 — Streamed Pinned-File Cloud Restore

Restore protocol:
- Starts a restore session by pinning one exact Google Drive backup file ID.
- Downloads sequential chunks until the server explicitly marks the final chunk with done:true.
- Does not depend on a precomputed character count or chunk count to decide when to stop.
- Validates backup ID, chunk sequence, boundaries, chunk size, optional total length, and SHA-256 before JSON restore.
- Local project is not replaced unless the entire verified backup decodes successfully.
- Existing keyboard fix and cloud backup behavior are unchanged.

Backend required: UrbanSkyLine Apps Script API v3.4.
