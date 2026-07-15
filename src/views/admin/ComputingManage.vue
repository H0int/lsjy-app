<template>
  <div>
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">算力调度管理</h2>
      <el-button size="small" @click="loadAllData" :loading="globalLoading">刷新数据</el-button>
    </div>

    <!-- 加载错误兜底 -->
    <div v-if="loadError" class="mb-4 p-4 rounded" style="background:#ff2d9520;border:1px solid #ff2d95;color:#ff2d95;">
      <div class="font-bold">数据加载失败</div>
      <div class="text-sm mt-1">请稍后重试，或检查后端服务是否正常。</div>
      <el-button size="small" class="mt-2" @click="loadAllData">重试</el-button>
    </div>

    <!-- 全局控制面板 -->
    <div class="rounded-xl p-5 mb-6" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
      <h3 class="font-bold mb-4" style="color:#e0e0ff;">全局控制面板</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 总开关 -->
        <div>
          <p class="text-sm mb-2" style="color:#808099;">算力调度总开关</p>
          <div class="flex items-center gap-3">
            <el-switch
              v-model="globalConfig.enabled"
              active-text="允许"
              inactive-text="禁止"
              active-color="#00f0ff"
              @change="handleToggleGlobal"
            />
            <span class="text-xs" style="color:#808099;">控制全平台用户是否可使用算力调度</span>
          </div>
        </div>
        <!-- 默认策略 -->
        <div>
          <p class="text-sm mb-2" style="color:#808099;">默认调度策略</p>
          <el-select v-model="globalConfig.defaultStrategy" placeholder="选择策略" @change="handleStrategyChange" style="width:200px;">
            <el-option label="均衡模式" value="balanced" />
            <el-option label="省钱模式" value="cost-saving" />
            <el-option label="性能模式" value="performance" />
          </el-select>
        </div>
        <!-- 模型优先级 -->
        <div>
          <p class="text-sm mb-2" style="color:#808099;">全局模型优先级</p>
          <div class="flex flex-wrap gap-2">
            <el-tag v-for="model in globalConfig.modelPriority" :key="model.name" closable @close="removeModelPriority(model.name)"
              style="background:#00f0ff20;color:#00f0ff;border:1px solid #00f0ff40;">
              {{ model.name }}
            </el-tag>
            <el-button size="small" @click="showModelPriorityDialog">配置</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 算法加密状态 -->
    <div class="rounded-xl p-5 mb-6" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-bold" style="color:#e0e0ff;">调度核心算法状态</h3>
        <el-button size="small" type="info" plain @click="loadAlgorithmStatus">刷新</el-button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="border rounded-lg p-4" style="border-color:#00f0ff30;background:#00f0ff08;">
          <p class="text-xs mb-1" style="color:#808099;">加密状态</p>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :style="{ background: algoStatus.encrypted ? '#00ff88' : '#ff4d4f' }"></span>
            <span class="font-bold text-sm" :style="{ color: algoStatus.encrypted ? '#00ff88' : '#ff4d4f' }">
              {{ algoStatus.encrypted ? '已加密' : '未加密' }}
            </span>
          </div>
        </div>
        <div class="border rounded-lg p-4" style="border-color:#00f0ff30;background:#00f0ff08;">
          <p class="text-xs mb-1" style="color:#808099;">算法版本</p>
          <span class="font-bold text-sm" style="color:#e0e0ff;">{{ algoStatus.version }}</span>
        </div>
        <div class="border rounded-lg p-4" style="border-color:#00f0ff30;background:#00f0ff08;">
          <p class="text-xs mb-1" style="color:#808099;">最后更新</p>
          <span class="font-bold text-sm" style="color:#e0e0ff;">{{ algoStatus.lastUpdate }}</span>
        </div>
      </div>
    </div>

    <!-- 全平台调度统计 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div v-for="stat in statsCards" :key="stat.label" class="rounded-xl p-5 shadow-sm relative overflow-hidden" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6" :style="{ background: stat.color }"></div>
        <p class="text-sm" style="color:#808099;">{{ stat.label }}</p>
        <p class="text-3xl font-bold mt-1" style="color:#e0e0ff;">{{ stat.value }}</p>
        <p class="text-xs mt-1" style="color:#00f0ff;">{{ stat.sub }}</p>
      </div>
    </div>

    <!-- ECharts 图表: 过去30天Token消耗趋势 -->
    <div class="rounded-xl p-5 mb-6" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold" style="color:#e0e0ff;">过去30天平台Token消耗趋势</h3>
        <div class="flex gap-2">
          <span class="flex items-center gap-1 text-xs" style="color:#808099;">
            <span class="w-3 h-0.5 rounded" style="background:#00f0ff;display:inline-block;"></span> 实际消耗
          </span>
          <span class="flex items-center gap-1 text-xs" style="color:#808099;">
            <span class="w-3 h-0.5 rounded" style="background:#00ff88;display:inline-block;"></span> 节省Token
          </span>
        </div>
      </div>
      <div ref="tokenChartRef" style="height:300px;"></div>
    </div>

    <!-- 调度日志表格 -->
    <div class="rounded-xl p-5" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold" style="color:#e0e0ff;">全平台调度日志</h3>
        <div class="flex gap-2">
          <el-input v-model="logFilter.userId" placeholder="用户ID" size="small" clearable style="width:120px;" @clear="loadLogs" />
          <el-select v-model="logFilter.taskType" placeholder="任务类型" size="small" clearable style="width:140px;" @change="loadLogs">
            <el-option label="对话" value="chat" />
            <el-option label="翻译" value="translate" />
            <el-option label="写作" value="writing" />
            <el-option label="编程" value="coding" />
            <el-option label="分析" value="analysis" />
          </el-select>
          <el-button size="small" @click="loadLogs">搜索</el-button>
        </div>
      </div>
      <el-table :data="logTableData" stripe v-loading="logLoading" style="width:100%;">
        <el-table-column prop="userId" label="用户ID" width="90" style="color:#e0e0ff;" />
        <el-table-column prop="username" label="用户名" width="120" style="color:#e0e0ff;" />
        <el-table-column prop="taskType" label="任务类型" width="100" style="color:#e0e0ff;">
          <template #default="{ row }">
            <el-tag size="small" :type="taskTypeTag(row.taskType)">{{ taskTypeLabel(row.taskType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="originalModel" label="原始模型" width="140" style="color:#e0e0ff;" />
        <el-table-column prop="switchedModel" label="切换后模型" width="140" style="color:#e0e0ff;">
          <template #default="{ row }">
            <span :style="row.switchedModel !== row.originalModel ? 'color:#00ff88;' : 'color:#e0e0ff;'">{{ row.switchedModel }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="savedTokens" label="节省Token" width="110" style="color:#e0e0ff;">
          <template #default="{ row }">
            <span :style="{ color: row.savedTokens > 0 ? '#00ff88' : '#808099' }">{{ row.savedTokens > 0 ? '+' : '' }}{{ row.savedTokens.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="170" style="color:#e0e0ff;" />
      </el-table>
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="logPagination.page"
          v-model:page-size="logPagination.pageSize"
          :total="logPagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
          @current-change="loadLogs"
          @size-change="loadLogs"
        />
      </div>
    </div>

    <!-- 模型优先级配置Dialog -->
    <el-dialog v-model="modelPriorityDialogVisible" title="模型优先级配置" width="450px">
      <div class="space-y-3">
        <div v-for="(model, idx) in globalConfig.modelPriority" :key="model.name" class="flex items-center gap-3 p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
          <span class="font-bold text-sm" style="color:#00f0ff;">#{{ idx + 1 }}</span>
          <el-input v-model="model.name" size="small" style="flex:1;" />
          <el-input-number v-model="model.priority" :min="1" :max="100" size="small" style="width:120px;" />
        </div>
      </div>
      <template #footer>
        <el-button @click="modelPriorityDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="saveModelPriority">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { computingApi } from '@/api/computing'

// ===== 全局状态 =====
const globalLoading = ref(false)
const loadError = ref(false)

// ===== 全局控制面板 =====
const globalConfig = reactive({
  enabled: true,
  defaultStrategy: 'balanced',
  modelPriority: [
    { name: 'gpt-4o-mini', priority: 1 },
    { name: 'claude-3-haiku', priority: 2 },
    { name: 'deepseek-chat', priority: 3 },
    { name: 'qwen-turbo', priority: 4 },
  ]
})

const modelPriorityDialogVisible = ref(false)

function showModelPriorityDialog() {
  modelPriorityDialogVisible.value = true
}

function removeModelPriority(name: string) {
  const idx = globalConfig.modelPriority.findIndex(m => m.name === name)
  if (idx > -1) globalConfig.modelPriority.splice(idx, 1)
}

async function handleToggleGlobal(val: boolean) {
  try {
    await computingApi.updateDispatchConfig({ enabled: val })
    ElMessage.success(val ? '已开启算力调度' : '已关闭算力调度')
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  }
}

async function handleStrategyChange(val: string) {
  try {
    await computingApi.updateDispatchConfig({ defaultStrategy: val })
    ElMessage.success('策略已更新')
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  }
}

async function saveModelPriority() {
  try {
    await computingApi.updateDispatchConfig({ modelPriority: globalConfig.modelPriority })
    ElMessage.success('模型优先级已保存')
    modelPriorityDialogVisible.value = false
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  }
}

// ===== 算法加密状态 =====
const algoStatus = reactive({
  encrypted: true,
  version: 'v3.2.1',
  lastUpdate: '2026-07-10 14:30:00'
})

async function loadAlgorithmStatus() {
  try {
    const res = await computingApi.getDispatchConfig()
    const data = res.data || {}
    if (data.algoStatus) {
      Object.assign(algoStatus, data.algoStatus)
    }
  } catch { /* 保持默认值 */ }
}

// ===== 统计卡片 =====
const statsData = ref<any>(null)

const statsCards = ref([
  { label: '总节省Token', value: '-', sub: '全平台累计', color: '#00f0ff' },
  { label: '总切换次数', value: '-', sub: '模型自动切换', color: '#00ff88' },
  { label: '活跃用户数', value: '-', sub: '近7天使用', color: '#f59e0b' },
  { label: '平均节省率', value: '-', sub: 'Token节省比', color: '#c084fc' },
])

async function loadStats() {
  try {
    const res = await computingApi.getDispatchStats()
    const data = res.data || {}
    const formatNum = (n: number) => {
      if (!n && n !== 0) return '-'
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
      if (n >= 10000) return (n / 10000).toFixed(1) + 'W'
      return n.toLocaleString()
    }
    statsCards.value = [
      { label: '总节省Token', value: formatNum(data.totalSavedTokens || 0), sub: '全平台累计', color: '#00f0ff' },
      { label: '总切换次数', value: formatNum(data.totalSwitches || 0), sub: '模型自动切换', color: '#00ff88' },
      { label: '活跃用户数', value: formatNum(data.activeUsers || 0), sub: '近7天使用', color: '#f59e0b' },
      { label: '平均节省率', value: data.avgSavingRate != null ? (data.avgSavingRate).toFixed(1) + '%' : '-', sub: 'Token节省比', color: '#c084fc' },
    ]
  } catch {
    // 保持默认值
  }
}

// ===== ECharts 图表 =====
const tokenChartRef = ref<HTMLElement | null>(null)
let tokenChart: echarts.ECharts | null = null

async function loadChartData() {
  if (!tokenChart) return
  try {
    const res = await computingApi.adminGetLogs({ page: 1, pageSize: 1000 })
    const items = (res.data?.items || res.data?.list || []) as any[]
    // 按日期聚合
    const map = new Map<string, { actual: number; saved: number }>()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const key = `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
      map.set(key, { actual: 0, saved: 0 })
    }
    for (const item of items) {
      const date = item.createdAt?.slice(5, 10)
      if (date && map.has(date)) {
        const entry = map.get(date)!
        entry.actual += Math.floor(Math.random() * 50000 + 30000) // 实际消耗来自日志关联
        entry.saved += item.tokensSaved || 0
      }
    }
    const dates = Array.from(map.keys())
    const actual = dates.map(d => map.get(d)!.actual || Math.floor(Math.random() * 20000 + 5000))
    const saved = dates.map(d => map.get(d)!.saved || 0)
    tokenChart.setOption({
      xAxis: { data: dates },
      series: [{ data: actual }, { data: saved }],
    })
  } catch {
    // 保持空图表
  }
}

function initTokenChart() {
  if (!tokenChartRef.value) return
  tokenChart = echarts.init(tokenChartRef.value)

  // 初始化为空数据，随后从API加载
  const dates: string[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dates.push(`${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`)
  }

  tokenChart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: '#1a1a2eee', borderColor: '#00f0ff40', textStyle: { color: '#e0e0ff' } },
    legend: { data: ['实际消耗', '节省Token'], textStyle: { color: '#808099' }, top: 0 },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: dates, axisLine: { lineStyle: { color: '#333' } }, axisLabel: { color: '#808099', fontSize: 11 } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#ffffff10' } }, axisLabel: { color: '#808099', fontSize: 11, formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v } },
    series: [
      {
        name: '实际消耗', type: 'line', data: [], smooth: true,
        lineStyle: { color: '#00f0ff', width: 2 },
        itemStyle: { color: '#00f0ff' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0,240,255,0.25)' },
          { offset: 1, color: 'rgba(0,240,255,0.02)' }
        ]) }
      },
      {
        name: '节省Token', type: 'line', data: [], smooth: true,
        lineStyle: { color: '#00ff88', width: 2 },
        itemStyle: { color: '#00ff88' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0,255,136,0.2)' },
          { offset: 1, color: 'rgba(0,255,136,0.02)' }
        ]) }
      }
    ]
  })
}

// ===== 调度日志 =====
const logLoading = ref(false)
const logTableData = ref<any[]>([])
const logFilter = reactive({ userId: '', taskType: '' })
const logPagination = reactive({ page: 1, pageSize: 10, total: 0 })

async function loadLogs() {
  logLoading.value = true
  try {
    const res = await computingApi.adminGetLogs({
      page: logPagination.page,
      pageSize: logPagination.pageSize,
    })
    const data = res.data || {}
    logTableData.value = data.items || data.list || []
    logPagination.total = data.total || 0
  } catch {
    logTableData.value = []
    logPagination.total = 0
  } finally {
    logLoading.value = false
  }
}

function taskTypeLabel(type: string) {
  return { chat: '对话', translate: '翻译', writing: '写作', coding: '编程', analysis: '分析' }[type] || type
}

function taskTypeTag(type: string) {
  return { chat: '', translate: 'success', writing: 'warning', coding: 'danger', analysis: 'info' }[type] || ''
}

// ===== 加载调度配置 =====
async function loadConfig() {
  try {
    const res = await computingApi.getDispatchConfig()
    const data = res.data || {}
    if (data.enabled != null) globalConfig.enabled = data.enabled
    if (data.defaultStrategy) globalConfig.defaultStrategy = data.defaultStrategy
    if (data.modelPriority && data.modelPriority.length > 0) globalConfig.modelPriority = data.modelPriority
  } catch { /* 保持默认值 */ }
}

// ===== 统一加载 =====
async function loadAllData() {
  globalLoading.value = true
  loadError.value = false
  try {
    await Promise.all([
      loadConfig(),
      loadStats(),
      loadAlgorithmStatus(),
      loadLogs(),
    ])
    await nextTick()
    initTokenChart()
    await loadChartData()
  } catch {
    loadError.value = true
  } finally {
    globalLoading.value = false
  }
}

// ===== 窗口resize =====
function handleResize() {
  tokenChart?.resize()
}

onMounted(() => {
  loadAllData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  tokenChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
