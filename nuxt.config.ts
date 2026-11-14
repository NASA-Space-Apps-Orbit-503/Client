// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-open-fetch',
    '@nuxtjs/leaflet',
    'nuxt-echarts'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      useMocks: process.env.USE_MOCKS === 'true' || process.env.NUXT_PUBLIC_USE_MOCKS === 'true'
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

  openFetch: {
    clients: {
      api: {
        baseURL: process.env.NUXT_PUBLIC_API_BASE_URL
      }
    }
  }
})
