V7.3.1 — Cloud Restore Reliability Fix

- Fixes CLOUD RESTORE FAILED: Unexpected end of JSON input.
- Downloads cloud backup in verified chunks before parsing.
- Preserves V7.2.5 iPad keyboard behavior and V7.3 cloud backup.
- No pricing, cabinet, signature, contract, or change-order calculation changes.

V6.9.6 — Automatic Change Order Pricing

UrbanSkyLine Paint Estimator V6.9 — Estimate Mode / Project Mode Foundation

Adds:
- Estimate Mode for editable estimating workflow
- Customer Approved — Convert to Project action
- Locked approved-estimate snapshot (scope, price, costs, hours, colors)
- Project Execution dashboard
- Approved contract / estimated direct cost / expected profit preserved
- Execution foundation for actual materials, progress, change orders, payments
- Existing V6.8 automatic update system retained

Important: V6.9 stores the approved snapshot locally on the device. Full cloud persistence will be added in the Google synchronization upgrade.


V6.9.2 — Project Mode header fix
- Project Mode home header now shows CURRENT PROJECT and the locked approved contract, never a live recalculated estimate.
- Quick Status switches to the approved snapshot while in Project Mode.
- Estimate Workflow is relabeled Approved Estimate Reference with a LOCKED REFERENCE badge.
- Estimate Mode remains unchanged.


V6.9.4 — Mandatory Change Orders
- Approved estimate snapshot remains locked.
- Rooms, Colors, Estimate and Material Cost editing are blocked after approval.
- Any post-approval scope or price change must use Change Orders.
- Change orders support additions/deductions, customer price, estimated direct cost and painter hours.
- Draft change orders do not affect the contract.
- Approved change orders update Current Contract Total while preserving Original Approved Contract.
- Change order records are stored with local Project History state.
- Customer signatures will be added in the signature release.

V6.9.6: Guided touch-first Change Order workflow (What changed → Where → What work → Details → Review), automatic estimator pricing, existing approved room dimensions reused, internal cost details collapsed by default.

V6.9.9: Change Orders support multi-select scope (e.g., Walls + Ceiling + Baseboards) with combined automatic pricing. Full Room remains a one-tap shortcut.

V6.9.9: Project Mode now separates Original Approved Proposal from Current Contract Summary. Approved change orders appear separately and the current contract total is customer-facing without rewriting the original proposal.

V6.9.11: 40% is the standard UrbanSkyLine target margin. Estimates priced below 40% automatically show the customer-facing difference as a Courtesy Project Credit, while internal cost/margin data remains private. Includes V6.9.9 Current Contract Summary.

V6.9.14 Project Mode Quick Status
- Project Mode Quick Status now uses original approved scope plus approved Change Orders.
- Shows Authorized areas, Current paint gallons, Current painter-days, and Current contract.
- Gross margin is removed from Project Mode Home status; Estimate Mode keeps its original estimate metrics.

V7.0 TOUCH SIGNATURES
- Original Proposal: customer signs with finger/Apple Pencil before Estimate converts to Project Mode.
- Change Orders: approval requires customer signature; Draft orders do not affect the contract total.
- Subcontractor Work Order: separate acknowledgment signature with printed name/date-time.
- Signed original proposal and approved Change Orders remain locked in local Project History.
- Customer signatures appear on customer contract records; subcontractor signature remains internal.
- Existing legacy approved projects/change orders remain usable and are labeled as legacy when no signature was captured.


V7.1 EMAIL & SHARE SIGNED DOCUMENTS
- Adds native Share / Email actions for customer-facing proposal and current contract.
- On iPhone/iPad, Share / Email uses the system share sheet and includes a self-contained signed HTML document that can be sent through Mail, Messages, AirDrop, Files, and compatible apps.
- Adds a direct Email Customer button using the saved customer email, subject, and project summary.
- Current Customer Contract now includes captured signatures for the original proposal and approved Change Orders.
- Print / Save PDF remains available for a PDF copy.
- Internal direct cost, margin, profit, material cost, and subcontractor payout are excluded from shared customer documents.


V7.1.1 IPAD INPUT UX + BATHROOM PRESETS
- Adds Master Bathroom (10 x 12 x 9), Bathroom 1 (8 x 10 x 9), Bathroom 2 (8 x 10 x 9), and Half Bath / Powder Room (5 x 6 x 9) to room presets.
- Bathroom presets use the same Walls / Ceiling / Baseboards / Doors / Windows / Crown / Custom scope engine and can be adjusted in the field.
- Adds explicit native input types, autocomplete, inputmode, and enter-key hints to Project and signature fields for cleaner iPad/iPhone text-entry behavior.
- iPadOS controls whether its keyboard is full-size or floating; a PWA cannot force that OS-level keyboard mode.

V7.2 — Cabinet Painting Module
- Specialized cabinet scopes: Kitchen Cabinets, Bathroom Vanity, Laundry Cabinets, Built-ins, Custom Cabinets.
- Guided counts for doors, drawer fronts, cabinet boxes/frames (LF), end panels, and optional interior surfaces.
- Prep condition, hardware removal/reinstall, optional wood-grain filling.
- Cabinet production hours, primer and finish gallons, actual contractor material cost, Direct Cost and target-margin pricing.
- Uses ProBlock primer + Emerald Urethane Trim Enamel as the default cabinet coating system.
- Cabinet scope appears on Customer Proposal, approved snapshot/current contract, and Current Subcontractor Work Order.
- Cabinet Painting is available in Change Orders with automatic pricing.
- 40% remains the standard UrbanSkyLine target margin; lower estimate margins continue to create Courtesy Project Credit.


V7.2.5 iPad Keyboard Compatibility — corrected release metadata
- Removed explicit inputmode and enterkeyhint overrides so iPadOS uses native keyboard selection from HTML input types.
- Simplified viewport metadata to reduce standalone PWA keyboard/visual viewport interaction.
- No estimator, pricing, cabinet, signature, contract, or change-order calculation changes.


V7.3.0 CLOUD PROJECT SYNC & BACKUP
- Complete cloud backup/restore for full app state, approved snapshots, signatures, change orders, cabinets, subcontractor data, project history, and current project photos.
- Uses Apps Script API v3 and a private Google Drive folder owned by the script owner.
- Existing Google Sheet legacy sync endpoints remain supported for compatibility.
- V7.2.5 iPad keyboard compatibility is preserved unchanged.
