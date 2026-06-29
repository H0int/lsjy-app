<template>
  <div class="h-full flex flex-col bg-gray-50 dark:bg-dark-200">
    <!-- AI智能体头部 -->
    <div class="bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-xl">罗</div>
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">罗圣AI智能体</h2>
            <div class="flex items-center gap-1.5 text-sm text-gray-500">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              在线 · 随时为您服务
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-dropdown @command="switchModel">
            <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              <span>🧠</span>
              <span>{{ currentModel }}</span>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="doubao">豆包</el-dropdown-item>
                <el-dropdown-item command="deepseek">DeepSeek</el-dropdown-item>
                <el-dropdown-item command="glm">GLM-4</el-dropdown-item>
                <el-dropdown-item command="qwen">通义千问</el-dropdown-item>
                <el-dropdown-item command="siliconflow">硅基流动</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <button 
            v-if="isSending"
            @click="stopGeneration"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-500 text-sm font-medium hover:bg-orange-100 transition-colors"
          >
            <span>⏹️</span>
            <span>停止</span>
          </button>
          <button @click="clearChat" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <span>🗑️</span>
            <span>清空</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 聊天区域 -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm flex-shrink-0">罗</div>
        <div class="bg-white dark:bg-dark-100 rounded-xl rounded-tl-none px-4 py-3 shadow-sm max-w-[80%]">
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
            你好！我是罗圣AI智能体，很高兴为您服务。我可以帮您：
          </p>
          <ul class="text-gray-600 dark:text-gray-400 text-sm mt-2 space-y-1">
            <li>• 解答平台使用问题</li>
            <li>• 推荐合适的AI工具</li>
            <li>• 提供业务咨询建议</li>
            <li>• 协助解决技术问题</li>
          </ul>
          <p class="text-gray-700 dark:text-gray-300 mt-2">有什么我可以帮您的吗？</p>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-for="msg in messages" :key="msg.id" class="flex items-start gap-3" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
        <div v-if="msg.role === 'assistant'" class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm flex-shrink-0">罗</div>
        <div v-else class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm flex-shrink-0">
          {{ (authStore.nickname || 'U')[0] }}
        </div>
        <div :class="[
          'rounded-xl px-4 py-3 shadow-sm max-w-[80%]',
          msg.role === 'user' 
            ? 'bg-primary text-white rounded-tr-none' 
            : 'bg-white dark:bg-dark-100 rounded-tl-none'
        ]">
          <div v-if="msg.loading" class="flex items-center gap-2 text-gray-500">
            <div class="flex gap-1">
              <div class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 300ms"></div>
            </div>
            <span class="text-sm">思考中...</span>
          </div>
          <div v-else class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap" :class="msg.role === 'user' ? 'text-white' : ''">
            {{ msg.content }}
            <span v-if="msg.streaming" class="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle"></span>
          </div>
          <div v-if="!msg.loading && !msg.streaming && msg.role === 'assistant'" class="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <span>{{ msg.model }}</span>
            <span>{{ msg.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="bg-white dark:bg-dark-100 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
      <div class="flex items-end gap-3">
        <div class="flex-1">
          <textarea
            v-model="inputMessage"
            @keydown.enter.exact.prevent="sendMessage"
            placeholder="输入消息，Enter发送..."
            rows="1"
            :disabled="isSending"
            class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
            style="min-height: 48px; max-height: 120px;"
          ></textarea>
        </div>
        <button 
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isSending"
          class="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSending ? '生成中...' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
  model: string
  cost: number
  loading?: boolean
  streaming?: boolean
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const isSending = ref(false)
const currentModel = ref('豆包')
const chatContainer = ref<HTMLElement>()
let abortController: AbortController | null = null

// 模型名称到后端 API model 参数的映射
const modelMapping: Record<string, string> = {
  '豆包': 'doubao-lite',
  'DeepSeek': 'deepseek-chat',
  'GLM-4': 'glm-4-flash',
  '通义千问': 'qwen-plus',
  '硅基流动': 'Qwen2.5-7B-Instruct'
}

// 模型消耗配置
const modelCosts: Record<string, number> = {
  '豆包': 5,
  'DeepSeek': 8,
  'GLM-4': 6,
  '通义千问': 6,
  '硅基流动': 3
}

function switchModel(model: string) {
  const modelNames: Record<string, string> = {
    'doubao': '豆包',
    'deepseek': 'DeepSeek',
    'glm': 'GLM-4',
    'qwen': '通义千问',
    'siliconflow': '硅基流动'
  }
  currentModel.value = modelNames[model] || '豆包'
  ElMessage.success(`已切换到 ${currentModel.value} 模型`)
}

function clearChat() {
  messages.value = []
  ElMessage.success('对话已清空')
}

function stopGeneration() {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
  // 移除 streaming 状态
  const lastMsg = messages.value[messages.value.length - 1]
  if (lastMsg && lastMsg.role === 'assistant') {
    lastMsg.streaming = false
    lastMsg.loading = false
  }
  isSending.value = false
}

function getCurrentTime() {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

function getToken(): string {
  return localStorage.getItem('token') || ''
}

async function sendMessage() {
  const content = inputMessage.value.trim()
  if (!content || isSending.value) return
  
  // 添加用户消息
  messages.value.push({
    id: Date.now().toString(),
    role: 'user',
    content,
    time: getCurrentTime(),
    model: currentModel.value,
    cost: 0
  })
  
  inputMessage.value = ''
  isSending.value = true
  
  await nextTick()
  scrollToBottom()
  
  // 添加 AI 占位消息（流式）
  const aiMsg: Message = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: '',
    time: getCurrentTime(),
    model: currentModel.value,
    cost: modelCosts[currentModel.value] || 5,
    loading: true,
    streaming: false
  }
  messages.value.push(aiMsg)
  await nextTick()
  scrollToBottom()
  
  // 构建消息历史（用于上下文）
  const chatHistory = messages.value
    .filter(m => !m.loading && m.content)
    .slice(0, -1) // 排除当前空的 AI 占位消息
    .map(m => ({ role: m.role, content: m.content }))
  
  try {
    abortController = new AbortController()
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1'
    const token = getToken()
    const apiModel = modelMapping[currentModel.value] || 'deepseek-chat'
    
    const response = await fetch(`${baseUrl}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        model: apiModel,
        messages: chatHistory
      }),
      signal: abortController.signal
    })
    
    if (!response.ok) {
      throw new Error(`AI 服务请求失败 (${response.status})`)
    }
    
    // 切换到流式状态
    aiMsg.loading = false
    aiMsg.streaming = true
    
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    
    if (reader) {
      let fullContent = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content || ''
              if (delta) {
                fullContent += delta
                aiMsg.content = fullContent
                await nextTick()
                scrollToBottom()
              }
            } catch {
              // 非 JSON 数据，忽略
            }
          }
        }
      }
    }
    
    aiMsg.streaming = false
    aiMsg.content = aiMsg.content || '（未收到回复）'
    
  } catch (error: any) {
    aiMsg.loading = false
    aiMsg.streaming = false
    
    if (error.name === 'AbortError') {
      aiMsg.content = aiMsg.content || '（已停止生成）'
    } else {
      console.error('AI chat error:', error)
      aiMsg.content = aiMsg.content || '⚠️ AI 服务暂时不可用，请稍后重试。\n\n如问题持续，请联系客服或检查后端 AI 代理层是否已部署。'
      ElMessage.error('AI 请求失败，请检查网络连接')
    }
  } finally {
    abortController = null
    isSending.value = false
    await nextTick()
    scrollToBottom()
  }
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

watch(messages, () => {
  nextTick(() => scrollToBottom())
}, { deep: true })

onUnmounted(() => {
  if (abortController) {
    abortController.abort()
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #4b5563;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-bounce {
  animation: bounce 0.6s infinite;
}
</style>
