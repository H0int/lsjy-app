<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-200 transition-colors">
    <!-- 顶部导航栏 -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-dark-100/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-3 cursor-pointer" @click="$router.push('/dashboard')">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-lg">罗</div>
          <span class="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">罗圣纪元</span>
        </div>

        <!-- 导航菜单 -->
        <nav class="hidden md:flex items-center gap-1">
          <router-link v-for="item in navItems" :key="item.path" :to="item.path"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="isActive(item.path) ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300'">
            <span class="mr-1.5">{{ item.icon }}</span>{{ item.label }}
          </router-link>
        </nav>

        <!-- 右侧操作区 -->
        <div class="flex items-center gap-3">
          <!-- 主题切换 -->
          <button @click="appStore.toggleTheme()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-500 dark:text-gray-400 transition-colors">
            {{ appStore.theme === 'light' ? '🌙' : '☀️' }}
          </button>
          <!-- 余额 -->
          <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-medium">
            <span>⚡</span>
            <span>{{ authStore.coinBalance?.toFixed(1) || '0.0' }}</span>
          </div>
          <!-- 用户头像 -->
          <el-dropdown trigger="click">
            <div class="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                {{ (authStore.nickname || 'U')[0] }}
              </div>
              <span class="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">{{ authStore.nickname }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/profile')">👤 个人中心</el-dropdown-item>
                <el-dropdown-item @click="$router.push('/profile/wallet')">💰 圣点账户</el-dropdown-item>
                <el-dropdown-item v-if="authStore.isAdmin" divided @click="$router.push('/admin')">⚙️ 管理后台</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">🚪 退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 移动端底部导航 -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-100 border-t border-gray-200 dark:border-gray-700 px-2 py-1">
      <div class="flex justify-around">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          class="flex flex-col items-center py-1.5 px-3 rounded-lg"
          :class="isActive(item.path) ? 'text-primary' : 'text-gray-500 dark:text-gray-400'">
          <span class="text-xl">{{ item.icon }}</span>
          <span class="text-xs mt-0.5">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="pt-16 pb-20 md:pb-8">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const navItems = [
  { path: '/dashboard', label: '控制台', icon: '🏠' },
  { path: '/tools', label: 'AI工具', icon: '🤖' },
  { path: '/profile', label: '我的', icon: '👤' },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
