<template>
  <div class="max-w-4xl mx-auto px-4 py-6 flex flex-col" style="height: calc(100vh - 120px);">
    <!-- 智能体头部 -->
    <div class="cyber-card p-4 mb-4 flex items-center gap-4 flex-shrink-0">
      <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-black flex-shrink-0"
        style="background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-magenta)); box-shadow: 0 0 16px rgba(0,240,255,0.4);">
        罗
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-lg font-bold" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">
          罗圣AI智能体
        </h1>
        <div class="flex items-center gap-2 mt-0.5">
          <span class="w-2 h-2 rounded-full animate-pulse" style="background: var(--cyber-green); box-shadow: 0 0 6px var(--cyber-green);"></span>
          <span class="text-xs" style="color: var(--cyber-text-dim);">在线 · 随时为您服务</span>
        </div>
      </div>
      <div class="flex gap-2 flex-shrink-0">
        <button @click="showModelSelector = !showModelSelector"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style="background: rgba(0,240,255,0.08); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.2);">
          🧠 {{ currentModelLabel }}
        </button>
        <button @click="clearConversation"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style="background: rgba(255,68,68,0.08); color: #ff4444; border: 1px solid rgba(255,68,68,0.2);">
          🗑️ 清空
        </button>
      </div>
    </div>

    <!-- 模型选择器 -->
    <div v-if="showModelSelector" class="cyber-card p-3 mb-3 flex-shrink-0 flex flex-wrap gap-2">
      <button v-for="m in modelOptions" :key="m.value"
        @click="selectModel(m.value); showModelSelector = false"
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
        :style="currentModel === m.value
          ? 'background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #000;'
          : 'background: rgba(0,240,255,0.03); color: var(--cyber-text-dim); border: 1px solid var(--cyber-border);'">
        {{ m.icon }} {{ m.label }}
      </button>
    </div>

    <!-- 欢迎区域（无消息时） -->
    <div v-if="messages.length === 0" class="flex-shrink-0 mb-4">
      <div class="text-center py-6">
        <div class="text-5xl mb-3" style="filter: drop-shadow(0 0 12px rgba(0,240,255,0.4));">🤖</div>
        <h2 class="text-xl font-bold mb-2" style="color: var(--cyber-cyan);">你好，我是罗圣AI智能体</h2>
        <p class="text-sm" style="color: var(--cyber-text-dim);">有什么可以帮你的？试试下面的快捷指令：</p>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <button v-for="cmd in quickCommands" :key="cmd.text"
          @click="sendQuickCommand(cmd.text)"
          class="cyber-card p-3 text-left transition-all hover:-translate-y-0.5">
          <div class="text-lg mb-1">{{ cmd.icon }}</div>
          <div class="text-sm font-medium" style="color: var(--cyber-text);">{{ cmd.label }}</div>
          <div class="text-xs mt-0.5" style="color: var(--cyber-text-dim);">{{ cmd.text }}</div>
        </button>
      </div>
    </div>

    <!-- 对话区域 -->
    <div v-else ref="chatContainer" class="flex-1 overflow-y-auto mb-4 space-y-4 pr-2" style="scroll-behavior: smooth;">
      <div v-for="(msg, idx) in messages" :key="idx"
        class="flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
        <div class="max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm"
          :style="msg.role === 'user'
            ? 'background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #000; border-radius: 16px 16px 4px 16px;'
            : 'background: rgba(0,240,255,0.05); color: var(--cyber-text); border: 1px solid var(--cyber-border); border-radius: 16px 16px 16px 4px;'">
          <div class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</div>
          <div class="text-xs mt-1 opacity-60 flex items-center gap-2">
            <span>{{ msg.role === 'user' ? '我' : '罗圣AI' }} · {{ msg.time }}</span>
            <span v-if="msg.model && msg.role === 'assistant'" class="opacity-70">🧠 {{ msg.model }}</span>
            <span v-if="msg.coinCost && msg.role === 'assistant'" class="opacity-70">⚡-{{ msg.coinCost }}</span>
          </div>
        </div>
      </div>
      <!-- 加载指示器 -->
      <div v-if="loading" class="flex justify-start">
        <div class="rounded-2xl px-4 py-3 text-sm"
          style="background: rgba(0,240,255,0.05); border: 1px solid var(--cyber-border); border-radius: 16px 16px 16px 4px;">
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--cyber-cyan); animation-delay: 0s;"></span>
            <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--cyber-cyan); animation-delay: 0.2s;"></span>
            <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--cyber-cyan); animation-delay: 0.4s;"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="cyber-card p-4 flex-shrink-0">
      <div class="flex gap-3">
        <input v-model="inputText" @keyup.enter="sendMessage"
          :placeholder="loading ? 'AI思考中...' : '输入消息，Enter发送...'"
          :disabled="loading"
          class="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
          style="background: rgba(0,240,255,0.03); border: 1px solid var(--cyber-border); color: var(--cyber-text);"
          @focus="($event.target as HTMLInputElement).style.borderColor='var(--cyber-cyan)'"
          @blur="($event.target as HTMLInputElement).style.borderColor='var(--cyber-border)'" />
        <button @click="sendMessage" :disabled="!inputText.trim() || loading"
          class="px-6 py-3 rounded-xl text-sm font-bold transition-all"
          style="background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #000;"
          :style="(!inputText.trim() || loading) ? 'opacity: 0.5; cursor: not-allowed;' : 'box-shadow: 0 0 16px rgba(0,240,255,0.4);'">
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { toolApi } from '@/api'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  time: string
  model?: string
  coinCost?: number
}

