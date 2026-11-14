<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items = ref<NavigationMenuItem[]>([
  {
    label: 'Explore',
    to: '/explore'
  },
  {
    label: 'Historical Trends',
    to: '/historical-trends'
  },
  {
    label: 'Anomalies',
    to: '/anomalies'
  },
  {
    label: 'Methodology',
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
        <UBadge>Demo. Not connected to a live feed</UBadge>
      </template>
    </UHeader>
    <UMain>
      <slot />
    </UMain>
    <UFooter>Made with ❤️ by Orbit 503</UFooter>
  </UApp>
</template>
