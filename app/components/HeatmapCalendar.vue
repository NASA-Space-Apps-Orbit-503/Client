<script setup lang="ts">
import type { CalendarResponse } from '~/types/api/stats'
import { epochMonth, epochYear, formatEpochDate } from '~/utils/epoch'

const props = defineProps<{
  data: CalendarResponse
}>()

const { t } = useI18n()
const { formatNumber, monthName, metricLabel } = useTrendFormat()

const monthLabels = computed(() => Array.from({ length: 12 }, (_, month) => monthName(month + 1)))

const years = computed(() => {
  const itemYears = props.data.items.map(item => epochYear(item.date))
  const fromYear = props.data.from !== null ? epochYear(props.data.from) : Math.min(...itemYears)
  const toYear = props.data.to !== null ? epochYear(props.data.to) : Math.max(...itemYears)

  if (!Number.isFinite(fromYear) || !Number.isFinite(toYear)) return []

  return Array.from({ length: toYear - fromYear + 1 }, (_, index) => fromYear + index)
})

const maxCount = computed(() => Math.max(...props.data.items.map(item => item.count), 0))

const countByMonth = computed(() => {
  const counts = new Map<string, number>()

  for (const item of props.data.items) {
    counts.set(`${epochYear(item.date)}-${epochMonth(item.date)}`, item.count)
  }

  return counts
})

const legend = computed(() => Array.from({ length: 5 }, (_, level) => {
  // Match the same four equal intervals used by getIntensity, with zero separate.
  const minimum = level === 0 ? 0 : Math.floor(((level - 1) * maxCount.value) / 4) + 1
  const maximum = Math.floor((level * maxCount.value) / 4)
  return {
    level,
    minimum,
    maximum,
    range: minimum === maximum
      ? formatNumber(minimum)
      : `${formatNumber(minimum)}–${formatNumber(maximum)}`
  }
}).filter(entry => entry.minimum <= entry.maximum))
const cellClasses = ['bg-muted', 'bg-primary/20', 'bg-primary/40', 'bg-primary/60', 'bg-primary']

function getCount(year: number, month: number) {
  return countByMonth.value.get(`${year}-${month}`) ?? 0
}

function getIntensity(count: number) {
  if (!count || !maxCount.value) return 0
  return Math.min(4, Math.ceil((count / maxCount.value) * 4))
}

function getCellLabel(year: number, month: number, count: number) {
  return `${monthLabels.value[month - 1]} ${year}: ${formatNumber(count)} ${metricLabel(props.data.metric)}`
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="font-medium text-highlighted">
          {{ t('explore.calendar.monthly', { metric: metricLabel(data.metric) }) }}
        </p>
        <p class="text-muted text-sm">
          {{ data.from !== null ? formatEpochDate(data.from) : t('explore.calendar.startUnavailable') }} - {{ data.to !== null ? formatEpochDate(data.to) : t('explore.calendar.endUnavailable') }}
        </p>
      </div>
    </div>

    <div class="overflow-x-auto">
      <div
        class="grid min-w-3xl grid-cols-[4rem_repeat(12,minmax(1.5rem,1fr))] gap-1"
        role="grid"
        :aria-label="t('explore.calendar.title')"
      >
        <div aria-hidden="true" />
        <div
          v-for="month in monthLabels"
          :key="month"
          class="pb-1 text-center text-muted text-xs"
          role="columnheader"
        >
          {{ month }}
        </div>

        <template
          v-for="year in years"
          :key="year"
        >
          <div
            class="flex items-center text-highlighted text-sm"
            role="rowheader"
          >
            {{ year }}
          </div>
          <div
            v-for="month in 12"
            :key="`${year}-${month}`"
            class="min-h-7 rounded-sm"
            :class="cellClasses[getIntensity(getCount(year, month))]"
            :title="getCellLabel(year, month, getCount(year, month))"
            role="gridcell"
            :aria-label="getCellLabel(year, month, getCount(year, month))"
          />
        </template>
      </div>
    </div>

    <div
      class="space-y-2 text-sm"
      :aria-label="t('explore.calendar.legendTitle')"
    >
      <p class="font-medium text-highlighted">
        {{ t('explore.calendar.legendTitle') }} · {{ metricLabel(data.metric) }}
      </p>
      <ul class="flex flex-wrap gap-x-6 gap-y-3">
        <li
          v-for="entry in legend"
          :key="entry.level"
          class="flex items-center gap-2"
        >
          <span
            class="size-4 shrink-0 rounded-sm"
            :class="cellClasses[entry.level]"
            aria-hidden="true"
          />
          <span>
            {{ t(`explore.calendar.levels.${entry.level}`) }}:
            <span class="font-medium text-highlighted">{{ entry.range }}</span>
          </span>
        </li>
      </ul>
      <p class="text-muted text-xs">
        {{ t('explore.calendar.legendDescription') }}
      </p>
    </div>
  </div>
</template>
