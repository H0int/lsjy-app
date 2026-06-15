<template>
  <div class="cyber-page">
    <div class="page-header"><h1>💸 佣金记录</h1><p class="subtitle">分销佣金明细与结算管理</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><div class="stat-value">¥{{ stats.totalCommission }}</div><div class="stat-label">累计佣金</div></div></div>
      <div class="stat-card"><div class="stat-icon">📅</div><div class="stat-info"><div class="stat-value">¥{{ stats.monthCommission }}</div><div class="stat-label">本月佣金</div></div></div>
      <div class="stat-card"><div class="stat-icon">⏳</div><div class="stat-info"><div class="stat-value">¥{{ stats.pendingSettle }}</div><div class="stat-label">待结算</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">{{ stats.settleCount }}</div><div class="stat-label">已结算笔数</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>佣金明细</h2></div>
      <el-table :data="commissions" style="width: 100%" class="cyber-table">
        <el-table-column prop="orderId" label="订单号" width="160" />
        <el-table-column prop="fromUser" label="来源用户" width="120" />
        <el-table-column prop="toUser" label="佣金接收" width="120" />
        <el-table-column prop="amount" label="订单金额" width="100" />
        <el-table-column prop="rate" label="佣金比例" width="80" />
        <el-table-column prop="commission" label="佣金金额" width="100">
          <template #default="{ row }"><span style="color:#00ff88;font-weight:bold">+¥{{ row.commission }}</span></template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }"><el-tag :type="row.status === '已结算' ? 'success' : 'warning'" size="small" effect="dark">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="160" />
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const stats = ref({ totalCommission: '12,456', monthCommission: '3,789', pendingSettle: '1,234', settleCount: 156 })
const commissions = ref([
  { orderId: 'ORD20260615001', fromUser: '张三', toUser: '李四', amount: '¥299', rate: '10%', commission: '29.9', status: '已结算', createdAt: '2026-06-15 10:30' },
  { orderId: 'ORD20260615002', fromUser: '王五', toUser: '李四', amount: '¥599', rate: '10%', commission: '59.9', status: '待结算', createdAt: '2026-06-15 11:00' },
  { orderId: 'ORD20260614003', fromUser: '赵六', toUser: '张三', amount: '¥199', rate: '8%', commission: '15.9', status: '已结算', createdAt: '2026-06-14 15:20' },
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
