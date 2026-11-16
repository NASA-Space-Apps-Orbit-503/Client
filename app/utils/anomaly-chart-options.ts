import { SEVERITY_POINT_SIZE, type AnomalyChartTheme } from '~/constants/anomaly-charts'
import { FILTERABLE_SEVERITIES, SEVERITY_MIN_SCORE } from '~/enums/severity.enum'
import type { SeverityPoints } from '~/composables/useAnomaliesCharts'

/**
 * ECharts option builders for the anomaly charts. Pure functions (no Vue/Nuxt state) so the
 * components stay thin and the options can be rendered and checked outside the app.
 */
export interface AnomalyChartContext {
  colors: AnomalyChartTheme
  /** vue-i18n `t` (named values + plural). */
  t: (key: string, named?: Record<string, unknown>, plural?: number) => string
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
  formatDate: (isoDate: string, options?: Intl.DateTimeFormatOptions) => string
  /** BCP 47 language of the active locale. */
  language: string
  monthNames: (style?: 'long' | 'short') => string[]
}

/** Above this many points per series ECharts switches to its large (batched) renderer. */
const SCATTER_LARGE_THRESHOLD = 2000

function tooltipBase(colors: AnomalyChartTheme) {
  return {
    backgroundColor: colors.surface,
    borderColor: colors.grid,
    textStyle: { color: colors.textPrimary }
  }
}

function valueAxis(ctx: AnomalyChartContext, name: string) {
  return {
    type: 'value',
    minInterval: 1,
    name,
    nameLocation: 'middle',
    nameGap: 44,
    nameTextStyle: { color: ctx.colors.textMuted },
    splitLine: { lineStyle: { color: ctx.colors.grid } },
    axisLabel: { color: ctx.colors.textMuted, formatter: (value: number) => ctx.formatNumber(value) }
  }
}

function categoryAxis(ctx: AnomalyChartContext, name: string, data: string[], boundaryGap = true) {
  return {
    type: 'category',
    data,
    boundaryGap,
    name,
    nameLocation: 'middle',
    nameGap: 32,
    nameTextStyle: { color: ctx.colors.textMuted },
    axisLine: { lineStyle: { color: ctx.colors.axis } },
    axisTick: { show: false },
    axisLabel: { color: ctx.colors.textMuted }
  }
}

/** Line: anomalies per month (Jan → Dec) for one year, or every year combined (`year` null). */
export function buildMonthlyLineOption(ctx: AnomalyChartContext, counts: number[], year: number | null) {
  const { colors, t } = ctx
  const longMonths = ctx.monthNames('long')
  const period = year === null ? t('anomalies.charts.allYears') : String(year)

  return {
    animationDuration: 300,
    grid: { left: 64, right: 24, top: 24, bottom: 48 },
    tooltip: {
      ...tooltipBase(colors),
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: colors.axis } },
      formatter: (params: { dataIndex: number, value: number }[]) => {
        const [point] = params
        if (!point) return ''
        return `<strong>${longMonths[point.dataIndex]} · ${period}</strong><br>${t('anomalies.charts.count', { count: ctx.formatNumber(point.value) }, point.value)}`
      }
    },
    xAxis: categoryAxis(ctx, t('anomalies.charts.month'), ctx.monthNames('short'), false),
    yAxis: valueAxis(ctx, t('anomalies.charts.anomalies')),
    series: [{
      type: 'line',
      name: t('anomalies.charts.anomalies'),
      data: counts,
      color: colors.series,
      lineStyle: { width: 2 },
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { borderColor: colors.surface, borderWidth: 2 },
      emphasis: { focus: 'series' }
    }]
  }
}

/**
 * Stacked bars: one bar per year, stacked by month (January at the base). Hue = quarter
 * (validated slots 1-4); the month is given by its stack position, the 2px gap and the tooltip.
 */
