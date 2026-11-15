import { SeverityEnum } from '~/enums/severity.enum'

/** Latitude/longitude display format in the table and map popups: up to four decimals. */
export const ANOMALY_COORDINATE_FORMAT: Intl.NumberFormatOptions = { maximumFractionDigits: 4 }

/** Marker radius (px) on the anomalies map: default and slider range. */
export const ANOMALY_MARKER_SIZE = {
  default: 8,
  min: 4,
  max: 24,
  step: 1
} as const

/**
 * Marker fill per severity. Leaflet draws SVG attributes, which cannot use CSS variables,
 * so these are hex values matching the table badges (neutral, info, warning, error).
 */
export const SEVERITY_MARKER_COLORS: Record<SeverityEnum, string> = {
  [SeverityEnum.Normal]: '#94a3b8',
  [SeverityEnum.Low]: '#3b82f6',
  [SeverityEnum.Moderate]: '#f59e0b',
  [SeverityEnum.High]: '#ef4444',
  [SeverityEnum.Extreme]: '#991b1b'
}
