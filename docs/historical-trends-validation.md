# Historical trends validation

Validated on 2026-11-15 on `feature/historical-trends-page`.

## Automated checks

- `pnpm test`: 31 passing tests across spatial, historical aggregation and complete CSV suites.
- `pnpm typecheck`: passes.
- ESLint passes for the historical trends components, composables, helpers and Nuxt configuration.

The known fixture is `data/calendar.json`. Its independently calculated annual totals are
2020: 164, 2021: 230, 2022: 279, 2023: 227, 2024: 293. Tests verify these totals, all 60
monthly periods, zero filling, absolute and percentage changes, sorting and CSV serialization.
The first period has no change value; 0 → 0 is 0%; growth from 0 has an undefined percentage
and displays “New activity” / “Nueva actividad”. CSV leaves undefined changes empty.

## Browser checks

Chrome desktop (1440 × 1000) and mobile (390 × 844), using the local Nuxt server with
`USE_MOCKS=false` and server-only API credentials:

- The 2024 monthly CSV contains 12 rows, a UTF-8 BOM, and a count total of 3377.
- Switching to Year produces one 2024 row with count 3377 and a yearly filename.
- Deselecting February changes the line chart from 12 to 11 periods. Both charts use the
  comparison selection; the table and CSV retain all periods within the global filters.
- Applying `instruments=MODIS` yields a CSV count total of 1106, matching the API.
- Applying latitude 13.6929, longitude -89.2182 and radius 10 km yields a total of 22,
  matching the API.
- The line chart displays a legend. Both charts render and no JavaScript page errors occur.
- Mobile document width matches the 390 px viewport; the table scrolls within its container.
- Spanish navigation displays Spanish month names and CSV headers.
- Simulated empty and failed calendar responses display the translated empty state and error
  message respectively; the error state includes the retry action.

API comparison endpoint: `/stats/calendar?granularity=month&startDate=2024-01-01&endDate=2024-12-31`.
The displayed metric is the metric returned by the API (`cells` in these checks). Annual values
sum monthly counts; these are not a deduplicated count of distinct cells across the entire year.
Live totals describe the checked dataset and can change after new imports.

Credentials remain in the ignored `.env` file. Do not include API keys in commits or PR evidence.

## Optional radius and sensor curves

The radius is optional. A coordinate pair without a radius can be applied and remains a point
on the map and queries its containing 0.01° cell using the API bbox filter. A supplied radius requires
both coordinates and a valid positive value. The UI labels the radius as optional and explains
the point-only behavior in EN/ES.

The default line comparison uses `/stats/harmonized`: MODIS Aqua, reference VIIRS and the
harmonized series, all in comparable monthly cell-day units (harmonized is MODIS-equivalent).
Colors/symbols distinguish MODIS, VIIRS and Harmonized / Armonizado. Unknown sensor values
remain null; they are not fabricated zeros. Annual aggregation also remains null if any
requested month for that series is unknown, avoiding a misleading partial-year total.

This endpoint supports dates only. The line chart is explicitly a regional comparison,
using all three columns from the same harmonized response even when local area or satellite
filters are active. Its EN/ES title and scope notice explain that only applied dates affect
this chart; the table, bars and CSV continue to use every global filter. Changing an area or
satellite alone does not refetch the regional series.

Regional chart periods are independent of the filtered table: a local search with no records
cannot hide regional activity. Unknown sensor values remain gaps. Regional loading failures
show a translated retry action rather than silently falling back to two local curves.

Chrome verification compares all three monthly series against the real API for 2024 with an
active point and satellite filters, checks that changing the point leaves the regional curve
unchanged without refetching, and verifies the yearly harmonized sum preserves fractions.
Offline/demo mode uses the existing harmonized fixture for the three regional lines.

## Chart update regression

The line chart tolerates temporarily undefined rows/series during development updates. Chrome
verified the reported 2023-01-01 → 2025-01-01 range with both instruments and all satellites:
both charts render, Year/Month switching works, and applying MODIS again completes without
JavaScript page errors. The dev server was restarted to clear the previous hot-update state.

## Notebook reconciliation: 52,751 versus 52,749

Inspected `Armonizacion_corregido (1).ipynb`, specifically `unificar()` and its
saved output `Duplicados eliminados: 2`. The notebook deduplicates by normalized
satellite, UTC timestamp, and latitude/longitude rounded to four decimal places.
The Explore summary API counts the stored rows without that notebook deduplication.
Exact-coordinate duplicate checks do not detect these two pairs:

| Sensor / satellite | UTC date / time | IDs | Rounded latitude / longitude |
| --- | --- | --- | --- |
| VIIRS / NOAA-20 | 2020-04-22 / 19:35 | 40892, 40893 | 13.7142, -89.4764 |
| VIIRS / NOAA-20 | 2023-03-30 / 19:35 | 49401, 49403 | 13.3964, -88.8194 |

A read-only SQL query against the connected database reproduces the notebook's
26,559 VIIRS + 26,190 MODIS = 52,749 after applying the rounded-coordinate identity.
Without it, both direct SQL and `/stats/summary` return 52,751. UTC−6 date conversion
alone does not change the count for this range. The notebook's “unified” dataset
already has this deduplication, before its separate confidence/type/static-source cleaning.

Reproducible read-only query: `docs/sql/verify-notebook-detections.sql`.
No production rows or API totals were changed during this investigation. Matching
notebook semantics in the application requires adopting the same deduplication in
the shared API data pipeline for summary, detections and calendars; changing only
the displayed card would leave the map and exports inconsistent.

### Recheck after the API data update (2026-11-15)

The live API now returns the notebook counts without client-side adjustments:

| Check | Notebook | Live API |
| --- | --- | --- |
| Detections 2002-01-01 through 2025-01-01 | 52,749 | 52,749 |
| MODIS in that range | 26,190 | 26,190 |
| VIIRS in that range | 26,559 | 26,559 |
| Detections 2023-01-01 through 2025-01-01 | 8,582 | 8,582 |
| Circle 13.769985, -89.413614, radius 12.247 km, 2002–2025 | 1,359 | 1,359 |
| April 2024 regional MODIS cell-days | 109 | 109 |
| April 2024 regional VIIRS cell-days | 773 | 773 |
| April 2024 harmonized cell-days (six decimals) | 85.844456 | 85.844456 |

Both `/detections` and `/stats/summary` return 52,749 for the full comparison range.
The reconciliation SQL also returns 26,190 MODIS and 26,559 VIIRS. These checks
supersede the earlier observation of an outstanding two-record API discrepancy;
no production database changes were performed from this client workspace.

## Complete CSV export

Download CSV / Descargar CSV produces a single UTF-8 BOM CSV with one header and a
consistent number of columns. CSV has no sheets. Each visible table period includes
its existing total and changes, independently filtered MODIS/VIIRS counts, and
explicitly regional MODIS/VIIRS/Harmonized columns with cell-day units. The CSV has nine
data columns; Applied filters and Regional data scope are excluded. The page still
explains the regional date-only scope.

Rows keep the table's sorting and the selected month/year granularity. Excluded sensors
and unavailable regional values stay blank; measured zero stays zero. Harmonization
fractions retain full precision. All source queries use the applied-filter snapshot.
Headers follow EN/ES. Loading and errors are translated. The Excel
button and dependency have been removed following the CSV-only requirement.
