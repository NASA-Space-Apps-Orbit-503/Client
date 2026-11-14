import statsMock from '~~/data/burning-activity-stats.json'
import statsPageMock from '~~/data/burning-activity-stat-page.json'
import { MetricEnum } from '~/enums/metric.enum'
import type {
  BurningActivityStat,
  BurningActivityStatBulkCreated,
  BurningActivityStatPage,
  ListStatsQuery,
  NewBurningActivityStat,
  RebuildQuery,
  RebuildResponse
} from '~/types/api/burning-activity-stats'
import { useMocksEnabled } from './config'

const typedStatsMock = statsMock as BurningActivityStat[]
const typedStatsPageMock = statsPageMock as BurningActivityStatPage
const firstStatsMock = typedStatsMock[0]!

const BurningActivityStatsService = {
  async listBurningActivityStats(query?: ListStatsQuery): Promise<BurningActivityStatPage> {
    if (useMocksEnabled()) return typedStatsPageMock
    const { $api } = useNuxtApp()
    return $api('/burning-activity-stats', { query })
  },

  async createBurningActivityStat(body: NewBurningActivityStat): Promise<BurningActivityStat> {
    if (useMocksEnabled()) return firstStatsMock
    const { $api } = useNuxtApp()
    return $api('/burning-activity-stats', { method: 'POST', body }) as Promise<BurningActivityStat>
  },

  async createBurningActivityStatsBulk(body: NewBurningActivityStat[]): Promise<BurningActivityStatBulkCreated> {
    if (useMocksEnabled()) return { count: body.length, items: body.map((_, index) => typedStatsMock[index % typedStatsMock.length] ?? firstStatsMock) }
    const { $api } = useNuxtApp()
    return $api('/burning-activity-stats', { method: 'POST', body }) as Promise<BurningActivityStatBulkCreated>
  },

  async rebuildBurningActivityStats(query?: RebuildQuery): Promise<RebuildResponse> {
    if (useMocksEnabled()) return { rows: typedStatsMock.length, metric: MetricEnum.Cells, cell_deg: 0.01 }
    const { $api } = useNuxtApp()
    return $api('/burning-activity-stats/rebuild', { method: 'POST', query })
  },

  async getBurningActivityStat(id: number): Promise<BurningActivityStat> {
    if (useMocksEnabled()) return typedStatsMock.find(stat => stat.id === id) ?? firstStatsMock
    const { $api } = useNuxtApp()
    return $api('/burning-activity-stats/{id}', { path: { id } })
  }
}

export default BurningActivityStatsService
