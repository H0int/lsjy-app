<template>
  <div class="max-w-5xl mx-auto px-4 py-6 cyber-detail">
    <!-- 返回按钮 -->
    <button @click="$router.back()" class="cyber-back-btn">
      <span>←</span><span>返回</span>
    </button>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="cyber-spinner"></div>
    </div>

    <template v-else-if="tool">
      <!-- 工具头部 -->
      <div class="cyber-tool-header">
        <div class="flex items-start gap-4">
          <div class="cyber-tool-icon-big">{{ tool.icon }}</div>
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-1">
              <h1 class="cyber-tool-title">{{ tool.name }}</h1>
              <span class="cyber-badge cyber-badge-cyan">{{ toolTypeLabel(tool.toolType) }}</span>
            </div>
            <p class="cyber-tool-desc-line">{{ tool.description }}</p>
            <div class="cyber-tool-meta">
              <span class="cyber-provider">{{ tool.provider }}</span>
              <span class="cyber-use-count">{{ tool.usageCount.toLocaleString() }}次使用</span>
              <span class="cyber-cost" :class="tool.isFree ? 'cyber-cost-free' : 'cyber-cost-paid'">
                {{ tool.isFree ? `免费(每日${tool.freeDailyLimit}次)` : `${effectiveCost} 圣点` }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具使用界面 -->
      <div class="cyber-use-panel">
        <h2 class="cyber-card-title">
          <span class="title-bar"></span>开始使用
        </h2>

        <!-- 输入区域 -->
        <div class="space-y-4">
          <div>
            <label class="cyber-input-label">输入内容</label>
            <el-input v-model="inputContent" type="textarea" :rows="5" :placeholder="inputPlaceholder"
              class="w-full" />
          </div>

          <!-- 视频工具：时长选择器 -->
          <div v-if="isVideoTool">
            <label class="cyber-input-label">视频时长</label>
            <div class="flex flex-wrap gap-3">
              <button v-for="d in durationOptions" :key="d.value"
                @click="selectedDuration = d.value"
                class="cyber-duration-btn"
                :class="{ active: selectedDuration === d.value }"
                :disabled="generating">
                {{ d.label }}
                <span v-if="d.cost > 1" class="ml-1 text-xs opacity-70">({{ d.cost }}倍)</span>
              </button>
            </div>
            <p v-if="selectedDuration > 15" class="cyber-warn-text">
              ⚡ 超过15秒将自动分段生成并拼接，生成时间较长
            </p>
          </div>

          <!-- 生成按钮 -->
          <div class="cyber-gen-bar">
            <span class="cyber-cost-tip">
              本次消耗：<strong :class="tool.isFree ? 'cyber-cost-free' : 'cyber-cost-paid'">
                {{ tool.isFree ? '免费' : `${effectiveCost} 圣点` }}
              </strong>
            </span>
            <button class="cyber-gen-btn" :disabled="generating || !inputContent.trim()" @click="handleGenerate">
              <span class="cyber-btn-shine"></span>
              <span class="cyber-btn-content">{{ generating ? progressText : '✨ 开始生成' }}</span>
            </button>
          </div>
        </div>

        <!-- 视频结果展示 -->
        <div v-if="isVideoTool && videoUrl" class="cyber-result-section">
          <div class="cyber-result-head">
            <h3 class="cyber-card-title"><span class="title-bar"></span>生成结果</h3>
            <div class="flex gap-2">
              <a :href="videoUrl" target="_blank" download>
                <button class="cyber-action-pill cyber-pill-green">📥 下载视频</button>
              </a>
              <button class="cyber-action-pill" @click="videoUrl = ''">🗑️ 清除</button>
            </div>
          </div>
          <div class="cyber-video-frame">
            <video :src="videoUrl" controls autoplay class="w-full max-h-[500px]" style="max-width: 100%;"></video>
          </div>
        </div>

        <!-- 文本结果展示 -->
        <div v-if="!isVideoTool && result" class="cyber-result-section">
          <div class="cyber-result-head">
            <h3 class="cyber-card-title"><span class="title-bar"></span>生成结果</h3>
            <div class="flex gap-2">
              <button class="cyber-action-pill" @click="copyResult">📋 复制</button>
              <button class="cyber-action-pill" @click="result = ''">🗑️ 清除</button>
            </div>
          </div>
          <div class="cyber-text-result">
            {{ result }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { toolApi } from '@/api'
import { toolTypeMap } from '@/utils'
import type { Tool } from '@/types'
import { ElMessage } from 'element-plus'

const route = useRoute()
const tool = ref<Tool | null>(null)
const loading = ref(true)
const generating = ref(false)
const inputContent = ref('')
const result = ref('')
const videoUrl = ref('')
const selectedDuration = ref(5)
const progressText = ref('生成中...')

const isVideoTool = computed(() => tool.value?.toolType === 'video')

const durationOptions = [
  { value: 5, label: '5秒', cost: 1 },
  { value: 10, label: '10秒', cost: 1 },
  { value: 15, label: '15秒', cost: 1 },
  { value: 30, label: '30秒', cost: 2 },
  { value: 60, label: '60秒', cost: 4 },
]

const effectiveCost = computed(() => {
  if (!tool.value) return 0
  if (isVideoTool.value) {
    const opt = durationOptions.find(d => d.value === selectedDuration.value)
    return (tool.value.coinCost || 1) * (opt?.cost || 1)
  }
  return tool.value.coinCost || 0
})

const inputPlaceholder = computed(() => {
  if (!tool.value) return ''
  if (isVideoTool.value) return '描述你想要生成的视频画面，越详细效果越好...'
  switch (tool.value.inputType) {
    case 'image': return '请上传或输入图片URL...'
    case 'file': return '请输入文件内容或URL...'
    default: return '请输入您的需求描述，越详细效果越好...'
  }
})

function toolTypeLabel(type: string): string {
  return toolTypeMap[type] || type
}

async function handleGenerate() {
  if (!inputContent.value.trim()) return ElMessage.warning('请输入内容')
  generating.value = true
  result.value = ''
  videoUrl.value = ''

  try {
    if (isVideoTool.value) {
      const segments = Math.ceil(selectedDuration.value / 15)
      if (segments > 1) {
        progressText.value = `生成中(共${segments}段)...`
      }

      const res = await toolApi.generateVideo(Number(route.params.id), {
        prompt: inputContent.value,
        duration: selectedDuration.value,
        resolution: '720P',
      })

      const url = res.data?.videoUrl || res.data?.outputText || ''
      if (url) {
        if (url.startsWith('/')) {
          videoUrl.value = `https://api.lsjyapp.cn${url}`
        } else {
          videoUrl.value = url
        }
      }
      ElMessage.success('视频生成完成！')
    } else {
      const res = await toolApi.callTool(Number(route.params.id), { text: inputContent.value })
      result.value = res.data?.outputText || '生成完成，暂无详细输出'
      ElMessage.success('生成完成！')
    }
  } catch (e: any) {
    // error handled by interceptor
  } finally {
    generating.value = false
    progressText.value = '生成中...'
  }
}

function copyResult() {
  navigator.clipboard.writeText(result.value)
  ElMessage.success('已复制到剪贴板')
}

onMounted(async () => {
  try {
    const res = await toolApi.getToolDetail(Number(route.params.id))
    tool.value = res.data
  } finally { loading.value = false }
})
</script>

<style scoped>
.cyber-detail { position: relative; }

.cyber-back-btn {
  display: inline-flex; align-items: center; gap: 8px;
  margin-bottom: 16px;
  padding: 6px 12px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgba(0,240,255,0.2);
  color: var(--cyber-text-dim);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s;
  font-family: 'JetBrains Mono', monospace;
}
.cyber-back-btn:hover {
  color: var(--cyber-cyan);
  border-color: rgba(0,240,255,0.5);
  background: rgba(0,240,255,0.05);
  box-shadow: 0 0 10px rgba(0,240,255,0.2);
}

.cyber-spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(0,240,255,0.15);
  border-top-color: var(--cyber-cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  box-shadow: 0 0 12px rgba(0,240,255,0.3);
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 工具头部 */
.cyber-tool-header {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.15);
  border-radius: 16px;
  padding: 22px 24px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}
.cyber-tool-header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), var(--cyber-magenta), transparent);
}
.cyber-tool-icon-big {
  font-size: 48px;
  filter: drop-shadow(0 0 10px rgba(0,240,255,0.4));
}
.cyber-tool-title {
  font-size: 22px; font-weight: 800;
  color: var(--cyber-text);
  font-family: 'JetBrains Mono', monospace;
  text-shadow: 0 0 8px rgba(0,240,255,0.2);
}
.cyber-tool-desc-line { color: var(--cyber-text-dim); font-size: 13px; margin-bottom: 10px; }
.cyber-tool-meta { display: flex; gap: 16px; align-items: center; font-size: 13px; flex-wrap: wrap; }
.cyber-provider {
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(0,240,255,0.08);
  color: var(--cyber-cyan);
  border: 1px solid rgba(0,240,255,0.25);
  font-size: 12px;
}
.cyber-use-count { color: var(--cyber-text-dim); font-size: 12px; }
.cyber-cost { font-weight: 700; }
.cyber-cost-free { color: var(--cyber-green); text-shadow: 0 0 6px rgba(0,255,136,0.3); }
.cyber-cost-paid { color: var(--cyber-amber); text-shadow: 0 0 6px rgba(255,184,0,0.3); }

