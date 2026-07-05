<template>
  <div class="token-mgmt-v4">
    <div class="section-header">
      <h2 class="section-title"><span class="title-accent">▍</span>Token 管理中心</h2>
      <p class="section-desc">系统概览 · 订单审批 · 用户管理 · 消费记录</p>
    </div>

    <!-- 顶部统计 -->
    <div class="stats-grid">
      <div class="stat-card cyan">
        <div class="stat-icon">💎</div>
        <div class="stat-content">
          <div class="stat-label">系统总余额</div>
          <div class="stat-value">{{ stats.totalCoins.toLocaleString() }}</div>
          <div class="stat-sub">圣力</div>
        </div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-label">累计收入</div>
          <div class="stat-value">¥{{ stats.totalRevenue.toLocaleString() }}</div>
          <div class="stat-sub">已审批订单</div>
        </div>
      </div>
      <div class="stat-card magenta">
        <div class="stat-icon">📋</div>
        <div class="stat-content">
          <div class="stat-label">待审订单</div>
          <div class="stat-value">{{ pendingCount }}</div>
          <div class="stat-sub">笔</div>
        </div>
      </div>
      <div class="stat-card gold">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-label">注册用户</div>
          <div class="stat-value">{{ userCount }}</div>
          <div class="stat-sub">人</div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="cyber-tabs mt-6">
      <div class="tab-nav">
        <button v-for="t in tabs" :key="t.key" :class="['tab-btn', { active: tab === t.key }]" @click="switchTab(t.key)">
          <span class="tab-icon">{{ t.icon }}</span>{{ t.label }}
          <span v-if="t.key === 'approve' && pendingCount > 0" class="tab-badge">{{ pendingCount }}</span>
        </button>
      </div>

      <!-- ========== 概览 ========== -->
      <div v-if="tab === 'overview'" class="tab-content">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 最近订单 -->
          <div class="cyber-card p-6">
            <h3 class="card-title"><span style="color: var(--cyber-cyan);">▍</span>最近订单</h3>
            <div v-if="recentOrders.length === 0" class="empty-tip">暂无订单</div>
            <div v-for="o in recentOrders" :key="o.id" class="order-row">
              <div class="order-row-left">
                <span class="order-no">{{ o.orderNo || o.id }}</span>
                <span :class="['status-tag', o.orderType === 'subscription' ? 'st-approved' : 'st-pending_payment']">{{ orderTypeLabel(o) }}</span>
                <span class="order-time">{{ fmtDate(o.createdAt) }}</span>
              </div>
              <div class="order-row-right">
                <span class="order-coins">{{ orderBenefitText(o) }}</span>
                <span :class="['status-tag', 'st-' + o.status]">{{ statusLabel(o.status) }}</span>
              </div>
            </div>
          </div>

          <!-- 模块消耗分布 -->
          <div class="cyber-card p-6">
            <h3 class="card-title"><span style="color: var(--cyber-magenta);">▍</span>今日消耗分布</h3>
            <div class="consume-bars">
              <div v-for="m in consumeModules" :key="m.name" class="consume-bar-row">
                <span class="cb-label">{{ m.name }}</span>
                <div class="cb-track">
                  <div class="cb-fill" :style="{ width: m.pct + '%', background: m.color }"></div>
                </div>
                <span class="cb-val">{{ m.amount }}</span>
              </div>
              <div v-if="consumeModules.length === 0" class="empty-tip">今日暂无消耗</div>
            </div>
          </div>

          <!-- 系统信息 -->
          <div class="cyber-card p-6">
            <h3 class="card-title"><span style="color: var(--cyber-green);">▍</span>系统状态</h3>
            <div class="sys-info-list">
              <div class="sys-row"><span class="sys-label">API服务</span><span class="sys-val ok">● 运行中</span></div>
              <div class="sys-row"><span class="sys-label">版本</span><span class="sys-val">v1.0.0</span></div>
              <div class="sys-row"><span class="sys-label">域名</span><span class="sys-val">api.lsjyapp.cn</span></div>
              <div class="sys-row"><span class="sys-label">ICP备案</span><span class="sys-val">湘ICP备2026022972号</span></div>
              <div class="sys-row"><span class="sys-label">套餐数</span><span class="sys-val">10 档</span></div>
              <div class="sys-row"><span class="sys-label">支付模式</span><span class="sys-val">截图审核</span></div>
            </div>
          </div>

          <!-- 快捷操作 -->
          <div class="cyber-card p-6">
            <h3 class="card-title"><span style="color: var(--cyber-gold, #ffd700);">▍</span>快捷操作</h3>
            <div class="quick-actions">
              <div class="qa-card" @click="switchTab('approve')">
                <div class="qa-icon">📋</div>
                <div class="qa-text">审批订单</div>
                <div v-if="pendingCount > 0" class="qa-badge">{{ pendingCount }} 待审</div>
              </div>
              <div class="qa-card" @click="switchTab('users')">
                <div class="qa-icon">👥</div>
                <div class="qa-text">用户管理</div>
              </div>
              <div class="qa-card" @click="switchTab('history')">
                <div class="qa-icon">📊</div>
                <div class="qa-text">消费记录</div>
              </div>
              <div class="qa-card" @click="refreshAll">
                <div class="qa-icon">🔄</div>
                <div class="qa-text">刷新数据</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== 订单审批 ========== -->
      <div v-if="tab === 'approve'" class="tab-content">
        <div class="cyber-card p-6">
          <div class="approve-header">
            <h3 class="card-title" style="margin-bottom:0"><span style="color: var(--cyber-cyan);">▍</span>圣力/会员订单审批</h3>
            <div class="approve-filters">
              <button v-for="f in orderFilters" :key="f.key"
                :class="['filter-btn', { active: orderFilter === f.key }]"
                @click="orderFilter = f.key">
                {{ f.label }} <span v-if="f.count !== undefined" class="filter-count">{{ f.count }}</span>
              </button>
            </div>
          </div>

          <div v-if="filteredOrders.length === 0" class="empty-tip">暂无{{ orderFilter === 'all' ? '' : statusLabel(orderFilter) }}订单</div>

          <div class="approve-table">
            <div class="approve-table-head">
              <span class="col-order">订单号</span>
              <span class="col-user">用户</span>
              <span class="col-coins">订单内容</span>
              <span class="col-price">金额</span>
              <span class="col-time">时间</span>
              <span class="col-status">状态</span>
              <span class="col-action">操作</span>
            </div>
            <div v-for="o in filteredOrders" :key="o.id" class="approve-table-row">
              <span class="col-order code-text">
                {{ o.orderNo || o.id }}
                <small class="order-type-line">{{ orderTypeLabel(o) }}</small>
              </span>
              <span class="col-user">{{ o.userName || ('用户#' + o.userId) }}</span>
              <span class="col-coins highlight">
                {{ orderBenefitText(o) }}
                <small v-if="o.orderType === 'subscription'" class="order-type-line">{{ o.planName || '月度会员' }}</small>
              </span>
              <span class="col-price">¥{{ o.price }}</span>
              <span class="col-time">{{ fmtDate(o.createdAt) }}</span>
              <span class="col-status"><span :class="['status-tag', 'st-' + o.status]">{{ statusLabel(o.status) }}</span></span>
              <span class="col-action">
                <template v-if="o.status === 'pending_review' || o.status === 'pending_payment'">
                  <button class="act-btn approve" @click="doApprove(o, 'approve')">✓ 通过</button>
                  <button class="act-btn reject" @click="doApprove(o, 'reject')">✗ 拒绝</button>
                </template>
                <span v-else class="dim-text">{{ o.remark || '-' }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== 用户管理 ========== -->
      <div v-if="tab === 'users'" class="tab-content">
        <div class="cyber-card p-6">
          <div class="approve-header">
            <h3 class="card-title" style="margin-bottom:0"><span style="color: var(--cyber-magenta);">▍</span>用户管理</h3>
            <div class="search-box">
              <input v-model="userSearch" placeholder="搜索用户名..." class="search-input" />
            </div>
          </div>

          <div class="approve-table">
            <div class="approve-table-head">
              <span class="col-id">ID</span>
              <span class="col-user">用户名</span>
              <span class="col-coins">圣力余额</span>
              <span class="col-status">状态</span>
              <span class="col-time">注册时间</span>
              <span class="col-action">操作</span>
            </div>
            <div v-for="u in filteredUsers" :key="u.id" class="approve-table-row">
              <span class="col-id">{{ u.id }}</span>
              <span class="col-user">{{ u.username || u.name || '-' }}</span>
              <span class="col-coins highlight">{{ u.unlimited ? '∞' : (u.coins || 0).toLocaleString() }}</span>
              <span class="col-status">
                <span :class="['status-tag', u.unlimited ? 'st-approved' : 'st-pending_payment']">
                  {{ u.unlimited ? '无限' : '正常' }}
                </span>
              </span>
              <span class="col-time">{{ fmtDate(u.createdAt) }}</span>
              <span class="col-action">
                <button v-if="!u.unlimited" class="act-btn approve" @click="adjustCoins(u)">调整余额</button>
                <span v-else class="dim-text">Boss</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 调整余额弹窗 -->
        <el-dialog v-model="showAdjust" title="调整用户余额" width="420px" :append-to-body="true">
          <div class="adjust-form">
            <div class="adj-row">
              <span class="adj-label">用户</span>
              <span class="adj-val">{{ adjustUser?.username }}</span>
            </div>
            <div class="adj-row">
              <span class="adj-label">当前余额</span>
              <span class="adj-val">{{ (adjustUser?.coins || 0).toLocaleString() }} 圣力</span>
            </div>
            <div class="adj-row">
              <span class="adj-label">操作</span>
              <div class="adj-input-group">
                <select v-model="adjustType" class="adj-select">
                  <option value="add">增加</option>
                  <option value="set">设为</option>
                  <option value="sub">扣减</option>
                </select>
                <input v-model.number="adjustAmount" type="number" class="adj-input" placeholder="数量" />
              </div>
            </div>
            <div class="adj-row">
              <span class="adj-label">备注</span>
              <input v-model="adjustRemark" class="adj-input full" placeholder="原因备注" />
            </div>
          </div>
          <template #footer>
            <el-button @click="showAdjust = false">取消</el-button>
            <el-button type="primary" @click="confirmAdjust" :loading="adjusting">确认</el-button>
          </template>
        </el-dialog>
      </div>

      <!-- ========== 消费记录 ========== -->
      <div v-if="tab === 'history'" class="tab-content">
        <div class="cyber-card p-6">
          <h3 class="card-title"><span style="color: var(--cyber-cyan);">▍</span>全部消费明细</h3>
          <div v-if="transactions.length === 0" class="empty-tip">暂无消费记录</div>
          <div v-for="tx in transactions" :key="tx.id" class="tx-item">
            <div class="tx-left">
              <span :class="['tx-icon', tx.type === 'recharge' ? 'tx-in' : 'tx-out']">
                {{ tx.type === 'recharge' ? '↓' : '↑' }}
              </span>
              <div class="tx-info">
                <div class="tx-desc">{{ tx.description }}</div>
                <div class="tx-time">{{ fmtDate(tx.createdAt) }}</div>
              </div>
            </div>
            <div class="tx-right">
              <span :class="tx.amount > 0 ? 'tx-plus' : 'tx-minus'">
                {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
              </span>
              <span class="tx-balance">余额 {{ tx.balance }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== 会话Token ========== -->
      <div v-if="tab === 'session'" class="tab-content">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="cyber-card p-6">
            <h3 class="card-title"><span style="color: var(--cyber-cyan);">▍</span>当前 Token</h3>
            <div class="tk-rows mt-4">
              <div class="tk-row"><span class="tk-label">Access Token</span><code class="tk-val">{{ shortToken }}</code><button class="cp-btn" @click="copyTk">📋</button></div>
              <div class="tk-row"><span class="tk-label">状态</span><span :class="['tk-badge', tokenValid ? 'ok' : 'exp']">{{ tokenValid ? '● 有效' : '● 已过期' }}</span></div>
              <div class="tk-row"><span class="tk-label">签发</span><span class="tk-val">{{ tkInfo.iat ? fmtTime(tkInfo.iat) : '-' }}</span></div>
              <div class="tk-row"><span class="tk-label">过期</span><span class="tk-val">{{ tkInfo.exp ? fmtTime(tkInfo.exp) : '-' }}</span></div>
              <div class="tk-row"><span class="tk-label">剩余</span><span class="tk-val" :style="{ color: urgent ? '#f44' : 'var(--cyber-cyan)' }">{{ remaining }}</span></div>
              <div class="tk-row"><span class="tk-label">用户</span><span class="tk-val">{{ tkInfo.username || '-' }} ({{ tkInfo.sub || tkInfo.id || '-' }})</span></div>
              <div class="tk-row"><span class="tk-label">角色</span><span class="tk-val">{{ (tkInfo.roles || []).join(', ') || '-' }}</span></div>
            </div>
          </div>
          <div class="cyber-card p-6">
            <h3 class="card-title"><span style="color: var(--cyber-magenta);">▍</span>操作</h3>
            <div class="act-list mt-4">
              <div class="act-card" @click="refreshTk"><div class="act-icon">🔄</div><div><div class="act-t">刷新 Token</div><div class="act-d">获取新的 Access Token</div></div></div>
              <div class="act-card" @click="decodeTk"><div class="act-icon">🔍</div><div><div class="act-t">解码 Token</div><div class="act-d">查看 Payload 内容</div></div></div>
              <div class="act-card" @click="logout"><div class="act-icon">🚪</div><div><div class="act-t">退出登录</div><div class="act-d">清除 Token 并退出</div></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payload弹窗 -->
    <el-dialog v-model="showPayload" title="JWT Payload" width="600px" :append-to-body="true">
      <div class="payload-section"><h4>Header</h4><pre class="payload-code">{{ JSON.stringify(payloadH, null, 2) }}</pre></div>
      <div class="payload-section"><h4>Payload</h4><pre class="payload-code">{{ JSON.stringify(payloadD, null, 2) }}</pre></div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import service from '@/api/request'

const authStore = useAuthStore()
const router = useRouter()
const tab = ref('overview')
const tabs = [
  { key: 'overview', label: '概览', icon: '📊' },
  { key: 'approve', label: '订单审批', icon: '📋' },
  { key: 'users', label: '用户管理', icon: '👥' },
  { key: 'history', label: '消费记录', icon: '💸' },
  { key: 'session', label: '会话Token', icon: '🔑' }
]

function switchTab(key: string) { tab.value = key }

// ============ 系统统计 ============
const stats = ref({ totalCoins: 0, totalRevenue: 0 })
const pendingCount = ref(0)
const userCount = ref(0)

// ============ 所有订单 ============
const allOrders = ref<any[]>([])
const orderFilter = ref('all')
const orderFilters = computed(() => {
  const pending = allOrders.value.filter(o => o.status === 'pending_review' || o.status === 'pending_payment')
  return [
    { key: 'all', label: '全部', count: allOrders.value.length },
    { key: 'pending_review', label: '待审批', count: pending.length },
    { key: 'subscription', label: '会员订阅', count: allOrders.value.filter(o => o.orderType === 'subscription').length },
    { key: 'recharge', label: '圣力充值', count: allOrders.value.filter(o => (o.orderType || 'recharge') === 'recharge').length },
    { key: 'approved', label: '已通过', count: allOrders.value.filter(o => o.status === 'approved').length },
    { key: 'rejected', label: '已拒绝', count: allOrders.value.filter(o => o.status === 'rejected').length }
  ]
})
const filteredOrders = computed(() => {
  if (orderFilter.value === 'all') return allOrders.value.slice().reverse()
  if (orderFilter.value === 'subscription') return allOrders.value.filter(o => o.orderType === 'subscription').slice().reverse()
  if (orderFilter.value === 'recharge') return allOrders.value.filter(o => (o.orderType || 'recharge') === 'recharge').slice().reverse()
  return allOrders.value.filter(o => o.status === orderFilter.value).slice().reverse()
})
const recentOrders = computed(() => allOrders.value.slice(-8).reverse())

// ============ 用户列表 ============
const users = ref<any[]>([])
const userSearch = ref('')
const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  const kw = userSearch.value.toLowerCase()
  return users.value.filter(u => (u.username || '').toLowerCase().includes(kw))
})

// ============ 消费记录 ============
const transactions = ref<any[]>([])

// ============ 模块消耗 ============
const consumeModules = ref<any[]>([])

// ============ 加载数据 ============
async function loadAll() {
  await Promise.all([loadOrders(), loadUsers(), loadTransactions()])
  calcStats()
}

async function loadOrders() {
  try {
    const res = await service.get('/payment/coin/orders')
    if (res.data.code === 0) {
      allOrders.value = res.data.data.items || []
      pendingCount.value = allOrders.value.filter(o => o.status === 'pending_review' || o.status === 'pending_payment').length
    }
  } catch {}
}

async function loadUsers() {
  try {
    const res = await service.get('/users')
    if (res.data.code === 0) {
      const data = res.data.data
      users.value = data.items || data || []
      userCount.value = users.value.length
    }
  } catch {}
}

async function loadTransactions() {
  try {
    const res = await service.get('/payment/coin/transactions', { params: { page: 1, pageSize: 100 } })
    if (res.data.code === 0) {
      transactions.value = res.data.data?.items || res.data.data || []
      calcModuleConsume()
    }
  } catch {}
}

function calcStats() {
  const approved = allOrders.value.filter(o => o.status === 'approved')
  stats.value.totalRevenue = approved.reduce((s, o) => s + (o.price || 0), 0)
  stats.value.totalCoins = users.value.reduce((s, u) => s + (u.unlimited ? 0 : (u.coins || 0)), 0)
}

function calcModuleConsume() {
  const today = new Date().toDateString()
  const todayTx = transactions.value.filter(t => t.type === 'consume' && new Date(t.createdAt).toDateString() === today)
  const map: Record<string, number> = {}
  todayTx.forEach(t => {
    const desc = t.description || '其他'
    let mod = '其他'
    if (desc.includes('图片') || desc.includes('image')) mod = 'AI图片'
    else if (desc.includes('视频') || desc.includes('video')) mod = 'AI视频'
    else if (desc.includes('文章') || desc.includes('article')) mod = 'AI文章'
    else if (desc.includes('对话') || desc.includes('chat')) mod = 'AI对话'
    else if (desc.includes('自媒体')) mod = '自媒体'
    else if (desc.includes('电商')) mod = '电商'
    map[mod] = (map[mod] || 0) + Math.abs(t.amount)
  })
  const max = Math.max(...Object.values(map), 1)
  const colors = ['#00f0ff', '#ff00ff', '#00ff88', '#ffd700', '#ff6b35', '#7b68ee', '#ff4444']
  consumeModules.value = Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount], i) => ({ name, amount, pct: (amount / max * 100), color: colors[i % colors.length] }))
}