export function buildYearlyStackedOption(ctx: AnomalyChartContext, years: number[], counts: number[][]) {
  const { colors, t } = ctx
  const longMonths = ctx.monthNames('long')
  const yearLabels = years.map(String)
  const yearTotals = years.map((_, yearIndex) => counts.reduce((sum, month) => sum + (month[yearIndex] ?? 0), 0))

  return {
    animationDuration: 300,
    grid: { left: 64, right: 24, top: 24, bottom: 48 },
    tooltip: {
      ...tooltipBase(colors),
      trigger: 'item',
      formatter: (params: { seriesIndex: number, dataIndex: number, value: number }) => {
        const total = yearTotals[params.dataIndex] ?? 0
        return [
          `<strong>${longMonths[params.seriesIndex]} ${yearLabels[params.dataIndex]}</strong>`,
          t('anomalies.charts.count', { count: ctx.formatNumber(params.value) }, params.value),
          `<span style="color:${colors.textMuted}">${t('anomalies.charts.yearTotal', { count: ctx.formatNumber(total) }, total)}</span>`
        ].join('<br>')
      }
    },
    xAxis: categoryAxis(ctx, t('anomalies.charts.year'), yearLabels),
    yAxis: valueAxis(ctx, t('anomalies.charts.anomalies')),
    series: counts.map((data, month) => ({
      type: 'bar',
      name: longMonths[month],
      stack: 'months',
      data,
      barMaxWidth: 56,
      color: colors.quarters[Math.floor(month / 3)],
      // 1px border on each side = 2px surface gap between stacked segments
      itemStyle: { borderColor: colors.surface, borderWidth: 1 },
      emphasis: { focus: 'self' }
    }))
  }
}

/**
 * Scatter: date vs score, colored by severity (same colors as the map markers). Point size and
 * the y position (labeled threshold lines) encode severity too, so color is never the only cue.
 */
export function buildScoreScatterOption(ctx: AnomalyChartContext, groups: SeverityPoints[]) {
  const { colors, t } = ctx
  const monthYear = new Intl.DateTimeFormat(ctx.language, { month: 'short', year: 'numeric', timeZone: 'UTC' })
  const thresholds = FILTERABLE_SEVERITIES.map(severity => ({
    yAxis: SEVERITY_MIN_SCORE[severity],
    label: { formatter: t(`severity.${severity}`) }
  }))

  return {
    animationDuration: 300,
    grid: { left: 64, right: 88, top: 24, bottom: 80 },
    tooltip: {
      ...tooltipBase(colors),
      trigger: 'item',
      formatter: (params: { seriesIndex: number, dataIndex: number }) => {
        const row = groups[params.seriesIndex]?.rows[params.dataIndex]
        if (!row) return ''
        return [
          `<strong>${ctx.formatDate(formatEpochDate(row.date))}</strong>`,
          `${t('anomalies.columns.score')}: ${ctx.formatNumber(row.score, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${t('anomalies.columns.severity')}: ${t(`severity.${row.severity}`)}`,
          `${t('anomalies.columns.observed')}: ${ctx.formatNumber(row.observed)} · ${t('anomalies.columns.expected')}: ${ctx.formatNumber(row.expected, { maximumFractionDigits: 2 })}`
        ].join('<br>')
      }
    },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0, filterMode: 'none' },
      {
        type: 'slider',
        xAxisIndex: 0,
        height: 16,
        bottom: 8,
        // Themed so the slider stays recessive in both color modes
        borderColor: colors.grid,
        backgroundColor: 'transparent',
        fillerColor: colors.band,
        dataBackground: { lineStyle: { color: colors.axis, width: 1 }, areaStyle: { color: colors.grid } },
        selectedDataBackground: { lineStyle: { color: colors.series, width: 1 }, areaStyle: { color: colors.series, opacity: 0.15 } },
        handleStyle: { color: colors.surface, borderColor: colors.axis },
        moveHandleStyle: { color: colors.axis },
        textStyle: { color: colors.textMuted },
        labelFormatter: (value: number) => monthYear.format(new Date(value))
      }
    ],
    xAxis: {
      type: 'time',
      name: t('anomalies.columns.date'),
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: colors.textMuted },
      axisLine: { lineStyle: { color: colors.axis } },
      axisLabel: { color: colors.textMuted, hideOverlap: true, formatter: (value: number) => monthYear.format(new Date(value)) },
      splitLine: { show: false }
    },
    yAxis: { ...valueAxis(ctx, t('anomalies.columns.score')), minInterval: undefined },
    series: groups.map((group, index) => ({
      type: 'scatter',
      name: t(`severity.${group.severity}`),
      data: group.rows.map(row => [row.date, row.score]),
      symbolSize: SEVERITY_POINT_SIZE[group.severity],
      color: colors.severity[group.severity],
      // Surface ring keeps overlapping points apart
      itemStyle: { opacity: 0.7, borderColor: colors.surface, borderWidth: 1 },
      large: group.rows.length > SCATTER_LARGE_THRESHOLD,
      largeThreshold: SCATTER_LARGE_THRESHOLD,
      emphasis: { itemStyle: { opacity: 1 } },
      // Severity thresholds, drawn once (first series), labeled at the right edge
      ...(index === 0
        ? {
            markLine: {
              silent: true,
              symbol: 'none',
              lineStyle: { color: colors.axis, type: 'dashed', width: 1 },
              label: { position: 'end', color: colors.textMuted },
              data: thresholds
            }
          }
        : {})
    }))
  }
}
