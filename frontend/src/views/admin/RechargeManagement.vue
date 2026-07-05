<template>
  <div>
    <h2 class="text-xl font-bold mb-6" style="color: #e0e0ff;">💎 充值管理</h2>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="rounded-xl p-4" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="text-xs mb-1" style="color: #5a5a7a;">待审核</div>
        <div class="text-2xl font-bold" style="color: #f59e0b;">{{ pendingCount }}</div>
      </div>
      <div class="rounded-xl p-4" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="text-xs mb-1" style="color: #5a5a7a;">已通过</div>
        <div class="text-2xl font-bold" style="color: #00ff88;">{{ approvedCount }}</div>
      </div>
      <div class="rounded-xl p-4" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="text-xs mb-1" style="color: #5a5a7a;">已拒绝</div>
        <div class="text-2xl font-bold" style="color: #ff4466;">{{ rejectedCount }}</div>
      </div>
      <div class="rounded-xl p-4" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="text-xs mb-1" style="color: #5a5a7a;">总充值金额</div>
        <div class="text-2xl font-bold" style="color: #00f0ff;">¥{{ totalAmount.toFixed(2) }}</div>
      </div>
    </div>

    <!-- 状态筛选 -->
    <div class="flex gap-3 mb-4">
      <el-button :type="statusFilter === '' ? 'primary' : ''" @click="statusFilter = ''">全部</el-button>
      <el-button :type="statusFilter === 'pending_review' ? 'warning' : ''" @click="statusFilter = 'pending_review'">待审核</el-button>
      <el-button :type="statusFilter === 'approved' ? 'success' : ''" @click="statusFilter = 'approved'">已通过</el-button>
      <el-button :type="statusFilter === 'rejected' ? 'danger' : ''" @click="statusFilter = 'rejected'">已拒绝</el-button>
      <el-button :type="statusFilter === 'pending_payment' ? 'info' : ''" @click="statusFilter = 'pending_payment'">待支付</el-button>
      <span class="text-xs ml-auto" style="color: #6a6a8a;">{{ orderSyncText }}</span>
      <el-button :loading="loading" @click="fetchOrders">🔄 刷新</el-button>
    </div>

    <!-- 订单列表 -->
    <div class="rounded-xl overflow-hidden" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr style="background: rgba(26,26,46,0.5);">
              <th class="text-left p-3" style="color: #6a6a8a;">订单号</th>
              <th class="text-left p-3" style="color: #6a6a8a;">用户</th>
              <th class="text-left p-3" style="color: #6a6a8a;">类型</th>
              <th class="text-left p-3" style="color: #6a6a8a;">金额</th>
              <th class="text-left p-3" style="color: #6a6a8a;">内容</th>
              <th class="text-left p-3" style="color: #6a6a8a;">状态</th>
              <th class="text-left p-3" style="color: #6a6a8a;">时间</th>
              <th class="text-left p-3" style="color: #6a6a8a;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id" style="border-top: 1px solid #1a1a2e;">
              <td class="p-3 font-mono text-xs" style="color: #00f0ff;">{{ order.orderNo }}</td>
              <td class="p-3" style="color: #e0e0ff;">{{ order.userName || order.username || 'user' + order.userId }}</td>
              <td class="p-3">
                <span class="text-xs px-2 py-1 rounded" :style="order.orderType === 'subscription' ? 'background: rgba(255,184,0,0.1); color: #ffb800;' : 'background: rgba(0,240,255,0.1); color: #00f0ff;'">
                  {{ order.orderType === 'subscription' ? '会员订阅' : '圣点充值' }}
                </span>
              </td>
              <td class="p-3 font-bold" style="color: #00ff88;">¥{{ order.price }}</td>
              <td class="p-3" style="color: #ffb800;">{{ orderContent(order) }}</td>
              <td class="p-3">
                <span class="text-xs px-2 py-1 rounded-full" :style="statusStyle(order.status)">
                  {{ statusLabel(order.status) }}
                </span>
              </td>
              <td class="p-3" style="color: #5a5a7a;">{{ formatDate(order.createdAt) }}</td>
              <td class="p-3">
                <div class="flex gap-2">
                  <el-button v-if="order.status === 'pending_review' || order.status === 'pending_payment'" size="small" type="success" @click="handleApprove(order)">通过</el-button>
                  <el-button v-if="order.status === 'pending_review' || order.status === 'pending_payment'" size="small" type="danger" @click="handleReject(order)">拒绝</el-button>
                  <el-button v-if="order.screenshotUrl" size="small" type="info" @click="showScreenshot(order)">查看截图</el-button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td colspan="8" class="p-8 text-center" style="color: #5a5a7a;">暂无充值订单</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 截图查看对话框 -->
    <el-dialog v-model="showScreenshotDialog" title="付款截图" width="500px">
      <div class="text-center">
        <img v-if="currentScreenshot" :src="currentScreenshot" class="max-w-full rounded-lg" alt="付款截图" />
        <div v-else class="py-8" style="color: #5a5a7a;">无截图</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils'
