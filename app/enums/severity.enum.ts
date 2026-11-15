export enum SeverityEnum {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

/**
 * Inclusive upper bound of the anomaly score (0..100) for each severity level.
 * low: 0-35 · medium: >35-70 · high: >70-100
 */
export const SEVERITY_SCORE_MAX: Record<SeverityEnum, number> = {
  [SeverityEnum.Low]: 35,
  [SeverityEnum.Medium]: 70,
  [SeverityEnum.High]: 100
}
