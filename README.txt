UrbanSkyLine Paint Estimator — V6.8 Automatic App Updates

NEW IN V6.8
- Installed iPhone/iPad/desktop PWA checks version.json for newer releases.
- Shows a "New Version Available" banner with an Update App button.
- Update refreshes app shell/cache and reloads the newest GitHub Pages build.
- Existing project/settings data in localStorage is intentionally preserved.
- Current version remains visible as V6.8.
- Embedded Google Apps Script backend from V6.7 remains unchanged.

PUBLISHING FUTURE VERSIONS
1. Increase the visible version in index.html.
2. Increase version/build in version.json.
3. Change CACHE_NAME and asset query versions in sw.js/index.html.
4. Commit all changed files together to GitHub Pages.
Users running the Home Screen app will be offered the update after GitHub Pages serves the new version.

NOTE
The update system refreshes application files; it does not erase localStorage. Photos/projects that exist only on one device remain device-local until cloud persistence is added.
