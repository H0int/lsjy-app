<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <!-- 返回按钮 -->
    <button @click="$router.back()" class="flex items-center gap-2 text-gray-500 hover:text-primary mb-4 transition-colors">
      <span>←</span><span>返回</span>
    </button>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full"></div>
    </div>

    <template v-else-if="tool">
      <!-- 工具头部 -->
      <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 mb-6 shadow-sm">
        <div class="flex items-start gap-4">
          <div class="text-5xl">{{ tool.icon }}</div>
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ tool.name }}</h1>
              <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">{{ toolTypeLabel(tool.toolType) }}</span>
              <span class="text-xs px-2 py-1 rounded-full" :class="providerBadgeClass">
                {{ providerDisplayName }}
              </span>
            </div>
            <p class="text-gray-500 dark:text-gray-400 mb-3">{{ tool.description }}</p>
            <div class="flex items-center gap-4 text-sm flex-wrap">
              <span class="text-gray-400">{{ tool.modelId }}</span>
              <span class="text-gray-400">{{ tool.usageCount.toLocaleString() }}次使用</span>
              <span class="font-bold" :class="tool.isFree ? 'text-green-500' : 'text-amber-500'">
                {{ tool.isFree ? `免费(每日${tool.freeDailyLimit}次)` : `${tool.coinCost} 圣点/次` }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具使用界面 -->
      <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-sm">
        <h2 class="font-bold text-lg text-gray-900 dark:text-white mb-4">
          {{ isImageTool ? '🎨 图像生成' : '💬 开始对话' }}
        </h2>

        <!-- ===== 文本对话模式 ===== -->
        <template v-if="!isImageTool">
          <!-- 对话历史 -->
          <div v-if="chatHistory.length > 0" class="space-y-3 mb-4 max-h-96 overflow-y-auto">
            <div v-for="(msg, idx) in chatHistory" :key="idx"
              class="flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
              <div class="max-w-[80%] rounded-2xl px-4 py-3 text-sm"
                :class="msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 rounded-bl-md'">
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
                <span class="text-xs text-gray-400">Ctrl+Enter 发送</span>
              </div>
            </div>

            <!-- 操作栏 -->
            <div class="flex items-center justify-between pt-2">
              <div class="flex items-center gap-3">
                <span class="text-sm text-gray-500">
                  消耗：<strong :class="tool.isFree ? 'text-green-500' : 'text-amber-500'">
                    {{ tool.isFree ? '免费' : `${tool.coinCost} 圣点` }}
                  </strong>
                </span>
                <button v-if="chatHistory.length > 0" @click="clearChat"
                  class="text-xs text-gray-400 hover:text-red-400 transition-colors">
                  🗑️ 清空对话
                </button>
              </div>
              <el-button type="primary" size="large" :loading="generating" @click="handleSend"
                :disabled="!inputContent.trim()"
                style="background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; min-width: 140px;">
                {{ generating ? '生成中...' : '✨ 发送' }}
              </el-button>
            </div>
          </div>

          <!-- 生成结果（非对话模式时的单独结果展示） -->
          <div v-if="singleResult && !chatMode" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold text-gray-900 dark:text-white">生成结果</h3>
              <div class="flex gap-2">
                <el-button size="small" @click="copyResult(singleResult)">📋 复制</el-button>
              </div>
            </div>
            <div class="bg-gray-50 dark:bg-dark-200 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {{ singleResult }}
            </div>
          </div>
        </template>

        <!-- ===== 图像生成模式 ===== -->
        <template v-else>
          <div class="space-y-4">
            <!-- Prompt输入 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">画面描述</label>
              <el-input v-model="imagePrompt" type="textarea" :rows="4"
                placeholder="请描述您想生成的画面，越详细效果越好。例如：一只穿着宇航服的猫咪在月球上漫步，背景是地球，写实风格，4K高清"
                class="w-full" :disabled="generating" />
            </div>

            <!-- 参数设置 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-xs text-gray-500 mb-1">尺寸</label>
                <el-select v-model="imageSize" size="small" class="w-full">
                  <el-option label="1:1 正方形" value="1024x1024" />
                  <el-option label="16:9 横版" value="1792x1024" />
                  <el-option label="9:16 竖版" value="1024x1792" />
                  <el-option label="512x512 小图" value="512x512" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">风格</label>
                <el-select v-model="imageStyle" size="small" class="w-full">
                  <el-option label="自动" value="" />
                  <el-option label="写实" value="realistic" />
                  <el-option label="动漫" value="anime" />
                  <el-option label="油画" value="oil-painting" />
                  <el-option label="水彩" value="watercolor" />
                  <el-option label="像素" value="pixel-art" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">数量</label>
                <el-select v-model="imageCount" size="small" class="w-full">
                  <el-option :label="'1张'" :value="1" />
                  <el-option :label="'2张'" :value="2" />
                  <el-option :label="'4张'" :value="4" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">质量</label>
                <el-select v-model="imageQuality" size="small" class="w-full">
                  <el-option label="标准" value="standard" />
                  <el-option label="高清 HD" value="hd" />
                </el-select>
              </div>
            </div>

            <!-- 生成按钮 -->
            <div class="flex items-center justify-between pt-2">
              <span class="text-sm text-gray-500">
                消耗：<strong :class="tool.isFree ? 'text-green-500' : 'text-amber-500'">
                  {{ tool.isFree ? '免费' : `${tool.coinCost * imageCount} 圣点` }}
                </strong>
              </span>
              <el-button type="primary" size="large" :loading="generating" @click="handleGenerateImage"
                :disabled="!imagePrompt.trim()"
                style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); border: none; min-width: 160px;">
                {{ generating ? '生成中...' : '🎨 开始生成' }}
              </el-button>
            </div>
          </div>

          <!-- 生成的图片 -->
          <div v-if="generatedImages.length > 0" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-gray-900 dark:text-white">生成结果</h3>
              <el-button size="small" @click="generatedImages = []">🗑️ 清除</el-button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(url, idx) in generatedImages" :key="idx"
                class="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-200">
                <img :src="url" :alt="`生成图片 ${idx + 1}`" class="w-full h-auto" />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div class="flex gap-2">
                    <a :href="url" target="_blank" download
                      class="px-3 py-1.5 bg-white/90 rounded-lg text-sm font-medium hover:bg-white transition-colors">
                      ⬇️ 下载
                    </a>
                    <button @click="copyResult(url)"
                      class="px-3 py-1.5 bg-white/90 rounded-lg text-sm font-medium hover:bg-white transition-colors">
                      📋 复制链接
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 消耗提示 -->
        <div v-if="lastCoinCost > 0" class="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-700 dark:text-amber-300">
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
const chatMode = ref(true)
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
const result = ref('') // 兼容旧代码

