<script setup lang="ts">
import { LocaleEnum } from '~/enums/locale.enum'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const filterSteps = [
  { id: 'dates', icon: 'i-lucide-calendar-range' },
  { id: 'area', icon: 'i-lucide-circle-dashed' },
  { id: 'sensors', icon: 'i-lucide-satellite' },
  { id: 'apply', icon: 'i-lucide-filter' }
] as const

const guides = [
  {
    id: 'explore',
    to: '/explore',
    icon: 'i-lucide-map',
    page: 'header.nav.explore',
    items: ['points', 'more', 'toggle', 'summary', 'calendar'],
    shots: [
      { file: 'explore-map', caption: 'map' },
      { file: 'explore-calendar', caption: 'calendar' }
    ]
  },
  {
    id: 'trends',
    to: '/historical-trends',
    icon: 'i-lucide-chart-no-axes-combined',
    page: 'header.nav.historicalTrends',
    items: ['period', 'select', 'line', 'bars', 'table', 'csv'],
    shots: [
      { file: 'historical-trends', caption: 'charts' }
    ]
  },
  {
    id: 'anomalies',
    to: '/anomalies',
    icon: 'i-lucide-scan-search',
    page: 'header.nav.anomalies',
    items: ['filters', 'map', 'table', 'csv', 'charts'],
    shots: [
      { file: 'anomalies-map', caption: 'map' },
      { file: 'anomalies-charts', caption: 'charts' }
    ]
  }
] as const

const sections = ['filters', 'explore', 'trends', 'anomalies', 'methodology'] as const

// Screenshots exist for each supported locale; fall back to English.
const shotLocale = computed(() => locale.value === LocaleEnum.Es ? LocaleEnum.Es : LocaleEnum.En)
const shotSrc = (file: string) => `/screenshots/${shotLocale.value}/${file}.jpg`

useSeoMeta({
  title: () => t('howToUse.title'),
  description: () => t('howToUse.description')
})
</script>

<template>
  <UPage class="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
    <UPageHeader
      :title="t('howToUse.title')"
      :description="t('howToUse.description')"
      :ui="{ title: 'w-full text-center', description: 'text-center' }"
    />
    <UPageBody class="pb-16">
      <div class="space-y-6">
        <p class="mx-auto max-w-3xl text-center text-lg leading-relaxed text-muted">
          {{ t('howToUse.intro') }}
        </p>
        <nav
          :aria-label="t('header.nav.howToUse')"
          class="flex flex-wrap justify-center gap-2"
        >
          <UButton
            v-for="section in sections"
            :key="section"
            :to="`#${section}`"
            color="neutral"
            variant="outline"
          >
            {{ t(`howToUse.nav.${section}`) }}
          </UButton>
        </nav>
      </div>

      <div class="mt-12 divide-y divide-default lg:mt-16">
        <section
          id="filters"
          class="scroll-mt-24 pb-12 lg:pb-16"
          aria-labelledby="filters-title"
        >
          <div class="max-w-3xl space-y-3">
            <h2
              id="filters-title"
              class="text-2xl font-semibold text-highlighted"
            >
              {{ t('howToUse.filters.title') }}
            </h2>
            <p class="leading-relaxed text-muted">
              {{ t('howToUse.filters.description') }}
            </p>
          </div>
          <ol class="mt-8 grid gap-6 md:grid-cols-2">
            <li
              v-for="(step, index) in filterSteps"
              :key="step.id"
              class="min-w-0"
            >
              <UCard class="h-full">
                <div class="flex items-start gap-4">
                  <span
                    class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary"
                    aria-hidden="true"
                  >{{ index + 1 }}</span>
                  <div class="min-w-0 space-y-2">
                    <h3 class="flex items-center gap-2 pt-0.5 text-lg font-medium text-highlighted">
                      <UIcon
                        :name="step.icon"
                        class="size-5 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {{ t(`howToUse.filters.steps.${step.id}.title`) }}
                    </h3>
                    <p class="leading-relaxed text-muted">
                      {{ t(`howToUse.filters.steps.${step.id}.body`) }}
                    </p>
                  </div>
                </div>
              </UCard>
            </li>
          </ol>
        </section>

        <section
          v-for="guide in guides"
          :id="guide.id"
          :key="guide.id"
          class="scroll-mt-24 py-12 lg:py-16"
          :aria-labelledby="`${guide.id}-title`"
        >
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div class="max-w-3xl space-y-3">
              <h2
                :id="`${guide.id}-title`"
                class="flex items-center gap-3 text-2xl font-semibold text-highlighted"
              >
                <UIcon
                  :name="guide.icon"
                  class="size-6 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {{ t(`howToUse.${guide.id}.title`) }}
              </h2>
              <p class="leading-relaxed text-muted">
                {{ t(`howToUse.${guide.id}.description`) }}
              </p>
            </div>
            <UButton
              :to="localePath(guide.to)"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ t('howToUse.open', { page: t(guide.page) }) }}
            </UButton>
          </div>

          <div class="mt-8 grid gap-8 lg:grid-cols-5">
            <ul class="space-y-4 lg:col-span-2">
              <li
                v-for="item in guide.items"
                :key="item"
                class="flex gap-3 leading-relaxed text-muted"
              >
                <UIcon
                  name="i-lucide-check"
                  class="mt-1 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>{{ t(`howToUse.${guide.id}.items.${item}`) }}</span>
              </li>
            </ul>
            <div class="space-y-6 lg:col-span-3">
              <figure
                v-for="shot in guide.shots"
                :key="shot.file"
                class="space-y-2"
              >
                <img
                  :src="shotSrc(shot.file)"
                  :alt="t(`howToUse.${guide.id}.captions.${shot.caption}`)"
                  loading="lazy"
                  class="w-full rounded-lg border border-default"
                >
                <figcaption class="text-sm text-dimmed">
                  {{ t(`howToUse.${guide.id}.captions.${shot.caption}`) }}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section
          id="methodology"
          class="scroll-mt-24 pt-12 lg:pt-16"
          aria-labelledby="methodology-title"
        >
          <UCard>
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="max-w-3xl space-y-3">
                <h2
                  id="methodology-title"
                  class="flex items-center gap-3 text-2xl font-semibold text-highlighted"
                >
                  <UIcon
                    name="i-lucide-book-open"
                    class="size-6 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {{ t('howToUse.methodology.title') }}
                </h2>
                <p class="leading-relaxed text-muted">
                  {{ t('howToUse.methodology.body') }}
                </p>
              </div>
              <UButton
                :to="localePath('/methodology')"
                trailing-icon="i-lucide-arrow-right"
              >
                {{ t('howToUse.open', { page: t('header.nav.methodology') }) }}
              </UButton>
            </div>
          </UCard>
          <UAlert
            class="mt-6"
            icon="i-lucide-languages"
            color="neutral"
            variant="subtle"
            :title="t('howToUse.tip.title')"
            :description="t('howToUse.tip.body')"
          />
        </section>
      </div>
    </UPageBody>
  </UPage>
</template>