function refreshAll() {
  loadAll()
  ElMessage.success('数据已刷新')
}

// ============ 订单审批 ============
async function doApprove(order: any, action: string) {
  const label = action === 'approve' ? '通过' : '拒绝'
  try {
    await ElMessageBox.confirm(`确认${label}订单 ${order.orderNo || order.id}？`, label, {
      confirmButtonText: '确认' + label, cancelButtonText: '取消', type: 'warning'
    })
  } catch { return }

  try {
    const res = await service.post(`/payment/coin/approve/${order.id}`, { action })
    if (res.data.code === 0) {
      ElMessage.success(res.data.message)
      loadOrders()
      loadUsers()
      calcStats()
    } else {
      ElMessage.error(res.data.message || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

// ============ 用户余额调整 ============
const showAdjust = ref(false)
const adjustUser = ref<any>(null)
const adjustType = ref('add')
const adjustAmount = ref(0)
const adjustRemark = ref('')
const adjusting = ref(false)

function adjustCoins(user: any) {
  adjustUser.value = user
  adjustType.value = 'add'
  adjustAmount.value = 0
  adjustRemark.value = ''
  showAdjust.value = true
}

async function confirmAdjust() {
  if (!adjustUser.value || !adjustAmount.value) return
  adjusting.value = true
  try {
    const newCoins = adjustType.value === 'set'
      ? adjustAmount.value
      : adjustType.value === 'add'
        ? (adjustUser.value.coins || 0) + adjustAmount.value
        : Math.max(0, (adjustUser.value.coins || 0) - adjustAmount.value)
    const res = await service.put(`/users/${adjustUser.value.id}`, { coins: newCoins })
    if (res.data.code === 0) {
      ElMessage.success('余额已调整')
      showAdjust.value = false
      loadUsers()
      calcStats()
    } else {
      ElMessage.error(res.data.message || '调整失败')
    }
  } catch {
    ElMessage.error('调整失败')
  } finally {
    adjusting.value = false
  }
}

// ============ 状态文本 ============
function statusLabel(s: string) {
  const map: any = {
    pending_payment: '待付款', pending_review: '待审批', approved: '已通过',
    rejected: '已拒绝', completed: '已完成'
  }
  return map[s] || s
}

function orderTypeLabel(order: any) {
  return order?.orderType === 'subscription' ? '会员订阅' : '圣力充值'
}

function orderBenefitText(order: any) {
  if (order?.orderType === 'subscription') {
    return `首日${order.coinAmount || 0}圣力 · 每日${order.dailyCoins || 0}圣力 · ${order.subscriptionDays || 30}天`
  }
  return `${order?.coinAmount || 0} 圣力`
}

// ============ 工具函数 ============
function fmtDate(s: string) {
  if (!s) return '-'
  return new Date(s).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// ============ JWT Token ============
const showPayload = ref(false)
const payloadH = ref({})
const payloadD = ref({})
let timer: any = null
const urgent = ref(false)
const remaining = ref('计算中...')

const token = computed(() => localStorage.getItem('lsjy_token') || '')
const shortToken = computed(() => {
  const t = token.value
  return t ? t.substring(0, 20) + '...' + t.substring(t.length - 10) : '未登录'
})
const tokenValid = computed(() => {
  if (!token.value) return false
  const exp = tkInfo.value.exp
  return exp ? exp * 1000 > Date.now() : true
})
const tkInfo = computed(() => {
  try {
    const t = token.value
    if (!t) return {}
    const p = t.split('.')
    return p.length === 3 ? JSON.parse(atob(p[1].replace(/-/g, '+').replace(/_/g, '/'))) : {}
  } catch { return {} }
})

function fmtTime(ts: number) { return new Date(ts * 1000).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) }
function updateRemaining() {
  const exp = tkInfo.value.exp
  if (!exp) { remaining.value = '未知'; return }
  const diff = exp * 1000 - Date.now()
  if (diff <= 0) { remaining.value = '已过期'; urgent.value = true; return }
  urgent.value = diff < 600000
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  remaining.value = `${h}h ${m}m ${s}s`
}

function copyTk() {
  navigator.clipboard.writeText(token.value).then(() => ElMessage.success('已复制'))
}
function refreshTk() {
  ElMessageBox.confirm('确认刷新 Token？', '刷新', { confirmButtonText: '确认', cancelButtonText: '取消' }).then(async () => {
    try {
      const rt = localStorage.getItem('lsjy_refresh_token')
      if (!rt) { ElMessage.error('无 Refresh Token'); return }
      const res = await service.post('/auth/refresh', { refreshToken: rt })
      if (res.data.code === 0 && res.data.data?.accessToken) {
        localStorage.setItem('lsjy_token', res.data.data.accessToken)
        if (res.data.data.refreshToken) localStorage.setItem('lsjy_refresh_token', res.data.data.refreshToken)
        authStore.token = res.data.data.accessToken
        ElMessage.success('刷新成功')
      } else { ElMessage.error('刷新失败') }
    } catch { ElMessage.error('刷新失败') }
  }).catch(() => {})
}
function decodeTk() {
  try {
    const t = token.value
    if (!t) return
    const p = t.split('.')
    payloadH.value = JSON.parse(atob(p[0].replace(/-/g, '+').replace(/_/g, '/')))
    payloadD.value = JSON.parse(atob(p[1].replace(/-/g, '+').replace(/_/g, '/')))
    showPayload.value = true
  } catch { ElMessage.error('解码失败') }
}
function logout() {
  ElMessageBox.confirm('确认退出？', '退出', { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }).then(async () => {
    await authStore.logout()
    router.push('/admin/login')
  }).catch(() => {})
}

onMounted(() => {
  loadAll()
  updateRemaining()
  timer = setInterval(updateRemaining, 1000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.token-mgmt-v4 { padding: 0; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
.stat-card {
  background: var(--cyber-card-bg, rgba(20,20,40,0.8));
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
}
.stat-card.cyan::before { background: linear-gradient(90deg, var(--cyber-cyan), transparent); }
.stat-card.green::before { background: linear-gradient(90deg, var(--cyber-green), transparent); }
.stat-card.magenta::before { background: linear-gradient(90deg, var(--cyber-magenta), transparent); }
.stat-card.gold::before { background: linear-gradient(90deg, #ffd700, transparent); }
.stat-card:hover { border-color: var(--cyber-cyan); transform: translateY(-2px); }
.stat-icon { font-size: 28px; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: rgba(0,240,255,0.08); border-radius: 12px; }
.stat-content { flex: 1; }
.stat-label { font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 4px; }
.stat-value { font-size: 24px; font-weight: 700; font-family: 'JetBrains Mono', monospace; background: linear-gradient(135deg, var(--cyber-cyan), #fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.stat-sub { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; }

.tab-nav { display: flex; gap: 4px; background: rgba(20,20,40,0.6); border-radius: 12px; padding: 4px; margin-bottom: 24px; }
.tab-btn { flex: 1; padding: 12px 8px; border: none; background: transparent; color: rgba(255,255,255,0.6); font-size: 13px; cursor: pointer; border-radius: 8px; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 6px; position: relative; }
.tab-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }
.tab-btn.active { background: rgba(0,240,255,0.15); color: var(--cyber-cyan); font-weight: 600; }
.tab-icon { font-size: 15px; }
.tab-badge { background: var(--cyber-magenta); color: #fff; font-size: 10px; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-left: 2px; }

.card-title { font-weight: 700; font-size: 15px; color: var(--cyber-text, #e0e0e0); font-family: 'JetBrains Mono', monospace; margin-bottom: 16px; }

/* 概览 */
.order-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.order-row-left { display: flex; flex-direction: column; gap: 2px; }
.order-row-right { display: flex; align-items: center; gap: 8px; }
.order-no { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--cyber-cyan); }
.order-time { font-size: 11px; color: rgba(255,255,255,0.4); }
.order-coins { font-size: 13px; font-weight: 600; color: var(--cyber-green); font-family: 'JetBrains Mono', monospace; }

.consume-bars { display: flex; flex-direction: column; gap: 12px; }
.consume-bar-row { display: flex; align-items: center; gap: 10px; }
.cb-label { width: 60px; font-size: 12px; color: rgba(255,255,255,0.7); text-align: right; }
.cb-track { flex: 1; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
.cb-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
.cb-val { width: 50px; font-size: 12px; color: rgba(255,255,255,0.6); font-family: 'JetBrains Mono', monospace; }

.sys-info-list { display: flex; flex-direction: column; gap: 0; }
.sys-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.sys-label { font-size: 13px; color: rgba(255,255,255,0.5); }
.sys-val { font-size: 13px; color: rgba(255,255,255,0.8); font-family: 'JetBrains Mono', monospace; }
.sys-val.ok { color: var(--cyber-green); }

.quick-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.qa-card { display: flex; flex-direction: column; align-items: center; padding: 20px 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; cursor: pointer; transition: all 0.3s; position: relative; }
.qa-card:hover { border-color: var(--cyber-cyan); background: rgba(0,240,255,0.05); transform: translateY(-2px); }
.qa-icon { font-size: 28px; margin-bottom: 8px; }
.qa-text { font-size: 13px; color: rgba(255,255,255,0.8); font-weight: 600; }
.qa-badge { position: absolute; top: 8px; right: 8px; background: var(--cyber-magenta); color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 8px; font-weight: 700; }

/* 订单审批 */
.approve-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.approve-filters { display: flex; gap: 4px; }
.filter-btn { padding: 6px 14px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: rgba(255,255,255,0.6); border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.2s; display: flex; align-items: center; gap: 4px; }
.filter-btn:hover { border-color: var(--cyber-cyan); color: #fff; }
.filter-btn.active { border-color: var(--cyber-cyan); color: var(--cyber-cyan); background: rgba(0,240,255,0.1); }
.filter-count { font-size: 10px; background: rgba(255,255,255,0.1); padding: 1px 5px; border-radius: 8px; }
.filter-btn.active .filter-count { background: rgba(0,240,255,0.2); }

.approve-table { border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; }
.approve-table-head { display: flex; align-items: center; padding: 10px 16px; background: rgba(0,240,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: rgba(255,255,255,0.5); font-weight: 600; }
.approve-table-row { display: flex; align-items: center; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.2s; }
.approve-table-row:hover { background: rgba(0,240,255,0.03); }
.approve-table-row:last-child { border-bottom: none; }
.col-order { flex: 2; }
.col-user { flex: 1.5; }
.col-coins { flex: 1; text-align: center; }
.col-price { flex: 1; text-align: center; }
.col-time { flex: 1.2; }
.col-status { flex: 1; text-align: center; }
.col-action { flex: 2; display: flex; gap: 6px; justify-content: flex-end; }
.col-id { width: 50px; }

.code-text { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--cyber-cyan); }
.highlight { color: var(--cyber-green); font-weight: 700; font-family: 'JetBrains Mono', monospace; }
.dim-text { font-size: 12px; color: rgba(255,255,255,0.4); }
.order-type-line { display: block; margin-top: 3px; font-size: 10px; color: rgba(255,255,255,0.45); font-family: inherit; }

.status-tag { font-size: 11px; padding: 3px 10px; border-radius: 4px; font-weight: 600; display: inline-block; }
.st-pending_payment { background: rgba(255,165,0,0.15); color: #ffa500; }
.st-pending_review { background: rgba(0,240,255,0.15); color: var(--cyber-cyan); }
.st-approved, .st-completed { background: rgba(0,255,136,0.15); color: var(--cyber-green); }
.st-rejected { background: rgba(255,68,68,0.15); color: #f44; }

.act-btn { padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.act-btn.approve { background: rgba(0,255,136,0.15); color: var(--cyber-green); border: 1px solid rgba(0,255,136,0.3); }
.act-btn.approve:hover { background: rgba(0,255,136,0.3); }
.act-btn.reject { background: rgba(255,68,68,0.1); color: #f44; border: 1px solid rgba(255,68,68,0.2); }
.act-btn.reject:hover { background: rgba(255,68,68,0.25); }

/* 搜索框 */
.search-box { display: flex; gap: 8px; }
.search-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 6px 12px; color: #fff; font-size: 13px; outline: none; transition: border-color 0.2s; width: 200px; }
.search-input:focus { border-color: var(--cyber-cyan); }
.search-input::placeholder { color: rgba(255,255,255,0.3); }

/* 调整余额弹窗 */
.adjust-form { display: flex; flex-direction: column; gap: 16px; }
.adj-row { display: flex; align-items: center; gap: 12px; }
.adj-label { width: 80px; font-size: 13px; color: rgba(255,255,255,0.6); }
.adj-val { font-size: 14px; color: #fff; font-weight: 600; }
.adj-input-group { display: flex; gap: 8px; }
.adj-select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 6px 10px; color: #fff; font-size: 13px; outline: none; }
.adj-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 6px 12px; color: #fff; font-size: 13px; outline: none; width: 120px; }
.adj-input.full { width: 100%; flex: 1; }
.adj-input:focus, .adj-select:focus { border-color: var(--cyber-cyan); }

/* 消费记录 */
.tx-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.tx-left { display: flex; align-items: center; gap: 12px; }
.tx-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 16px; font-weight: 700; }
.tx-in { background: rgba(0,255,136,0.15); color: var(--cyber-green); }
.tx-out { background: rgba(255,0,255,0.15); color: var(--cyber-magenta); }
.tx-desc { font-size: 14px; color: #fff; }
.tx-time { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }
.tx-right { text-align: right; }
.tx-plus { color: var(--cyber-green); font-weight: 700; font-family: 'JetBrains Mono', monospace; display: block; }
.tx-minus { color: var(--cyber-magenta); font-weight: 700; font-family: 'JetBrains Mono', monospace; display: block; }
.tx-balance { font-size: 11px; color: rgba(255,255,255,0.4); }

.empty-tip { text-align: center; padding: 40px; color: rgba(255,255,255,0.4); font-size: 14px; }

/* Token */
.tk-rows { display: flex; flex-direction: column; gap: 4px; }
.tk-row { display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); gap: 8px; }
.tk-label { width: 80px; font-size: 13px; color: rgba(255,255,255,0.5); flex-shrink: 0; }
.tk-val { flex: 1; font-size: 12px; color: rgba(255,255,255,0.7); font-family: 'JetBrains Mono', monospace; word-break: break-all; }
.tk-badge { padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.tk-badge.ok { background: rgba(0,255,136,0.15); color: var(--cyber-green); }
.tk-badge.exp { background: rgba(255,68,68,0.15); color: #f44; }
.cp-btn { background: none; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 4px 8px; cursor: pointer; }
.cp-btn:hover { border-color: var(--cyber-cyan); }

.act-list { display: flex; flex-direction: column; gap: 10px; }
.act-card { display: flex; align-items: center; gap: 12px; padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; cursor: pointer; transition: all 0.3s; }
.act-card:hover { border-color: var(--cyber-cyan); background: rgba(0,240,255,0.05); }
.act-icon { font-size: 24px; width: 40px; text-align: center; }
.act-t { font-size: 14px; color: #fff; font-weight: 600; }
.act-d { font-size: 12px; color: rgba(255,255,255,0.5); }

.payload-section { margin-bottom: 16px; }
.payload-section h4 { font-size: 13px; color: var(--cyber-cyan); margin-bottom: 8px; }
.payload-code { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; font-size: 12px; color: var(--cyber-green); font-family: 'JetBrains Mono', monospace; overflow-x: auto; }
</style>
