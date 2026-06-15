<template>
  <div class="max-w-4xl mx-auto px-4 py-4 flex flex-col" style="height: calc(100vh - 100px);">
    <!-- 头部 -->
    <div class="cyber-card p-3 mb-3 flex items-center gap-3 flex-shrink-0">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style="box-shadow: 0 0 16px rgba(0,240,255,0.4);">
        <img src="/logo.png" alt="罗圣纪元" style="width:100%;height:100%;border-radius:12px;object-fit:cover;" />
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-base font-bold" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">罗圣AI智能体</h1>
        <div class="flex items-center gap-1.5 mt-0.5">
          <span class="w-2 h-2 rounded-full animate-pulse"
            :style="aiOnline ? 'background: var(--cyber-green); box-shadow: 0 0 6px var(--cyber-green);' : 'background: #ff6b00;'"></span>
          <span class="text-xs" style="color: var(--cyber-text-dim);">{{ statusText }}</span>
        </div>
      </div>
      <div class="flex gap-1.5 flex-shrink-0">
        <button @click="showModels = !showModels" class="px-2 py-1 rounded-lg text-xs"
          style="background: rgba(0,240,255,0.08); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.2);">
          🧠 {{ activeModelLabel }}
        </button>
        <button @click="clearChat" class="px-2 py-1 rounded-lg text-xs"
          style="background: rgba(255,68,68,0.08); color: #ff4444; border: 1px solid rgba(255,68,68,0.2);">
          🗑️
        </button>
      </div>
    </div>

    <!-- 模型选择 -->
    <div v-if="showModels" class="cyber-card p-2 mb-2 flex-shrink-0 flex flex-wrap gap-1.5">
      <button v-for="m in models" :key="m.value" @click="selectModel(m)"
        class="px-2.5 py-1 rounded-lg text-xs transition-all"
        :style="activeModel === m.value
          ? 'background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #000;'
          : 'background: rgba(0,240,255,0.03); color: var(--cyber-text-dim); border: 1px solid var(--cyber-border);'">
        {{ m.icon }} {{ m.label }}
      </button>
    </div>

    <!-- 功能Tab -->
    <div class="flex gap-2 mb-3 flex-shrink-0">
      <button v-for="t in tabs" :key="t.id" @click="tab = t.id"
        class="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
        :style="tab === t.id
          ? 'background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #000; box-shadow: 0 0 12px rgba(0,240,255,0.3);'
          : 'background: rgba(0,240,255,0.03); color: var(--cyber-text-dim); border: 1px solid var(--cyber-border);'">
        {{ t.icon }} {{ t.label }}
      </button>
    </div>

    <!-- ========== 文本对话 ========== -->
    <template v-if="tab === 'chat'">
      <!-- 欢迎 -->
      <div v-if="msgs.length === 0" class="flex-shrink-0 mb-3">
        <div class="text-center py-4">
          <div class="text-4xl mb-2" style="filter: drop-shadow(0 0 12px rgba(0,240,255,0.4));">🤖</div>
          <h2 class="text-lg font-bold mb-1" style="color: var(--cyber-cyan);">你好，我是罗圣AI</h2>
          <p class="text-xs" style="color: var(--cyber-text-dim);">由扣子大模型驱动，支持文案、编程、分析等全场景</p>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button v-for="c in quickCmds" :key="c.t" @click="sendQuick(c.t)"
            class="cyber-card p-2.5 text-left transition-all hover:-translate-y-0.5">
            <div class="text-base mb-0.5">{{ c.icon }}</div>
            <div class="text-xs font-medium" style="color: var(--cyber-text);">{{ c.l }}</div>
            <div class="text-[10px] mt-0.5" style="color: var(--cyber-text-dim);">{{ c.t }}</div>
          </button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else ref="chatBox" class="flex-1 overflow-y-auto mb-3 space-y-3 pr-1" style="scroll-behavior: smooth;">
        <div v-for="(msg, i) in msgs" :key="i" class="flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
          <div class="max-w-[85%] md:max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm"
            :style="msg.role === 'user'
              ? 'background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #000; border-radius: 16px 16px 4px 16px;'
              : 'background: rgba(0,240,255,0.05); color: var(--cyber-text); border: 1px solid var(--cyber-border); border-radius: 16px 16px 16px 4px;'"
            v-html="fmt(msg.content)">
          </div>
        </div>
        <!-- 加载 -->
        <div v-if="loading" class="flex justify-start">
          <div class="rounded-2xl px-3.5 py-2.5 text-sm"
            style="background: rgba(0,240,255,0.05); border: 1px solid var(--cyber-border); border-radius: 16px 16px 16px 4px;">
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full animate-bounce" style="background: var(--cyber-cyan);"></span>
              <span class="w-1.5 h-1.5 rounded-full animate-bounce" style="background: var(--cyber-cyan); animation-delay: 0.2s;"></span>
              <span class="w-1.5 h-1.5 rounded-full animate-bounce" style="background: var(--cyber-cyan); animation-delay: 0.4s;"></span>
              <span class="text-xs ml-1" style="color: var(--cyber-text-dim);">思考中...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="cyber-card p-3 flex-shrink-0">
        <div class="flex gap-2">
          <input v-model="input" @keyup.enter="sendMsg" :placeholder="loading ? 'AI思考中...' : '输入消息，Enter发送...'"
            :disabled="loading"
            class="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
            style="background: rgba(0,240,255,0.03); border: 1px solid var(--cyber-border); color: var(--cyber-text);"
            @focus="($event.target as HTMLInputElement).style.borderColor='var(--cyber-cyan)'"
            @blur="($event.target as HTMLInputElement).style.borderColor='var(--cyber-border)'" />
          <button @click="sendMsg" :disabled="!input.trim() || loading"
            class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style="background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #000;"
            :style="(!input.trim() || loading) ? 'opacity: 0.5; cursor: not-allowed;' : 'box-shadow: 0 0 16px rgba(0,240,255,0.4);'">
            发送
          </button>
        </div>
      </div>
    </template>

    <!-- ========== 图片生成 ========== -->
    <template v-if="tab === 'image'">
      <div class="flex-1 overflow-y-auto mb-3 space-y-3" style="min-height: 100px;">
        <div v-if="images.length === 0" class="text-center py-8">
          <div class="text-3xl mb-2">🎨</div>
          <p class="text-sm" style="color: var(--cyber-text-dim);">输入描述，AI为你生成图片</p>
        </div>
        <div v-for="(img, i) in images" :key="i" class="cyber-card p-3">
          <p class="text-xs mb-2" style="color: var(--cyber-text-dim);">🎨 {{ img.prompt }}</p>
          <img v-if="img.url" :src="img.url" class="w-full rounded-xl" style="border: 1px solid var(--cyber-border);" />
          <p v-else-if="img.loading" class="text-xs text-center py-8" style="color: var(--cyber-cyan);">⏳ 生成中...</p>
          <p v-else-if="img.error" class="text-xs text-center py-4" style="color: #ff4444;">{{ img.error }}</p>
        </div>
      </div>
      <div class="cyber-card p-3 flex-shrink-0">
        <div class="flex gap-2 mb-2">
          <select v-model="imgSize" class="px-2 py-1.5 rounded-lg text-xs outline-none"
            style="background: rgba(0,240,255,0.03); border: 1px solid var(--cyber-border); color: var(--cyber-text);">
            <option value="512x512">512×512</option>
            <option value="1024x1024">1024×1024</option>
            <option value="1024x1792">1024×1792 竖版</option>
            <option value="1792x1024">1792×1024 横版</option>
          </select>
          <select v-model="imgStyle" class="px-2 py-1.5 rounded-lg text-xs outline-none"
            style="background: rgba(0,240,255,0.03); border: 1px solid var(--cyber-border); color: var(--cyber-text);">
            <option value="">自动风格</option>
            <option value="写实">写实</option>
            <option value="动漫">动漫</option>
            <option value="油画">油画</option>
            <option value="水彩">水彩</option>
            <option value="赛博朋克">赛博朋克</option>
          </select>
        </div>
        <div class="flex gap-2">
          <input v-model="imgPrompt" @keyup.enter="genImage" placeholder="描述你想生成的图片..."
            class="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
            style="background: rgba(0,240,255,0.03); border: 1px solid var(--cyber-border); color: var(--cyber-text);" />
          <button @click="genImage" :disabled="!imgPrompt.trim() || genLoading"
            class="px-5 py-2.5 rounded-xl text-sm font-bold"
            style="background: linear-gradient(135deg, #ff6b9d, var(--cyber-purple)); color: #000;">
            {{ genLoading ? '生成中...' : '生成' }}
          </button>
        </div>
      </div>
    </template>

    <!-- ========== 视频生成 ========== -->
    <template v-if="tab === 'video'">
      <div class="flex-1 overflow-y-auto mb-3 space-y-3" style="min-height: 100px;">
        <div v-if="videos.length === 0" class="text-center py-8">
          <div class="text-3xl mb-2">🎬</div>
          <p class="text-sm" style="color: var(--cyber-text-dim);">视频生成功能即将开放，敬请期待</p>
        </div>
        <div v-for="(vid, i) in videos" :key="i" class="cyber-card p-3">
          <p class="text-xs mb-2" style="color: var(--cyber-text-dim);">🎬 {{ vid.prompt }}</p>
          <video v-if="vid.url" :src="vid.url" controls class="w-full rounded-xl"></video>
          <p v-else-if="vid.loading" class="text-xs text-center py-8" style="color: var(--cyber-cyan);">⏳ 视频生成中，预计1-3分钟...</p>
          <p v-else-if="vid.error" class="text-xs text-center py-4" style="color: #ff4444;">{{ vid.error }}</p>
        </div>
      </div>
      <div class="cyber-card p-3 flex-shrink-0">
        <div class="flex gap-2">
          <input v-model="vidPrompt" @keyup.enter="genVideo" placeholder="描述你想生成的视频..."
            class="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
            style="background: rgba(0,240,255,0.03); border: 1px solid var(--cyber-border); color: var(--cyber-text);" />
          <button @click="genVideo" :disabled="!vidPrompt.trim() || vidLoading"
            class="px-5 py-2.5 rounded-xl text-sm font-bold"
            style="background: linear-gradient(135deg, #00f0ff, var(--cyber-green)); color: #000;">
            {{ vidLoading ? '生成中...' : '生成' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'

// ========== API配置 ==========
const API_BASE = '/api/v1'
const authToken = localStorage.getItem('lsjy_token') || ''
// 视频生成暂时使用Coze API
const COZE_API = 'https://api.coze.cn/v3/chat'
const COZE_TOKEN = 'pat_PzQlUbxdIXu7txW3cvP69EpHRLSidiY8KKa3NQ98KncpAA8jnOIZpZZMnJQd2ld5'
const BOT_ID = '7651223356586786856'

// ========== 状态 ==========
const msgs = ref<{role:'user'|'assistant'; content:string; model?:string}[]>([])
const input = ref('')
const loading = ref(false)
const showModels = ref(false)
const activeModel = ref('auto')
const tab = ref<'chat'|'image'|'video'>('chat')
const chatBox = ref<HTMLElement|null>(null)
const aiOnline = ref(true)

// 图片生成
const imgPrompt = ref('')
const imgSize = ref('1024x1024')
const imgStyle = ref('')
const genLoading = ref(false)
const images = ref<{prompt:string; url?:string; loading?:boolean; error?:string}[]>([])

// 视频生成
const vidPrompt = ref('')
const vidLoading = ref(false)
const videos = ref<{prompt:string; url?:string; loading?:boolean; error?:string}[]>([])

// ========== 系统提示词 ==========
const SYS_PROMPT = `你是"罗圣AI智能体"，由祁阳市罗圣纪元互联网科技有限责任公司（lsjyapp.cn）开发。

公司信息：
- 创始人/董事长/CEO：罗凯中
- 六大业务：AI智能服务、自媒体运营、电商服务、在线教育、宠物服务、伯雅校园

回复规范：
1. 专业、友好、有实质内容
2. 被问到创始人/公司时，热情介绍罗凯中先生的成就
3. 每个问题给出有价值的、具体的回答，不说废话
4. 禁止使用"这个问题很有意思"等模板开头
5. 直接给答案，不要说"收到你的问题"等废话
6. 支持图片生成和视频生成的引导`

// ========== 常量 ==========
const tabs = [
  { id: 'chat' as const, label: 'AI对话', icon: '💬' },
  { id: 'image' as const, label: '图片生成', icon: '🎨' },
  { id: 'video' as const, label: '视频生成', icon: '🎬' },
]

const models = [
  { value: 'auto', label: '自动', icon: '⚡' },
  { value: 'doubao', label: '豆包', icon: '🫘' },
  { value: 'deepseek', label: 'DeepSeek', icon: '🔍' },
  { value: 'tongyi', label: '千问', icon: '🦙' },
  { value: 'yuanbao', label: '元宝', icon: '🐧' },
]

const quickCmds = [
  { icon: '📝', l: '写文案', t: '帮我写一篇关于AI赋能实体经济的宣传文案' },
  { icon: '💡', l: '商业建议', t: '我想开一家AI培训机构，给我一些建议' },
  { icon: '📊', l: '盈利分析', t: '帮我分析一下SaaS平台的盈利模式' },
  { icon: '🏢', l: '了解罗圣', t: '罗圣纪元是做什么的？创始人是谁？' },
]

const activeModelLabel = computed(() => models.find(m => m.value === activeModel.value)?.label || '自动')
const statusText = computed(() => {
  if (loading.value) return '思考中...'
  if (genLoading.value) return '生成图片中...'
  if (vidLoading.value) return '生成视频中...'
  return aiOnline.value ? '在线 · 扣子大模型驱动' : '连接中...'
})

function selectModel(m: {value:string}) { activeModel.value = m.value; showModels.value = false }

function fmt(c: string): string {
  if (!c) return ''
  return c
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/```([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px;overflow-x:auto;margin:4px 0;font-size:12px;">$1</pre>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(0,240,255,0.1);padding:1px 4px;border-radius:3px;">$1</code>')
    .replace(/\n/g, '<br>')
}

function scrollToBottom() {
  nextTick(() => { if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight })
}

function clearChat() {
  msgs.value = []
  localStorage.removeItem('lsjy_chat_v2')
}

function sendQuick(t: string) { input.value = t; sendMsg() }

// ========== 核心：扣子API对话 ==========
async function sendMsg() {
  const text = input.value.trim()
  if (!text || loading.value) return

  msgs.value.push({ role: 'user', content: text })
  input.value = ''
  loading.value = true
  scrollToBottom()

  // 构建消息列表
  const history = msgs.value.slice(-20).map(m => ({
    role: m.role,
    content: m.content,
    type: m.role === 'user' ? 'query' as const : 'answer' as const
  }))

  // 加入系统提示
  const apiMsgs = [
    { role: 'user' as const, content: SYS_PROMPT, type: 'query' as const },
    ...history
  ]

  try {
    // 构建后端API需要的消息格式
    const backendMessages = msgs.value.slice(-20).map(m => ({
      role: m.role,
      content: m.content
    }))

    const res = await fetch(`${API_BASE}/ai/tools/2/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: backendMessages,
        provider: activeModel.value === 'auto' ? undefined : activeModel.value
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`API ${res.status}: ${errText.substring(0, 100)}`)
    }

    const result = await res.json()
    if (result.code !== 0) {
      throw new Error(result.message || 'AI服务返回错误')
    }

    // 添加助手回复
    msgs.value.push({
      role: 'assistant',
      content: result.data.content || '⚠️ 模型未返回有效内容',
      model: result.data.model || activeModelLabel.value
    })

    // 保存
    saveChat()
  } catch (e: any) {
    console.error('Backend API error:', e)
    msgs.value.push({
      role: 'assistant',
      content: `⚠️ AI服务连接失败：${e.message || '网络异常'}\n\n请检查网络连接后重试。`,
      model: '系统'
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

// ========== 图片生成 ==========
async function genImage() {
  const prompt = imgPrompt.value.trim()
  if (!prompt || genLoading.value) return

  const fullPrompt = imgStyle.value
    ? `请以${imgStyle.value}风格生成图片：${prompt}`
    : `请生成一张图片：${prompt}`

  images.value.unshift({ prompt, loading: true })
  genLoading.value = true

  try {
    // 直接调用后端图片生成API（即梦/DALL-E）
    const res = await fetch(`${API_BASE}/ai/tools/2/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        width: parseInt(imgSize.value.split('x')[0]) || 1024,
        height: parseInt(imgSize.value.split('x')[1]) || 1024,
        style: imgStyle.value || 'auto',
        count: 1,
      }),
    })

    if (!res.ok) throw new Error(`API ${res.status}`)

    const data = await res.json()
    
    if (data.code === 0 && data.data?.urls?.length > 0) {
      images.value[0] = {
        prompt,
        url: data.data.urls[0],
        model: data.data.model || 'AI绘画',
      }
    } else {
      throw new Error(data.message || '图片生成失败')
    }
  } catch (err) {
    console.error('图片生成失败:', err)
    images.value[0] = {
      prompt,
      error: `生成失败：${err.message}。请检查API Key配置或使用更详细的描述。`,
    }
  } finally {
    genLoading.value = false
  }
}

// ========== 视频生成（暂未开放）==========
async function genVideo() {
  const prompt = vidPrompt.value.trim()
  if (!prompt || vidLoading.value) return

  videos.value.unshift({ prompt, loading: true })
  vidLoading.value = true

  // 视频生成暂未开放，显示提示信息
  await new Promise(r => setTimeout(r, 1000))
  const vidEntry = videos.value.find(v => v.prompt === prompt && v.loading)
  if (vidEntry) {
    vidEntry.loading = false
    vidEntry.error = '🎬 视频生成功能暂未开放，正在对接可灵/即梦视频API，敬请期待！'
  }
  vidLoading.value = false
}

// ========== 持久化 ==========
function saveChat() {
  try { localStorage.setItem('lsjy_chat_v2', JSON.stringify(msgs.value.slice(-50))) } catch {}
}
watch(msgs, () => saveChat(), { deep: true })

onMounted(() => {
  const s = localStorage.getItem('lsjy_chat_v2')
  if (s) try { msgs.value = JSON.parse(s) } catch {}
  // 检测后端API可用性
  fetch(`${API_BASE}/ai/providers`)
    .then(r => { aiOnline.value = r.ok })
    .catch(() => { aiOnline.value = false })
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
