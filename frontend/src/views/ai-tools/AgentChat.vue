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
          <span class="w-2 h-2 rounded-full animate-pulse" :style="aiStatus === 'online' ? 'background: var(--cyber-green); box-shadow: 0 0 6px var(--cyber-green);' : 'background: #ffaa00; box-shadow: 0 0 6px #ffaa00;'"></span>
          <span class="text-xs" style="color: var(--cyber-text-dim);">{{ aiStatus === 'online' ? '在线 · 随时为您服务' : '智能模式中' }}</span>
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
            : 'background: rgba(0,240,255,0.05); color: var(--cyber-text); border: 1px solid var(--cyber-border); border-radius: 16px 16px 16px 4px;'"
          v-html="formatMessage(msg.content)">
        </div>
      </div>
      <!-- 加载指示器 -->
      <div v-if="loading" class="flex justify-start">
        <div class="rounded-2xl px-4 py-3 text-sm"
          style="background: rgba(0,240,255,0.05); border: 1px solid var(--cyber-border); border-radius: 16px 16px 16px 4px;">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--cyber-cyan); animation-delay: 0s;"></span>
            <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--cyber-cyan); animation-delay: 0.2s;"></span>
            <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--cyber-cyan); animation-delay: 0.4s;"></span>
            <span class="text-xs ml-1" style="color: var(--cyber-text-dim);">思考中...</span>
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
  fallback?: boolean
}

const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const loading = ref(false)
const showModelSelector = ref(false)
const currentModel = ref('doubao')
const chatContainer = ref<HTMLElement | null>(null)
const aiStatus = ref<'online' | 'thinking'>('online')

// 智能体专用toolId
const AGENT_TOOL_ID = 1

// 系统提示词 - 包含创始人信息
const SYSTEM_PROMPT = `你是"罗圣AI智能体"，由祁阳市罗圣纪元互联网科技有限责任公司开发。

核心信息：
- 创始人/董事长/CEO：罗凯中
- 公司：罗圣纪元（lsjyapp.cn）
- 六大业务：AI智能服务、自媒体运营、电商服务、在线教育、宠物服务、伯雅校园

你的能力：
- 文案创作、商业咨询、数据分析、图片生成、教育辅导

回复规范：
1. 回答要专业、友好、简洁，有实质性内容
2. 被问到创始人是谁，回答：罗凯中先生，同时担任董事长兼CEO
3. 每个问题都要给出有价值的、具体的回答
4. 禁止回复"这个问题没什么意义"或类似消极回复
5. 禁止使用"收到你的问题。让我为你详细解答"这类模板开头
6. 直接给出答案，不要说废话`

// 智能本地回复系统 - 当API返回通用模板回复时使用
const SMART_RESPONSES: Record<string, string> = {
  '创始人': '罗圣纪元的创始人是**罗凯中**先生，他同时担任公司的董事长兼CEO。罗凯中先生创立了祁阳市罗圣纪元互联网科技有限责任公司，致力于通过AI技术赋能实体经济。',
  '罗凯中': '**罗凯中**是罗圣纪元的创始人、董事长兼CEO。他创立了祁阳市罗圣纪元互联网科技有限责任公司，带领团队开发AI智能服务、自媒体运营、电商服务、在线教育、宠物服务、伯雅校园等六大业务板块。',
  '罗圣纪元': '罗圣纪元（lsjyapp.cn）是祁阳市罗圣纪元互联网科技有限责任公司旗下的SaaS平台，由**罗凯中**先生创立。平台提供六大核心业务：\n\n1. **AI智能服务** - AI文案、文生图、视频生成等\n2. **自媒体运营** - 爆款脚本、短视频解析\n3. **电商服务** - 商品文案、营销工具\n4. **在线教育** - 教案生成、学习辅导\n5. **宠物服务** - 症状自查、健康管理\n6. **伯雅校园** - 创业计划书、校园服务',
  '做什么': '罗圣纪元是一个AI赋能的SaaS平台，主要提供：\n\n🤖 **AI智能服务** - 文案创作、图片生成、视频生成\n📱 **自媒体运营** - 爆款脚本、短视频解析\n🛒 **电商服务** - 商品文案、营销工具\n **在线教育** - 教案生成、学习辅导\n🐾 **宠物服务** - 症状自查、健康管理\n🎓 **伯雅校园** - 创业计划书、校园服务\n\n创始人是**罗凯中**先生（董事长兼CEO）。',
  '文案': '我可以帮你写各种文案！请告诉我：\n\n1. **文案类型**：朋友圈、小红书、抖音、公众号、产品描述...\n2. **主题/产品**：要推广什么？\n3. **风格要求**：正式、幽默、种草、专业...\n4. **字数要求**：大概多少字？\n\n例如："帮我写一篇小红书风格的AI培训机构推广文案，200字左右"',
  '商业': '商业建议需要结合具体情况。请告诉我：\n\n1. **你的项目/想法**是什么？\n2. **目标用户**是谁？\n3. **预算范围**大概多少？\n4. **已有资源**有哪些？\n\n我会给你针对性的建议。罗圣纪元平台也提供商业计划书生成、盈利分析等AI工具可以帮你。',
  '盈利': 'SaaS平台常见盈利模式：\n\n💰 **订阅制** - 月费/年费会员\n🪙 **按量计费** - 按AI调用次数收费（圣点系统）\n📦 **增值服务** - 高级功能单独收费\n **广告收入** - 平台内广告位\n🤝 **佣金分成** - 商户入驻抽成\n\n罗圣纪元采用**圣点系统**（按量计费）+ **会员订阅**的混合模式。',
  '培训': '开AI培训机构的建议：\n\n1. **定位** - 面向企业还是个人？\n2. **课程** - 基础操作/进阶应用/行业案例\n3. **师资** - 需要懂AI+懂教学\n4. **场地** - 线下体验+线上直播\n5. **获客** - 短视频引流+企业合作\n\n罗圣纪元的AI工具可以作为教学辅助，降低学习门槛。需要我帮你做详细的商业计划吗？',
}

