import syncResultMock from '~~/data/sync-result.json'
import type { SyncRequest, SyncResult } from '~/types/api/firms'
import { useMocksEnabled } from './config'

const typedSyncResultMock = syncResultMock as SyncResult

const FirmsService = {
  async syncFirms(body: SyncRequest): Promise<SyncResult> {
    if (useMocksEnabled()) return { ...typedSyncResultMock, ...body, area: body.area ?? typedSyncResultMock.area, days: body.days ?? typedSyncResultMock.days, date: body.date ?? typedSyncResultMock.date }
    const { $api } = useNuxtApp()
    return $api('/firms/sync', { method: 'POST', body })
  }
}

export default FirmsService
