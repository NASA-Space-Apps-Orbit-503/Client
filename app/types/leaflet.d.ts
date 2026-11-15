/// <reference types="leaflet-draw" />

declare global {
  interface Window {
    L: typeof import('leaflet')
  }
}

export {}
