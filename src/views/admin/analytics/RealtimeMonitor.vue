<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold" style="color:#00f0ff">🔴 实时监控</h2>
      <div class="flex gap-2">
        <el-button :type="running ? 'warning' : 'success'" @click="toggleRunning">
          {{ running ? '暂停' : '开始' }}
        </el-button>
        <el-button @click="refreshData">刷新</el-button>
        <el-button type="primary" @click="exportSnapshot">导出快照</el-button>
      </div>
    </div>

    <div class="cyber-card rounded-xl p-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="m in metrics" :key="m.label" class="rounded-lg p-4" style="background:#0d0d1a;border:1px solid #00f0ff30">
          <div class="text-xs" style="color:#a0a0cc">{{ m.label }}</div>
          <div class="text-2xl font-bold mt-1" :style="{color:m.color}">{{ m.value }}</div>
        </div>
      </div>
    </div>

    <div class="cyber-card rounded-xl p-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-bold" style="color:#00f0ff">实时请求量</h3>
        <el-radio-group v-model="range" size="small" @change="resetChart">
          <el-radio-button label="1m">1分钟</el-radio-button>
          <el-radio-button label="5m">5分钟</el-radio-button>
          <el-radio-button label="15m">15分钟</el-radio-button>
        </el-radio-group>
      </div>
      <div class="flex items-end gap-1 h-32">
        <div v-for="(v,i) in chart" :key="i" class="flex-1 rounded-t" :style="{height:v+'%',background:'linear-gradient(180deg,#00f0ff,#b700ff)',minWidth:'3px'}"></div>
      </div>
    </div>

    <div class="cyber-card rounded-xl p-6">
      <h3 class="text-sm font-bold mb-3" style="color:#00f0ff">实时事件流</h3>
      <div class="space-y-1 max-h-48 overflow-y-auto">
        <div v-for="e in events" :key="e.id" class="flex gap-3 text-xs p-2 rounded" style="background:#0d0d1a">
          <span :style="{color:e.color}">{{ e.time }}</span>
          <span style="color:#e0e0ff">{{ e.msg }}</span>
        </div>
        <div v-if="!events.length" style="color:#808099;text-align:center;padding:16px;">暂无事件</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { service } from '@/api/request'
import { getToken } from '@/utils'

const metrics = ref([
  { label: '在线用户', value: '0', color: '#00f0ff' },
  { label: 'QPS', value: '0', color: '#00f0ff' },
  { label: 'CPU', value: '0%', color: '#b700ff' },
  { label: '内存', value: '0%', color: '#ffe600' }
])
const chart = ref(Array(60).fill(20))
const events = ref<any[]>([])
const running = ref(true)
const range = ref('1m')
let timer: any

async function fetchRealData() {
  try {
    const token = getToken()
    const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'
    const res = await fetch(`${base}/admin/system-stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) return
    const data = await res.json()
    const d = data.data || data
    metrics.value[0].value = String(d.online || 0)
    metrics.value[2].value = (d.cpu || 0) + '%'
    metrics.value[3].value = (Math.round((d.mem || 0) / 8 * 100)) + '%'
  } catch (e) { /* ignore */ }
}

function updateSimulation() {
  metrics.value[1].value = String(Math.floor(Math.random() * 500 + 100))
  chart.value.shift()
  chart.value.push(Math.floor(Math.random() * 80 + 10))
  const ts = new Date().toTimeString().slice(0, 8)
  const msgs = ['用户登录', 'AI请求', '订单创建', '文件上传', 'API调用', '注册审核', '支付成功', 'Token消耗']
  const colors = ['#00f0ff', '#00f0ff', '#b700ff', '#ffe600', '#00ff88', '#ff6b35']
  const idx = Math.floor(Math.random() * msgs.length)
  events.value.unshift({ id: Date.now(), time: ts, msg: msgs[idx] + ' #' + Math.floor(Math.random() * 9999), color: colors[idx] })
  if (events.value.length > 30) events.value.pop()
}

function startTimer() {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    fetchRealData()
    updateSimulation()
  }, 1000)
}

function toggleRunning() {
  running.value = !running.value
  if (running.value) {
    startTimer()
  } else {
    clearInterval(timer)
  }
}

async function refreshData() {
  await fetchRealData()
  updateSimulation()
  ElMessage.success('已刷新')
}

function resetChart() {
  const len = range.value === '1m' ? 60 : range.value === '5m' ? 120 : 180
  chart.value = Array(len).fill(20).map(() => Math.floor(Math.random() * 80 + 10))
}

function exportSnapshot() {
  const text = `实时监控快照\n在线用户：${metrics.value[0].value}\nQPS：${metrics.value[1].value}\nCPU：${metrics.value[2].value}\n内存：${metrics.value[3].value}`
  const blob = new Blob([text], { type: 'text/plain' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `监控快照-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.txt`
  link.click()
}

onMounted(() => {
  fetchRealData()
  startTimer()
})
onUnmounted(() => clearInterval(timer))
</script>
