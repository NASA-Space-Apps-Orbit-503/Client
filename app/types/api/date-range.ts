/**
 * Inclusive date range (YYYY-MM-DD). The API requires both dates together or neither:
 * sending only one responds 400, so the type does not allow it either.
 */
export type DateRangeQuery
  = | { startDate: string, endDate: string }
    | { startDate?: never, endDate?: never }
