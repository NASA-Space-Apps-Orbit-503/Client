import satellitesMock from '~~/data/satellites.json'
import type { Satellite } from '~/types/api/satellites'
import { useMocksEnabled } from './config'

const typedSatellitesMock = satellitesMock as Satellite[]

const SatellitesService = {
  async listSatellites(): Promise<Satellite[]> {
    if (useMocksEnabled()) return typedSatellitesMock
    // TODO: the contract has no satellites endpoint yet. Once it does, request it with the
    // generated client: `const { $api } = useNuxtApp(); return $api('/satellites')`.
    return typedSatellitesMock
  }
}

export default SatellitesService
