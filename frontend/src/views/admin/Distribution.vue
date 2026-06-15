<template>
  <div class="cyber-page">
    <div class="page-header"><h1>🔗 分销管理</h1><p class="subtitle">分销体系与佣金规则配置</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-info"><div class="stat-value">{{ stats.distributors }}</div><div class="stat-label">分销商</div></div></div>
      <div class="stat-card"><div class="stat-icon">🔗</div><div class="stat-info"><div class="stat-value">{{ stats.totalLinks }}</div><div class="stat-label">推广链接</div></div></div>
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><div class="stat-value">¥{{ stats.totalCommission }}</div><div class="stat-label">累计佣金</div></div></div>
      <div class="stat-card"><div class="stat-icon">📈</div><div class="stat-info"><div class="stat-value">{{ stats.conversionRate }}</div><div class="stat-label">转化率</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>分销商列表</h2><el-button type="primary" size="small">+ 添加分销商</el-button></div>
      <el-table :data="distributors" style="width: 100%" class="cyber-table">
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="level" label="等级" width="80" />
        <el-table-column prop="referrals" label="推荐人数" width="100" />
        <el-table-column prop="totalSales" label="累计销售" width="120" />
        <el-table-column prop="commission" label="累计佣金" width="120">
          <template #default="{ row }"><span style="color:#00ff88">¥{{ row.commission }}</span></template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === '活跃' ? 'success' : 'info'" size="small" effect="dark">{{ row.status }}</el-tag></template>
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
const stats = ref({ distributors: 45, totalLinks: 234, totalCommission: '12,456', conversionRate: '8.5%' })
const distributors = ref([
  { userId: 'U10001', username: '张三', level: '金牌', referrals: 156, totalSales: '¥45,678', commission: '4,567', status: '活跃' },
  { userId: 'U10042', username: '李四', level: '银牌', referrals: 89, totalSales: '¥23,456', commission: '2,345', status: '活跃' },
  { userId: 'U10234', username: '王五', level: '铜牌', referrals: 34, totalSales: '¥8,900', commission: '890', status: '不活跃' },
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
