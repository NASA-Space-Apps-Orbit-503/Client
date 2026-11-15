<script setup lang="ts">
import type { AnomalyListQuery } from '~/types/api/stats'
import { ANOMALIES_EXPORT_WARNING_ROWS } from '~/composables/useAnomaliesExport'

const props = defineProps<{
  /** Current filters, without paging or sorting. */
  filterQuery: AnomalyListQuery
  /** Rows matching the filters. */
  total: number
  /** True while the table is loading: the total may be stale. */
  loading: boolean
}>()

const { t } = useI18n()
const { formatNumber } = useLocaleFormat()

const {
  canExport,
  exporting,
  exportedRows,
  expectedRows,
  progress,
  confirmOpen,
  requestExport,
  runExport,
  cancelExport
} = useAnomaliesExport(toRef(props, 'filterQuery'), toRef(props, 'total'))

const disabled = computed(() => props.loading || !canExport.value)
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <template v-if="exporting">
      <div
        class="flex min-w-48 flex-col gap-1"
        role="status"
        aria-live="polite"
      >
        <span class="text-xs text-muted">
          {{ t('anomalies.csv.progress', { done: formatNumber(exportedRows), total: formatNumber(expectedRows) }) }}
        </span>
        <UProgress
          :model-value="progress"
          size="sm"
        />
      </div>
      <UButton
        :label="t('anomalies.csv.cancel')"
        icon="i-lucide-x"
        color="neutral"
        variant="outline"
        size="sm"
        @click="cancelExport"
      />
    </template>
    <UTooltip
      v-else
      :text="total === 0 ? t('anomalies.csv.disabledEmpty') : undefined"
      :disabled="total > 0"
    >
      <UButton
        :label="t('anomalies.csv.download')"
        icon="i-lucide-download"
        size="sm"
        :disabled="disabled"
        @click="requestExport"
      />
    </UTooltip>

    <UModal
      v-model:open="confirmOpen"
      :title="t('anomalies.csv.confirmTitle')"
      :description="t('anomalies.csv.confirmDescription', { count: formatNumber(total), limit: formatNumber(ANOMALIES_EXPORT_WARNING_ROWS) })"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            :label="t('anomalies.csv.cancel')"
            color="neutral"
            variant="outline"
            @click="confirmOpen = false"
          />
          <UButton
            :label="t('anomalies.csv.confirm')"
            icon="i-lucide-download"
            @click="runExport"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
