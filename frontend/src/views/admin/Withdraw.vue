<template>
  <div class="cyber-page">
    <div class="page-header"><h1>🏦 提现管理</h1><p class="subtitle">用户提现申请审核与处理</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-info"><div class="stat-value">{{ stats.totalRequests }}</div><div class="stat-label">提现申请</div></div></div>
      <div class="stat-card"><div class="stat-icon">⏳</div><div class="stat-info"><div class="stat-value">{{ stats.pending }}</div><div class="stat-label">待审核</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">¥{{ stats.totalPaid }}</div><div class="stat-label">已打款</div></div></div>
      <div class="stat-card"><div class="stat-icon">❌</div><div class="stat-info"><div class="stat-value">{{ stats.rejected }}</div><div class="stat-label">已拒绝</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>提现申请列表</h2></div>
      <el-table :data="withdrawals" style="width: 100%" class="cyber-table">
        <el-table-column prop="requestId" label="申请编号" width="140" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="amount" label="提现金额" width="120">
          <template #default="{ row }"><span style="color:#00f0ff;font-weight:bold">¥{{ row.amount }}</span></template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="80" />
        <el-table-column prop="actual" label="实际到账" width="100" />
        <el-table-column prop="account" label="收款账号" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已完成' ? 'success' : row.status === '已拒绝' ? 'danger' : 'warning'" size="small" effect="dark">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === '待审核'" size="small" type="success" link>通过</el-button>
            <el-button v-if="row.status === '待审核'" size="small" type="danger" link>拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const stats = ref({ totalRequests: 89, pending: 12, totalPaid: '45,678', rejected: 3 })
const withdrawals = ref([
  { requestId: 'WD20260615001', username: '张三', amount: '500', fee: '5', actual: '495', account: '支付宝 138****1234', status: '待审核', createdAt: '2026-06-15 10:00' },
  { requestId: 'WD20260614002', username: '李四', amount: '1000', fee: '10', actual: '990', account: '微信 wxid_xxx', status: '已完成', createdAt: '2026-06-14 15:30' },
  { requestId: 'WD20260613003', username: '王五', amount: '200', fee: '2', actual: '198', account: '银行卡 6222****', status: '已拒绝', createdAt: '2026-06-13 09:00' },
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