const providerDisplayName = computed(() => {
  if (!tool.value) return ''
  const map: Record<string, string> = {
    doubao: '豆包',
    jimeng: '即梦',
    openai: 'OpenAI',
    tongyi: '通义千问',
  }
  return map[tool.value.provider] || tool.value.provider
})

const providerBadgeClass = computed(() => {
  if (!tool.value) return 'bg-gray-100 text-gray-600'
  const map: Record<string, string> = {
    doubao: 'bg-blue-100 text-blue-600',
    jimeng: 'bg-purple-100 text-purple-600',
    openai: 'bg-green-100 text-green-600',
    tongyi: 'bg-orange-100 text-orange-600',
  }
  return map[tool.value.provider] || 'bg-gray-100 text-gray-600'
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

    // 更新消耗信息
    lastCoinCost.value = res.data.coinCost || 0
    lastDurationMs.value = res.data.durationMs || 0
    lastModel.value = res.data.model || tool.value.modelId

    ElMessage.success('生成完成！')
    await nextTick()
    scrollToBottom()
  } catch {
    // 错误由拦截器处理
    // 移除最后一条用户消息（因为失败了）
    chatHistory.value.pop()
    inputContent.value = userMessage // 恢复输入
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
  } catch {
    // 错误由拦截器处理
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

// ===== 旧接口兼容 =====
async function handleGenerate() {
  if (!inputContent.value.trim()) return ElMessage.warning('请输入内容')
  generating.value = true
  result.value = ''
  try {
    const res = await toolApi.callTool(Number(route.params.id), { text: inputContent.value })
    result.value = res.data.outputText || '生成完成，暂无详细输出'
    ElMessage.success('生成完成！')
  } catch {
    // 错误由拦截器处理
  } finally {
    generating.value = false
  }
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
