import { describe, expect, it } from 'vitest'
import { circleToQuery, pointCellBounds, pointToQuery } from '../app/utils/area'

describe('point spatial filter without a radius', () => {
  it('restricts the screenshot point to its local cell instead of the country', () => {
    expect(pointToQuery(13.775838, -88.673784)).toEqual({ bbox: '-88.68,13.77,-88.67,13.78' })
  })

  it.each([[13.77, -88.67], [13.78, -88.68], [-13.77, 88.67]])('keeps exact decimal boundaries in their own cell (%s, %s)', (lat, lon) => {
    const bounds = pointCellBounds(lat, lon)
    expect(bounds.south).toBe(lat)
    expect(bounds.west).toBe(lon)
  })

  it('contains points on either side of a cell boundary', () => {
    for (const lat of [13.769999, 13.770001, -13.770001]) {
      for (const lon of [-88.670001, -88.669999, 88.670001]) {
        const { west, south, east, north } = pointCellBounds(lat, lon)
        expect(lat).toBeGreaterThanOrEqual(south)
        expect(lat).toBeLessThan(north)
        expect(lon).toBeGreaterThanOrEqual(west)
        expect(lon).toBeLessThan(east)
      }
    }
  })

  it('still sends an explicit circle when a radius is supplied', () => {
    expect(circleToQuery({ lat: 13.775838, lon: -88.673784, radiusKm: 10 })).toEqual({ lat: 13.775838, lon: -88.673784, radius_km: 10 })
  })
})
