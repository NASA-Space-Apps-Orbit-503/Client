import { InstrumentEnum } from '~/enums/instrument.enum'

/** Shared by detection markers, their information popups and the map legend. */
export const INSTRUMENT_COLORS = {
  [InstrumentEnum.Modis]: '#2a78d6',
  [InstrumentEnum.Viirs]: '#eb6834'
} as const
