/** Anomaly severity returned by the API (`Severity` schema), by score: low ≥ 2, moderate ≥ 3, high ≥ 5, extreme ≥ 8. */
export enum SeverityEnum {
  Normal = 'normal',
  Low = 'low',
  Moderate = 'moderate',
  High = 'high',
  Extreme = 'extreme'
}

/** Severities accepted by the `severity` filter of `/stats/anomalies` (`normal` is not accepted). */
export const FILTERABLE_SEVERITIES = [
  SeverityEnum.Low,
  SeverityEnum.Moderate,
  SeverityEnum.High,
  SeverityEnum.Extreme
] as const

export type FilterableSeverity = typeof FILTERABLE_SEVERITIES[number]

/** Minimum score of each listed severity, as defined by the API contract (`Severity` schema). */
export const SEVERITY_MIN_SCORE: Record<FilterableSeverity, number> = {
  [SeverityEnum.Low]: 2,
  [SeverityEnum.Moderate]: 3,
  [SeverityEnum.High]: 5,
  [SeverityEnum.Extreme]: 8
}
