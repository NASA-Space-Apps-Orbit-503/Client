<script setup lang="ts">
const { locale } = useI18n()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { key: 'app-favicon', rel: 'icon', type: 'image/x-icon', sizes: '32x32', href: '/ignis-sv.ico' },
    { key: 'app-shortcut-icon', rel: 'shortcut icon', href: '/ignis-sv.ico' }
  ],
  htmlAttrs: {
    lang: locale
  }
})

const title = 'Ignis SV'
const description = 'A geospatial intelligence platform for visualizing fire activity, and analyzing historical trends, designed specifically for El Salvador.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
