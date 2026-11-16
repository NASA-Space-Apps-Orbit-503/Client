<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { TrendRow, TrendSort, TrendSortColumn } from '~/types/historical-trends'

/** Same shape as TanStack's `SortingState`, which `UTable` uses for `v-model:sorting`. */
type SortingState = Array<{ id: string, desc: boolean }>

const props = defineProps<{
  rows: TrendRow[]
  loading: boolean
  countLabel: string
}>()

const sort = defineModel<TrendSort | null>('sort', { default: null })

const { t } = useI18n()
const { formatNumber, formatChange, formatPct, periodLabel } = useTrendFormat()
const UButton = resolveComponent('UButton')

/** Sorting is done outside the table so the CSV can follow the same order. */
const sorting = computed<SortingState>({
  get: () => sort.value ? [sort.value] : [],
  set: (value) => {
    const [first] = value
    sort.value = first ? { id: first.id as TrendSortColumn, desc: first.desc } : null
  }
})

function sortableHeader(label: string) {
  return ({ column }: { column: { getIsSorted: () => false | 'asc' | 'desc', toggleSorting: (desc?: boolean) => void } }) => {
    const sorted = column.getIsSorted()
    const icon = sorted === 'asc'
      ? 'i-lucide-arrow-up-narrow-wide'
      : sorted === 'desc' ? 'i-lucide-arrow-down-wide-narrow' : 'i-lucide-arrow-up-down'

    return h(UButton, {
      'color': 'neutral',
      'variant': 'ghost',
      label,
      icon,
      'trailing': true,
      'class': '-mx-2.5',
      'aria-label': t('historicalTrends.table.sortBy', { column: label }),
      'onClick': () => column.toggleSorting(sorted === 'asc')
    })
  }
}

const columns = computed<TableColumn<TrendRow>[]>(() => [
  { id: 'period', accessorKey: 'key', header: sortableHeader(t('historicalTrends.table.period')) },
  { id: 'count', accessorKey: 'count', header: sortableHeader(props.countLabel), meta: { class: { th: 'text-right', td: 'text-right' } } },
  { id: 'change', accessorKey: 'change', header: sortableHeader(t('historicalTrends.table.change')), meta: { class: { th: 'text-right', td: 'text-right' } } },
  { id: 'changePct', accessorKey: 'changePct', header: sortableHeader(t('historicalTrends.table.changePct')), meta: { class: { th: 'text-right', td: 'text-right' } } }
])

function trendIcon(value: number | null) {
  if (!value) return 'i-lucide-minus'
  return value > 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'
}
</script>

<template>
  <UTable
    v-model:sorting="sorting"
    :data="rows"
    :columns="columns"
    :loading="loading"
    :empty="t('historicalTrends.empty.description')"
    :sorting-options="{ manualSorting: true }"
    sticky
    class="max-h-120"
  >
    <template #period-cell="{ row }">
      <span class="font-medium text-highlighted">{{ periodLabel(row.original, 'long') }}</span>
    </template>
    <template #count-cell="{ row }">
      <span class="tabular-nums">{{ formatNumber(row.original.count) }}</span>
    </template>
    <template #change-cell="{ row }">
      <span
        v-if="row.original.change === null"
        class="text-muted"
        :title="t('historicalTrends.table.firstPeriod')"
      >—</span>
      <span
        v-else
        class="inline-flex items-center gap-1 tabular-nums"
      >
        <!-- Keyed by icon: rows are reused by index and the icon would keep its previous name. -->
        <UIcon
          :key="trendIcon(row.original.change)"
          :name="trendIcon(row.original.change)"
          class="size-4 text-muted"
          aria-hidden="true"
        />
        {{ formatChange(row.original.change) }}
      </span>
    </template>
    <template #changePct-cell="{ row }">
      <span
        v-if="row.original.change === null"
        class="text-muted"
        :title="t('historicalTrends.table.firstPeriod')"
      >—</span>
      <span
        v-else-if="row.original.changePct === null"
        class="text-muted"
        :title="t('historicalTrends.table.fromZeroHint')"
      >{{ t('historicalTrends.table.fromZero') }}</span>
      <span
        v-else
        class="tabular-nums"
      >{{ formatPct(row.original.changePct) }}</span>
    </template>
  </UTable>
</template>
