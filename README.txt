UrbanSkyLine Paint Estimator V8.1.0 — Clean Integrity Rebuild

BUILD STRATEGY
- Known-good V7.2.5 iPad Project input markup and viewport are preserved.
- V8 Cloud Sync 2.0 is retained using the reconciled v5 protocol.
- Google Places radius remains 50,000 m (valid maximum).
- No custom keyboard, focus, visualViewport, scrollIntoView, or Project inputmode overrides were added.
- New PWA identity: ?usl_pwa=810. This intentionally creates a clean installed-app context instead of inheriting the old app-specific standalone state.

IMPORTANT IPAD INSTALL TEST
1. Deploy all 8 GitHub files together.
2. Deploy Apps Script v5.2 using the existing /exec URL.
3. On iPad, open the site in Safari first and confirm Project fields + address.
4. Remove the OLD UrbanSkyLine home-screen icon.
5. Add the newly deployed app to Home Screen again.
6. Open the NEW icon and test Customer Name, Email, Address, City/ZIP, Estimator and Notes.

This reinstall step is required for the keyboard test because the clean rebuild uses a new PWA identity. The old installed icon can preserve its own standalone application state even after website files change.

QC GATES
- JS syntax: pass
- Project input markup: matches V7.2.5
- Viewport: matches V7.2.5
- Cloud frontend actions: v5 names only
- Backend radius: 50,000 m
- Version/cache references: 8.1.0 / 810 only
- Fresh PWA manifest id/start_url: usl_pwa=810
