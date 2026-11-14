import { listInstruments, type Instrument } from '~/services/instruments.service'
import type { SelectMenuItem } from '@nuxt/ui'

export default function useFilters() {
  const filters = useState<Filters>('filters', () => ({
    dateRange: {
      start: null,
      end: null
    },
    latitude: null,
    longitude: null,
    instruments: []
  }))

  const instrumentsList = useState<SelectMenuItem[]>('instruments', () => [])

  const dateRange = computed({
    get: () => filters.value.dateRange,
    set: (value: DateRangeInput) => {
      filters.value.dateRange = value
    }
  })

  const latitude = computed({
    get: () => filters.value.latitude,
    set: (value: number | null) => {
      filters.value.latitude = value
    }
  })

  const longitude = computed({
    get: () => filters.value.longitude,
    set: (value: number | null) => {
      filters.value.longitude = value
    }
  })

  const instruments = computed({
    get: () => filters.value.instruments,
    set: (value: string[]) => {
      filters.value.instruments = value
    }
  })

  const getInstrumentsList = computed(() => instrumentsList.value)

  /**
   * Fetches the list of instruments from the API and updates the instruments state.
   * If the API call fails, it logs the error to the console.
   */
  const fetchInstruments = async () => {
    try {
      const data = await listInstruments()
      instrumentsList.value = data.map((instrument: Instrument) => ({
        id: instrument.code,
        label: instrument.name
      }))
    } catch (error) {
      console.error('Error fetching instruments:', error)
    }
  }

  const init = async () => {
    await fetchInstruments()
  }

  return {
    // Computed properties
    dateRange,
    latitude,
    longitude,
    instruments,
    getInstrumentsList,
    // Methods
    init,
    fetchInstruments
  }
}
