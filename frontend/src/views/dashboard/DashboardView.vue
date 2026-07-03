<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- 欢迎区域 - 赛博朋克风格 -->
    <div class="cyber-welcome-banner rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
      <div class="welcome-bg-grid"></div>
      <div class="welcome-glow"></div>
      <div class="relative z-10 flex items-center gap-4">
        <img src="/company-logo.jpg" alt="罗圣纪元" class="w-14 h-14 rounded-xl object-cover" style="border: 2px solid rgba(0,240,255,0.4); box-shadow: 0 0 15px rgba(0,240,255,0.3);" />
        <div>
          <h1 class="text-2xl font-bold mb-1" style="font-family: 'JetBrains Mono', monospace;">你好，{{ authStore.nickname }}</h1>
          <p class="text-sm" style="color: rgba(0,240,255,0.7); font-family: 'JetBrains Mono', monospace;">欢迎回到罗圣纪元SaaS平台 · SYSTEM ONLINE</p>
        </div>
      </div>
    </div>

    <!-- 数据卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div v-for="card in visibleStatCards" :key="card.label" class="cyber-card rounded-xl p-4" @click="card.route && router.push(card.route)" style="cursor:pointer;">
        <div class="text-2xl mb-2">{{ card.icon }}</div>
        <div class="text-2xl font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">{{ card.value }}</div>
        <div class="text-sm" style="color: var(--cyber-text-dim);">{{ card.label }}</div>
      </div>
    </div>

    <!-- 访客信息栏 -->
    <div v-if="authStore.isAdmin" class="cyber-card rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3" style="cursor:pointer;" @click="router.push('/admin/visitors')">
      <div class="flex items-center gap-3">
        <span class="text-2xl">👥</span>
        <div>
          <div class="text-sm" style="color: var(--cyber-text-dim);">在线人数</div>
          <div class="text-xl font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">{{ onlineCount }} 人</div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-2xl">📅</span>
        <div>
          <div class="text-sm" style="color: var(--cyber-text-dim);">今日访客</div>
          <div class="text-xl font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">{{ visitorStats.todayVisitors }} 人</div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-2xl">🕐</span>
        <div>
          <div class="text-sm" style="color: var(--cyber-text-dim);">最近访问时间</div>
          <div class="text-sm font-medium" style="color: var(--cyber-text);">{{ visitorStats.lastVisitTime || '暂无记录' }}</div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="mb-6">
      <h2 class="text-lg font-bold mb-3" style="color: var(--cyber-text);"> 热门工具</h2>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        <router-link v-for="tool in hotTools" :key="tool.id" :to="`/tools/${tool.id}`"
          class="cyber-card rounded-xl p-4 text-center transition-all hover:-translate-y-0.5 group">
          <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">{{ tool.icon }}</div>
          <div class="text-sm font-medium truncate" style="color: var(--cyber-text);">{{ tool.name }}</div>
          <div class="text-xs mt-1" style="color: var(--cyber-text-dim);">{{ tool.isFree ? '免费' : `${tool.coinCost}圣力` }}</div>
        </router-link>
      </div>
    </div>

    <!-- 最近使用 + 平台公告 -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- 最近使用 -->
      <div class="cyber-card rounded-xl p-5">
        <h3 class="font-bold var(--cyber-text) mb-4">📝 最近使用</h3>
        <div class="space-y-3">
          <div v-for="item in recentUsage" :key="item.id" class="flex items-center justify-between py-2 border-b var(--cyber-border) last:border-0">
            <div class="flex items-center gap-3">
              <span class="text-xl">{{ item.icon }}</span>
              <div>
                <div class="text-sm font-medium var(--cyber-text)">{{ item.name }}</div>
                <div class="text-xs var(--cyber-text-dim)">{{ item.time }}</div>
              </div>
            </div>
            <span class="text-xs px-2 py-1 rounded-full" :class="item.isFree ? 'rgba(34,197,94,0.1); color: #22c55e' : 'rgba(255,184,0,0.1); color: var(--cyber-amber)'">
              {{ item.isFree ? '免费' : `-${item.coinCost}圣力` }}
            </span>
          </div>
        </div>
      </div>

      <!-- 平台公告 -->
      <div class="cyber-card rounded-xl p-5">
        <h3 class="font-bold var(--cyber-text) mb-4">📢 平台公告</h3>
        <div class="space-y-3">
          <div v-for="notice in notices" :key="notice.id" class="flex items-start gap-3 py-2 border-b var(--cyber-border) last:border-0">
            <span class="text-sm px-2 py-0.5 rounded rgba(0,240,255,0.1); color: var(--cyber-cyan) flex-shrink-0 mt-0.5">{{ notice.tag }}</span>
            <div>
              <div class="text-sm var(--cyber-text)">{{ notice.title }}</div>
              <div class="text-xs var(--cyber-text-dim) mt-0.5">{{ notice.date }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toolApi, visitorApi, adminApi, paymentApi, publicApi } from '@/api'
import type { Tool } from '@/types'

const authStore = useAuthStore()
const router = useRouter()

const hotTools = ref<Tool[]>([])
const statCards = ref([
  { icon: '⚡', label: '圣力余额', value: '0', route: '/profile/wallet' },
  { icon: '🛠️', label: '已用工具', value: '0', route: '/tools' },
  { icon: '📄', label: '生成作品', value: '0', route: '/profile' },
  { icon: '🎯', label: '会员等级', value: '普通', route: '/profile' },
  { icon: '👥', label: '平台访客', value: '0', route: '/admin/visitors' },
])

