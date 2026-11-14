import instrumentsMock from '~~/data/instruments.json'
import type { Instrument, InstrumentBulkCreated, NewInstrument } from '~/types/api/instruments'
import { useMocksEnabled } from './config'

const typedInstrumentsMock = instrumentsMock as Instrument[]
const firstInstrumentMock = typedInstrumentsMock[0]!

const InstrumentsService = {
  async listInstruments(): Promise<Instrument[]> {
    if (useMocksEnabled()) return typedInstrumentsMock
    const { $api } = useNuxtApp()
    return $api('/instruments')
  },

  async createInstrument(body: NewInstrument): Promise<Instrument> {
    if (useMocksEnabled()) return firstInstrumentMock
    const { $api } = useNuxtApp()
    return $api('/instruments', { method: 'POST', body })
  },

  async createInstrumentsBulk(body: NewInstrument[]): Promise<InstrumentBulkCreated> {
    if (useMocksEnabled()) return { count: body.length, items: body.map((_, index) => typedInstrumentsMock[index % typedInstrumentsMock.length] ?? firstInstrumentMock) }
    const { $api } = useNuxtApp()
    return $api('/instruments/bulk', { method: 'POST', body })
  },

  async getInstrument(id: number): Promise<Instrument> {
    if (useMocksEnabled()) return typedInstrumentsMock.find(instrument => instrument.id === id) ?? firstInstrumentMock
    const { $api } = useNuxtApp()
    return $api('/instruments/{id}', { path: { id } })
  }
}

export default InstrumentsService