import service from '@/api/request'

interface RechargeOrder {
  id: number
  orderNo: string
  userId: number
  username: string
  userName?: string
  packageId: number
  orderType?: string
  planName?: string
  displayName?: string
  coinAmount: number
  dailyCoins?: number
  subscriptionDays?: number
  price: number
  paymentMethod: string
  screenshotUrl: string
  status: string
  remark: string
  createdAt: string
  reviewedAt: string | null
  reviewedBy: string | null
}

const orders = ref<RechargeOrder[]>([])
const statusFilter = ref('')
const showScreenshotDialog = ref(false)
const currentScreenshot = ref('')
const loading = ref(false)
const lastOrderSyncAt = ref('')
let orderSyncTimer: ReturnType<typeof setInterval> | null = null

const filteredOrders = computed(() => {
  if (!statusFilter.value) return orders.value
  return orders.value.filter(o => o.status === statusFilter.value)
})

const pendingCount = computed(() => orders.value.filter(o => o.status === 'pending_review').length)
const approvedCount = computed(() => orders.value.filter(o => o.status === 'approved').length)
const rejectedCount = computed(() => orders.value.filter(o => o.status === 'rejected').length)
const totalAmount = computed(() =>
  orders.value.filter(o => o.status === 'approved').reduce((sum, o) => sum + o.price, 0)
)
const orderSyncText = computed(() => lastOrderSyncAt.value ? `已同步 ${lastOrderSyncAt.value}` : '实时同步中')

function statusLabel(s: string): string {
  return {
    pending_payment: '待支付',
    pending_review: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }[s] || s
}

function statusStyle(s: string) {
  return {
    pending_payment: 'background: rgba(100,100,140,0.1); color: #6a6a8a; border: 1px solid rgba(100,100,140,0.2);',
    pending_review: 'background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2);',
    approved: 'background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2);',
    rejected: 'background: rgba(255,68,102,0.1); color: #ff4466; border: 1px solid rgba(255,68,102,0.2);'
  }[s] || ''
}

function payMethodLabel(m: string): string {
  return { wechat: '💚 微信', alipay: '💙 支付宝', qq: '🐧 QQ' }[m] || m
}

function payMethodStyle(m: string) {
  return {
    wechat: 'background: rgba(7,193,96,0.1); color: #07C160;',
    alipay: 'background: rgba(0,160,255,0.1); color: #00A0FF;',
    qq: 'background: rgba(18,183,245,0.1); color: #12B7F5;'
  }[m] || ''
}

async function fetchOrders() {
  if (loading.value) return
  loading.value = true
  try {
    const res = await service.get('/payment/coin/orders', { params: { _t: Date.now() } })
    orders.value = res.data?.data?.items || []
    lastOrderSyncAt.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch (e) {
    console.error('Failed to fetch orders:', e)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

function orderContent(order: RechargeOrder): string {
  if (order.orderType === 'subscription') {
    return `${order.planName || order.displayName || '月度会员'} · 首日${order.coinAmount} · 每日${order.dailyCoins || 0} · ${order.subscriptionDays || 30}天`
  }
  return `${order.coinAmount} 圣点`
}

async function handleApprove(order: RechargeOrder) {
  try {
    await ElMessageBox.confirm(`确认通过用户 ${order.username} 的充值订单？\n金额: ¥${order.price}，圣力: ${order.coinAmount}`, '审批确认')
    const res = await service.post(`/payment/coin/approve/${order.id}`, { action: 'approve', remark: '管理员审批通过' })
    if (res.data?.code === 0) {
      ElMessage.success(res.data.message)
      fetchOrders()
    } else {
      ElMessage.error(res.data?.message || '审批失败')
    }
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('审批失败')
  }
}

async function handleReject(order: RechargeOrder) {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝订单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    const res = await service.post(`/payment/coin/approve/${order.id}`, { action: 'reject', remark: reason || '管理员拒绝' })
    if (res.data?.code === 0) {
      ElMessage.success('已拒绝')
      fetchOrders()
    } else {
      ElMessage.error(res.data?.message || '操作失败')
    }
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('操作失败')
  }
}

function showScreenshot(order: RechargeOrder) {
  currentScreenshot.value = order.screenshotUrl
  showScreenshotDialog.value = true
}

function handleVisibilitySync() {
  if (!document.hidden) fetchOrders()
}

onMounted(() => {
  fetchOrders()
  orderSyncTimer = setInterval(fetchOrders, 5000)
  document.addEventListener('visibilitychange', handleVisibilitySync)
})

onUnmounted(() => {
  if (orderSyncTimer) clearInterval(orderSyncTimer)
  document.removeEventListener('visibilitychange', handleVisibilitySync)
})
</script>
