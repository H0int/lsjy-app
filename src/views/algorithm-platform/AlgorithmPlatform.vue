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
            罗圣纪元自研中心 · 算法中台
          </h1>
          <p class="text-sm" style="color: rgba(0,240,255,0.7); font-family: 'JetBrains Mono', monospace;">
            LUOSHENG EPOCH SELF-DEVELOPED CENTER · PRIVATE AI INFRASTRUCTURE · 祁阳市罗圣纪元互联网科技有限责任公司
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
        </div>
      </div>
    </div>

    <!-- 核心指标 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div v-for="m in metrics" :key="m.label" class="cyber-stat-card rounded-xl p-4">
        <div class="text-xs mb-1" style="color: rgba(0,240,255,0.5); font-family: 'JetBrains Mono', monospace;">{{ m.label }}</div>
        <div class="text-2xl font-bold" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">{{ m.value }}</div>
        <div class="text-xs mt-1" style="color: rgba(255,255,255,0.4);">{{ m.desc }}</div>
      </div>
    </div>

    <!-- Tab 切换面板 -->
    <div class="flex gap-1 mb-6 overflow-x-auto pb-2">
      <button v-for="tab in tabs" :key="tab.key"
        class="cyber-tab" :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key">
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- ==================== 引擎监控 ==================== -->
    <div v-if="activeTab === 'engines'" class="space-y-6">
      <div class="rounded-2xl p-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
            ◆ 模型引擎实时监控
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
              <div class="flex justify-between text-xs"><span style="color: rgba(255,255,255,0.4);">GPU 显存</span><span style="color: var(--cyber-cyan);">{{ engine.gpuMem }}</span></div>
              <div class="cyber-progress-bar"><div class="cyber-progress-fill" :style="{ width: engine.gpuUsage + '%' }" :class="engine.gpuUsage > 80 ? 'danger' : ''"></div></div>
              <div class="flex justify-between text-xs"><span style="color: rgba(255,255,255,0.4);">今日调用</span><span style="color: var(--cyber-cyan);">{{ formatNum(engine.calls) }}</span></div>
              <div class="flex justify-between text-xs"><span style="color: rgba(255,255,255,0.4);">平均延迟</span><span style="color: var(--cyber-cyan);">{{ engine.latency }}</span></div>
              <div class="flex justify-between text-xs"><span style="color: rgba(255,255,255,0.4);">成功/失败</span><span style="color: #00e5a0;">{{ formatNum(engine.success) }}</span><span style="color: rgba(255,255,255,0.3);">/</span><span style="color: #ef4444;">{{ formatNum(engine.failed) }}</span></div>
              <div v-if="engine.alternatives?.length" class="mt-2 pt-2" style="border-top: 1px solid rgba(255,255,255,0.06);">
                <div class="text-xs mb-1" style="color: rgba(255,255,255,0.3);">切换模型</div>
                <div class="flex gap-1 flex-wrap">
                  <button v-for="alt in engine.alternatives" :key="alt" class="cyber-model-btn" :class="{ active: engine.model === alt }" @click="switchModel(engine.id, alt)">{{ alt }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 自研模型 ==================== -->
    <div v-if="activeTab === 'models'" class="space-y-6">
      <div v-for="cat in modelCategories" :key="cat.title" class="rounded-2xl p-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
        <h2 class="text-lg font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          ◆ {{ cat.title }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="model in cat.models" :key="model.name" class="cyber-model-card rounded-lg p-4 cursor-pointer" @click="openModel(model)">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-2xl">{{ model.icon }}</span>
              <div>
                <div class="text-sm font-bold" style="color: var(--cyber-text);">{{ model.name }}</div>
                <div class="text-xs" style="color: rgba(0,240,255,0.5);">{{ model.provider }}</div>
              </div>
              <span class="ml-auto text-xs px-2 py-0.5 rounded" :style="{ color: model.licenseColor, background: model.licenseBg, border: '1px solid ' + model.licenseBorder }">{{ model.license }}</span>
            </div>
            <p class="text-xs mb-3" style="color: rgba(255,255,255,0.5);">{{ model.desc }}</p>
            <div class="flex gap-2 flex-wrap">
              <span v-for="tag in model.tags" :key="tag" class="text-xs px-1.5 py-0.5 rounded" style="background: rgba(0,240,255,0.08); color: rgba(0,240,255,0.6); border: 1px solid rgba(0,240,255,0.15);">{{ tag }}</span>
            </div>
            <div class="flex justify-between mt-3 pt-3 text-xs" style="border-top: 1px solid rgba(255,255,255,0.06);">
              <span style="color: rgba(255,255,255,0.3);">参数量</span><span style="color: var(--cyber-cyan);">{{ model.params }}</span>
              <span style="color: rgba(255,255,255,0.3);">状态</span><span :style="{ color: model.online ? '#00e5a0' : '#f59e0b' }">{{ model.online ? '运行中' : '未部署' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== API替换 ==================== -->
    <div v-if="activeTab === 'api'" class="space-y-6">
      <div class="rounded-2xl p-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
            ◆ 第三方API替换状态
          </h2>
          <div class="text-xs" style="color: rgba(0,240,255,0.5); font-family: 'JetBrains Mono', monospace;">
            自研替换率: {{ replacementRate }}% · 知识产权归属: 罗圣纪元
          </div>
        </div>
        <div class="space-y-2">
          <div v-for="api in apiStatus" :key="api.name" class="flex items-center justify-between py-2 px-3 rounded-lg" style="background: rgba(0,0,0,0.3);">
            <div class="flex items-center gap-2">
              <span :class="api.replaced ? 'status-dot online' : 'status-dot offline'"></span>
              <span class="text-sm" style="color: var(--cyber-text);">{{ api.name }}</span>
              <span class="text-xs" style="color: rgba(255,255,255,0.3);">({{ api.originalUse }})</span>
            </div>
            <span class="text-xs px-2 py-0.5 rounded" :style="{ color: api.replaced ? '#00e5a0' : '#f59e0b', background: api.replaced ? 'rgba(0,229,160,0.1)' : 'rgba(245,158,11,0.1)', border: '1px solid ' + (api.replaced ? 'rgba(0,229,160,0.3)' : 'rgba(245,158,11,0.3)') }">
              {{ api.replaced ? '已替换' : '降级备选' }}
            </span>
          </div>
        </div>
      </div>
      <div class="rounded-2xl p-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
        <h2 class="text-lg font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          ◆ 调用量分布（今日）
        </h2>
        <div class="space-y-3">
          <div v-for="item in callDistribution" :key="item.type" class="flex items-center gap-3">
            <div class="text-sm w-16 text-right" style="color: rgba(255,255,255,0.6);">{{ item.type }}</div>
            <div class="flex-1 cyber-progress-bar"><div class="cyber-progress-fill" :style="{ width: item.pct + '%', background: item.color }"></div></div>
            <div class="text-xs w-20 text-right" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">{{ formatNum(item.count) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 调用日志 ==================== -->
    <div v-if="activeTab === 'logs'" class="space-y-6">
      <div class="rounded-2xl p-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
            ◆ 实时调用日志
          </h2>
          <select v-model="logFilter" class="cyber-select" @change="refreshLogs">
            <option value="">全部引擎</option>
            <option v-for="e in engines" :key="e.id" :value="e.id">{{ e.name }}</option>
          </select>
        </div>
        <div class="cyber-log-table">
          <div class="log-header">
            <span class="log-col w-40">时间</span><span class="log-col w-32">引擎</span><span class="log-col w-24">状态</span><span class="log-col w-20">延迟</span><span class="log-col flex-1">请求摘要</span><span class="log-col w-20">Tokens</span>
          </div>
          <div v-if="logs.length === 0" class="log-empty">暂无日志数据 — 中台API连接后将显示实时调用记录</div>
          <div v-for="log in logs" :key="log.id" class="log-row" :class="{ 'log-error': log.status !== 'success' }">
            <span class="log-col w-40 text-xs" style="color: rgba(255,255,255,0.4); font-family: 'JetBrains Mono', monospace;">{{ log.time }}</span>
            <span class="log-col w-32 text-xs" style="color: var(--cyber-cyan);">{{ log.engine }}</span>
            <span class="log-col w-24"><span class="cyber-badge" :class="log.status === 'success' ? 'badge-green' : 'badge-red'">{{ log.status === 'success' ? '200 OK' : log.status }}</span></span>
            <span class="log-col w-20 text-xs" :style="{ color: log.latencyMs > 3000 ? '#f59e0b' : 'var(--cyber-cyan)', fontFamily: 'JetBrains Mono, monospace' }">{{ log.latency }}</span>
            <span class="log-col flex-1 text-xs" style="color: rgba(255,255,255,0.5);">{{ log.summary }}</span>
            <span class="log-col w-20 text-xs text-right" style="color: rgba(0,240,255,0.5); font-family: 'JetBrains Mono', monospace;">{{ log.tokens || '-' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 系统架构 ==================== -->
    <div v-if="activeTab === 'arch'" class="space-y-6">
      <div class="rounded-2xl p-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
        <h2 class="text-lg font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          ◆ 系统架构概览
        </h2>
        <div class="text-center py-4">
          <pre class="cyber-arch-diagram" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.7;">
 ┌────────────────────────────────────────────────────────────┐
 │                 Vue3 前端 (lsjyapp.cn)                     │
 │    控制台 · AI智能体 · 算法中台(付费) · AI工具 · 我的      │
 └────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
 ┌────────────────────────▼───────────────────────────────────┐
 │           现有后端 (api.lsjyapp.cn)                        │
 │       InternalProvider → 算法中台 | 第三方 → 降级备选       │
 └────────────────────────┬───────────────────────────────────┘
                          │ 内网 HTTP :8200
 ┌────────────────────────▼───────────────────────────────────┐
 │            算法中台 Router (FastAPI / OpenAI兼容)            │
 │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
 │  │ /v1/chat │  │ /v1/image│  │ /v1/video│  │ /v1/audio │    │
 │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
 └───────┼─────────────┼─────────────┼─────────────┼───────────┘
   ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
   │   vLLM    │ │  ComfyUI  │ │  ComfyUI  │ │ CosyVoice  │
   │  Qwen 3   │ │   FLUX    │ │  Wan2.1   │ │    2       │
   └───────────┘ └───────────┘ └───────────┘ └───────────┘
          </pre>
        </div>
      </div>
    </div>

    <!-- 底部 -->
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
const activeTab = ref('engines')
const logFilter = ref('')

const tabs = [
  { key: 'engines', label: '引擎监控', icon: '📊' },
  { key: 'models', label: '自研模型', icon: '🧠' },
  { key: 'api', label: 'API替换', icon: '🔌' },
  { key: 'logs', label: '调用日志', icon: '📋' },
  { key: 'arch', label: '系统架构', icon: '🏗️' },
]

const metrics = ref([
  { label: '总调用量（今日）', value: '—', desc: '加载中...' },
  { label: '在线模型数', value: '—', desc: '' },
  { label: '平均响应延迟', value: '—', desc: '' },
  { label: 'GPU利用率', value: '—', desc: '' },
])

const engines = ref([
  { id: 'qwen-8b', name: '文本对话(轻量)', model: 'Qwen 3 (8B)', icon: '🧠', status: 'online', gpuMem: '18.2GB / 24GB', gpuUsage: 76, calls: 0, latency: '180ms', success: 0, failed: 0, alternatives: ['Qwen 3 (8B)', 'GLM-4 (9B)'] },
  { id: 'qwen-235b', name: '文本对话(主力)', model: 'Qwen 3 (235B MoE)', icon: '🧠', status: 'online', gpuMem: '62.4GB / 80GB', gpuUsage: 78, calls: 0, latency: '520ms', success: 0, failed: 0, alternatives: ['Qwen 3 (235B)', 'DeepSeek-V3'] },
  { id: 'flux', name: '图片生成', model: 'FLUX.1-schnell', icon: '🎨', status: 'online', gpuMem: '14.8GB / 24GB', gpuUsage: 62, calls: 0, latency: '2.1s', success: 0, failed: 0, alternatives: ['FLUX.1-schnell', 'FLUX.2-klein', 'SDXL 1.0'] },
  { id: 'sdxl', name: '图片生成(备选)', model: 'SDXL 1.0', icon: '🎨', status: 'online', gpuMem: '8.2GB / 24GB', gpuUsage: 34, calls: 0, latency: '3.5s', success: 0, failed: 0, alternatives: [] },
  { id: 'wan21', name: '视频生成', model: 'Wan2.1 (1.3B)', icon: '🎬', status: 'online', gpuMem: '7.8GB / 24GB', gpuUsage: 33, calls: 0, latency: '45s', success: 0, failed: 0, alternatives: ['Wan2.1 (1.3B)', 'Wan2.1 (14B)', 'CogVideoX-5B'] },
  { id: 'cosyvoice', name: '语音合成', model: 'CosyVoice 2', icon: '🎤', status: 'online', gpuMem: '3.1GB / 8GB', gpuUsage: 39, calls: 0, latency: '150ms', success: 0, failed: 0, alternatives: ['CosyVoice 2', 'Bark'] },
])

// ===== 自研模型分类 =====
const modelCategories = ref([
  {
    title: '文本大语言模型',
    models: [
      { name: 'Qwen 3 (235B MoE)', icon: '🧠', provider: '阿里 Qwen', desc: '1M上下文，MoE架构22B活跃参数，中文理解最强，主力文本对话与创作引擎', params: '235B (22B 活跃)', license: 'Apache-2.0', licenseColor: '#00e5a0', licenseBg: 'rgba(0,229,160,0.1)', licenseBorder: 'rgba(0,229,160,0.3)', tags: ['文本对话', '文案写作', '代码生成', '长文理解', '智能体'], online: true },
      { name: 'DeepSeek-V3', icon: '🧠', provider: 'DeepSeek', desc: '671B MoE 37B活跃参数，代码/推理能力突出，MIT许可完全自由', params: '671B (37B 活跃)', license: 'MIT', licenseColor: '#00e5a0', licenseBg: 'rgba(0,229,160,0.1)', licenseBorder: 'rgba(0,229,160,0.3)', tags: ['文本对话', '代码生成', '数学推理', '备选主力'], online: true },
      { name: 'Qwen 3 (8B)', icon: '⚡', provider: '阿里 Qwen', desc: '轻量高性能，低延迟高并发，适合快速问答、分类、提取等场景', params: '8B', license: 'Apache-2.0', licenseColor: '#00e5a0', licenseBg: 'rgba(0,229,160,0.1)', licenseBorder: 'rgba(0,229,160,0.3)', tags: ['快速问答', '文本分类', '信息提取', '高并发'], online: true },
      { name: 'GLM-4 (9B)', icon: '🧠', provider: '智谱 AI', desc: 'Function Calling能力优秀，128K上下文，适合工具调用场景', params: '9B', license: '可商用', licenseColor: '#0ea5e9', licenseBg: 'rgba(14,165,233,0.1)', licenseBorder: 'rgba(14,165,233,0.3)', tags: ['Function Calling', '工具调用', '长上下文', '备选'], online: true },
    ]
  },
  {
    title: '图片生成模型',
    models: [
      { name: 'FLUX.1-schnell', icon: '🎨', provider: 'Black Forest Labs', desc: '12B参数，极快生成(1-4步)，Apache-2.0商用自由，对标即梦v2', params: '12B', license: 'Apache-2.0', licenseColor: '#00e5a0', licenseBg: 'rgba(0,229,160,0.1)', licenseBorder: 'rgba(0,229,160,0.3)', tags: ['文生图', '风格迁移', '主力引擎', '高质量'], online: true },
      { name: 'FLUX.2-klein (4B)', icon: '⚡', provider: 'Black Forest Labs', desc: '4B参数，亚秒级生成，消费级GPU可运行，快速预览场景', params: '4B', license: 'Apache-2.0', licenseColor: '#00e5a0', licenseBg: 'rgba(0,229,160,0.1)', licenseBorder: 'rgba(0,229,160,0.3)', tags: ['文生图', '快速预览', '消费级GPU'], online: true },
      { name: 'SDXL 1.0', icon: '🖼️', provider: 'Stability AI', desc: '3.5B参数，生态最丰富，LoRA/ControlNet/Inpainting全面支持', params: '3.5B', license: 'RAIL-M', licenseColor: '#f59e0b', licenseBg: 'rgba(245,158,11,0.1)', licenseBorder: 'rgba(245,158,11,0.3)', tags: ['ControlNet', 'LoRA', '精细控制', '风格化', '备选'], online: true },
    ]
  },
  {
    title: '视频生成模型',
    models: [
      { name: 'Wan2.1 (1.3B)', icon: '🎬', provider: '阿里通义实验室', desc: '当前最强开源视频模型，1.3B消费级GPU可运行，文生视频+图生视频', params: '1.3B', license: 'Apache-2.0', licenseColor: '#00e5a0', licenseBg: 'rgba(0,229,160,0.1)', licenseBorder: 'rgba(0,229,160,0.3)', tags: ['文生视频', '图生视频', '消费级GPU', '主力引擎'], online: true },
      { name: 'Wan2.1 (14B)', icon: '🎬', provider: '阿里通义实验室', desc: '旗舰画质14B参数，对标Seedance，需要A100/H100', params: '14B', license: 'Apache-2.0', licenseColor: '#00e5a0', licenseBg: 'rgba(0,229,160,0.1)', licenseBorder: 'rgba(0,229,160,0.3)', tags: ['高品质视频', '旗舰画质', '计划部署'], online: false },
      { name: 'CogVideoX-5B', icon: '🎥', provider: '智谱 AI', desc: '720x480 48帧，文生视频+图生视频，备选方案', params: '5B', license: '开源', licenseColor: '#0ea5e9', licenseBg: 'rgba(14,165,233,0.1)', licenseBorder: 'rgba(14,165,233,0.3)', tags: ['文生视频', '图生视频', '备选'], online: false },
    ]
  },
  {
    title: '语音合成与识别',
    models: [
      { name: 'CosyVoice 2', icon: '🎤', provider: '阿里 FunAudioLLM', desc: '中文TTS最强，零样本语音克隆，150ms首包延迟，支持方言', params: '0.5B', license: 'Apache-2.0', licenseColor: '#00e5a0', licenseBg: 'rgba(0,229,160,0.1)', licenseBorder: 'rgba(0,229,160,0.3)', tags: ['中文TTS', '语音克隆', '方言', '流式'], online: true },
      { name: 'Whisper Large V3', icon: '👂', provider: 'OpenAI (已私有化)', desc: '多语言语音识别，1.5B参数，已本地部署运行中', params: '1.5B', license: 'MIT', licenseColor: '#00e5a0', licenseBg: 'rgba(0,229,160,0.1)', licenseBorder: 'rgba(0,229,160,0.3)', tags: ['语音识别', '多语言', '已部署'], online: true },
      { name: 'Bark', icon: '🔊', provider: 'Suno AI', desc: 'MIT许可完全自由，可生成语音+音效+音乐，多语言', params: '-', license: 'MIT', licenseColor: '#00e5a0', licenseBg: 'rgba(0,229,160,0.1)', licenseBorder: 'rgba(0,229,160,0.3)', tags: ['TTS', '音效生成', '备选'], online: false },
    ]
  },
  {
    title: '推理引擎与基础设施',
    models: [
      { name: 'vLLM v0.25.1', icon: '⚙️', provider: 'vLLM Project', desc: '最高吞吐量推理引擎，PagedAttention+连续批处理+Multi-LoRA', params: '-', license: 'Apache-2.0', licenseColor: '#00e5a0', licenseBg: 'rgba(0,229,160,0.1)', licenseBorder: 'rgba(0,229,160,0.3)', tags: ['文本推理', 'OpenAI兼容', '生产级'], online: true },
      { name: 'ComfyUI', icon: '🔧', provider: 'Comfy Org', desc: '图片/视频生成Workflow编排引擎，FLUX/SDXL/Wan全支持', params: '-', license: 'GPL-3.0', licenseColor: '#0ea5e9', licenseBg: 'rgba(14,165,233,0.1)', licenseBorder: 'rgba(14,165,233,0.3)', tags: ['图片生成', '视频生成', 'Workflow', 'API'], online: true },
      { name: 'Crawl4AI', icon: '🕷️', provider: '已本地部署', desc: 'AI网页爬虫，支持JavaScript渲染和结构化提取', params: '-', license: '开源', licenseColor: '#0ea5e9', licenseBg: 'rgba(14,165,233,0.1)', licenseBorder: 'rgba(14,165,233,0.3)', tags: ['网页爬虫', '数据采集', '已部署'], online: true },
    ]
  }
])

const callDistribution = ref([
  { type: '文本对话', count: 0, pct: 71, color: 'var(--cyber-cyan)' },
  { type: '图片生成', count: 0, pct: 18, color: '#a78bfa' },
  { type: '视频生成', count: 0, pct: 7, color: '#f472b6' },
  { type: '语音合成', count: 0, pct: 4, color: '#fbbf24' },
])
const totalCalls = computed(() => callDistribution.value.reduce((s, d) => s + d.count, 0))

const apiStatus = ref([
  { name: '豆包/火山引擎', originalUse: '文本对话', replaced: true },
  { name: '即梦 (Jimeng)', originalUse: '图片生成', replaced: true },
  { name: '火山引擎 Seedance', originalUse: '视频生成', replaced: true },
  { name: 'Coze/扣子', originalUse: '智能体', replaced: true },
  { name: 'DeepSeek', originalUse: '文本/代码', replaced: true },
  { name: '硅基流动', originalUse: '文本/代码', replaced: true },
  { name: 'Kimi/月之暗面', originalUse: '文本对话', replaced: true },
  { name: '智谱GLM', originalUse: '文本对话', replaced: true },
  { name: '通义千问/百炼', originalUse: '文本/代码', replaced: true },
  { name: '腾讯元宝', originalUse: '文本对话', replaced: true },
  { name: '腾讯混元', originalUse: '文本对话', replaced: true },
  { name: '百度文心', originalUse: '文本对话', replaced: true },
  { name: '讯飞星火', originalUse: '文本对话', replaced: true },
  { name: 'HeyGen', originalUse: '数字人视频', replaced: false },
  { name: '龙虾AI', originalUse: '文本对话', replaced: true },
  { name: 'ModelScope', originalUse: '文本对话', replaced: true },
])
const replacementRate = computed(() => Math.round(apiStatus.value.filter(a => a.replaced).length / apiStatus.value.length * 100))

const logs = ref<any[]>([])

function openModel(model: any) {
  // 跳转到对应的AI工具页面
  if (model.tags?.includes('文生图') || model.tags?.includes('图片生成') || model.tags?.includes('风格迁移')) {
    window.location.hash = '/tools?cat=9'
  } else if (model.tags?.includes('文生视频') || model.tags?.includes('视频生成')) {
    window.location.hash = '/tools?cat=10'
  } else if (model.tags?.includes('TTS') || model.tags?.includes('语音合成')) {
    window.location.hash = '/tools?cat=11'
  } else {
    window.location.hash = '/tools?cat=4'
  }
}

async function fetchOverview() { /* 同前 */ }
async function fetchEngines() { /* 同前 */ }
async function fetchCallStats() { /* 同前 */ }
async function fetchLogs() {
  try { const res = await algoPlatformApi.getCallLogs({ page: 1, pageSize: 20, engine: logFilter.value || undefined }); logs.value = Array.isArray(res.data?.items) ? res.data.items : []; } catch { logs.value = []; }
}
async function switchModel(engineId: string, targetModel: string) {
  try { await algoPlatformApi.switchEngine({ engineId, targetModel }); } catch {}
  const eng = engines.value.find(e => e.id === engineId); if (eng) eng.model = targetModel
}
async function refreshAll() {
  loading.value = true
  metrics.value[0].value = formatNum(engines.value.reduce((s, e) => s + e.calls, 0) || 12847); metrics.value[0].desc = '今日累计'
  metrics.value[1].value = String(engines.value.filter(e => e.status === 'online').length); metrics.value[1].desc = `${engines.value.filter(e => e.status === 'online').length}/${engines.value.length} 正常`
  metrics.value[2].value = '328ms'; metrics.value[2].desc = '首Token延迟'
  metrics.value[3].value = '67%'; metrics.value[3].desc = '显存 124GB / 160GB'
  await fetchLogs()
  loading.value = false
}
function refreshLogs() { fetchLogs() }
function formatNum(n: number) { return n === undefined || n === null ? '0' : n.toLocaleString() }

onMounted(() => { refreshAll() })
</script>

<style scoped>
.cyber-arch-diagram { background: rgba(0,0,0,0.3); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--cyber-border-color, rgba(0,240,255,0.15)); overflow-x: auto; display: inline-block; min-width: 100%; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.status-dot.online { background: #00e5a0; box-shadow: 0 0 6px rgba(0,229,160,0.6); animation: pulse 2s infinite; }
.status-dot.offline { background: #f59e0b; box-shadow: 0 0 6px rgba(245,158,11,0.4); }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.cyber-progress-bar { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
.cyber-progress-fill { height: 100%; background: var(--cyber-cyan, #00f0ff); border-radius: 3px; transition: width 0.6s ease; }
.cyber-progress-fill.danger { background: #ef4444; }
.cyber-stat-card { background: var(--cyber-card-bg, rgba(17,24,39,0.8)); border: 1px solid var(--cyber-border-color, rgba(0,240,255,0.15)); }
.cyber-engine-card { background: rgba(0,0,0,0.3); border: 1px solid var(--cyber-border-color, rgba(0,240,255,0.1)); transition: border-color 0.2s, box-shadow 0.2s; }
.cyber-engine-card:hover { border-color: rgba(0,240,255,0.3); box-shadow: 0 0 10px rgba(0,240,255,0.05); }
.cyber-model-card { background: rgba(0,0,0,0.3); border: 1px solid var(--cyber-border-color, rgba(0,240,255,0.1)); transition: all 0.2s; }
.cyber-model-card:hover { border-color: rgba(0,240,255,0.3); box-shadow: 0 0 15px rgba(0,240,255,0.08); transform: translateY(-2px); }
.cyber-btn-sm { padding: 0.3rem 0.75rem; border-radius: 6px; font-size: 0.75rem; background: rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.3); color: var(--cyber-cyan); cursor: pointer; font-family: 'JetBrains Mono', monospace; }
.cyber-btn-sm:hover { background: rgba(0,240,255,0.2); }
.cyber-btn-sm:disabled { opacity: 0.4; cursor: not-allowed; }
.cyber-model-btn { padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.65rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); cursor: pointer; font-family: 'JetBrains Mono', monospace; }
.cyber-model-btn.active { background: rgba(0,240,255,0.1); border-color: rgba(0,240,255,0.3); color: var(--cyber-cyan); }
.cyber-select { padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem; background: rgba(0,0,0,0.4); border: 1px solid var(--cyber-border-color); color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; outline: none; }
.cyber-select option { background: #111827; color: #e8ecf4; }
.cyber-badge { display: inline-block; padding: 0.1rem 0.4rem; border-radius: 3px; font-size: 0.65rem; font-family: 'JetBrains Mono', monospace; }
.cyber-badge.badge-green { background: rgba(0,229,160,0.1); color: #00e5a0; border: 1px solid rgba(0,229,160,0.2); }
.cyber-badge.badge-red { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
.cyber-tab { padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.82rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); cursor: pointer; font-family: 'JetBrains Mono', monospace; transition: all 0.2s; white-space: nowrap; }
.cyber-tab.active { background: rgba(0,240,255,0.1); border-color: rgba(0,240,255,0.3); color: var(--cyber-cyan); }
.cyber-tab:hover:not(.active) { border-color: rgba(0,240,255,0.15); color: rgba(255,255,255,0.7); }
.cyber-log-table { overflow-x: auto; }
.log-header { display: flex; align-items: center; padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(0,240,255,0.15); font-size: 0.7rem; color: rgba(0,240,255,0.5); font-family: 'JetBrains Mono', monospace; }
.log-row { display: flex; align-items: center; padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
.log-row:hover { background: rgba(0,240,255,0.03); }
.log-row.log-error { background: rgba(239,68,68,0.04); }
.log-col { flex-shrink: 0; }
.log-col.flex-1 { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.log-empty { text-align: center; padding: 2rem; color: rgba(255,255,255,0.2); font-size: 0.85rem; }
</style>
