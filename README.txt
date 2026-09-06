UrbanSkyLine Paint Estimator V8.0.0 — Cloud Sync 2.0 Rebuild

Rebuilt from the stable V7.2.5 application base.
Cloud backup/restore protocol is new: transactional chunk upload, per-chunk SHA-256, active-backup commit, byte-exact chunk restore, and full SHA-256 verification before local data is replaced.
The backend can automatically migrate the existing legacy latest-backup.json once if no V8 verified backup exists.
Keyboard configuration from V7.2.5 is preserved.
