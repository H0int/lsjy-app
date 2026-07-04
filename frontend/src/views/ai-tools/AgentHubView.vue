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
            {{ totalCount }}位AI员工随时待命，每次调用消耗对应圣力
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

    <!-- 一级分类Tab -->
    <div class="flex gap-2 mb-3 overflow-x-auto pb-1" style="scrollbar-width: none;">
      <button v-for="cat in categories" :key="cat.key" type="button" @click="selectCategory(cat.key)"
        class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer"
        :style="activeCategory === cat.key
          ? 'background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #000; box-shadow: 0 0 12px rgba(0,240,255,0.3);'
          : 'background: rgba(0,240,255,0.03); color: var(--cyber-text-dim); border: 1px solid var(--cyber-border);'">
        {{ cat.icon }} {{ cat.label }}
      </button>
    </div>

    <!-- 二级子分类Tab -->
    <div v-if="subCategories.length > 0" class="flex gap-2 mb-4 overflow-x-auto pb-1" style="scrollbar-width: none;">
      <button type="button" @click="activeSubCategory = '全部'"
        class="px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer"
        :style="activeSubCategory === '全部'
          ? 'background: rgba(139,92,246,0.2); color: var(--cyber-purple, #8b5cf6); border: 1px solid rgba(139,92,246,0.4);'
          : 'background: rgba(139,92,246,0.03); color: var(--cyber-text-dim); border: 1px solid var(--cyber-border);'">
        全部
      </button>
      <button v-for="sub in subCategories" :key="sub" type="button" @click="activeSubCategory = sub"
        class="px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer"
        :style="activeSubCategory === sub
          ? 'background: rgba(139,92,246,0.2); color: var(--cyber-purple, #8b5cf6); border: 1px solid rgba(139,92,246,0.4);'
          : 'background: rgba(139,92,246,0.03); color: var(--cyber-text-dim); border: 1px solid var(--cyber-border);'">
        {{ sub }}
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <div v-for="i in 8" :key="i" class="cyber-card p-3 animate-pulse">
        <div class="h-4 rounded mb-2" style="background: var(--cyber-border);"></div>
        <div class="h-3 rounded w-2/3 mb-2" style="background: var(--cyber-border);"></div>
        <div class="h-8 rounded" style="background: var(--cyber-border);"></div>
      </div>
    </div>

    <!-- Agent卡片网格 -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <div v-for="agent in filteredAgents" :key="agent.id"
        @click="enterAgent(agent)"
        class="cyber-card p-3 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
        :style="'border-color: ' + (agent.id === hotAgent ? 'var(--cyber-cyan)' : 'var(--cyber-border)')">
        <!-- Icon + 名称 -->
        <div class="flex items-center gap-2 mb-2">
          <div class="text-2xl" :style="'filter: drop-shadow(0 0 8px rgba(0,240,255,0.4));'">{{ agent.icon }}</div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-bold truncate" style="color: var(--cyber-text);">{{ agent.name }}</div>
            <div class="flex items-center gap-1">
              <span class="text-[10px]" style="color: var(--cyber-cyan);">{{ agent.category }}</span>
              <span v-if="agent.subCategory" class="text-[10px] px-1 rounded" style="color: var(--cyber-purple, #8b5cf6); background: rgba(139,92,246,0.1);">{{ agent.subCategory }}</span>
            </div>
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

    <!-- 空状态 -->
    <div v-if="!loading && filteredAgents.length === 0" class="cyber-card p-8 text-center">
      <div class="text-4xl mb-2">🔍</div>
      <p class="text-sm" style="color: var(--cyber-text-dim);">该分类暂无AI员工</p>
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
const loading = ref(true)
const activeCategory = ref('全部')
const activeSubCategory = ref('全部')
const hotAgent = 101

// 一级分类（与后端6大业务板块对齐）
const categories = [
  { key: '全部', label: '全部', icon: '🌐' },
  { key: '综合', label: '综合AI', icon: '🤖' },
  { key: '自媒体', label: '自媒体', icon: '📱' },
  { key: '电商', label: '电商', icon: '🛒' },
  { key: '宠物', label: '宠物', icon: '🐾' },
  { key: '教育', label: '教育', icon: '📚' },
  { key: '伯雅校园', label: '伯雅校园', icon: '🎓' },
]

