<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">订单管理</h2>
      <div class="flex gap-2">
        <el-input v-model="search" placeholder="搜索用户/商品" clearable style="width: 200px;" />
        <el-select v-model="status" placeholder="状态" clearable style="width: 120px;">
          <el-option label="待支付" value="pending" />
          <el-option label="已支付" value="paid" />
          <el-option label="已完成" value="completed" />
          <el-option label="已退款" value="refunded" />
        </el-select>
        <el-button type="primary" @click="loadData">查询</el-button>
        <el-button @click="reset">重置</el-button>
        <el-button @click="exportData">导出</el-button>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="cyber-card p-4 text-center">
        <div class="text-xs" style="color:#808099;">总订单</div>
        <div class="text-2xl font-bold" style="color:#00f0ff;">{{ stats.total }}</div>
      </div>
      <div class="cyber-card p-4 text-center">
        <div class="text-xs" style="color:#808099;">待支付</div>
        <div class="text-2xl font-bold" style="color:#00f0ff;">{{ stats.pending }}</div>
      </div>
      <div class="cyber-card p-4 text-center">
        <div class="text-xs" style="color:#808099;">已完成</div>
        <div class="text-2xl font-bold" style="color:#00f0ff;">{{ stats.completed }}</div>
      </div>
      <div class="cyber-card p-4 text-center">
        <div class="text-xs" style="color:#808099;">总金额</div>
        <div class="text-2xl font-bold" style="color:#00f0ff;">¥{{ stats.amount }}</div>
      </div>
    </div>

    <div class="cyber-card p-4">
      <el-table :data="filteredOrders" stripe v-loading="loading" empty-text="暂无订单">
        <el-table-column prop="id" label="订单号" width="120" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="product" label="商品" />
        <el-table-column prop="amount" label="金额" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" effect="dark" round>{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'pending'" size="small" link type="success" @click="markPaid(row)">标记支付</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="detailVisible" title="订单详情" width="500px">
      <div v-if="detail" class="space-y-2 text-sm" style="color:#e0e0ff;">
        <div v-for="(v,k) in detail" :key="k"><span style="color:#808099;">{{ k }}:</span> {{ v }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '@/api'
import { formatDate } from '@/utils'

const loading = ref(false)
const orders = ref<any[]>([])
const search = ref('')
const status = ref('')
const detailVisible = ref(false)
const detail = ref<any>(null)

const filteredOrders = computed(() => {
  let list = orders.value
  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter(o => String(o.username || '').toLowerCase().includes(s) || String(o.product || '').toLowerCase().includes(s))
  }
  if (status.value) list = list.filter(o => o.status === status.value)
  return list
})

const stats = computed(() => {
  return {
    total: orders.value.length,
    pending: orders.value.filter(o => o.status === 'pending').length,
    completed: orders.value.filter(o => o.status === 'completed').length,
    amount: orders.value.filter(o => ['paid','completed'].includes(o.status)).reduce((s, o) => s + (o.amount || 0), 0).toFixed(2)
  }
})

function statusType(s: string) {
  return { pending: 'warning', paid: 'success', completed: 'success', refunded: 'danger' }[s] || 'info'
}
function statusLabel(s: string) {
  return { pending: '待支付', paid: '已支付', completed: '已完成', refunded: '已退款' }[s] || s
}

async function loadData() {
  loading.value = true
  try {
    const res = await adminApi.getOrders()
    orders.value = res.data?.items || []
  } catch (e: any) { console.warn('[API] 加载失败:', e?.message) }
  finally { loading.value = false }
}

function reset() { search.value = ''; status.value = ''; loadData() }

function viewDetail(row: any) { detail.value = row; detailVisible.value = true }

function markPaid(row: any) {
  row.status = 'paid'
  ElMessage.success('已标记为支付')
}

function exportData() {
  const csv = ['订单号,用户,商品,金额,状态,创建时间'].join(',') + '\n' + filteredOrders.value.map(r => [r.id, r.username, r.product, r.amount, statusLabel(r.status), formatDate(r.createdAt)].join(',')).join('\n')
  const blob = new Blob(['\ufeff'+csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `orders-${new Date().toISOString().slice(0,10)}.csv`
  link.click()
}

onMounted(loadData)
</script>
