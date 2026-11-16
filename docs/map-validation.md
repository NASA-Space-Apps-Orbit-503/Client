# Map and shared filters validation

Validated with the integrated client before separating the map and historical feature branches.
The standalone map branch has six spatial unit tests; the historical branch adds trend tests.

## Apply and shared filters

The common filter form keeps a shared draft and a separate applied snapshot. Editing dates,
coordinates, radius, instruments, satellites or the drawn circle does not send statistics
requests. Apply commits the snapshot and writes it to the URL. Explore summary/calendar and
Historical Trends consume the same applied query. Anomalies currently contains the shared
filter form; it does not yet have an anomaly results view.

Chrome checks confirmed:

- Editing the area leaves the applied URL and statistics requests unchanged until Apply.
- Apply sends the area to both Explore summary and calendar requests.
- Navigation Explore → Historical Trends → Anomalies → Historical Trends retains both the
  draft input values and the last applied snapshot.
- Changing the radius from 10 to 20 without applying retains the draft 20 while the URL
  continues to represent the applied radius 10. Applying on Anomalies updates the snapshot
  used by Historical Trends.
- Reloading restores the applied area from the URL.
- A partial coordinate pair or a radius without coordinates disables Apply and shows a
  translated validation message. A coordinate pair without a radius can be applied.
- Clearing all three area inputs and applying removes the area from the URL.
- The mobile form includes Apply without horizontal document overflow; no JavaScript page
  errors occurred during these interactions.


## Point selection and fire detections

- Select a point / Seleccionar un punto enables click/tap selection on the map. The selected
  point fills latitude and longitude and clears any previous circular radius. It remains a
  draft until Apply. Drawing/editing controls do not accidentally select a point.
- `/detections` receives the applied global filters. Without a circular area, the map uses
  the El Salvador bounding box. Points are real detections, not calendar cell centroids.
- The first page has up to 500 points; Load more fetches the next page. Canvas rendering and
  a 5,000-point display limit keep the map responsive. The shown/total counter and explanatory
  text make the partial dataset explicit. Tighter filters can expose other subsets.
- Popups use text nodes for date, instrument, satellite and coordinates. MODIS is blue and
  VIIRS is orange. The selected draft point has a separate marker.
- Chrome verified 500 real map points, 1,000 distinct points after loading a second page,
  popup metadata, point picking without premature requests and a circular query after Apply.
- Navigation from the map to Historical Trends removes the Leaflet layers without page errors.
- Mobile Chrome with touch events verified point selection, clearing the previous circle,
  Spanish labels and no horizontal overflow. Simulated empty and failed detection responses
  show the translated zero count, error and retry action respectively.

## Clearing a search and point-only filtering

- Clear filters / Limpiar filtros resets dates, coordinates, radius, instruments and satellites,
  removes their URL parameters, and clears existing results without fetching the whole country.
  The cleared state persists when navigating Explore, Historical Trends and Anomalies.
- Apply re-enables requests. Selecting a point alone remains a draft until Apply.
- Without a radius, the point searches its containing 0.01° grid cell (about 1 km per side),
  outlined on the map. It no longer falls back to a country-wide query.
- Point 13.775838, -88.673784 maps to bbox -88.68,13.77,-88.67,13.78.
  Calendar, summary and map requests share this bbox. An explicit radius still uses a circle.
- The three regional comparison lines use only applied dates, regardless of the local bbox.
- Automated area tests verify negative coordinates, decimal boundaries, containment and
  unchanged circular queries. The six spatial unit tests cover these cases.

## Map detection information and sensor colors

- Select a point / Seleccionar un punto sits at the right edge of the area toolbar.
  Toggle it off to leave point-picking mode; no separate information button is shown. Clicking or tapping a
  detection opens its metadata: sensor, satellite, acquisition date and UTC time,
  coordinates, radiative power in MW, and translated confidence.
- MODIS markers, popup heading and legend use blue (#2a78d6); VIIRS uses orange (#eb6834).
- The detection canvas has a dedicated pane above drawn areas so a circle's filled
  SVG cannot intercept clicks on detections inside it. A five-pixel hit tolerance
  makes small markers easier to select.
- Chrome physical mouse clicks verified both sensor popups above a drawn circle,
  correct heading/marker colors, and returning from point selection to inspection.
  Mobile Chrome touch emulation also verified both popups with physical taps.
  No JavaScript errors occurred; Nuxt typechecking and scoped ESLint passed.

## Clear area applies immediately

Clear area / Quitar área removes latitude, longitude and radius from both the draft
and the applied snapshot, then synchronizes the URL. Other applied filters and any
unapplied nonspatial edits remain intact. It exits point selection, closes popups,
cancels pending map movement, and resets the view to El Salvador. The map fetches
results for the remaining filters instead of retaining the former circular subset.

Chrome verified a VIIRS/N20 circle with 629 loaded detections: clearing the area
replaced those markers with the first 500 of 26,559 detections for the same dates
and satellite, removed the circle and spatial URL parameters, and preserved dates,
instrument and satellite. No extra Apply click was needed. No JavaScript errors;
Nuxt typechecking and scoped ESLint passed.


## Explore / Historical Trends integration after the dev map layout changes

- Corrected Explore's detection-layer slot spelling and typed BaseMap's named slots so
  mismatches are caught by Nuxt typechecking. Fire markers now mount again.
- Explore explicitly fills its viewport-sized section. Card maps have a definite-height
  wrapper; BaseMap no longer forces an extra conflicting root height.
- Filter and area overlays stop click, double-click, mouse/touch, wheel and keyboard events
  from reaching Leaflet. Activating point selection hides Explore overlays so mobile taps
  can reach the map; cancel remains accessible and selecting a point restores area details.
- Explore restores Clear area and its immediate applied-filter reset. The shared form has
  labelled Apply/Clear buttons, compact page layout, and a separate stacked overlay layout
  with room for both date endpoints.
- Historical Trends now uses the shared card map for fire detections and point/circle area
  selection, sharing the same applied snapshot with Explore, its table and CSV. Regional
  MODIS/VIIRS/Harmonized comparison retains its documented date-only scope.
- The locale provider now receives the active EN/ES UI locale and navigation labels update
  when the language changes.

Chrome desktop verified 167 detections for the 2024 circle at 13.769985, -89.413614,
radius 12.247 km, physical VIIRS popup clicks, draft point picking without premature
requests, bbox requests after Apply, navigation retaining the point, all three historical
curves, Clear area's new detections, and CSV download. No JavaScript page errors occurred.
Mobile Chrome touch emulation (390 × 844, Spanish UI) verified point selection without
artificial delays after hiding filters, Apply, both map heights, no horizontal page
overflow, historical Clear area, and navigation to the Anomalies map. No JavaScript
page errors occurred. The historical CSV still has nine columns and excludes the two
metadata columns previously removed. All 31 unit tests, Nuxt typechecking and scoped
ESLint pass.
