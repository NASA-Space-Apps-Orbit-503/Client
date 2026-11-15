import type { components } from '#open-fetch-schemas/api'

export type HarmonizationRun = components['schemas']['HarmonizationRun']
export type HarmonizationParams = components['schemas']['HarmonizationParams']
export type HarmonizationStatus = components['schemas']['HarmonizationStatus']
export type HarmonizationFactor = components['schemas']['HarmonizationFactor']
export type HarmonizationValidationYear = components['schemas']['HarmonizationValidationYear']
export type HarmonizationReport = components['schemas']['HarmonizationReport']
export type HarmonizedMonth = components['schemas']['HarmonizedMonth']
export type HarmonizedSeries = components['schemas']['HarmonizedSeries']
export type AnomalyLevel = components['schemas']['AnomalyLevel']

export interface HarmonizedSeriesQuery {
  from?: string
  to?: string
  /** One or more comma-separated years, e.g. "2023,2024". */
  year?: string
  /** One or more comma-separated months (1-12), e.g. "3,4". */
  month?: string
  /** Only complete months. */
  complete?: boolean
}
