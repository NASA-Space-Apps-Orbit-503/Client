<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { ANOMALY_COORDINATE_FORMAT } from '~/constants/anomaly-map'
import { SeverityEnum } from '~/enums/severity.enum'
import type { AnomalyItem } from '~/types/api/stats'
import { ANOMALIES_PAGE_SIZES, SORTABLE_ANOMALY_COLUMNS, type AnomaliesSorting } from '~/composables/useAnomalies'

defineProps<{
  items: AnomalyItem[]
  total: number
  loading: boolean
  error: unknown
  /** False until the filters are applied for the first time (Filter button or URL). */
  applied: boolean
}>()

const emit = defineEmits<{
  retry: []
}>()

const sorting = defineModel<AnomaliesSorting>('sorting', { required: true })
const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')

const { t } = useI18n()
const { formatDate, formatNumber } = useLocaleFormat()

type BadgeProps = { color: 'neutral' | 'info' | 'warning' | 'error', variant: 'subtle' | 'solid' }

const severityBadge: Record<SeverityEnum, BadgeProps> = {
  [SeverityEnum.Normal]: { color: 'neutral', variant: 'subtle' },
  [SeverityEnum.Low]: { color: 'info', variant: 'subtle' },
  [SeverityEnum.Moderate]: { color: 'warning', variant: 'subtle' },
  [SeverityEnum.High]: { color: 'error', variant: 'subtle' },
  [SeverityEnum.Extreme]: { color: 'error', variant: 'solid' }
}

const pageSizeItems = ANOMALIES_PAGE_SIZES.map(size => ({ label: String(size), value: size }))

type SortableColumn = { getIsSorted: () => false | 'asc' | 'desc', toggleSorting: (desc?: boolean) => void }

/** Header button that toggles server-side sorting for its column. */
function sortableHeader(label: string) {
  return ({ column }: { column: SortableColumn }) => {
    const sorted = column.getIsSorted()
    const icon = sorted === 'asc'
      ? 'i-lucide-arrow-up-narrow-wide'
      : sorted === 'desc' ? 'i-lucide-arrow-down-wide-narrow' : 'i-lucide-arrow-up-down'

    return h(UButton, {
      'color': 'neutral',
      'variant': 'ghost',
      'size': 'sm',
      label,
      'trailingIcon': icon,
      'class': '-mx-2.5',
      'aria-label': t('anomalies.sortBy', { column: label }),
      'onClick': () => column.toggleSorting(sorted === 'asc')
    })
  }
}

const header = (id: string, label: string) => SORTABLE_ANOMALY_COLUMNS.includes(id) ? sortableHeader(label) : label

const decimals = (digits: number) => ({ minimumFractionDigits: digits, maximumFractionDigits: digits })

const columns = computed<TableColumn<AnomalyItem>[]>(() => [
  {
    id: 'date',
    accessorKey: 'date',
    header: header('date', t('anomalies.columns.date')),
    cell: ({ row }) => formatDate(formatEpochDate(row.original.date))
  },
  {
    id: 'location',
    header: t('anomalies.columns.location'),
    enableSorting: false,
    cell: ({ row }) => {
      const { latitude, longitude, cell_deg } = row.original.location
      return h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'text-highlighted' }, `${formatNumber(latitude, ANOMALY_COORDINATE_FORMAT)}, ${formatNumber(longitude, ANOMALY_COORDINATE_FORMAT)}`),
        h('span', { class: 'text-xs text-muted' }, t('anomalies.cellSize', { size: formatNumber(cell_deg) }))
      ])
    }
  },
  {
    id: 'score',
    accessorKey: 'score',
    header: header('score', t('anomalies.columns.score')),
    cell: ({ row }) => formatNumber(row.original.score, decimals(2))
  },
  {
    id: 'observed',
    accessorKey: 'observed',
    header: header('observed', t('anomalies.columns.observed')),
    cell: ({ row }) => formatNumber(row.original.observed)
  },
  {
    id: 'expected',
    header: t('anomalies.columns.expected'),
    enableSorting: false,
    cell: ({ row }) => {
      const { expected, ratio } = row.original
      return h('div', { class: 'flex flex-col' }, [
        h('span', formatNumber(expected, { maximumFractionDigits: 2 })),
        ratio === null
          ? null
          : h('span', { class: 'text-xs text-muted' }, t('anomalies.ratio', { ratio: formatNumber(ratio, { maximumFractionDigits: 1 }) }))
      ])
    }
  },
  {
    id: 'severity',
    header: t('anomalies.columns.severity'),
    enableSorting: false,
    cell: ({ row }) => {
      const severity = row.original.severity as SeverityEnum
      return h(UBadge, {
        label: t(`severity.${severity}`),
        ...severityBadge[severity]
      })
    }
  }
])
</script>

<template>
  <div class="space-y-4">
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="t('anomalies.error.title')"
      :actions="[{ label: t('anomalies.error.retry'), color: 'error', variant: 'outline', onClick: () => emit('retry') }]"
    />

    <template v-else>
      <UTable
        v-model:sorting="sorting"
        :data="items"
        :columns="columns"
        :loading="loading"
        :sorting-options="{ manualSorting: true, enableSortingRemoval: false }"
        sticky
        class="max-h-128"
      >
        <template #empty>
          <UEmpty
            v-if="!applied"
            icon="i-lucide-filter"
            :title="t('anomalies.apply.promptTitle')"
            :description="t('anomalies.apply.promptDescription')"
            variant="naked"
          />
          <UEmpty
            v-else-if="!loading"
            icon="i-lucide-search-x"
            :title="t('anomalies.empty.title')"
            :description="t('anomalies.empty.description')"
            variant="naked"
          />
        </template>
      </UTable>

      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-default pt-4">
        <p class="text-sm text-muted">
          {{ t('anomalies.results', { count: formatNumber(total) }, total) }}
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <UFormField
            :label="t('anomalies.pageSize')"
            orientation="horizontal"
          >
            <USelect
              v-model="pageSize"
              :items="pageSizeItems"
              size="sm"
              class="w-20"
            />
          </UFormField>
          <UPagination
            v-model:page="page"
            :total="total"
            :items-per-page="pageSize"
            :sibling-count="1"
            size="sm"
          />
        </div>
      </div>
    </template>
  </div>
</template>
