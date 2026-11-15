<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { AnomalySortEnum } from '~/enums/anomaly-sort.enum'
import { SeverityEnum } from '~/enums/severity.enum'
import type { AnomalyItem } from '~/types/api/stats'
import { ANOMALIES_PAGE_SIZES, type AnomaliesSorting } from '~/composables/useAnomalies'

defineProps<{
  items: AnomalyItem[]
  total: number
  loading: boolean
  error: unknown
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

const severityColors: Record<SeverityEnum, 'info' | 'warning' | 'error'> = {
  [SeverityEnum.Low]: 'info',
  [SeverityEnum.Medium]: 'warning',
  [SeverityEnum.High]: 'error'
}

const pageSizeItems = ANOMALIES_PAGE_SIZES.map(size => ({ label: String(size), value: size }))

/** Header button that toggles server-side sorting for its column. */
function sortableHeader(label: string) {
  return ({ column }: { column: { getIsSorted: () => false | 'asc' | 'desc', toggleSorting: (desc?: boolean) => void } }) => {
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

const columns = computed<TableColumn<AnomalyItem>[]>(() => [
  {
    id: AnomalySortEnum.Date,
    accessorKey: 'date',
    header: sortableHeader(t('anomalies.columns.date')),
    cell: ({ row }) => formatDate(row.original.date)
  },
  {
    id: 'location',
    header: t('anomalies.columns.location'),
    enableSorting: false,
    cell: ({ row }) => h('div', { class: 'flex flex-col' }, [
      h('span', { class: 'text-highlighted' }, row.original.region ?? t('anomalies.unknownRegion')),
      h('span', { class: 'text-xs text-muted' }, `${formatNumber(row.original.latitude, { maximumFractionDigits: 2 })}, ${formatNumber(row.original.longitude, { maximumFractionDigits: 2 })}`)
    ])
  },
  {
    id: AnomalySortEnum.Score,
    accessorKey: 'score',
    header: sortableHeader(t('anomalies.columns.score')),
    cell: ({ row }) => formatNumber(row.original.score, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  },
  {
    id: AnomalySortEnum.Observed,
    accessorKey: 'observed',
    header: sortableHeader(t('anomalies.columns.observed')),
    cell: ({ row }) => formatNumber(row.original.observed)
  },
  {
    id: AnomalySortEnum.Expected,
    accessorKey: 'expected',
    header: sortableHeader(t('anomalies.columns.expected')),
    cell: ({ row }) => formatNumber(row.original.expected, { maximumFractionDigits: 1 })
  },
  {
    id: 'severity',
    header: t('anomalies.columns.severity'),
    enableSorting: false,
    cell: ({ row }) => {
      const severity = getSeverity(row.original.score)
      return h(UBadge, {
        label: t(`severity.${severity}`),
        color: severityColors[severity],
        variant: 'subtle'
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
        class="max-h-[32rem]"
      >
        <template #empty>
          <UEmpty
            v-if="!loading"
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
