<script setup lang="ts">
defineProps<{
  card: InfoCard
}>()
</script>

<template>
  <UCard
    :key="card.title"
    :title="card.title"
    :description="card.description"
    :class="card.class"
  >
    <!-- Information -->
    <template #footer>
      <div class="relative min-w-0 pr-6">
        <UIcon
          name="i-carbon-information"
          class="mr-2 absolute right-0 top-0 text-gray-400 hover:cursor-pointer"
        />
        <p class="wrap-break-word text-sm text-gray-500">
          {{ card.footer }}
        </p>
      </div>
    </template>
  </UCard>
</template>
