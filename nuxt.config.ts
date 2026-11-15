// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-open-fetch',
    '@nuxtjs/leaflet',
    'nuxt-echarts',
    '@nuxtjs/i18n'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css', 'leaflet-draw/dist/leaflet.draw.css'],

  runtimeConfig: {
    public: {
      useMocks: process.env.USE_MOCKS === 'true' || process.env.NUXT_PUBLIC_USE_MOCKS === 'true',
      // Base map tiles. Set with NUXT_PUBLIC_MAP_TILE_URL and NUXT_PUBLIC_MAP_ATTRIBUTION.
      mapTileUrl: '',
      mapAttribution: ''
    }
  },

  routeRules: {
    '/': {
      prerender: true,
      redirect: '/explore'
    }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'es', name: 'Spanish', file: 'es.json' }
    ]
  },

  openFetch: {
    clients: {
      api: {
        baseURL: process.env.NUXT_PUBLIC_API_BASE_URL
      }
    }
  }
})