<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { en, es } from '@nuxt/ui/locale'

useFilters()

const { t, locale, locales, setLocale } = useI18n()

const uiLocales = { en, es }
const uiLocale = computed(() => uiLocales[locale.value as keyof typeof uiLocales] ?? en)

const localeItems = computed(() => locales.value.map(item => ({ label: item.name ?? item.code, value: item.code })))
const selectedLocale = computed({
  get: () => locale.value,
  set: value => setLocale(value)
})

useHead({
  htmlAttrs: {
    lang: computed(() => uiLocale.value.code)
  }
})

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: t('nav.explore'),
    to: '/explore'
  },
  {
    label: t('nav.historicalTrends'),
    to: '/historical-trends'
  },
  {
    label: t('nav.anomalies'),
    to: '/anomalies'
  },
  {
    label: t('nav.methodology'),
    to: '/methodology'
  }
])
</script>

<template>
  <UApp :locale="uiLocale">
    <UHeader>
      <template #left>
        <UNavigationMenu :items="items" />
      </template>
      <template #right>
        <UBadge class="hidden sm:inline-flex">
          {{ t('nav.demoBadge') }}
        </UBadge>
        <USelect
          v-model="selectedLocale"
          :items="localeItems"
          :aria-label="t('nav.language')"
          icon="i-lucide-languages"
          size="sm"
          class="w-32"
        />
      </template>
      <template #body>
        <UNavigationMenu
          :items="items"
          orientation="vertical"
        />
      </template>
    </UHeader>
    <UMain>
      <slot />
    </UMain>
    <UFooter>Made with ❤️ by Orbit 503</UFooter>
  </UApp>
</template>
