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
      <div v-for="stat in realtimeStats" :key="stat.label" class="bg-white dark:bg-dark-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6" :class="stat.bgClass"></div>
        <div class="flex items-center justify-between relative">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ stat.value }}</p>
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
      <div class="bg-white dark:bg-dark-100 rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-gray-900 dark:text-white">📈 用户增长趋势</h3>
          <div class="flex gap-1">
            <button v-for="r in ['7d','30d']" :key="r" @click="trendRange = r" class="px-3 py-1 rounded text-xs" :class="trendRange === r ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-300 text-gray-500'">{{ r === '7d' ? '近7天' : '近30天' }}</button>
          </div>
        </div>
        <div ref="userChartRef" class="h-64"></div>
      </div>
      <!-- 营收趋势 -->
      <div class="bg-white dark:bg-dark-100 rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-gray-900 dark:text-white">💰 营收趋势</h3>
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
      <div class="bg-white dark:bg-dark-100 rounded-xl p-5 shadow-sm">
        <h3 class="font-bold text-gray-900 dark:text-white mb-4">🧩 模块用户分布</h3>
        <div ref="modulePieRef" class="h-56"></div>
      </div>
      <!-- 营收贡献饼图 -->
      <div class="bg-white dark:bg-dark-100 rounded-xl p-5 shadow-sm">
        <h3 class="font-bold text-gray-900 dark:text-white mb-4">💎 营收贡献分布</h3>
        <div ref="revenuePieRef" class="h-56"></div>
      </div>
      <!-- 各模块使用量对比 -->
      <div class="bg-white dark:bg-dark-100 rounded-xl p-5 shadow-sm">
        <h3 class="font-bold text-gray-900 dark:text-white mb-4">📊 模块使用量对比</h3>
        <div ref="moduleBarRef" class="h-56"></div>
      </div>
    </div>

    <!-- 热门排行 -->
    <div class="grid lg:grid-cols-3 gap-6 mb-6">
      <!-- Top10 AI工具 -->
      <div class="bg-white dark:bg-dark-100 rounded-xl p-5 shadow-sm">
        <h3 class="font-bold text-gray-900 dark:text-white mb-4">🤖 Top10 AI工具</h3>
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
      <div class="bg-white dark:bg-dark-100 rounded-xl p-5 shadow-sm">
        <h3 class="font-bold text-gray-900 dark:text-white mb-4">🛒 Top10 热销商品</h3>
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
      <div class="bg-white dark:bg-dark-100 rounded-xl p-5 shadow-sm">
        <h3 class="font-bold text-gray-900 dark:text-white mb-4">📚 Top10 热门课程</h3>
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

    <!-- 系统日志 -->
    <div class="bg-white dark:bg-dark-100 rounded-xl p-5 shadow-sm">
      <h3 class="font-bold text-gray-900 dark:text-white mb-4">📋 最近操作日志</h3>
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
import { adminApi } from '@/api'
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
    { label: '圣点消耗', value: 0, color: '#c084fc' },
  ]
  const changeMap: Record<string, number> = {
    '在线用户': d?.onlineUsersChange || 0,
    '今日注册': d?.todayRegistrationsChange || 0,
    '今日营收': d?.todayRevenueChange || 0,
    '圣点消耗': d?.energyConsumptionChange || 0,
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

async function loadDashboard() {
  dashboardLoading.value = true
  loadError.value = false
  try {
    const res = await adminApi.getDashboard()
    if (res.code === 0 && res.data) {
      dashboardData.value = res.data
      await nextTick()
      initCharts()
    } else {
      ElMessage.error(res.message || '加载看板数据失败')
    }
  } catch (e: any) {
    loadError.value = true
    ElMessage.error(e?.message || '加载看板数据失败')
  } finally {
    dashboardLoading.value = false
  }
}

onMounted(async () => {
  // 异步加载 ECharts CDN，带 3 秒超时，不影响数据加载
  if (!(window as any).echarts) {
    Promise.race([
      new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js'
        script.onload = () => resolve()
        script.onerror = () => reject()
        document.head.appendChild(script)
      }),
      new Promise<void>((_, reject) => setTimeout(reject, 3000))
    ]).catch(() => { /* 图表降级 */ })
  }
  await loadDashboard()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  charts.forEach(c => c?.dispose())
})
</script>
