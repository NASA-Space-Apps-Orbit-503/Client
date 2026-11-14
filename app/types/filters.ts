import type { DateValue } from '@internationalized/date'
import type { SelectMenuItem } from '@nuxt/ui'

export interface DateRangeInput {
  start: DateValue | undefined
  end: DateValue | undefined
}

export interface Filters {
  dateRange: DateRangeInput
  instruments: SelectMenuItem[]
  latitude: number | null
  longitude: number | null
}
