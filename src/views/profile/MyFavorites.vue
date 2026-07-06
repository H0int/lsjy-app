<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
        <span style="color: var(--cyber-cyan);">▍</span>收藏工具
      </h1>
      <router-link to="/tools" class="px-4 py-2 rounded-lg text-sm font-medium"
        style="background: rgba(0,240,255,0.1); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.3);">
        浏览工具中心
      </router-link>
    </div>

    <div v-if="loading" class="cyber-card p-8 text-center" style="color: var(--cyber-text-dim);">加载中...</div>

    <div v-else-if="favorites.length === 0" class="cyber-card p-8 text-center">
      <div class="text-4xl mb-4">⭐</div>
      <p style="color: var(--cyber-text-dim);">你收藏的 AI 作品和工具调用会显示在这里</p>
      <router-link to="/profile/works" class="inline-block mt-4 px-6 py-2 rounded-lg text-sm font-medium"
        style="background: rgba(255,184,0,0.1); color: var(--cyber-amber); border: 1px solid rgba(255,184,0,0.3);">
        去我的作品收藏
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div v-for="item in favorites" :key="item.id" class="cyber-card p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xl">{{ item.tool?.icon || '⭐' }}</span>
              <h2 class="font-bold truncate" style="color: var(--cyber-text);">{{ item.tool?.name || `工具 #${item.toolId}` }}</h2>
            </div>
            <p class="text-sm line-clamp-2" style="color: var(--cyber-text-dim);">{{ item.inputText || '暂无输入内容' }}</p>
            <p v-if="item.outputText" class="text-sm mt-2 line-clamp-3" style="color: var(--cyber-text);">{{ item.outputText }}</p>
            <p class="text-xs mt-3" style="color: var(--cyber-text-dim);">{{ formatDate(item.createdAt) }}</p>
          </div>
          <button type="button" class="px-3 py-1.5 rounded-lg text-sm shrink-0"
            style="background: rgba(255,68,68,0.08); color: #ff6b6b; border: 1px solid rgba(255,68,68,0.25);"
            @click="removeFavorite(item)">
            取消收藏
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { toolApi } from '@/api'
import { formatDate } from '@/utils'
import type { AiCallRecord } from '@/types'

const loading = ref(false)
const favorites = ref<AiCallRecord[]>([])

async function loadFavorites() {
  loading.value = true
  try {
    const res = await toolApi.getFavorites({ page: 1, pageSize: 50 })
    favorites.value = (res.data as any)?.items || []
  } finally {
    loading.value = false
  }
}

async function removeFavorite(item: AiCallRecord) {
  await toolApi.toggleFavorite(item.id)
  favorites.value = favorites.value.filter(record => record.id !== item.id)
  ElMessage.success('已取消收藏')
}

onMounted(loadFavorites)
</script>
