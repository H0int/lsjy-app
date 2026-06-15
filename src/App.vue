<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  document.documentElement.classList.add('dark')
  if (authStore.isLoggedIn) {
    authStore.fetchUserProfile()
  }
})
</script>