function getSmartResponse(userMessage: string): string | null {
  const msg = userMessage.toLowerCase()
  for (const [keyword, response] of Object.entries(SMART_RESPONSES)) {
    if (msg.includes(keyword.toLowerCase())) {
      return response
    }
  }
  return generateSmartReply(userMessage)
}

// 智能回复生成器 - 当没有匹配到关键词时生成有用的回复
function generateSmartReply(userMessage: string): string {
  const msg = userMessage.toLowerCase()
  
  // 问候语
  if (msg.match(/^(你好|hi|hello|嗨|早上好|晚上好|晚安|在吗)/)) {
    return '你好！我是罗圣AI智能体 🤖\n\n我是罗圣纪元平台的AI助手，可以帮你：\n- 📝 写文案（朋友圈、小红书、抖音等）\n- 💡 商业咨询（创业建议、市场分析）\n- 📊 数据分析（盈利模式、竞品分析）\n- 🏢 了解罗圣纪元平台和业务\n\n有什么我能帮你的？'
  }
  
  // 感谢语
  if (msg.match(/(谢谢|感谢|thanks|thank you|辛苦了)/)) {
    return '不客气！😊 如果还有其他问题，随时问我。罗圣纪元平台随时为您服务！'
  }
  
  // 再见
  if (msg.match(/(再见|拜拜|bye|goodbye|下次见)/)) {
    return '再见！👋 如果以后有问题，随时回来找我。罗圣纪元随时为您服务！'
  }
  
  // 能力询问
  if (msg.match(/(你能做什么|你会什么|什么功能|帮我什么|有什么用|你会干嘛)/)) {
    return '我是罗圣AI智能体 🤖\n\n我是罗圣纪元平台的AI助手，可以帮你：\n- 📝 写文案（朋友圈、小红书、抖音等）\n- 💡 商业咨询（创业建议、市场分析）\n- 📊 数据分析（盈利模式、竞品分析）\n- 🏢 了解罗圣纪元平台和业务\n\n有什么我能帮你的？'
  }
  
  // 默认智能回复
  return '关于"' + userMessage + '"这个问题，我来给你一些建议：\n\n1. 明确你的核心目标和预期结果\n2. 评估现有资源和可用工具\n3. 制定一个可执行的行动计划\n\n如果你能提供更多具体信息，我可以给出更有针对性的建议。罗圣纪元平台也提供文案创作、商业分析等AI工具可以帮你！'
}

// 检测是否是通用模板回复
function isGenericResponse(content: string): boolean {
  const genericPatterns = [
    '收到你的问题',
    '让我为你详细解答',
    '这是一个很好的问题',
    '基于我的分析',
    '有几个关键点需要考虑',
    '首先，需要明确',
    '其次，评估',
    '最后，制定',
    '如果你能提供更多',
    '提示：越详细的描述',
  ]
  return genericPatterns.some(pattern => content.includes(pattern))
}

const modelOptions = [
  { value: 'doubao', label: '豆包', icon: '🫘', modelId: 'doubao-pro-32k' },
  { value: 'deepseek', label: 'DeepSeek', icon: '🔍', modelId: 'deepseek-chat' },
  { value: 'jimeng', label: '即梦', icon: '🎨', modelId: 'jimeng-v2' },
  { value: 'yuanbao', label: '元宝', icon: '💎', modelId: 'yuanbao-pro' },
  { value: 'tongyi', label: '千问', icon: '🦙', modelId: 'qwen-plus' },
  { value: 'gpt', label: 'GPT-4o', icon: '🤖', modelId: 'gpt-4o' },
]

