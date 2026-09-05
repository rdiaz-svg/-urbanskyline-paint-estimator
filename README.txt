UrbanSkyLine Paint Estimator — V6.5

V6.5 updates:
- Adjustable target margin per estimate: 20%, 25%, 30%, 35%, 40%, or Custom (20–89%).
- 40% remains the default for new projects.
- Margin changes only the cost-based margin floor/final sale calculation; Direct Cost, painter payout, materials, repairs, supplies, and production assumptions do not change.
- Mobile address-autocomplete setup improved. Each browser/device has its own local storage, so the Apps Script /exec connection must exist on that device.
- New “Share Mobile Setup Link” transfers the configured Apps Script connection to an iPhone/iPad. Open the shared link once on the other device; the app saves the connection locally and removes it from the visible URL.
- Address field now shows connection/search status and clearer errors instead of failing silently.
- Cache keys and visible build updated to V6.5.

IMPORTANT: The Mobile Setup Link contains the Apps Script deployment URL. Treat it as an internal setup link and share it only with devices/users you want using this estimator. It does not contain the Google Maps API key; that key remains in Apps Script properties.

All V6.4 subcontractor work-order/payout and V6.3 Full Room scope logic are retained.
