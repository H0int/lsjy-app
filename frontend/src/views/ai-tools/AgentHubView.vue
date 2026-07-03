<template>
  <div class="max-w-6xl mx-auto px-4 py-4">
    <!-- 头部 -->
    <div class="cyber-card p-4 mb-4">
      <div class="flex items-center gap-3 mb-2">
        <div class="text-2xl">🤖</div>
        <div>
          <h1 class="text-lg font-bold" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">
            AI员工中心
          </h1>
          <p class="text-xs" style="color: var(--cyber-text-dim);">
            10位AI员工随时待命，每次调用消耗对应圣力
          </p>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <button type="button" @click="$router.push('/profile/wallet')" 
            class="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 cursor-pointer"
            style="background: rgba(255,184,0,0.08); color: var(--cyber-amber); border: 1px solid rgba(255,184,0,0.2);">
            <span>⚡</span>
            <span class="font-bold" style="font-family: 'JetBrains Mono', monospace;">{{ coinBalance }}</span>
            <span class="text-xs">圣力</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 分类Tab -->
    <div class="flex gap-2 mb-4 overflow-x-auto pb-1" style="scrollbar-width: none;">
      <button v-for="cat in categories" :key="cat" type="button" @click="activeCategory = cat"
        class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer"
        :style="activeCategory === cat
          ? 'background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #000; box-shadow: 0 0 12px rgba(0,240,255,0.3);'
          : 'background: rgba(0,240,255,0.03); color: var(--cyber-text-dim); border: 1px solid var(--cyber-border);'">
        {{ cat }}
      </button>
    </div>

    <!-- Agent卡片网格 -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <div v-for="agent in filteredAgents" :key="agent.id"
        @click="enterAgent(agent)"
        class="cyber-card p-3 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
        :style="'border-color: ' + (agent.id === hotAgent ? 'var(--cyber-cyan)' : 'var(--cyber-border)')">
        <!-- Icon + 名称 -->
        <div class="flex items-center gap-2 mb-2">
          <div class="text-2xl" :style="'filter: drop-shadow(0 0 8px rgba(0,240,255,0.4));'">{{ agent.icon }}</div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-bold truncate" style="color: var(--cyber-text);">{{ agent.name }}</div>
            <div class="text-[10px]" style="color: var(--cyber-text-dim);">{{ agent.category }}</div>
          </div>
        </div>
        <!-- 描述 -->
        <p class="text-xs mb-2 line-clamp-2" style="color: var(--cyber-text-dim); min-height: 2.4em;">
          {{ agent.description }}
        </p>
        <!-- 底部：价格 + 状态 -->
        <div class="flex items-center justify-between">
          <span class="text-[10px] px-1.5 py-0.5 rounded" 
            :style="agent.status === 'active' 
              ? 'background: rgba(0,255,136,0.1); color: var(--cyber-green);' 
              : 'background: rgba(255,68,68,0.1); color: #ff4444;'">
            {{ agent.status === 'active' ? '在线' : '离线' }}
          </span>
          <span class="text-[10px] flex items-center gap-0.5" style="color: var(--cyber-amber);">
            ⚡{{ agent.coinCost }}圣力/次
          </span>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="cyber-card p-3 mt-4 text-center">
      <p class="text-xs" style="color: var(--cyber-text-dim);">
        💡 新用户注册赠送 <strong style="color: var(--cyber-amber);">100圣力</strong>，
        对话消耗 <strong style="color: var(--cyber-cyan);">1~2圣力/次</strong>，
        图片生成 <strong style="color: var(--cyber-cyan);">10圣力/次</strong>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const coinBalance = ref(100)
const activeCategory = ref('全部')
const hotAgent = 101

const categories = ['全部', '综合', '运营', '分析', '商业', '技术', '法务', '开发', '测试']

// 本地Agent定义（与后端同步，避免额外API调用延迟）
const agents = ref([
  { id: 101, name: '总指挥罗圣', icon: '👑', category: '综合', description: '项目总指挥，全能型AI助手，可调度所有AI员工', coinCost: 1, status: 'active' },
  { id: 102, name: '运营文案师', icon: '✍️', category: '运营', description: '全平台文案输出、用户路径设计、交互体验优化', coinCost: 1, status: 'active' },
  { id: 103, name: '调研分析师', icon: '🔍', category: '分析', description: '竞品对标、问题排查、数据分析、需求管理', coinCost: 1, status: 'active' },
  { id: 104, name: '投资理财顾问', icon: '💰', category: '商业', description: '充值定价、分销体系、盈利模型、财务核算', coinCost: 2, status: 'active' },
  { id: 105, name: '智能能力官', icon: '🧠', category: '技术', description: '知识库优化、提示词工程、语义召回、模型调优', coinCost: 2, status: 'active' },
  { id: 106, name: '合规风控官', icon: '⚖️', category: '法务', description: '法律文本审核、合规把关、AI内容免责声明', coinCost: 2, status: 'active' },
  { id: 107, name: '首席架构师', icon: '🏗️', category: '技术', description: 'API网关、系统架构、算力调度、性能优化', coinCost: 2, status: 'active' },
  { id: 108, name: '后端开发官', icon: '⚙️', category: '开发', description: '服务端开发、数据库优化、接口联调、支付对接', coinCost: 2, status: 'active' },
  { id: 109, name: '前端开发官', icon: '🎨', category: '开发', description: '页面开发修复、移动端适配、性能优化、UI规范', coinCost: 2, status: 'active' },
  { id: 110, name: '质量测试官', icon: '🧪', category: '测试', description: '全量功能测试、兼容性测试、压力测试、bug管理', coinCost: 1, status: 'active' },
])

const filteredAgents = computed(() => {
  if (activeCategory.value === '全部') return agents.value
  return agents.value.filter(a => a.category === activeCategory.value)
})

function enterAgent(agent: any) {
  if (agent.status !== 'active') return
  router.push({ path: '/agent', query: { agentId: agent.id, name: agent.name, icon: agent.icon, cost: agent.coinCost } })
}

onMounted(async () => {
  try {
    const token = localStorage.getItem('lsjy_token') || ''
    const res = await fetch('https://api.lsjyapp.cn/api/v1/payment/coin/balance', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      if (data.code === 0 && data.data?.balance !== undefined) {
        coinBalance.value = data.data.balance
      }
    }
  } catch (e) {
    // 使用默认值
  }
})
</script>
