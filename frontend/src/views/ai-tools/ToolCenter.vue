<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- 顶部区域 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">🤖 AI工具中心</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">专业AI工具集，覆盖多种业务场景</p>
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

    <!-- 分类标签 -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button v-for="cat in categoryList" :key="cat.id"
        @click="currentCategoryId = cat.id"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all"
        :class="currentCategoryId === cat.id
          ? 'bg-primary text-white shadow-md shadow-blue-500/20'
          : 'bg-white dark:bg-dark-100 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300'">
        {{ cat.icon }} {{ cat.label }}
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="toolStore.loading" class="flex justify-center py-20">
      <div class="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full"></div>
    </div>

    <!-- 网格视图 -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <router-link v-for="tool in filteredTools" :key="tool.id" :to="`/tools/${tool.id}`"
        class="bg-white dark:bg-dark-100 rounded-xl p-5 hover:shadow-lg transition-all hover:-translate-y-1 group border border-gray-100 dark:border-gray-700">
        <div class="flex items-start justify-between mb-3">
          <span class="text-3xl group-hover:scale-110 transition-transform">{{ tool.icon }}</span>
          <div class="flex gap-1">
            <span v-if="tool.isFree" class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">免费</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">{{ toolTypeLabel(tool.toolType) }}</span>
          </div>
        </div>
        <h3 class="font-bold text-gray-900 dark:text-white mb-1">{{ tool.name }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{{ tool.description }}</p>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium" :class="tool.isFree ? 'text-green-500' : 'text-amber-500'">
            {{ tool.isFree ? '免费' : `${tool.coinCost} 圣点` }}
          </span>
          <span class="text-xs text-gray-400">{{ formatUseCount(tool.usageCount) }}次使用</span>
        </div>
      </router-link>
    </div>

    <!-- 列表视图 -->
    <div v-else class="space-y-3">
      <router-link v-for="tool in filteredTools" :key="tool.id" :to="`/tools/${tool.id}`"
        class="bg-white dark:bg-dark-100 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
        <span class="text-3xl w-12 text-center">{{ tool.icon }}</span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-gray-900 dark:text-white">{{ tool.name }}</h3>
            <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">{{ toolTypeLabel(tool.toolType) }}</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ tool.description }}</p>
        </div>
        <div class="text-right flex-shrink-0">
          <div class="text-sm font-medium" :class="tool.isFree ? 'text-green-500' : 'text-amber-500'">
            {{ tool.isFree ? '免费' : `${tool.coinCost} 圣点` }}
          </div>
          <div class="text-xs text-gray-400">{{ formatUseCount(tool.usageCount) }}次使用</div>
        </div>
      </router-link>
    </div>

    <!-- 空状态 -->
    <div v-if="!toolStore.loading && filteredTools.length === 0" class="text-center py-20">
      <div class="text-5xl mb-4">🔍</div>
      <p class="text-gray-500">未找到相关工具</p>
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
