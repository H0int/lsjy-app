<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- 顶部区域 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          <span style="color: var(--cyber-cyan);">▍</span>AI工具中心
        </h1>
        <p class="mt-1" style="color: var(--cyber-text-dim);">专业AI工具集，覆盖多种业务场景</p>
      </div>
      <!-- 搜索框 -->
      <div class="flex items-center gap-3">
        <el-input v-model="searchQuery" placeholder="搜索工具..." size="large" clearable class="w-64"
          prefix-icon="Search" />
        <el-button-group>
          <el-button :type="viewMode === 'grid' ? 'primary' : ''" @click="viewMode = 'grid'">▦</el-button>
          <el-button :type="viewMode === 'list' ? 'primary' : ''" @click="viewMode = 'list'">☰</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 六大板块分类标签 -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button v-for="cat in sixPillars" :key="cat.id"
        @click="currentPillar = cat.id"
        class="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
        :style="currentPillar === cat.id
          ? `background: linear-gradient(135deg, ${cat.color}, ${cat.color}99); color: #000; box-shadow: 0 0 15px ${cat.color}40;`
          : 'background: rgba(0,240,255,0.03); color: var(--cyber-text-dim); border: 1px solid var(--cyber-border);'">
        {{ cat.icon }} {{ cat.label }}
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="toolStore.loading" class="flex justify-center py-20">
      <div class="pulse-glow w-8 h-8 rounded-full" style="background: var(--cyber-cyan);"></div>
    </div>

    <!-- 网格视图 - 赛博朋克卡片 -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <router-link v-for="tool in filteredTools" :key="tool.id" :to="`/tools/${tool.id}`"
        class="cyber-card p-5 transition-all duration-300 hover:-translate-y-1 group block">
        <div class="flex items-start justify-between mb-3">
          <span class="text-3xl group-hover:scale-110 transition-transform" style="filter: drop-shadow(0 0 6px rgba(0,240,255,0.4));">{{ tool.icon }}</span>
          <div class="flex gap-1">
            <span v-if="tool.isFree" class="text-xs px-2 py-0.5 rounded-full"
              style="background: rgba(0,255,136,0.1); color: var(--cyber-green); border: 1px solid rgba(0,255,136,0.2);">免费</span>
            <span v-else class="text-xs px-2 py-0.5 rounded-full"
              :style="`background: ${getPillarColor(tool)}15; color: ${getPillarColor(tool)}; border: 1px solid ${getPillarColor(tool)}30;`">{{ tool.coinCost }}圣力</span>
          </div>
        </div>
        <h3 class="font-bold mb-1" style="color: var(--cyber-text);">{{ tool.name }}</h3>
        <p class="text-sm mb-3 line-clamp-2" style="color: var(--cyber-text-dim);">{{ tool.description }}</p>
        <div class="flex items-center justify-between">
          <span class="text-xs px-2 py-0.5 rounded-full" :style="`background: ${getPillarColor(tool)}15; color: ${getPillarColor(tool)}; border: 1px solid ${getPillarColor(tool)}30;`">{{ getPillarLabel(tool) }}</span>
          <span class="text-xs" style="color: var(--cyber-text-dim);">{{ formatUseCount(tool.usageCount) }}次使用</span>
        </div>
      </router-link>
    </div>

    <!-- 列表视图 -->
    <div v-else class="space-y-3">
      <router-link v-for="tool in filteredTools" :key="tool.id" :to="`/tools/${tool.id}`"
        class="cyber-card p-4 flex items-center gap-4 transition-all duration-300 block">
        <span class="text-3xl w-12 text-center" style="filter: drop-shadow(0 0 4px rgba(0,240,255,0.3));">{{ tool.icon }}</span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="font-bold" style="color: var(--cyber-text);">{{ tool.name }}</h3>
            <span class="text-xs px-2 py-0.5 rounded-full"
              :style="`background: ${getPillarColor(tool)}15; color: ${getPillarColor(tool)}; border: 1px solid ${getPillarColor(tool)}30;`">{{ getPillarLabel(tool) }}</span>
          </div>
          <p class="text-sm truncate" style="color: var(--cyber-text-dim);">{{ tool.description }}</p>
        </div>
        <div class="text-right flex-shrink-0">
          <div class="text-sm font-bold" :style="{ color: tool.isFree ? 'var(--cyber-green)' : 'var(--cyber-amber)' }">
            {{ tool.isFree ? '免费' : `${tool.coinCost} 圣力` }}
          </div>
          <div class="text-xs" style="color: var(--cyber-text-dim);">{{ formatUseCount(tool.usageCount) }}次使用</div>
        </div>
      </router-link>
    </div>

    <!-- 空状态 -->
    <div v-if="!toolStore.loading && filteredTools.length === 0" class="text-center py-20">
      <div class="text-5xl mb-4" style="filter: drop-shadow(0 0 8px rgba(0,240,255,0.3));">🔍</div>
      <p style="color: var(--cyber-text-dim);">未找到相关工具</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToolStore } from '@/stores/tool'
