<template>
  <div>
    <!-- 实时数据概览 - 4卡片 -->
    <div class="cyber-grid-stats mb-6">
      <div class="cyber-card cyber-stat-card">
        <div class="stat-glow" style="background: radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)"></div>
        <div class="stat-content">
          <div>
            <p class="stat-label">在线用户</p>
            <p class="stat-value" style="color: #00f0ff; text-shadow: 0 0 20px #00f0ff40">{{ formatNum(onlineUsers) }}</p>
            <p v-if="onlineChange != null" class="stat-change change-up">↑ {{ onlineChange }}%</p>
          </div>
          <div class="stat-icon" style="boxShadow: 0 0 20px #00f0ff30"></div>
        </div>
      </div>
      <div class="cyber-card cyber-stat-card">
        <div class="stat-glow" style="background: radial-gradient(circle, rgba(0,255,136,0.15) 0%, transparent 70%)"></div>
        <div class="stat-content">
          <div>
            <p class="stat-label">今日注册</p>
            <p class="stat-value" style="color: #00ff88; text-shadow: 0 0 20px #00ff8840">{{ todayRegistrations }}</p>
            <p v-if="regChange != null" class="stat-change change-up">↑ {{ regChange }}%</p>
          </div>
          <div class="stat-icon" style="boxShadow: 0 0 20px #00ff8830"></div>
        </div>
      </div>
      <div class="cyber-card cyber-stat-card">
        <div class="stat-glow" style="background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)"></div>
        <div class="stat-content">
          <div>
            <p class="stat-label">今日营收</p>
            <p class="stat-value" style="color: #f59e0b; text-shadow: 0 0 20px #f59e0b40">¥{{ formatNum(todayRevenue) }}</p>
            <p v-if="revenueChange != null" class="stat-change change-up">↑ {{ revenueChange }}%</p>
          </div>
          <div class="stat-icon" style="boxShadow: 0 0 20px #f59e0b30">💰</div>
        </div>
      </div>
      <div class="cyber-card cyber-stat-card">
        <div class="stat-glow" style="background: radial-gradient(circle, rgba(192,132,252,0.15) 0%, transparent 70%)"></div>
        <div class="stat-content">
          <div>
            <p class="stat-label">圣力消耗</p>
            <p class="stat-value" style="color: #c084fc; text-shadow: 0 0 20px #c084fc40">{{ formatNum(coinConsumed) }}</p>
            <p v-if="coinChange != null" class="stat-change change-down">↓ {{ coinChange }}%</p>
          </div>
          <div class="stat-icon" style="boxShadow: 0 0 20px #c084fc30">⚡</div>
        </div>
      </div>
    </div>

    <!-- 预警指标 - API错误率 & 支付失败率 可点击 -->
    <div class="mb-6 space-y-2">
      <div :class="['cyber-alert', apiErrorRate < 5 ? 'alert-success' : apiErrorRate < 20 ? 'alert-warning' : 'alert-danger', 'clickable']" @click="showApiErrors = true">
        <span class="alert-icon">{{ apiErrorRate < 5 ? '✅' : apiErrorRate < 20 ? '🟡' : '🔴' }}</span>
        <span class="alert-metric">API错误率</span>
        <span class="alert-detail">当前: {{ apiErrorRate }}%</span>
        <span class="alert-sep">|</span>
        <span class="alert-detail">阈值: &lt;5%</span>
        <span class="alert-msg">{{ apiErrorRate < 5 ? '运行正常' : '点击查看详情并修复 →' }}</span>
      </div>
      <div :class="['cyber-alert', paymentFailureRate < 3 ? 'alert-success' : paymentFailureRate < 15 ? 'alert-warning' : 'alert-danger', 'clickable']" @click="showPaymentFailures = true">
        <span class="alert-icon">{{ paymentFailureRate < 3 ? '✅' : paymentFailureRate < 15 ? '🟡' : '🔴' }}</span>
        <span class="alert-metric">支付失败率</span>
        <span class="alert-detail">当前: {{ paymentFailureRate }}%</span>
        <span class="alert-sep">|</span>
        <span class="alert-detail">阈值: &lt;3%</span>
        <span class="alert-msg">{{ paymentFailureRate < 3 ? '运行正常' : '点击查看详情并修复 →' }}</span>
      </div>
    </div>

    <!-- API错误详情面板 -->
    <div v-if="showApiErrors" class="cyber-card mb-6" style="border-color: rgba(245,158,11,0.3)">
      <div class="card-header">
        <h3 class="card-title">️ API错误详情</h3>
        <div class="range-btns">
          <button @click="fetchApiErrors" class="cyber-btn-sm">刷新</button>
          <button @click="showApiErrors = false" class="cyber-btn-sm">关闭</button>
        </div>
      </div>
      <div class="error-list">
        <div v-if="apiErrorsLoading" style="text-align:center;padding:20px;color:#5a5a7a;">加载中...</div>
        <div v-else-if="apiErrors.length === 0" style="text-align:center;padding:20px;color:#00ff88;">✅ 暂无待修复的API错误</div>
        <div v-for="err in apiErrors" :key="err.id" class="error-item">
          <div class="error-header">
            <span class="error-tool">{{ err.toolName }}</span>
            <span class="error-provider">{{ err.apiProvider }}</span>
            <span class="error-time">{{ formatTime(err.createdAt) }}</span>
            <span class="error-status" :class="err.status">{{ err.status === 'pending' ? '待修复' : err.status === 'resolved' ? '已修复' : '已忽略' }}</span>
          </div>
          <div class="error-msg">{{ err.errorMessage }}</div>
          <div class="error-actions" v-if="err.status === 'pending'">
            <button @click="fixApiError(err.id)" class="fix-btn">🔧 修复</button>
            <button @click="retryApiError(err.id)" class="retry-btn">🔄 重试</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 支付失败详情面板 -->
    <div v-if="showPaymentFailures" class="cyber-card mb-6" style="border-color: rgba(255,68,102,0.3)">
      <div class="card-header">
        <h3 class="card-title">🔴 支付失败详情</h3>
        <div class="range-btns">
          <button @click="fetchPaymentFailures" class="cyber-btn-sm">刷新</button>
          <button @click="showPaymentFailures = false" class="cyber-btn-sm">关闭</button>
        </div>
      </div>
      <div class="error-list">
        <div v-if="paymentFailuresLoading" style="text-align:center;padding:20px;color:#5a5a7a;">加载中...</div>
        <div v-else-if="paymentFailures.length === 0" style="text-align:center;padding:20px;color:#00ff88;">✅ 暂无待修复的支付失败</div>
        <div v-for="pf in paymentFailures" :key="pf.id" class="error-item">
          <div class="error-header">
            <span class="error-tool">订单 {{ pf.orderId }}</span>
            <span class="error-provider">¥{{ pf.amount }} · {{ pf.paymentMethod }}</span>
            <span class="error-time">{{ formatTime(pf.createdAt) }}</span>
            <span class="error-status" :class="pf.status">{{ pf.status === 'pending' ? '待修复' : '已修复' }}</span>
          </div>
          <div class="error-msg">{{ pf.errorMessage }}</div>
          <div class="error-actions" v-if="pf.status === 'pending'">
            <button @click="fixPaymentFailure(pf.id)" class="fix-btn"> 修复</button>
            <button @click="retryPaymentFailure(pf.id)" class="retry-btn">🔄 重试</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 趋势图表 -->
    <div class="cyber-grid-charts mb-6">
      <div class="cyber-card">
        <div class="card-header">
          <h3 class="card-title">📈 用户增长趋势</h3>
          <div class="range-btns">
            <button v-for="r in ['7d','30d']" :key="r" @click="trendRange = r" class="cyber-btn-sm" :class="{ 'cyber-btn-active': trendRange === r }">{{ r === '7d' ? '近7天' : '近30天' }}</button>
          </div>
        </div>
        <div class="chart-container">
          <div v-if="trendLoading" style="text-align:center;padding:40px;color:#5a5a7a;">加载中...</div>
          <div v-else-if="trendData.length === 0" style="text-align:center;padding:40px;color:#5a5a7a;">暂无趋势数据</div>
          <div v-else class="trend-chart">
            <div class="trend-y-axis">
              <span v-for="v in yLabels" :key="v">{{ v }}</span>
            </div>
            <div class="trend-body">
              <svg :viewBox="`0 0 ${trendData.length * 60} 200`" class="trend-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#00ff88" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#00ff88" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path :d="trendAreaPath" fill="url(#trendGrad)"/>
                <path :d="trendLinePath" fill="none" stroke="#00ff88" stroke-width="2"/>
                <circle v-for="(d, i) in trendData" :key="i" :cx="i * 60 + 30" :cy="200 - (d.value / maxTrendValue * 180 + 10)" r="4" fill="#00ff88"/>
              </svg>
              <div class="trend-x-axis">
                <span v-for="(d, i) in trendData" :key="i" class="trend-x-label">{{ d.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="cyber-card">
        <div class="card-header">
          <h3 class="card-title">💰 营收趋势</h3>
          <div class="range-btns">
            <button v-for="r in ['7d','30d']" :key="r" @click="revenueRange = r" class="cyber-btn-sm" :class="{ 'cyber-btn-active': revenueRange === r }">{{ r === '7d' ? '近7天' : '近30天' }}</button>
          </div>
        </div>
        <div class="chart-container">
          <div v-if="revenueLoading" style="text-align:center;padding:40px;color:#5a5a7a;">加载中...</div>
          <div v-else-if="revenueData.length === 0" style="text-align:center;padding:40px;color:#5a5a7a;">暂无营收数据</div>
          <div v-else class="trend-chart">
            <div class="trend-y-axis">
              <span v-for="v in revenueYLabels" :key="v">{{ v }}</span>
            </div>
            <div class="trend-body">
              <svg :viewBox="`0 0 ${revenueData.length * 60} 200`" class="trend-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path :d="revenueAreaPath" fill="url(#revGrad)"/>
                <path :d="revenueLinePath" fill="none" stroke="#f59e0b" stroke-width="2"/>
                <circle v-for="(d, i) in revenueData" :key="i" :cx="i * 60 + 30" :cy="200 - (d.value / maxRevenueValue * 180 + 10)" r="4" fill="#f59e0b"/>
              </svg>
              <div class="trend-x-axis">
                <span v-for="(d, i) in revenueData" :key="i" class="trend-x-label">{{ d.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模块分布 -->
    <div class="cyber-grid-pies mb-6">
      <div class="cyber-card">
        <h3 class="card-title mb-4"> 模块用户分布</h3>
        <div class="module-bars">
          <div v-for="m in moduleData" :key="m.name" class="module-bar-item">
            <span class="module-name">{{ m.name }}</span>
            <div class="module-bar-bg">
              <div class="module-bar-fill" :style="{ width: (m.users / maxModuleUsers * 100) + '%', background: m.color }"></div>
            </div>
            <span class="module-value">{{ m.users }}</span>
          </div>
        </div>
      </div>
      <div class="cyber-card">
        <h3 class="card-title mb-4">💎 营收贡献分布</h3>
        <div class="module-bars">
          <div v-for="m in moduleData" :key="m.name" class="module-bar-item">
            <span class="module-name">{{ m.name }}</span>
            <div class="module-bar-bg">
              <div class="module-bar-fill" :style="{ width: (m.revenue / maxModuleRevenue * 100) + '%', background: m.color }"></div>
            </div>
            <span class="module-value">¥{{ m.revenue }}</span>
          </div>
        </div>
      </div>
      <div class="cyber-card">
        <h3 class="card-title mb-4">📊 模块使用量对比</h3>
        <div class="module-bars">
          <div v-for="m in moduleData" :key="m.name" class="module-bar-item">
            <span class="module-name">{{ m.name }}</span>
            <div class="module-bar-bg">
              <div class="module-bar-fill" :style="{ width: (m.users / maxModuleUsers * 100) + '%', background: m.color }"></div>
            </div>
            <span class="module-value">{{ m.users }}次</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门排行 -->
    <div class="cyber-grid-rankings mb-6">
      <div class="cyber-card">
        <h3 class="card-title mb-4">🤖 Top10 AI工具</h3>
        <div class="ranking-list">
          <div v-if="toolRanking.length === 0" style="text-align:center;padding:30px;color:#5a5a7a;">暂无工具使用数据</div>
          <div v-for="(item, index) in toolRanking" :key="item.name" class="ranking-item">
            <span class="rank-badge" :class="index < 3 ? 'rank-top' : ''">{{ index + 1 }}</span>
            <span class="rank-name">{{ item.name }}</span>
            <div class="rank-bar">
              <div class="rank-bar-fill" :style="{ width: (item.count / maxToolCount * 100) + '%' }"></div>
            </div>
            <span class="rank-value">{{ formatNum(item.count) }}</span>
          </div>
        </div>
      </div>
      <div class="cyber-card">
        <h3 class="card-title mb-4">🛒 Top10 热销商品</h3>
        <div class="ranking-list">
          <div v-if="productRanking.length === 0" style="text-align:center;padding:30px;color:#5a5a7a;">暂无商品数据</div>
          <div v-for="(item, index) in productRanking" :key="item.name" class="ranking-item">
            <span class="rank-badge" :class="index < 3 ? 'rank-top' : ''">{{ index + 1 }}</span>
            <span class="rank-name">{{ item.name }}</span>
            <div class="rank-bar">
              <div class="rank-bar-fill" :style="{ width: (item.revenue / maxProductRevenue * 100) + '%' }"></div>
            </div>
            <span class="rank-value">¥{{ item.revenue }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统日志 -->
    <div class="cyber-card">
      <h3 class="card-title mb-4">📋 最近操作日志</h3>
      <div class="log-list">
        <div v-if="recentLogs.length === 0" style="text-align:center;padding:20px;color:#5a5a7a;">暂无操作日志</div>
        <div v-for="log in recentLogs" :key="log.id" class="log-item">
          <span class="log-tag" :class="'log-tag-' + getLogTagClass(log.module)">{{ log.module || '系统' }}</span>
          <span class="log-action">{{ log.action || log.message }}</span>
          <span class="log-time">{{ log.time || formatTime(log.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import service from '@/api/request'

const loading = ref(true)
const trendLoading = ref(false)
const revenueLoading = ref(false)
const apiErrorsLoading = ref(false)
const paymentFailuresLoading = ref(false)
const showApiErrors = ref(false)
const showPaymentFailures = ref(false)

// 4个统计卡片
const onlineUsers = ref(0)
const onlineChange = ref<number | null>(null)
const todayRegistrations = ref(0)
const regChange = ref<number | null>(null)
const todayRevenue = ref(0)
const revenueChange = ref<number | null>(null)
const coinConsumed = ref(0)
const coinChange = ref<number | null>(null)

// API错误率 & 支付失败率
const apiErrorRate = ref(0)
const paymentFailureRate = ref(0)

// 趋势
const trendRange = ref('7d')
const revenueRange = ref('7d')
const trendData = ref<Array<{label: string, value: number}>>([])
const revenueData = ref<Array<{label: string, value: number}>>([])

// 模块数据
const moduleData = ref([
  { name: 'AI工具', users: 0, revenue: 0, color: '#00f0ff' },
  { name: '自媒体', users: 0, revenue: 0, color: '#c084fc' },
  { name: '电商', users: 0, revenue: 0, color: '#f59e0b' },
  { name: '教育', users: 0, revenue: 0, color: '#00ff88' },
  { name: '宠物', users: 0, revenue: 0, color: '#ff00ff' },
  { name: '伯雅校园', users: 0, revenue: 0, color: '#3b82f6' },
])

// 排行榜
const toolRanking = ref<Array<{name: string, count: number}>>([])
const productRanking = ref<Array<{name: string, revenue: number}>>([])
const recentLogs = ref<any[]>([])

// API错误 & 支付失败
const apiErrors = ref<any[]>([])
const paymentFailures = ref<any[]>([])

// 计算属性
const maxTrendValue = computed(() => Math.max(...trendData.value.map(d => d.value), 1))
const maxRevenueValue = computed(() => Math.max(...revenueData.value.map(d => d.value), 1))
const maxModuleUsers = computed(() => Math.max(...moduleData.value.map(m => m.users), 1))
const maxModuleRevenue = computed(() => Math.max(...moduleData.value.map(m => m.revenue), 1))
const maxToolCount = computed(() => Math.max(...toolRanking.value.map(i => i.count), 1))
const maxProductRevenue = computed(() => Math.max(...productRanking.value.map(i => i.revenue), 1))

const yLabels = computed(() => {
  const max = maxTrendValue.value
  return [max, Math.round(max*0.75), Math.round(max*0.5), Math.round(max*0.25), 0]
})
const revenueYLabels = computed(() => {
  const max = maxRevenueValue.value
  return ['¥'+max, '¥'+Math.round(max*0.75), '¥'+Math.round(max*0.5), '¥'+Math.round(max*0.25), '¥0']
})

function buildLinePath(data: Array<{value: number}>, maxVal: number, width: number, height: number) {
  if (data.length === 0) return ''
  const stepX = width / (data.length - 1 || 1)
  const padY = 10
  const usableH = height - padY * 2
  return data.map((d, i) => {
    const x = i * stepX
    const y = height - padY - (d.value / maxVal * usableH)
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  }).join(' ')
}

function buildAreaPath(data: Array<{value: number}>, maxVal: number, width: number, height: number) {
  const linePath = buildLinePath(data, maxVal, width, height)
  if (!linePath) return ''
  const stepX = width / (data.length - 1 || 1)
  const lastX = (data.length - 1) * stepX
  return `${linePath} L${lastX},${height} L0,${height} Z`
}

const trendLinePath = computed(() => buildLinePath(trendData.value, maxTrendValue.value, trendData.value.length * 60, 200))
const trendAreaPath = computed(() => buildAreaPath(trendData.value, maxTrendValue.value, trendData.value.length * 60, 200))
const revenueLinePath = computed(() => buildLinePath(revenueData.value, maxRevenueValue.value, revenueData.value.length * 60, 200))
const revenueAreaPath = computed(() => buildAreaPath(revenueData.value, maxRevenueValue.value, revenueData.value.length * 60, 200))

function formatNum(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  if (n >= 1000) return n.toLocaleString()
  return String(Math.round(n))
}

function formatTime(ts: string) {
  if (!ts) return ''
  return new Date(ts).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// 统一从 /admin/dashboard 获取所有数据
async function fetchDashboard() {
  trendLoading.value = true
  revenueLoading.value = true
  try {
    const { data: result } = await service.get('/admin/dashboard')
    const d = result.data

    // 统计卡片
    if (d.realtimeStats && d.realtimeStats.length) {
      d.realtimeStats.forEach((s: any) => {
        if (s.label === '在线用户') onlineUsers.value = s.value
        if (s.label === '今日注册') todayRegistrations.value = s.value
        if (s.label === '今日营收') todayRevenue.value = s.value
        if (s.label === '圣力消耗') coinConsumed.value = s.value
      })
    } else {
      onlineUsers.value = d.activeUsers || d.onlineUsers || 0
      todayRegistrations.value = d.todayRegistrations || 0
      todayRevenue.value = d.totalRevenue || d.todayRevenue || 0
      coinConsumed.value = d.todayAIUsage || d.energyConsumption || 0
    }

    // 百分比变化
    onlineChange.value = d.onlineUsersChange ?? onlineChange.value
    regChange.value = d.todayRegistrationsChange ?? regChange.value
    revenueChange.value = d.todayRevenueChange ?? revenueChange.value
    coinChange.value = d.energyConsumptionChange ?? coinChange.value

    // 错误率 & 支付失败率
    apiErrorRate.value = parseFloat(d.apiErrorRate || '0')
    paymentFailureRate.value = parseFloat(d.paymentFailureRate || '0')

    // 趋势数据
    if (d.trend) {
      const dates = d.trend.dates || []
      const newUsers = d.trend.newUsers || []
      const revenue = d.trend.revenue || []
      trendData.value = dates.map((date: string, i: number) => ({ label: date, value: newUsers[i] || 0 }))
      revenueData.value = dates.map((date: string, i: number) => ({ label: date, value: revenue[i] || 0 }))
    }

    // 模块数据
    if (d.modules && d.modules.length) {
      const colorMap: Record<string, string> = {
        'AI工具': '#00f0ff', '自媒体': '#c084fc', '电商': '#f59e0b',
        '教育': '#00ff88', '宠物': '#ff00ff', '伯雅校园': '#3b82f6'
      }
      moduleData.value = d.modules.map((m: any) => ({
        name: m.name,
        users: m.users || 0,
        revenue: m.revenue || 0,
        color: colorMap[m.name] || '#00f0ff'
      }))
    } else {
      // 无模块数据时，显示默认模块
      moduleData.value = [
        { name: 'AI工具', users: 0, revenue: 0, color: '#00f0ff' },
        { name: '自媒体', users: 0, revenue: 0, color: '#c084fc' },
        { name: '电商', users: 0, revenue: 0, color: '#f59e0b' }
      ]
    }

    // Top10 AI工具
    if (d.topTools && d.topTools.length) {
      toolRanking.value = d.topTools.map((t: any) => ({ name: t.name, count: t.count || t.usageCount || 0 }))
    } else {
      // 无工具数据时，显示默认
      toolRanking.value = [
        { name: 'AI自由对话', count: 0 },
        { name: 'AI绘画', count: 0 },
        { name: 'AI视频', count: 0 }
      ]
    }

    // Top10 热销商品
    if (d.topProducts && d.topProducts.length) {
      productRanking.value = d.topProducts.map((p: any) => ({ name: p.name, revenue: p.revenue || 0 }))
    } else {
      // 无商品数据时，显示默认
      productRanking.value = [
        { name: '圣力充值包', revenue: 0 },
        { name: 'VIP会员', revenue: 0 }
      ]
    }

    // 最近日志
    if (d.recentLogs && d.recentLogs.length) {
      recentLogs.value = d.recentLogs.slice(0, 10)
    }

    loading.value = false
  } catch (e) {
    console.error('获取Dashboard数据失败:', e)
    loading.value = false
  } finally {
    trendLoading.value = false
    revenueLoading.value = false
  }
}

async function fetchApiErrors() {
  apiErrorsLoading.value = true
  try {
    const { data } = await service.get('/admin/api-errors', { params: { status: 'pending', pageSize: 20 } })
    if (data.code === 0) apiErrors.value = (data.data.list || data.data.items || data.data || []).slice(0, 20)
  } catch (e) { console.error(e) } finally { apiErrorsLoading.value = false }
}

async function fetchPaymentFailures() {
  paymentFailuresLoading.value = true
  try {
    const { data } = await service.get('/admin/payment-failures', { params: { status: 'pending', pageSize: 20 } })
    if (data.code === 0) paymentFailures.value = (data.data.list || data.data.items || data.data || []).slice(0, 20)
  } catch (e) { console.error(e) } finally { paymentFailuresLoading.value = false }
}

async function fixApiError(id: number) {
  try {
    const { data } = await service.put(`/admin/api-errors/${id}`, { status: 'resolved', resolvedBy: 'admin' })
    if (data.code === 0) { fetchApiErrors(); fetchDashboard() }
  } catch (e) { console.error(e) }
}

async function retryApiError(id: number) {
  try {
    const { data } = await service.post(`/admin/api-errors/${id}/retry`)
    if (data.code === 0) { fetchApiErrors(); fetchDashboard() }
  } catch (e) { console.error(e) }
}

async function fixPaymentFailure(id: number) {
  try {
    const { data } = await service.put(`/admin/payment-failures/${id}`, { status: 'resolved', resolvedBy: 'admin' })
    if (data.code === 0) { fetchPaymentFailures(); fetchDashboard() }
  } catch (e) { console.error(e) }
}

async function retryPaymentFailure(id: number) {
  try {
    const { data } = await service.post(`/admin/payment-failures/${id}/retry`)
    if (data.code === 0) { fetchPaymentFailures(); fetchDashboard() }
  } catch (e) { console.error(e) }
}

function getLogTagClass(module: string) {
  if (!module) return 'system'
  if (module.includes('充值') || module.includes('支付') || module.includes('订单')) return 'payment'
  if (module.includes('AI') || module.includes('工具')) return 'ai'
  if (module.includes('登录') || module.includes('注册') || module.includes('认证')) return 'auth'
  return 'system'
}

onMounted(async () => {
  await fetchDashboard()
})
</script>

<style scoped>
.cyber-grid-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
@media (max-width: 767px) { .cyber-grid-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
@media (min-width: 768px) and (max-width: 1199px) { .cyber-grid-stats { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
.cyber-grid-charts { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
@media (max-width: 767px) { .cyber-grid-charts { grid-template-columns: 1fr; gap: 12px; } }
.cyber-grid-pies { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
@media (max-width: 767px) { .cyber-grid-pies { grid-template-columns: 1fr; gap: 12px; } }
.cyber-grid-rankings { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
@media (max-width: 767px) { .cyber-grid-rankings { grid-template-columns: 1fr; gap: 12px; } }

.cyber-card { background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e; border-radius: 12px; padding: 20px; position: relative; overflow: hidden; }
.cyber-stat-card { min-height: 100px; }
.stat-glow { position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; border-radius: 50%; pointer-events: none; }
.stat-content { display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1; }
@media (max-width: 767px) { .stat-content { padding: 14px; } }
.stat-label { font-size: 12px; color: #6a6a8a; margin-bottom: 6px; letter-spacing: 0.5px; }
@media (max-width: 767px) { .stat-label { font-size: 11px; } }
.stat-value { font-size: 28px; font-weight: 800; font-family: 'Courier New', monospace; }
@media (max-width: 767px) { .stat-value { font-size: 20px; } }
.stat-change { font-size: 11px; margin-top: 4px; }
@media (max-width: 767px) { .stat-change { font-size: 10px; } }
.change-up { color: #00ff88; }
.change-down { color: #ff4466; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid #1a1a2e; display: flex; align-items: center; justify-content: center; font-size: 24px; }
@media (max-width: 767px) { .stat-icon { width: 36px; height: 36px; font-size: 18px; border-radius: 8px; } }

.cyber-alert { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; font-size: 13px; border: 1px solid; }
@media (max-width: 767px) { .cyber-alert { gap: 8px; padding: 10px 12px; font-size: 12px; flex-wrap: wrap; } }
.alert-warning { background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.alert-danger { background: rgba(255, 68, 102, 0.08); border-color: rgba(255, 68, 102, 0.2); color: #ff4466; }
.alert-success { background: rgba(0, 255, 136, 0.08); border-color: rgba(0, 255, 136, 0.2); color: #00ff88; }
.clickable { cursor: pointer; transition: all 0.3s; }
.clickable:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
.alert-metric { font-weight: 600; }
.alert-detail { color: #6a6a8a; font-size: 12px; }
.alert-sep { color: #2a2a4e; }
.alert-msg { flex: 1; color: #8888aa; font-size: 12px; }

.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-title { font-size: 14px; font-weight: 700; color: #e0e0ff; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
@media (max-width: 767px) { .mb-6 { margin-bottom: 16px; } }

.range-btns { display: flex; gap: 4px; }
.cyber-btn-sm { padding: 4px 12px; border-radius: 6px; font-size: 11px; background: transparent; border: 1px solid #1a1a2e; color: #6a6a8a; cursor: pointer; transition: all 0.2s; }
.cyber-btn-sm:hover { border-color: #00f0ff44; color: #00f0ff; }
.cyber-btn-active { background: rgba(0, 240, 255, 0.1) !important; border-color: #00f0ff !important; color: #00f0ff !important; box-shadow: 0 0 8px rgba(0, 240, 255, 0.2); }

.chart-container { min-height: 200px; height: 200px; }
.chart-container-sm { min-height: 200px; height: 200px; }
.trend-chart { display: flex; gap: 8px; height: 200px; }
.trend-y-axis { display: flex; flex-direction: column; justify-content: space-between; font-size: 10px; color: #4a4a6a; font-family: 'Courier New', monospace; min-width: 40px; text-align: right; }
.trend-body { flex: 1; display: flex; flex-direction: column; }
.trend-svg { width: 100%; height: 100%!important; flex: 1; }
.trend-x-axis { display: flex; justify-content: space-between; font-size: 10px; color: #4a4a6a; font-family: 'Courier New', monospace; margin-top: 4px; }

.module-bars { display: flex; flex-direction: column; gap: 10px; }
.module-bar-item { display: flex; align-items: center; gap: 10px; }
.module-name { width: 70px; font-size: 12px; color: #a0a0cc; flex-shrink: 0; }
.module-bar-bg { flex: 1; height: 8px; background: #1a1a2e; border-radius: 4px; overflow: hidden; }
.module-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
.module-value { width: 60px; font-size: 11px; color: #6a6a8a; text-align: right; font-family: 'Courier New', monospace; flex-shrink: 0; }

.ranking-list { display: flex; flex-direction: column; gap: 8px; }
.ranking-item { display: flex; align-items: center; gap: 10px; }
.rank-badge { width: 22px; height: 22px; border-radius: 6px; background: #1a1a2e; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #4a4a6a; flex-shrink: 0; }
.rank-top { background: linear-gradient(135deg, #f59e0b, #ff6b00); color: #fff; box-shadow: 0 0 8px rgba(245, 158, 11, 0.3); }
.rank-name { flex: 1; font-size: 12px; color: #a0a0cc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rank-bar { width: 60px; height: 4px; background: #1a1a2e; border-radius: 2px; overflow: hidden; }
@media (max-width: 767px) { .rank-bar { width: 40px; } }
.rank-bar-fill { height: 100%; background: linear-gradient(90deg, #00f0ff, #7c3aed); border-radius: 2px; }
.rank-value { font-size: 11px; color: #6a6a8a; width: 50px; text-align: right; font-family: 'Courier New', monospace; }
@media (max-width: 767px) { .rank-value { width: 40px; font-size: 10px; } }

.error-list { display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto; }
.error-item { padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid #1a1a2e; border-radius: 8px; }
.error-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
.error-tool { font-weight: 600; color: #e0e0ff; font-size: 13px; }
.error-provider { padding: 2px 8px; background: rgba(0,240,255,0.1); border-radius: 4px; font-size: 11px; color: #00f0ff; }
.error-time { font-size: 11px; color: #4a4a6a; margin-left: auto; }
.error-status { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.error-status.pending { background: rgba(245,158,11,0.1); color: #f59e0b; }
.error-status.resolved { background: rgba(0,255,136,0.1); color: #00ff88; }
.error-status.ignored { background: rgba(100,100,140,0.1); color: #6a6a8a; }
.error-msg { font-size: 12px; color: #8888aa; margin-bottom: 8px; }
.error-actions { display: flex; gap: 8px; }
.fix-btn { padding: 4px 12px; background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.3); border-radius: 6px; color: #00ff88; font-size: 11px; cursor: pointer; }
.fix-btn:hover { background: rgba(0,255,136,0.2); }
.retry-btn { padding: 4px 12px; background: rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.3); border-radius: 6px; color: #00f0ff; font-size: 11px; cursor: pointer; }
.retry-btn:hover { background: rgba(0,240,255,0.2); }

.log-list { display: flex; flex-direction: column; }
.log-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #1a1a2e; }
.log-item:last-child { border-bottom: none; }
.log-tag { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; letter-spacing: 0.5px; }
.log-tag-auth { background: rgba(0, 240, 255, 0.1); color: #00f0ff; }
.log-tag-ai { background: rgba(124, 58, 237, 0.1); color: #c084fc; }
.log-tag-payment { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.log-tag-system { background: rgba(100, 100, 140, 0.1); color: #6a6a8a; }
.log-action { flex: 1; font-size: 13px; color: #a0a0cc; }
.log-time { font-size: 11px; color: #4a4a6a; font-family: 'Courier New', monospace; }

.text-green-400 { color: #00ff88; }
.text-cyan-400 { color: #00f0ff; }
.space-y-2 > * + * { margin-top: 8px; }
</style>
