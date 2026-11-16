<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const sections = ['source', 'process', 'validation', 'business'] as const
const steps = ['unification', 'grid', 'satellites', 'cleaning', 'measure', 'factor', 'harmonized', 'validation', 'anomalies'] as const
const formulaSteps = new Set<string>(['factor', 'harmonized', 'anomalies'])
const metrics = ['mae', 'rmse', 'bias', 'relative', 'correlation'] as const
const flow = ['source', 'process', 'serve', 'analyze', 'decide'] as const
const views = [
  { id: 'explore', to: '/explore', icon: 'i-lucide-map' },
  { id: 'trends', to: '/historical-trends', icon: 'i-lucide-chart-no-axes-combined' },
  { id: 'anomalies', to: '/anomalies', icon: 'i-lucide-scan-search' }
] as const
const dimensions = ['time', 'space', 'sensor', 'quality'] as const
const facts = ['detection', 'daily', 'monthly', 'anomaly', 'validation'] as const
const rules = ['units', 'change', 'missing', 'decision'] as const
const sources = [
  { id: 'firms', url: 'https://firms.modaps.eosdis.nasa.gov/' },
  { id: 'viirs', url: 'https://firms.modaps.eosdis.nasa.gov/content/descriptions/FIRMS_VIIRS_Firehotspots.html' },
  { id: 'snpp', url: 'https://www.nesdis.noaa.gov/news/update-3-cessation-of-suomi-national-polar-orbiting-partnership-s-npp-data-users-november-02-2026-1540-utc-and-decommissioning-issued-october-30-2026-1400-utc' }
] as const

useSeoMeta({
  title: () => t('methodology.title'),
  description: () => t('methodology.description')
})
</script>

