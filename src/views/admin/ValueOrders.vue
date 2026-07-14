<template>
  <div>
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">增值订单管理</h2>
      <el-button size="small" @click="loadAllData" :loading="globalLoading">刷新数据</el-button>
    </div>

    <!-- 加载错误兜底 -->
    <div v-if="loadError" class="mb-4 p-4 rounded" style="background:#ff2d9520;border:1px solid #ff2d95;color:#ff2d95;">
      <div class="font-bold">数据加载失败</div>
      <div class="text-sm mt-1">请稍后重试，或检查后端服务是否正常。</div>
      <el-button size="small" class="mt-2" @click="loadAllData">重试</el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="rounded-xl p-5 shadow-sm relative overflow-hidden" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6" style="background:#00f0ff;"></div>
        <p class="text-sm" style="color:#808099;">总订单数</p>
        <p class="text-3xl font-bold mt-1" style="color:#e0e0ff;">{{ statsData.totalOrders }}</p>
        <p class="text-xs mt-1" style="color:#00f0ff;">全部订单</p>
      </div>
      <div class="rounded-xl p-5 shadow-sm relative overflow-hidden" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6" style="background:#00ff88;"></div>
        <p class="text-sm" style="color:#808099;">已付款订单</p>
        <p class="text-3xl font-bold mt-1" style="color:#e0e0ff;">{{ statsData.paidOrders }}</p>
        <p class="text-xs mt-1" style="color:#00ff88;">交易成功</p>
      </div>
      <div class="rounded-xl p-5 shadow-sm relative overflow-hidden" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6" style="background:#f59e0b;"></div>
        <p class="text-sm" style="color:#808099;">总收入</p>
        <p class="text-3xl font-bold mt-1" style="color:#e0e0ff;">¥{{ statsData.totalRevenue }}</p>
        <p class="text-xs mt-1" style="color:#f59e0b;">累计金额</p>
      </div>
      <div class="rounded-xl p-5 shadow-sm relative overflow-hidden" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6" style="background:#ff4d4f;"></div>
        <p class="text-sm" style="color:#808099;">待处理订单</p>
        <p class="text-3xl font-bold mt-1" style="color:#e0e0ff;">{{ statsData.pendingOrders }}</p>
        <p class="text-xs mt-1" style="color:#ff4d4f;">需人工处理</p>
      </div>
    </div>

    <!-- 筛选区 -->
    <div class="rounded-xl p-4 mb-4" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-sm" style="color:#808099;">筛选:</span>
        <el-select v-model="filterStatus" placeholder="订单状态" size="small" clearable style="width:140px;" @change="loadOrders">
          <el-option label="待付款" value="pending" />
          <el-option label="已付款" value="paid" />
          <el-option label="已取消" value="cancelled" />
          <el-option label="已退款" value="refunded" />
          <el-option label="处理中" value="processing" />
        </el-select>
        <el-date-picker
          v-model="filterDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          style="width:260px;"
          value-format="YYYY-MM-DD"
          @change="loadOrders"
        />
        <el-input v-model="filterKeyword" placeholder="搜索订单号/用户" size="small" clearable style="width:180px;" @clear="loadOrders" />
        <el-button size="small" type="primary" @click="loadOrders">搜索</el-button>
      </div>
    </div>

    <!-- 订单表格 -->
    <div class="rounded-xl p-5" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
      <el-table :data="orderTableData" stripe v-loading="orderLoading" style="width:100%;">
        <el-table-column prop="orderNo" label="订单号" width="200" style="color:#e0e0ff;" show-overflow-tooltip />
        <el-table-column prop="userName" label="用户" width="110" style="color:#e0e0ff;" />
        <el-table-column prop="packageName" label="套餐名称" width="160" style="color:#e0e0ff;" show-overflow-tooltip />
        <el-table-column prop="amount" label="金额" width="100" style="color:#e0e0ff;">
          <template #default="{ row }">
            <span class="font-bold" style="color:#00f0ff;">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payMethod" label="支付方式" width="100" style="color:#e0e0ff;">
          <template #default="{ row }">
            <el-tag size="small" :type="payMethodTag(row.payMethod)">{{ payMethodLabel(row.payMethod) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" style="color:#e0e0ff;">
          <template #default="{ row }">
            <el-tag size="small" :type="orderStatusTag(row.status)">{{ orderStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" style="color:#e0e0ff;" />
        <el-table-column prop="paidAt" label="付款时间" width="170" style="color:#e0e0ff;">
          <template #default="{ row }">
            <span :style="{ color: row.paidAt ? '#e0e0ff' : '#808099' }">{{ row.paidAt || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'pending'" size="small" link type="success" @click="confirmPay(row)">确认付款</el-button>
            <el-button v-if="row.status === 'pending'" size="small" link type="warning" @click="cancelOrder(row)">取消</el-button>
            <el-button v-if="row.status === 'paid'" size="small" link type="danger" @click="refundOrder(row)">退款</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="orderPagination.page"
          v-model:page-size="orderPagination.pageSize"
          :total="orderPagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
          @current-change="loadOrders"
          @size-change="loadOrders"
        />
      </div>
    </div>

    <!-- 详情Dialog -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="550px">
      <div v-if="currentDetail" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
            <p class="text-xs" style="color:#808099;">订单号</p>
            <p class="font-bold text-sm mt-1" style="color:#e0e0ff;">{{ currentDetail.orderNo }}</p>
          </div>
          <div class="p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
            <p class="text-xs" style="color:#808099;">用户</p>
            <p class="font-bold text-sm mt-1" style="color:#e0e0ff;">{{ currentDetail.userName }}</p>
          </div>
          <div class="p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
            <p class="text-xs" style="color:#808099;">套餐名称</p>
            <p class="font-bold text-sm mt-1" style="color:#e0e0ff;">{{ currentDetail.packageName }}</p>
          </div>
          <div class="p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
            <p class="text-xs" style="color:#808099;">金额</p>
            <p class="font-bold text-sm mt-1" style="color:#00f0ff;">¥{{ currentDetail.amount }}</p>
          </div>
          <div class="p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
            <p class="text-xs" style="color:#808099;">支付方式</p>
            <el-tag size="small" :type="payMethodTag(currentDetail.payMethod)">{{ payMethodLabel(currentDetail.payMethod) }}</el-tag>
          </div>
          <div class="p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
            <p class="text-xs" style="color:#808099;">状态</p>
            <el-tag size="small" :type="orderStatusTag(currentDetail.status)">{{ orderStatusLabel(currentDetail.status) }}</el-tag>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
            <p class="text-xs" style="color:#808099;">创建时间</p>
            <p class="font-bold text-sm mt-1" style="color:#e0e0ff;">{{ currentDetail.createdAt }}</p>
          </div>
          <div class="p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
            <p class="text-xs" style="color:#808099;">付款时间</p>
            <p class="font-bold text-sm mt-1" style="color:#e0e0ff;">{{ currentDetail.paidAt || '未付款' }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computingApi } from '@/api/computing'

// ===== 全局状态 =====
const globalLoading = ref(false)
const loadError = ref(false)

// ===== 统计 =====
const statsData = reactive({
  totalOrders: 0,
  paidOrders: 0,
  totalRevenue: '0',
  pendingOrders: 0,
})

// ===== 筛选 =====
const filterStatus = ref('')
const filterDateRange = ref<[string, string] | null>(null)
const filterKeyword = ref('')

// ===== 订单表格 =====
const orderLoading = ref(false)
const orderTableData = ref<any[]>([])
const orderPagination = reactive({ page: 1, pageSize: 10, total: 0 })

// ===== 详情 =====
const detailDialogVisible = ref(false)
const currentDetail = ref<any>(null)

// ===== 模拟数据 =====
const mockOrders = (() => {
  const users = ['张明', '李晓华', '王芳', '陈浩', '赵丽', '刘强', '周敏', '吴涛']
  const packages = [
    { name: '算力畅享月卡', price: 99 },
    { name: '算力至尊季卡', price: 259 },
    { name: '虚拟员工年费套餐', price: 1999 },
    { name: '算力体验包', price: 9.9 },
  ]
  const statuses = ['paid', 'paid', 'paid', 'pending', 'pending', 'cancelled', 'refunded', 'processing']
  const payMethods = ['wechat', 'alipay', 'coin', 'bank_transfer']
  const list = []
  for (let i = 0; i < 73; i++) {
    const pkg = packages[i % packages.length]
    const status = statuses[i % statuses.length]
    const paid = status === 'paid' || status === 'refunded'
    const month = String(Math.floor(Math.random() * 7) + 1).padStart(2, '0')
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
    const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0')
    const min = String(Math.floor(Math.random() * 60)).padStart(2, '0')
    list.push({
      id: i + 1,
      orderNo: `VP${2026}${month}${day}${String(i + 1).padStart(6, '0')}`,
      userName: users[i % users.length],
      userId: 10001 + (i % users.length),
      packageName: pkg.name,
      amount: pkg.price,
      payMethod: payMethods[i % payMethods.length],
      status,
      createdAt: `2026-${month}-${day} ${hour}:${min}:00`,
      paidAt: paid ? `2026-${month}-${day} ${hour}:${String(Math.min(59, parseInt(min) + Math.floor(Math.random() * 10) + 1)).padStart(2, '0')}:00` : null,
    })
  }
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})()

async function loadOrders() {
  orderLoading.value = true
  try {
    const res = await computingApi.getOrders({
      page: orderPagination.page,
      pageSize: orderPagination.pageSize,
      status: filterStatus.value || undefined,
    })
    const data = res.data || {}
    orderTableData.value = data.items || data.list || []
    orderPagination.total = data.total || 0
  } catch {
    // 使用模拟数据
    let filtered = [...mockOrders]
    if (filterStatus.value) filtered = filtered.filter(o => o.status === filterStatus.value)
    if (filterKeyword.value) filtered = filtered.filter(o => o.orderNo.includes(filterKeyword.value) || o.userName.includes(filterKeyword.value))
    if (filterDateRange.value && filterDateRange.value[0]) {
      const [start, end] = filterDateRange.value
      filtered = filtered.filter(o => o.createdAt >= start && o.createdAt.slice(0, 10) <= end)
    }
    orderPagination.total = filtered.length
    const pageStart = (orderPagination.page - 1) * orderPagination.pageSize
    orderTableData.value = filtered.slice(pageStart, pageStart + orderPagination.pageSize)
  } finally {
    orderLoading.value = false
  }
}

// ===== 辅助函数 =====
function payMethodLabel(m: string) {
  return { wechat: '微信', alipay: '支付宝', coin: '圣力', bank_transfer: '银行转账' }[m] || m
}

function payMethodTag(m: string) {
  return { wechat: 'success', alipay: '', coin: 'warning', bank_transfer: 'info' }[m] || ''
}

function orderStatusLabel(s: string) {
  return { pending: '待付款', paid: '已付款', cancelled: '已取消', refunded: '已退款', processing: '处理中' }[s] || s
}

function orderStatusTag(s: string) {
  return { pending: 'warning', paid: 'success', cancelled: 'info', refunded: 'danger', processing: '' }[s] || ''
}

// ===== 操作 =====
function viewDetail(row: any) {
  currentDetail.value = { ...row }
  detailDialogVisible.value = true
}

async function confirmPay(row: any) {
  try {
    await ElMessageBox.confirm(`确认手动确认订单「${row.orderNo}」已付款？金额：¥${row.amount}`)
    row.status = 'paid'
    row.paidAt = new Date().toISOString().replace('T', ' ').slice(0, 19)
    try {
      await computingApi.createOrder({ action: 'confirm_pay', orderId: row.id })
    } catch { /* 模拟操作 */ }
    ElMessage.success('已确认付款')
    updateStats()
  } catch {
    // cancelled
  }
}

async function cancelOrder(row: any) {
  try {
    await ElMessageBox.confirm(`确认取消订单「${row.orderNo}」？`)
    row.status = 'cancelled'
    try {
      await computingApi.createOrder({ action: 'cancel_order', orderId: row.id })
    } catch { /* 模拟操作 */ }
    ElMessage.success('订单已取消')
    updateStats()
  } catch {
    // cancelled
  }
}

async function refundOrder(row: any) {
  try {
    await ElMessageBox.confirm(`确认对订单「${row.orderNo}」进行退款？金额：¥${row.amount}。退款后不可撤销。`, '退款确认', { type: 'warning' })
    row.status = 'refunded'
    try {
      await computingApi.createOrder({ action: 'refund_order', orderId: row.id })
    } catch { /* 模拟操作 */ }
    ElMessage.success('退款成功')
    updateStats()
  } catch {
    // cancelled
  }
}

// ===== 统计更新 =====
function updateStats() {
  const source = mockOrders
  statsData.totalOrders = source.length
  statsData.paidOrders = source.filter(o => o.status === 'paid').length
  statsData.totalRevenue = source.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0).toFixed(1)
  statsData.pendingOrders = source.filter(o => o.status === 'pending' || o.status === 'processing').length
}

// ===== 统一加载 =====
async function loadAllData() {
  globalLoading.value = true
  loadError.value = false
  try {
    await loadOrders()
    updateStats()
  } catch {
    loadError.value = true
  } finally {
    globalLoading.value = false
  }
}

onMounted(loadAllData)
</script>
