<template>
  <div class="admin-payment-approval">
    <h2 class="page-title">支付订单审核</h2>
    
    <!-- 筛选标签 -->
    <div class="filter-tabs">
      <button :class="{ active: filterStatus === '' }" @click="filterStatus = ''; loadOrders()">全部</button>
      <button :class="{ active: filterStatus === 'pending' }" @click="filterStatus = 'pending'; loadOrders()">
        ⏳ 待审核 <span class="badge" v-if="pendingCount > 0">{{ pendingCount }}</span>
      </button>
      <button :class="{ active: filterStatus === 'approved' }" @click="filterStatus = 'approved'; loadOrders()">✅ 已通过</button>
      <button :class="{ active: filterStatus === 'rejected' }" @click="filterStatus = 'rejected'; loadOrders()"> 已拒绝</button>
    </div>

    <!-- 订单列表 -->
    <div class="order-list" v-if="orders.length > 0">
      <div v-for="order in orders" :key="order.id" class="order-card" :class="`status-${order.status}`">
        <div class="order-header">
          <span class="order-id">#{{ order.id?.toString().slice(-6) }}</span>
          <span class="order-status-text">{{ getStatusText(order.status) }}</span>
          <span class="order-time">{{ formatDate(order.createdAt) }}</span>
        </div>
        
        <div class="order-info">
          <div class="info-row">
            <span class="label">用户</span>
            <span class="value">{{ order.user?.nickname || order.user?.username || '未知' }}</span>
          </div>
          <div class="info-row">
            <span class="label">金额</span>
            <span class="value amount">¥{{ order.amount }}</span>
          </div>
          <div class="info-row">
            <span class="label">圣力</span>
            <span class="value coins">{{ order.coinAmount }} SP</span>
          </div>
          <div class="info-row">
            <span class="label">支付方式</span>
            <span class="value">{{ getPayMethodLabel(order.payMethod) }}</span>
          </div>
          <div class="info-row" v-if="order.note">
            <span class="label">备注</span>
            <span class="value">{{ order.note }}</span>
          </div>
        </div>

        <!-- 支付截图 -->
        <div class="screenshot-section" v-if="order.screenshotUrl">
          <span class="label">支付截图</span>
          <div class="screenshot-wrapper" @click="viewScreenshot(order.screenshotUrl)">
            <img :src="order.screenshotUrl" class="screenshot-thumb" alt="支付截图" />
            <div class="screenshot-overlay"> 点击查看大图</div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="order-actions" v-if="order.status === 'pending'">
          <button class="btn-approve" @click="approveOrder(order)" :disabled="processing">
            ✅ 通过并发放圣力
          </button>
          <button class="btn-reject" @click="rejectOrder(order)" :disabled="processing">
            ❌ 拒绝
          </button>
        </div>

        <!-- 拒绝原因 -->
        <div class="reject-reason" v-if="order.status === 'rejected' && order.rejectReason">
          <span class="label">拒绝原因</span>
          <span class="value">{{ order.rejectReason }}</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>{{ filterStatus === 'pending' ? '暂无待审核订单' : '暂无订单' }}</p>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="currentPage <= 1" @click="currentPage--; loadOrders()">上一页</button>
      <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button :disabled="currentPage >= totalPages" @click="currentPage++; loadOrders()">下一页</button>
    </div>

    <!-- 截图大图弹窗 -->
    <div class="screenshot-modal" v-if="showScreenshot" @click.self="showScreenshot = false">
      <img :src="screenshotUrl" class="screenshot-full" />
      <button class="close-btn" @click="showScreenshot = false">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api'
import type { PaymentTransaction } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const orders = ref<PaymentTransaction[]>([])
const filterStatus = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const pendingCount = ref(0)
const processing = ref(false)
const showScreenshot = ref(false)
const screenshotUrl = ref('')

function getStatusText(status?: string) {
  const map: Record<string, string> = {
    pending: '⏳ 待审核',
    approved: '✅ 已通过',
    rejected: '❌ 已拒绝',
    paid: '💰 已付款',
  }
  return map[status || ''] || '未知'
}

