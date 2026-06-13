<template>
  <div>
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

// ===== 实时数据 =====
const realtimeStats = ref([
  { icon: '👥', label: '在线用户', value: '3,256', change: 12.5, bgClass: 'bg-blue-500', iconBg: 'bg-blue-100' },
  { icon: '📝', label: '今日注册', value: '234', change: 8.3, bgClass: 'bg-green-500', iconBg: 'bg-green-100' },
  { icon: '💰', label: '今日营收', value: '¥18,900', change: 15.2, bgClass: 'bg-amber-500', iconBg: 'bg-amber-100' },
  { icon: '⚡', label: '圣点消耗', value: '45,600', change: -3.1, bgClass: 'bg-purple-500', iconBg: 'bg-purple-100' },
])

// ===== 预警 =====
const alerts = ref([
  { type: 'warning' as const, metric: 'API错误率', value: '2.3%', threshold: '<2%', message: 'AI工具调用接口错误率偏高' },
  { type: 'danger' as const, metric: '支付失败率', value: '5.1%', threshold: '<3%', message: '微信支付通道异常，请关注' },
])

function alertClass(type: string) {
  return { warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800', danger: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800', info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800' }[type] || ''
}

// ===== 趋势数据 =====
const trendRange = ref('7d')
const revenueRange = ref('7d')

const trendData = {
  '7d': {
    dates: ['07-12', '07-13', '07-14', '07-15', '07-16', '07-17', '07-18'],
    newUsers: [145, 278, 312, 187, 256, 198, 234],
    activeUsers: [4890, 5950, 6100, 5210, 5890, 5430, 5620],
    revenue: [12300, 22100, 25600, 15200, 21300, 16500, 18900],
  },
  '30d': {
    dates: Array.from({ length: 30 }, (_, i) => `06-${String(i + 19 > 30 ? i - 11 : i + 19).padStart(2, '0')}`),
    newUsers: Array.from({ length: 30 }, () => Math.floor(Math.random() * 200 + 100)),
    activeUsers: Array.from({ length: 30 }, () => Math.floor(Math.random() * 2000 + 4000)),
    revenue: Array.from({ length: 30 }, () => Math.floor(Math.random() * 15000 + 10000)),
  }
}

// ===== 模块数据 =====
const moduleData = [
  { name: 'AI工具', users: 12500, revenue: 156000, color: '#6366f1' },
  { name: '自媒体', users: 8200, revenue: 89000, color: '#8b5cf6' },
  { name: '电商', users: 6800, revenue: 234000, color: '#f59e0b' },
  { name: '教育', users: 5400, revenue: 125000, color: '#10b981' },
  { name: '宠物', users: 3200, revenue: 45000, color: '#ef4444' },
  { name: '伯雅校园', users: 4100, revenue: 67000, color: '#3b82f6' },
]

// ===== 排行榜 =====
const toolRanking = [
  { name: 'AI智能写作助手', count: 28560 }, { name: 'AI国画生成器', count: 22340 },
  { name: 'AI视频脚本生成', count: 18900 }, { name: 'AI代码补全', count: 16780 },
  { name: 'AI数据分析', count: 14500 }, { name: 'AI翻译大师', count: 12300 },
  { name: 'AI PPT生成', count: 10890 }, { name: 'AI客服机器人', count: 9650 },
  { name: 'AI音乐创作', count: 8420 }, { name: 'AILogo设计', count: 7210 },
]
const productRanking = [
  { name: '手工陶瓷茶杯套装', revenue: 45600 }, { name: '有机绿茶礼盒', revenue: 38900 },
  { name: '智能台灯Pro', revenue: 34200 }, { name: '纯棉四件套', revenue: 28700 },
  { name: '蓝牙耳机X1', revenue: 25400 }, { name: '手冲咖啡套装', revenue: 22100 },
  { name: '真丝围巾', revenue: 19800 }, { name: '竹制收纳盒', revenue: 17500 },
  { name: '植物精油套装', revenue: 15200 }, { name: '文创笔记本', revenue: 12900 },
]
const courseRanking = [
  { name: 'Python从入门到精通', students: 3456 }, { name: '电商运营实战课', students: 2890 },
  { name: 'AI绘画零基础教程', students: 2560 }, { name: '短视频剪辑大师', students: 2340 },
  { name: '自媒体写作变现', students: 2100 }, { name: '前端开发全栈', students: 1890 },
  { name: '宠物养护指南', students: 1650 }, { name: '英语口语突破', students: 1420 },
  { name: '数据分析入门', students: 1230 }, { name: '创业基础课', students: 980 },
]

const maxToolCount = computed(() => Math.max(...toolRanking.map(r => r.count)))

// ===== 日志 =====
const recentLogs = [
  { id: 1, type: 'user', module: '用户管理', action: '冻结异常用户 user_1234', operator: '管理员', time: '14:30' },
  { id: 2, type: 'order', module: '订单管理', action: '处理退款申请 TK20250718003', operator: '客服小王', time: '14:15' },
  { id: 3, type: 'tool', module: '工具管理', action: '上线新工具 "AI思维导图"', operator: '管理员', time: '13:50' },
  { id: 4, type: 'content', module: '内容审核', action: '审核通过课程内容 5 条', operator: '审核员小李', time: '13:20' },
  { id: 5, type: 'system', module: '系统', action: '自动备份完成，数据量 2.3GB', operator: '系统', time: '12:00' },
  { id: 6, type: 'order', module: '订单管理', action: '异常支付告警 - 微信支付通道', operator: '系统', time: '11:45' },
]

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

function initCharts() {
  // 检查 echarts 是否可用
  const echarts = (window as any).echarts
  if (!echarts) {
    // 降级为纯 CSS 展示
    renderFallbackCharts()
    return
  }

  const textColor = document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'

  // 用户增长曲线
  if (userChartRef.value) {
    const chart = echarts.init(userChartRef.value)
    const d = trendData[trendRange.value as keyof typeof trendData]
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { top: 20, right: 20, bottom: 30, left: 50 },
      xAxis: { type: 'category', data: d.dates, axisLabel: { color: textColor, fontSize: 11 }, axisLine: { lineStyle: { color: '#e5e7eb' } } },
      yAxis: { type: 'value', axisLabel: { color: textColor, fontSize: 11 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
      series: [
        { name: '新增用户', type: 'line', smooth: true, data: d.newUsers, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(99,102,241,0.3)' }, { offset: 1, color: 'rgba(99,102,241,0.02)' }] } }, lineStyle: { color: '#6366f1' }, itemStyle: { color: '#6366f1' } },
        { name: '活跃用户', type: 'line', smooth: true, data: d.activeUsers.map(v => v / 10), areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16,185,129,0.3)' }, { offset: 1, color: 'rgba(16,185,129,0.02)' }] } }, lineStyle: { color: '#10b981' }, itemStyle: { color: '#10b981' } },
      ]
    })
    charts.push(chart)
  }

  // 营收趋势
  if (revenueChartRef.value) {
    const chart = echarts.init(revenueChartRef.value)
    const d = trendData[revenueRange.value as keyof typeof trendData]
    chart.setOption({
      tooltip: { trigger: 'axis', formatter: '{b}<br/>营收: ¥{c}' },
      grid: { top: 20, right: 20, bottom: 30, left: 60 },
      xAxis: { type: 'category', data: d.dates, axisLabel: { color: textColor, fontSize: 11 }, axisLine: { lineStyle: { color: '#e5e7eb' } } },
      yAxis: { type: 'value', axisLabel: { color: textColor, fontSize: 11, formatter: (v: number) => v >= 1000 ? (v / 1000) + 'k' : v }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
      series: [{ name: '营收', type: 'bar', data: d.revenue, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#f59e0b' }, { offset: 1, color: '#fbbf24' }] }, borderRadius: [4, 4, 0, 0] } }]
    })
    charts.push(chart)
  }

  // 模块用户分布饼图
  if (modulePieRef.value) {
    const chart = echarts.init(modulePieRef.value)
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
      series: [{ type: 'pie', radius: ['40%', '70%'], data: moduleData.map(m => ({ name: m.name, value: m.users, itemStyle: { color: m.color } })), label: { color: textColor, fontSize: 11 }, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } } }]
    })
    charts.push(chart)
  }

  // 营收贡献饼图
  if (revenuePieRef.value) {
    const chart = echarts.init(revenuePieRef.value)
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
      series: [{ type: 'pie', radius: ['40%', '70%'], data: moduleData.map(m => ({ name: m.name, value: m.revenue, itemStyle: { color: m.color } })), label: { color: textColor, fontSize: 11 }, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } } }]
    })
    charts.push(chart)
  }

  // 模块使用量柱状图
  if (moduleBarRef.value) {
    const chart = echarts.init(moduleBarRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { top: 10, right: 10, bottom: 30, left: 80 },
      xAxis: { type: 'value', axisLabel: { color: textColor, fontSize: 11 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
      yAxis: { type: 'category', data: moduleData.map(m => m.name).reverse(), axisLabel: { color: textColor, fontSize: 11 } },
      series: [{ type: 'bar', data: moduleData.map(m => m.users).reverse(), itemStyle: { color: (_: any, i: any) => moduleData[moduleData.length - 1 - i.dataIndex].color, borderRadius: [0, 4, 4, 0] }, barWidth: 16 }]
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

onMounted(async () => {
  // 尝试动态加载 ECharts
  if (!(window as any).echarts) {
    try {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js'
        script.onload = () => resolve()
        script.onerror = () => reject()
        document.head.appendChild(script)
      })
    } catch { /* ECharts 不可用，使用降级 */ }
  }
  await nextTick()
  initCharts()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  charts.forEach(c => c?.dispose())
})
</script>
