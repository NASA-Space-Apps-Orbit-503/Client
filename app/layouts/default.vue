<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { en, es } from '@nuxt/ui/locale'

useFilters()

const { $i18n } = useNuxtApp()
const { t, locale } = useI18n()

const items = ref<NavigationMenuItem[]>([
  {
    label: t('header.nav.explore'),
    to: '/explore'
  },
  {
    label: t('header.nav.historicalTrends'),
    to: '/historical-trends'
  },
  {
    label: t('header.nav.anomalies'),
    to: '/anomalies'
  },
  {
    label: t('header.nav.methodology'),
    to: '/methodology'
  }
])
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <UNavigationMenu :items="items" />
      </template>
      <template #right>
        <ULocaleSelect
          :model-value="locale"
          :locales="[en, es]"
          @update:model-value="$i18n.setLocale($event as Parameters<typeof $i18n.setLocale>[0])"
        />
        <UBadge>Demo. Not connected to a live feed</UBadge>
      </template>
    </UHeader>
    <UMain>
      <slot />
    </UMain>
    <UFooter>Made with ❤️ by Orbit 503</UFooter>
  </UApp>
</template>
