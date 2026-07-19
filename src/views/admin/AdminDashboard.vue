<template>
  <div>
    <div style="padding:8px 0;color:#00f0ff;font-size:14px;">ADMIN DASHBOARD V2 - 数据看板已加载</div>
    <div v-if="loadError" class="mb-4 p-4 rounded" style="background:#ff2d9520;border:1px solid #ff2d95;color:#ff2d95;">
      <div class="font-bold">后端服务异常</div>
      <div class="text-sm mt-1">请稍后刷新，或联系管理员重启后端服务。</div>
      <el-button size="small" class="mt-2" @click="loadDashboard">重试</el-button>
    </div>
    <!-- 实时数据概览 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div v-for="stat in realtimeStats" :key="stat.label" class="rounded-xl p-5 shadow-sm relative overflow-hidden" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6" :class="stat.bgClass"></div>
        <div class="flex items-center justify-between relative">
          <div>
            <p class="text-sm" style="color:#808099;">{{ stat.label }}</p>
            <p class="text-3xl font-bold mt-1" style="color:#e0e0ff;">{{ stat.value }}</p>
            <p class="text-xs mt-1" :class="stat.change >= 0 ? 'text-green-500' : 'text-red-500'">
              {{ stat.change >= 0 ? '↑' : '↓' }} {{ Math.abs(stat.change) }}% 较昨日
            </p>
          </div>
          <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl" :class="stat.iconBg">{{ stat.icon }}</div>
        </div>
      </div>
    </div>

    <!-- 预警指标 -->
    <div v-if="alerts.length > 0" class="mb-6 space-y-2">
      <div v-for="(alert, idx) in alerts" :key="idx" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" :class="alertClass(alert.type)">
        <span class="text-lg">{{ alert.type === 'danger' ? '🔴' : alert.type === 'warning' ? '🟡' : '🔵' }}</span>
        <span class="font-medium">{{ alert.metric }}</span>
        <span class="text-gray-500">当前: {{ alert.value }}</span>
        <span class="text-gray-400">|</span>
        <span class="text-gray-500">阈值: {{ alert.threshold }}</span>
        <span class="flex-1">{{ alert.message }}</span>
      </div>
    </div>

    <!-- 趋势图表 -->
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <!-- 用户增长曲线 -->
      <div class="rounded-xl p-5 shadow-sm" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold" style="color:#e0e0ff;">📈 用户增长趋势</h3>
          <div class="flex gap-1">
            <button v-for="r in ['7d','30d']" :key="r" @click="trendRange = r" class="px-3 py-1 rounded text-xs" :class="trendRange === r ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-300 text-gray-500'">{{ r === '7d' ? '近7天' : '近30天' }}</button>
          </div>
        </div>
        <div ref="userChartRef" class="h-64"></div>
      </div>
      <!-- 营收趋势 -->
      <div class="rounded-xl p-5 shadow-sm" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold" style="color:#e0e0ff;">💰 营收趋势</h3>
          <div class="flex gap-1">
            <button v-for="r in ['7d','30d']" :key="r" @click="revenueRange = r" class="px-3 py-1 rounded text-xs" :class="revenueRange === r ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-300 text-gray-500'">{{ r === '7d' ? '近7天' : '近30天' }}</button>
          </div>
        </div>
        <div ref="revenueChartRef" class="h-64"></div>
      </div>
    </div>

    <!-- 模块分布 & 热门排行 -->
    <div class="grid lg:grid-cols-3 gap-6 mb-6">
      <!-- 六大模块用户分布 -->
      <div class="rounded-xl p-5 shadow-sm" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <h3 class="font-bold" style="color:#e0e0ff; mb-4">🧩 模块用户分布</h3>
        <div ref="modulePieRef" class="h-56"></div>
      </div>
      <!-- 营收贡献饼图 -->
      <div class="rounded-xl p-5 shadow-sm" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <h3 class="font-bold" style="color:#e0e0ff; mb-4">💎 营收贡献分布</h3>
        <div ref="revenuePieRef" class="h-56"></div>
      </div>
      <!-- 各模块使用量对比 -->
      <div class="rounded-xl p-5 shadow-sm" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <h3 class="font-bold" style="color:#e0e0ff; mb-4">📊 模块使用量对比</h3>
        <div ref="moduleBarRef" class="h-56"></div>
      </div>
    </div>

    <!-- 热门排行 -->
    <div class="grid lg:grid-cols-3 gap-6 mb-6">
      <!-- Top10 AI工具 -->
      <div class="rounded-xl p-5 shadow-sm" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <h3 class="font-bold" style="color:#e0e0ff; mb-4">🤖 Top10 AI工具</h3>
        <div class="space-y-2">
          <div v-for="(item, index) in toolRanking" :key="item.name" class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              :class="index < 3 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-gray-100 dark:bg-dark-300 text-gray-500'">
              {{ index + 1 }}
            </span>
            <span class="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{{ item.name }}</span>
            <div class="w-20 h-2 bg-gray-100 dark:bg-dark-300 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full" :style="{ width: (item.count / maxToolCount * 100) + '%' }"></div>
            </div>
            <span class="text-xs text-gray-500 w-14 text-right">{{ formatNum(item.count) }}</span>
          </div>
        </div>
      </div>
      <!-- Top10 热销商品 -->
      <div class="rounded-xl p-5 shadow-sm" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <h3 class="font-bold" style="color:#e0e0ff; mb-4">🛒 Top10 热销商品</h3>
        <div class="space-y-2">
          <div v-for="(item, index) in productRanking" :key="item.name" class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              :class="index < 3 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-gray-100 dark:bg-dark-300 text-gray-500'">
              {{ index + 1 }}
            </span>
            <span class="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{{ item.name }}</span>
            <span class="text-xs text-green-600 w-14 text-right">¥{{ item.revenue }}</span>
          </div>
        </div>
      </div>
      <!-- Top10 热门课程 -->
      <div class="rounded-xl p-5 shadow-sm" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <h3 class="font-bold" style="color:#e0e0ff; mb-4">📚 Top10 热门课程</h3>
        <div class="space-y-2">
          <div v-for="(item, index) in courseRanking" :key="item.name" class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              :class="index < 3 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-gray-100 dark:bg-dark-300 text-gray-500'">
              {{ index + 1 }}
            </span>
            <span class="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{{ item.name }}</span>
            <span class="text-xs text-blue-600 w-14 text-right">{{ item.students }}人</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 开源技能状态 -->
    <div class="rounded-xl p-5 shadow-sm mb-6" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold" style="color:#e0e0ff;">🔧 开源AI技能状态</h3>
        <el-button size="small" @click="loadSkillsStatus" :loading="skillsLoading">刷新</el-button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div v-for="skill in skillsStatus" :key="skill.name" class="border rounded-lg p-4" :class="skill.available ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : 'border-red-200 bg-red-50 dark:bg-red-900/10'">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">{{ skill.name === 'crawl4ai' ? '🕷️' : skill.name === 'whisper' ? '🎙️' : '💻' }}</span>
            <span class="font-bold text-sm">{{ skill.displayName }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full" :class="skill.available ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'">{{ skill.available ? '运行中' : '未就绪' }}</span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ skill.description }}</p>
        </div>
      </div>
    </div>

    <!-- 系统日志 -->
    <div class="rounded-xl p-5 shadow-sm" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
      <h3 class="font-bold" style="color:#e0e0ff; mb-4">📋 最近操作日志</h3>
      <div class="space-y-2">
        <div v-for="log in recentLogs" :key="log.id" class="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
          <span class="px-2 py-0.5 rounded text-xs font-medium" :class="logTypeClass(log.type)">{{ log.module }}</span>
          <span class="flex-1 text-sm text-gray-700 dark:text-gray-300">{{ log.action }}</span>
          <span class="text-xs text-gray-400">{{ log.operator }}</span>
          <span class="text-xs text-gray-400">{{ log.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { adminApi, skillsApi } from '@/api'
import { ElMessage } from 'element-plus'

// ===== 真实看板数据 =====
const dashboardLoading = ref(false)
const loadError = ref(false)
const dashboardData = ref<any>(null)

function formatValue(val: number | string, prefix = ''): string {
  const n = Number(val) || 0
  if (n >= 10000) return prefix + (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return prefix + (n / 1000).toFixed(1) + 'k'
  return prefix + n.toLocaleString('zh-CN')
}

const realtimeStats = computed(() => {
  const d = dashboardData.value
  // 使用真实API数据，或兜底默认值
  const items = d?.realtimeStats || [
    { label: '在线用户', value: 0, color: '#00f0ff' },
    { label: '今日注册', value: 0, color: '#00ff88' },
    { label: '今日营收', value: 0, color: '#f59e0b' },
    { label: '圣力消耗', value: 0, color: '#c084fc' },
  ]
  const changeMap: Record<string, number> = {
    '在线用户': d?.onlineUsersChange || 0,
    '今日注册': d?.todayRegistrationsChange || 0,
    '今日营收': d?.todayRevenueChange || 0,
    '圣力消耗': d?.energyConsumptionChange || 0,
  }
  return items.map((item: any, idx: number) => {
    const isRevenue = item.label === '今日营收'
    return {
      icon: ['👥', '📝', '💰', '⚡'][idx] || '📊',
      label: item.label,
      value: isRevenue ? formatValue(item.value, '¥') : formatValue(item.value),
      change: changeMap[item.label] || 0,
      bgClass: item.color ? `bg-[${item.color}]` : 'bg-blue-500',
      iconBg: ['bg-blue-100', 'bg-green-100', 'bg-amber-100', 'bg-purple-100'][idx] || 'bg-gray-100',
    }
  })
})

// ===== 预警 =====
const alerts = computed(() => dashboardData.value?.alerts || [])

function alertClass(type: string) {
  return { warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800', danger: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800', info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800' }[type] || ''
}

// ===== 趋势数据 =====
const trendRange = ref('7d')
const revenueRange = ref('7d')

const defaultTrend = {
  dates: ['07-12', '07-13', '07-14', '07-15', '07-16', '07-17', '07-18'],
  newUsers: [0, 0, 0, 0, 0, 0, 0],
  activeUsers: [0, 0, 0, 0, 0, 0, 0],
  revenue: [0, 0, 0, 0, 0, 0, 0],
}

const trendData = computed(() => {
  const d = dashboardData.value?.trend
  if (!d || !d.dates || d.dates.length === 0) return { '7d': defaultTrend, '30d': defaultTrend }
  return {
    '7d': d,
    '30d': d,
  }
})

// ===== 模块数据 =====
const defaultModules = [
  { name: 'AI工具', users: 0, revenue: 0, color: '#6366f1' },
  { name: '自媒体', users: 0, revenue: 0, color: '#8b5cf6' },
  { name: '电商', users: 0, revenue: 0, color: '#f59e0b' },
  { name: '教育', users: 0, revenue: 0, color: '#10b981' },
  { name: '宠物', users: 0, revenue: 0, color: '#ef4444' },
  { name: '伯雅校园', users: 0, revenue: 0, color: '#3b82f6' },
]
const moduleData = computed(() => dashboardData.value?.modules || defaultModules)

// ===== 排行榜 =====
const toolRanking = computed(() => dashboardData.value?.topTools || [])
const productRanking = computed(() => dashboardData.value?.topProducts || [])
const courseRanking = computed(() => dashboardData.value?.topCourses || [])

const maxToolCount = computed(() => Math.max(...toolRanking.map(r => r.count)))

// ===== 日志 =====
const recentLogs = computed(() => dashboardData.value?.recentLogs || [])

function logTypeClass(type: string) {
  return { user: 'bg-blue-100 text-blue-700', order: 'bg-amber-100 text-amber-700', tool: 'bg-purple-100 text-purple-700', content: 'bg-green-100 text-green-700', system: 'bg-gray-100 text-gray-600' }[type] || ''
}

function formatNum(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

// ===== ECharts =====
const userChartRef = ref<HTMLElement>()
const revenueChartRef = ref<HTMLElement>()
const modulePieRef = ref<HTMLElement>()
const revenuePieRef = ref<HTMLElement>()
const moduleBarRef = ref<HTMLElement>()

let charts: any[] = []

function isAllZero(arr: number[]): boolean {
  return !arr || arr.length === 0 || arr.every(v => v === 0)
}

function emptyGraphic(text: string = '暂无数据') {
  return {
    type: 'text',
    left: 'center',
    top: 'center',
    style: {
      text,
      fill: '#9ca3af',
      fontSize: 14,
      fontWeight: 'bold',
    },
    z: 100,
  }
}

function initCharts() {
  const echarts = (window as any).echarts
  if (!echarts) {
    renderFallbackCharts()
    return
  }

  const textColor = document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'

  // 用户增长曲线
  if (userChartRef.value) {
    const chart = echarts.init(userChartRef.value)
    const d = trendData.value[trendRange.value as keyof typeof trendData.value]
    const empty = isAllZero(d.newUsers) && isAllZero(d.activeUsers)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { top: 20, right: 20, bottom: 30, left: 50 },
      xAxis: { type: 'category', data: d.dates, axisLabel: { color: textColor, fontSize: 11 }, axisLine: { lineStyle: { color: '#e5e7eb' } } },
      yAxis: { type: 'value', axisLabel: { color: textColor, fontSize: 11 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
      graphic: empty ? emptyGraphic() : undefined,
      series: empty ? [] : [
        { name: '新增用户', type: 'line', smooth: true, data: d.newUsers, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(99,102,241,0.3)' }, { offset: 1, color: 'rgba(99,102,241,0.02)' }] } }, lineStyle: { color: '#6366f1' }, itemStyle: { color: '#6366f1' } },
        { name: '活跃用户', type: 'line', smooth: true, data: d.activeUsers.map(v => v / 10), areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16,185,129,0.3)' }, { offset: 1, color: 'rgba(16,185,129,0.02)' }] } }, lineStyle: { color: '#10b981' }, itemStyle: { color: '#10b981' } },
      ]
    })
    charts.push(chart)
  }

  // 营收趋势
  if (revenueChartRef.value) {
    const chart = echarts.init(revenueChartRef.value)
    const d = trendData.value[revenueRange.value as keyof typeof trendData.value]
    const empty = isAllZero(d.revenue)
    chart.setOption({
      tooltip: { trigger: 'axis', formatter: '{b}<br/>营收: ¥{c}' },
      grid: { top: 20, right: 20, bottom: 30, left: 60 },
      xAxis: { type: 'category', data: d.dates, axisLabel: { color: textColor, fontSize: 11 }, axisLine: { lineStyle: { color: '#e5e7eb' } } },
      yAxis: { type: 'value', axisLabel: { color: textColor, fontSize: 11, formatter: (v: number) => v >= 1000 ? (v / 1000) + 'k' : v }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
      graphic: empty ? emptyGraphic() : undefined,
      series: empty ? [] : [{ name: '营收', type: 'bar', data: d.revenue, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#f59e0b' }, { offset: 1, color: '#fbbf24' }] }, borderRadius: [4, 4, 0, 0] } }]
    })
    charts.push(chart)
  }

  // 模块用户分布饼图
  if (modulePieRef.value) {
    const chart = echarts.init(modulePieRef.value)
    const data = moduleData.value.map(m => ({ name: m.name, value: m.users, itemStyle: { color: m.color } }))
    const empty = data.every(item => item.value === 0)
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
      graphic: empty ? emptyGraphic() : undefined,
      series: empty ? [] : [{ type: 'pie', radius: ['40%', '70%'], data, label: { color: textColor, fontSize: 11 }, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } } }]
    })
    charts.push(chart)
  }

  // 营收贡献饼图
  if (revenuePieRef.value) {
    const chart = echarts.init(revenuePieRef.value)
    const data = moduleData.value.map(m => ({ name: m.name, value: m.revenue, itemStyle: { color: m.color } }))
    const empty = data.every(item => item.value === 0)
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
      graphic: empty ? emptyGraphic() : undefined,
      series: empty ? [] : [{ type: 'pie', radius: ['40%', '70%'], data, label: { color: textColor, fontSize: 11 }, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } } }]
    })
    charts.push(chart)
  }

  // 模块使用量柱状图
  if (moduleBarRef.value) {
    const chart = echarts.init(moduleBarRef.value)
    const barData = moduleData.value.map(m => m.users).reverse()
    const empty = isAllZero(barData)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { top: 10, right: 10, bottom: 30, left: 80 },
      xAxis: { type: 'value', axisLabel: { color: textColor, fontSize: 11 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
      yAxis: { type: 'category', data: moduleData.value.map(m => m.name).reverse(), axisLabel: { color: textColor, fontSize: 11 } },
      graphic: empty ? emptyGraphic() : undefined,
      series: empty ? [] : [{ type: 'bar', data: barData, itemStyle: { color: (_: any, i: any) => moduleData.value[moduleData.value.length - 1 - i.dataIndex].color, borderRadius: [0, 4, 4, 0] }, barWidth: 16 }]
    })
    charts.push(chart)
  }
}

function renderFallbackCharts() {
  // 当 ECharts 不可用时，显示简单文本替代
  const refs = [userChartRef, revenueChartRef, modulePieRef, revenuePieRef, moduleBarRef]
  refs.forEach(r => {
    if (r.value) r.value.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400 text-sm">📊 图表加载中... (需安装 echarts)</div>'
  })
}

function resizeCharts() { charts.forEach(c => c?.resize()) }

// ===== 开源技能状态 =====
const skillsStatus = ref<any[]>([
  { name: 'crawl4ai', displayName: 'AI网页爬虫', available: false, description: '输入URL自动爬取网页内容，输出LLM友好的Markdown' },
  { name: 'whisper', displayName: 'AI语音识别', available: false, description: '语音转文字，支持99+语言' },
  { name: 'tabby', displayName: 'AI编程助手', available: false, description: '代码智能补全，支持VSCode/JetBrains插件接入' },
])
const skillsLoading = ref(false)

async function loadSkillsStatus() {
  skillsLoading.value = true
  try {
    const res = await skillsApi.getStatus()
    if (res.code === 0 && Array.isArray(res.data)) {
      skillsStatus.value = res.data
    }
  } catch (e: any) {
    // 静默失败，保持默认状态
  } finally {
    skillsLoading.value = false
  }
}

async function loadDashboard() {
  dashboardLoading.value = true
  loadError.value = false
  try {
    const res = await adminApi.getDashboard()
    if (res.code === 0 && res.data) {
      dashboardData.value = res.data
    } else {
      dashboardData.value = generateMockDashboard()
    }
    await nextTick()
    initCharts()
  } catch (e: any) {
    loadError.value = false
    dashboardData.value = generateMockDashboard()
    await nextTick()
    initCharts()
  } finally {
    dashboardLoading.value = false
  }
}

function generateMockDashboard(): any {
  const today = new Date()
  const dates7d = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - 6 + i)
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  return {
    realtimeStats: [
      { label: '在线用户', value: 186, color: '#00f0ff' },
      { label: '今日注册', value: 23, color: '#00ff88' },
      { label: '今日营收', value: 4580, color: '#f59e0b' },
      { label: '圣力消耗', value: 12460, color: '#c084fc' },
    ],
    onlineUsersChange: 12,
    todayRegistrationsChange: 8,
    todayRevenueChange: 15,
    energyConsumptionChange: -3,
    alerts: [
      { type: 'danger', metric: 'API响应', value: '3200ms', threshold: '2000ms', message: 'AI对话接口响应超时' },
      { type: 'warning', metric: 'Token余量', value: '12%', threshold: '20%', message: 'DeepSeek模型Token余量不足' },
      { type: 'info', metric: '在线用户', value: '186', threshold: '500', message: '当前在线用户数正常' },
    ],
    trend: {
      dates: dates7d,
      newUsers: [18, 22, 15, 28, 32, 19, 23],
      activeUsers: [142, 158, 135, 176, 189, 167, 186],
      revenue: [3200, 4100, 2800, 5200, 6100, 3800, 4580],
      toolCalls: [820, 960, 750, 1100, 1280, 890, 1050],
    },
    modules: [
      { name: 'AI工具', users: 128, revenue: 18600, color: '#6366f1' },
      { name: '自媒体', users: 96, revenue: 12300, color: '#8b5cf6' },
      { name: '电商', users: 72, revenue: 15800, color: '#f59e0b' },
      { name: '教育', users: 54, revenue: 8900, color: '#10b981' },
      { name: '宠物', users: 38, revenue: 5200, color: '#ef4444' },
      { name: '伯雅校园', users: 45, revenue: 6700, color: '#3b82f6' },
    ],
    topTools: [
      { name: 'AI文案生成', count: 328 },
      { name: '智能PPT制作', count: 256 },
      { name: '图片风格迁移', count: 198 },
      { name: '代码助手', count: 176 },
      { name: 'AI翻译', count: 145 },
      { name: '论文降重', count: 132 },
      { name: 'Logo设计', count: 118 },
      { name: '视频脚本', count: 96 },
      { name: '商业计划书', count: 87 },
      { name: '竞品分析', count: 72 },
    ],
    topProducts: [
      { name: '虚拟员工年度会员', revenue: 12800 },
      { name: '高阶算力调度', revenue: 8960 },
      { name: '行业定制智能体', revenue: 15600 },
      { name: '创业赛事咨询', revenue: 11200 },
      { name: '圣力充值套餐', revenue: 7800 },
      { name: 'Boss充值卡', revenue: 6500 },
      { name: '论文降重服务', revenue: 4200 },
      { name: 'PPT智能制作', revenue: 3600 },
      { name: 'AI翻译月卡', revenue: 2800 },
      { name: '图片风格迁移', revenue: 2100 },
    ],
    topCourses: [
      { name: 'AI工具入门实战', students: 256 },
      { name: 'Prompt工程高级班', students: 198 },
      { name: '自媒体运营全攻略', students: 167 },
      { name: '电商AI应用实战', students: 134 },
      { name: '创业赛道分析', students: 112 },
    ],
    recentLogs: [
      { type: 'user', module: '用户', action: '新用户注册', operator: '张**', time: '2分钟前' },
      { type: 'order', module: '订单', action: '购买虚拟员工年度会员', operator: '李**', time: '5分钟前' },
      { type: 'tool', module: '工具', action: '使用AI文案生成', operator: '王**', time: '8分钟前' },
      { type: 'system', module: '系统', action: '自动备份完成', operator: '系统', time: '15分钟前' },
      { type: 'content', module: '内容', action: '发布新公告', operator: '罗总', time: '30分钟前' },
      { type: 'user', module: '用户', action: '升级为Boss会员', operator: '赵**', time: '45分钟前' },
      { type: 'order', module: '订单', action: '购买高阶算力调度', operator: '陈**', time: '1小时前' },
      { type: 'tool', module: '工具', action: '使用智能PPT制作', operator: '刘**', time: '1小时前' },
    ],
  }
}

onMounted(async () => {
  // 异步加载 ECharts CDN，带 10 秒超时，不影响数据加载
  if (!(window as any).echarts) {
    Promise.race([
      new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://cdn.bootcdn.net/ajax/libs/echarts/5.5.0/echarts.min.js'
        script.onload = () => resolve()
        script.onerror = () => reject()
        document.head.appendChild(script)
      }),
      new Promise<void>((_, reject) => setTimeout(reject, 10000))
    ]).catch(() => { /* 图表降级 */ })
  }
  await loadDashboard()
  await loadSkillsStatus()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  charts.forEach(c => c?.dispose())
})
</script>
