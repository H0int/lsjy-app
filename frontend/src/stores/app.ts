import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getTheme, setTheme as saveTheme } from '@/utils'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const theme = ref<'light' | 'dark'>(getTheme())

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    saveTheme(theme.value)
  }

  return { sidebarCollapsed, theme, toggleSidebar, toggleTheme }
})
