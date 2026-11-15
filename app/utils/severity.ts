import { SEVERITY_SCORE_MAX, SeverityEnum } from '~/enums/severity.enum'

/**
 * Maps an anomaly score (0..100) to its severity level.
 */
export function getSeverity(score: number): SeverityEnum {
  if (score <= SEVERITY_SCORE_MAX[SeverityEnum.Low]) return SeverityEnum.Low
  if (score <= SEVERITY_SCORE_MAX[SeverityEnum.Medium]) return SeverityEnum.Medium
  return SeverityEnum.High
}
