<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <div class="rounded-2xl p-6 mb-6 relative overflow-hidden" style="background:linear-gradient(135deg,#1a1a3a,#0d0d2a);border:1px solid #00f0ff30;">
      <div class="relative z-10">
        <h1 class="text-2xl font-bold mb-1" style="color:#00f0ff;">{{'你好'}}，{{ authStore.nickname }} 👋</h1>
        <p style="color:#a0a0cc;">{{'欢迎回到罗圣纪元'}},今天想用哪个AI工具？</p>
      </div>
      <div class="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-30">🚀</div>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div v-for="card in statCards" :key="card.label" class="rounded-xl p-4" style="background:#1a1a3a;border:1px solid #00f0ff15;">
        <div class="text-2xl mb-2">{{ card.icon }}</div>
        <div class="text-2xl font-bold" style="color:#00f0ff;">{{ card.value }}</div>
        <div class="text-sm" style="color:#a0a0cc;">{{ card.label }}</div>
      </div>
    </div>
    <div class="rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3" style="background:#1a1a3a;border:1px solid #00f0ff15;">
      <div class="flex items-center gap-3">
        <span class="text-2xl">👥</span>
        <div>
          <div class="text-sm" style="color:#a0a0cc;">平台访客总数</div>
          <div class="text-xl font-bold" style="color:#00f0ff;">{{ visitorStats.totalVisitors }} 人</div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-2xl">📅</span>
        <div>
          <div class="text-sm" style="color:#a0a0cc;">今日访客</div>
          <div class="text-xl font-bold" style="color:#00f0ff;">{{ visitorStats.todayVisitors }} 人</div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-2xl">🕐</span>
        <div>
          <div class="text-sm" style="color:#a0a0cc;">最近访问</div>
          <div class="text-sm font-medium" style="color:#e0e0ff;">{{ visitorStats.lastVisitTime || '暂无记录' }}</div>
        </div>
      </div>
    </div>
    <div class="mb-6">
      <h2 class="text-lg font-bold mb-3" style="color:#e0e0ff;">🚀 热门工具</h2>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        <router-link v-for="tool in hotTools" :key="tool.id" :to="`/tools/${tool.id}`"
          class="rounded-xl p-4 text-center transition-all hover:-translate-y-0.5 group" style="background:#1a1a3a;border:1px solid #00f0ff15;">
          <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">{{ tool.icon }}</div>
          <div class="text-sm font-medium truncate" style="color:#e0e0ff;">{{ tool.name }}</div>
          <div class="text-xs mt-1" style="color:#a0a0cc;">{{ tool.isFree ? '免费' : tool.coinCost+'圣点' }}</div>
        </router-link>
      </div>
    </div>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="rounded-xl p-5" style="background:#1a1a3a;border:1px solid #00f0ff15;">
        <h3 class="font-bold mb-4" style="color:#e0e0ff;">📝 最近使用</h3>
        <div class="space-y-3">
          <div v-for="item in recentUsage" :key="item.id" class="flex items-center justify-between py-2" style="border-bottom:1px solid #00f0ff10;">
            <div class="flex items-center gap-3">
              <span class="text-xl">{{ item.icon }}</span>
              <div>
                <div class="text-sm font-medium" style="color:#e0e0ff;">{{ item.name }}</div>
                <div class="text-xs" style="color:#a0a0cc;">{{ item.time }}</div>
              </div>
            </div>
            <span class="text-xs px-2 py-1 rounded-full" :style="item.isFree?'background:#00ff8820;color:#00ff88;':'background:#ffe60020;color:#ffe600;'">
              {{ item.isFree ? '免费' : '-'+item.coinCost+'圣点' }}
            </span>
          </div>
        </div>
      </div>
      <div class="rounded-xl p-5" style="background:#1a1a3a;border:1px solid #00f0ff15;">
        <h3 class="font-bold mb-4" style="color:#e0e0ff;">📢 平台公告</h3>
        <div class="space-y-3">
          <div v-for="notice in notices" :key="notice.id" class="flex items-start gap-3 py-2" style="border-bottom:1px solid #00f0ff10;">
            <span class="text-xs px-2 py-0.5 rounded flex-shrink-0 mt-0.5" style="background:#00f0ff15;color:#00f0ff;">{{ notice.tag }}</span>
            <div>
              <div class="text-sm" style="color:#e0e0ff;">{{ notice.title }}</div>
              <div class="text-xs" style="color:#a0a0cc;">{{ notice.date }}</div>
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
const visitorStats = ref({ totalVisitors: 0, todayVisitors: 0, lastVisitTime: '' })
const recentUsage = ref([
  { id: '1', icon: '🎬', name: 'AI视频生成', time: '30分钟前', coinCost: 80, isFree: false },
  { id: '2', icon: '✍️', name: 'AI文案创作', time: '2小时前', coinCost: 10, isFree: false },
  { id: '3', icon: '🎨', name: 'AI文生图', time: '昨天', coinCost: 20, isFree: false },
  { id: '4', icon: '📥', name: '短视频解析', time: '昨天', coinCost: 0, isFree: true },
])
const notices = ref([
  { id: '1', tag: '新功能', title: 'Seedance 2.0 视频生成已上线', date: '2026-06-10' },
  { id: '2', tag: '活动', title: '新用户注册送100圣点', date: '2026-06-08' },
  { id: '3', tag: '更新', title: 'AI文案新增小红书风格模板', date: '2026-06-05' },
  { id: '4', tag: '公告', title: '平台服务条款更新', date: '2026-06-01' },
])
onMounted(async () => {
  try { const res = await toolApi.getTools({ pageSize: 6 }); hotTools.value = res.data.items.sort((a, b) => b.usageCount - a.usageCount).slice(0, 6) } catch {}
  statCards.value[0].value = authStore.coinBalance.toLocaleString()
  if (authStore.user) { statCards.value[3].value = authStore.user.vipLevel > 0 ? 'VIP'+authStore.user.vipLevel : '普通' }
  try {
    await visitorApi.checkin('/dashboard', document.referrer)
    const s = await visitorApi.getStats()
    if (s.data) { visitorStats.value = { totalVisitors: s.data.totalVisitors||0, todayVisitors: s.data.todayVisitors||0, lastVisitTime: s.data.lastVisitTime||'' }; statCards.value[4].value = String(s.data.totalVisitors||0) }
  } catch {}
})
</script>