import type { Tool } from '@/types'
import { toolTypeMap } from '@/utils'

const toolStore = useToolStore()
const searchQuery = ref('')
const currentPillar = ref<string>('all')
const viewMode = ref<'grid' | 'list'>('grid')

// 六大板块定义
const sixPillars = [
  { id: 'all', label: '全部', icon: '📦', color: '#00f0ff' },
  { id: 'ai', label: 'AI', icon: '🤖', color: '#00f0ff' },
  { id: 'ecommerce', label: '电商', icon: '🛒', color: '#ff6b35' },
  { id: 'education', label: '教育', icon: '📚', color: '#4ecdc4' },
  { id: 'media', label: '自媒体', icon: '📱', color: '#ffe66d' },
  { id: 'pet', label: '宠物', icon: '🐾', color: '#ff85a2' },
  { id: 'campus', label: '伯雅校园', icon: '🏫', color: '#a78bfa' },
]

// 后端分类ID到六大板块的映射
const categoryToPillar: Record<number, string> = {
  1: 'ai', 2: 'ai', 3: 'ai', 4: 'ai', 5: 'ai', 6: 'ai', 7: 'ai', 8: 'ai',
  9: 'ecommerce', 10: 'ecommerce', 11: 'ecommerce', 12: 'ecommerce', 13: 'ecommerce', 14: 'ecommerce',
  15: 'education', 16: 'education', 17: 'education', 18: 'education', 19: 'education',
  20: 'media', 21: 'media', 22: 'media', 23: 'media',
  24: 'pet', 25: 'pet', 26: 'pet', 27: 'pet', 28: 'pet',
  29: 'campus', 30: 'campus', 31: 'campus', 32: 'campus', 33: 'campus',
}

function guessPillar(tool: Tool): string {
  const text = ((tool.name || '') + ' ' + (tool.description || '')).toLowerCase()
  if (/电商|商品|店铺|营销|直播|供应链|购物|订单/.test(text)) return 'ecommerce'
  if (/教育|教学|学习|考试|课程|辅导|学术|学生/.test(text)) return 'education'
  if (/自媒体|内容|粉丝|运营|爆款|文案|小红书|抖音|公众号|热点/.test(text)) return 'media'
  if (/宠物|喂养|训练|品种|猫|狗|动物/.test(text)) return 'pet'
  if (/校园|伯雅|就业|教务|安全/.test(text)) return 'campus'
  return 'ai'
}

function getPillarForTool(tool: Tool): string {
  if (tool.categoryId && categoryToPillar[tool.categoryId]) {
    return categoryToPillar[tool.categoryId]
  }
  return guessPillar(tool)
}

function getPillarLabel(tool: Tool): string {
  const pillarId = getPillarForTool(tool)
  const p = sixPillars.find(c => c.id === pillarId)
  return p ? p.label : 'AI'
}

function getPillarColor(tool: Tool): string {
  const pillarId = getPillarForTool(tool)
  const p = sixPillars.find(c => c.id === pillarId)
  return p ? p.color : '#00f0ff'
}

const filteredTools = computed(() => {
  let list = toolStore.tools
  if (currentPillar.value !== 'all') {
    list = list.filter(t => getPillarForTool(t) === currentPillar.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(t => t.name.toLowerCase().includes(q) || (t.description?.toLowerCase().includes(q)))
  }
  return list
})

function toolTypeLabel(type: string): string {
  return toolTypeMap[type] || type
}

function formatUseCount(count: number): string {
  if (count >= 10000) return (count / 10000).toFixed(1) + '万'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
  return String(count || 0)
}

onMounted(() => {
  toolStore.fetchTools()
})
</script>
