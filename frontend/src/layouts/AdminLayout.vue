<template>
  <div class="min-h-screen bg-gray-100 dark:bg-dark-200 transition-colors">
    <!-- 侧边栏 -->
    <aside class="fixed left-0 top-0 bottom-0 z-40 w-64 bg-dark-200 dark:bg-dark-100 text-white transition-all duration-300 overflow-y-auto"
      :class="{ '-translate-x-full': appStore.sidebarCollapsed }">
      <!-- Logo -->
      <div class="h-16 flex items-center px-5 gap-3 border-b border-white/10 flex-shrink-0">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">罗</div>
        <div>
          <div class="font-bold text-sm">罗圣纪元</div>
          <div class="text-xs text-gray-400">管理后台</div>
        </div>
      </div>
      <!-- 菜单 -->
      <nav class="mt-4 px-3 pb-20 space-y-0.5">
        <div v-for="group in menuGroups" :key="group.label">
          <div class="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider font-medium">{{ group.label }}</div>
          <router-link v-for="item in group.items" :key="item.path" :to="item.path"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors"
            :class="isActive(item.path) ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'">
            <span class="text-lg">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </router-link>
        </div>
      </nav>
      <!-- 返回前台 -->
      <div class="absolute bottom-4 left-0 right-0 px-3">
        <router-link to="/dashboard" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
          <span>↩️</span><span>返回前台</span>
        </router-link>
      </div>
    </aside>

    <!-- 主区域 -->
    <div class="ml-64 transition-all duration-300" :class="{ 'ml-0': appStore.sidebarCollapsed }">
      <!-- 顶栏 -->
      <header class="h-16 bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-30">
        <div class="flex items-center gap-4">
          <button @click="appStore.toggleSidebar()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-500">☰</button>
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">{{ currentTitle }}</h1>
        </div>
        <div class="flex items-center gap-3">
          <button @click="appStore.toggleTheme()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-500">
            {{ appStore.theme === 'light' ? '🌙' : '☀️' }}
          </button>
          <el-dropdown trigger="click">
            <div class="flex items-center gap-2 cursor-pointer">
              <div class="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">管</div>
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ authStore.nickname }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/dashboard')">返回前台</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 内容区 -->
      <main class="p-6">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// 管理员身份校验（纵深防御）
onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchUserProfile()
  }
  if (!authStore.isAdmin) {
    ElMessage.error('无权访问管理后台')
    router.push('/dashboard')
  }
})

const menuGroups = [
  {
    label: '概览',
    items: [
      { path: '/admin/dashboard', label: '数据看板', icon: '📊' },
    ]
  },
  {
    label: '业务管理',
    items: [
      { path: '/admin/users', label: '用户管理', icon: '👥' },
      { path: '/admin/tools', label: '工具管理', icon: '🔧' },
      { path: '/admin/orders', label: '订单管理', icon: '📦' },
    ]
  },
  {
    label: '运营管理',
    items: [
      { path: '/admin/content-moderation', label: '内容审核', icon: '📝' },
      { path: '/admin/announcements', label: '公告管理', icon: '📢' },
      { path: '/admin/coupons', label: '优惠券', icon: '🎫' },
      { path: '/admin/campaigns', label: '活动管理', icon: '🎯' },
    ]
  },
  {
    label: '客服与自动化',
    items: [
      { path: '/admin/tickets', label: '工单管理', icon: '🎧' },
      { path: '/admin/faq', label: 'FAQ管理', icon: '❓' },
      { path: '/admin/automation', label: '自动化规则', icon: '🤖' },
    ]
  },
  {
    label: '数据与配置',
    items: [
      { path: '/admin/reports', label: '数据报表', icon: '📈' },
      { path: '/admin/settings', label: '系统配置', icon: '⚙️' },
    ]
  },
]

const allMenuItems = menuGroups.flatMap(g => g.items)

const currentTitle = computed(() => {
  const item = allMenuItems.find(i => route.path === i.path || route.path.startsWith(i.path + '/'))
  return item?.label || '管理后台'
})

function isActive(path: string) {
  return route.path === path
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
