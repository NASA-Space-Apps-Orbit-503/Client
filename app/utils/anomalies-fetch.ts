import StatsService from '~/services/stats.service'
import { AnomalySortEnum } from '~/enums/anomaly-sort.enum'
import type { AnomalyItem, AnomalyListQuery } from '~/types/api/stats'

/** Rows requested per API call. The server may cap it (`MAX_ROWS`); paging follows what it returns. */
const FETCH_ALL_PAGE_SIZE = 1000

/** Thrown when `shouldStop` returns true between pages. */
export class AnomaliesFetchCancelledError extends Error {}

/** Thrown when the result is larger than `maxRows` (checked after the first page). */
export class AnomaliesTooManyRowsError extends Error {
  constructor(public readonly total: number) {
    super(`Too many anomalies: ${total}`)
  }
}

export interface FetchAllAnomaliesOptions {
  /** Called after every page with the unique rows fetched so far and the server total. */
  onProgress?: (fetched: number, total: number) => void
  /** Checked before every request; returning true aborts with `AnomaliesFetchCancelledError`. */
  shouldStop?: () => boolean
  /** Abort with `AnomaliesTooManyRowsError` when the total exceeds this. */
  maxRows?: number
}

/**
 * Fetches every anomaly matching `query` (all pages), sorted by date for stable paging.
 * The offset advances by the rows actually returned and duplicates are dropped by `id`.
 */
export async function fetchAllAnomalies(query: AnomalyListQuery, options: FetchAllAnomaliesOptions = {}): Promise<AnomalyItem[]> {
  const rows = new Map<string, AnomalyItem>()
  let offset = 0
  let total = Infinity

  while (offset < total) {
    if (options.shouldStop?.()) throw new AnomaliesFetchCancelledError()

    const page = await StatsService.listAnomalies({
      ...query,
      sort: AnomalySortEnum.DateAsc,
      limit: FETCH_ALL_PAGE_SIZE,
      offset
    })

    total = page.total
    if (options.maxRows !== undefined && total > options.maxRows) throw new AnomaliesTooManyRowsError(total)

    for (const item of page.items) rows.set(item.id, item)
    options.onProgress?.(rows.size, total)

    if (!page.items.length) break
    offset += page.items.length
  }

  return [...rows.values()]
}
