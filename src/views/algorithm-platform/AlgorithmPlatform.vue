<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- 头部 -->
    <div class="cyber-welcome-banner rounded-2xl p-6 mb-6 relative overflow-hidden">
      <div class="welcome-bg-grid"></div>
      <div class="welcome-glow"></div>
      <div class="relative z-10 flex items-center gap-4">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style="background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-magenta)); border: 2px solid rgba(0,240,255,0.4); box-shadow: 0 0 15px rgba(0,240,255,0.3); color: #000;">
          ⚡
        </div>
        <div>
          <h1 class="text-2xl font-bold mb-1" style="font-family: 'JetBrains Mono', monospace; color: var(--cyber-text);">
            自研算法中台
          </h1>
          <p class="text-sm" style="color: rgba(0,240,255,0.7); font-family: 'JetBrains Mono', monospace;">
            PRIVATE AI INFRASTRUCTURE · ALGORITHM MIDDLE PLATFORM · ALL SYSTEMS OPERATIONAL
          </p>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <span class="status-dot online"></span>
          <span class="text-xs" style="color: rgba(0,240,255,0.7); font-family: 'JetBrains Mono', monospace;">● ONLINE</span>
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

    <!-- 模型引擎状态 -->
    <div class="rounded-2xl p-6 mb-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
      <h2 class="text-lg font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
        ◆ 模型引擎状态
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="engine in engines" :key="engine.name" class="cyber-engine-card rounded-lg p-4">
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
              <span style="color: var(--cyber-cyan);">{{ engine.calls.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span style="color: rgba(255,255,255,0.4);">平均延迟</span>
              <span style="color: var(--cyber-cyan);">{{ engine.latency }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模态分布 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- 调用量分布 -->
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
            <div class="text-xs w-20 text-right" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">{{ item.count.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- API兼容状态 -->
      <div class="rounded-2xl p-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
        <h2 class="text-lg font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          ◆ 第三方API替换状态
        </h2>
        <div class="space-y-2">
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
          自研替换率: {{ replacementRate }}%
        </div>
      </div>
    </div>

    <!-- 系统架构 -->
    <div class="rounded-2xl p-6" style="background: var(--cyber-card-bg); border: 1px solid var(--cyber-border-color);">
      <h2 class="text-lg font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
        ◆ 系统架构概览
      </h2>
      <div class="text-center py-6">
        <pre class="cyber-arch-diagram" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.8;">
┌──────────────────────────────────────────────────────┐
│              Vue3 前端 (lsjyapp.cn)                   │
│        无需任何修改 · API协议100%兼容                 │
└──────────────────────┬───────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼───────────────────────────────┐
│         现有后端 (api.lsjyapp.cn)                    │
│     NestJS + Express (Provider层替换)                │
└──────────────────────┬───────────────────────────────┘
                       │ 内网 HTTP
┌──────────────────────▼───────────────────────────────┐
│          算法中台 Router (127.0.0.1:8200)            │
│           OpenAI 兼容API · 模型路由调度               │
└─────┬──────────┬──────────┬──────────┬───────────────┘
      │          │          │          │
  ┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐
  │ vLLM  │ │ComfyUI│ │ComfyUI│ │Cosy   │
  │ Qwen3 │ │ FLUX  │ │ Wan2.1│ │ Voice │
  │ 8B    │ │ SDXL  │ │ 视频  │ │  TTS  │
  └───────┘ └───────┘ └───────┘ └───────┘
        </pre>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="text-center mt-6 text-xs" style="color: rgba(0,240,255,0.3); font-family: 'JetBrains Mono', monospace;">
      ◆ LUOSHENG EPOCH ALGORITHM MIDDLE PLATFORM v1.0 ◆ PRIVATE DEPLOYMENT ◆ ALL RIGHTS RESERVED ◆
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const metrics = ref([
  { label: '总调用量（今日）', value: '12,847', desc: '较昨日 +8.3%' },
  { label: '在线模型数', value: '6', desc: '全部正常运行' },
  { label: '平均响应延迟', value: '328ms', desc: '首Token延迟' },
  { label: 'GPU利用率', value: '67%', desc: '显存 124GB / 160GB' },
])

const engines = ref([
  { name: '文本对话(轻量)', model: 'Qwen 3 (8B)', icon: '🧠', status: 'online', gpuMem: '18.2GB / 24GB', gpuUsage: 76, calls: 5234, latency: '180ms' },
  { name: '文本对话(主力)', model: 'Qwen 3 (235B MoE)', icon: '🧠', status: 'online', gpuMem: '62.4GB / 80GB', gpuUsage: 78, calls: 3891, latency: '520ms' },
  { name: '图片生成', model: 'FLUX.1-schnell', icon: '🎨', status: 'online', gpuMem: '14.8GB / 24GB', gpuUsage: 62, calls: 1847, latency: '2.1s' },
  { name: '图片生成(备选)', model: 'SDXL 1.0', icon: '🎨', status: 'online', gpuMem: '8.2GB / 24GB', gpuUsage: 34, calls: 423, latency: '3.5s' },
  { name: '视频生成', model: 'Wan2.1 (1.3B)', icon: '🎬', status: 'online', gpuMem: '7.8GB / 24GB', gpuUsage: 33, calls: 856, latency: '45s' },
  { name: '语音合成', model: 'CosyVoice 2', icon: '🎤', status: 'online', gpuMem: '3.1GB / 8GB', gpuUsage: 39, calls: 596, latency: '150ms' },
])

const callDistribution = ref([
  { type: '文本对话', count: 9125, pct: 71, color: 'var(--cyber-cyan)' },
  { type: '图片生成', count: 2270, pct: 18, color: '#a78bfa' },
  { type: '视频生成', count: 856, pct: 7, color: '#f472b6' },
  { type: '语音合成', count: 596, pct: 4, color: '#fbbf24' },
])

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
</script>

<style scoped>
.cyber-arch-diagram {
  background: rgba(0,0,0,0.3);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--cyber-border-color, rgba(0,240,255,0.15));
  overflow-x: auto;
  display: inline-block;
  min-width: 100%;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
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
  height: 6px;
  background: rgba(255,255,255,0.08);
  border-radius: 3px;
  overflow: hidden;
}
.cyber-progress-fill {
  height: 100%;
  background: var(--cyber-cyan, #00f0ff);
  border-radius: 3px;
  transition: width 0.3s ease;
}
.cyber-progress-fill.danger {
  background: #ef4444;
}
.cyber-stat-card {
  background: var(--cyber-card-bg, rgba(17,24,39,0.8));
  border: 1px solid var(--cyber-border-color, rgba(0,240,255,0.15));
}
.cyber-engine-card {
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--cyber-border-color, rgba(0,240,255,0.1));
}
.cyber-engine-card:hover {
  border-color: rgba(0,240,255,0.3);
  box-shadow: 0 0 10px rgba(0,240,255,0.05);
}
</style>