const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const loading = ref(false)
const showModelSelector = ref(false)
const currentModel = ref('doubao')
const chatContainer = ref<HTMLElement | null>(null)

// 智能体专用toolId（罗圣AI智能体 = tool 1）
const AGENT_TOOL_ID = 1

// 系统提示词
const SYSTEM_PROMPT = '你是罗圣AI智能体，由祁阳市罗圣纪元互联网科技有限责任公司开发。你是罗圣纪元SaaS平台的AI助手，能够帮用户写文案、生成图片、分析数据、提供商业建议等。回答要专业、友好、简洁。如果用户询问平台相关功能，引导他们使用平台的AI工具中心。'

const modelOptions = [
  { value: 'doubao', label: '豆包', icon: '🫘', modelId: 'doubao-pro-32k' },
  { value: 'openai', label: 'GPT-4o', icon: '🤖', modelId: 'gpt-4o' },
  { value: 'tongyi', label: '通义千问', icon: '🦙', modelId: 'qwen-plus' },
]

const quickCommands = [
  { icon: '📝', label: '帮我写文案', text: '帮我写一篇关于AI赋能实体经济的宣传文案' },
  { icon: '🎨', label: '生成图片', text: '帮我生成一张赛博朋克风格的城市夜景图片' },
  { icon: '💡', label: '商业建议', text: '我想开一家AI培训机构，给我一些建议' },
  { icon: '📊', label: '数据分析', text: '帮我分析一下SaaS平台的盈利模式' },
]

const currentModelLabel = computed(() => {
  return modelOptions.find(m => m.value === currentModel.value)?.label || '豆包'
})

const currentModelId = computed(() => {
  return modelOptions.find(m => m.value === currentModel.value)?.modelId || 'doubao-pro-32k'
})

function selectModel(model: string) {
  currentModel.value = model
  ElMessage.success(`已切换到 ${currentModelLabel.value}`)
}

function clearConversation() {
  messages.value = []
  localStorage.removeItem('agent_chat_history')
  ElMessage.success('对话已清空')
}

function sendQuickCommand(text: string) {
  inputText.value = text
  sendMessage()
}

function formatTime() {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 构建发送给API的消息历史（最近10轮）
function buildApiMessages(): { role: string; content: string }[] {
  const apiMsgs: { role: string; content: string }[] = []
  // 取最近20条消息（10轮对话）
  const recent = messages.value.slice(-20)
  for (const msg of recent) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      apiMsgs.push({ role: msg.role, content: msg.content })
    }
  }
  return apiMsgs
}

