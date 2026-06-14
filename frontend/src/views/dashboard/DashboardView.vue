<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- 欢迎区域 - 赛博朋克 -->
    <div class="relative rounded-2xl p-6 mb-6 overflow-hidden cyber-scanline"
      style="background: linear-gradient(135deg, rgba(0,240,255,0.08), rgba(124,58,237,0.12), rgba(255,0,255,0.06)); border: 1px solid rgba(0,240,255,0.2);">
      <div class="relative z-10">
        <h1 class="text-2xl font-bold mb-1" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">
          你好，{{ authStore.nickname }} <span class="neon-flicker">👋</span>
        </h1>
        <p style="color: var(--cyber-text-dim);">欢迎回到罗圣纪元SaaS平台，今天想用哪个AI工具？</p>
      </div>
      <div class="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-20">🚀</div>
      <!-- 角落装饰 -->
      <div class="absolute top-0 right-0 w-20 h-20 opacity-20"
        style="border-top: 2px solid var(--cyber-cyan); border-right: 2px solid var(--cyber-cyan);"></div>
      <div class="absolute bottom-0 left-0 w-20 h-20 opacity-20"
        style="border-bottom: 2px solid var(--cyber-magenta); border-left: 2px solid var(--cyber-magenta);"></div>
    </div>

    <!-- 数据卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div v-for="(card, idx) in statCards" :key="card.label"
        class="cyber-card p-4 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
        :style="{ animationDelay: `${idx * 0.1}s` }">
        <div class="text-2xl mb-2">{{ card.icon }}</div>
        <div class="text-2xl font-bold" :style="{ color: cardColors[idx] }">{{ card.value }}</div>
        <div class="text-sm" style="color: var(--cyber-text-dim);">{{ card.label }}</div>
        <!-- 底部发光线 -->
        <div class="mt-3 h-px w-full" :style="{ background: `linear-gradient(90deg, transparent, ${cardColors[idx]}40, transparent)` }"></div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="mb-6">
      <h2 class="text-lg font-bold mb-3" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
        <span style="color: var(--cyber-cyan);">▍</span>热门工具
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <router-link v-for="tool in hotTools" :key="tool.id" :to="`/tools/${tool.id}`"
          class="cyber-card p-4 text-center transition-all duration-300 hover:-translate-y-1 group">
          <div class="text-3xl mb-2 group-hover:scale-110 transition-transform" style="filter: drop-shadow(0 0 4px rgba(0,240,255,0.3));">{{ tool.icon }}</div>
          <div class="text-sm font-medium truncate" style="color: var(--cyber-text);">{{ tool.name }}</div>
          <div class="text-xs mt-1" style="color: var(--cyber-text-dim);">{{ tool.isFree ? '免费' : `${tool.coinCost}圣点` }}</div>
        </router-link>
      </div>
    </div>

    <!-- 最近使用 + 平台公告 -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- 最近使用 -->
      <div class="cyber-card p-5">
        <h3 class="font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          <span style="color: var(--cyber-cyan);">▍</span>最近使用
        </h3>
        <div class="space-y-3">
          <div v-for="item in recentUsage" :key="item.id"
            class="flex items-center justify-between py-2 transition-all"
            style="border-bottom: 1px solid var(--cyber-border);"
            @mouseover="($event.currentTarget as HTMLElement).style.background='rgba(0,240,255,0.02)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background='transparent'">
            <div class="flex items-center gap-3">
              <span class="text-xl">{{ item.icon }}</span>
              <div>
                <div class="text-sm font-medium" style="color: var(--cyber-text);">{{ item.name }}</div>
                <div class="text-xs" style="color: var(--cyber-text-dim);">{{ item.time }}</div>
              </div>
            </div>
            <span class="text-xs px-2 py-1 rounded-full"
              :style="item.isFree
                ? 'background: rgba(0,255,136,0.1); color: var(--cyber-green); border: 1px solid rgba(0,255,136,0.2);'
                : 'background: rgba(255,184,0,0.1); color: var(--cyber-amber); border: 1px solid rgba(255,184,0,0.2);'">
              {{ item.isFree ? '免费' : `-${item.coinCost}圣点` }}
            </span>
          </div>
        </div>
      </div>

      <!-- 平台公告 -->
      <div class="cyber-card p-5">
        <h3 class="font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          <span style="color: var(--cyber-magenta);">▍</span>平台公告
        </h3>
        <div class="space-y-3">
          <div v-for="notice in notices" :key="notice.id"
            class="flex items-start gap-3 py-2"
            style="border-bottom: 1px solid var(--cyber-border);">
            <span class="text-xs px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
              style="background: rgba(0,240,255,0.1); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.2);">
              {{ notice.tag }}
            </span>
            <div>
              <div class="text-sm" style="color: var(--cyber-text);">{{ notice.title }}</div>
              <div class="text-xs mt-0.5" style="color: var(--cyber-text-dim);">{{ notice.date }}</div>
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
import { toolApi } from '@/api'
import type { Tool } from '@/types'

