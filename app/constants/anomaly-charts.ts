import { SEVERITY_MARKER_COLORS } from '~/constants/anomaly-map'
import { SeverityEnum } from '~/enums/severity.enum'

/** Above this many matching anomalies the charts ask for confirmation before loading everything. */
export const ANOMALY_CHARTS_WARNING_ROWS = 50_000

/**
 * Chart colors, selected per color mode (validated with the dataviz palette validator against
 * the app surfaces: white in light mode, stone-900 `#1c1917` in dark mode).
 * - `series`: single-series hue (categorical slot 1).
 * - `quarters`: categorical slots 1-4, one hue per quarter (adjacent pairs pass CVD and
 *   normal-vision floors in both modes; light-mode aqua/yellow need relief → tooltips + table).
 * - `heatmap`: sequential blue ramp in 4 ordinal steps, low → high (validated with `--ordinal`).
 *   Dark mode flips the anchor: low steps sit near the dark surface, high steps are brightest.
 *   `heatmapZero` marks months without anomalies.
 * - `severity`: scatter point color per severity. Light mode = the map marker colors (same
 *   meaning across map, legend and scatter; passes all-pairs checks). Dark mode = darker/lighter
 *   steps of the same hues for the dark band; red vs dark red stays below the normal-vision
 *   floor (ΔE 12.2), so point size + y position remain as secondary encodings (user decision).
 * - text and grid: recessive ink matching the app's stone neutral.
 */
export const ANOMALY_CHART_THEME = {
  light: {
    series: '#2a78d6',
    quarters: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100'],
    surface: '#ffffff',
    textPrimary: '#1c1917',
    textMuted: '#57534e',
    grid: '#e7e5e4',
    axis: '#a8a29e',
    band: 'rgba(120, 113, 108, 0.06)',
    heatmap: ['#86b6ef', '#3987e5', '#1c5cab', '#0d366b'],
    heatmapZero: '#e7e5e4',
    severity: SEVERITY_MARKER_COLORS
  },
  dark: {
    series: '#3987e5',
    quarters: ['#3987e5', '#d95926', '#199e70', '#c98500'],
    surface: '#1c1917',
    textPrimary: '#f5f5f4',
    textMuted: '#a8a29e',
    grid: '#292524',
    axis: '#57534e',
    band: 'rgba(214, 211, 209, 0.06)',
    heatmap: ['#184f95', '#2a78d6', '#6da7ec', '#b7d3f6'],
    heatmapZero: '#292524',
    severity: {
      [SeverityEnum.Normal]: '#a8a29e',
      [SeverityEnum.Low]: '#3987e5',
      [SeverityEnum.Moderate]: '#c98500',
      [SeverityEnum.High]: '#e66767',
      [SeverityEnum.Extreme]: '#c03a5b'
    } as Record<SeverityEnum, string>
  }
} as const

export type AnomalyChartTheme = typeof ANOMALY_CHART_THEME[keyof typeof ANOMALY_CHART_THEME]

/**
 * Scatter point diameter (px) per severity: severity is encoded by size (and by the y position,
 * since it derives from the score), never by color alone. Minimum 8px per the marks spec.
 */
export const SEVERITY_POINT_SIZE: Record<SeverityEnum, number> = {
  [SeverityEnum.Normal]: 8,
  [SeverityEnum.Low]: 10,
  [SeverityEnum.Moderate]: 12,
  [SeverityEnum.High]: 15,
  [SeverityEnum.Extreme]: 18
}
