import type { components } from '#open-fetch-schemas/api'

export type HealthResponse = { ok: true }
export type TableInfo = components['schemas']['TableInfo']
export type Rows = components['schemas']['Rows']

export interface PreviewTableQuery {
  limit?: number
}

export interface RunQueryBody {
  sql: string
}
