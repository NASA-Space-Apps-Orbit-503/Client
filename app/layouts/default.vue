<script setup lang="ts">
import { en, es } from '@nuxt/ui/locale'
import { LocaleEnum } from '~/enums/locale.enum'

useFilters()

const { t, locale, setLocale } = useI18n()

const uiLocale = computed(() => locale.value === LocaleEnum.Es ? es : en)

const items = computed(() => [
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
  },
  {
    label: t('header.nav.howToUse'),
    to: '/how-to-use'
  }
])

function changeLocale(value: string) {
  if (value === LocaleEnum.En || value === LocaleEnum.Es) {
    void setLocale(value)
  }
}
</script>

<template>
  <UApp :locale="uiLocale">
    <UHeader>
      <template #top>
        <FireTriangleTexture
          :opacity="0.4"
        />
      </template>
      <template #left>
        <UNavigationMenu
          :items="items"
          class="hidden lg:flex"
        />
      </template>
      <template #right>
        <ULocaleSelect
          :model-value="locale"
          :locales="[en, es]"
          @update:model-value="changeLocale"
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
