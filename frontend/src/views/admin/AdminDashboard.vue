<template>
  <div>
    <!-- 实时数据概览 -->
    <div class="cyber-grid-stats mb-6">
      <div v-for="stat in realtimeStats" :key="stat.label" class="cyber-card cyber-stat-card">
        <div class="stat-glow" :style="{ background: stat.glowColor }"></div>
        <div class="stat-content">
          <div>
            <p class="stat-label">{{ stat.label }}</p>
            <p class="stat-value" :style="{ color: stat.valueColor, textShadow: `0 0 20px ${stat.valueColor}40` }">{{ stat.value }}</p>
            <p class="stat-change" :class="stat.change >= 0 ? 'change-up' : 'change-down'">
              {{ stat.change >= 0 ? '↑' : '↓' }} {{ Math.abs(stat.change) }}%
            </p>
          </div>
          <div class="stat-icon" :style="{ boxShadow: `0 0 20px ${stat.valueColor}30` }">{{ stat.icon }}</div>
        </div>
      </div>
    </div>

    <!-- 预警指标 -->
    <div v-if="alerts.length > 0" class="mb-6 space-y-2">
      <div v-for="(alert, idx) in alerts" :key="idx" class="cyber-alert" :class="'alert-' + alert.type">
        <span class="alert-icon">{{ alert.type === 'danger' ? '🔴' : alert.type === 'warning' ? '🟡' : '🔵' }}</span>
        <span class="alert-metric">{{ alert.metric }}</span>
        <span class="alert-detail">当前: {{ alert.value }}</span>
        <span class="alert-sep alert-sep-mobile-hide">|</span>
        <span class="alert-detail alert-detail-mobile-hide">阈值: {{ alert.threshold }}</span>
        <span class="alert-msg alert-msg-mobile-hide">{{ alert.message }}</span>
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
        <div ref="userChartRef" class="chart-container"></div>
      </div>
      <div class="cyber-card">
        <div class="card-header">
          <h3 class="card-title">💰 营收趋势</h3>
          <div class="range-btns">
            <button v-for="r in ['7d','30d']" :key="r" @click="revenueRange = r" class="cyber-btn-sm" :class="{ 'cyber-btn-active': revenueRange === r }">{{ r === '7d' ? '近7天' : '近30天' }}</button>
          </div>
        </div>
        <div ref="revenueChartRef" class="chart-container"></div>
      </div>
    </div>

    <!-- 模块分布 & 热门排行 -->
    <div class="cyber-grid-pies mb-6">
      <div class="cyber-card">
        <h3 class="card-title mb-4">🧩 模块用户分布</h3>
        <div ref="modulePieRef" class="chart-container-sm"></div>
      </div>
      <div class="cyber-card">
        <h3 class="card-title mb-4">💎 营收贡献分布</h3>
        <div ref="revenuePieRef" class="chart-container-sm"></div>
      </div>
      <div class="cyber-card">
        <h3 class="card-title mb-4">📊 模块使用量对比</h3>
        <div ref="moduleBarRef" class="chart-container-sm"></div>
      </div>
    </div>

    <!-- 热门排行 -->
    <div class="cyber-grid-rankings mb-6">
      <div class="cyber-card">
        <h3 class="card-title mb-4">🤖 Top10 AI工具</h3>
        <div v-if="toolRanking.length > 0" class="ranking-list">
          <div v-for="(item, index) in toolRanking" :key="item.name" class="ranking-item">
            <span class="rank-badge" :class="index < 3 ? 'rank-top' : ''">{{ index + 1 }}</span>
            <span class="rank-name">{{ item.name }}</span>
            <div class="rank-bar">
              <div class="rank-bar-fill" :style="{ width: (item.count / maxToolCount * 100) + '%' }"></div>
            </div>
            <span class="rank-value">{{ formatNum(item.count) }}</span>
          </div>
        </div>
        <div v-else class="empty-data">暂无工具使用数据</div>
      </div>
      <div class="cyber-card">
        <h3 class="card-title mb-4">💳 最近订单</h3>
        <div v-if="recentLogs.length > 0" class="ranking-list">
          <div v-for="(item, index) in recentLogs.slice(0, 5)" :key="item.id" class="ranking-item">
            <span class="rank-badge" :class="index < 3 ? 'rank-top' : ''">{{ index + 1 }}</span>
            <span class="rank-name">{{ item.action }}</span>
            <span class="rank-value text-cyan-400">{{ item.time }}</span>
          </div>
        </div>
        <div v-else class="empty-data">暂无订单数据</div>
      </div>
      <div class="cyber-card">
        <h3 class="card-title mb-4">📊 系统概况</h3>
        <div class="ranking-list">
          <div class="ranking-item">
            <span class="rank-name">👥 总用户数</span>
            <span class="rank-value text-cyan-400">{{ realtimeStats[0].value }}</span>
          </div>
          <div class="ranking-item">
            <span class="rank-name">📝 今日访客</span>
            <span class="rank-value text-green-400">{{ realtimeStats[1].value }}</span>
          </div>
          <div class="ranking-item">
            <span class="rank-name">💰 订单总数</span>
            <span class="rank-value" style="color: #f59e0b;">{{ realtimeStats[2].value }}</span>
          </div>
          <div class="ranking-item">
            <span class="rank-name">🤖 AI工具数</span>
            <span class="rank-value" style="color: #c084fc;">{{ realtimeStats[3].value }}</span>
          </div>
          <div class="ranking-item">
            <span class="rank-name">🔄 数据更新</span>
            <span class="rank-value text-cyan-400">{{ lastUpdateTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统日志 -->
    <div class="cyber-card">
      <h3 class="card-title mb-4">📋 最近操作日志</h3>
      <div v-if="recentLogs.length > 0" class="log-list">
        <div v-for="log in recentLogs" :key="log.id" class="log-item">
          <span class="log-tag" :class="'log-tag-' + log.type">{{ log.module }}</span>
          <span class="log-action">{{ log.action }}</span>
          <span class="log-operator log-operator-mobile-hide">{{ log.operator }}</span>
          <span class="log-time">{{ log.time }}</span>
        </div>
      </div>
      <div v-else class="empty-data">暂无操作日志</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { adminApi, visitorApi } from '@/api'

// ===== 实时数据（从API获取） =====
const realtimeStats = ref([
  { icon: '👥', label: '总用户数', value: '--', change: 0, valueColor: '#00f0ff', glowColor: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)' },
  { icon: '📝', label: '今日访客', value: '--', change: 0, valueColor: '#00ff88', glowColor: 'radial-gradient(circle, rgba(0,255,136,0.15) 0%, transparent 70%)' },
  { icon: '💰', label: '订单总数', value: '--', change: 0, valueColor: '#f59e0b', glowColor: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)' },
  { icon: '🤖', label: 'AI工具数', value: '--', change: 0, valueColor: '#c084fc', glowColor: 'radial-gradient(circle, rgba(192,132,252,0.15) 0%, transparent 70%)' },
])

// ===== 预警 =====
const alerts = ref<{ type: 'warning' | 'danger' | 'info'; metric: string; value: string; threshold: string; message: string }[]>([])

// ===== 趋势数据 =====
const trendRange = ref('7d')
const revenueRange = ref('7d')

const trendData = ref<Record<string, any>>({
  '7d': { dates: [], newUsers: [], activeUsers: [], revenue: [] },
  '30d': { dates: [], newUsers: [], activeUsers: [], revenue: [] },
})

// ===== 模块数据 =====
const moduleData = ref<{ name: string; users: number; revenue: number; color: string }[]>([])

// ===== 排行榜 =====
const toolRanking = ref<{ name: string; count: number }[]>([])

const maxToolCount = computed(() => {
  if (toolRanking.value.length === 0) return 1
  return Math.max(...toolRanking.value.map(r => r.count))
})

const lastUpdateTime = computed(() => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
})

// ===== 日志 =====
const recentLogs = ref<{ id: number; type: string; module: string; action: string; operator: string; time: string }[]>([])

// ===== 数据加载状态 =====
const dataLoading = ref(true)

function formatNum(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

// ===== 从API加载真实数据 =====
async function loadDashboardData() {
  dataLoading.value = true
  try {
    // 并行请求所有数据
    const [usersRes, ordersRes, toolsRes, visitorStatsRes, logsRes, reportsRes] = await Promise.allSettled([
      adminApi.getUsers({ page: 1, pageSize: 1 }),
      adminApi.getOrders({ page: 1, pageSize: 1 }),
      adminApi.getAdminTools({ page: 1, pageSize: 100 }),
      visitorApi.getStats(),
      adminApi.getSystemLogs({ page: 1, pageSize: 10 }),
      adminApi.getDataReports('7d'),
    ])

    // 1. 用户统计
    if (usersRes.status === 'fulfilled') {
      const usersData = usersRes.value.data?.data || usersRes.value.data
      const totalUsers = usersData?.total || 0
      realtimeStats.value[0].value = formatNum(totalUsers)
    }

    // 2. 访客统计
    if (visitorStatsRes.status === 'fulfilled') {
      const vData = visitorStatsRes.value.data?.data || visitorStatsRes.value.data
      const todayVisitors = vData?.todayVisitors || 0
      realtimeStats.value[1].value = formatNum(todayVisitors)
    }

    // 3. 订单统计
    if (ordersRes.status === 'fulfilled') {
      const ordersData = ordersRes.value.data?.data || ordersRes.value.data
      const totalOrders = ordersData?.total || 0
      realtimeStats.value[2].value = formatNum(totalOrders)
    }

    // 4. AI工具统计
    if (toolsRes.status === 'fulfilled') {
      const toolsData = toolsRes.value.data?.data || toolsRes.value.data
      const totalTools = toolsData?.total || 0
      realtimeStats.value[3].value = formatNum(totalTools)

      // 工具排行（按使用次数排序）
      const items = toolsData?.items || []
      toolRanking.value = items
        .sort((a: any, b: any) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, 10)
        .map((t: any) => ({ name: t.name || t.toolName || '未命名工具', count: t.usageCount || 0 }))
    }

    // 5. 系统日志
    if (logsRes.status === 'fulfilled') {
      const logsData = logsRes.value.data?.data || logsRes.value.data
      const items = logsData?.items || logsData || []
      recentLogs.value = (Array.isArray(items) ? items : []).slice(0, 8).map((log: any, idx: number) => ({
        id: log.id || idx + 1,
        type: log.type || log.module || 'system',
        module: log.module || '系统',
        action: log.action || log.description || log.message || '操作记录',
        operator: log.operator || log.userName || '系统',
        time: log.time || log.createdAt || new Date().toLocaleTimeString(),
      }))
    }

    // 6. 报表数据（趋势图）
    if (reportsRes.status === 'fulfilled') {
      const reportsData = reportsRes.value.data?.data || reportsRes.value.data
      if (Array.isArray(reportsData) && reportsData.length > 0) {
        const dates = reportsData.map((r: any) => r.date || r.day || '')
        const newUsers = reportsData.map((r: any) => r.newUsers || r.users || 0)
        const revenue = reportsData.map((r: any) => r.revenue || r.amount || 0)
        trendData.value['7d'] = { dates, newUsers, activeUsers: newUsers, revenue }
      }
    }

    // 生成预警（基于真实数据）
    generateAlerts()

  } catch (e) {
    console.error('加载仪表盘数据失败', e)
  } finally {
    dataLoading.value = false
  }
}

function generateAlerts() {
  const newAlerts: typeof alerts.value = []
  // 如果工具数为0，提示
  if (realtimeStats.value[3].value === '0') {
    newAlerts.push({ type: 'warning', metric: 'AI工具', value: '0', threshold: '>0', message: '暂无AI工具，请添加' })
  }
  // 如果用户数为0，提示
  if (realtimeStats.value[0].value === '0') {
    newAlerts.push({ type: 'info', metric: '用户', value: '0', threshold: '>0', message: '暂无注册用户' })
  }
  alerts.value = newAlerts
}

// 切换趋势范围时重新加载
watch([trendRange, revenueRange], () => {
  initCharts()
})

// ===== ECharts =====
const userChartRef = ref<HTMLElement>()
const revenueChartRef = ref<HTMLElement>()
const modulePieRef = ref<HTMLElement>()
const revenuePieRef = ref<HTMLElement>()
const moduleBarRef = ref<HTMLElement>()

let charts: any[] = []
let refreshTimer: ReturnType<typeof setInterval> | null = null

function initCharts() {
  const echarts = (window as any).echarts
  if (!echarts) {
    renderFallbackCharts()
    return
  }

  // Dispose old charts
  charts.forEach(c => c?.dispose())
  charts = []

  const textColor = '#6a6a8a'
  const gridColor = 'rgba(26, 26, 46, 0.8)'

  // 用户增长曲线
  if (userChartRef.value) {
    const chart = echarts.init(userChartRef.value)
    const d = trendData.value[trendRange.value] || { dates: [], newUsers: [], activeUsers: [], revenue: [] }
    if (d.dates.length > 0) {
      chart.setOption({
        tooltip: { trigger: 'axis', backgroundColor: '#12121f', borderColor: '#1a1a2e', textStyle: { color: '#a0a0cc' } },
        grid: { top: 20, right: 20, bottom: 30, left: 50 },
        xAxis: { type: 'category', data: d.dates, axisLabel: { color: textColor, fontSize: 11 }, axisLine: { lineStyle: { color: gridColor } } },
        yAxis: { type: 'value', axisLabel: { color: textColor, fontSize: 11 }, splitLine: { lineStyle: { color: gridColor } } },
        series: [
          { name: '新增用户', type: 'line', smooth: true, data: d.newUsers, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,240,255,0.25)' }, { offset: 1, color: 'rgba(0,240,255,0.02)' }] } }, lineStyle: { color: '#00f0ff', width: 2 }, itemStyle: { color: '#00f0ff' } },
          { name: '活跃用户', type: 'line', smooth: true, data: (d.activeUsers || d.newUsers).map((v: number) => v), areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,255,136,0.2)' }, { offset: 1, color: 'rgba(0,255,136,0.02)' }] } }, lineStyle: { color: '#00ff88', width: 2 }, itemStyle: { color: '#00ff88' } },
        ]
      })
    } else {
      chart.setOption({ title: { text: '暂无数据', left: 'center', top: 'center', textStyle: { color: '#4a4a6a', fontSize: 14 } } })
    }
    charts.push(chart)
  }

  // 营收趋势
  if (revenueChartRef.value) {
    const chart = echarts.init(revenueChartRef.value)
    const d = trendData.value[revenueRange.value] || { dates: [], revenue: [] }
    if (d.dates.length > 0) {
      chart.setOption({
        tooltip: { trigger: 'axis', formatter: '{b}<br/>营收: ¥{c}', backgroundColor: '#12121f', borderColor: '#1a1a2e', textStyle: { color: '#a0a0cc' } },
        grid: { top: 20, right: 20, bottom: 30, left: 60 },
        xAxis: { type: 'category', data: d.dates, axisLabel: { color: textColor, fontSize: 11 }, axisLine: { lineStyle: { color: gridColor } } },
        yAxis: { type: 'value', axisLabel: { color: textColor, fontSize: 11, formatter: (v: number) => v >= 1000 ? (v / 1000) + 'k' : v }, splitLine: { lineStyle: { color: gridColor } } },
        series: [{ name: '营收', type: 'bar', data: d.revenue, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#f59e0b' }, { offset: 1, color: '#f59e0b44' }] }, borderRadius: [4, 4, 0, 0] } }]
      })
    } else {
      chart.setOption({ title: { text: '暂无数据', left: 'center', top: 'center', textStyle: { color: '#4a4a6a', fontSize: 14 } } })
    }
    charts.push(chart)
  }

  // 模块用户分布饼图
  if (modulePieRef.value) {
    const chart = echarts.init(modulePieRef.value)
    if (moduleData.value.length > 0) {
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)', backgroundColor: '#12121f', borderColor: '#1a1a2e', textStyle: { color: '#a0a0cc' } },
        series: [{ type: 'pie', radius: ['40%', '70%'], data: moduleData.value.map(m => ({ name: m.name, value: m.users, itemStyle: { color: m.color } })), label: { color: '#8888aa', fontSize: 11 }, emphasis: { itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,240,255,0.3)' } } }]
      })
    } else {
      chart.setOption({ title: { text: '暂无数据', left: 'center', top: 'center', textStyle: { color: '#4a4a6a', fontSize: 14 } } })
    }
    charts.push(chart)
  }

  // 营收贡献饼图
  if (revenuePieRef.value) {
    const chart = echarts.init(revenuePieRef.value)
    if (moduleData.value.length > 0) {
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)', backgroundColor: '#12121f', borderColor: '#1a1a2e', textStyle: { color: '#a0a0cc' } },
        series: [{ type: 'pie', radius: ['40%', '70%'], data: moduleData.value.map(m => ({ name: m.name, value: m.revenue, itemStyle: { color: m.color } })), label: { color: '#8888aa', fontSize: 11 }, emphasis: { itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,240,255,0.3)' } } }]
      })
    } else {
      chart.setOption({ title: { text: '暂无数据', left: 'center', top: 'center', textStyle: { color: '#4a4a6a', fontSize: 14 } } })
    }
    charts.push(chart)
  }

  // 模块使用量柱状图
  if (moduleBarRef.value) {
    const chart = echarts.init(moduleBarRef.value)
    if (moduleData.value.length > 0) {
      chart.setOption({
        tooltip: { trigger: 'axis', backgroundColor: '#12121f', borderColor: '#1a1a2e', textStyle: { color: '#a0a0cc' } },
        grid: { top: 10, right: 10, bottom: 30, left: 80 },
        xAxis: { type: 'value', axisLabel: { color: textColor, fontSize: 11 }, splitLine: { lineStyle: { color: gridColor } } },
        yAxis: { type: 'category', data: moduleData.value.map(m => m.name).reverse(), axisLabel: { color: textColor, fontSize: 11 } },
        series: [{ type: 'bar', data: moduleData.value.map(m => m.users).reverse(), itemStyle: { color: (_: any, i: any) => moduleData.value[moduleData.value.length - 1 - i.dataIndex].color, borderRadius: [0, 4, 4, 0] }, barWidth: 16 }]
      })
    } else {
      chart.setOption({ title: { text: '暂无数据', left: 'center', top: 'center', textStyle: { color: '#4a4a6a', fontSize: 14 } } })
    }
    charts.push(chart)
  }
}

function renderFallbackCharts() {
  const refs = [userChartRef, revenueChartRef, modulePieRef, revenuePieRef, moduleBarRef]
  refs.forEach(r => {
    if (r.value) r.value.innerHTML = '<div class="flex items-center justify-center h-full text-[#4a4a6a] text-sm">📊 图表加载中...</div>'
  })
}

function resizeCharts() { charts.forEach(c => c?.resize()) }

onMounted(async () => {
  // 加载ECharts
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
  // 加载真实数据
  await loadDashboardData()
  await nextTick()
  initCharts()
  window.addEventListener('resize', resizeCharts)
  // 每60秒自动刷新数据
  refreshTimer = setInterval(() => {
    loadDashboardData().then(() => nextTick(() => initCharts()))
  }, 60000)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  charts.forEach(c => c?.dispose())
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
/* ===== Responsive Grid: Stats (4 cols -> 2 cols mobile) ===== */
.cyber-grid-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 767px) {
  .cyber-grid-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
@media (min-width: 768px) and (max-width: 1199px) {
  .cyber-grid-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

/* ===== Responsive Grid: Charts (2 cols -> 1 col mobile) ===== */
.cyber-grid-charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
@media (max-width: 767px) {
  .cyber-grid-charts {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* ===== Responsive Grid: Pies (3 cols -> 1 col mobile) ===== */
.cyber-grid-pies {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 767px) {
  .cyber-grid-pies {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
@media (min-width: 768px) and (max-width: 1199px) {
  .cyber-grid-pies {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

/* ===== Responsive Grid: Rankings (3 cols -> 1 col mobile) ===== */
.cyber-grid-rankings {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 767px) {
  .cyber-grid-rankings {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
@media (min-width: 768px) and (max-width: 1199px) {
  .cyber-grid-rankings {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* ===== Chart containers ===== */
.chart-container {
  height: 256px;
}
.chart-container-sm {
  height: 224px;
}
@media (max-width: 767px) {
  .chart-container { height: 200px; }
  .chart-container-sm { height: 200px; }
}

/* ===== Card styles ===== */
.cyber-card {
  background: #12121f;
  border: 1px solid #1a1a2e;
  border-radius: 12px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}
@media (max-width: 767px) {
  .cyber-card {
    padding: 14px;
    border-radius: 10px;
  }
}

.cyber-card:hover {
  border-color: #2a2a4e;
}

/* Stat Cards */
.cyber-stat-card {
  padding: 0;
}

.stat-glow {
  position: absolute;
  top: -20px; right: -20px;
  width: 100px; height: 100px;
  border-radius: 50%;
  pointer-events: none;
}

.stat-content {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (max-width: 767px) {
  .stat-content {
    padding: 14px;
  }
}

.stat-label {
  font-size: 12px;
  color: #6a6a8a;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}
@media (max-width: 767px) {
  .stat-label { font-size: 11px; }
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  font-family: 'Courier New', monospace;
}
@media (max-width: 767px) {
  .stat-value { font-size: 20px; }
}

.stat-change {
  font-size: 11px;
  margin-top: 4px;
}
@media (max-width: 767px) {
  .stat-change { font-size: 10px; }
}

.change-up { color: #00ff88; }
.change-down { color: #ff4466; }

.stat-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
@media (max-width: 767px) {
  .stat-icon { width: 36px; height: 36px; font-size: 18px; border-radius: 8px; }
}

/* Alerts */
.cyber-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  border: 1px solid;
}
@media (max-width: 767px) {
  .cyber-alert { gap: 8px; padding: 10px 12px; font-size: 12px; flex-wrap: wrap; }
  .alert-sep-mobile-hide,
  .alert-detail-mobile-hide { display: none; }
  .alert-msg-mobile-hide { display: none; }
}

.alert-warning {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.alert-danger {
  background: rgba(255, 68, 102, 0.08);
  border-color: rgba(255, 68, 102, 0.2);
  color: #ff4466;
}

.alert-metric { font-weight: 600; }
.alert-detail { color: #6a6a8a; font-size: 12px; }
.alert-sep { color: #2a2a4e; }
.alert-msg { flex: 1; color: #8888aa; font-size: 12px; }

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  color: #e0e0ff;
}

.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
@media (max-width: 767px) {
  .mb-6 { margin-bottom: 16px; }
}

/* Range Buttons */
.range-btns {
  display: flex;
  gap: 4px;
}

.cyber-btn-sm {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  background: transparent;
  border: 1px solid #1a1a2e;
  color: #6a6a8a;
  cursor: pointer;
  transition: all 0.2s;
}

.cyber-btn-sm:hover {
  border-color: #00f0ff44;
  color: #00f0ff;
}

.cyber-btn-active {
  background: rgba(0, 240, 255, 0.1) !important;
  border-color: #00f0ff !important;
  color: #00f0ff !important;
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.2);
}

/* Rankings */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rank-badge {
  width: 22px; height: 22px;
  border-radius: 6px;
  background: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #4a4a6a;
  flex-shrink: 0;
}

.rank-top {
  background: linear-gradient(135deg, #f59e0b, #ff6b00);
  color: #fff;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.3);
}

.rank-name {
  flex: 1;
  font-size: 12px;
  color: #a0a0cc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-bar {
  width: 60px; height: 4px;
  background: #1a1a2e;
  border-radius: 2px;
  overflow: hidden;
}
@media (max-width: 767px) {
  .rank-bar { width: 40px; }
}

.rank-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00f0ff, #7c3aed);
  border-radius: 2px;
}

.rank-value {
  font-size: 11px;
  color: #6a6a8a;
  width: 50px;
  text-align: right;
  font-family: 'Courier New', monospace;
}
@media (max-width: 767px) {
  .rank-value { width: 40px; font-size: 10px; }
}

/* Log */
.log-list {
  display: flex;
  flex-direction: column;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #1a1a2e;
}
@media (max-width: 767px) {
  .log-item { gap: 8px; padding: 8px 0; flex-wrap: wrap; }
  .log-operator-mobile-hide { display: none; }
}

.log-item:last-child { border-bottom: none; }

.log-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.log-tag-user { background: rgba(0, 240, 255, 0.1); color: #00f0ff; }
.log-tag-order { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.log-tag-tool { background: rgba(124, 58, 237, 0.1); color: #c084fc; }
.log-tag-content { background: rgba(0, 255, 136, 0.1); color: #00ff88; }
.log-tag-system { background: rgba(100, 100, 140, 0.1); color: #6a6a8a; }

.log-action {
  flex: 1;
  font-size: 13px;
  color: #a0a0cc;
}
@media (max-width: 767px) {
  .log-action { font-size: 12px; min-width: 0; }
}

.log-operator {
  font-size: 11px;
  color: #4a4a6a;
}

.log-time {
  font-size: 11px;
  color: #4a4a6a;
  font-family: 'Courier New', monospace;
}

.text-green-400 { color: #00ff88; }
.text-cyan-400 { color: #00f0ff; }

.space-y-2 > * + * { margin-top: 8px; }

/* Empty data placeholder */
.empty-data {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: #4a4a6a;
  font-size: 13px;
}
</style>
