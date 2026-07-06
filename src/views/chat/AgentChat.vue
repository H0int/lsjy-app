<template>
  <div class="chat-root" style="height:calc(100vh - 7rem);display:flex;flex-direction:column;background:#0a0a1a;">
    <!-- 背景粒子效果 -->
    <div class="bg-particles">
      <div v-for="n in 20" :key="n" class="particle" :style="particleStyle(n)"></div>
    </div>

    <!-- Header - 紧凑版 -->
    <div class="chat-header">
      <div class="avatar-container">
        <div class="avatar-ring ring-outer"></div>
        <div class="avatar-ring ring-inner"></div>
        <div class="avatar-core">
          <svg viewBox="0 0 40 40" class="avatar-svg">
            <defs>
              <linearGradient id="ag1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00f0ff"/>
                <stop offset="50%" stop-color="#b700ff"/>
                <stop offset="100%" stop-color="#ff006a"/>
              </linearGradient>
              <filter id="glow"><feGaussianBlur stdDeviation="2" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <circle cx="20" cy="20" r="12" fill="none" stroke="url(#ag1)" stroke-width="1.5" filter="url(#glow)"/>
            <circle cx="14" cy="16" r="2" fill="#00f0ff" filter="url(#glow)"/>
            <circle cx="26" cy="16" r="2" fill="#b700ff" filter="url(#glow)"/>
            <path d="M14 24 Q20 29 26 24" fill="none" stroke="#00f0ff" stroke-width="1.2" filter="url(#glow)"/>
            <line x1="20" y1="6" x2="20" y2="2" stroke="#00f0ff" stroke-width="1" opacity="0.6"/>
            <line x1="20" y1="34" x2="20" y2="38" stroke="#b700ff" stroke-width="1" opacity="0.6"/>
            <line x1="6" y1="20" x2="2" y2="20" stroke="#00f0ff" stroke-width="1" opacity="0.6"/>
            <line x1="34" y1="20" x2="38" y2="20" stroke="#b700ff" stroke-width="1" opacity="0.6"/>
          </svg>
        </div>
        <div class="status-pulse"></div>
      </div>
      <div class="header-info">
        <div class="header-title">罗圣AI</div>
        <div class="header-sub">
          <span class="status-dot"></span>
          <span>{{loading ? thinkingText : currentCap.desc}}</span>
        </div>
      </div>

      <!-- 融合选择器：能力+模型合一 -->
      <div class="combo-selector" @click="showComboMenu = !showComboMenu">
        <span class="cs-icon">{{currentCap.icon}}</span>
        <span class="cs-label">{{currentCap.name}}</span>
        <span class="cs-model" v-if="selectedModel">· {{currentModelLabel}}</span>
        <span class="cs-arrow" :class="{open: showComboMenu}">▾</span>
        
        <div v-if="showComboMenu" class="cs-dropdown" @click.stop>
          <!-- 能力列表 -->
          <div class="cs-section-title">⚙️ AI员工能力</div>
          <div v-for="c in aiCapabilities" :key="c.id"
            class="cs-option" :class="{active: selectedToolId === c.id}"
            @click.stop="selectCapability(c.id)">
            <span class="cso-icon">{{c.icon}}</span>
            <span class="cso-name">{{c.name}}</span>
            <span class="cso-cost">{{c.cost}}SP</span>
            <span v-if="selectedToolId === c.id" class="cso-check">✓</span>
          </div>
          
          <!-- 分割线 -->
          <div class="cs-divider"></div>
          
          <!-- 模型列表 -->
          <div class="cs-section-title">🤖 大模型</div>
          <div v-for="m in models" :key="m.value"
            class="cs-option" :class="{active: selectedModel === m.value}"
            @click.stop="selectModel(m.value)">
            <span class="cso-icon">{{m.icon}}</span>
            <span class="cso-name">{{m.label}}</span>
            <span v-if="selectedModel === m.value" class="cso-check">✓</span>
          </div>
        </div>
      </div>

      <!-- 圣力余额（紧凑） -->
      <div class="sl-balance-mini">
        <span class="sl-icon">⚡</span>
        <span class="sl-val">{{userCoins}}</span>
      </div>
    </div>

    <!-- 圣力不足弹窗 -->
    <div v-if="showCoinLow" class="coin-low-modal" @click.self="showCoinLow = false">
      <div class="coin-low-card">
        <div class="clc-icon">⚡</div>
        <div class="clc-title">圣力不足</div>
        <div class="clc-desc">当前圣力已用完，请充值后继续使用</div>
        <div class="clc-btns">
          <button class="clc-cancel" @click="showCoinLow = false">稍后再说</button>
          <button class="clc-confirm" @click="$router.push('/profile/wallet'); showCoinLow = false">立即充值</button>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div ref="msgContainer" class="chat-messages">
      <!-- 欢迎页 -->
      <div v-if="messages.length===0" class="welcome-screen">
        <div class="welcome-avatar">
          <div class="wa-ring wa-r1"></div>
          <div class="wa-ring wa-r2"></div>
          <div class="wa-ring wa-r3"></div>
          <div class="wa-core">
            <svg viewBox="0 0 80 80" width="80" height="80">
              <defs>
                <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#00f0ff"/>
                  <stop offset="100%" stop-color="#b700ff"/>
                </linearGradient>
                <filter id="wglow"><feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <circle cx="40" cy="40" r="24" fill="none" stroke="url(#wg1)" stroke-width="2" filter="url(#wglow)"/>
              <circle cx="30" cy="34" r="4" fill="#00f0ff" filter="url(#wglow)"><animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/></circle>
              <circle cx="50" cy="34" r="4" fill="#b700ff" filter="url(#wglow)"><animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="0.3s" repeatCount="indefinite"/></circle>
              <path d="M28 50 Q40 60 52 50" fill="none" stroke="url(#wg1)" stroke-width="2" filter="url(#wglow)"/>
            </svg>
          </div>
        </div>
        <h2 class="welcome-title">你好，我是 <span class="gradient-text">罗圣AI</span></h2>
        <p class="welcome-desc">你的全能AI助手，有什么可以帮你的？</p>
        <div class="suggestions-grid">
          <div v-for="s in suggestions" :key="s.text" class="suggestion-card" @click="useSuggestion(s.text)">
            <span class="sug-icon">{{s.icon}}</span>
            <span class="sug-text">{{s.text}}</span>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <template v-for="(msg, idx) in messages" :key="idx">
        <div :class="['msg-row', msg.role === 'user' ? 'msg-user' : 'msg-ai']">
          <div v-if="msg.role === 'assistant'" class="msg-avatar-sm">
            <span style="font-size:14px;">🤖</span>
          </div>
          <div :class="['msg-bubble', msg.role === 'user' ? 'bubble-user' : 'bubble-ai']">
            <div class="msg-text">{{msg.content}}</div>
            <div v-if="msg.role === 'assistant'" class="msg-model-tag">{{msg.model || 'AI'}}</div>
          </div>
        </div>
      </template>

      <!-- 思考中 -->
      <div v-if="loading" class="msg-row msg-ai">
        <div class="msg-avatar-sm"><span style="font-size:14px;">🤖</span></div>
        <div class="msg-bubble bubble-ai">
          <div class="thinking-container">
            <div class="thinking-visual">
              <div class="tv-ring tv-r1"></div>
              <div class="tv-ring tv-r2"></div>
              <div class="tv-core-dot"></div>
            </div>
            <div class="thinking-bars">
              <div v-for="i in 5" :key="i" class="tbar" :style="{animationDelay: i*0.1+'s'}"></div>
            </div>
            <div class="thinking-text">{{thinkingText}}</div>
            <div class="thinking-dots">
              <div v-for="i in 3" :key="i" class="tdot" :style="{animationDelay: i*0.15+'s'}"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="chat-input-area">
      <div class="input-glow"></div>
      <input ref="inputRef" v-model="inputText" @keyup.enter="sendMessage" 
        :disabled="loading" class="chat-input" placeholder="输入你的问题..."/>
      <button class="send-btn" @click="sendMessage" :disabled="loading || !inputText.trim()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'

