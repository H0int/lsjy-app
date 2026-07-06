<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
        <span style="color: var(--cyber-cyan);">▍</span>我的作品
      </h1>
      <router-link to="/tools" class="px-4 py-2 rounded-lg text-sm font-medium"
        style="background: rgba(0,240,255,0.1); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.3);">
        开始创作
      </router-link>
    </div>

    <div v-if="loading" class="cyber-card p-8 text-center" style="color: var(--cyber-text-dim);">加载中...</div>

    <div v-else-if="works.length === 0" class="cyber-card p-8 text-center">
      <div class="text-4xl mb-4">🎨</div>
      <p style="color: var(--cyber-text-dim);">您使用AI生成的内容将在这里展示</p>
      <router-link to="/tools" class="inline-block mt-4 px-6 py-2 rounded-lg text-sm font-medium"
        style="background: rgba(0,240,255,0.1); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.3);">
        浏览工具中心
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div v-for="item in works" :key="item.id" class="cyber-card p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xl">{{ item.tool?.icon || '🤖' }}</span>
              <h2 class="font-bold truncate" style="color: var(--cyber-text);">{{ item.tool?.name || `工具 #${item.toolId}` }}</h2>
              <span class="text-xs px-2 py-0.5 rounded-full" :style="statusStyle(item.status)">{{ statusLabel(item.status) }}</span>
            </div>
            <p class="text-sm line-clamp-2" style="color: var(--cyber-text-dim);">{{ item.inputText || '暂无输入内容' }}</p>
            <p v-if="item.outputText" class="text-sm mt-2 line-clamp-3" style="color: var(--cyber-text);">{{ item.outputText }}</p>
            <p class="text-xs mt-3" style="color: var(--cyber-text-dim);">{{ formatDate(item.createdAt) }} · 消耗 {{ item.coinCost }} 圣力</p>
          </div>
          <button type="button" class="px-3 py-1.5 rounded-lg text-sm shrink-0"
            :style="item.isFavorite ? favoriteActiveStyle : favoriteStyle"
            @click="toggleFavorite(item)">
            {{ item.isFavorite ? '已收藏' : '收藏' }}
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
const works = ref<AiCallRecord[]>([])

const favoriteStyle = 'background: rgba(255,184,0,0.08); color: var(--cyber-amber); border: 1px solid rgba(255,184,0,0.25);'
const favoriteActiveStyle = 'background: rgba(255,184,0,0.2); color: var(--cyber-amber); border: 1px solid rgba(255,184,0,0.45);'

function statusLabel(status: string) {
  return ({ completed: '已完成', processing: '处理中', pending: '排队中', failed: '失败', cancelled: '已取消' } as Record<string, string>)[status] || status
}

function statusStyle(status: string) {
  if (status === 'completed') return 'background: rgba(0,255,136,0.1); color: var(--cyber-green);'
  if (status === 'failed') return 'background: rgba(255,68,68,0.1); color: #ff6b6b;'
  return 'background: rgba(0,240,255,0.1); color: var(--cyber-cyan);'
}

async function loadWorks() {
  loading.value = true
  try {
    const res = await toolApi.getWorks({ page: 1, pageSize: 50 })
    works.value = (res.data as any)?.items || []
  } finally {
    loading.value = false
  }
}

async function toggleFavorite(item: AiCallRecord) {
  await toolApi.toggleFavorite(item.id)
  item.isFavorite = item.isFavorite ? 0 : 1
  ElMessage.success(item.isFavorite ? '已加入收藏' : '已取消收藏')
}

onMounted(loadWorks)
</script>