const visibleStatCards = computed(() => {
  return authStore.isAdmin ? statCards.value : statCards.value.filter(card => card.label !== '平台访客')
})

const visitorStats = ref({
  totalVisitors: 0,
  todayVisitors: 0,
  lastVisitTime: '',
})

const recentUsage = ref<any[]>([])
const onlineCount = ref(0)
let heartbeatTimer: any = null

const notices = ref<any[]>([])

onMounted(async () => {
  // 获取热门工具
  try {
    const res = await toolApi.getTools({ pageSize: 6 })
    const items = (res.data as any)?.items || []
    hotTools.value = items.sort((a: any, b: any) => (b.usageCount||0) - (a.usageCount||0)).slice(0, 6)
  } catch { /* ignore */ }

  // 圣力余额：管理员显示"∞ 无限"
  if (authStore.isAdmin) {
    statCards.value[0].value = '∞ 无限'
  } else {
    try {
      const bal = await paymentApi.getBalance()
      const balance = bal.data?.balance ?? authStore.coinBalance ?? 0
      authStore.coinBalance = typeof balance === 'number' ? balance : 0
      statCards.value[0].value = balance.toLocaleString()
    } catch {
      statCards.value[0].value = authStore.coinBalance ? authStore.coinBalance.toLocaleString() : '0'
    }
  }

  // 会员等级：管理员显示"管理员"
  if (authStore.user) {
    if (authStore.isAdmin) {
      statCards.value[3].value = '罗总专属'
    } else if (authStore.user.userType === 'founder') {
      statCards.value[3].value = '至尊创始人'
    } else if (authStore.user.vipLevel && authStore.user.vipLevel > 0) {
      statCards.value[3].value = `VIP${authStore.user.vipLevel}`
    } else if (authStore.user.userType === 'enterprise') {
      statCards.value[3].value = '企业版'
    } else if (authStore.user.userType === 'merchant') {
      statCards.value[3].value = '商户版'
    } else {
      statCards.value[3].value = '普通'
    }
  }

  // 访客签到 + 获取统计（静默请求，失败不弹提示）
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

  // 获取公告数据
  try {
    const annRes = await publicApi.getActiveAnnouncements()
    let annItems: any[] = []
    if (annRes.data) {
      if (Array.isArray(annRes.data)) {
        annItems = annRes.data
      } else if ((annRes.data as any).items) {
        annItems = (annRes.data as any).items
      } else if ((annRes.data as any).list) {
        annItems = (annRes.data as any).list
      }
    }
    if (annItems.length > 0) {
      notices.value = annItems.slice(0, 4).map((a: any) => ({
        id: String(a.id),
        tag: a.type || '公告',
        title: a.title,
        date: a.createdAt ? a.createdAt.split('T')[0] : (a.publishedAt ? a.publishedAt.split('T')[0] : '')
      }))
    } else {
      notices.value = [
        { id: 'welcome', tag: '欢迎', title: '欢迎来到罗圣纪元SaaS平台！', date: new Date().toISOString().split('T')[0] },
        { id: 'tip1', tag: '提示', title: '完成新手任务可获得100圣力奖励', date: new Date().toISOString().split('T')[0] }
      ]
    }
  } catch { /* ignore */ }

  // 心跳上报 + 在线人数
  async function sendHeartbeat() {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.lsjyapp.cn/api/v1'
      const token = authStore.token || ''
      const sessionId = authStore.user?.id || navigator.userAgent.substring(0, 50)
      await fetch(API_BASE + '/online/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
          'X-Session-Id': sessionId,
          'X-User-Id': String(authStore.user?.id || '')
        },
        body: JSON.stringify({ path: window.location.pathname })
      })
      const countRes = await fetch(API_BASE + '/online/count', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      if (countRes.ok) {
        const countData = await countRes.json()
        onlineCount.value = countData.data?.onlineCount || 0
      }
    } catch { /* ignore */ }
  }
  sendHeartbeat()
  heartbeatTimer = setInterval(sendHeartbeat, 10000)

  // 获取用户使用记录（从订单API）
  try {
    const orderRes = await adminApi.getOrders({ page: 1, pageSize: 4 })
    if (orderRes.data && orderRes.data.items) {
      recentUsage.value = orderRes.data.items.slice(0, 4).map((o: any) => ({
        id: String(o.id),
        icon: '🛠️',
        name: o.toolName || o.description || '工具使用',
        time: o.createdAt ? new Date(o.createdAt).toLocaleDateString('zh-CN') : '',
        coinCost: Math.abs(o.amount || 0),
        isFree: (o.amount || 0) === 0
      }))
    }
  } catch { /* ignore */ }
})

onUnmounted(() => {
  if (heartbeatTimer) clearInterval(heartbeatTimer)
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
  top: 0; left: 0; right: 0;
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
  top: -50%; right: -20%;
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%);
  border-radius: 50%;
}

/* Cyber card - dark cyberpunk theme */
.cyber-card {
  background: rgba(15, 15, 25, 0.85);
  border: 1px solid rgba(0, 240, 255, 0.1);
  backdrop-filter: blur(8px);
  transition: all 0.3s;
}
.cyber-card:hover {
  border-color: rgba(0, 240, 255, 0.25);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.05);
}
.cyber-text-primary {
  color: #00f0ff;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
}
.cyber-text {
  color: #c0c0e0;
}
.cyber-text-dim {
  color: #6a6a8a;
}
</style>
