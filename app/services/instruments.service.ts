import instrumentsMock from '~~/data/instruments.json'
import type { components } from '#open-fetch-schemas/api'
import { useMocksEnabled } from './config'

type Instrument = components['schemas']['Instrument']
type NewInstrument = components['schemas']['NewInstrument']
type InstrumentBulkCreated = components['schemas']['InstrumentBulkCreated']
const typedInstrumentsMock = instrumentsMock as Instrument[]
const firstInstrumentMock = typedInstrumentsMock[0]!

export async function listInstruments(): Promise<Instrument[]> {
  if (useMocksEnabled()) return typedInstrumentsMock
  const { $api } = useNuxtApp()
  return $api('/instruments')
}

export async function createInstrument(body: NewInstrument): Promise<Instrument> {
  if (useMocksEnabled()) return firstInstrumentMock
  const { $api } = useNuxtApp()
  return $api('/instruments', { method: 'POST', body })
}

export async function createInstrumentsBulk(body: NewInstrument[]): Promise<InstrumentBulkCreated> {
  if (useMocksEnabled()) return { count: body.length, items: body.map((_, index) => typedInstrumentsMock[index % typedInstrumentsMock.length] ?? firstInstrumentMock) }
  const { $api } = useNuxtApp()
  return $api('/instruments/bulk', { method: 'POST', body })
}

export async function getInstrument(id: number): Promise<Instrument> {
  if (useMocksEnabled()) return typedInstrumentsMock.find(instrument => instrument.id === id) ?? firstInstrumentMock
  const { $api } = useNuxtApp()
  return $api('/instruments/{id}', { path: { id } })
}