// Mock回复（API不可用时的回退）
function getMockResponse(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('写') || lower.includes('文案') || lower.includes('文章')) {
    return '好的，我来帮您撰写文案。\n\n不过目前AI服务尚未完全配置（需要设置API Key），我可以给您一个框架建议：\n\n1. **标题**：抓住核心卖点\n2. **开头**：引发共鸣的痛点描述\n3. **正文**：分点阐述优势和案例\n4. **结尾**：行动号召（CTA）\n\n💡 等管理员配置好AI Provider的API Key后，我就能为您生成完整的文案了！'
  }
  if (lower.includes('图片') || lower.includes('画') || lower.includes('生成图')) {
    return '图片生成功能需要配置即梦(Jimeng)或OpenAI的API Key。\n\n当前状态：API Key未配置\n配置方法：管理后台 → 系统设置 → API配置\n\n配置完成后，我可以直接为您生成各种风格的图片！🎨'
  }
  if (lower.includes('建议') || lower.includes('商业') || lower.includes('创业')) {
    return '关于您的商业问题，我提供一些基础建议：\n\n📋 **市场分析**\n- 明确目标用户群体\n- 研究竞品定价和差异化\n- 评估市场规模和增长潜力\n\n💰 **财务规划**\n- 启动资金预算\n- 盈亏平衡点计算\n- 现金流管理\n\n🚀 **执行计划**\n- MVP最小可行产品先行\n- 快速验证、持续迭代\n\n（注：接入AI大模型后可提供更深入的分析）'
  }
  return '收到您的问题！\n\n我是罗圣AI智能体，目前处于演示模式。要启用完整的AI对话能力，需要管理员在后台配置AI Provider的API Key：\n\n⚙️ 配置路径：管理后台 → 系统设置 → API配置\n\n支持的服务商：\n• 🫘 豆包（字节跳动）\n• 🤖 OpenAI GPT\n• 🦙 通义千问（阿里云）\n• 🎨 即梦（图片生成）\n\n配置完成后我就能为您提供真正的AI智能服务！'
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: text,
    time: formatTime()
  })
  inputText.value = ''
  loading.value = true

  await nextTick()
  scrollToBottom()

  try {
    // 调用后端API
    const apiMessages = buildApiMessages()
    const res = await toolApi.chat(AGENT_TOOL_ID, apiMessages, {
      model: currentModelId.value,
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: SYSTEM_PROMPT
    })

    if (res.data && res.data.content) {
      messages.value.push({
        role: 'assistant',
        content: res.data.content,
        time: formatTime(),
        model: res.data.model || currentModelLabel.value,
        coinCost: res.data.coinCost
      })
    } else {
      throw new Error('Empty response')
    }
  } catch (error: any) {
    // API调用失败，使用Mock回退
    console.warn('AI API调用失败，使用本地回复:', error?.message || error)
    const mockResponse = getMockResponse(text)
    messages.value.push({
      role: 'assistant',
      content: mockResponse,
      time: formatTime(),
      model: '本地模式'
    })
  } finally {
    loading.value = false
    scrollToBottom()
    // 保存对话历史
    saveChatHistory()
  }
}

function saveChatHistory() {
  try {
    // 只保存最近50条消息
    const toSave = messages.value.slice(-50)
    localStorage.setItem('agent_chat_history', JSON.stringify(toSave))
  } catch (e) {
    console.error('Failed to save chat history', e)
  }
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// 监听消息变化自动保存
watch(messages, () => {
  saveChatHistory()
}, { deep: true })

onMounted(() => {
  // 从localStorage恢复对话历史
  const saved = localStorage.getItem('agent_chat_history')
  if (saved) {
    try {
      messages.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse chat history', e)
    }
  }
})
</script>

<style scoped>
.animate-bounce {
  animation: bounce 1.4s infinite;
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}
</style>
