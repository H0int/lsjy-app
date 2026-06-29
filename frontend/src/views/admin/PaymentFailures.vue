<template>
  <div class="cyber-page">
    <div class="page-header">
      <h1>💳 支付失败管理</h1>
      <p class="subtitle">支付失败与充值拒绝记录详情</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <div class="stat-value">{{ data.totalAttempts }}</div>
          <div class="stat-label">总交易笔数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">❌</div>
        <div class="stat-info">
          <div class="stat-value" style="color:#ff4466">{{ data.failedCount }}</div>
          <div class="stat-label">失败/拒绝笔数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <div class="stat-value" :style="{ color: data.failureRate > 3 ? '#ff4466' : '#00ff88' }">{{ data.failureRate }}%</div>
          <div class="stat-label">失败率</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-value" style="color:#00ff88">{{ data.summary?.success || 0 }}</div>
          <div class="stat-label">成功笔数</div>
        </div>
      </div>
    </div>
    <div class="summary-cards">
      <div class="summary-item">
        <span class="summary-label">待支付</span>
        <span class="summary-val">{{ data.summary?.pending || 0 }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">已拒绝</span>
        <span class="summary-val" style="color:#ff4466">{{ data.summary?.rejected || 0 }}</span>
      </div>
    </div>
    <div class="cyber-card" style="margin-bottom:1.5rem">
      <div class="card-header">
        <h2>📝 失败记录</h2>
        <button class="cyber-btn" @click="loadData" :disabled="loading">{{ loading ? '...' : '🔄 刷新' }}</button>
      </div>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="!data.failures || data.failures.length === 0" class="empty">暂无失败记录 ✅</div>
      <div v-else class="error-list">
        <div v-for="f in data.failures" :key="f.id" class="error-item">
          <div class="error-main">
            <span class="error-type" :class="f.type === '支付失败' ? 'type-pay' : 'type-recharge'">{{ f.type }}</span>
            <span class="error-order">{{ f.orderNo }}</span>
          </div>
          <div class="error-detail">
            <span>用户ID: {{ f.userId }}</span>
            <span>金额: ¥{{ f.amount }}</span>
            <span>方式: {{ f.method }}</span>
          </div>
          <div class="error-reason">{{ f.reason }}</div>
          <div class="error-meta">{{ formatTime(f.time) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api'

const loading = ref(false)
const data = ref<any>({ totalAttempts: 0, failedCount: 0, failureRate: 0, failures: [], summary: {} })

async function loadData() {
  loading.value = true
  try {
    const res = await adminApi.getPaymentFailures()
    if (res.data && res.data.data) data.value = res.data.data
  } catch (e: any) {
    console.error('Load payment failures failed:', e)
  } finally {
    loading.value = false
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
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: rgba(15,15,25,0.8); border: 1px solid rgba(0,240,255,0.15); border-radius: 0.75rem; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; }
.stat-icon { font-size: 2rem; }
.stat-value { font-size: 1.5rem; font-weight: bold; color: #00f0ff; font-family: 'JetBrains Mono', monospace; }
.stat-label { font-size: 0.75rem; color: #8888aa; }
.summary-cards { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.summary-item { background: rgba(15,15,25,0.8); border: 1px solid rgba(0,240,255,0.1); border-radius: 0.5rem; padding: 0.75rem 1.25rem; display: flex; gap: 0.5rem; align-items: center; }
.summary-label { color: #8888aa; font-size: 0.8rem; }
.summary-val { color: #00f0ff; font-weight: bold; font-family: monospace; }
.cyber-card { background: rgba(15,15,25,0.8); border: 1px solid rgba(0,240,255,0.15); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1.5rem; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.card-header h2 { font-size: 1rem; font-weight: bold; color: #e0e0ff; margin: 0; }
.cyber-btn { padding: 0.4rem 0.75rem; border-radius: 0.5rem; background: rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.3); color: #00f0ff; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; }
.cyber-btn:hover { background: rgba(0,240,255,0.2); }
.cyber-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.loading, .empty { text-align: center; padding: 2rem; color: #6a6a8a; }
.error-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 600px; overflow-y: auto; }
.error-item { padding: 0.75rem; background: rgba(255,68,68,0.03); border: 1px solid rgba(255,68,68,0.1); border-radius: 0.5rem; }
.error-main { display: flex; gap: 0.5rem; margin-bottom: 0.25rem; align-items: center; flex-wrap: wrap; }
.error-type { font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
.type-pay { background: rgba(255,68,68,0.2); color: #ff4466; }
.type-recharge { background: rgba(245,158,11,0.2); color: #f59e0b; }
.error-order { color: #6a6a8a; font-size: 0.75rem; font-family: monospace; }
.error-detail { display: flex; gap: 1rem; color: #a0a0cc; font-size: 0.8rem; margin-bottom: 0.25rem; flex-wrap: wrap; }
.error-reason { color: #ff6b6b; font-size: 0.8rem; }
.error-meta { color: #4a4a6a; font-size: 0.7rem; margin-top: 0.25rem; }
</style>
