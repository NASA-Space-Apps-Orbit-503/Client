import healthMock from '~~/data/health.json'
import tablesMock from '~~/data/tables.json'
import rowsMock from '~~/data/rows.json'
import type { components } from '#open-fetch-schemas/api'
import { useMocksEnabled } from './config'

type TableInfo = components['schemas']['TableInfo']
type Rows = components['schemas']['Rows']
const typedHealthMock = healthMock as { ok: true }
const typedTablesMock = tablesMock as TableInfo[]
const typedRowsMock = rowsMock as Rows

export async function health(): Promise<{ ok: true }> {
  if (useMocksEnabled()) return typedHealthMock
  const { $api } = useNuxtApp()
  return $api('/health')
}

export async function listTables(): Promise<TableInfo[]> {
  if (useMocksEnabled()) return typedTablesMock
  const { $api } = useNuxtApp()
  return $api('/tables')
}

export async function previewTable(name: string, limit?: number): Promise<Rows> {
  if (useMocksEnabled()) return typedRowsMock.slice(0, limit ?? typedRowsMock.length)
  const { $api } = useNuxtApp()
  return $api('/tables/{name}', { path: { name }, query: { limit } })
}

export async function runQuery(sql: string): Promise<Rows> {
  if (useMocksEnabled()) return typedRowsMock
  const { $api } = useNuxtApp()
  return $api('/query', { method: 'POST', body: { sql } })
}
