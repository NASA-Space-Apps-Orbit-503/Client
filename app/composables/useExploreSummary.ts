import { getSummary } from '~/services/stats.service'
import type { InfoCard } from '~/types/info-card'

export default async function useExploreSummary() {
  const { data: summary, error: summaryError } = await useAsyncData(
    'explore-summary',
    () => getSummary()
  )

  const cards = computed<InfoCard[]>(() => {
    if (!summary.value) return []

    const { detections, total, first_date, last_date, by_instrument, top_months, metric } = summary.value
    const peakMonth = top_months[0]
    const instruments = by_instrument.map(({ instrument }) => instrument).join(' + ')
    const instrumentCounts = by_instrument
      .map(({ instrument, detections: count }) => `${instrument}: ${count.toLocaleString()}`)
      .join(' · ')

    return [
      {
        title: detections.toLocaleString(),
        description: 'Active fire detections',
        footer: first_date && last_date ? `${first_date} - ${last_date}. All sensors` : 'Date range unavailable',
        class: 'col-span-1 md:col-span-3 lg:col-span-3'
      },
      {
        title: peakMonth ? `${peakMonth.month}/${peakMonth.year}` : 'N/A',
        description: 'Peak activity period',
        footer: peakMonth ? `${peakMonth.count.toLocaleString()} detections` : 'No peak period available',
        class: 'col-span-1 md:col-span-3 lg:col-span-3'
      },
      {
        title: total.toLocaleString(),
        description: 'Total active cells',
        footer: `${metric} metric`,
        class: 'col-span-1 md:col-span-3 lg:col-span-3'
      },
      {
        title: instruments || 'N/A',
        description: 'Sensors represented',
        footer: instrumentCounts || 'No sensor data available',
        class: 'col-span-1 md:col-span-3 lg:col-span-3'
      }
    ]
  })

  if (summaryError.value) {
    console.error('Error fetching explore summary:', summaryError.value)
  }

  return {
    summary,
    summaryError,
    cards
  }
}
