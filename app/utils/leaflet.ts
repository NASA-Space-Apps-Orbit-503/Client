import type { Circle, LatLng, Map as LeafletMap } from 'leaflet'
import { BASE_MAP_KEY } from '~/constants/map'

type LeafletModule = typeof import('leaflet')

let leafletPromise: Promise<LeafletModule> | undefined

/**
 * Loads Leaflet once, exposes it as `window.L` and registers the Leaflet.draw plugin on that
 * same instance. `<LMap use-global-leaflet>` reuses `window.L`, so map components and plugins
 * share one Leaflet. Client-only.
 */
export function loadLeaflet(): Promise<LeafletModule> {
  leafletPromise ??= (async () => {
    const leaflet = await import('leaflet') as LeafletModule & { default?: LeafletModule }
    window.L ??= leaflet.default ?? leaflet
    await import('leaflet-draw')
    patchLeafletDraw(window.L)
    return window.L
  })()

  return leafletPromise
}

/**
 * Leaflet.draw 1.0.4 still calls the private `_flat` helpers that Leaflet 1.9 deprecated (and
 * warns about on every call). Point them to the public replacement.
 */
function patchLeafletDraw(L: LeafletModule) {
  const lineUtil = L.LineUtil as typeof L.LineUtil & { _flat?: unknown }
  const polyline = L.Polyline as typeof L.Polyline & { _flat?: unknown }
  lineUtil._flat = L.LineUtil.isFlat
  polyline._flat = L.LineUtil.isFlat

  // `L.Edit.Circle#_resize` assigns an undeclared `radius` variable, which throws a
  // ReferenceError in strict mode and breaks resizing. Same logic with the variable declared.
  interface CircleEditHandler {
    _map: LeafletMap
    _moveMarker: { getLatLng: () => LatLng }
    _shape: Circle
  }
  const circleEdit = (L as unknown as { Edit: { Circle: { prototype: { _resize: (latlng: LatLng) => void } } } }).Edit.Circle
  circleEdit.prototype._resize = function (this: CircleEditHandler, latlng: LatLng) {
    const radius = this._map.distance(this._moveMarker.getLatLng(), latlng)
    this._shape.setRadius(radius)
    this._map.fire(L.Draw.Event.EDITRESIZE, { layer: this._shape })
  }
}

const MAP_CONTROL_SELECTOR = '.leaflet-control-container'

/**
 * Touch support for Leaflet.draw on Leaflet 1.9.
 *
 * Leaflet.draw listens to `touchstart`/`touchmove` *map* events to draw rectangles, circles and
 * polygon vertices, but Leaflet 1.8+ no longer fires them. While a draw tool is active, native
 * touches on the map (not on its controls) are forwarded as map events with their `latlng`.
 * `touchstart` is also prevented so the browser does not scroll or emit emulated mouse events,
 * which would add duplicated vertices. Returns the function that removes the bridge.
 */
export function enableDrawTouchBridge(map: LeafletMap) {
  const L = window.L
  const container = map.getContainer()
  let drawing = false

  const onDrawStart = () => {
    drawing = true
  }
  const onDrawStop = () => {
    drawing = false
  }

  const forward = (event: TouchEvent) => {
    if (!drawing) return
    if ((event.target as Element | null)?.closest?.(MAP_CONTROL_SELECTOR)) return

    const touch = event.touches[0] ?? event.changedTouches[0]
    if (!touch) return
    if (event.type === 'touchstart' && event.cancelable) event.preventDefault()

    const containerPoint = map.mouseEventToContainerPoint(touch as unknown as MouseEvent)
    const layerPoint = map.containerPointToLayerPoint(containerPoint)
    map.fire(event.type, {
      originalEvent: event,
      containerPoint,
      layerPoint,
      latlng: map.layerPointToLatLng(layerPoint)
    })
  }

  map.on(L.Draw.Event.DRAWSTART, onDrawStart)
  map.on(L.Draw.Event.DRAWSTOP, onDrawStop)
  container.addEventListener('touchstart', forward, { passive: false })
  container.addEventListener('touchmove', forward, { passive: true })

  return () => {
    map.off(L.Draw.Event.DRAWSTART, onDrawStart)
    map.off(L.Draw.Event.DRAWSTOP, onDrawStop)
    container.removeEventListener('touchstart', forward)
    container.removeEventListener('touchmove', forward)
  }
}

/** Returns the map provided by the closest `<BaseMap />`. */
export function useBaseMap() {
  const map = inject(BASE_MAP_KEY)
  if (!map) throw new Error('useBaseMap() must be used inside <BaseMap />')
  return map
}
