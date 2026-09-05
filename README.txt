UrbanSkyLine Paint Estimator — Section 3.1 Production Audit Fix

Changes:
- Displays exact painter hourly equivalent: $37.50/hr.
- Adds per-room production breakdown so selected room names and task hours are visible.
- Materials now show calculated gallons separately from whole-gallon purchase quantity.
- Keeps paint grouped across rooms by surface/product/color before rounding purchase gallons.
- Keeps the agreed $300 per 8-hour painter-day and production rates.
- Setup/cleanup remains 15% applied once to total project production, not rounded room-by-room.

Calibration benchmark with fresh defaults:
Bedroom 1 (11x12x9) + Bedroom 2 (11x13x9), Full Room, 1 door + 1 window each -> approximately 18.25 total painter-hours under the agreed production assumptions.

Important: Living Room (16x20) + Master Bedroom (14x18) are much larger than the benchmark pair and will correctly produce substantially more hours/materials.