<template>
  <UPage class="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
    <UPageHeader
      :title="t('methodology.title')"
      :description="t('methodology.description')"
      :ui="{ title: 'w-full text-center', description: 'text-center' }"
    />
    <UPageBody class="pb-16">
      <div class="space-y-6">
        <p class="mx-auto max-w-3xl text-center text-lg leading-relaxed text-muted">
          {{ t('methodology.intro') }}
        </p>
        <nav
          :aria-label="t('header.nav.methodology')"
          class="flex flex-wrap justify-center gap-2"
        >
          <UButton
            v-for="section in sections"
            :key="section"
            :to="`#${section}`"
            color="neutral"
            variant="outline"
          >
            {{ t(`methodology.nav.${section}`) }}
          </UButton>
        </nav>
      </div>

      <div class="mt-12 divide-y divide-default lg:mt-16">
        <section
          id="source"
          class="scroll-mt-24 pb-12 lg:pb-16"
          aria-labelledby="source-title"
        >
          <h2
            id="source-title"
            class="text-2xl font-semibold text-highlighted"
          >
            {{ t('methodology.source.title') }}
          </h2>
          <UCard class="mt-8">
            <div class="max-w-3xl space-y-5 leading-relaxed text-muted">
              <p>{{ t('methodology.source.body') }}</p>
              <p>{{ t('methodology.source.resolution') }}</p>
              <p>{{ t('methodology.source.trace') }}</p>
              <ULink
                :to="sources[0].url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-block pt-1 text-primary underline underline-offset-4"
              >
                {{ t('methodology.links.firms') }} ↗
              </ULink>
            </div>
          </UCard>
        </section>

        <section
          id="process"
          class="scroll-mt-24 py-12 lg:py-16"
          aria-labelledby="process-title"
        >
          <div class="max-w-3xl space-y-3">
            <h2
              id="process-title"
              class="text-2xl font-semibold text-highlighted"
            >
              {{ t('methodology.process.title') }}
            </h2>
            <p class="leading-relaxed text-muted">
              {{ t('methodology.process.description') }}
            </p>
          </div>
          <ol class="mt-8 grid gap-6 lg:grid-cols-2">
            <li
              v-for="(step, index) in steps"
              :key="step"
              class="min-w-0"
            >
              <UCard class="h-full">
                <div class="flex items-start gap-4">
                  <span
                    class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary"
                    aria-hidden="true"
                  >{{ index + 1 }}</span>
                  <div class="min-w-0 space-y-3">
                    <h3 class="pt-0.5 text-lg font-medium text-highlighted">
                      {{ t(`methodology.process.steps.${step}.title`) }}
                    </h3>
                    <p class="leading-relaxed text-muted">
                      {{ t(`methodology.process.steps.${step}.body`) }}
                    </p>
                    <p
                      v-if="formulaSteps.has(step)"
                      class="rounded-md bg-elevated p-3 font-mono text-sm break-words text-highlighted"
                    >
                      {{ t(`methodology.process.steps.${step}.formula`) }}
                    </p>
                  </div>
                </div>
              </UCard>
            </li>
          </ol>
          <div class="mt-10 space-y-6">
            <UCard>
              <h3 class="font-semibold text-highlighted">
                {{ t('methodology.process.levelsTitle') }}
              </h3>
              <p class="mt-3 leading-relaxed text-muted">
                {{ t('methodology.process.levels') }}
              </p>
            </UCard>
            <UAlert
              icon="i-lucide-info"
              color="info"
              variant="subtle"
              :title="t('methodology.process.distinctionTitle')"
              :description="t('methodology.process.distinction')"
              :ui="{ root: 'p-5', description: 'mt-2 leading-relaxed' }"
            />
          </div>
        </section>

        <section
          id="validation"
          class="scroll-mt-24 py-12 lg:py-16"
          aria-labelledby="validation-title"
        >
          <div class="max-w-3xl space-y-3">
            <h2
              id="validation-title"
              class="text-2xl font-semibold text-highlighted"
            >
              {{ t('methodology.validation.title') }}
            </h2>
            <p class="leading-relaxed text-muted">
              {{ t('methodology.validation.description') }}
            </p>
          </div>
          <p class="mt-6 max-w-3xl text-sm leading-relaxed text-muted">
            {{ t('methodology.validation.notation') }}
          </p>
          <div class="mt-6 overflow-x-auto rounded-lg border border-default">
            <table class="w-full min-w-2xl text-left text-sm">
              <caption class="sr-only">
                {{ t('methodology.validation.title') }}
              </caption>
              <thead class="bg-elevated text-highlighted">
                <tr>
                  <th
                    scope="col"
                    class="px-5 py-4"
                  >
                    {{ t('methodology.validation.metric') }}
                  </th>
                  <th
                    scope="col"
                    class="px-5 py-4"
                  >
                    {{ t('methodology.validation.formula') }}
                  </th>
                  <th
                    scope="col"
                    class="px-5 py-4"
                  >
                    {{ t('methodology.validation.meaning') }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-default">
                <tr
                  v-for="metric in metrics"
                  :key="metric"
                >
                  <th
                    scope="row"
                    class="px-5 py-4 align-top font-medium text-highlighted"
                  >
                    {{ t(`methodology.validation.metrics.${metric}.name`) }}
                  </th>
                  <td class="px-5 py-4 align-top font-mono text-xs leading-relaxed text-highlighted">
                    {{ t(`methodology.validation.metrics.${metric}.formula`) }}
                  </td>
                  <td class="px-5 py-4 align-top leading-relaxed text-muted">
                    {{ t(`methodology.validation.metrics.${metric}.meaning`) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-8 max-w-3xl leading-relaxed text-muted">
            {{ t('methodology.validation.scope') }}
          </p>
        </section>

        <section
          id="business"
          class="scroll-mt-24 py-12 lg:py-16"
          aria-labelledby="business-title"
        >
          <div class="max-w-3xl space-y-3">
            <h2
              id="business-title"
              class="text-2xl font-semibold text-highlighted"
            >
              {{ t('methodology.business.title') }}
            </h2>
            <p class="leading-relaxed text-muted">
              {{ t('methodology.business.description') }}
            </p>
          </div>

          <div class="mt-12 space-y-14">
            <div class="space-y-5">
              <h3 class="text-xl font-semibold text-highlighted">
                {{ t('methodology.business.flowTitle') }}
              </h3>
              <ol class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 xl:gap-8">
                <li
                  v-for="(stage, index) in flow"
                  :key="stage"
                  class="relative flex items-center gap-4 rounded-lg border border-primary/30 bg-primary/5 p-5 xl:flex-col xl:items-start xl:gap-3"
                >
                  <span
                    class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary"
                    aria-hidden="true"
                  >{{ index + 1 }}</span>
                  <span class="font-medium leading-snug text-highlighted">{{ t(`methodology.business.flow.${stage}`) }}</span>
                  <UIcon
                    v-if="index < flow.length - 1"
                    name="i-lucide-arrow-right"
                    class="absolute top-1/2 -right-6 hidden size-4 -translate-y-1/2 text-primary xl:block"
                    aria-hidden="true"
                  />
                </li>
              </ol>
            </div>

            <div class="space-y-5">
              <h3 class="text-xl font-semibold text-highlighted">
                {{ t('methodology.business.questionsTitle') }}
              </h3>
              <div class="grid gap-6 lg:grid-cols-3">
                <UCard
                  v-for="view in views"
                  :key="view.id"
                >
                  <ULink
                    :to="localePath(view.to)"
                    class="flex items-start gap-2 font-semibold text-primary"
                  >
                    <UIcon
                      :name="view.icon"
                      class="mt-1 size-5 shrink-0"
                    />
                    {{ t(`methodology.business.views.${view.id}.title`) }}
                  </ULink>
                  <p class="mt-4 leading-relaxed text-muted">
                    {{ t(`methodology.business.views.${view.id}.body`) }}
                  </p>
                </UCard>
              </div>
            </div>

            <div class="space-y-5">
              <h3 class="text-xl font-semibold text-highlighted">
                {{ t('methodology.business.dimensionsTitle') }}
              </h3>
              <dl class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <div
                  v-for="dimension in dimensions"
                  :key="dimension"
                  class="rounded-lg border border-default p-5"
                >
                  <dt class="font-semibold text-highlighted">
                    {{ t(`methodology.business.dimensions.${dimension}.title`) }}
                  </dt>
                  <dd class="mt-3 leading-relaxed text-muted">
                    {{ t(`methodology.business.dimensions.${dimension}.body`) }}
                  </dd>
                </div>
              </dl>
            </div>

            <div class="space-y-5">
              <h3 class="text-xl font-semibold text-highlighted">
                {{ t('methodology.business.factsTitle') }}
              </h3>
              <div class="overflow-x-auto rounded-lg border border-default">
                <table class="w-full min-w-2xl text-left text-sm">
                  <caption class="sr-only">
                    {{ t('methodology.business.factsTitle') }}
                  </caption>
                  <thead class="bg-elevated text-highlighted">
                    <tr>
                      <th
                        scope="col"
                        class="px-5 py-4"
                      >
                        {{ t('methodology.business.fact') }}
                      </th>
                      <th
                        scope="col"
                        class="px-5 py-4"
                      >
                        {{ t('methodology.business.grain') }}
                      </th>
                      <th
                        scope="col"
                        class="px-5 py-4"
                      >
                        {{ t('methodology.business.measures') }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-default">
                    <tr
                      v-for="fact in facts"
                      :key="fact"
                    >
                      <th
                        scope="row"
                        class="px-5 py-4 align-top font-medium text-highlighted"
                      >
                        {{ t(`methodology.business.facts.${fact}.name`) }}
                      </th>
                      <td class="px-5 py-4 align-top leading-relaxed text-muted">
                        {{ t(`methodology.business.facts.${fact}.grain`) }}
                      </td>
                      <td class="px-5 py-4 align-top leading-relaxed text-muted">
                        {{ t(`methodology.business.facts.${fact}.measures`) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <UCard>
              <h3 class="text-xl font-semibold text-highlighted">
                {{ t('methodology.business.rulesTitle') }}
              </h3>
              <ul class="mt-5 list-disc space-y-4 pl-5 leading-relaxed text-muted marker:text-primary">
                <li
                  v-for="rule in rules"
                  :key="rule"
                >
                  {{ t(`methodology.business.rules.${rule}`) }}
                </li>
              </ul>
            </UCard>
          </div>
        </section>

        <section
          class="pt-12 lg:pt-16"
          aria-labelledby="sources-title"
        >
          <div class="max-w-3xl space-y-3">
            <h2
              id="sources-title"
              class="text-2xl font-semibold text-highlighted"
            >
              {{ t('methodology.sourcesTitle') }}
            </h2>
            <p class="leading-relaxed text-muted">
              {{ t('methodology.sourcesDescription') }}
            </p>
          </div>
          <ul class="mt-6 space-y-3">
            <li
              v-for="source in sources"
              :key="source.id"
            >
              <ULink
                :to="source.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary underline underline-offset-4"
              >
                {{ t(`methodology.links.${source.id}`) }} ↗
              </ULink>
            </li>
          </ul>
        </section>
      </div>
    </UPageBody>
  </UPage>
</template>
