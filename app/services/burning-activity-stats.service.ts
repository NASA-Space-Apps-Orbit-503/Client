import statsMock from '~~/data/burning-activity-stats.json'
import statsPageMock from '~~/data/burning-activity-stat-page.json'
import type { components } from '#open-fetch-schemas/api'
import { useMocksEnabled } from './config'

type BurningActivityStat = components['schemas']['BurningActivityStat']
type NewBurningActivityStat = components['schemas']['NewBurningActivityStat']
type BurningActivityStatBulkCreated = components['schemas']['BurningActivityStatBulkCreated']
type BurningActivityStatPage = components['schemas']['BurningActivityStatPage']
const typedStatsMock = statsMock as BurningActivityStat[]
const typedStatsPageMock = statsPageMock as BurningActivityStatPage
const firstStatsMock = typedStatsMock[0]!

interface ListStatsQuery {
  year?: number
  month?: number
  limit?: number
  offset?: number
}

interface RebuildQuery {
  bbox?: string
  lat?: number
  lon?: number
  radius_km?: number
  polygon?: string
  from?: string
  to?: string
  instrument?: string
  satellite?: string
  min_confidence?: 'low' | 'nominal' | 'high'
  daynight?: 'D' | 'N'
  metric?: 'cells' | 'detections'
  cell_deg?: number
}

export async function listBurningActivityStats(query?: ListStatsQuery): Promise<BurningActivityStatPage> {
  if (useMocksEnabled()) return typedStatsPageMock
  const { $api } = useNuxtApp()
  return $api('/burning-activity-stats', { query })
}

export async function createBurningActivityStat(body: NewBurningActivityStat): Promise<BurningActivityStat> {
  if (useMocksEnabled()) return firstStatsMock
  const { $api } = useNuxtApp()
  return $api('/burning-activity-stats', { method: 'POST', body })
}

export async function createBurningActivityStatsBulk(body: NewBurningActivityStat[]): Promise<BurningActivityStatBulkCreated> {
  if (useMocksEnabled()) return { count: body.length, items: body.map((_, index) => typedStatsMock[index % typedStatsMock.length] ?? firstStatsMock) }
  const { $api } = useNuxtApp()
  return $api('/burning-activity-stats/bulk', { method: 'POST', body })
}

export async function rebuildBurningActivityStats(query?: RebuildQuery): Promise<{ rows: number, metric: 'cells' | 'detections', cell_deg: number | null }> {
  if (useMocksEnabled()) return { rows: typedStatsMock.length, metric: 'cells', cell_deg: 0.01 }
  const { $api } = useNuxtApp()
  return $api('/burning-activity-stats/rebuild', { method: 'POST', query })
}

export async function getBurningActivityStat(id: number): Promise<BurningActivityStat> {
  if (useMocksEnabled()) return typedStatsMock.find(stat => stat.id === id) ?? firstStatsMock
  const { $api } = useNuxtApp()
  return $api('/burning-activity-stats/{id}', { path: { id } })
}
