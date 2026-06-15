<template>
  <div class="cyber-page">
    <div class="page-header"><h1>🔔 消息推送</h1><p class="subtitle">系统消息与推送通知管理</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">📨</div><div class="stat-info"><div class="stat-value">{{ stats.totalSent }}</div><div class="stat-label">已发送</div></div></div>
      <div class="stat-card"><div class="stat-icon">📱</div><div class="stat-info"><div class="stat-value">{{ stats.pushToday }}</div><div class="stat-label">今日推送</div></div></div>
      <div class="stat-card"><div class="stat-icon">👁️</div><div class="stat-info"><div class="stat-value">{{ stats.readRate }}</div><div class="stat-label">阅读率</div></div></div>
      <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-info"><div class="stat-value">{{ stats.subscribers }}</div><div class="stat-label">订阅用户</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>推送消息列表</h2><el-button type="primary" size="small">+ 新建推送</el-button></div>
      <el-table :data="messages" style="width: 100%" class="cyber-table">
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }"><el-tag size="small" effect="dark">{{ row.type }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="target" label="目标用户" width="120" />
        <el-table-column prop="sentCount" label="发送数" width="80" />
        <el-table-column prop="readCount" label="已读" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === '已发送' ? 'success' : 'info'" size="small" effect="dark">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="sentAt" label="发送时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default><el-button size="small" type="primary" link>详情</el-button></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const stats = ref({ totalSent: 12456, pushToday: 234, readRate: '78%', subscribers: 1847 })
const messages = ref([
  { title: '系统维护通知', type: '系统', target: '全部用户', sentCount: 1847, readCount: 1456, status: '已发送', sentAt: '2026-06-15 10:00' },
  { title: '新功能上线公告', type: '公告', target: '全部用户', sentCount: 1847, readCount: 1234, status: '已发送', sentAt: '2026-06-14 14:00' },
  { title: 'VIP专属优惠', type: '营销', target: 'VIP用户', sentCount: 156, readCount: 134, status: '已发送', sentAt: '2026-06-13 09:00' },
  { title: '充值返利活动', type: '营销', target: '付费用户', sentCount: 234, readCount: 189, status: '已发送', sentAt: '2026-06-12 16:00' },
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
