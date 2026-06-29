<template>
  <div class="cyber-page">
    <div class="page-header">
      <h1>🔴 API错误管理</h1>
      <p class="subtitle">AI接口调用错误详情与修复</p>
    </div>

    <!-- 概览卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <div class="stat-value">{{ data.total }}</div>
          <div class="stat-label">总调用次数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">❌</div>
        <div class="stat-info">
          <div class="stat-value" style="color:#ff4466">{{ data.totalErrors }}</div>
          <div class="stat-label">错误次数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <div class="stat-value" :style="{ color: data.errorRate > 2 ? '#ff4466' : '#00ff88' }">{{ data.errorRate }}%</div>
          <div class="stat-label">错误率</div>
        </div>
      </div>
    </div>

    <!-- 错误分组统计 -->
    <div v-if="data.errorGroups && data.errorGroups.length > 0" class="cyber-card" style="margin-bottom:1.5rem">
      <div class="card-header">
        <h2>📋 错误分类汇总</h2>
      </div>
      <div class="group-list">
        <div v-for="g in data.errorGroups" :key="g.error" class="group-item">
          <span class="group-count">{{ g.count }}次</span>
          <span class="group-error">{{ g.error }}</span>
          <span class="group-provider">{{ g.provider || '' }}</span>
          <span class="group-time">{{ formatTime(g.lastTime) }}</span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <button class="cyber-btn danger" @click="clearErrors" :disabled="clearing">
        {{ clearing ? '处理中...' : '🗑️ 清除错误记录' }}
      </button>
      <button class="cyber-btn" @click="loadData" :disabled="loading">
        {{ loading ? '加载中...' : '🔄 刷新' }}
      </button>
    </div>

    <!-- 错误详情列表 -->
    <div class="cyber-card">
      <div class="card-header">
        <h2>📝 错误记录详情</h2>
        <span class="record-count">{{ data.errors ? data.errors.length : 0 }} 条记录</span>
      </div>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="!data.errors || data.errors.length === 0" class="empty">暂无错误记录 ✅</div>
      <div v-else class="error-list">
        <div v-for="e in data.errors" :key="e.id" class="error-item">
          <div class="error-main">
            <span class="error-provider">{{ e.provider }}</span>
            <span class="error-model">{{ e.model }}</span>
            <span class="error-tool">{{ e.toolName }}</span>
          </div>
          <div class="error-detail">{{ e.error }}</div>
          <div class="error-meta">
            <span>用户: {{ e.userId || '系统' }}</span>
            <span>{{ formatTime(e.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api'

const loading = ref(false)
const clearing = ref(false)
const data = ref<any>({ total: 0, totalErrors: 0, errorRate: 0, errors: [], errorGroups: [] })

async function loadData() {
  loading.value = true
  try {
    const res = await adminApi.getApiErrors()
    if (res.data && res.data.data) data.value = res.data.data
  } catch (e: any) {
    console.error('Load api errors failed:', e)
  } finally {
    loading.value = false
  }
}

async function clearErrors() {
  if (!confirm('确定要清除所有错误记录吗？此操作不可撤销。')) return
  clearing.value = true
  try {
    await adminApi.fixApiErrors('clear_errors')
    await loadData()
    alert('错误记录已清除')
  } catch (e: any) {
    alert('清除失败: ' + (e.response?.data?.message || e.message))
  } finally {
    clearing.value = false
  }
}

function formatTime(t: string) {
  if (!t) return ''
  return new Date(t).toLocaleString('zh-CN')
}

onMounted(loadData)
</script>

<style scoped>
.cyber-page { padding: 1.5rem; min-height: 100vh; background: #0a0a0f; color: #e0e0ff; }
.page-header { margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.5rem; font-weight: bold; color: #00f0ff; margin: 0 0 0.25rem; }
.subtitle { color: #8888aa; font-size: 0.875rem; margin: 0; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: rgba(15,15,25,0.8); border: 1px solid rgba(0,240,255,0.15); border-radius: 0.75rem; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; }
.stat-icon { font-size: 2rem; }
.stat-value { font-size: 1.5rem; font-weight: bold; color: #00f0ff; font-family: 'JetBrains Mono', monospace; }
.stat-label { font-size: 0.75rem; color: #8888aa; }
.cyber-card { background: rgba(15,15,25,0.8); border: 1px solid rgba(0,240,255,0.15); border-radius: 0.75rem; padding: 1.25rem; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.card-header h2 { font-size: 1rem; font-weight: bold; color: #e0e0ff; margin: 0; }
.record-count { color: #6a6a8a; font-size: 0.8rem; }
.action-bar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.cyber-btn { padding: 0.5rem 1rem; border-radius: 0.5rem; background: rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.3); color: #00f0ff; cursor: pointer; font-size: 0.875rem; transition: all 0.2s; }
.cyber-btn:hover { background: rgba(0,240,255,0.2); }
.cyber-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.cyber-btn.danger { background: rgba(255,68,68,0.1); border-color: rgba(255,68,68,0.3); color: #ff4444; }
.cyber-btn.danger:hover { background: rgba(255,68,68,0.2); }
.loading, .empty { text-align: center; padding: 2rem; color: #6a6a8a; }
.group-list { display: flex; flex-direction: column; gap: 0.5rem; }
.group-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; background: rgba(255,68,68,0.05); border-radius: 0.5rem; font-size: 0.8rem; }
.group-count { background: rgba(255,68,68,0.2); color: #ff4466; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-family: monospace; }
.group-error { flex: 1; color: #a0a0cc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.group-provider { color: #6a6a8a; font-size: 0.75rem; }
.group-time { color: #4a4a6a; font-size: 0.7rem; }
.error-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 600px; overflow-y: auto; }
.error-item { padding: 0.75rem; background: rgba(255,68,68,0.03); border: 1px solid rgba(255,68,68,0.1); border-radius: 0.5rem; }
.error-main { display: flex; gap: 0.5rem; margin-bottom: 0.25rem; flex-wrap: wrap; }
.error-provider { color: #f59e0b; font-size: 0.75rem; font-weight: 600; }
.error-model { color: #c084fc; font-size: 0.75rem; }
.error-tool { color: #00f0ff; font-size: 0.75rem; }
.error-detail { color: #ff6b6b; font-size: 0.8rem; margin-bottom: 0.25rem; word-break: break-all; }
.error-meta { display: flex; justify-content: space-between; color: #4a4a6a; font-size: 0.7rem; }
</style>