const inputText = ref('')
const loading = ref(false)
const thinkingText = ref('思考中...')
const msgContainer = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const messages = ref<{role: string, content: string, model?: string}[]>([])

const selectedModel = ref('') // 默认空，用户自选
const selectedToolId = ref(1)
const userCoins = ref(0)
const showCoinLow = ref(false)
const showComboMenu = ref(false)

// 15个AI员工能力
const aiCapabilities = [
  {id: 1, icon: '🤖', name: '罗圣AI', desc: '罗总数字分身·全能AI助手', cost: 1},
  {id: 2, icon: '📝', name: '文案创作', desc: '营销文案生成', cost: 10},
  {id: 3, icon: '🎨', name: 'AI绘画', desc: 'AI图片生成', cost: 20},
  {id: 4, icon: '📊', name: '数据分析', desc: '数据解读分析', cost: 15},
  {id: 5, icon: '💻', name: '代码助手', desc: '代码生成调试', cost: 20},
  {id: 6, icon: '🔍', name: '调研分析', desc: '深度调研报告', cost: 15},
  {id: 7, icon: '💰', name: '投资理财', desc: '投资建议分析', cost: 20},
  {id: 8, icon: '⚖️', name: '合规风控', desc: '风险合规审查', cost: 25},
  {id: 9, icon: '🏗️', name: '代码架构', desc: '系统架构设计', cost: 30},
  {id: 10, icon: '📢', name: '营销策划', desc: '营销方案策划', cost: 15},
  {id: 11, icon: '🎯', name: '产品设计', desc: '产品方案设计', cost: 20},
  {id: 12, icon: '📈', name: '运营优化', desc: '运营策略优化', cost: 15},
  {id: 13, icon: '💬', name: '客户服务', desc: '客户沟通支持', cost: 5},
  {id: 14, icon: '📚', name: '技术培训', desc: '知识分享培训', cost: 10},
  {id: 15, icon: '🤝', name: '商务拓展', desc: '商务合作资源', cost: 20},
]

