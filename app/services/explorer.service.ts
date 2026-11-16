import healthMock from '~~/data/health.json'
import tablesMock from '~~/data/tables.json'
import rowsMock from '~~/data/rows.json'
import type { HealthResponse, PreviewTableQuery, Rows, RunQueryBody, TableInfo } from '~/types/api/explorer'
import { useMocksEnabled } from './config'

const typedHealthMock = healthMock as HealthResponse
const typedTablesMock = tablesMock as TableInfo[]
const typedRowsMock = rowsMock as Rows

const ExplorerService = {
  async health(): Promise<{ ok: true }> {
    if (useMocksEnabled()) return typedHealthMock
    const { $api } = useNuxtApp()
    return $api('/health')
  },

  async listTables(): Promise<TableInfo[]> {
    if (useMocksEnabled()) return typedTablesMock
    const { $api } = useNuxtApp()
    return $api('/tables')
  },

  async previewTable(name: string, limit?: number): Promise<Rows> {
    const query: PreviewTableQuery = { limit }
    if (useMocksEnabled()) return typedRowsMock.slice(0, query.limit ?? typedRowsMock.length)
    const { $api } = useNuxtApp()
    return $api('/tables/{name}', { path: { name }, query })
  },

  async runQuery(sql: string): Promise<Rows> {
    const body: RunQueryBody = { sql }
    if (useMocksEnabled()) return typedRowsMock
    const { $api } = useNuxtApp()
    return $api('/query', { method: 'POST', body })
  }
}

export default ExplorerService
