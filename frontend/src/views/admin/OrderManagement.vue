<template>
  <div>
    <div class="cyber-toolbar">
      <div class="toolbar-left">
        <el-input v-model="search" placeholder="搜索订单号..." class="cyber-input w-64" clearable prefix-icon="Search" />
        <el-select v-model="statusFilter" placeholder="状态筛选" class="cyber-input w-36" clearable>
          <el-option label="待支付" value="pending" />
          <el-option label="成功" value="success" />
          <el-option label="失败" value="failed" />
          <el-option label="已退款" value="refunded" />
        </el-select>
      </div>
      <el-button>📥 导出</el-button>
    </div>

    <el-table :data="filteredOrders" stripe class="cyber-table">
      <el-table-column prop="transactionNo" label="订单号" width="200">
        <template #default="{ row }">
          <span class="font-mono text-xs text-[#00f0ff]">{{ row.transactionNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="业务类型" width="100">
        <template #default="{ row }">
          <span class="text-sm text-[#a0a0cc]">{{ bizTypeLabel(row.bizType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付渠道" width="100">
        <template #default="{ row }">
          <span class="text-sm text-[#a0a0cc]">{{ channelLabel(row.payChannel) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="100">
        <template #default="{ row }">
          <span class="font-medium text-white font-mono">¥{{ Number(row.amount).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="圣点" width="80">
        <template #default="{ row }">
          <span class="text-amber-400 font-medium font-mono">{{ row.coinAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <span class="cyber-badge" :class="'badge-' + row.status">
            {{ statusLabel(row.status) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">
          <span class="text-sm text-[#6a6a8a] font-mono">{{ formatDate(row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary">详情</el-button>
          <el-button v-if="row.status === 'pending'" size="small" link type="success">确认</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="mt-4 flex justify-end">
      <el-pagination layout="total, prev, pager, next" :total="total" :page-size="pageSize"
        @current-change="handlePageChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api'
import { formatDate } from '@/utils'
import type { PaymentTransaction } from '@/types'

const search = ref('')
const statusFilter = ref('')
const orders = ref<PaymentTransaction[]>([])
const total = ref(0)
const pageSize = 20

const filteredOrders = computed(() => {
  let list = orders.value
  if (search.value) {
    list = list.filter(o => o.transactionNo.toLowerCase().includes(search.value.toLowerCase()))
  }
  if (statusFilter.value) {
    list = list.filter(o => o.status === statusFilter.value)
  }
  return list
})

function statusLabel(s: string): string {
  return { pending: '待支付', success: '成功', failed: '失败', refunded: '已退款' }[s] || s
}

function bizTypeLabel(t: string): string {
  return { order_pay: '订单支付', recharge: '充值', refund: '退款', commission: '佣金', withdraw: '提现' }[t] || t
}

function channelLabel(c: string): string {
  return { coin: '圣点', wechat: '微信', alipay: '支付宝', qq: 'QQ' }[c] || c
}

async function fetchOrders(page = 1) {
  const res = await adminApi.getOrders({ page, pageSize })
  orders.value = res.data.items
  total.value = res.data.total
}

function handlePageChange(page: number) {
  fetchOrders(page)
}

onMounted(() => fetchOrders())
</script>

<style scoped>
.cyber-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.toolbar-left { display: flex; gap: 12px; }
.cyber-input { flex-shrink: 0; }

.cyber-badge {
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.badge-pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.badge-success {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.badge-failed {
  background: rgba(255, 68, 102, 0.1);
  color: #ff4466;
  border: 1px solid rgba(255, 68, 102, 0.2);
}

.badge-refunded {
  background: rgba(100, 100, 140, 0.1);
  color: #6a6a8a;
  border: 1px solid rgba(100, 100, 140, 0.2);
}

.text-amber-400 { color: #f59e0b; }
</style>
