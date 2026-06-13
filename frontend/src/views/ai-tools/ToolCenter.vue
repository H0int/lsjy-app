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

    <!-- 分类标签 - 霓虹风格 -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button v-for="cat in categoryList" :key="cat.id ?? 'all'"
        @click="currentCategoryId = cat.id"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
        :style="currentCategoryId === cat.id
          ? 'background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #000; box-shadow: 0 0 15px rgba(0,240,255,0.3);'
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
            <span class="text-xs px-2 py-0.5 rounded-full"
              style="background: rgba(0,240,255,0.1); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.2);">{{ toolTypeLabel(tool.toolType) }}</span>
          </div>
        </div>
        <h3 class="font-bold mb-1" style="color: var(--cyber-text);">{{ tool.name }}</h3>
        <p class="text-sm mb-3 line-clamp-2" style="color: var(--cyber-text-dim);">{{ tool.description }}</p>
        <div class="flex items-center justify-between">
          <span class="text-sm font-bold" :style="{ color: tool.isFree ? 'var(--cyber-green)' : 'var(--cyber-amber)' }">
            {{ tool.isFree ? '免费' : `${tool.coinCost} 圣点` }}
          </span>
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
              style="background: rgba(0,240,255,0.1); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.2);">{{ toolTypeLabel(tool.toolType) }}</span>
          </div>
          <p class="text-sm truncate" style="color: var(--cyber-text-dim);">{{ tool.description }}</p>
        </div>
        <div class="text-right flex-shrink-0">
          <div class="text-sm font-bold" :style="{ color: tool.isFree ? 'var(--cyber-green)' : 'var(--cyber-amber)' }">
            {{ tool.isFree ? '免费' : `${tool.coinCost} 圣点` }}
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
import { ref, computed, onMounted, watch } from 'vue'
import { useToolStore } from '@/stores/tool'
import type { Tool } from '@/types'
import { toolTypeMap } from '@/utils'

const toolStore = useToolStore()
const searchQuery = ref('')
const currentCategoryId = ref<number | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')

const categoryList = computed(() => [
  { id: null, label: '全部', icon: '📦' },
  ...toolStore.categories.map(c => ({ id: c.id, label: c.name, icon: c.icon || '📁' }))
])

const filteredTools = computed(() => {
  let list = toolStore.tools
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
  return String(count)
}

watch(currentCategoryId, (val) => {
  toolStore.fetchTools(val ? { categoryId: val } : undefined)
})

onMounted(() => {
  toolStore.fetchCategories()
  toolStore.fetchTools()
})
</script>
