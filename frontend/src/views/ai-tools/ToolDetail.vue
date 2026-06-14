<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <!-- 返回按钮 -->
    <button @click="$router.back()" class="flex items-center gap-2 mb-4 transition-colors"
      style="color: var(--cyber-text-dim);"
      @mouseover="($event.currentTarget as HTMLElement).style.color='var(--cyber-cyan)'"
      @mouseleave="($event.currentTarget as HTMLElement).style.color='var(--cyber-text-dim)'">
      <span>←</span><span>返回</span>
    </button>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="pulse-glow w-8 h-8 rounded-full" style="background: var(--cyber-cyan);"></div>
    </div>

    <template v-else-if="tool">
      <!-- 工具头部 - 赛博朋克 -->
      <div class="cyber-card p-6 mb-6">
        <div class="flex items-start gap-4">
          <div class="text-5xl" style="filter: drop-shadow(0 0 8px rgba(0,240,255,0.5));">{{ tool.icon }}</div>
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-1 flex-wrap">
              <h1 class="text-2xl font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">{{ tool.name }}</h1>
              <span class="text-xs px-2 py-1 rounded-full"
                style="background: rgba(0,240,255,0.1); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.2);">{{ toolTypeLabel(tool.toolType) }}</span>
              <span class="text-xs px-2 py-1 rounded-full" :style="providerBadgeStyle">
                {{ providerDisplayName }}
              </span>
            </div>
            <p class="mb-3" style="color: var(--cyber-text-dim);">{{ tool.description }}</p>
            <div class="flex items-center gap-4 text-sm flex-wrap">
              <span style="color: var(--cyber-text-dim);">{{ tool.modelId }}</span>
              <span style="color: var(--cyber-text-dim);">{{ tool.usageCount.toLocaleString() }}次使用</span>
              <span class="font-bold" :style="{ color: tool.isFree ? 'var(--cyber-green)' : 'var(--cyber-amber)' }">
                {{ tool.isFree ? `免费(每日${tool.freeDailyLimit}次)` : `${tool.coinCost} 圣点/次` }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具使用界面 -->
      <div class="cyber-card p-6">
        <h2 class="font-bold text-lg mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          <span style="color: var(--cyber-cyan);">▍</span>{{ isImageTool ? '图像生成' : '开始对话' }}
        </h2>

        <!-- ===== 文本对话模式 ===== -->
        <template v-if="!isImageTool">
          <!-- 对话历史 -->
          <div v-if="chatHistory.length > 0" class="space-y-3 mb-4 max-h-96 overflow-y-auto">
            <div v-for="(msg, idx) in chatHistory" :key="idx"
              class="flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
              <div class="max-w-[80%] rounded-2xl px-4 py-3 text-sm"
                :style="msg.role === 'user'
                  ? 'background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #000; border-radius: 16px 16px 4px 16px;'
                  : 'background: rgba(0,240,255,0.05); color: var(--cyber-text); border: 1px solid var(--cyber-border); border-radius: 16px 16px 16px 4px;'">
                <div class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</div>
                <div class="text-xs mt-1 opacity-60">
                  {{ msg.role === 'user' ? '我' : tool.name }}
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="space-y-4">
            <div>
              <el-input v-model="inputContent" type="textarea" :rows="3" :placeholder="inputPlaceholder"
                class="w-full" :disabled="generating" @keydown.ctrl.enter="handleSend" />
              <div class="flex justify-between items-center mt-1">
                <span class="text-xs" style="color: var(--cyber-text-dim);">Ctrl+Enter 发送</span>
              </div>
            </div>

            <!-- 操作栏 -->
            <div class="flex items-center justify-between pt-2 flex-wrap gap-3">
              <div class="flex items-center gap-3">
                <span class="text-sm" style="color: var(--cyber-text-dim);">
                  消耗：<strong :style="{ color: tool.isFree ? 'var(--cyber-green)' : 'var(--cyber-amber)' }">
                    {{ tool.isFree ? '免费' : `${tool.coinCost} 圣点` }}
                  </strong>
                </span>
                <button v-if="chatHistory.length > 0" @click="clearChat"
                  class="text-xs transition-colors" style="color: var(--cyber-text-dim);"
                  @mouseover="($event.currentTarget as HTMLElement).style.color='#ff4444'"
                  @mouseleave="($event.currentTarget as HTMLElement).style.color='var(--cyber-text-dim)'">
                  🗑️ 清空对话
                </button>
              </div>
              <el-button type="primary" size="large" :loading="generating" @click="handleSend"
                :disabled="!inputContent.trim()"
                style="min-width: 140px; height: 44px;">
                {{ generating ? '生成中...' : '✨ 发送' }}
              </el-button>
            </div>
          </div>

          <!-- 生成结果 -->
          <div v-if="singleResult" class="mt-6 pt-6" style="border-top: 1px solid var(--cyber-border);">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold" style="color: var(--cyber-text);">生成结果</h3>
              <div class="flex gap-2">
                <el-button size="small" @click="copyResult(singleResult)">📋 复制</el-button>
              </div>
            </div>
            <div class="rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap"
              style="background: rgba(0,240,255,0.03); border: 1px solid var(--cyber-border); color: var(--cyber-text);">
              {{ singleResult }}
            </div>
          </div>
        </template>

        <!-- ===== 图像生成模式 ===== -->
        <template v-else>
          <div class="space-y-4">
            <!-- Prompt输入 -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--cyber-text-dim);">画面描述</label>
              <el-input v-model="imagePrompt" type="textarea" :rows="4"
                placeholder="请描述您想生成的画面，越详细效果越好。例如：一只穿着宇航服的猫咪在月球上漫步，背景是地球，写实风格，4K高清"
                class="w-full" :disabled="generating" />
            </div>

            <!-- 参数设置 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-xs mb-1" style="color: var(--cyber-text-dim);">尺寸</label>
                <el-select v-model="imageSize" size="small" class="w-full">
                  <el-option label="1:1 正方形" value="1024x1024" />
                  <el-option label="16:9 横版" value="1792x1024" />
                  <el-option label="9:16 竖版" value="1024x1792" />
                  <el-option label="512x512 小图" value="512x512" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs mb-1" style="color: var(--cyber-text-dim);">风格</label>
                <el-select v-model="imageStyle" size="small" class="w-full" placeholder="请选择风格">
                  <el-option label="自动" value="" />
                  <el-option label="写实" value="realistic" />
                  <el-option label="动漫" value="anime" />
                  <el-option label="油画" value="oil-painting" />
                  <el-option label="水彩" value="watercolor" />
                  <el-option label="像素" value="pixel-art" />
                  <el-option label="赛博朋克" value="cyberpunk" />
                  <el-option label="3D渲染" value="3d-render" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs mb-1" style="color: var(--cyber-text-dim);">数量</label>
                <el-select v-model="imageCount" size="small" class="w-full">
                  <el-option :label="'1张'" :value="1" />
                  <el-option :label="'2张'" :value="2" />
                  <el-option :label="'4张'" :value="4" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs mb-1" style="color: var(--cyber-text-dim);">质量</label>
                <el-select v-model="imageQuality" size="small" class="w-full">
                  <el-option label="标准" value="standard" />
                  <el-option label="高清 HD" value="hd" />
                </el-select>
              </div>
            </div>

            <!-- 生成按钮 -->
            <div class="flex items-center justify-between pt-2 flex-wrap gap-3">
              <span class="text-sm" style="color: var(--cyber-text-dim);">
                消耗：<strong :style="{ color: tool.isFree ? 'var(--cyber-green)' : 'var(--cyber-amber)' }">
                  {{ tool.isFree ? '免费' : `${tool.coinCost * imageCount} 圣点` }}
                </strong>
              </span>
              <el-button type="primary" size="large" :loading="generating" @click="handleGenerateImage"
                :disabled="!imagePrompt.trim()"
                style="min-width: 160px; height: 44px; background: linear-gradient(135deg, var(--cyber-magenta), var(--cyber-purple)) !important;">
                {{ generating ? '生成中...' : '🎨 开始生成' }}
              </el-button>
            </div>
          </div>

          <!-- 生成的图片 -->
          <div v-if="generatedImages.length > 0 || generating" class="mt-6 pt-6" style="border-top: 1px solid var(--cyber-border);">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold" style="color: var(--cyber-text);">生成结果</h3>
              <el-button v-if="generatedImages.length > 0" size="small" @click="generatedImages = []">🗑️ 清除</el-button>
            </div>
            <!-- 加载中占位 -->
            <div v-if="generating && generatedImages.length === 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="i in imageCount" :key="i"
                class="rounded-xl overflow-hidden cyber-card flex items-center justify-center"
                style="height: 400px; background: rgba(0,240,255,0.03);">
                <div class="text-center">
                  <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style="background: linear-gradient(135deg, var(--cyber-magenta), var(--cyber-purple));">
                    <span class="text-3xl animate-spin">🎨</span>
                  </div>
                  <p class="text-sm" style="color: var(--cyber-text-dim);">AI正在创作中...</p>
                  <p class="text-xs mt-1" style="color: var(--cyber-text-dim);">预计需要 5-30 秒</p>
                </div>
              </div>
            </div>
            <!-- 图片结果 -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(url, idx) in generatedImages" :key="idx"
                class="relative group rounded-xl overflow-hidden cyber-card">
                <img :src="url" :alt="`生成图片 ${idx + 1}`" class="w-full h-auto" loading="lazy" />
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style="background: rgba(0,0,0,0.6);">
                  <div class="flex gap-2">
                    <a :href="url" target="_blank" download
                      class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      style="background: rgba(255,255,255,0.9); color: #000;">
                      ⬇️ 下载
                    </a>
                    <button @click="copyResult(url)"
                      class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      style="background: rgba(255,255,255,0.9); color: #000;">
                       复制链接
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 消耗提示 -->
        <div v-if="lastCoinCost > 0" class="mt-4 p-3 rounded-xl text-sm"
          style="background: rgba(255,184,0,0.08); border: 1px solid rgba(255,184,0,0.2); color: var(--cyber-amber);">
          💰 本次消耗 {{ lastCoinCost }} 圣点 | 耗时 {{ lastDurationMs }}ms | 模型: {{ lastModel }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { toolApi } from '@/api'
import { toolTypeMap } from '@/utils'
import type { Tool, ChatMessage } from '@/types'
import { ElMessage } from 'element-plus'

const route = useRoute()
const tool = ref<Tool | null>(null)
const loading = ref(true)
const generating = ref(false)

// ===== 文本对话状态 =====
const inputContent = ref('')
const chatHistory = ref<ChatMessage[]>([])
const singleResult = ref('')

// ===== 图像生成状态 =====
const imagePrompt = ref('')
const imageSize = ref('1024x1024')
const imageStyle = ref('')
const imageCount = ref(1)
const imageQuality = ref('standard')
const generatedImages = ref<string[]>([])

// ===== 消耗信息 =====
const lastCoinCost = ref(0)
const lastDurationMs = ref(0)
const lastModel = ref('')

// ===== 计算属性 =====
const isImageTool = computed(() => tool.value?.toolType === 'image')

const providerDisplayName = computed(() => {
  if (!tool.value) return ''
  const map: Record<string, string> = {
    doubao: '豆包',
    jimeng: '即梦',
    openai: 'OpenAI',
    tongyi: '通义千问',
    deepseek: 'DeepSeek',
    yuanbao: '元宝',
    stability: 'Stability AI',
    'stability-ai': 'Stability AI',
  }
  return map[tool.value.provider] || tool.value.provider
})

const providerBadgeStyle = computed(() => {
  if (!tool.value) return 'background: rgba(136,136,170,0.1); color: var(--cyber-text-dim);'
  const map: Record<string, string> = {
    doubao: 'background: rgba(0,240,255,0.1); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.2);',
    jimeng: 'background: rgba(255,0,255,0.1); color: var(--cyber-magenta); border: 1px solid rgba(255,0,255,0.2);',
    openai: 'background: rgba(0,255,136,0.1); color: var(--cyber-green); border: 1px solid rgba(0,255,136,0.2);',
    tongyi: 'background: rgba(255,184,0,0.1); color: var(--cyber-amber); border: 1px solid rgba(255,184,0,0.2);',
    deepseek: 'background: rgba(88,166,255,0.1); color: #58a6ff; border: 1px solid rgba(88,166,255,0.2);',
    yuanbao: 'background: rgba(255,100,130,0.1); color: #ff6482; border: 1px solid rgba(255,100,130,0.2);',
    stability: 'background: rgba(255,107,107,0.1); color: #ff6b6b; border: 1px solid rgba(255,107,107,0.2);',
    'stability-ai': 'background: rgba(255,107,107,0.1); color: #ff6b6b; border: 1px solid rgba(255,107,107,0.2);',
  }
  return (map[tool.value.provider] || 'background: rgba(136,136,170,0.1); color: var(--cyber-text-dim);') + ' border: 1px solid transparent;'
})

const inputPlaceholder = computed(() => {
  if (!tool.value) return ''
  switch (tool.value.inputType) {
    case 'image': return '请上传或输入图片URL...'
    case 'file': return '请输入文件内容或URL...'
    default: return '请输入您的问题或需求，越详细效果越好...'
  }
})

function toolTypeLabel(type: string): string {
  return toolTypeMap[type] || type
}

// ===== 文本对话 =====
async function handleSend() {
  if (!inputContent.value.trim() || !tool.value) return ElMessage.warning('请输入内容')
  if (generating.value) return

  const userMessage = inputContent.value.trim()
  chatHistory.value.push({ role: 'user', content: userMessage })
  inputContent.value = ''
  generating.value = true

  try {
    const res = await toolApi.chat(Number(route.params.id), chatHistory.value)
    const assistantContent = res.data.content || '生成完成，暂无详细输出'
    chatHistory.value.push({ role: 'assistant', content: assistantContent })

    lastCoinCost.value = res.data.coinCost || 0
    lastDurationMs.value = res.data.durationMs || 0
    lastModel.value = res.data.model || tool.value.modelId

    ElMessage.success('生成完成！')
    await nextTick()
    scrollToBottom()
  } catch (e: any) {
    chatHistory.value.pop()
    inputContent.value = userMessage
    ElMessage.error(e?.message || '生成失败，请重试')
  } finally {
    generating.value = false
  }
}

function clearChat() {
  chatHistory.value = []
  singleResult.value = ''
  lastCoinCost.value = 0
}

// ===== 图像生成 =====
async function handleGenerateImage() {
  if (!imagePrompt.value.trim() || !tool.value) return ElMessage.warning('请输入画面描述')
  if (generating.value) return

  generating.value = true
  try {
    const res = await toolApi.generateImage(
      Number(route.params.id),
      imagePrompt.value,
      {
        size: imageSize.value,
        style: imageStyle.value || undefined,
        count: imageCount.value,
        quality: imageQuality.value as 'standard' | 'hd',
      },
    )

    generatedImages.value = res.data.urls || []
    lastCoinCost.value = res.data.coinCost || 0
    lastDurationMs.value = res.data.durationMs || 0
    lastModel.value = res.data.model || tool.value.modelId

    ElMessage.success(`成功生成 ${generatedImages.value.length} 张图片！`)
  } catch (e: any) {
    ElMessage.error(e?.message || '图片生成失败，请重试')
  } finally {
    generating.value = false
  }
}

// ===== 工具函数 =====
function copyResult(text: string) {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板')
}

function scrollToBottom() {
  const el = document.querySelector('.max-h-96')
  if (el) el.scrollTop = el.scrollHeight
}

onMounted(async () => {
  try {
    const res = await toolApi.getToolDetail(Number(route.params.id))
    tool.value = res.data
  } finally {
    loading.value = false
  }
})
</script>
