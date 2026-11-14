import syncResultMock from '~~/data/sync-result.json'
import type { components } from '#open-fetch-schemas/api'
import { useMocksEnabled } from './config'

type SyncRequest = components['schemas']['SyncRequest']
type SyncResult = components['schemas']['SyncResult']
const typedSyncResultMock = syncResultMock as SyncResult

export async function syncFirms(body: SyncRequest): Promise<SyncResult> {
  if (useMocksEnabled()) return { ...typedSyncResultMock, ...body, area: body.area ?? typedSyncResultMock.area, days: body.days ?? typedSyncResultMock.days, date: body.date ?? typedSyncResultMock.date }
  const { $api } = useNuxtApp()
  return $api('/firms/sync', { method: 'POST', body })
}
