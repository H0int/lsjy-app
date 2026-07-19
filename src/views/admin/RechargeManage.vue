<template>
  <div>
    <div class="flex items-center gap-3 mb-4">
      <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 120px;">
        <el-option label="待审核" value="pending_payment" />
        <el-option label="已批准" value="approved" />
        <el-option label="已拒绝" value="rejected" />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
      <el-button @click="exportData">导出</el-button>
      <el-button type="danger" @click="batchApprove" :disabled="!selected.length">批量通过</el-button>
    </div>
    <div class="cyber-card p-4">
      <el-table :data="list" stripe v-loading="loading" empty-text="暂无充值订单" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="订单ID" width="80" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="packageName" label="套餐" />
        <el-table-column prop="amount" label="金额" width="90" />
        <el-table-column prop="coins" label="圣力" width="90" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" effect="dark" round>{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending_payment'" size="small" link type="success" @click="approve(row)">通过</el-button>
            <el-button v-if="row.status === 'pending_payment'" size="small" link type="danger" @click="reject(row)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-end mt-4">
        <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" layout="total, prev, pager, next" @current-change="loadData" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api'
import { formatDate } from '@/utils'

const loading = ref(false)
const list = ref<any[]>([])
const selected = ref<any[]>([])
const statusFilter = ref('')
const page = ref(1)
const pageSize = 20
const total = ref(0)

function statusType(s: string) {
  return { pending_payment: 'warning', approved: 'success', rejected: 'danger' }[s] || 'info'
}
function statusLabel(s: string) {
  return { pending_payment: '待审核', approved: '已批准', rejected: '已拒绝' }[s] || s
}

async function loadData() {
  loading.value = true
  try {
    const res = await adminApi.getRechargeOrders({ page: page.value, pageSize, status: statusFilter.value || undefined })
    list.value = res.data?.items || []
    total.value = res.data?.total || 0
  } catch (e: any) {
    console.warn('[API] 加载失败:', e?.message)
  } finally {
    loading.value = false
  }
}

function handleSelectionChange(rows: any[]) { selected.value = rows }

async function approve(row: any) {
  try {
    await adminApi.approveOrder(row.id)
    ElMessage.success('已通过')
    loadData()
  } catch (e: any) { console.warn('[API] 操作失败:', e?.message) }
}

async function batchApprove() {
  try {
    await ElMessageBox.confirm(`确认批量通过 ${selected.value.length} 个订单？`)
    for (const row of selected.value) {
      if (row.status === 'pending_payment') await adminApi.approveOrder(row.id)
    }
    ElMessage.success('批量通过完成')
    loadData()
  } catch { /* cancelled */ }
}

async function reject(row: any) {
  try {
    await ElMessageBox.prompt('请输入拒绝原因', '拒绝充值')
      .then(({ value }) => adminApi.rejectOrder(row.id, value))
    ElMessage.success('已拒绝')
    loadData()
  } catch { /* cancelled */ }
}

function exportData() {
  const csv = [
    ['订单ID','用户','套餐','金额','圣力','状态','时间'].join(','),
    ...list.value.map(r => [r.id, r.username, r.packageName, r.amount, r.coins, statusLabel(r.status), formatDate(r.createdAt)].join(','))
  ].join('\n')
  const blob = new Blob(['\ufeff'+csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `recharge-orders-${new Date().toISOString().slice(0,10)}.csv`
  link.click()
}

onMounted(loadData)
</script>
