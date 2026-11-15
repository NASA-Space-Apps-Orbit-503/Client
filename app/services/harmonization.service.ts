import reportMock from '~~/data/harmonization-report.json'
import runMock from '~~/data/harmonization-run.json'
import seriesMock from '~~/data/harmonized-series.json'
import type {
  HarmonizationReport,
  HarmonizationRun,
  HarmonizedSeries,
  HarmonizedSeriesQuery
} from '~/types/api/harmonization'
import { useMocksEnabled } from './config'

const typedReportMock = reportMock as HarmonizationReport
const typedRunMock = runMock as HarmonizationRun
const typedSeriesMock = seriesMock as HarmonizedSeries

const HarmonizationService = {
  async getHarmonizedSeries(query?: HarmonizedSeriesQuery): Promise<HarmonizedSeries> {
    if (useMocksEnabled()) return typedSeriesMock
    const { $api } = useNuxtApp()
    return $api('/stats/harmonized', { query })
  },

  async getHarmonizationReport(): Promise<HarmonizationReport> {
    if (useMocksEnabled()) return typedReportMock
    const { $api } = useNuxtApp()
    return $api('/stats/harmonization')
  },

  async rebuildHarmonization(): Promise<HarmonizationRun> {
    if (useMocksEnabled()) return typedRunMock
    const { $api } = useNuxtApp()
    return $api('/harmonization/rebuild', { method: 'POST' })
  }
}

export default HarmonizationService
