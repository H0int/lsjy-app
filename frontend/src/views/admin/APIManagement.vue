<template>
  <div class="cyber-page">
    <div class="page-header"><h1>🔌 API管理</h1><p class="subtitle">API接口管理与调用统计</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">🔌</div><div class="stat-info"><div class="stat-value">{{ stats.totalAPIs }}</div><div class="stat-label">接口总数</div></div></div>
      <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-info"><div class="stat-value">{{ stats.todayCalls }}</div><div class="stat-label">今日调用</div></div></div>
      <div class="stat-card"><div class="stat-icon">⚡</div><div class="stat-info"><div class="stat-value">{{ stats.avgLatency }}</div><div class="stat-label">平均延迟</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">{{ stats.successRate }}</div><div class="stat-label">成功率</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>API接口列表</h2></div>
      <el-table :data="apis" style="width: 100%" class="cyber-table">
        <el-table-column prop="method" label="方法" width="80">
          <template #default="{ row }"><el-tag :type="row.method === 'GET' ? 'success' : row.method === 'POST' ? 'primary' : 'warning'" size="small" effect="dark">{{ row.method }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="path" label="路径" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="calls" label="调用次数" width="100" />
        <el-table-column prop="latency" label="平均延迟" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === '正常' ? 'success' : 'danger'" size="small" effect="dark">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default><el-button size="small" type="primary" link>详情</el-button></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const stats = ref({ totalAPIs: 45, todayCalls: '23,456', avgLatency: '45ms', successRate: '99.8%' })
const apis = ref([
  { method: 'POST', path: '/api/v1/auth/login', description: '用户登录', calls: 1234, latency: '32ms', status: '正常' },
  { method: 'POST', path: '/api/v1/ai/chat', description: 'AI对话', calls: 5678, latency: '120ms', status: '正常' },
  { method: 'GET', path: '/api/v1/users', description: '用户列表', calls: 890, latency: '28ms', status: '正常' },
  { method: 'POST', path: '/api/v1/payment/recharge', description: '充值下单', calls: 234, latency: '45ms', status: '正常' },
])
</script>
<style scoped>
.cyber-page { padding: 1.5rem; min-height: 100vh; background: #0a0a0f; color: #e0e0ff; }
.page-header { margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.5rem; font-weight: bold; color: #00f0ff; margin: 0 0 0.25rem 0; }
.subtitle { color: #8888aa; font-size: 0.875rem; margin: 0; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: rgba(15,15,25,0.8); border: 1px solid rgba(0,240,255,0.15); border-radius: 0.75rem; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; }
.stat-icon { font-size: 2rem; }
.stat-value { font-size: 1.5rem; font-weight: bold; color: #00f0ff; font-family: 'JetBrains Mono', monospace; }
.stat-label { font-size: 0.75rem; color: #8888aa; }
.cyber-card { background: rgba(15,15,25,0.8); border: 1px solid rgba(0,240,255,0.15); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1.5rem; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.card-header h2 { font-size: 1rem; font-weight: bold; color: #e0e0ff; margin: 0; }
.cyber-table { --el-table-bg-color: transparent; --el-table-tr-bg-color: transparent; --el-table-header-bg-color: rgba(0,240,255,0.05); --el-table-row-hover-bg-color: rgba(0,240,255,0.08); --el-table-border-color: rgba(0,240,255,0.1); --el-table-text-color: #e0e0ff; --el-table-header-text-color: #00f0ff; }
</style>