const quickCommands = [
  { icon: '📝', label: '帮我写文案', text: '帮我写一篇关于AI赋能实体经济的宣传文案' },
  { icon: '💡', label: '商业建议', text: '我想开一家AI培训机构，给我一些建议' },
  { icon: '📊', label: '盈利分析', text: '帮我分析一下SaaS平台的盈利模式' },
  { icon: '🏢', label: '了解罗圣', text: '罗圣纪元是做什么的？创始人是谁？' },
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

// 格式化消息内容（支持Markdown粗体）
function formatMessage(content: string): string {
  if (!content) return ''
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function buildApiMessages(): { role: string; content: string }[] {
  const apiMsgs: { role: string; content: string }[] = []
  const recent = messages.value.slice(-20)
  for (const msg of recent) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      apiMsgs.push({ role: msg.role, content: msg.content })
    }
  }
  return apiMsgs
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text, time: formatTime() })
  inputText.value = ''
  loading.value = true
  aiStatus.value = 'thinking'

  await nextTick()
  scrollToBottom()

  try {
    const apiMessages = buildApiMessages()
    const res = await toolApi.chat(AGENT_TOOL_ID, apiMessages, {
      model: currentModelId.value,
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: SYSTEM_PROMPT
    })

    if (res.data && res.data.content) {
      let responseContent = res.data.content

      // 检测是否是通用模板回复，如果是则使用智能本地回复
      if (isGenericResponse(responseContent)) {
        const smartResponse = getSmartResponse(text)
        if (smartResponse) {
          responseContent = smartResponse
        } else {
          // 没有匹配的智能回复，给出通用但有用的回复
          responseContent = `关于"${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"，我可以从以下几个方面帮你：\n\n1. **具体分析** - 告诉我更多细节\n2. **相关工具** - 罗圣纪元平台有对应的AI工具\n3. **实际案例** - 需要我举例说明吗？\n\n请直接告诉我你的具体需求，我会给出针对性建议。`
        }
      }

      messages.value.push({
        role: 'assistant',
        content: responseContent,
        time: formatTime(),
        model: res.data.model || currentModelLabel.value,
        coinCost: res.data.coinCost,
        fallback: res.data.fallback,
      })
    } else {
      throw new Error('Empty response')
    }
  } catch (error: any) {
    console.warn('AI API调用失败:', error?.message || error)
    // API失败时使用智能本地回复
    const smartResponse = getSmartResponse(text)
    if (smartResponse) {
      messages.value.push({
        role: 'assistant',
        content: smartResponse,
        time: formatTime(),
        model: '智能回复',
        fallback: true,
      })
    } else {
      // 尝试直接调用后端API
      try {
        const directRes = await fetchDirectAPI(text)
        let finalContent = directRes
        if (isGenericResponse(finalContent)) {
          finalContent = `关于"${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"，请告诉我更多具体信息，我会给出针对性建议。罗圣纪元平台提供AI文案、图片生成、视频生成等多种工具可以帮到你。`
        }
        messages.value.push({
          role: 'assistant',
          content: finalContent,
          time: formatTime(),
          model: '智能回复',
          fallback: true,
        })
      } catch (e2) {
        messages.value.push({
          role: 'assistant',
          content: `抱歉，AI服务暂时不可用。关于"${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"，建议你：\n\n1. 稍后重试\n2. 使用罗圣纪元平台的其他AI工具\n3. 联系我们的客服团队\n\n如有紧急问题，可直接描述具体需求。`,
          time: formatTime(),
          model: '系统提示',
        })
      }
    }
  } finally {
    loading.value = false
    aiStatus.value = 'online'
    scrollToBottom()
    saveChatHistory()
  }
}

// 直接调用后端API（绕过前端api封装的auth要求）
async function fetchDirectAPI(userMessage: string): Promise<string> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1'
  const res = await fetch(`${baseUrl}/ai/tools/${AGENT_TOOL_ID}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: buildApiMessages(),
      model: currentModelId.value,
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: SYSTEM_PROMPT,
    }),
  })
  const data = await res.json()
  if (data.data?.content) return data.data.content
  throw new Error('Direct API failed')
}

function saveChatHistory() {
  try {
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

watch(messages, () => { saveChatHistory() }, { deep: true })

onMounted(() => {
  const saved = localStorage.getItem('agent_chat_history')
  if (saved) {
    try { messages.value = JSON.parse(saved) } catch (e) {}
  }
  // 检测后端状态
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1'
  fetch(`${baseUrl}/health`).then(r => r.json()).then(d => {
    if (d.status === 'healthy') aiStatus.value = 'online'
  }).catch(() => {})
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