/* 使用面板 */
.cyber-use-panel {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.15);
  border-radius: 16px;
  padding: 24px;
  position: relative;
}
.cyber-use-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), transparent);
}
.cyber-card-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 15px; font-weight: 700;
  color: var(--cyber-text);
  margin-bottom: 18px;
  font-family: 'JetBrains Mono', monospace;
}
.title-bar {
  display: inline-block;
  width: 4px; height: 18px;
  background: linear-gradient(180deg, var(--cyber-cyan), var(--cyber-magenta));
  border-radius: 2px;
  box-shadow: 0 0 6px rgba(0,240,255,0.4);
}

.cyber-input-label {
  display: block;
  font-size: 12px;
  color: var(--cyber-text-dim);
  margin-bottom: 8px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 1px;
}

/* 时长按钮 */
.cyber-duration-btn {
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px; font-weight: 600;
  background: rgba(0,240,255,0.03);
  border: 2px solid rgba(0,240,255,0.15);
  color: var(--cyber-text-dim);
  cursor: pointer;
  transition: all 0.25s;
  font-family: 'JetBrains Mono', monospace;
}
.cyber-duration-btn:hover:not(:disabled) {
  border-color: rgba(0,240,255,0.4);
  color: var(--cyber-cyan);
}
.cyber-duration-btn.active {
  border-color: var(--cyber-cyan);
  background: rgba(0,240,255,0.1);
  color: var(--cyber-cyan);
  box-shadow: 0 0 12px rgba(0,240,255,0.2);
  text-shadow: 0 0 6px rgba(0,240,255,0.4);
}
.cyber-duration-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.cyber-warn-text {
  margin-top: 10px;
  font-size: 12px;
  color: var(--cyber-amber);
  background: rgba(255,184,0,0.06);
  border: 1px solid rgba(255,184,0,0.2);
  padding: 8px 12px;
  border-radius: 8px;
}

