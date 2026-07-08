<template>
  <div>
    <div class="flex items-center gap-3 mb-4">
      <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 120px;">
        <el-option label="待审核" value="pending_payment" />
        <el-option label="已批准" value="approved" />
        <el-option label="已拒绝" value="rejected" />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
    </div>
    <div class="cyber-card p-4">
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="id" label="订单ID" width="80" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="packageName" label="套餐" />
        <el-table-column prop="amount" label="金额" width="90" />
        <el-table-column prop="coins" label="圣力" width="90" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
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
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function approve(row: any) {
  try {
    await adminApi.approveOrder(row.id)
    ElMessage.success('已通过')
    loadData()
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  }
}

async function reject(row: any) {
  try {
    await ElMessageBox.prompt('请输入拒绝原因', '拒绝充值', { confirmButtonText: '确认', cancelButtonText: '取消' })
      .then(({ value }) => adminApi.rejectOrder(row.id, value))
    ElMessage.success('已拒绝')
    loadData()
  } catch { /* cancelled */ }
}

onMounted(loadData)
</script>
