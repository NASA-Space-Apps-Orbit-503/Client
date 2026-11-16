<script setup lang="ts">
const { t } = useI18n()
const capabilities = [
  { key: 'map', icon: 'i-lucide-map-pin' },
  { key: 'trends', icon: 'i-lucide-chart-no-axes-combined' },
  { key: 'anomalies', icon: 'i-lucide-scan-search' }
] as const
</script>

<template>
  <header
    data-explore-intro
    class="relative isolate shrink-0 overflow-hidden border-b border-amber-300/20 text-white"
  >
    <div class="relative mx-auto grid max-w-7xl items-center gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1fr_23rem] lg:gap-12 lg:px-12">
      <div class="relative z-10 min-w-0">
        <p class="mb-3 flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] text-amber-200 uppercase sm:text-xs">
          <span
            class="size-1.5 rounded-full bg-amber-300"
            aria-hidden="true"
          />
          {{ t('explore.intro.eyebrow') }}
        </p>
        <div class="flex items-center gap-3">
          <span class="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 shadow-lg">
            <img
              src="/ignis-sv.ico"
              alt=""
              width="32"
              height="32"
              aria-hidden="true"
            >
          </span>
          <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">
            Ignis <span class="text-amber-300">SV</span>
          </h1>
        </div>
        <p class="mt-4 text-lg font-medium text-stone-100 sm:text-2xl">
          {{ t('explore.intro.headline') }}
        </p>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-stone-300">
          {{ t('explore.description') }}
        </p>
        <ul class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-200">
          <li
            v-for="capability in capabilities"
            :key="capability.key"
            class="flex items-center gap-1.5"
          >
            <UIcon
              :name="capability.icon"
              class="size-3.5 text-amber-300"
            />
            {{ t(`explore.intro.${capability.key}`) }}
          </li>
        </ul>
      </div>
      <div
        class="pointer-events-none absolute -right-28 top-0 bottom-0 w-96 opacity-15 lg:relative lg:inset-auto lg:w-full lg:opacity-100"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 420 250"
          fill="none"
          class="h-full w-full"
        >
          <defs>
            <linearGradient
              id="ignis-orbit"
              x1="60"
              y1="220"
              x2="330"
              y2="40"
              gradientUnits="userSpaceOnUse"
            >
              <stop
                stop-color="#fbbf24"
                stop-opacity="0.05"
              />
              <stop
                offset="1"
                stop-color="#fbbf24"
                stop-opacity="0.8"
              />
            </linearGradient>
          </defs>
          <circle
            cx="210"
            cy="125"
            r="109"
            stroke="#fafaf9"
            stroke-opacity="0.07"
          />
          <circle
            cx="210"
            cy="125"
            r="80"
            stroke="#fafaf9"
            stroke-opacity="0.12"
            stroke-dasharray="2 7"
          />
          <circle
            cx="210"
            cy="125"
            r="48"
            stroke="#fafaf9"
            stroke-opacity="0.08"
          />
          <path
            d="M40 125H380M210 12V238"
            stroke="#fafaf9"
            stroke-opacity="0.07"
          />
          <ellipse
            cx="210"
            cy="125"
            rx="175"
            ry="60"
            transform="rotate(-26 210 125)"
            stroke="url(#ignis-orbit)"
          />
          <path
            d="M145 163L173 114L201 163H145Z"
            fill="#f59e0b"
            fill-opacity="0.22"
            stroke="#fbbf24"
            stroke-opacity="0.4"
          />
          <path
            d="M174 112L202 63L230 112H174Z"
            fill="#fb923c"
            fill-opacity="0.75"
          />
          <path
            d="M204 163L232 114L260 163H204Z"
            fill="#fbbf24"
            fill-opacity="0.9"
          />
          <path
            d="M234 112L262 63L290 112H234Z"
            fill="#60a5fa"
            fill-opacity="0.45"
          />
          <path
            d="M176 166L204 215L232 166H176Z"
            fill="#60a5fa"
            fill-opacity="0.2"
          />
          <circle
            cx="335"
            cy="65"
            r="5"
            fill="#fbbf24"
          />
          <circle
            cx="335"
            cy="65"
            r="12"
            stroke="#fbbf24"
            stroke-opacity="0.25"
          />
          <circle
            cx="89"
            cy="179"
            r="4"
            fill="#60a5fa"
          />
          <path
            d="M280 197H338M97 50H140"
            stroke="#fafaf9"
            stroke-opacity="0.2"
          />
          <text
            x="282"
            y="216"
            fill="#a8a29e"
            font-size="10"
            letter-spacing="2"
          >MODIS + VIIRS</text>
          <text
            x="64"
            y="40"
            fill="#a8a29e"
            font-size="10"
            letter-spacing="2"
          >EL SALVADOR</text>
        </svg>
      </div>
    </div>
  </header>
</template>

<style scoped>
[data-explore-intro] {
  background:
    radial-gradient(ellipse at 85% 30%, rgb(245 158 11 / 12%), transparent 55%),
    radial-gradient(ellipse at 5% 100%, rgb(96 165 250 / 8%), transparent 50%),
    #171613;
}

[data-explore-intro]::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image:
    linear-gradient(rgb(255 255 255 / 3%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 3%) 1px, transparent 1px);
  background-size: 40px 40px;
  content: '';
  mask-image: linear-gradient(to right, transparent 35%, black);
}
</style>
