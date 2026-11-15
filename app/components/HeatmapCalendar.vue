<script setup lang="ts">
import type { CalendarResponse } from '~/types/api/stats'
import { epochMonth, epochYear, formatEpochDate } from '~/utils/epoch'

const props = defineProps<{
  data: CalendarResponse
}>()

const monthLabels = computed(() =>
  Array.from({ length: 12 }, (_, month) =>
    new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(2024, month, 1))
  )
)

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

const legendLevels = [0, 1, 2, 3, 4]
const cellClasses = ['bg-muted', 'bg-primary/20', 'bg-primary/40', 'bg-primary/60', 'bg-primary']

function getCount(year: number, month: number) {
  return countByMonth.value.get(`${year}-${month}`) ?? 0
}

function getIntensity(count: number) {
  if (!count || !maxCount.value) return 0
  return Math.min(4, Math.ceil((count / maxCount.value) * 4))
}

function getCellLabel(year: number, month: number, count: number) {
  return `${monthLabels.value[month - 1]} ${year}: ${count.toLocaleString()} active cells`
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="font-medium text-highlighted">
          Monthly active cells
        </p>
        <p class="text-muted text-sm">
          {{ data.from !== null ? formatEpochDate(data.from) : 'Start unavailable' }} - {{ data.to !== null ? formatEpochDate(data.to) : 'End unavailable' }}
        </p>
      </div>
      <div class="flex items-center gap-2 text-muted text-xs">
        <span>Less</span>
        <span
          v-for="level in legendLevels"
          :key="level"
          class="size-3 rounded-sm"
          :class="cellClasses[level]"
          aria-hidden="true"
        />
        <span>More</span>
      </div>
    </div>

    <div class="overflow-x-auto">
      <div
        class="grid min-w-3xl grid-cols-[4rem_repeat(12,minmax(1.5rem,1fr))] gap-1"
        role="grid"
        aria-label="Monthly burning activity heatmap"
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
  </div>
</template>
