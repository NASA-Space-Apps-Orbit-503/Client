import type { SelectMenuItem } from '@nuxt/ui'
import { SatelliteEnum } from '~/enums/satellite.enum'

/** Satellite options for the filters, labelled with the instrument each one carries. */
export const SATELLITE_OPTIONS = [
  { id: SatelliteEnum.Terra, label: 'Terra (MODIS)' },
  { id: SatelliteEnum.Aqua, label: 'Aqua (MODIS)' },
  { id: SatelliteEnum.SuomiNpp, label: 'Suomi NPP (VIIRS)' },
  { id: SatelliteEnum.Noaa20, label: 'NOAA-20 (VIIRS)' },
  { id: SatelliteEnum.Noaa21, label: 'NOAA-21 (VIIRS)' }
] satisfies SelectMenuItem[]
