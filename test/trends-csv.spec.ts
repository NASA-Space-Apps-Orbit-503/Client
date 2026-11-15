import { describe, expect, it } from 'vitest'
import { buildTrendsCsv } from '../app/utils/trends-csv'
import { TrendSeriesEnum } from '../app/enums/trend-series.enum'

const first = { key: '2024-04', year: 2024, month: 4, count: 15, change: 3, changePct: 25 }
const input = {
  sensorRows: [{ key: '2024-04', modis: 9, viirs: 12 }],
  rows: [first],
  lineSeries: [
    { id: TrendSeriesEnum.Modis, points: [{ key: '2024-04', count: 109 }] },
    { id: TrendSeriesEnum.Viirs, points: [{ key: '2024-04', count: 773 }] },
    { id: TrendSeriesEnum.Harmonized, points: [{ key: '2024-04', count: 85.84445594067942 }] }
  ],
  headers: ['Period', 'Cells', 'Change', 'Change %', 'MODIS', 'VIIRS', 'Regional MODIS', 'Regional VIIRS', 'Harmonized']
}

describe('complete trends CSV', () => {
  it('exports one rectangular CSV with visible summary, filtered sensors and regional harmonization', () => {
    const csv = buildTrendsCsv(input)
    expect(csv.charCodeAt(0)).toBe(0xFEFF)
    expect(csv.split('\r\n')[1]).toBe('2024-04,15,3,25,9,12,109,773,85.84445594067942')
    expect(csv.split('\r\n')[0]?.slice(1).split(',')).toHaveLength(9)
  })

  it('keeps table order, measured zeros and unknown values', () => {
    const csv = buildTrendsCsv({
      ...input,
      rows: [{ ...first, key: '2024-05', count: 0, change: null, changePct: null }, first],
      sensorRows: [{ key: '2024-05', modis: 0, viirs: null }]
    })
    expect(csv.split('\r\n')[1]).toBe('2024-05,0,,,0,,,,')
    expect(csv.split('\r\n')[2]?.startsWith('2024-04,15,3,25,,,109,773,85.84445594067942')).toBe(true)
  })
})
