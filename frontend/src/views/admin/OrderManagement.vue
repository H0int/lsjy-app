<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-3">
        <el-input v-model="search" placeholder="搜索订单号..." class="w-64" clearable prefix-icon="Search" />
        <el-select v-model="statusFilter" placeholder="状态筛选" class="w-36" clearable>
          <el-option label="待支付" value="pending" />
          <el-option label="成功" value="success" />
          <el-option label="失败" value="failed" />
          <el-option label="已退款" value="refunded" />
        </el-select>
      </div>
      <el-button>📥 导出</el-button>
    </div>

    <el-table :data="filteredOrders" stripe class="bg-white dark:bg-dark-100 rounded-xl overflow-hidden">
      <el-table-column prop="transactionNo" label="订单号" width="200" />
      <el-table-column label="业务类型" width="100">
        <template #default="{ row }">
          <span class="text-sm">{{ bizTypeLabel(row.bizType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付渠道" width="100">
        <template #default="{ row }">
          <span class="text-sm">{{ channelLabel(row.payChannel) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="100">
        <template #default="{ row }">
          <span class="font-medium">¥{{ Number(row.amount).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="圣点" width="80">
        <template #default="{ row }">
          <span class="text-amber-500 font-medium">{{ row.coinAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <span class="px-2 py-1 rounded-full text-xs" :class="statusClass(row.status)">
            {{ statusLabel(row.status) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">
          <span class="text-sm">{{ formatDate(row.createdAt) }}</span>
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

function statusClass(s: string): string {
  return {
    pending: 'bg-amber-100 text-amber-600',
    success: 'bg-green-100 text-green-600',
    failed: 'bg-red-100 text-red-600',
    refunded: 'bg-gray-100 text-gray-600'
  }[s] || ''
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
