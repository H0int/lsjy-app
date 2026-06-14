<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- 欢迎区域 -->
    <div class="bg-gradient-to-r from-primary via-blue-500 to-purple-500 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
      <div class="relative z-10">
        <h1 class="text-2xl font-bold mb-1">你好，{{ authStore.nickname }} 👋</h1>
        <p class="text-blue-100">欢迎回到罗圣纪元SaaS平台，今天想用哪个AI工具？</p>
      </div>
      <div class="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-30">🚀</div>
    </div>

    <!-- 数据卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div v-for="card in statCards" :key="card.label" class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm">
        <div class="text-2xl mb-2">{{ card.icon }}</div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ card.value }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">{{ card.label }}</div>
      </div>
    </div>

    <!-- 访客信息栏 -->
    <div class="bg-white dark:bg-dark-100 rounded-xl p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <span class="text-2xl">👥</span>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">平台访客总数</div>
          <div class="text-xl font-bold text-gray-900 dark:text-white">{{ visitorStats.totalVisitors }} 人</div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-2xl">📅</span>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">今日访客</div>
          <div class="text-xl font-bold text-gray-900 dark:text-white">{{ visitorStats.todayVisitors }} 人</div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-2xl">🕐</span>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">最近访问时间</div>
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ visitorStats.lastVisitTime || '暂无记录' }}</div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="mb-6">
      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-3">🚀 热门工具</h2>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        <router-link v-for="tool in hotTools" :key="tool.id" :to="`/tools/${tool.id}`"
          class="bg-white dark:bg-dark-100 rounded-xl p-4 text-center hover:shadow-md transition-all hover:-translate-y-0.5 group">
          <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">{{ tool.icon }}</div>
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{{ tool.name }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ tool.isFree ? '免费' : `${tool.coinCost}圣点` }}</div>
        </router-link>
      </div>
    </div>

    <!-- 最近使用 + 平台公告 -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- 最近使用 -->
      <div class="bg-white dark:bg-dark-100 rounded-xl p-5 shadow-sm">
        <h3 class="font-bold text-gray-900 dark:text-white mb-4">📝 最近使用</h3>
        <div class="space-y-3">
          <div v-for="item in recentUsage" :key="item.id" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div class="flex items-center gap-3">
              <span class="text-xl">{{ item.icon }}</span>
              <div>
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ item.name }}</div>
                <div class="text-xs text-gray-400">{{ item.time }}</div>
              </div>
            </div>
            <span class="text-xs px-2 py-1 rounded-full" :class="item.isFree ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'">
              {{ item.isFree ? '免费' : `-${item.coinCost}圣点` }}
            </span>
          </div>
        </div>
      </div>

      <!-- 平台公告 -->
      <div class="bg-white dark:bg-dark-100 rounded-xl p-5 shadow-sm">
        <h3 class="font-bold text-gray-900 dark:text-white mb-4">📢 平台公告</h3>
        <div class="space-y-3">
          <div v-for="notice in notices" :key="notice.id" class="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <span class="text-sm px-2 py-0.5 rounded bg-primary/10 text-primary flex-shrink-0 mt-0.5">{{ notice.tag }}</span>
            <div>
              <div class="text-sm text-gray-700 dark:text-gray-300">{{ notice.title }}</div>
              <div class="text-xs text-gray-400 mt-0.5">{{ notice.date }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { toolApi, visitorApi } from '@/api'
import type { Tool } from '@/types'

const authStore = useAuthStore()

const hotTools = ref<Tool[]>([])
const statCards = ref([
  { icon: '⚡', label: '圣点余额', value: '0' },
  { icon: '🛠️', label: '已用工具', value: '0' },
  { icon: '📄', label: '生成作品', value: '0' },
  { icon: '🎯', label: '会员等级', value: '普通' },
  { icon: '👥', label: '平台访客', value: '0' },
])

const visitorStats = ref({
  totalVisitors: 0,
  todayVisitors: 0,
  lastVisitTime: '',
})

const recentUsage = ref([
  { id: '1', icon: '🎬', name: 'AI视频生成', time: '30分钟前', coinCost: 80, isFree: false },
  { id: '2', icon: '✍️', name: 'AI文案创作', time: '2小时前', coinCost: 10, isFree: false },
  { id: '3', icon: '🎨', name: 'AI文生图', time: '昨天', coinCost: 20, isFree: false },
  { id: '4', icon: '📥', name: '短视频解析', time: '昨天', coinCost: 0, isFree: true },
])

const notices = ref([
  { id: '1', tag: '新功能', title: 'Seedance 2.0 视频生成已上线，效果大幅提升', date: '2026-06-10' },
  { id: '2', tag: '活动', title: '新用户注册送100圣点，限时活动', date: '2026-06-08' },
  { id: '3', tag: '更新', title: 'AI文案创作新增小红书风格模板', date: '2026-06-05' },
  { id: '4', tag: '公告', title: '平台服务条款更新，请查看', date: '2026-06-01' },
])

onMounted(async () => {
  // 获取热门工具
  try {
    const res = await toolApi.getTools({ pageSize: 6 })
    hotTools.value = res.data.items.sort((a, b) => b.usageCount - a.usageCount).slice(0, 6)
  } catch { /* ignore */ }

  // 更新统计卡片
  statCards.value[0].value = authStore.coinBalance.toLocaleString()
  if (authStore.user) {
    statCards.value[3].value = authStore.user.vipLevel > 0 ? `VIP${authStore.user.vipLevel}` : '普通'
  }

  // 访客签到 + 获取统计
  try {
    await visitorApi.checkin('/dashboard', document.referrer)
    const statsRes = await visitorApi.getStats()
    if (statsRes.data) {
      visitorStats.value = {
        totalVisitors: statsRes.data.totalVisitors || 0,
        todayVisitors: statsRes.data.todayVisitors || 0,
        lastVisitTime: statsRes.data.lastVisitTime || '',
      }
      statCards.value[4].value = String(statsRes.data.totalVisitors || 0)
    }
  } catch { /* ignore */ }
})
</script>

<style scoped>
/* 赛博朋克欢迎横幅 */
.cyber-welcome-banner {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(124, 58, 237, 0.1));
  border: 1px solid rgba(0, 240, 255, 0.15);
  position: relative;
}

.cyber-welcome-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), var(--cyber-purple), transparent);
}

.welcome-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
  background-size: 30px 30px;
}

.welcome-glow {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%);
  border-radius: 50%;
}
</style>
