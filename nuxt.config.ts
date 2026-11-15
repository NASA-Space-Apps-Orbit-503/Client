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

  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'root'
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
