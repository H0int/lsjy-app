<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- 顶部区域 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">🤖 AI工具中心</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">专业AI工具集，覆盖多种业务场景 · 共 {{ totalCount }} 个工具</p>
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

    <!-- 一级分类标签 -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button v-for="cat in categoryList" :key="cat.id ?? 'all'"
        @click="selectCategory(cat.id)"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all"
        :class="currentCategoryId === cat.id
          ? 'bg-primary text-white shadow-md shadow-blue-500/20'
          : 'bg-white dark:bg-dark-100 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 border border-gray-200 dark:border-gray-700'">
        {{ cat.icon }} {{ cat.label }}
        <span v-if="cat.count !== undefined" class="ml-1 opacity-70 text-xs">({{ cat.count }})</span>
      </button>
    </div>

    <!-- 二级子分类标签 -->
    <div v-if="subCategories.length > 0" class="flex flex-wrap gap-2 mb-6 pl-2 border-l-4 border-primary/30">
      <button v-for="sub in subCategories" :key="sub.value"
        @click="selectSubCategory(sub.value)"
        class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
        :class="currentSubCategory === sub.value
          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
          : 'bg-gray-50 dark:bg-dark-200 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300'">
        {{ sub.label }}
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="toolStore.loading" class="flex justify-center py-20">
      <div class="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full"></div>
    </div>

    <!-- 工具统计 -->
    <div v-if="!toolStore.loading" class="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
      <span>共 <strong class="text-primary">{{ filteredTools.length }}</strong> 个工具</span>
      <span v-if="searchQuery" class="text-orange-500">搜索: "{{ searchQuery }}"</span>
      <div class="flex gap-1">
        <span v-for="tag in popularTags" :key="tag"
          @click="searchQuery = tag"
          class="cursor-pointer px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded text-xs hover:bg-orange-100">
          🔥{{ tag }}
        </span>
      </div>
    </div>

    <!-- 网格视图 -->
    <div v-if="!toolStore.loading && viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <router-link v-for="tool in filteredTools" :key="tool.id" :to="`/tools/${tool.id}`"
        class="bg-white dark:bg-dark-100 rounded-xl p-5 hover:shadow-lg transition-all hover:-translate-y-1 group border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        <div class="absolute top-0 right-0 flex gap-1 p-2">
          <span v-for="tag in tool.tags?.slice(0, 2)" :key="tag"
            class="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
            {{ tag }}
          </span>
        </div>
        <div class="flex items-start justify-between mb-3">
          <span class="text-3xl group-hover:scale-110 transition-transform">{{ tool.icon }}</span>
          <div class="flex gap-1">
            <span v-if="tool.isFree" class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">免费</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">{{ toolTypeLabel(tool.toolType) }}</span>
          </div>
        </div>
        <h3 class="font-bold text-gray-900 dark:text-white mb-1">{{ tool.name }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 h-10">{{ tool.description }}</p>
        <div class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <span class="text-sm font-medium" :class="tool.isFree ? 'text-green-500' : 'text-amber-500'">
            {{ tool.isFree ? '免费使用' : `${tool.coinCost} 圣点/次` }}
          </span>
          <span class="text-xs text-gray-400">{{ formatUseCount(tool.usageCount) }}次使用</span>
        </div>
      </router-link>
    </div>

    <!-- 列表视图 -->
    <div v-else-if="!toolStore.loading" class="space-y-3">
      <router-link v-for="tool in filteredTools" :key="tool.id" :to="`/tools/${tool.id}`"
        class="bg-white dark:bg-dark-100 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
        <span class="text-3xl w-12 text-center flex-shrink-0">{{ tool.icon }}</span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="font-bold text-gray-900 dark:text-white">{{ tool.name }}</h3>
            <span v-for="tag in tool.tags?.slice(0, 2)" :key="tag"
              class="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
              {{ tag }}
            </span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">{{ toolTypeLabel(tool.toolType) }}</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{{ tool.description }}</p>
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
      <p class="text-gray-500 mb-2">未找到相关工具</p>
      <button @click="searchQuery='';currentCategoryId=null;currentSubCategory=''" class="text-primary text-sm hover:underline">清除筛选条件</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToolStore } from '@/stores/tool'
import type { Tool } from '@/types'
import { toolTypeMap } from '@/utils'
import { toolSubCategories } from '@/api/mock'

const toolStore = useToolStore()
const searchQuery = ref('')
const currentCategoryId = ref<number | null>(null)
const currentSubCategory = ref<string>('')
const viewMode = ref<'grid' | 'list'>('grid')

const popularTags = ['热门', '免费']

const totalCount = computed(() => toolStore.total)

const categoryList = computed(() => {
  const cats = [
    { id: null, label: '全部工具', icon: '📦', count: toolStore.categories.reduce((s, c) => s + c.toolCount, 0) },
    ...toolStore.categories.map(c => ({ id: c.id, label: c.name, icon: c.icon || '📁', count: c.toolCount }))
  ]
  return cats
})

const subCategories = computed(() => {
  if (!currentCategoryId.value) return []
  return toolSubCategories[currentCategoryId.value] || []
})

const filteredTools = computed(() => {
  let list = toolStore.tools
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(t =>
      t.name.toLowerCase().includes(q) ||
      (t.description?.toLowerCase().includes(q)) ||
      t.tags?.some(tag => tag.toLowerCase().includes(q))
    )
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

function selectCategory(catId: number | null) {
  currentCategoryId.value = catId
  currentSubCategory.value = ''
}

function selectSubCategory(sub: string) {
  currentSubCategory.value = sub
}

watch([currentCategoryId, currentSubCategory], () => {
  toolStore.fetchTools({
    categoryId: currentCategoryId.value || undefined,
    subCategory: currentSubCategory.value || undefined
  })
})

onMounted(() => {
  toolStore.fetchCategories()
  toolStore.fetchTools()
})
</script>