// 模型列表 - 默认空
const models = [
  {value: '', icon: '✨', label: '默认', desc: '系统自动选择'},
  {value:'coze', icon:'🧠', label:'罗圣AI', desc: '深度理解'},
  {value:'deepseek', icon:'🔮', label:'DeepSeek', desc: '深度推理'},
  {value:'doubao', icon:'🫘', label:'豆包', desc: '通用对话'},
  {value:'tongyi', icon:'🌐', label:'通义千问', desc: '知识问答'},
  {value:'yuanbao', icon:'💎', label:'腾讯元宝', desc: '创意写作'},
]

const currentCap = computed(() => aiCapabilities.find(c => c.id === selectedToolId.value) || aiCapabilities[0])
const currentModelLabel = computed(() => models.find(m => m.value === selectedModel.value)?.label || '默认')

function selectModel(v: string) {
  selectedModel.value = v
  showComboMenu.value = false
}

function selectCapability(id: number) {
  selectedToolId.value = id
  showComboMenu.value = false
}

// 实时获取余额
async function fetchBalance() {
  try {
    const token = localStorage.getItem('lsjy_token')
    if (!token) return
    const res = await fetch('https://api.lsjyapp.cn/api/v1/payment/coin/balance', {
      headers: {'Authorization': `Bearer ${token}`}
    })
    const data = await res.json()
    if (data.code === 0) userCoins.value = data.data.balance
  } catch(e) { console.log('获取余额失败', e) }
}

const suggestions = [
  {icon:'💡', text:'帮我写一篇小红书爆款文案'},
  {icon:'📈', text:'分析今天A股行情走势'},
  {icon:'🧠', text:'罗圣纪元公司有哪些业务'},
  {icon:'✍️', text:'帮我写一份商业计划书'},
  {icon:'🎯', text:'制定一个营销推广方案'},
  {icon:'💼', text:'分析一个创业项目的可行性'},
  {icon:'📊', text:'帮我做一份竞品分析报告'},
  {icon:'🎨', text:'生成赛博朋克风格图片'},
  {icon:'📝', text:'帮我写一篇公众号文章'},
  {icon:'🤖', text:'罗总，帮我写一份商业计划书'}
]