/* 生成条 */
.cyber-gen-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 12px;
}
.cyber-cost-tip { font-size: 13px; color: var(--cyber-text-dim); }
.cyber-gen-btn {
  position: relative;
  padding: 12px 32px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple));
  color: #000;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 2px;
  min-width: 160px;
  box-shadow: 0 0 18px rgba(0,240,255,0.3);
}
.cyber-gen-btn:hover:not(:disabled) {
  box-shadow: 0 0 30px rgba(0,240,255,0.5), 0 0 60px rgba(0,240,255,0.2);
  transform: translateY(-1px);
}
.cyber-gen-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.cyber-btn-shine {
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  animation: btnShine 3s ease-in-out infinite;
}
@keyframes btnShine {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}
.cyber-btn-content { position: relative; z-index: 1; }

/* 结果区 */
.cyber-result-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(0,240,255,0.1);
}
.cyber-result-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 14px;
}
.cyber-result-head .cyber-card-title { margin-bottom: 0; }

.cyber-action-pill {
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(0,240,255,0.06);
  border: 1px solid rgba(0,240,255,0.25);
  color: var(--cyber-cyan);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'JetBrains Mono', monospace;
}
.cyber-action-pill:hover {
  background: rgba(0,240,255,0.12);
  box-shadow: 0 0 10px rgba(0,240,255,0.2);
}
.cyber-pill-green {
  background: rgba(0,255,136,0.08);
  border-color: rgba(0,255,136,0.3);
  color: var(--cyber-green);
}
.cyber-pill-green:hover { background: rgba(0,255,136,0.15); }

.cyber-video-frame {
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  border: 1px solid rgba(0,240,255,0.2);
  box-shadow: 0 0 30px rgba(0,240,255,0.15);
}
.cyber-text-result {
  background: rgba(0,240,255,0.03);
  border: 1px solid rgba(0,240,255,0.12);
  border-radius: 12px;
  padding: 16px;
  font-size: 13px;
  color: var(--cyber-text);
  line-height: 1.7;
  white-space: pre-wrap;
  font-family: 'JetBrains Mono', monospace;
}

/* Element Plus 输入框覆盖 */
:deep(.el-textarea__inner) {
  background-color: rgba(0,240,255,0.03) !important;
  box-shadow: 0 0 0 1px rgba(0,240,255,0.2) inset !important;
  border-radius: 10px !important;
  color: var(--cyber-text) !important;
  font-size: 13px !important;
  font-family: 'JetBrains Mono', monospace !important;
}
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px var(--cyber-cyan) inset, 0 0 12px rgba(0,240,255,0.15) !important;
}
:deep(.el-textarea__inner::placeholder) { color: var(--cyber-text-dim) !important; }
</style>
