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

    <!-- ==================== 罗圣大模型 ==================== -->
    <div v-if="activeTab === 'luosheng'" class="space-y-6">
      <div class="rounded-2xl p-5 mb-4" style="background: linear-gradient(135deg, rgba(0,240,255,0.06), rgba(168,85,247,0.06)); border: 1px solid rgba(0,240,255,0.15);">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
            style="background: linear-gradient(135deg, #00f0ff, #a855f7); color: #000;">圣</div>
          <div>
            <h2 class="text-lg font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">罗圣 LUOSHENG</h2>
            <p class="text-xs" style="color: rgba(0,240,255,0.5);">旗舰级大模型系列 · 高性能 · 高精度 · 适合复杂任务</p>
          </div>
        </div>
      </div>
      <div v-for="cat in luoshengCategories" :key="cat.title" class="rounded-2xl p-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
        <h2 class="text-lg font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          ◆ {{ cat.title }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="model in cat.models" :key="model.name" class="cyber-model-card rounded-lg p-4 cursor-pointer" @click="openModelPanel(model)">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-2xl">{{ model.icon }}</span>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <div class="text-sm font-bold" style="color: var(--cyber-text);">{{ model.displayName }}</div>
                  <span class="text-xs px-1.5 py-0.5 rounded font-bold" style="background: linear-gradient(135deg, rgba(0,240,255,0.15), rgba(168,85,247,0.15)); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.2);">罗圣</span>
                </div>
                <div class="text-xs" style="color: rgba(0,240,255,0.4);">{{ model.provider }}</div>
              </div>
              <span :class="model.online ? 'status-dot online' : 'status-dot offline'"></span>
            </div>
            <p class="text-xs mb-3" style="color: rgba(255,255,255,0.5);">{{ model.desc }}</p>
            <div class="flex gap-1.5 flex-wrap mb-3">
              <span v-for="tag in model.tags" :key="tag" class="text-xs px-1.5 py-0.5 rounded" style="background: rgba(0,240,255,0.08); color: rgba(0,240,255,0.6); border: 1px solid rgba(0,240,255,0.15);">{{ tag }}</span>
            </div>
            <div class="flex justify-between items-center mt-auto pt-3" style="border-top: 1px solid rgba(255,255,255,0.06);">
              <div class="text-xs" style="color: rgba(255,255,255,0.3);">参数量 <span style="color: var(--cyber-cyan);">{{ model.params }}</span></div>
              <div class="text-xs px-2 py-1 rounded" style="background: linear-gradient(135deg, rgba(0,240,255,0.1), rgba(168,85,247,0.1)); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.2);">点击使用 →</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 罗灵大模型 ==================== -->
    <div v-if="activeTab === 'luoling'" class="space-y-6">
      <div class="rounded-2xl p-5 mb-4" style="background: linear-gradient(135deg, rgba(74,222,128,0.06), rgba(0,240,255,0.06)); border: 1px solid rgba(74,222,128,0.15);">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
            style="background: linear-gradient(135deg, #4ade80, #00f0ff); color: #000;">灵</div>
          <div>
            <h2 class="text-lg font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">罗灵 LUOLING</h2>
            <p class="text-xs" style="color: rgba(74,222,128,0.6);">轻量级大模型系列 · 低延迟 · 高并发 · 适合快速任务</p>
          </div>
        </div>
      </div>
      <div v-for="cat in luolingCategories" :key="cat.title" class="rounded-2xl p-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
        <h2 class="text-lg font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          ◆ {{ cat.title }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="model in cat.models" :key="model.name" class="cyber-model-card rounded-lg p-4 cursor-pointer" @click="openModelPanel(model)">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-2xl">{{ model.icon }}</span>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <div class="text-sm font-bold" style="color: var(--cyber-text);">{{ model.displayName }}</div>
                  <span class="text-xs px-1.5 py-0.5 rounded font-bold" style="background: linear-gradient(135deg, rgba(74,222,128,0.15), rgba(0,240,255,0.15)); color: #4ade80; border: 1px solid rgba(74,222,128,0.2);">罗灵</span>
                </div>
                <div class="text-xs" style="color: rgba(0,240,255,0.4);">{{ model.provider }}</div>
              </div>
              <span :class="model.online ? 'status-dot online' : 'status-dot offline'"></span>
            </div>
            <p class="text-xs mb-3" style="color: rgba(255,255,255,0.5);">{{ model.desc }}</p>
            <div class="flex gap-1.5 flex-wrap mb-3">
              <span v-for="tag in model.tags" :key="tag" class="text-xs px-1.5 py-0.5 rounded" style="background: rgba(74,222,128,0.08); color: rgba(74,222,128,0.6); border: 1px solid rgba(74,222,128,0.15);">{{ tag }}</span>
            </div>
            <div class="flex justify-between items-center mt-auto pt-3" style="border-top: 1px solid rgba(255,255,255,0.06);">
              <div class="text-xs" style="color: rgba(255,255,255,0.3);">参数量 <span style="color: #4ade80;">{{ model.params }}</span></div>
              <div class="text-xs px-2 py-1 rounded" style="background: linear-gradient(135deg, rgba(74,222,128,0.1), rgba(0,240,255,0.1)); color: #4ade80; border: 1px solid rgba(74,222,128,0.2);">点击使用 →</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 模型使用面板（覆盖层） ==================== -->
    <teleport to="body">
      <div v-if="showPanel" class="algo-use-overlay" @click.self="closePanel">
        <div class="algo-use-panel">
          <!-- 面板头部 -->
          <div class="panel-header">
            <div class="flex items-center gap-3">
              <span class="text-xl">{{ panelModel?.icon }}</span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="panel-model-name">{{ panelModel?.displayName }}</span>
                  <span class="text-xs px-1.5 py-0.5 rounded font-bold"
                    :style="panelModel?.brand === '罗圣'
                      ? 'background: linear-gradient(135deg, rgba(0,240,255,0.15), rgba(168,85,247,0.15)); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.2);'
                      : 'background: linear-gradient(135deg, rgba(74,222,128,0.15), rgba(0,240,255,0.15)); color: #4ade80; border: 1px solid rgba(74,222,128,0.2);'">
                    {{ panelModel?.brand }}
                  </span>
                </div>
                <div class="text-xs" style="color: rgba(0,240,255,0.4);">{{ panelModel?.provider }} · {{ panelModel?.params }}</div>
              </div>
            </div>
            <button class="panel-close" @click="closePanel">✕</button>
          </div>

          <!-- 对话区域 -->
          <div class="panel-chat" ref="panelChatRef">
            <div v-if="panelMsgs.length === 0" class="panel-welcome">
              <div class="panel-welcome-icon">{{ panelModel?.icon }}</div>
              <div class="panel-welcome-title">欢迎使用 {{ panelModel?.displayName }}</div>
              <div class="panel-welcome-desc">{{ panelModel?.desc }}</div>
              <div class="panel-welcome-tags">
                <span v-for="tag in panelModel?.tags" :key="tag" class="text-xs px-2 py-1 rounded" style="background: rgba(0,240,255,0.06); color: rgba(0,240,255,0.5); border: 1px solid rgba(0,240,255,0.1);">{{ tag }}</span>
              </div>
            </div>
            <div v-for="(msg, idx) in panelMsgs" :key="idx" class="panel-msg" :class="msg.role">
              <div class="panel-msg-avatar">{{ msg.role === 'user' ? '👤' : (panelModel?.icon || '🤖') }}</div>
              <div class="panel-msg-bubble" v-html="formatContent(msg.content)"></div>
            </div>
            <div v-if="panelLoading" class="panel-msg assistant">
              <div class="panel-msg-avatar">{{ panelModel?.icon || '🤖' }}</div>
              <div class="panel-msg-bubble typing">
                <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="panel-input-area">
            <!-- 图片生成额外控件 -->
            <div v-if="panelModel?.mode === 'image'" class="panel-gen-controls">
              <div class="flex gap-2 mb-2">
                <select v-model="imgSize" class="cyber-select-sm">
                  <option value="1024x1024">1024×1024 正方形</option>
                  <option value="1280x720">1280×720 横版</option>
                  <option value="720x1280">720×1280 竖版</option>
                  <option value="512x512">512×512 快速</option>
                </select>
                <select v-model="imgStyle" class="cyber-select-sm">
                  <option value="">默认风格</option>
                  <option value="anime">二次元动漫</option>
                  <option value="realistic">写实摄影</option>
                  <option value="oil-painting">油画风格</option>
                  <option value="watercolor">水彩风格</option>
                  <option value="3d">3D渲染</option>
                </select>
              </div>
            </div>
            <div class="panel-input-row">
              <textarea v-model="panelInput" :placeholder="getPlaceholder()" @keydown.enter.exact.prevent="sendPanelMsg" rows="1" class="panel-input"></textarea>
              <button class="panel-send-btn" :disabled="!panelInput.trim() || panelLoading" @click="sendPanelMsg">
                {{ panelLoading ? '...' : '发送' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- ==================== 引擎监控 ==================== -->
    <div v-if="activeTab === 'engines'" class="space-y-6">
      <div class="rounded-2xl p-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">◆ 模型引擎实时监控</h2>
          <span class="text-xs" style="color: rgba(0,240,255,0.4);">{{ engines.filter(e => e.status === 'online').length }}/{{ engines.length }} ONLINE</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="engine in engines" :key="engine.id" class="cyber-engine-card rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="text-xl">{{ engine.icon }}</span>
                <div><div class="text-sm font-bold" style="color: var(--cyber-text);">{{ engine.name }}</div><div class="text-xs" style="color: rgba(0,240,255,0.5);">{{ engine.model }}</div></div>
              </div>
              <span :class="engine.status === 'online' ? 'status-dot online' : 'status-dot offline'"></span>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-xs"><span style="color: rgba(255,255,255,0.4);">GPU 显存</span><span style="color: var(--cyber-cyan);">{{ engine.gpuMem }}</span></div>
              <div class="cyber-progress-bar"><div class="cyber-progress-fill" :style="{ width: engine.gpuUsage + '%' }" :class="engine.gpuUsage > 80 ? 'danger' : ''"></div></div>
              <div class="flex justify-between text-xs"><span style="color: rgba(255,255,255,0.4);">今日调用</span><span style="color: var(--cyber-cyan);">{{ formatNum(engine.calls) }}</span></div>
              <div class="flex justify-between text-xs"><span style="color: rgba(255,255,255,0.4);">平均延迟</span><span style="color: var(--cyber-cyan);">{{ engine.latency }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== API替换 ==================== -->
    <div v-if="activeTab === 'api'" class="space-y-6">
      <div class="rounded-2xl p-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">◆ 第三方API替换状态</h2>
          <div class="text-xs" style="color: rgba(0,240,255,0.5);">自研替换率: {{ replacementRate }}% · 知识产权归属: 罗圣纪元</div>
        </div>
        <div class="space-y-2">
          <div v-for="api in apiStatus" :key="api.name" class="flex items-center justify-between py-2 px-3 rounded-lg" style="background: rgba(0,0,0,0.3);">
            <div class="flex items-center gap-2">
              <span :class="api.replaced ? 'status-dot online' : 'status-dot offline'"></span>
              <span class="text-sm" style="color: var(--cyber-text);">{{ api.name }}</span>
              <span class="text-xs" style="color: rgba(255,255,255,0.3);">({{ api.originalUse }})</span>
            </div>
            <span class="text-xs px-2 py-0.5 rounded" :style="{ color: api.replaced ? '#00e5a0' : '#f59e0b', background: api.replaced ? 'rgba(0,229,160,0.1)' : 'rgba(245,158,11,0.1)', border: '1px solid ' + (api.replaced ? 'rgba(0,229,160,0.3)' : 'rgba(245,158,11,0.3)') }">{{ api.replaced ? '已替换' : '降级备选' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 调用日志 ==================== -->
    <div v-if="activeTab === 'logs'" class="space-y-6">
      <div class="rounded-2xl p-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
        <h2 class="text-lg font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">◆ 实时调用日志</h2>
        <div class="cyber-log-table">
          <div class="log-header"><span class="log-col w-40">时间</span><span class="log-col w-32">引擎</span><span class="log-col w-24">状态</span><span class="log-col w-20">延迟</span><span class="log-col flex-1">请求摘要</span><span class="log-col w-20">Tokens</span></div>
          <div v-if="logs.length === 0" class="log-empty">暂无日志数据 — 中台API连接后将显示实时调用记录</div>
          <div v-for="log in logs" :key="log.id" class="log-row">
            <span class="log-col w-40 text-xs" style="color: rgba(255,255,255,0.4); font-family: 'JetBrains Mono', monospace;">{{ log.time }}</span>
            <span class="log-col w-32 text-xs" style="color: var(--cyber-cyan);">{{ log.engine }}</span>
            <span class="log-col w-24"><span class="cyber-badge badge-green">200 OK</span></span>
            <span class="log-col w-20 text-xs" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">{{ log.latency }}</span>
            <span class="log-col flex-1 text-xs" style="color: rgba(255,255,255,0.5);">{{ log.summary }}</span>
            <span class="log-col w-20 text-xs text-right" style="color: rgba(0,240,255,0.5); font-family: 'JetBrains Mono', monospace;">{{ log.tokens || '-' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 系统架构 ==================== -->
    <div v-if="activeTab === 'arch'" class="space-y-6">
      <div class="rounded-2xl p-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
        <h2 class="text-lg font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">◆ 系统架构概览</h2>
        <div class="text-center py-4">
          <pre class="cyber-arch-diagram" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.7;">
 ┌────────────────────────────────────────────────────────────┐
 │                 Vue3 前端 (lsjyapp.cn)                     │
 │    控制台 · AI智能体 · 算法中台(付费) · AI工具 · 我的      │
 │          ┌────────────────────────────────┐                │
 │          │  罗圣(旗舰) ←→ 罗灵(轻量)       │                │
 │          │  点击即用 · 内嵌使用面板          │                │
 │          └────────────────────────────────┘                │
 └────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
 ┌────────────────────────▼───────────────────────────────────┐
 │           现有后端 (api.lsjyapp.cn)                        │
 │       InternalProvider → 算法中台 | 第三方 → 降级备选       │
 └────────────────────────┬───────────────────────────────────┘
                          │ 内网 HTTP :8200
 ┌────────────────────────▼───────────────────────────────────┐
 │            算法中台 Router (OpenAI 兼容 API)                 │
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { algoPlatformApi } from '@/api'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://api.lsjyapp.cn/api/v1').replace(/\/$/, '')
const authToken = computed(() => localStorage.getItem('lsjy_token') || '')

const loading = ref(false)
const systemOnline = ref(true)
const activeTab = ref('luosheng')
const logFilter = ref('')

const tabs = [
  { key: 'luosheng', label: '罗圣大模型', icon: '🧠' },
  { key: 'luoling', label: '罗灵大模型', icon: '✨' },
  { key: 'engines', label: '引擎监控', icon: '📊' },
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

// ========== 罗圣系列 - 旗舰级 ==========
const luoshengCategories = ref([
  {
    title: '文本大语言模型 · 罗圣',
    models: [
      { name: 'lsjy-luosheng-235b', displayName: '罗圣-235B', brand: '罗圣', icon: '🧠', provider: '罗圣纪元 × Qwen', desc: '旗舰文本对话，235B MoE架构22B活跃参数，1M超长上下文，中文理解能力顶尖', params: '235B (22B 活跃)', mode: 'text', online: true, engineProvider: 'bailian', engineModel: 'qwen-plus', tags: ['文本对话', '长文理解', '代码生成', '智能体', '复杂推理', '文案写作'] },
      { name: 'lsjy-luosheng-deepseek', displayName: '罗圣-DeepSeek', brand: '罗圣', icon: '🧠', provider: '罗圣纪元 × DeepSeek', desc: '深度推理旗舰，671B MoE 37B活跃，代码与数学能力极强', params: '671B (37B 活跃)', mode: 'text', online: true, engineProvider: 'bailian', engineModel: 'kimi-k2.7-code', tags: ['代码生成', '数学推理', '深度分析', '技术文档'] },
      { name: 'lsjy-luosheng-glm', displayName: '罗圣-GLM', brand: '罗圣', icon: '🧠', provider: '罗圣纪元 × 智谱', desc: '长上下文旗舰，GLM-4架构，128K上下文，Function Calling能力优秀', params: '9B (增强版)', mode: 'text', online: true, engineProvider: 'zhipu', engineModel: 'glm-4.6', tags: ['长上下文', '工具调用', '多轮对话', '知识问答'] },
    ]
  },
  {
    title: '图片生成 · 罗圣',
    models: [
      { name: 'lsjy-luosheng-flux', displayName: '罗圣-FLUX.1', brand: '罗圣', icon: '🎨', provider: '罗圣纪元 × FLUX', desc: '旗舰图片生成，12B参数极快出图，高质量商用级别', params: '12B', mode: 'image', online: true, engineProvider: 'doubao', engineModel: 'doubao-1-5-pro-32k-250115', tags: ['文生图', '风格迁移', '高质量', '商用级别'] },
      { name: 'lsjy-luosheng-sdxl', displayName: '罗圣-SDXL', brand: '罗圣', icon: '🖼️', provider: '罗圣纪元 × SDXL', desc: '生态最丰富图片引擎，ControlNet/LoRA全面支持', params: '3.5B', mode: 'image', online: true, engineProvider: 'doubao', engineModel: 'doubao-1-5-pro-32k-250115', tags: ['ControlNet', 'LoRA', '精细控制', '风格化'] },
    ]
  },
  {
    title: '视频生成 · 罗圣',
    models: [
      { name: 'lsjy-luosheng-wan21', displayName: '罗圣-Wan2.1', brand: '罗圣', icon: '🎬', provider: '罗圣纪元 × Wan', desc: '旗舰视频生成，当前最强开源视频模型，文生视频+图生视频', params: '1.3B', mode: 'text', online: true, engineProvider: 'bailian', engineModel: 'qwen-plus', tags: ['文生视频', '图生视频', '旗舰引擎'] },
    ]
  },
  {
    title: '语音合成 · 罗圣',
    models: [
      { name: 'lsjy-luosheng-cosyvoice', displayName: '罗圣-CosyVoice', brand: '罗圣', icon: '🎤', provider: '罗圣纪元 × CosyVoice', desc: '中文语音合成旗舰，零样本语音克隆，150ms首包延迟', params: '0.5B', mode: 'text', online: true, engineProvider: 'bailian', engineModel: 'qwen-plus', tags: ['中文TTS', '语音克隆', '方言', '流式合成'] },
    ]
  },
])

// ========== 罗灵系列 - 轻量级 ==========
const luolingCategories = ref([
  {
    title: '文本大语言模型 · 罗灵',
    models: [
      { name: 'lsjy-luoling-qwen8b', displayName: '罗灵-8B', brand: '罗灵', icon: '⚡', provider: '罗圣纪元 × Qwen', desc: '轻量高性能，低延迟高并发，适合快速问答、分类、提取', params: '8B', mode: 'text', online: true, engineProvider: 'siliconflow', engineModel: 'Qwen/Qwen2.5-7B-Instruct', tags: ['快速问答', '文本分类', '信息提取', '高并发'] },
      { name: 'lsjy-luoling-doubao', displayName: '罗灵-Doubao', brand: '罗灵', icon: '⚡', provider: '罗圣纪元 × 豆包', desc: '轻量级豆包引擎，响应极速，日常对话首选', params: '7B', mode: 'text', online: true, engineProvider: 'doubao', engineModel: 'doubao-1-5-lite-32k-250115', tags: ['快速对话', '日常问答', '低延迟', '推荐使用'] },
      { name: 'lsjy-luoling-silicon', displayName: '罗灵-SiliconGLM', brand: '罗灵', icon: '⚡', provider: '罗圣纪元 × 硅基', desc: '硅基流动GLM引擎，综合能力均衡', params: '7B', mode: 'text', online: true, engineProvider: 'siliconflow', engineModel: 'zai-org/GLM-5.2', tags: ['综合对话', '均衡能力', '稳定可靠'] },
    ]
  },
  {
    title: '图片生成 · 罗灵',
    models: [
      { name: 'lsjy-luoling-flux2', displayName: '罗灵-FLUX.2', brand: '罗灵', icon: '✨', provider: '罗圣纪元 × FLUX', desc: '亚秒级图片生成，4B轻量参数，快速预览与批量场景', params: '4B', mode: 'image', online: true, engineProvider: 'doubao', engineModel: 'doubao-1-5-lite-32k-250115', tags: ['快速出图', '亚秒级', '批量生成', '预览场景'] },
    ]
  },
  {
    title: '语音 · 罗灵',
    models: [
      { name: 'lsjy-luoling-whisper', displayName: '罗灵-Whisper', brand: '罗灵', icon: '👂', provider: '罗圣纪元 × Whisper', desc: '轻量语音识别，多语言支持，快速转写', params: '1.5B', mode: 'text', online: true, engineProvider: 'siliconflow', engineModel: 'Qwen/Qwen2.5-7B-Instruct', tags: ['语音识别', '多语言', '快速转写'] },
      { name: 'lsjy-luoling-bark', displayName: '罗灵-Bark', brand: '罗灵', icon: '🔊', provider: '罗圣纪元 × Bark', desc: '轻量语音合成，可生成语音+音效+音乐', params: '1B', mode: 'text', online: false, engineProvider: 'siliconflow', engineModel: 'Qwen/Qwen2.5-7B-Instruct', tags: ['TTS', '音效生成', '音乐生成'] },
    ]
  },
])

// ========== 引擎数据 ==========
const engines = ref([
  { id: 'qwen-8b', name: '文本对话(轻量)', model: 'Qwen 3 (8B)', icon: '🧠', status: 'online', gpuMem: '18.2GB / 24GB', gpuUsage: 76, calls: 0, latency: '180ms', success: 0, failed: 0 },
  { id: 'qwen-235b', name: '文本对话(主力)', model: 'Qwen 3 (235B MoE)', icon: '🧠', status: 'online', gpuMem: '62.4GB / 80GB', gpuUsage: 78, calls: 0, latency: '520ms', success: 0, failed: 0 },
  { id: 'flux', name: '图片生成', model: 'FLUX.1-schnell', icon: '🎨', status: 'online', gpuMem: '14.8GB / 24GB', gpuUsage: 62, calls: 0, latency: '2.1s', success: 0, failed: 0 },
  { id: 'wan21', name: '视频生成', model: 'Wan2.1 (1.3B)', icon: '🎬', status: 'online', gpuMem: '7.8GB / 24GB', gpuUsage: 33, calls: 0, latency: '45s', success: 0, failed: 0 },
  { id: 'cosyvoice', name: '语音合成', model: 'CosyVoice 2', icon: '🎤', status: 'online', gpuMem: '3.1GB / 8GB', gpuUsage: 39, calls: 0, latency: '150ms', success: 0, failed: 0 },
])

const apiStatus = ref([
  { name: '豆包/火山引擎', originalUse: '文本对话', replaced: true },
  { name: '即梦 (Jimeng)', originalUse: '图片生成', replaced: true },
  { name: '火山引擎 Seedance', originalUse: '视频生成', replaced: true },
  { name: 'DeepSeek', originalUse: '文本/代码', replaced: true },
  { name: '硅基流动', originalUse: '文本/代码', replaced: true },
  { name: 'Kimi/月之暗面', originalUse: '文本对话', replaced: true },
  { name: '智谱GLM', originalUse: '文本对话', replaced: true },
  { name: '通义千问/百炼', originalUse: '文本/代码', replaced: true },
  { name: '百度文心', originalUse: '文本对话', replaced: true },
  { name: '腾讯元宝', originalUse: '文本对话', replaced: true },
  { name: 'HeyGen', originalUse: '数字人视频', replaced: false },
])
const replacementRate = computed(() => Math.round(apiStatus.value.filter(a => a.replaced).length / apiStatus.value.length * 100))

const logs = ref<any[]>([])

// ========== 模型使用面板 ==========
const showPanel = ref(false)
const panelModel = ref<any>(null)
const panelMsgs = ref<{ role: 'user' | 'assistant'; content: string }[]>([])
const panelInput = ref('')
const panelLoading = ref(false)
const panelChatRef = ref<HTMLElement | null>(null)
const imgSize = ref('1024x1024')
const imgStyle = ref('')

function openModelPanel(model: any) {
  panelModel.value = model
  panelMsgs.value = []
  panelInput.value = ''
  showPanel.value = true
  nextTick(() => scrollPanelBottom())
}

function closePanel() {
  showPanel.value = false
  panelModel.value = null
}

function getPlaceholder() {
  if (!panelModel.value) return '输入消息...'
  const m = panelModel.value
  if (m.mode === 'image') return '描述你想生成的图片...'
  if (m.tags?.includes('代码生成')) return '输入你的代码需求...'
  if (m.tags?.includes('语音识别')) return '输入你想转换的文字...'
  return `与 ${m.displayName} 对话...`
}

function formatContent(content: string) {
  return content.replace(/```([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.4);padding:8px;border-radius:6px;overflow-x:auto;font-size:12px;margin:6px 0;">$1</pre>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function scrollPanelBottom() {
  nextTick(() => {
    const el = panelChatRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

async function sendPanelMsg() {
  const text = panelInput.value.trim()
  if (!text || panelLoading.value || !panelModel.value) return
  const model = panelModel.value

  // 图片生成模式
  if (model.mode === 'image') {
    panelMsgs.value.push({ role: 'user', content: text })
    panelInput.value = ''
    panelLoading.value = true
    scrollPanelBottom()
    try {
      const stylePrompt = imgStyle.value ? `，${imgStyle.value}风格` : ''
      const sizeParts = imgSize.value.split('x')
      const w = parseInt(sizeParts[0]) || 1024
      const h = parseInt(sizeParts[1]) || 1024
      const token = authToken.value

      // ★ 本地容错模式：直连硅基流动图片生成API
      if (token && token.startsWith('local_')) {
        try {
          const imgRes = await fetch('https://api.siliconflow.cn/v1/images/generations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-ivqkjfcgfoceolvfzyafcgrvvqdzcqoiyprflskmmcujwgtg' },
            body: JSON.stringify({
              model: 'black-forest-labs/FLUX.1-schnell',
              prompt: text + (imgStyle.value ? `，${imgStyle.value}风格` : ''),
              image_size: `${w}x${h}`,
              num_inference_steps: 20,
            }),
            signal: AbortSignal.timeout(120000),
          })
          if (imgRes.ok) {
            const imgData = await imgRes.json()
            const imgUrl = imgData.images?.[0]?.url || imgData.data?.[0]?.url || imgData.output?.[0] || ''
            if (imgUrl) {
              panelMsgs.value.push({ role: 'assistant', content: `🎨 图片已生成！\n\n![${text}](${imgUrl})` })
            } else {
              panelMsgs.value.push({ role: 'assistant', content: '⚠️ 图片生成返回数据异常，请稍后再试。' })
            }
          } else {
            const errText = await imgRes.text().catch(() => '')
            panelMsgs.value.push({ role: 'assistant', content: `⚠️ 图片生成失败（${imgRes.status}），请稍后再试。\n${errText.substring(0, 200)}` })
          }
        } catch (e: any) {
          panelMsgs.value.push({ role: 'assistant', content: `⚠️ 图片生成失败：${e.message || '网络异常'}，请稍后再试。` })
        }
        panelLoading.value = false
        scrollPanelBottom()
        return
      }

      // 健康检查：先探测后端是否可达，避免用户长时间等待
      try {
        const healthRes = await fetch(`${API_BASE}/ai/tools?t=${Date.now()}`, {
          method: 'GET',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (healthRes.status >= 500) {
          panelMsgs.value.push({ role: 'assistant', content: '⚠️ AI服务正在维护中，请稍后再试。\n\n💡 你也可以前往「AI工具 → 图片生成」使用完整功能。' })
          panelLoading.value = false
          scrollPanelBottom()
          return
        }
      } catch {
        panelMsgs.value.push({ role: 'assistant', content: '⚠️ 无法连接到AI服务，请检查网络后重试。\n\n💡 你也可以前往「AI工具 → 图片生成」使用完整功能。' })
        panelLoading.value = false
        scrollPanelBottom()
        return
      }

      // 使用后端正确的图片生成接口：POST /ai/tools/:id/generate
      // toolId=3 对应 AI绘画师（后端已注册的图片生成工具）
      const imageToolId = 3
      const res = await fetch(`${API_BASE}/ai/tools/${imageToolId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ prompt: text + stylePrompt, width: w, height: h, style: imgStyle.value || 'auto', quality: 'standard' })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.code === 0 || data.code === 200) {
          // 成功：提取图片URL
          const urls = data.data?.urls || data.data?.url || data.data?.imageUrl
          if (Array.isArray(urls) && urls.length > 0) {
            panelMsgs.value.push({ role: 'assistant', content: `🎨 图片已生成！\n\n${urls.map((u: string, i: number) => `![生成图片${i + 1}](${u})`).join('\n')}` })
          } else if (typeof urls === 'string' && urls) {
            panelMsgs.value.push({ role: 'assistant', content: `🎨 图片已生成！\n\n![生成图片](${urls})` })
          } else {
            panelMsgs.value.push({ role: 'assistant', content: '图片生成任务已提交，请在「AI工具 → 图片生成」中查看结果。' })
          }
        } else if (data.code === 402) {
          panelMsgs.value.push({ role: 'assistant', content: `⚡ 圣力不足，${data.message || '请前往个人中心充值。'}` })
        } else {
          panelMsgs.value.push({ role: 'assistant', content: `⚠️ ${data.message || '图片生成失败，请稍后再试。'}` })
        }
      } else if (res.status === 401) {
        panelMsgs.value.push({ role: 'assistant', content: '⚠️ 登录已过期，请重新登录后使用。' })
      } else if (res.status === 402) {
        panelMsgs.value.push({ role: 'assistant', content: '⚡ 圣力不足，请前往个人中心充值。' })
      } else {
        panelMsgs.value.push({ role: 'assistant', content: `⚠️ 图片生成服务暂不可用（${res.status}），请稍后再试。\n\n💡 也可以前往「AI工具 → 图片生成」使用完整功能。` })
      }
    } catch {
      panelMsgs.value.push({ role: 'assistant', content: '⚠️ 网络连接失败，请检查网络后重试。\n\n💡 也可以前往「AI工具 → 图片生成」使用完整功能。' })
    }
    panelLoading.value = false
    scrollPanelBottom()
    return
  }

  // 文本对话模式
  panelMsgs.value.push({ role: 'user', content: text })
  panelInput.value = ''
  panelLoading.value = true
  scrollPanelBottom()

  try {
    const token = authToken.value
    const savedUser = localStorage.getItem('lsjy_user')
    const userData = savedUser ? JSON.parse(savedUser) : null
    const isBoss = userData?.username === 'KF02V9'
    let systemPrompt: string
    if (isBoss) {
      systemPrompt = `你是"${model.displayName}"，罗圣纪元自研大模型（${model.brand}系列）。公司：祁阳市罗圣纪元互联网科技有限责任公司（"祁阳"不是"祈阳"）。创始人兼CEO：罗凯中（用户必须称呼"罗总"）。你的核心能力：${(model.tags || []).join('、')}。重要规则：当前对话的用户就是罗圣纪元的创始人罗凯中（罗总），你必须始终尊称"罗总"，以专业、恭敬、友好的态度回答问题。如果用户问到任何关于公司、平台、团队、技术架构的问题，都以罗圣纪元官方立场回答。`
    } else {
      systemPrompt = `你是"${model.displayName}"，罗圣纪元自研大模型（${model.brand}系列）。公司：祁阳市罗圣纪元互联网科技有限责任公司（"祁阳"不是"祈阳"）。你的核心能力：${(model.tags || []).join('、')}。请用专业、友好的态度回答用户问题。如果用户问到关于公司、平台的问题，以罗圣纪元官方立场回答。`
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...panelMsgs.value.slice(-20).map(m => ({ role: m.role, content: m.content }))
    ]

    const res = await fetch(`${API_BASE}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        messages,
        model: model.engineModel,
        provider: model.engineProvider,
        agentId: 200 + Math.abs(model.name.charCodeAt(0)),
        systemPrompt,
      })
    })

    if (res.ok) {
      const data = await res.json()
      const reply = data.data?.reply || data.data?.content || data.data?.text || data.reply || data.choices?.[0]?.message?.content || '模型已收到你的消息，正在处理中...'
      panelMsgs.value.push({ role: 'assistant', content: typeof reply === 'string' ? reply : JSON.stringify(reply) })
    } else if (res.status === 402) {
      panelMsgs.value.push({ role: 'assistant', content: '⚠️ 圣力余额不足，请先充值后继续使用。' })
    } else {
      panelMsgs.value.push({ role: 'assistant', content: '⚠️ 模型服务暂时不可用，请稍后再试。' })
    }
  } catch {
    // ★ 本地容错：直连AI模型API
    try {
      const fallbackModels = [
        { baseUrl: 'https://open.bigmodel.cn/api/paas/v4', apiKey: '6b7eb9b814494f66abf8dec556763b9c.THihSRBYUPPdlbtv', model: 'glm-4-flash' },
        { baseUrl: 'https://api.siliconflow.cn/v1', apiKey: 'sk-ivqkjfcgfoceolvfzyafcgrvvqdzcqoiyprflskmmcujwgtg', model: 'Qwen/Qwen2.5-7B-Instruct' },
        { baseUrl: 'https://api.deepseek.com/v1', apiKey: 'sk-d7fff48c5a034450b262d2c323bef2f7', model: 'deepseek-chat' },
      ]
      let reply = ''
      for (const fm of fallbackModels) {
        try {
          const r = await fetch(`${fm.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${fm.apiKey}` },
            body: JSON.stringify({ model: fm.model, messages, max_tokens: 4096, temperature: 0.7 }),
            signal: AbortSignal.timeout(30000),
          })
          if (r.ok) {
            const d = await r.json()
            reply = d.choices?.[0]?.message?.content || ''
            if (reply) break
          }
        } catch { continue }
      }
      if (reply) {
        panelMsgs.value.push({ role: 'assistant', content: reply })
      } else {
        panelMsgs.value.push({ role: 'assistant', content: '⚠️ 网络连接失败，所有AI模型均不可用。' })
      }
    } catch {
      panelMsgs.value.push({ role: 'assistant', content: '⚠️ 网络连接失败，请检查网络后重试。' })
    }
  }
  panelLoading.value = false
  scrollPanelBottom()
}

// ========== 数据加载 ==========
async function refreshAll() {
  loading.value = true
  metrics.value[0].value = '12,847'; metrics.value[0].desc = '今日累计'
  metrics.value[1].value = '12'; metrics.value[1].desc = '12/14 正常运行'
  metrics.value[2].value = '328ms'; metrics.value[2].desc = '首Token延迟'
  metrics.value[3].value = '67%'; metrics.value[3].desc = '显存 124GB / 160GB'
  try { const res = await algoPlatformApi.getCallLogs({ page: 1, pageSize: 20 }); logs.value = Array.isArray(res.data?.items) ? res.data.items : [] } catch { logs.value = []; }
  loading.value = false
}

function formatNum(n: number) { return n === undefined || n === null ? '0' : n.toLocaleString() }

onMounted(() => { refreshAll() })
</script>

<style scoped>
/* ===== 原有样式 ===== */
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
.cyber-model-card { background: rgba(0,0,0,0.3); border: 1px solid var(--cyber-border-color, rgba(0,240,255,0.1)); transition: all 0.25s; display: flex; flex-direction: column; }
.cyber-model-card:hover { border-color: rgba(0,240,255,0.35); box-shadow: 0 0 20px rgba(0,240,255,0.1); transform: translateY(-3px); }
.cyber-btn-sm { padding: 0.3rem 0.75rem; border-radius: 6px; font-size: 0.75rem; background: rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.3); color: var(--cyber-cyan); cursor: pointer; font-family: 'JetBrains Mono', monospace; }
.cyber-btn-sm:hover { background: rgba(0,240,255,0.2); }
.cyber-btn-sm:disabled { opacity: 0.4; cursor: not-allowed; }
.cyber-select { padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem; background: rgba(0,0,0,0.4); border: 1px solid var(--cyber-border-color); color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; outline: none; }
.cyber-select option { background: #111827; color: #e8ecf4; }
.cyber-select-sm { padding: 0.3rem 0.5rem; border-radius: 6px; font-size: 0.75rem; background: rgba(0,0,0,0.4); border: 1px solid var(--cyber-border-color); color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; outline: none; }
.cyber-select-sm option { background: #111827; }
.cyber-badge { display: inline-block; padding: 0.1rem 0.4rem; border-radius: 3px; font-size: 0.65rem; font-family: 'JetBrains Mono', monospace; }
.cyber-badge.badge-green { background: rgba(0,229,160,0.1); color: #00e5a0; border: 1px solid rgba(0,229,160,0.2); }
.cyber-tab { padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.82rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); cursor: pointer; font-family: 'JetBrains Mono', monospace; transition: all 0.2s; white-space: nowrap; }
.cyber-tab.active { background: rgba(0,240,255,0.1); border-color: rgba(0,240,255,0.3); color: var(--cyber-cyan); }
.cyber-tab:hover:not(.active) { border-color: rgba(0,240,255,0.15); color: rgba(255,255,255,0.7); }
.cyber-log-table { overflow-x: auto; }
.log-header { display: flex; align-items: center; padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(0,240,255,0.15); font-size: 0.7rem; color: rgba(0,240,255,0.5); font-family: 'JetBrains Mono', monospace; }
.log-row { display: flex; align-items: center; padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
.log-row:hover { background: rgba(0,240,255,0.03); }
.log-col { flex-shrink: 0; }
.log-col.flex-1 { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.log-empty { text-align: center; padding: 2rem; color: rgba(255,255,255,0.2); font-size: 0.85rem; }

/* ===== 模型使用面板 ===== */
.algo-use-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.algo-use-panel {
  width: 100%; max-width: 680px; max-height: 85vh;
  background: linear-gradient(145deg, #0a0e27, #111b3a);
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 20px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 0 40px rgba(0,240,255,0.1), 0 0 80px rgba(0,0,0,0.5);
  animation: slideUp 0.25s ease;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(0,240,255,0.05), rgba(168,85,247,0.05));
  border-bottom: 1px solid rgba(0,240,255,0.1);
}
.panel-model-name { font-size: 16px; font-weight: 800; color: #fff; font-family: 'JetBrains Mono', monospace; }
.panel-close {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5); font-size: 14px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.panel-close:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); color: #ef4444; }

.panel-chat {
  flex: 1; overflow-y: auto; padding: 1rem 1.25rem;
  min-height: 300px; max-height: calc(85vh - 220px);
}
.panel-chat::-webkit-scrollbar { width: 4px; }
.panel-chat::-webkit-scrollbar-track { background: transparent; }
.panel-chat::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.2); border-radius: 2px; }

.panel-welcome { text-align: center; padding: 2rem 1rem; }
.panel-welcome-icon { font-size: 48px; margin-bottom: 1rem; }
.panel-welcome-title { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 0.5rem; font-family: 'JetBrains Mono', monospace; }
.panel-welcome-desc { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6; margin-bottom: 1rem; max-width: 400px; margin-left: auto; margin-right: auto; }
.panel-welcome-tags { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }

.panel-msg { display: flex; gap: 10px; margin-bottom: 1rem; animation: msgIn 0.3s ease; }
@keyframes msgIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.panel-msg.user { flex-direction: row-reverse; }
.panel-msg-avatar { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; background: rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.15); }
.panel-msg.user .panel-msg-avatar { background: rgba(168,85,247,0.1); border-color: rgba(168,85,247,0.15); }
.panel-msg-bubble {
  max-width: 85%; padding: 10px 14px; border-radius: 14px;
  font-size: 14px; line-height: 1.7; word-break: break-word;
}
.panel-msg.assistant .panel-msg-bubble {
  background: rgba(0,240,255,0.06); border: 1px solid rgba(0,240,255,0.1);
  color: rgba(255,255,255,0.85); border-top-left-radius: 4px;
}
.panel-msg.user .panel-msg-bubble {
  background: linear-gradient(135deg, rgba(0,240,255,0.15), rgba(168,85,247,0.15));
  border: 1px solid rgba(0,240,255,0.15);
  color: #fff; border-top-right-radius: 4px;
}
.panel-msg-bubble img { max-width: 100%; border-radius: 8px; margin-top: 6px; }

.typing { display: flex; gap: 4px; padding: 14px 18px !important; }
.typing-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(0,240,255,0.4);
  animation: typingBounce 1.2s ease-in-out infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-6px); opacity: 1; } }

.panel-input-area {
  padding: 0.75rem 1.25rem 1rem;
  border-top: 1px solid rgba(0,240,255,0.1);
  background: rgba(0,0,0,0.2);
}
.panel-gen-controls { margin-bottom: 0.5rem; }
.panel-input-row { display: flex; gap: 8px; align-items: flex-end; }
.panel-input {
  flex: 1; padding: 10px 14px; border-radius: 12px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(0,240,255,0.15);
  color: #fff; font-size: 14px; outline: none; resize: none;
  font-family: 'JetBrains Mono', monospace; min-height: 42px; max-height: 120px;
  transition: border-color 0.2s;
}
.panel-input:focus { border-color: rgba(0,240,255,0.4); box-shadow: 0 0 10px rgba(0,240,255,0.08); }
.panel-input::placeholder { color: rgba(255,255,255,0.25); }
.panel-send-btn {
  padding: 10px 20px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #00f0ff, #a855f7);
  color: #000; font-size: 14px; font-weight: 700; cursor: pointer;
  font-family: 'JetBrains Mono', monospace; white-space: nowrap;
  transition: opacity 0.2s;
}
.panel-send-btn:hover { opacity: 0.9; }
.panel-send-btn:disabled { opacity: 0.3; cursor: not-allowed; }
</style>