const thinkingPhrases = ['正在连接量子计算节点','神经网络推理中','扫描知识库数据','生成最优回答策略','深度语义分析中','跨维度信息整合']
let thinkIdx = 0
let thinkTimer: any = null

function startThinking() {
  thinkIdx = 0
  thinkingText.value = thinkingPhrases[0]
  thinkTimer = setInterval(() => {
    thinkIdx = (thinkIdx + 1) % thinkingPhrases.length
    thinkingText.value = thinkingPhrases[thinkIdx]
  }, 1500)
}
function stopThinking() {
  if (thinkTimer) { clearInterval(thinkTimer); thinkTimer = null }
  thinkingText.value = '思考中...'
}

function useSuggestion(text: string) {
  inputText.value = text
  sendMessage()
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  messages.value.push({role: 'user', content: text})
  inputText.value = ''
  loading.value = true
  startThinking()
  await nextTick()
  scrollToBottom()

  try {
    const token = localStorage.getItem('lsjy_token')
    if (!token) {
      messages.value.push({role: 'assistant', content: '请先登录后使用', model: '系统'})
      return
    }

    const allMessages = messages.value.map(m => ({role: m.role, content: m.content}))
    
      const apiPath = `/api/v1/ai/tools/${selectedToolId.value}/chat`
      const res = await fetch(`https://api.lsjyapp.cn${apiPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        messages: allMessages,
        model: selectedModel.value || undefined,
        content: text
      })
    })

    const data = await res.json()

    if (data.code === 402) {
      showCoinLow.value = true
      messages.value.push({role: 'assistant', content: '圣力不足，请充值后继续使用。', model: '系统'})
      return
    }

    if (data.code === 0) {
      const reply = data.data?.content || '抱歉，暂时无法回复'
      const modelName = data.data?.model || 'AI'
      messages.value.push({role: 'assistant', content: reply, model: modelName})
      
      // 实时更新圣力余额
      if (data.data?.balance !== undefined) {
        userCoins.value = data.data.balance
      } else {
        await fetchBalance()
      }
    } else {
      messages.value.push({role: 'assistant', content: '出了点问题，请稍后再试', model: '系统'})
    }
  } catch(e) {
    messages.value.push({role: 'assistant', content: '网络连接失败，请检查网络', model: '系统'})
  } finally {
    loading.value = false
    stopThinking()
    await nextTick()
    scrollToBottom()
  }
}

function scrollToBottom() {
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight
  }
}

function particleStyle(n: number) {
  const size = Math.random() * 3 + 1
  return {
    width: size + 'px', height: size + 'px',
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    animationDuration: (Math.random() * 10 + 5) + 's',
    animationDelay: Math.random() * 5 + 's',
    opacity: Math.random() * 0.5 + 0.1,
  }
}

// 点击外部关闭菜单
function handleClickOutside(e: Event) {
  const target = e.target as HTMLElement
  if (!target.closest('.combo-selector')) {
    showComboMenu.value = false
  }
}

onMounted(() => {
  fetchBalance()
  document.addEventListener('click', handleClickOutside)
})

watch(() => messages.value.length, () => {
  nextTick(() => scrollToBottom())
})
</script>

<style scoped>
* { box-sizing: border-box; }

.bg-particles { position:fixed; inset:0; pointer-events:none; z-index:0; }
.particle {
  position:absolute; border-radius:50%;
  background: radial-gradient(circle, #00f0ff, transparent);
  animation: float linear infinite;
}
@keyframes float {
  0% { transform: translateY(100vh) scale(0); opacity:0; }
  10% { opacity:1; }
  90% { opacity:1; }
  100% { transform: translateY(-100vh) scale(1); opacity:0; }
}

/* === Header - 紧凑 === */
.chat-header {
  display:flex; align-items:center; gap:10px;
  padding:10px 16px;
  background: rgba(10,10,30,0.8);
  border-bottom:1px solid rgba(0,240,255,0.1);
  z-index:10; position:relative;
  backdrop-filter: blur(10px);
}
.avatar-container { position:relative; width:40px; height:40px; flex-shrink:0; }
.avatar-ring { position:absolute; border-radius:50%; border:1.5px solid transparent; }
.ring-outer { inset:0; border-top-color:#00f0ff; border-right-color:#00f0ff40; animation: spin 3s linear infinite; }
.ring-inner { inset:4px; border-bottom-color:#b700ff; border-left-color:#b700ff40; animation: spin 2s linear infinite reverse; }
@keyframes spin { to { transform:rotate(360deg); } }
.avatar-core {
  position:absolute; inset:6px; border-radius:50%;
  background: radial-gradient(circle, #1a1a3a, #0a0a1a);
  display:flex; align-items:center; justify-content:center;
}
.avatar-svg { width:100%; height:100%; }
.status-pulse {
  position:absolute; bottom:0; right:0; width:8px; height:8px;
  background:#00ff88; border-radius:50%;
  box-shadow: 0 0 6px #00ff88;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.8); } }

.header-info { flex:1; min-width:0; }
.header-title {
  font-size:14px; font-weight:bold;
  background: linear-gradient(90deg, #00f0ff, #b700ff);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
}
.header-sub { display:flex; align-items:center; gap:4px; font-size:10px; color:#a0a0cc; }
.status-dot { width:5px; height:5px; border-radius:50%; background:#00ff88; box-shadow:0 0 4px #00ff88; }

/* === 融合选择器 - 紧凑 === */
.combo-selector {
  position:relative; display:flex; align-items:center; gap:5px;
  padding:5px 10px; border-radius:14px; cursor:pointer;
  background: rgba(0,240,255,0.06);
  border:1px solid rgba(0,240,255,0.15);
  transition: all 0.3s; z-index:100;
  max-width: 200px;
}
.combo-selector:hover { border-color: rgba(0,240,255,0.35); background: rgba(0,240,255,0.1); }
.cs-icon { font-size:14px; }
.cs-label { font-size:11px; color:#e0e0ff; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:70px; }
.cs-model { font-size:10px; color:#00f0ff; white-space:nowrap; }
.cs-arrow { font-size:9px; color:#00f0ff; transition: transform 0.2s; }
.cs-arrow.open { transform: rotate(180deg); }

.cs-dropdown {
  position:absolute; top:calc(100% + 6px); right:0;
  width:240px; max-height:380px; overflow-y:auto; padding:8px;
  background: rgba(10,10,30,0.97);
  border:1px solid rgba(0,240,255,0.2);
  border-radius:14px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(0,240,255,0.08);
  animation: dropIn 0.2s ease-out;
  scrollbar-width:thin; scrollbar-color:#00f0ff30 transparent;
}
@keyframes dropIn {
  from { opacity:0; transform:translateY(-6px); }
  to { opacity:1; transform:translateY(0); }
}

.cs-section-title {
  font-size:10px; color:#00f0ff; padding:4px 8px; font-weight:bold;
  letter-spacing: 1px;
}
.cs-divider {
  height:1px; background: rgba(0,240,255,0.1); margin:4px 0;
}
.cs-option {
  display:flex; align-items:center; gap:8px;
  padding:7px 8px; border-radius:10px; cursor:pointer;
  transition: all 0.15s;
}
.cs-option:hover { background: rgba(0,240,255,0.08); }
.cs-option.active { background: rgba(0,240,255,0.12); }
.cso-icon { font-size:14px; width:20px; text-align:center; flex-shrink:0; }
.cso-name { font-size:11px; color:#e0e0ff; flex:1; }
.cso-cost { font-size:9px; color:#ffd700; }
.cso-check { color:#00f0ff; font-size:12px; font-weight:bold; }

/* === 圣力余额 - 紧凑 === */
.sl-balance-mini {
  display:flex; align-items:center; gap:3px;
  padding:4px 8px; border-radius:12px;
  background: rgba(255,200,0,0.06);
  border:1px solid rgba(255,200,0,0.15);
}
.sl-icon { font-size:11px; }
.sl-val { font-size:11px; color:#ffd700; font-weight:bold; min-width:24px; text-align:center; }

/* === Messages === */
.chat-messages {
  flex:1; overflow-y:auto; padding:16px;
  z-index:1; position:relative;
  scrollbar-width:thin; scrollbar-color:#00f0ff30 transparent;
}

/* === Welcome === */
.welcome-screen {
  display:flex; flex-direction:column; align-items:center;
  justify-content:center; height:100%; text-align:center;
}
.welcome-avatar { position:relative; width:100px; height:100px; margin-bottom:16px; }
.wa-ring { position:absolute; border-radius:50%; border:1.5px solid transparent; }
.wa-r1 { inset:0; border-top-color:#00f0ff; border-right-color:#00f0ff30; animation: spin 4s linear infinite; }
.wa-r2 { inset:8px; border-bottom-color:#b700ff; border-left-color:#b700ff30; animation: spin 3s linear infinite reverse; }
.wa-r3 { inset:16px; border-top-color:#ff006a30; animation: spin 5s linear infinite; }
.wa-core {
  position:absolute; inset:20px; border-radius:50%;
  background: radial-gradient(circle, #1a1a3a, #0a0a1a);
  display:flex; align-items:center; justify-content:center;
  box-shadow: 0 0 30px rgba(0,240,255,0.2);
}
.welcome-title { font-size:18px; font-weight:bold; color:#e0e0ff; margin-bottom:6px; }
.gradient-text {
  background: linear-gradient(90deg, #00f0ff, #b700ff);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
}
.welcome-desc { font-size:12px; color:#a0a0cc; margin-bottom:20px; }

.suggestions-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; max-width:380px; width:100%; padding:0 16px; }
.suggestion-card {
  display:flex; align-items:center; gap:6px;
  padding:10px 12px; border-radius:10px;
  background: rgba(0,240,255,0.04);
  border:1px solid rgba(0,240,255,0.1);
  cursor:pointer; transition:all 0.3s;
  text-align:left;
}
.suggestion-card:hover {
  background: rgba(0,240,255,0.1);
  border-color: rgba(0,240,255,0.3);
  transform: translateY(-2px);
}
.sug-icon { font-size:16px; }
.sug-text { font-size:11px; color:#c0c0e0; }

/* === Message Bubbles === */
.msg-row { display:flex; margin-bottom:14px; align-items:flex-start; }
.msg-user { justify-content:flex-end; }
.msg-ai { justify-content:flex-start; }
.msg-avatar-sm {
  width:28px; height:28px; border-radius:50%;
  background: rgba(0,240,255,0.1);
  border:1px solid rgba(0,240,255,0.2);
  display:flex; align-items:center; justify-content:center;
  margin-right:8px; flex-shrink:0;
}
.msg-bubble { max-width:80%; padding:10px 14px; position:relative; }
.bubble-user {
  background: linear-gradient(135deg, #00f0ff, #b700ff);
  color:#fff; border-radius:18px 18px 4px 18px;
  box-shadow: 0 2px 12px rgba(0,240,255,0.3);
}
.bubble-ai {
  background: rgba(0,240,255,0.06);
  border:1px solid rgba(0,240,255,0.12);
  color:#e0e0ff; border-radius:18px 18px 18px 4px;
  backdrop-filter: blur(5px);
}
.msg-text { font-size:13px; line-height:1.6; word-break:break-word; }
.msg-model-tag {
  margin-top:4px; font-size:9px; color:#606088;
  padding:2px 6px; border-radius:6px;
  background: rgba(0,240,255,0.06);
  display:inline-block;
}

/* === Thinking === */
.thinking-container { display:flex; flex-direction:column; align-items:center; gap:8px; padding:12px 20px; }
.thinking-visual { position:relative; width:40px; height:40px; }
.tv-ring { position:absolute; border-radius:50%; border:2px solid transparent; }
.tv-r1 { inset:0; border-top-color:#00f0ff; border-right-color:#00f0ff40; animation: spin 1s linear infinite; }
.tv-r2 { inset:6px; border-bottom-color:#b700ff; border-left-color:#b700ff40; animation: spin 0.7s linear infinite reverse; }
.tv-core-dot {
  position:absolute; inset:12px; border-radius:50%;
  background: radial-gradient(circle, #00f0ff, #b700ff);
  animation: corePulse 0.8s ease-in-out infinite;
}
@keyframes corePulse { 0%,100% { transform:scale(0.8); opacity:0.6; } 50% { transform:scale(1.2); opacity:1; } }
.thinking-bars { display:flex; gap:3px; align-items:flex-end; height:16px; }
.tbar { width:3px; border-radius:2px; background: linear-gradient(to top, #00f0ff, #b700ff); animation: barBounce 0.8s ease-in-out infinite; }
@keyframes barBounce { 0%,100% { height:4px; opacity:0.4; } 50% { height:16px; opacity:1; } }
.thinking-text { font-size:11px; color:#00f0ff; text-shadow: 0 0 10px rgba(0,240,255,0.5); }
.thinking-dots { display:flex; gap:4px; }
.tdot { width:4px; height:4px; border-radius:50%; background:#00f0ff; animation: dotPulse 0.8s ease-in-out infinite; }
@keyframes dotPulse { 0%,100% { opacity:0.2; transform:scale(0.6); } 50% { opacity:1; transform:scale(1.2); } }

/* === Input === */
.chat-input-area {
  display:flex; align-items:center; gap:8px;
  padding:10px 14px; margin:0 14px 10px;
  background: rgba(0,240,255,0.04);
  border:1px solid rgba(0,240,255,0.12);
  border-radius:14px; z-index:1; position:relative;
  backdrop-filter: blur(10px);
}
.input-glow {
  position:absolute; inset:-1px; border-radius:14px;
  background: linear-gradient(90deg, #00f0ff20, transparent, #b700ff20);
  opacity:0; transition:opacity 0.3s; pointer-events:none;
}
.chat-input-area:focus-within .input-glow { opacity:1; }
.chat-input { flex:1; background:transparent; border:none; outline:none; font-size:13px; color:#e0e0ff; padding:4px 6px; }
.chat-input::placeholder { color:#606088; }
.chat-input:disabled { opacity:0.5; }
.send-btn {
  width:36px; height:36px; border-radius:10px; border:none;
  background: linear-gradient(135deg, #00f0ff, #b700ff);
  color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center;
  transition:all 0.3s; box-shadow: 0 2px 10px rgba(0,240,255,0.3);
}
.send-btn:hover:not(:disabled) { transform:scale(1.05); box-shadow: 0 4px 20px rgba(0,240,255,0.5); }
.send-btn:disabled { opacity:0.3; cursor:not-allowed; }

/* === 圣力不足弹窗 === */
.coin-low-modal {
  position:fixed; inset:0; background:rgba(0,0,0,0.7);
  display:flex; align-items:center; justify-content:center;
  z-index:9999;
}
.coin-low-card {
  width:300px; padding:28px 20px; text-align:center;
  background: linear-gradient(135deg, #1a1a3a, #0a0a2a);
  border:1px solid rgba(255,200,0,0.3);
  border-radius:18px;
  box-shadow: 0 0 40px rgba(255,200,0,0.1);
}
.clc-icon { font-size:40px; margin-bottom:12px; }
.clc-title { font-size:18px; color:#ffd700; font-weight:bold; margin-bottom:6px; }
.clc-desc { font-size:12px; color:#a0a0cc; margin-bottom:20px; }
.clc-btns { display:flex; gap:10px; justify-content:center; }
.clc-cancel {
  padding:7px 16px; border-radius:8px; border:1px solid rgba(255,255,255,0.2);
  background:transparent; color:#a0a0cc; cursor:pointer; font-size:12px;
}
.clc-confirm {
  padding:7px 16px; border-radius:8px; border:none;
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color:#1a1a3a; font-weight:bold; cursor:pointer; font-size:12px;
}
</style>

