<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useAppStore } from './stores/app'
import { getTheme } from './utils'
import { installClickTracker } from './utils/click-tracker'

const authStore = useAuthStore()
const appStore = useAppStore()

onMounted(() => {
  // 初始化主题
  const theme = getTheme()
  appStore.theme = theme
  document.documentElement.classList.toggle('dark', theme === 'dark')
  installClickTracker()
  
  // 已登录则获取用户信息
  if (authStore.isLoggedIn) {
    authStore.fetchUserProfile()
  }
})
</script>
