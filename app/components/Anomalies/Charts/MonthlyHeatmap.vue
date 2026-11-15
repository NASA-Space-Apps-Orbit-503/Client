<script setup lang="ts">
/**
 * Year × month heatmap of anomaly counts (rows = years, columns = months).
 * Sequential one-hue ramp in 4 ordinal steps (validated per color mode); empty months use a
 * neutral swatch. Exact counts are in each cell's tooltip and aria-label.
 */
const props = defineProps<{
  /** Years present in the data, ascending. */
  years: number[]
  /** `counts[month][yearIndex]`, month 0 = January, aligned with `years`. */
  counts: number[][]
}>()

const LEVELS = 4

const { t } = useI18n()
const { formatNumber, monthNames } = useLocaleFormat()
const theme = useAnomalyChartTheme()

/** Every year from the first to the last, so years without anomalies show as empty rows. */
const rowYears = computed(() => {
  const [first] = props.years
  const last = props.years.at(-1)
  if (first === undefined || last === undefined) return []
  return Array.from({ length: last - first + 1 }, (_, index) => first + index)
})

const countByYearMonth = computed(() => {
  const map = new Map<string, number>()
  props.years.forEach((year, yearIndex) => {
    props.counts.forEach((months, month) => map.set(`${year}-${month}`, months[yearIndex] ?? 0))
  })
  return map
})

const maxCount = computed(() => Math.max(0, ...props.counts.flat()))

/** 0 = no anomalies, 1..LEVELS = share of the maximum. */
function level(count: number) {
  if (!count || !maxCount.value) return 0
  return Math.min(LEVELS, Math.ceil((count / maxCount.value) * LEVELS))
}

function cellColor(count: number) {
  const step = level(count)
  return step ? theme.value.heatmap[step - 1] : theme.value.heatmapZero
}

const shortMonths = computed(() => monthNames('short'))
const longMonths = computed(() => monthNames('long'))

const rows = computed(() => rowYears.value.map(year => ({
  year,
  cells: Array.from({ length: 12 }, (_, month) => {
    const count = countByYearMonth.value.get(`${year}-${month}`) ?? 0
    return {
      month,
      count,
      color: cellColor(count),
      label: `${longMonths.value[month]} ${year}: ${t('anomalies.charts.count', { count: formatNumber(count) }, count)}`
    }
  })
})))

/** Legend: the empty swatch, then each step with the count range it covers. */
const legend = computed(() => {
  const max = maxCount.value
  const steps = Array.from({ length: LEVELS }, (_, index) => {
    const from = Math.floor((index * max) / LEVELS) + 1
    const to = Math.floor(((index + 1) * max) / LEVELS)
    return { color: theme.value.heatmap[index], from, to }
  }).filter(step => step.from <= step.to)

  return [
    { color: theme.value.heatmapZero, label: '0' },
    ...steps.map(step => ({
      color: step.color,
      label: step.from === step.to
        ? formatNumber(step.from)
        : t('anomalies.charts.heatmap.range', { from: formatNumber(step.from), to: formatNumber(step.to) })
    }))
  ]
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <ul
      class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted"
      :aria-label="t('anomalies.charts.heatmap.legend')"
    >
      <li
        v-for="item in legend"
        :key="item.label"
        class="flex items-center gap-1.5"
      >
        <span
          class="size-3 rounded-sm ring-1 ring-default"
          :style="{ backgroundColor: item.color }"
          aria-hidden="true"
        />
        {{ item.label }}
      </li>
    </ul>

    <div class="overflow-x-auto">
      <div
        class="grid min-w-3xl grid-cols-[4rem_repeat(12,minmax(1.5rem,1fr))] gap-0.5"
        role="grid"
        :aria-label="t('anomalies.charts.heatmap.ariaLabel')"
      >
        <div
          role="row"
          class="contents"
        >
          <div aria-hidden="true" />
          <div
            v-for="month in shortMonths"
            :key="month"
            class="pb-1 text-center text-xs text-muted"
            role="columnheader"
          >
            {{ month }}
          </div>
        </div>

        <div
          v-for="row in rows"
          :key="row.year"
          role="row"
          class="contents"
        >
          <div
            class="flex items-center text-sm text-highlighted"
            role="rowheader"
          >
            {{ row.year }}
          </div>
          <UTooltip
            v-for="cell in row.cells"
            :key="cell.month"
            :text="cell.label"
          >
            <div
              class="min-h-8 rounded-sm"
              :style="{ backgroundColor: cell.color }"
              role="gridcell"
              :aria-label="cell.label"
            />
          </UTooltip>
        </div>
      </div>
    </div>
  </div>
</template>