const authStore = useAuthStore()

const hotTools = ref<Tool[]>([])
const cardColors = ['var(--cyber-cyan)', 'var(--cyber-magenta)', 'var(--cyber-purple)', 'var(--cyber-green)']
const statCards = ref([
  { icon: '⚡', label: '圣点余额', value: '0' },
  { icon: '🛠️', label: '已用工具', value: '0' },
  { icon: '📄', label: '生成作品', value: '0' },
  { icon: '🎯', label: '会员等级', value: '普通' },
])

// TODO: 接入后端API获取最近使用记录
const recentUsage = ref([
  { id: '1', icon: '🎬', name: 'AI视频生成', time: '30分钟前', coinCost: 80, isFree: false },
  { id: '2', icon: '✍️', name: 'AI文案创作', time: '2小时前', coinCost: 10, isFree: false },
  { id: '3', icon: '🎨', name: 'AI文生图', time: '昨天', coinCost: 20, isFree: false },
  { id: '4', icon: '📥', name: '短视频解析', time: '昨天', coinCost: 0, isFree: true },
])

// TODO: 接入后端API获取平台公告
const notices = ref([
  { id: '1', tag: '新功能', title: 'Seedance 2.0 视频生成已上线，效果大幅提升', date: '2026-06-10' },
  { id: '2', tag: '活动', title: '新用户注册送100圣点，限时活动', date: '2026-06-08' },
  { id: '3', tag: '更新', title: 'AI文案创作新增小红书风格模板', date: '2026-06-05' },
  { id: '4', tag: '公告', title: '平台服务条款更新，请查看', date: '2026-06-01' },
])

onMounted(async () => {
  try {
    const res = await toolApi.getTools({ pageSize: 6 })
    hotTools.value = res.data.items.sort((a, b) => b.usageCount - a.usageCount).slice(0, 6)
  } catch (e) { console.error('加载热门工具失败', e) }

  statCards.value[0].value = authStore.coinBalance.toLocaleString()
  if (authStore.user) {
    // 优先从userRoles获取，其次从membershipTier获取
    const roles = authStore.userRoles || []
    const membershipTier = (authStore.user as any).membershipTier || ''

    // 角色优先级映射（从高到低）
    const rolePriority = ['boss', 'ultimate_admin', 'super_admin', 'admin', 'premium', 'normal']
    let displayRole = 'normal'

    // 先从userRoles中找最高优先级角色
    for (const role of rolePriority) {
      if (roles.includes(role)) {
        displayRole = role
        break
      }
    }

    // 如果userRoles为空，尝试从membershipTier获取
    if (displayRole === 'normal' && membershipTier && rolePriority.includes(membershipTier)) {
      displayRole = membershipTier
    }

    const roleMap: Record<string, string> = {
      'boss': '👑 罗总专属',
      'ultimate_admin': '💎 至尊管理员',
      'super_admin': '⭐ 超级管理员',
      'admin': ' 普通管理员',
      'premium': ' 高级用户',
      'normal': '普通用户'
    }
    statCards.value[3].value = roleMap[displayRole] || '普通用户'
  }
  // TODO: 接入后端API获取「已用工具」和「生成作品」统计数据
})
</script>
