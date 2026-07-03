<template>
  <div class="max-w-4xl mx-auto px-4 py-3 flex flex-col" style="height: calc(100vh - 80px);">
    <!-- 头部 -->
    <div class="cyber-card p-2.5 mb-2 flex items-center gap-2 flex-shrink-0">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style="box-shadow: 0 0 12px rgba(0,240,255,0.4);">
        <img src="/logo.png" alt="罗圣纪元" style="width:100%;height:100%;border-radius:10px;object-fit:cover;" />
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-sm font-bold" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">罗圣AI中心</h1>
        <div class="flex items-center gap-1 mt-0.5">
          <span class="w-1.5 h-1.5 rounded-full animate-pulse"
            :style="aiOnline ? 'background: var(--cyber-green);' : 'background: #ff6b00;'"></span>
          <span class="text-[10px]" style="color: var(--cyber-text-dim);">{{ statusText }}</span>
        </div>
      </div>
      <div class="flex gap-1 flex-shrink-0">
        <button @click="$router.push('/profile/wallet')" class="px-2 py-1 rounded-lg text-[11px] flex items-center gap-0.5"
          style="background: rgba(255,184,0,0.08); color: var(--cyber-amber); border: 1px solid rgba(255,184,0,0.2);" title="点击充值">
          <span>⚡</span><span class="font-bold" style="font-family: 'JetBrains Mono', monospace;">{{ coinBalance >= 999999 ? '∞' : coinBalance }}</span>
        </button>
        <button @click="clearChat" class="px-2 py-1 rounded-lg text-[11px]"
          style="background: rgba(255,68,68,0.08); color: #ff4444; border: 1px solid rgba(255,68,68,0.2);">🗑️</button>
      </div>
    </div>

    <!-- AI员工选择器 -->
    <div class="flex-shrink-0 mb-2 overflow-x-auto" style="-webkit-overflow-scrolling: touch;">
      <div class="flex gap-1.5 pb-1" style="min-width: max-content;">
        <button v-for="agent in agents" :key="agent.id" @click="selectAgent(agent)"
          class="flex-shrink-0 px-2.5 py-1.5 rounded-xl text-left transition-all"
          :style="selectedAgent?.id === agent.id
            ? 'background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #000; box-shadow: 0 0 12px rgba(0,240,255,0.3);'
            : 'background: rgba(0,240,255,0.03); color: var(--cyber-text-dim); border: 1px solid var(--cyber-border);'">
          <div class="flex items-center gap-1">
            <span class="text-sm">{{ agent.icon }}</span>
            <span class="text-[11px] font-bold whitespace-nowrap">{{ agent.name }}</span>
          </div>
          <div class="text-[9px] mt-0.5 opacity-70">⚡{{ agent.coinCost }}/次</div>
        </button>
      </div>
    </div>

    <!-- 当前选中Agent信息 -->
    <div v-if="selectedAgent" class="cyber-card p-2 mb-2 flex-shrink-0 flex items-center gap-2">
      <span class="text-xl">{{ selectedAgent.icon }}</span>
      <div class="flex-1 min-w-0">
        <div class="text-xs font-bold" style="color: var(--cyber-text);">{{ selectedAgent.name }}</div>
        <div class="text-[10px]" style="color: var(--cyber-text-dim);">{{ selectedAgent.description }}</div>
      </div>
      <div class="text-[10px] px-1.5 py-0.5 rounded" style="background: rgba(255,184,0,0.1); color: var(--cyber-amber);">
        ⚡{{ selectedAgent.coinCost }}/次
      </div>
    </div>

    <!-- ========== 文本对话（非图片Agent） ========== -->
    <template v-if="selectedAgent && selectedAgent.toolType !== 'image'">
      <!-- 欢迎页 -->
      <div v-if="msgs.length === 0" class="flex-1 overflow-y-auto mb-2">
        <div class="text-center py-3">
          <div class="text-3xl mb-1">{{ selectedAgent.icon }}</div>
          <h2 class="text-sm font-bold" style="color: var(--cyber-cyan);">{{ selectedAgent.name }}</h2>
          <p class="text-[10px]" style="color: var(--cyber-text-dim);">{{ selectedAgent.description }}</p>
        </div>
        <div class="grid grid-cols-2 gap-1.5">
          <button v-for="c in currentQuickCmds" :key="c.t" @click="sendQuick(c.t)"
            class="cyber-card p-2 text-left transition-all hover:-translate-y-0.5">
            <div class="text-sm mb-0.5">{{ c.icon }}</div>
            <div class="text-[11px] font-medium" style="color: var(--cyber-text);">{{ c.l }}</div>
          </button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else ref="chatBox" class="flex-1 overflow-y-auto mb-2 space-y-2 pr-1" style="scroll-behavior: smooth;">
        <div v-for="(msg, i) in msgs" :key="i" class="flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
          <div class="max-w-[85%]">
            <div class="rounded-xl px-3 py-2 text-xs"
              :style="msg.role === 'user'
                ? 'background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #000; border-radius: 12px 12px 4px 12px;'
                : 'background: rgba(0,240,255,0.05); color: var(--cyber-text); border: 1px solid var(--cyber-border); border-radius: 12px 12px 12px 4px;'"
              v-html="fmt(msg.content)">
            </div>
            <!-- AI回复操作按钮栏 -->
            <div v-if="msg.role === 'assistant' && !msg.content.startsWith('⚠️')" class="flex items-center gap-2 mt-1.5 ml-1 flex-wrap">
              <button @click="copyMsg(msg.content)" class="msg-action-btn" title="复制">
                <span>📋</span><span>复制</span>
              </button>
              <button @click="shareMsg(msg.content)" class="msg-action-btn" title="分享">
                <span>🔗</span><span>分享</span>
              </button>
              <button @click="quoteMsg(msg.content)" class="msg-action-btn" title="引用">
                <span>💬</span><span>引用</span>
              </button>
              <button @click="regenerateMsg(i)" :disabled="loading" class="msg-action-btn" title="重新生成">
                <span>🔄</span><span>重新生成</span>
              </button>
              <button @click="likeMsg(i)" class="msg-action-btn" :class="{ 'active-good': msg.liked === 'good', 'active-bad': msg.liked === 'bad' }" title="点赞">
                <span>{{ msg.liked === 'good' ? '👍' : '👍' }}</span>
              </button>
              <button @click="dislikeMsg(i)" class="msg-action-btn" :class="{ 'active-bad': msg.liked === 'bad' }" title="点踩">
                <span>👎</span>
              </button>
              <button @click="exportMsg(msg.content)" class="msg-action-btn" title="导出">
                <span>📥</span><span>导出</span>
              </button>
            </div>
          </div>
        </div>
        <div v-if="loading" class="flex justify-start">
          <div class="rounded-xl px-3 py-2 text-xs"
            style="background: rgba(0,240,255,0.05); border: 1px solid var(--cyber-border);">
            <div class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full animate-bounce" style="background: var(--cyber-cyan);"></span>
              <span class="w-1.5 h-1.5 rounded-full animate-bounce" style="background: var(--cyber-cyan); animation-delay: 0.2s;"></span>
              <span class="w-1.5 h-1.5 rounded-full animate-bounce" style="background: var(--cyber-cyan); animation-delay: 0.4s;"></span>
              <span class="text-[10px] ml-1" style="color: var(--cyber-text-dim);">{{ selectedAgent.name }}思考中...</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Toast提示 -->
      <div v-if="toastMsg" class="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-xs font-bold animate-fade-in"
        style="background: rgba(0,240,255,0.15); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.3); backdrop-filter: blur(8px);">
        {{ toastMsg }}
      </div>

      <!-- 输入框 -->
      <div class="cyber-card p-2 flex-shrink-0">
        <!-- 文件/图片预览 -->
        <div v-if="pendingFile" class="mb-1.5 flex items-center gap-2 p-1.5 rounded-lg" style="background: rgba(0,240,255,0.05); border: 1px solid var(--cyber-border);">
          <img v-if="pendingFile.isImage" :src="pendingFile.url" class="w-10 h-10 rounded object-cover" style="border: 1px solid var(--cyber-border);" />
          <div v-else class="w-10 h-10 rounded flex items-center justify-center text-lg" style="background: rgba(0,240,255,0.08); border: 1px solid var(--cyber-border);">📄</div>
          <div class="flex-1 min-w-0">
            <div class="text-[10px] truncate" style="color: var(--cyber-text);">{{ pendingFile.name }}</div>
            <div class="text-[9px]" style="color: var(--cyber-text-dim);">{{ pendingFile.isImage ? '图片' : '文件' }} · {{ pendingFile.sizeLabel }}{{ pendingFile.extractedText ? ' · 已提取内容' : '' }}</div>
          </div>
          <button @click="pendingFile = null" class="text-[10px] px-1.5 py-0.5 rounded" style="color: #ff4444; background: rgba(255,68,68,0.1);">✕</button>
        </div>
        <div class="flex gap-1.5">
          <!-- 上传按钮：图片+文件 -->
          <button @click="fileUploadRef?.click()" :disabled="loading"
            class="px-2.5 py-2 rounded-lg text-sm flex-shrink-0"
            style="background: rgba(0,240,255,0.05); border: 1px solid var(--cyber-border); color: var(--cyber-cyan); font-size:16px; line-height:1;"
            title="上传图片或文件">
            ＋
          </button>
          <input ref="fileUploadRef" type="file" accept="image/*,.txt,.md,.json,.csv,.js,.ts,.py,.html,.css,.xml,.log,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" class="hidden" @change="handleFileUpload" />
          <input v-model="input" @keyup.enter="sendMsg"
            :placeholder="loading ? '思考中...' : '向' + selectedAgent?.name + '提问（' + selectedAgent?.coinCost + '/次）'"
            :disabled="loading"
            class="flex-1 px-2.5 py-2 rounded-lg text-xs outline-none"
            style="background: rgba(0,240,255,0.03); border: 1px solid var(--cyber-border); color: var(--cyber-text);"
            @focus="($event.target as HTMLInputElement).style.borderColor='var(--cyber-cyan)'"
            @blur="($event.target as HTMLInputElement).style.borderColor='var(--cyber-border)'" />
          <button @click="sendMsg" :disabled="(!input.trim() && !pendingFile) || loading"
            class="px-4 py-2 rounded-lg text-xs font-bold"
            style="background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #000;"
            :style="((!input.trim() && !pendingFile) || loading) ? 'opacity: 0.5;' : 'box-shadow: 0 0 12px rgba(0,240,255,0.4);'">
            发送
          </button>
        </div>
      </div>
    </template>

    <!-- ========== 图片生成（AI绘画师） ========== -->
    <template v-if="selectedAgent && selectedAgent.toolType === 'image'">
      <div class="flex-1 overflow-y-auto mb-2 space-y-2">
        <div v-if="images.length === 0" class="text-center py-6">
          <div class="text-3xl mb-1">🎨</div>
          <p class="text-xs" style="color: var(--cyber-text-dim);">描述你想生成的图片，AI为你创作</p>
          <p class="text-[10px] mt-1" style="color: var(--cyber-amber);">⚡ 每次生成消耗{{ selectedAgent.coinCost }}圣力</p>
        </div>
        <div v-for="(img, i) in images" :key="i" class="cyber-card p-2.5">
          <p class="text-[10px] mb-1.5" style="color: var(--cyber-text-dim);">🎨 {{ img.prompt }}</p>
          <img v-if="img.url" :src="img.url" class="w-full rounded-lg" style="border: 1px solid var(--cyber-border);" />
          <p v-else-if="img.loading" class="text-xs text-center py-6" style="color: var(--cyber-cyan);">⏳ 生成中...</p>
          <p v-else-if="img.error" class="text-[10px] text-center py-3" style="color: #ff4444;">{{ img.error }}</p>
        </div>
      </div>
      <div class="cyber-card p-2 flex-shrink-0">
        <div class="flex gap-1.5 mb-1.5">
          <select v-model="imgSize" class="px-2 py-1 rounded text-[10px] outline-none"
            style="background: rgba(0,240,255,0.03); border: 1px solid var(--cyber-border); color: var(--cyber-text);">
            <option value="512x512">512×512</option>
            <option value="1024x1024">1024×1024</option>
            <option value="1024x1792">1024×1792 竖版</option>
            <option value="1792x1024">1792×1024 横版</option>
          </select>
          <select v-model="imgStyle" class="px-2 py-1 rounded text-[10px] outline-none"
            style="background: rgba(0,240,255,0.03); border: 1px solid var(--cyber-border); color: var(--cyber-text);">
            <option value="">自动风格</option>
            <option value="写实">写实</option>
            <option value="动漫">动漫</option>
            <option value="油画">油画</option>
            <option value="赛博朋克">赛博朋克</option>
          </select>
        </div>
        <div class="flex gap-1.5">
          <input v-model="imgPrompt" @keyup.enter="genImage" placeholder="描述你想生成的图片..."
            class="flex-1 px-2.5 py-2 rounded-lg text-xs outline-none"
            style="background: rgba(0,240,255,0.03); border: 1px solid var(--cyber-border); color: var(--cyber-text);" />
          <button @click="genImage" :disabled="!imgPrompt.trim() || genLoading"
            class="px-4 py-2 rounded-lg text-xs font-bold"
            style="background: linear-gradient(135deg, #ff6b9d, var(--cyber-purple)); color: #000;">
            {{ genLoading ? '生成中...' : '生成' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

// ========== API配置 ==========
const API_BASE = 'https://api.lsjyapp.cn/api/v1'
// 动态获取token（登录后token会变化，不能静态获取）
const authToken = computed(() => localStorage.getItem('lsjy_token') || '')

// ========== AI员工列表 ==========
interface Agent {
  id: number
  name: string
  icon: string
  toolType: 'text' | 'image'
  description: string
  coinCost: number
  systemPrompt?: string
}

// 10 AI员工 - 罗圣纪元团队
const agents: Agent[] = [
  { id: 101, name: '罗圣AI-智能体', icon: '🤖', toolType: 'text', description: '您的全能AI助手，有问必答', coinCost: 1, systemPrompt: '你是"罗圣AI-智能体"，罗圣纪元SaaS平台的官方AI客服助手。公司：祁阳市罗圣纪元互联网科技有限责任公司（"祁阳"不是"祈阳"）。创始人/CEO：罗凯中。六大业务：AI智能服务、自媒体运营、电商服务、在线教育、宠物医疗、伯雅校园。你的职责是热情、耐心地为用户解答问题，提供产品使用指导、业务咨询和技术支持。态度友好亲切，回复清晰详细，让用户感受到专业和温暖。遇到无法回答的问题，礼貌引导用户联系人工客服。严禁对用户使用命令式、居高临下或冷漠的语气。' },
  { id: 102, name: '运营文案师', icon: '✍️', toolType: 'text', description: '文案输出、用户路径设计', coinCost: 1, systemPrompt: '你是"罗圣纪元-运营文案师"，负责产品体验与运营文案。公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）。你负责输出页面文案、运营位文案、充值引导文案、工具引导文案，设计AI工具交互逻辑，输出运营活动策划。文案简洁专业，符合商务调性，可直接落地。' },
  { id: 103, name: '调研分析师', icon: '🔍', toolType: 'text', description: '竞品对标、数据分析', coinCost: 1, systemPrompt: '你是"罗圣纪元-调研分析师"，负责全平台问题盘点与竞品对标。公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）。你负责走查页面功能接口输出bug清单，对标行业主流AI平台输出可落地方案，分析用户反馈与需求。客观中立，只摆事实与数据。' },
  { id: 104, name: '投资理财顾问', icon: '💰', toolType: 'text', description: '充值定价、分销体系', coinCost: 2, systemPrompt: '你是"罗圣纪元-投资理财顾问"，负责商业体系设计与落地。公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）。你负责设计充值套餐与定价策略、规划分销商体系与返佣规则、设计会员体系与增值服务、核算平台收支。所有定价必须有成本测算依据。' },
  { id: 105, name: '智能能力官', icon: '🧠', toolType: 'text', description: '知识库优化、提示词工程', coinCost: 2, systemPrompt: '你是"罗圣纪元-智能能力负责人"，负责知识库与AI能力优化。公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）。你负责重构知识库切片规则、优化向量召回与重排序、为Agent定制提示词、建立知识库质检流程、优化多轮对话记忆。以问答准确率为核心标准。' },
  { id: 106, name: '合规风控官', icon: '⚖️', toolType: 'text', description: '法律审核、合规把关', coinCost: 2, systemPrompt: '你是"罗圣纪元-合规风控负责人"，对全平台内容合规性全权把关。公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）。你负责审核用户协议、隐私政策、充值协议，审核运营活动合规性，输出AI内容免责声明。合规零容忍，同时给出可落地修改建议。' },
  { id: 107, name: '首席架构师', icon: '🏗️', toolType: 'text', description: 'API网关、系统架构', coinCost: 2, systemPrompt: '你是"罗圣纪元-首席技术架构师"，大模型API中台第一责任人。公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）。你负责搭建统一API网关、对接多算力渠道、制定接口标准与错误码规范、优化算力调用链路、保障调用成功率≥99%。技术方案必须可落地可验证。' },
  { id: 108, name: '后端开发官', icon: '⚙️', toolType: 'text', description: '服务端开发、数据库优化', coinCost: 2, systemPrompt: '你是"罗圣纪元-后端开发总负责人"，主导服务端逻辑与数据库开发。公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）。你负责修复登录鉴权bug、开发充值订单计费接口、优化数据库索引、打通算力调用与Token扣减链路。所有接口做参数校验与异常兜底。' },
  { id: 109, name: '前端开发官', icon: '🎨', toolType: 'text', description: '页面开发、移动端适配', coinCost: 2, systemPrompt: '你是"罗圣纪元-前端开发总负责人"，对所有页面体验与视觉质量负责。公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）。你负责修复布局错乱与适配问题、落地登录跳转与工具交互开发、性能优化资源压缩CDN。页面质量零容忍，优先保障移动端体验。' },
  { id: 110, name: '质量测试官', icon: '🧪', toolType: 'text', description: '功能测试、压力测试', coinCost: 1, systemPrompt: '你是"罗圣纪元-质量测试负责人"，所有功能上线必经你验收。公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）。你负责全量功能测试、兼容性测试、并发压力测试，输出标准化测试报告与bug清单。质量底线不妥协，bug描述清晰可复现。' },
]

// ========== 状态 ==========
const selectedAgent = ref<Agent | null>(agents[0])
const msgsByAgent = ref<Record<number, {role:'user'|'assistant'; content:string; coinCost?:number; liked?:'good'|'bad'|null}[]>>({})
const input = ref('')
const loading = ref(false)
const chatBox = ref<HTMLElement|null>(null)
const aiOnline = ref(true)
const authStore = useAuthStore()
const { coinBalance } = storeToRefs(authStore)

// 图片上传
const pendingFile = ref<{url: string; name: string; isImage: boolean; sizeLabel: string; extractedText?: string} | null>(null)
const fileUploadRef = ref<HTMLInputElement | null>(null)

// Toast提示
const toastMsg = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(msg: string) {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 2000)
}

// 图片生成
const imgPrompt = ref('')
const imgSize = ref('1024x1024')
const imgStyle = ref('')
const genLoading = ref(false)
const images = ref<{prompt:string; url?:string; loading?:boolean; error?:string}[]>([])

// 当前Agent的消息
const msgs = computed(() => {
  if (!selectedAgent.value) return []
  if (!msgsByAgent.value[selectedAgent.value.id]) {
    msgsByAgent.value[selectedAgent.value.id] = []
  }
  return msgsByAgent.value[selectedAgent.value.id]
})

// 快捷指令（根据Agent不同）
const quickCmdsMap: Record<number, {icon:string; l:string; t:string}[]> = {
  101: [
    { icon: '🏢', l: '了解罗圣', t: '罗圣纪元是做什么的？有哪些业务？' },
    { icon: '📈', l: '战略规划', t: '分析一下我们平台的核心竞争力' },
    { icon: '🎯', l: '资源协调', t: '目前各个岗位的工作进度怎么样？' },
    { icon: '💡', l: '商业建议', t: '给平台下一步发展提些建议' },
  ],
  102: [
    { icon: '📝', l: '营销文案', t: '写一篇AI培训课程的朋友圈推广文案' },
    { icon: '🎬', l: '视频脚本', t: '写一个30秒短视频广告脚本' },
    { icon: '📱', l: '用户路径', t: '优化新用户从注册到付费的路径' },
    { icon: '💰', l: '充值引导', t: '设计一套有吸引力的充值引导文案' },
  ],
  103: [
    { icon: '🔍', l: '竞品分析', t: '分析一下目前主流的AI SaaS平台有什么优势' },
    { icon: '📊', l: '数据复盘', t: '帮我设计一套平台上线后的数据复盘框架' },
    { icon: '🐛', l: '问题排查', t: '帮我列一个全平台功能走查的checklist' },
    { icon: '📋', l: '需求整理', t: '怎么科学地管理需求池和排优先级？' },
  ],
  104: [
    { icon: '💎', l: '定价策略', t: '分析下我们10个充值套餐的定价是否合理' },
    { icon: '📊', l: '成本核算', t: '核算一下每次AI对话1圣力的利润空间' },
    { icon: '🤝', l: '分销设计', t: '设计一套分销商返佣规则' },
    { icon: '📈', l: '盈利模型', t: '分析平台月营收达到10万的路径' },
  ],
  105: [
    { icon: '🧠', l: '知识库优化', t: '怎么优化知识库的语义切片和向量召回？' },
    { icon: '📝', l: '提示词设计', t: '帮我设计一个客服Agent的系统提示词' },
    { icon: '🔄', l: '多轮对话', t: '怎么优化多轮上下文记忆能力？' },
    { icon: '📏', l: '准确率测试', t: '设计一套问答准确率的测试方案' },
  ],
  106: [
    { icon: '📜', l: '用户协议', t: '起草一份AI平台的用户服务协议要点' },
    { icon: '🔒', l: '隐私政策', t: '我们的隐私政策需要包含哪些必要条款？' },
    { icon: '⚠️', l: '免责声明', t: 'AI生成内容需要什么样的免责声明？' },
    { icon: '💳', l: '退款规则', t: '设计一套合理的充值退款规则' },
  ],
  107: [
    { icon: '🏗️', l: 'API网关', t: '设计一个大模型API网关的架构方案' },
    { icon: '⚡', l: '性能优化', t: '怎么降低AI对话的首字延迟？' },
    { icon: '🔄', l: '故障切换', t: '设计多算力渠道的负载均衡和故障切换方案' },
    { icon: '📐', l: '接口标准', t: '制定全平台的API接口标准和错误码规范' },
  ],
  108: [
    { icon: '🔧', l: '接口开发', t: '设计充值-扣费-结算的完整后端接口' },
    { icon: '🗄️', l: '数据库优化', t: '怎么优化用户表和订单表的查询性能？' },
    { icon: '💳', l: '支付对接', t: '设计微信支付和支付宝支付的对接方案' },
    { icon: '🔐', l: '鉴权修复', t: '登录态失效和循环跳转怎么彻底修复？' },
  ],
  109: [
    { icon: '📱', l: '移动适配', t: '怎么解决移动端布局错位的问题？' },
    { icon: '⚡', l: '性能优化', t: '前端首屏加载怎么优化到2秒以内？' },
    { icon: '🎨', l: 'UI规范', t: '制定一套赛博朋克风格的UI规范' },
    { icon: '🐛', l: '白屏修复', t: '前端白屏问题怎么排查和解决？' },
  ],
  110: [
    { icon: '📋', l: '测试计划', t: '帮我制定一个全平台功能测试计划' },
    { icon: '🐛', l: 'Bug清单', t: '设计一个标准化的Bug清单模板' },
    { icon: '⚡', l: '压力测试', t: '怎么做AI接口的并发压力测试？' },
    { icon: '✅', l: '验收标准', t: '功能上线的验收标准应该包含哪些？' },
  ],
}

const currentQuickCmds = computed(() => {
  if (!selectedAgent.value) return []
  return quickCmdsMap[selectedAgent.value.id] || quickCmdsMap[1] || []
})

const statusText = computed(() => {
  if (loading.value) return `${selectedAgent.value?.name || 'AI'}思考中...`
  if (genLoading.value) return '生成图片中...'
  return aiOnline.value ? `在线 · ${selectedAgent.value?.name || '罗圣AI'}待命` : '连接中...'
})

// ========== 方法 ==========
function selectAgent(agent: Agent) {
  selectedAgent.value = agent
  // 切换Agent时清空图片历史
  if (agent.toolType === 'image') {
    images.value = []
  }
}

function fmt(c: string): string {
  if (!c) return ''
  return c
    // Markdown图片 ![alt](url) → <img>
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:4px 0;cursor:pointer;" onclick="window.open(this.src,\'_blank\')" />')
    // Markdown链接 [text](url) → <a>
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:var(--cyber-cyan);text-decoration:underline;">$1</a>')
    // 加粗
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 代码块
    .replace(/```([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.3);padding:6px;border-radius:4px;overflow-x:auto;margin:3px 0;font-size:11px;">$1</pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code style="background:rgba(0,240,255,0.1);padding:1px 3px;border-radius:2px;">$1</code>')
    // 换行
    .replace(/\n/g, '<br>')
}

function scrollToBottom() {
  nextTick(() => { if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight })
}

function clearChat() {
  if (!selectedAgent.value) return
  msgsByAgent.value[selectedAgent.value.id] = []
  images.value = []
  pendingFile.value = null
}

function sendQuick(t: string) { input.value = t; sendMsg() }

// 文件/图片上传处理
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / 1024 / 1024).toFixed(1) + 'MB'
}

async function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const isImage = file.type.startsWith('image/')
  const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024
  const sizeLabel = formatFileSize(file.size)
  if (file.size > maxSize) {
    showToast(isImage ? '图片不能超过5MB' : '文件不能超过10MB')
    return
  }
  // 图片：base64预览
  if (isImage) {
    const reader = new FileReader()
    reader.onload = () => {
      pendingFile.value = { url: reader.result as string, name: file.name, isImage: true, sizeLabel }
    }
    reader.readAsDataURL(file)
  } else {
    // 文本类文件：提取内容
    const textExts = ['txt','md','json','csv','js','ts','py','html','css','xml','log']
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (textExts.includes(ext)) {
      const reader = new FileReader()
      reader.onload = () => {
        const text = reader.result as string
        pendingFile.value = { url: '', name: file.name, isImage: false, sizeLabel, extractedText: text.substring(0, 8000) }
      }
      reader.readAsText(file)
    } else {
      // PDF/Office等：仅显示文件信息，由AI识别文件名
      pendingFile.value = { url: '', name: file.name, isImage: false, sizeLabel }
    }
  }
  ;(e.target as HTMLInputElement).value = ''
}

// ========== 核心：AI对话 ==========
async function sendMsg() {
  const text = input.value.trim()
  const file = pendingFile.value
  if ((!text && !file) || loading.value || !selectedAgent.value) return

  const agent = selectedAgent.value
  // 组合消息内容：文件/图片 + 文字
  let userContent = ''
  if (file) {
    if (file.isImage) {
      userContent += `![图片](${file.url})\n`
    } else if (file.extractedText) {
      userContent += `📄 [文件: ${file.name}]\n\`\`\`\n${file.extractedText}\n\`\`\`\n\n`
    } else {
      userContent += `📄 [文件: ${file.name} (${file.sizeLabel})]\n`
    }
  }
  if (text) {
    userContent += text
  }
  msgs.value.push({ role: 'user', content: userContent })
  input.value = ''
  pendingFile.value = null
  loading.value = true
  scrollToBottom()

  try {
    const backendMessages = msgs.value.slice(-20).map(m => {
      // 发送给后端时，剥离base64图片数据（太大，AI API不支持），替换为文字说明
      let content = m.content
      if (m.role === 'user' && content.includes('data:image')) {
        content = content.replace(/!\[图片\]\(data:image\/[^;]+;base64,[^)]+\)/g, '[用户发送了一张图片]')
      }
      return { role: m.role, content }
    })

    // 如果有系统提示，加到消息开头
    if (agent.systemPrompt) {
      backendMessages.unshift({ role: 'user', content: '[System Instructions] ' + agent.systemPrompt } as any)
    }

    // 使用主后端 /agent/chat，避开线上 /ai/* 独立代理鉴权
    const modelName = agent.modelName || 'deepseek-v4-pro'
    const res = await fetch(`${API_BASE}/agent/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        messages: backendMessages,
        model: modelName,
        agentId: agent.id,
        systemPrompt: agent.systemPrompt
      }),
    })

    // 圣力不足
    if (res.status === 402) {
      const errData = await res.json()
      coinBalance.value = errData.data?.balance || 0
      msgs.value.push({
        role: 'assistant',
        content: `⚡ **圣力不足**\n\n当前余额：${coinBalance.value}\n本次需要：${errData.data?.cost || agent.coinCost}\n\n点击右上角「⚡」前往充值`,
      })
      loading.value = false
      scrollToBottom()
      return
    }

    if (!res.ok) throw new Error(`API ${res.status}`)

    const result = await res.json()
    if (result.code !== 0) throw new Error(result.message || '服务错误')

    if (result.data.balance !== undefined) {
      coinBalance.value = result.data.balance
    }

    msgs.value.push({
      role: 'assistant',
      content: result.data.content || result.data.reply || '⚠️ 未返回内容',
      coinCost: result.data.coinCost || agent.coinCost
    })
  } catch (e: any) {
    msgs.value.push({
      role: 'assistant',
      content: `⚠️ 连接失败：${e.message || '网络异常'}`,
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

// ========== 消息操作：复制/转发/重新生成 ==========
async function copyMsg(content: string) {
  try {
    await navigator.clipboard.writeText(content)
    showToast('✅ 已复制到剪贴板')
  } catch {
    const ta = document.createElement('textarea')
    ta.value = content
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    showToast('✅ 已复制到剪贴板')
  }
}

async function shareMsg(content: string) {
  const shareText = content.length > 500 ? content.substring(0, 500) + '...' : content
  if (navigator.share) {
    try {
      await navigator.share({ title: `罗圣AI - ${selectedAgent.value?.name || '智能体'}`, text: shareText })
      return
    } catch { /* 用户取消 */ }
  }
  // 降级：复制到剪贴板
  await copyMsg(content)
  showToast('✅ 已复制，可粘贴转发')
}

async function regenerateMsg(index: number) {
  if (loading.value || !selectedAgent.value) return
  const msg = msgs.value[index]
  if (msg?.role !== 'assistant') return

  // 找到上一条用户消息
  let userContent = ''
  for (let j = index - 1; j >= 0; j--) {
    if (msgs.value[j].role === 'user') {
      userContent = msgs.value[j].content
      break
    }
  }
  if (!userContent) return

  const agent = selectedAgent.value

  // 删除当前AI回复
  msgs.value.splice(index, 1)
  loading.value = true
  scrollToBottom()

  try {
    const backendMessages = msgs.value.slice(-20).map(m => {
      let content = m.content
      if (m.role === 'user' && content.includes('data:image')) {
        content = content.replace(/!\[图片\]\(data:image\/[^;]+;base64,[^)]+\)/g, '[用户发送了一张图片]')
      }
      return { role: m.role, content }
    })
    if (agent.systemPrompt) {
      backendMessages.unshift({ role: 'user', content: '[System Instructions] ' + agent.systemPrompt } as any)
    }

    // 使用主后端 /agent/chat，避开线上 /ai/* 独立代理鉴权
    const modelName = agent.modelName || 'deepseek-v4-pro'
    const res = await fetch(`${API_BASE}/agent/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        messages: backendMessages,
        model: modelName,
        agentId: agent.id,
        systemPrompt: agent.systemPrompt
      }),
    })

    if (!res.ok) throw new Error(`API ${res.status}`)
    const result = await res.json()
    if (result.code !== 0) throw new Error(result.message || '服务错误')

    if (result.data.balance !== undefined) {
      coinBalance.value = result.data.balance
    }

    msgs.value.push({
      role: 'assistant',
      content: result.data.content || result.data.reply || '⚠️ 未返回内容',
      coinCost: result.data.coinCost || agent.coinCost
    })
    showToast('🔄 已重新生成')
  } catch (e: any) {
    msgs.value.push({
      role: 'assistant',
      content: `⚠️ 重新生成失败：${e.message || '网络异常'}`,
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

// ========== 消息操作：引用/点赞/导出 ==========
function quoteMsg(content: string) {
  // 引用消息内容到输入框
  const quoteText = content.length > 100 ? content.substring(0, 100) + '...' : content
  input.value = `> ${quoteText}\n\n`
  // 聚焦输入框
  nextTick(() => {
    const inputEl = document.querySelector('input[placeholder*="提问"]') as HTMLInputElement
    if (inputEl) inputEl.focus()
  })
  showToast('💬 已引用到输入框')
}

function likeMsg(index: number) {
  const msg = msgs.value[index]
  if (!msg) return
  msg.liked = msg.liked === 'good' ? null : 'good'
  showToast(msg.liked === 'good' ? '👍 感谢反馈' : '')
}

function dislikeMsg(index: number) {
  const msg = msgs.value[index]
  if (!msg) return
  msg.liked = msg.liked === 'bad' ? null : 'bad'
  showToast(msg.liked === 'bad' ? '👎 感谢反馈，我们会改进' : '')
}

async function exportMsg(content: string) {
  try {
    // 创建文本文件并下载
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AI回复_${new Date().toISOString().slice(0,10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('📥 已导出为文本文件')
  } catch (e) {
    showToast('⚠️ 导出失败')
  }
}

// ========== 图片生成 ==========
async function genImage() {
  const prompt = imgPrompt.value.trim()
  if (!prompt || genLoading.value || !selectedAgent.value) return

  const fullPrompt = imgStyle.value ? `以${imgStyle.value}风格生成：${prompt}` : prompt
  images.value.unshift({ prompt, loading: true })
  genLoading.value = true

  try {
    const res = await fetch(`${API_BASE}/ai/tools/${selectedAgent.value.id}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken.value}`,
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        width: parseInt(imgSize.value.split('x')[0]) || 1024,
        height: parseInt(imgSize.value.split('x')[1]) || 1024,
        style: imgStyle.value || 'auto',
        count: 1,
      }),
    })

    if (res.status === 402) {
      const errData = await res.json()
      coinBalance.value = errData.data?.balance || 0
      images.value[0] = { prompt, error: `⚡ 圣力不足！余额${coinBalance.value}，需要${selectedAgent.value.coinCost}。点击充值` }
      genLoading.value = false
      return
    }

    if (!res.ok) throw new Error(`API ${res.status}`)
    const data = await res.json()

    if (data.code === 0 && data.data?.urls?.length > 0) {
      if (data.data.balance !== undefined) coinBalance.value = data.data.balance
      images.value[0] = { prompt, url: data.data.urls[0] }
    } else {
      throw new Error(data.message || '生成失败')
    }
  } catch (err: any) {
    images.value[0] = { prompt, error: `生成失败：${err?.message || '未知错误'}` }
  } finally {
    genLoading.value = false
  }
}

// ========== 生命周期 ==========
onMounted(async () => {
  // 从URL参数选择Agent（从AI员工中心跳转过来）
  const urlParams = new URLSearchParams(window.location.search)
  const agentIdParam = urlParams.get('agentId') || new URLSearchParams(window.location.hash.split('?')[1] || '').get('agentId')
  if (agentIdParam) {
    const found = agents.find(a => a.id === Number(agentIdParam))
    if (found) selectedAgent.value = found
  }

  // 检测API - 使用 /health 端点（更稳定）
  fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) })
    .then(r => { aiOnline.value = r.ok })
    .catch(() => {
      // 降级尝试 /ai/models
      fetch(`${API_BASE}/ai/models`, { signal: AbortSignal.timeout(5000) })
        .then(r => { aiOnline.value = r.ok })
        .catch(() => { aiOnline.value = false })
    })

  // 获取余额（从 auth store 获取，已登录则自动拉取）
  if (authStore.isLoggedIn) {
    await authStore.fetchBalance()
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
/* AI回复操作按钮 */
.msg-action-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 10px;
  color: var(--cyber-text-dim);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.6;
}
.msg-action-btn:hover {
  opacity: 1;
  background: rgba(0,240,255,0.08);
  color: var(--cyber-cyan);
}
.msg-action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.msg-action-btn.active-good {
  color: var(--cyber-green);
  opacity: 1;
}
.msg-action-btn.active-bad {
  color: #ff6b6b;
  opacity: 1;
}

/* Toast动画 */
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -8px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

/* 隐藏滚动条但保持可滚动 */
.overflow-x-auto::-webkit-scrollbar {
  height: 3px;
}
.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: rgba(0,240,255,0.2);
  border-radius: 2px;
}
</style>
