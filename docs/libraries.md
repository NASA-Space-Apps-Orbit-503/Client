# Library selection: harmonized burning activity calendar

This document explains why each tool was selected for the two main parts of the web
application: **map and area selection**, and **calendar and charts**. The project-wide data
source is the harmonized NASA FIRMS record (MODIS + VIIRS hotspots).

---

## 1. Map and area selection

**Selected set:** WorldCover data, Leaflet, Leaflet.draw, Turf.js, and Nominatim

### How the pieces fit together

1. The user searches for a place with **Nominatim** or draws a shape on the map with
   **Leaflet.draw** on top of **Leaflet**.
2. The application converts the selection into a polygon and uses **Turf.js** to find which
   cells from the pre-aggregated grid or which hotspots fall inside it.
3. The results feed the calendar and charts. Land cover (**WorldCover**) is already associated
   with each hotspot, so it can be used as a filter or breakdown.

### WorldCover (land-cover data)

**What it is:** a global 10 m ESA land-cover raster with 11 classes (tree cover, shrubland,
grassland, cropland, built-up areas, sparse vegetation or bare soil, water, wetlands, and
others), produced with one method worldwide.

**Why it was selected**

- **Consistency.** Every pixel has a class and the same method is used everywhere. There is no
  "unmapped" state, so regional differences reflect the territory rather than mapping effort.
  This matters for a tool whose goal is to provide a consistent, comparable view.
- **Helps interpret hotspots.** Land cover can separate likely wildfires (forest, shrubland,
  grassland) from agricultural burns (cropland) and industrial or urban heat sources
  (built-up areas).
- **Low runtime cost.** The land-cover class is sampled once in the data pipeline and stored
  as a column for each hotspot. The browser only filters and aggregates, and CSV export
  includes the class at no additional cost.

**How to use it**

- Pipeline: sample the raster at each hotspot coordinate (for example, with `rasterio`).
- Because a MODIS pixel (~1 km) or VIIRS pixel (~375 m) covers many 10 m cells, assign the
  **dominant class** or store **class fractions** instead of using a point value.
- Optionally display it as an overlay on the map for context.

**Caveats**

- It is a snapshot (2020 and 2021 versions) and does not capture land-cover change between
  2000 and 2026. For a consistent time series, consider MODIS land cover (MCD12Q1, ~500 m,
  annual, since 2001), which is coarser.
- Its accuracy is good but not perfect, so land-cover breakdowns should be presented as
  indicative.

### Leaflet (base map)

**What it is:** a lightweight, widely used JavaScript mapping library.

**Why it was selected**

- **Simple and fast to use.** Its learning curve is short, which is ideal for hackathon
  timelines.
- **Large plugin ecosystem.** Drawing tools, geocoding controls, and overlay layers have
  mature plugins.
- **Sufficient for the data volume.** Hotspots are pre-aggregated into cells or monthly
  counts, so the browser does not need to draw millions of points; Leaflet's canvas/SVG
  rendering is sufficient.
- **Works immediately with OpenStreetMap tiles**, with the required attribution
  ("© OpenStreetMap contributors").

**Tradeoff:** if large point layers later need to be drawn smoothly, MapLibre GL JS (WebGL) is
the best option, although it requires more configuration.

### Leaflet.draw (area of interest)

**What it is:** a Leaflet plugin that adds tools for drawing, editing, and deleting rectangles,
polygons, and circles.

**Why it was selected**

- **Directly meets the challenge.** The challenge suggests allowing users to draw an area of
  interest on the map.
- **Native Leaflet integration.** Drawn shapes become GeoJSON, which Turf.js and the rest of
  the application can use immediately.
- **Familiar interaction.** Rectangle and polygon tools are intuitive for emergency and land
  managers.

**Tradeoff:** Leaflet.draw has seen limited active development in recent years. If bugs or
additional features are needed (vertex snapping or editing modes), **Leaflet-Geoman** is a
direct alternative. Review its maintenance status before deciding.

### Turf.js (browser geometry)

**What it is:** a modular JavaScript geospatial analysis library that works with GeoJSON.

**Why it was selected**

- **Handles spatial logic without a backend.** `booleanPointInPolygon`, `bbox`, and `area` are
  the operations needed to move from a drawn shape to "which hotspots or cells are inside".
