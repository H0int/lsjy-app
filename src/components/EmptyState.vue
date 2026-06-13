<template>
  <div class="flex flex-col items-center justify-center py-16">
    <div class="text-6xl mb-4">{{ icon }}</div>
    <p class="text-gray-500 dark:text-gray-400 text-lg">{{ message }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon?: string; message?: string }>()
</script>