function getPayMethodLabel(method?: string) {
  const map: Record<string, string> = {
    wechat: ' 微信支付',
    alipay: '💙 支付宝',
    qq: ' QQ支付',
  }
  return map[method || ''] || method || '未知'
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

async function loadOrders() {
  try {
    const params: any = { page: currentPage.value, pageSize: 20 }
    if (filterStatus.value) params.status = filterStatus.value
    
    const res = await adminApi.getOrders(params)
    orders.value = res.data?.list || res.data?.items || []
    totalPages.value = res.data?.totalPages || Math.ceil((res.data?.total || 0) / 20) || 1
    
    // 单独加载待审核数量
    if (!filterStatus.value) {
      try {
        const pendingRes = await adminApi.getOrders({ page: 1, pageSize: 1, status: 'pending' })
        pendingCount.value = pendingRes.data?.total || 0
      } catch { /* ignore */ }
    }
  } catch (err) {
    ElMessage.error('加载订单失败')
  }
}

async function approveOrder(order: PaymentTransaction) {
  try {
    await ElMessageBox.confirm(
      `确认通过订单 #${order.id?.toString().slice(-6)}？将发放 ${order.coinAmount} 圣力给用户。`,
      '审核确认',
      { type: 'warning' }
    )
    
    processing.value = true
    await adminApi.approveOrder(order.id!)
    ElMessage.success('订单已通过，圣力已发放')
    loadOrders()
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error(err.response?.data?.message || '审核失败')
    }
  } finally {
    processing.value = false
  }
}

async function rejectOrder(order: PaymentTransaction) {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      `确认拒绝订单 #${order.id?.toString().slice(-6)}？`,
      '拒绝原因',
      { inputPlaceholder: '请输入拒绝原因（选填）' }
    )
    
    processing.value = true
    await adminApi.rejectOrder(order.id!, reason)
    ElMessage.success('订单已拒绝')
    loadOrders()
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error('操作失败')
    }
  } finally {
    processing.value = false
  }
}

function viewScreenshot(url: string) {
  screenshotUrl.value = url
  showScreenshot.value = true
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.admin-payment-approval {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}
.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #1a1a2e;
  margin-bottom: 24px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.filter-tabs button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.filter-tabs button.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}
.badge {
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
  margin-left: 4px;
}

.order-list { display: flex; flex-direction: column; gap: 16px; }
.order-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.status-pending { border-left: 4px solid #f59e0b; }
.status-approved { border-left: 4px solid #22c55e; }
.status-rejected { border-left: 4px solid #ef4444; }

.order-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.order-id { font-weight: bold; color: #1a1a2e; font-size: 15px; }
.order-status-text { font-size: 13px; font-weight: bold; }
.status-pending .order-status-text { color: #f59e0b; }
.status-approved .order-status-text { color: #22c55e; }
.status-rejected .order-status-text { color: #ef4444; }
.order-time { margin-left: auto; color: #999; font-size: 12px; }

.order-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.info-row { display: flex; flex-direction: column; gap: 4px; }
.info-row .label { font-size: 12px; color: #999; }
.info-row .value { font-size: 14px; color: #333; }
.info-row .amount { color: #ef4444; font-weight: bold; font-size: 16px; }
.info-row .coins { color: #6366f1; font-weight: bold; }

.screenshot-section { margin-top: 16px; }
.screenshot-section .label { display: block; font-size: 12px; color: #999; margin-bottom: 8px; }
.screenshot-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
}
.screenshot-thumb { width: 200px; height: 150px; object-fit: cover; border-radius: 8px; }
.screenshot-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s;
}
.screenshot-wrapper:hover .screenshot-overlay { opacity: 1; }

.order-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
.btn-approve {
  flex: 1;
  padding: 10px;
  background: #22c55e;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-approve:hover { background: #16a34a; }
.btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-reject {
  padding: 10px 20px;
  background: #fff;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-reject:hover { background: #fef2f2; }
.btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

.reject-reason { margin-top: 12px; padding: 8px 12px; background: #fef2f2; border-radius: 8px; }
.reject-reason .label { font-size: 12px; color: #999; margin-right: 8px; }
.reject-reason .value { font-size: 13px; color: #ef4444; }

.empty-state {
  text-align: center;
  padding: 48px;
  color: #999;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}
.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
.pagination span { font-size: 14px; color: #666; }

.screenshot-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}
.screenshot-full {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
}
.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
}
</style>