- **Same format as the rest of the set.** It consumes GeoJSON from Leaflet.draw and boundary
  polygons from Nominatim.
- **Useful as a safeguard.** Calculating the selection area allows warnings when a region is
  too large or too small for meaningful statistics.
- **Modular.** Only required functions are imported, keeping the bundle small.

**Tip:** filter first with the polygon bounding box, then apply point-in-polygon testing so
selections remain responsive.

### Nominatim (place and boundary search)

**What it is:** the OpenStreetMap geocoding service (a web API, not a library).

**Why it was selected**

- **Matches how people think.** Emergency responders search for "Kruger National Park" or
  "Los Angeles County", not coordinates.
- **Boundaries as an area of interest.** With `polygon_geojson=1`, Nominatim can return an
  administrative boundary, allowing a region to be selected by name rather than drawn.
- **Free and easy to query** with a simple `fetch` request.

**Caveats**

- The public instance has usage limits (approximately one request per second, with a
  User-Agent or Referer identifying the application). It is suitable for a demo, but a
  production tool should use a self-hosted instance or a commercial geocoder.
- Boundary quality varies by region and large polygons can be heavy, so simplify them (for
  example with Turf's `simplify`) before using them.
- Attribution to OpenStreetMap contributors is required.

---

## 2. Calendar and charts

**Selected library:** Apache ECharts

### Why ECharts was selected

- **Integrated calendar and heatmap.** ECharts includes calendar coordinates and heatmap series,
  so the challenge's central visualization does not need to be built from scratch.
- **Color ramps through `visualMap`.** One component maps counts to colors with continuous or
  stepped scales. This makes accessible palettes (viridis, cividis, ColorBrewer) and a
  **diverging** palette for anomalies against the historical median easy to apply.
- **One library for every chart.** The same tool covers the other outputs in the challenge:
  yearly hotspot bars and lines, anomaly charts against multi-year averages, and detected-fire
  counts.
- **Built-in interactivity.** Tooltips, legends, zoom, and click events let users hover over a
  month to see its count or click a cell to filter the map and table.
- **Built-in export helpers.** Charts can be saved as images with `getDataURL`, supporting the
  goal of downloading analyses and visualizations.
- **Faster delivery.** Compared with D3, which offers more control but requires much more code,
  ECharts lets a small team deliver a polished result within a hackathon timeline.

### Design notes

- **Year-by-month grid.** The native calendar component is organized by day. For a burning
  calendar with "years down and months across", use a **heatmap series over two categorical
  axes** (x = month, y = year). Use the native calendar view for a daily view of a selected
  year.
- **Two color scales.** Use a sequential ramp for raw counts and a diverging ramp centered on
  zero for anomalies. Do not rely on color alone: show the count in the tooltip and consider
  printing values inside cells.
- **Current month versus historical median.** Calculate the median for each calendar month
  across harmonized years and chart the current month's count against it (for example, with a
  bar plus a median line, or as a percentage anomaly).
- **Accessibility.** Choose color-blind-friendly palettes, ensure sufficient contrast, and
  keep text labels for key figures.

### Tradeoffs

- ECharts produces a larger bundle than some alternatives. Import only the chart types and
  components used (tree-shaking) to keep it manageable.
- If highly custom visualizations are needed that ECharts cannot express, D3 is the
  alternative, at the cost of more development time.

---

## Summary table

| Component | Role | Main reason for selection |
|---|---|---|
| WorldCover | Land-cover class per hotspot | Consistent global classification computed once in the pipeline |
| Leaflet | Base map | Simple, mature, many plugins, and sufficient for pre-aggregated data |
| Leaflet.draw | Draw the area of interest | Native drawing tools that generate GeoJSON |
| Turf.js | Browser spatial operations | Point-in-polygon, bounding box, and area without a backend |
| Nominatim | Place and boundary search | Select regions by name, with polygons for the area of interest |
| Apache ECharts | Calendar heatmap, anomalies, and charts | Integrated calendar/heatmap, flexible color ramps, fast implementation |

> Before finalizing, verify the current status of Leaflet.draw, Nominatim's usage policy, and
> WorldCover availability (hosting or tiles), as these details may change.
