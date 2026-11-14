import type { DateValue } from '@internationalized/date'

export interface DateRangeInput {
  start: DateValue | undefined
  end: DateValue | undefined
}

export interface Filters {
  dateRange: DateRangeInput
  instruments: string[]
  latitude: number | null
  longitude: number | null
}