// 子分类映射（与后端数据对齐）
const subCategoryMap: Record<string, string[]> = {
  '综合': ['对话问答', '内容创作', '编程开发', '办公效率', '数据分析', '战略规划', '合规法务', '运维测试'],
  '自媒体': ['内容策划', '文案撰写', '视频脚本', '直播运营', '视觉设计', '账号运营', '数据复盘', '变现指导'],
  '电商': ['商品运营', '营销推广', '客服服务', '店铺管理', '数据分析', '供应链', '跨境电商'],
  '宠物': ['医疗咨询', '养宠指导', '品种科普', '行为训练', '营养饮食', '美容护理', '繁育指导', '用品推荐'],
  '教育': ['学科辅导', '考试备考', '语言学习', '素质教育', '职业教育', '教学方案', '学习方法'],
  '伯雅校园': ['学业辅导', '校园生活', '求职就业', '考试备考', '考研升学', '奖学金助', '心理成长'],
}

interface Agent {
  id: number
  name: string
  icon: string
  category: string
  subCategory?: string
  description: string
  systemPrompt?: string
  provider?: string
  coinCost: number
  status: string
}

const agents = ref<Agent[]>([])

const totalCount = computed(() => agents.value.length)

const subCategories = computed(() => {
  if (activeCategory.value === '全部') return []
  return subCategoryMap[activeCategory.value] || []
})

const filteredAgents = computed(() => {
  let list = agents.value
  if (activeCategory.value !== '全部') {
    list = list.filter(a => a.category === activeCategory.value)
  }
  if (activeSubCategory.value !== '全部' && subCategories.value.length > 0) {
    list = list.filter(a => a.subCategory === activeSubCategory.value)
  }
  return list
})

function selectCategory(cat: string) {
  activeCategory.value = cat
  activeSubCategory.value = '全部'
}

function enterAgent(agent: Agent) {
  if (agent.status !== 'active') return
  router.push({ path: '/agent', query: { agentId: agent.id, name: agent.name, icon: agent.icon, cost: agent.coinCost } })
}

onMounted(async () => {
  // 并行加载圣力余额和Agent列表
  const token = localStorage.getItem('lsjy_token') || ''

  // 加载圣力余额
  fetch('https://api.lsjyapp.cn/api/v1/payment/coin/balance', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => res.ok ? res.json() : null).then(data => {
    if (data?.code === 0 && data.data?.balance !== undefined) {
      coinBalance.value = data.data.balance
    }
  }).catch(() => {})

  // 加载Agent列表
  try {
    const apiBase = (window as any).LSJY_API_BASE || 'https://api.lsjyapp.cn'
    const res = await fetch(`${apiBase}/api/v1/agents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      if (data.code === 0 && Array.isArray(data.data)) {
        agents.value = data.data
      }
    }
  } catch (e) {
    // API失败时使用兜底数据
    agents.value = [
      { id: 101, name: '总指挥罗圣', icon: '👑', category: '综合', subCategory: '对话问答', description: '项目总指挥，全能型AI助手，可调度所有AI员工', coinCost: 1, status: 'active' },
      { id: 102, name: '运营文案师', icon: '✍️', category: '自媒体', subCategory: '文案撰写', description: '全平台文案输出、用户路径设计、交互体验优化', coinCost: 1, status: 'active' },
      { id: 103, name: '调研分析师', icon: '🔍', category: '综合', subCategory: '数据分析', description: '竞品对标、问题排查、数据分析、需求管理', coinCost: 1, status: 'active' },
      { id: 104, name: '投资理财顾问', icon: '💰', category: '综合', subCategory: '数据分析', description: '充值定价、分销体系、盈利模型、财务核算', coinCost: 2, status: 'active' },
      { id: 105, name: '智能能力官', icon: '🧠', category: '综合', subCategory: '对话问答', description: '知识库优化、提示词工程、语义召回、模型调优', coinCost: 2, status: 'active' },
      { id: 106, name: '合规风控官', icon: '⚖️', category: '综合', subCategory: '内容创作', description: '法律文本审核、合规把关、AI内容免责声明', coinCost: 2, status: 'active' },
      { id: 107, name: '首席架构师', icon: '🏗️', category: '综合', subCategory: '编程开发', description: 'API网关、系统架构、算力调度、性能优化', coinCost: 2, status: 'active' },
      { id: 108, name: '后端开发官', icon: '⚙️', category: '综合', subCategory: '编程开发', description: '服务端开发、数据库优化、接口联调、支付对接', coinCost: 2, status: 'active' },
      { id: 109, name: '前端开发官', icon: '🎨', category: '综合', subCategory: '编程开发', description: '页面开发修复、移动端适配、性能优化、UI规范', coinCost: 2, status: 'active' },
      { id: 110, name: '质量测试官', icon: '🧪', category: '综合', subCategory: '数据分析', description: '全量功能测试、兼容性测试、压力测试、bug管理', coinCost: 1, status: 'active' },
    ]
  } finally {
    loading.value = false
  }
})
</script>
