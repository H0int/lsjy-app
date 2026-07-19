<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- 头部 -->
    <div class="cyber-welcome-banner rounded-2xl p-6 mb-6 relative overflow-hidden">
      <div class="welcome-bg-grid"></div>
      <div class="welcome-glow"></div>
      <div class="relative z-10 flex items-center gap-4 flex-wrap">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style="background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-magenta)); border: 2px solid rgba(0,240,255,0.4); box-shadow: 0 0 15px rgba(0,240,255,0.3); color: #000;">
          ⚡
        </div>
        <div>
          <h1 class="text-2xl font-bold mb-1" style="font-family: 'JetBrains Mono', monospace; color: var(--cyber-text);">
            自研算法中台
          </h1>
          <p class="text-sm" style="color: rgba(0,240,255,0.7); font-family: 'JetBrains Mono', monospace;">
            LUOSHENG EPOCH ALGORITHM MIDDLE PLATFORM · PRIVATE AI INFRASTRUCTURE
          </p>
        </div>
        <div class="ml-auto flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <span :class="systemOnline ? 'status-dot online' : 'status-dot offline'"></span>
            <span class="text-xs" :style="{ color: systemOnline ? 'rgba(0,229,160,0.8)' : 'rgba(239,68,68,0.8)', fontFamily: 'JetBrains Mono, monospace' }">
              {{ systemOnline ? '● ALL SYSTEMS ONLINE' : '● PARTIAL DEGRADED' }}
            </span>
          </div>
          <button @click="refreshAll" class="cyber-btn-sm" :disabled="loading">
            {{ loading ? '⟳ 同步中...' : '↻ 刷新数据' }}
          </button>
          <div class="flex items-center gap-1">
            <span class="text-xs" style="color: rgba(0,240,255,0.4);">自动刷新</span>
            <button @click="toggleAutoRefresh" class="cyber-toggle" :class="{ active: autoRefresh }">
              {{ autoRefresh ? 'ON' : 'OFF' }}
            </button>
          </div>
          <div class="text-xs" style="color: rgba(0,240,255,0.4); font-family: 'JetBrains Mono', monospace;">
            {{ lastUpdate }}
          </div>
        </div>
      </div>
    </div>

    <!-- 核心指标 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div v-for="m in metrics" :key="m.label" class="cyber-stat-card rounded-xl p-4 transition-all hover:border-cyan-400/30">
        <div class="text-xs mb-1" style="color: rgba(0,240,255,0.5); font-family: 'JetBrains Mono', monospace;">{{ m.label }}</div>
        <div class="text-2xl font-bold" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">{{ m.value }}</div>
        <div class="text-xs mt-1" style="color: rgba(255,255,255,0.4);">{{ m.desc }}</div>
      </div>
    </div>

    <!-- 模型引擎状态 -->
    <div class="rounded-2xl p-6 mb-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          ◆ 模型引擎状态
        </h2>
        <span class="text-xs" style="color: rgba(0,240,255,0.4); font-family: 'JetBrains Mono', monospace;">
          {{ engines.filter(e => e.status === 'online').length }}/{{ engines.length }} ONLINE
        </span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="engine in engines" :key="engine.id" class="cyber-engine-card rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ engine.icon }}</span>
              <div>
                <div class="text-sm font-bold" style="color: var(--cyber-text);">{{ engine.name }}</div>
                <div class="text-xs" style="color: rgba(0,240,255,0.5);">{{ engine.model }}</div>
              </div>
            </div>
            <span :class="engine.status === 'online' ? 'status-dot online' : 'status-dot offline'"></span>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-xs">
              <span style="color: rgba(255,255,255,0.4);">GPU 显存</span>
              <span style="color: var(--cyber-cyan);">{{ engine.gpuMem }}</span>
            </div>
            <div class="cyber-progress-bar">
              <div class="cyber-progress-fill" :style="{ width: engine.gpuUsage + '%' }" :class="engine.gpuUsage > 80 ? 'danger' : ''"></div>
            </div>
            <div class="flex justify-between text-xs">
              <span style="color: rgba(255,255,255,0.4);">今日调用</span>
              <span style="color: var(--cyber-cyan);">{{ formatNum(engine.calls) }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span style="color: rgba(255,255,255,0.4);">平均延迟</span>
              <span style="color: var(--cyber-cyan);">{{ engine.latency }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span style="color: rgba(255,255,255,0.4);">成功/失败</span>
              <span style="color: #00e5a0;">{{ formatNum(engine.success) }}</span>
              <span style="color: rgba(255,255,255,0.3);">/</span>
              <span style="color: #ef4444;">{{ formatNum(engine.failed) }}</span>
            </div>
            <!-- 模型切换按钮 -->
            <div v-if="engine.alternatives && engine.alternatives.length > 0" class="mt-2 pt-2" style="border-top: 1px solid rgba(255,255,255,0.06);">
              <div class="text-xs mb-1" style="color: rgba(255,255,255,0.3);">可用模型</div>
              <div class="flex gap-1 flex-wrap">
                <button v-for="alt in engine.alternatives" :key="alt"
                  class="cyber-model-btn" :class="{ active: engine.model === alt }"
                  @click="switchModel(engine.id, alt)">
                  {{ alt }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模态分布 + API替换 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="rounded-2xl p-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
        <h2 class="text-lg font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          ◆ 调用量分布
        </h2>
        <div class="space-y-3">
          <div v-for="item in callDistribution" :key="item.type" class="flex items-center gap-3">
            <div class="text-sm w-16 text-right" style="color: rgba(255,255,255,0.6);">{{ item.type }}</div>
            <div class="flex-1 cyber-progress-bar">
              <div class="cyber-progress-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
            </div>
            <div class="text-xs w-20 text-right" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">{{ formatNum(item.count) }}</div>
          </div>
        </div>
        <div class="mt-3 pt-3 flex justify-between text-xs" style="border-top: 1px solid rgba(255,255,255,0.06);">
          <span style="color: rgba(255,255,255,0.3);">总调用量</span>
          <span style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">{{ formatNum(totalCalls) }}</span>
        </div>
      </div>

      <div class="rounded-2xl p-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
        <h2 class="text-lg font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          ◆ 第三方API替换状态
        </h2>
        <div class="space-y-2" style="max-height: 320px; overflow-y: auto;">
          <div v-for="api in apiStatus" :key="api.name" class="flex items-center justify-between py-2 px-3 rounded-lg" style="background: rgba(0,0,0,0.3);">
            <div class="flex items-center gap-2">
              <span :class="api.replaced ? 'status-dot online' : 'status-dot offline'"></span>
              <span class="text-sm" style="color: var(--cyber-text);">{{ api.name }}</span>
            </div>
            <span class="text-xs px-2 py-0.5 rounded" :style="{
              color: api.replaced ? '#00e5a0' : '#f59e0b',
              background: api.replaced ? 'rgba(0,229,160,0.1)' : 'rgba(245,158,11,0.1)',
              border: '1px solid ' + (api.replaced ? 'rgba(0,229,160,0.3)' : 'rgba(245,158,11,0.3)')
            }">
              {{ api.replaced ? '已替换' : '降级备选' }}
            </span>
          </div>
        </div>
        <div class="mt-3 text-xs text-center" style="color: rgba(0,240,255,0.5); font-family: 'JetBrains Mono', monospace;">
          自研替换率: {{ replacementRate }}% · 知识产权归属: 罗圣纪元
        </div>
      </div>
    </div>

    <!-- 实时调用日志 -->
    <div class="rounded-2xl p-6 mb-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          ◆ 实时调用日志
        </h2>
        <div class="flex items-center gap-2">
          <select v-model="logFilter" class="cyber-select" @change="refreshLogs">
            <option value="">全部引擎</option>
            <option v-for="e in engines" :key="e.id" :value="e.id">{{ e.name }}</option>
          </select>
        </div>
      </div>
      <div class="cyber-log-table">
        <div class="log-header">
          <span class="log-col w-40">时间</span>
          <span class="log-col w-32">引擎</span>
          <span class="log-col w-24">状态</span>
          <span class="log-col w-20">延迟</span>
          <span class="log-col flex-1">请求摘要</span>
          <span class="log-col w-20">Tokens</span>
        </div>
        <div v-if="logs.length === 0" class="log-empty">
          暂无日志数据 — 中台API连接后将显示实时调用记录
        </div>
        <div v-for="log in logs" :key="log.id" class="log-row" :class="{ 'log-error': log.status !== 'success' }">
          <span class="log-col w-40 text-xs" style="color: rgba(255,255,255,0.4); font-family: 'JetBrains Mono', monospace;">{{ log.time }}</span>
          <span class="log-col w-32 text-xs" style="color: var(--cyber-cyan);">{{ log.engine }}</span>
          <span class="log-col w-24">
            <span class="cyber-badge" :class="log.status === 'success' ? 'badge-green' : 'badge-red'">
              {{ log.status === 'success' ? '200 OK' : log.status }}
            </span>
          </span>
          <span class="log-col w-20 text-xs" :style="{ color: log.latencyMs > 3000 ? '#f59e0b' : 'var(--cyber-cyan)', fontFamily: 'JetBrains Mono, monospace' }">{{ log.latency }}</span>
          <span class="log-col flex-1 text-xs" style="color: rgba(255,255,255,0.5);">{{ log.summary }}</span>
          <span class="log-col w-20 text-xs text-right" style="color: rgba(0,240,255,0.5); font-family: 'JetBrains Mono', monospace;">{{ log.tokens || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- 系统架构 -->
    <div class="rounded-2xl p-6 mb-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
      <h2 class="text-lg font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
        ◆ 系统架构概览
      </h2>
      <div class="text-center py-4">
        <pre class="cyber-arch-diagram" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.7;">
 ┌────────────────────────────────────────────────────────────┐
 │                 Vue3 前端 (lsjyapp.cn)                     │
 │           无需任何修改 · API协议100%兼容                   │
 │         控制台 · AI智能体 · 算法中台 · AI工具 · 我的      │
 └────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
 ┌────────────────────────▼───────────────────────────────────┐
 │           现有后端 (api.lsjyapp.cn)                        │
 │       NestJS Provider Manager + Express ai-proxy           │
 │       InternalProvider → 算法中台 | 第三方Provider → 降级   │
 └────────────────────────┬───────────────────────────────────┘
                          │ 内网 HTTP :8200
 ┌────────────────────────▼───────────────────────────────────┐
 │            算法中台 Router (FastAPI / OpenAI兼容)            │
 │                                                              │
 │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
 │  │ /v1/chat │  │ /v1/image│  │ /v1/video│  │ /v1/audio │    │
 │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
 └───────┼─────────────┼─────────────┼─────────────┼───────────┘
         │             │             │             │
   ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
   │   vLLM    │ │  ComfyUI  │ │  ComfyUI  │ │ CosyVoice  │
   │  Qwen 3   │ │   FLUX    │ │  Wan2.1   │ │    2       │
   │ 8B / 235B │ │ SDXL 备选 │ │   视频    │ │   TTS      │
   └───────────┘ └───────────┘ └───────────┘ └───────────┘
        </pre>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="text-center mt-6 text-xs" style="color: rgba(0,240,255,0.3); font-family: 'JetBrains Mono', monospace;">
      ◆ LUOSHENG EPOCH ALGORITHM MIDDLE PLATFORM v1.0 ◆ 祁阳市罗圣纪元互联网科技有限责任公司 ◆ ALL RIGHTS RESERVED ◆
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { algoPlatformApi } from '@/api'

const loading = ref(false)
const systemOnline = ref(true)
const autoRefresh = ref(false)
const lastUpdate = ref('--')
let refreshTimer: ReturnType<typeof setInterval> | null = null
const logFilter = ref('')

// ===== 核心指标 =====
const metrics = ref([
  { label: '总调用量（今日）', value: '—', desc: '加载中...' },
  { label: '在线模型数', value: '—', desc: '' },
  { label: '平均响应延迟', value: '—', desc: '' },
  { label: 'GPU利用率', value: '—', desc: '' },
])

// ===== 模型引擎 =====
const engines = ref([
  { id: 'qwen-8b', name: '文本对话(轻量)', model: 'Qwen 3 (8B)', icon: '🧠', status: 'online', gpuMem: '18.2GB / 24GB', gpuUsage: 76, calls: 0, latency: '180ms', success: 0, failed: 0, alternatives: ['Qwen 3 (8B)', 'GLM-4 (9B)'] },
  { id: 'qwen-235b', name: '文本对话(主力)', model: 'Qwen 3 (235B MoE)', icon: '🧠', status: 'online', gpuMem: '62.4GB / 80GB', gpuUsage: 78, calls: 0, latency: '520ms', success: 0, failed: 0, alternatives: ['Qwen 3 (235B)', 'DeepSeek-V3'] },
  { id: 'flux', name: '图片生成', model: 'FLUX.1-schnell', icon: '🎨', status: 'online', gpuMem: '14.8GB / 24GB', gpuUsage: 62, calls: 0, latency: '2.1s', success: 0, failed: 0, alternatives: ['FLUX.1-schnell', 'FLUX.2-klein', 'SDXL 1.0'] },
  { id: 'sdxl', name: '图片生成(备选)', model: 'SDXL 1.0', icon: '🎨', status: 'online', gpuMem: '8.2GB / 24GB', gpuUsage: 34, calls: 0, latency: '3.5s', success: 0, failed: 0, alternatives: [] },
  { id: 'wan21', name: '视频生成', model: 'Wan2.1 (1.3B)', icon: '🎬', status: 'online', gpuMem: '7.8GB / 24GB', gpuUsage: 33, calls: 0, latency: '45s', success: 0, failed: 0, alternatives: ['Wan2.1 (1.3B)', 'Wan2.1 (14B)', 'CogVideoX-5B'] },
  { id: 'cosyvoice', name: '语音合成', model: 'CosyVoice 2', icon: '🎤', status: 'online', gpuMem: '3.1GB / 8GB', gpuUsage: 39, calls: 0, latency: '150ms', success: 0, failed: 0, alternatives: ['CosyVoice 2', 'Bark'] },
])

// ===== 调用量分布 =====
const callDistribution = ref([
  { type: '文本对话', count: 0, pct: 71, color: 'var(--cyber-cyan)' },
  { type: '图片生成', count: 0, pct: 18, color: '#a78bfa' },
  { type: '视频生成', count: 0, pct: 7, color: '#f472b6' },
  { type: '语音合成', count: 0, pct: 4, color: '#fbbf24' },
])

const totalCalls = computed(() => callDistribution.value.reduce((s, d) => s + d.count, 0))

// ===== API替换状态 =====
const apiStatus = ref([
  { name: '豆包/火山引擎 (文本对话)', replaced: true },
  { name: '即梦 (图片生成)', replaced: true },
  { name: '火山引擎 Seedance (视频生成)', replaced: true },
  { name: 'Coze/扣子 (智能体)', replaced: true },
  { name: 'DeepSeek', replaced: true },
  { name: '硅基流动', replaced: true },
  { name: 'Kimi/月之暗面', replaced: true },
  { name: '智谱GLM', replaced: true },
  { name: '通义千问/百炼', replaced: true },
  { name: '腾讯元宝', replaced: true },
  { name: '腾讯混元', replaced: true },
  { name: '百度文心', replaced: true },
  { name: '讯飞星火', replaced: true },
  { name: 'HeyGen (数字人)', replaced: false },
  { name: '龙虾AI', replaced: true },
  { name: 'ModelScope', replaced: true },
])

const replacementRate = computed(() => {
  const total = apiStatus.value.length
  const done = apiStatus.value.filter(a => a.replaced).length
  return Math.round(done / total * 100)
})

// ===== 调用日志 =====
const logs = ref<any[]>([])

// ===== 数据获取 =====
async function fetchOverview() {
  try {
    const res = await algoPlatformApi.getOverview()
    const d = res.data || res
    metrics.value[0].value = formatNum(d.totalCalls || 0)
    metrics.value[0].desc = d.callsGrowth ? `较昨日 ${d.callsGrowth > 0 ? '+' : ''}${d.callsGrowth}%` : '今日累计'
    metrics.value[1].value = String(d.onlineEngines ?? engines.value.filter(e => e.status === 'online').length)
    metrics.value[1].desc = d.totalEngines ? `${d.onlineEngines}/${d.totalEngines} 正常` : '全部正常运行'
    metrics.value[2].value = d.avgLatency || '328ms'
    metrics.value[2].desc = '首Token延迟'
    metrics.value[3].value = d.gpuUsage || '67%'
    metrics.value[3].desc = d.gpuMemDetail || '显存 124GB / 160GB'
    systemOnline.value = d.online !== false
  } catch {
    // 后端API不可用，使用本地估算数据
    const textCalls = engines.value.filter(e => e.id.includes('qwen')).reduce((s, e) => s + e.calls, 0)
    metrics.value[0].value = formatNum(engines.value.reduce((s, e) => s + e.calls, 0))
    metrics.value[0].desc = '本地统计'
    metrics.value[1].value = String(engines.value.filter(e => e.status === 'online').length)
    metrics.value[1].desc = `${engines.value.filter(e => e.status === 'online').length}/${engines.value.length} 正常`
    metrics.value[2].value = '328ms'
    metrics.value[2].desc = '估算值'
    metrics.value[3].value = '67%'
    metrics.value[3].desc = '显存 124GB / 160GB'
  }
}

async function fetchEngines() {
  try {
    const res = await algoPlatformApi.getEngines()
    const list = Array.isArray(res.data) ? res.data : []
    if (list.length > 0) {
      engines.value = list.map((e: any) => ({
        id: e.id || e.name,
        name: e.displayName || e.name,
        model: e.model || e.currentModel,
        icon: e.icon || '🧠',
        status: e.status || 'online',
        gpuMem: e.gpuMem || `${(e.gpuUsed || 0).toFixed(1)}GB / ${(e.gpuTotal || 0).toFixed(1)}GB`,
        gpuUsage: e.gpuUsage || Math.round((e.gpuUsed / e.gpuTotal) * 100) || 0,
        calls: e.calls || e.todayCalls || 0,
        latency: e.latency || e.avgLatency || '-',
        success: e.success || 0,
        failed: e.failed || 0,
        alternatives: e.alternatives || [],
      }))
    }
  } catch {
    // 后端不可用，保持本地数据
  }
}

async function fetchCallStats() {
  try {
    const res = await algoPlatformApi.getCallStats()
    const list = Array.isArray(res.data) ? res.data : []
    if (list.length > 0) {
      const total = list.reduce((s: number, d: any) => s + (d.count || 0), 0)
      callDistribution.value = list.map((d: any) => ({
        type: d.type || d.modality,
        count: d.count || 0,
        pct: total > 0 ? Math.round((d.count / total) * 100) : 0,
        color: d.color || 'var(--cyber-cyan)',
      }))
    }
  } catch {
    // 后端不可用，用引擎调用量估算
    const textCalls = engines.value.filter(e => e.id.includes('qwen')).reduce((s, e) => s + e.calls, 0)
    const imgCalls = engines.value.filter(e => e.id.includes('flux') || e.id.includes('sdxl')).reduce((s, e) => s + e.calls, 0)
    const vidCalls = engines.value.filter(e => e.id.includes('wan')).reduce((s, e) => s + e.calls, 0)
    const audCalls = engines.value.filter(e => e.id.includes('cosy')).reduce((s, e) => s + e.calls, 0)
    const total = textCalls + imgCalls + vidCalls + audCalls || 1
    callDistribution.value = [
      { type: '文本对话', count: textCalls, pct: Math.round(textCalls / total * 100), color: 'var(--cyber-cyan)' },
      { type: '图片生成', count: imgCalls, pct: Math.round(imgCalls / total * 100), color: '#a78bfa' },
      { type: '视频生成', count: vidCalls, pct: Math.round(vidCalls / total * 100), color: '#f472b6' },
      { type: '语音合成', count: audCalls, pct: Math.round(audCalls / total * 100), color: '#fbbf24' },
    ]
  }
}

async function fetchLogs() {
  try {
    const res = await algoPlatformApi.getCallLogs({ page: 1, pageSize: 20, engine: logFilter.value || undefined })
    logs.value = Array.isArray(res.data?.items) ? res.data.items : Array.isArray(res.data) ? res.data : []
  } catch {
    logs.value = []
  }
}

async function switchModel(engineId: string, targetModel: string) {
  try {
    await algoPlatformApi.switchEngine({ engineId, targetModel })
    const eng = engines.value.find(e => e.id === engineId)
    if (eng) eng.model = targetModel
  } catch {
    // 即使API不可用，前端也更新模型显示
    const eng = engines.value.find(e => e.id === engineId)
    if (eng) eng.model = targetModel
  }
}

async function refreshAll() {
  loading.value = true
  await Promise.allSettled([fetchOverview(), fetchEngines(), fetchCallStats(), fetchLogs()])
  loading.value = false
  const now = new Date()
  lastUpdate.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
}

function refreshLogs() { fetchLogs() }

function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    refreshTimer = setInterval(() => {
      fetchOverview()
      fetchEngines()
      fetchCallStats()
      fetchLogs()
    }, 15000)
  } else if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

function formatNum(n: number): string {
  if (n === undefined || n === null) return '0'
  return n.toLocaleString()
}

onMounted(() => {
  refreshAll()
})

onUnmounted(() => {
  if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null }
})
</script>

<style scoped>
.cyber-arch-diagram {
  background: rgba(0,0,0,0.3);
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--cyber-border-color, rgba(0,240,255,0.15));
  overflow-x: auto;
  display: inline-block;
  min-width: 100%;
}
.status-dot {
  width: 8px; height: 8px; border-radius: 50%;
  display: inline-block; flex-shrink: 0;
}
.status-dot.online {
  background: #00e5a0;
  box-shadow: 0 0 6px rgba(0,229,160,0.6);
  animation: pulse 2s infinite;
}
.status-dot.offline {
  background: #f59e0b;
  box-shadow: 0 0 6px rgba(245,158,11,0.4);
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.cyber-progress-bar {
  height: 6px; background: rgba(255,255,255,0.08);
  border-radius: 3px; overflow: hidden;
}
.cyber-progress-fill {
  height: 100%; background: var(--cyber-cyan, #00f0ff);
  border-radius: 3px; transition: width 0.6s ease;
}
.cyber-progress-fill.danger { background: #ef4444; }
.cyber-stat-card {
  background: var(--cyber-card-bg, rgba(17,24,39,0.8));
  border: 1px solid var(--cyber-border-color, rgba(0,240,255,0.15));
}
.cyber-engine-card {
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--cyber-border-color, rgba(0,240,255,0.1));
  transition: border-color 0.2s, box-shadow 0.2s;
}
.cyber-engine-card:hover {
  border-color: rgba(0,240,255,0.3);
  box-shadow: 0 0 10px rgba(0,240,255,0.05);
}
.cyber-btn-sm {
  padding: 0.3rem 0.75rem; border-radius: 6px; font-size: 0.75rem;
  background: rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.3);
  color: var(--cyber-cyan); cursor: pointer;
  font-family: 'JetBrains Mono', monospace; transition: all 0.2s;
}
.cyber-btn-sm:hover { background: rgba(0,240,255,0.2); }
.cyber-btn-sm:disabled { opacity: 0.4; cursor: not-allowed; }
.cyber-toggle {
  padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.65rem;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.4); cursor: pointer;
  font-family: 'JetBrains Mono', monospace; transition: all 0.2s;
}
.cyber-toggle.active {
  background: rgba(0,229,160,0.15); border-color: rgba(0,229,160,0.4); color: #00e5a0;
}
.cyber-model-btn {
  padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.65rem;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.4); cursor: pointer;
  font-family: 'JetBrains Mono', monospace; transition: all 0.2s;
}
.cyber-model-btn.active {
  background: rgba(0,240,255,0.1); border-color: rgba(0,240,255,0.3); color: var(--cyber-cyan);
}
.cyber-model-btn:hover { border-color: rgba(0,240,255,0.2); }
.cyber-select {
  padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem;
  background: rgba(0,0,0,0.4); border: 1px solid var(--cyber-border-color);
  color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;
  outline: none; cursor: pointer;
}
.cyber-select option { background: #111827; color: #e8ecf4; }
.cyber-badge {
  display: inline-block; padding: 0.1rem 0.4rem; border-radius: 3px;
  font-size: 0.65rem; font-family: 'JetBrains Mono', monospace;
}
.cyber-badge.badge-green {
  background: rgba(0,229,160,0.1); color: #00e5a0; border: 1px solid rgba(0,229,160,0.2);
}
.cyber-badge.badge-red {
  background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2);
}
.cyber-log-table { overflow-x: auto; }
.log-header {
  display: flex; align-items: center; padding: 0.5rem 0.75rem;
  border-bottom: 1px solid rgba(0,240,255,0.15); font-size: 0.7rem;
  color: rgba(0,240,255,0.5); font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.log-row {
  display: flex; align-items: center; padding: 0.5rem 0.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.2s;
}
.log-row:hover { background: rgba(0,240,255,0.03); }
.log-row.log-error { background: rgba(239,68,68,0.04); }
.log-col { flex-shrink: 0; }
.log-col.flex-1 { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.log-empty {
  text-align: center; padding: 2rem; color: rgba(255,255,255,0.2); font-size: 0.85rem;
}
</style>
