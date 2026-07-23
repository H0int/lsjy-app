<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- 欢迎卡片 -->
    <div class="cyber-welcome-banner rounded-2xl p-6 mb-6 relative overflow-hidden">
      <div class="welcome-bg-grid"></div>
      <div class="welcome-glow"></div>
      <div class="relative z-10 flex items-center gap-4">
        <div
          v-if="userAvatar"
          class="w-14 h-14 rounded-xl object-cover flex-shrink-0"
          style="border: 2px solid rgba(0,240,255,0.4); box-shadow: 0 0 15px rgba(0,240,255,0.3); overflow:hidden;"
        >
          <img :src="userAvatar" alt="头像" class="w-full h-full object-cover" />
        </div>
        <div
          v-else
          class="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
          style="background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-magenta)); border: 2px solid rgba(0,240,255,0.4); box-shadow: 0 0 15px rgba(0,240,255,0.3); color: #000;"
        >
          {{ (authStore.nickname || 'U')[0] }}
        </div>
        <div>
          <h1 class="text-2xl font-bold mb-1" style="font-family: 'JetBrains Mono', monospace; color: var(--cyber-text);">
            你好，{{ authStore.nickname }}
          </h1>
          <p class="text-sm" style="color: rgba(0,240,255,0.7); font-family: 'JetBrains Mono', monospace;">
            欢迎回到罗圣纪元SaaS平台 · SYSTEM ONLINE
          </p>
        </div>
      </div>
    </div>

    <!-- 官方群 -->
    <div
      class="official-group-card rounded-xl p-5 mb-6 flex items-center justify-between gap-4 cursor-pointer transition-all hover:-translate-y-0.5"
      @click="showGroupQr = true"
    >
      <div class="flex items-center gap-4 min-w-0">
        <div class="group-icon w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          💬
        </div>
        <div class="min-w-0">
          <div class="font-bold text-base" style="color: var(--cyber-text);">加入官方技术交流群</div>
          <div class="text-xs mt-1" style="color: var(--cyber-text-dim);">
            罗圣纪元AIGC-Agent技术核心班 · 扫码加入获取最新动态
          </div>
        </div>
      </div>
      <div class="group-action px-4 py-2 rounded-lg text-sm font-medium text-white flex-shrink-0">
        立即加入 →
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showGroupQr"
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);"
        @click.self="showGroupQr = false"
      >
        <div class="rounded-2xl p-6 max-w-sm w-full mx-4 text-center" style="background: #1a1a2e; border: 1px solid rgba(99,102,241,0.3);">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-lg" style="color: var(--cyber-text);">💬 加入官方群</h3>
            <button
              class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              style="background: rgba(255,255,255,0.05);"
              @click="showGroupQr = false"
            >
              ✕
            </button>
          </div>
          <div class="font-medium text-sm mb-4" style="color: var(--cyber-cyan);">
            罗圣纪元AIGC-Agent技术核心班✓
          </div>
          <div class="flex gap-4 justify-center mb-4">
            <div class="text-center">
              <div class="rounded-xl p-3 inline-block" style="background: white;">
                <img src="/qrcode-tech-group.png" alt="技术交流群二维码" class="w-40 h-40 object-contain" />
              </div>
              <p class="text-xs mt-2 font-medium" style="color: var(--cyber-cyan);">技术交流群</p>
            </div>
            <div class="text-center">
              <div class="rounded-xl p-3 inline-block" style="background: white;">
                <img src="/qrcode-personal.png" alt="个人微信二维码" class="w-40 h-40 object-contain" />
              </div>
              <p class="text-xs mt-2 font-medium" style="color: var(--cyber-cyan);">添加创始人微信</p>
            </div>
          </div>
          <p class="text-xs" style="color: var(--cyber-text-dim);">请使用微信扫一扫加入群聊或添加好友</p>
        </div>
      </div>
    </Teleport>

    <!-- 算力调度&虚拟数字员工中心 入口卡片 -->
    <div
      class="rounded-xl p-5 mb-6 cursor-pointer transition-all hover:-translate-y-1"
      style="background: linear-gradient(135deg, rgba(0,240,255,0.08), rgba(183,0,255,0.08)); border: 1px solid rgba(0,240,255,0.25);"
      @click="router.push('/computing')"
    >
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style="background: linear-gradient(135deg, #00f0ff, #b700ff); box-shadow: 0 0 20px rgba(0,240,255,0.3);">
          ⚡
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-lg" style="color: var(--cyber-text);">算力调度 & 行业虚拟数字员工中心</div>
          <div class="text-xs mt-1" style="color: var(--cyber-text-dim);">自研算力分配算法，一键生成行业AI虚拟员工，降低AI使用成本、缩减企业人力开支，创业、省赛备赛均可使用。</div>
        </div>
        <div class="px-5 py-2.5 rounded-lg text-sm font-bold text-white flex-shrink-0" style="background: linear-gradient(135deg, #00f0ff, #b700ff); box-shadow: 0 0 15px rgba(0,240,255,0.3);">
          立即进入 →
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="cyber-stat-card rounded-xl p-5 cursor-pointer"
        @click="router.push(card.path)"
      >
        <div class="text-3xl mb-3">{{ card.icon }}</div>
        <div class="text-3xl font-bold mb-2" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          {{ card.value }}
        </div>
        <div class="text-sm" style="color: var(--cyber-text-dim);">{{ card.label }}</div>
        <div class="text-xs mt-2" style="color: var(--cyber-cyan);">点击跳转 →</div>
      </div>
    </div>

    <!-- 功能模块区域 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <!-- 快捷入口 -->
      <div class="cyber-module-card rounded-xl p-5">
        <h3 class="cyber-module-title">
          <span class="title-bar"></span>快捷入口
        </h3>
        <div class="grid grid-cols-3 gap-3 mt-4">
          <div
            v-for="item in quickLinks"
            :key="item.name"
            class="cyber-quick-item rounded-lg p-3 text-center cursor-pointer"
            @click="router.push(item.path)"
          >
            <div class="text-2xl mb-1">{{ item.icon }}</div>
            <div class="text-xs" style="color: var(--cyber-text);">{{ item.name }}</div>
          </div>
        </div>
      </div>

      <!-- 最近使用 -->
      <div class="cyber-module-card rounded-xl p-5">
        <div class="flex items-center justify-between">
          <h3 class="cyber-module-title m-0">
            <span class="title-bar"></span>最近使用
          </h3>
          <button
            v-if="recentTools.length > 3"
            class="cyber-text-link text-xs flex items-center gap-1"
            @click="recentExpanded = !recentExpanded"
          >
            {{ recentExpanded ? '收起 ↑' : `展开全部 (${recentTools.length}) ↓` }}
          </button>
        </div>
        <div class="mt-4 space-y-3">
          <div
            v-for="(item, idx) in (recentExpanded ? recentTools : recentTools.slice(0, 3))"
            :key="idx"
            class="cyber-recent-item flex items-center gap-3 p-3 rounded-lg cursor-pointer"
            @click="router.push(`/tools/${item.id}`)"
          >
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style="background: rgba(0,240,255,0.08);">
              {{ item.icon }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate" style="color: var(--cyber-text);">{{ item.name }}</div>
              <div class="text-xs" style="color: var(--cyber-text-dim);">{{ item.time }}</div>
            </div>
            <div class="text-xs" style="color: var(--cyber-cyan);">使用</div>
          </div>
          <div v-if="recentTools.length === 0" class="text-center py-6 text-sm" style="color: var(--cyber-text-dim);">
            暂无使用记录，快去体验AI工具吧
          </div>
        </div>
      </div>
    </div>

    <!-- 推荐工具 -->
    <div class="cyber-module-card rounded-xl p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="cyber-module-title m-0">
          <span class="title-bar"></span>热门推荐
        </h3>
        <button class="cyber-text-link text-sm" @click="router.push('/tools')">查看全部 →</button>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          v-for="tool in hotTools"
          :key="tool.id"
          class="cyber-tool-card rounded-lg p-4 cursor-pointer"
          @click="router.push(`/tools/${tool.id}`)"
        >
          <div class="text-2xl mb-2">{{ tool.icon }}</div>
          <div class="text-sm font-medium mb-1 truncate" style="color: var(--cyber-text);">{{ tool.name }}</div>
          <div class="text-xs" style="color: var(--cyber-text-dim);">{{ tool.desc }}</div>
          <div class="flex items-center gap-2 mt-2">
            <span class="cyber-tag text-xs px-2 py-0.5 rounded">{{ tool.category }}</span>
            <span class="text-xs" style="color: var(--cyber-amber);">⚡{{ tool.cost }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统公告 -->
    <div id="notices" class="cyber-module-card rounded-xl p-5">
      <h3 class="cyber-module-title">
        <span class="title-bar"></span>系统公告
      </h3>
      <div class="mt-4 space-y-3">
        <div
          v-for="(notice, idx) in notices"
          :key="idx"
          class="cyber-notice-item flex items-start gap-3 p-3 rounded-lg cursor-pointer"
          @click="openNotice(notice)"
        >
          <div class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" :class="notice.isNew ? 'bg-red-500' : 'bg-gray-500'"></div>
          <div class="flex-1 min-w-0">
            <div class="text-sm" style="color: var(--cyber-text);">{{ notice.title }}</div>
            <div class="text-xs mt-1" style="color: var(--cyber-text-dim);">{{ notice.date }}</div>
          </div>
          <span v-if="notice.isNew" class="cyber-new-badge text-xs px-2 py-0.5 rounded">NEW</span>
          <span class="text-xs" style="color: var(--cyber-cyan);">查看 →</span>
        </div>
      </div>
    </div>

    <!-- 公告详情弹窗 -->
    <Teleport to="body">
      <div
        v-if="showNoticeModal && activeNotice"
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);"
        @click.self="showNoticeModal = false"
      >
        <div class="cyber-notice-modal rounded-2xl p-6 max-w-md w-full mx-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="cyber-modal-title">📢 公告详情</h3>
            <button
              class="cyber-modal-close-btn"
              @click="showNoticeModal = false"
            >✕</button>
          </div>
          <div class="cyber-notice-detail">
            <div class="notice-detail-title">{{ activeNotice.title }}</div>
            <div class="notice-detail-date">{{ activeNotice.date }}</div>
            <div class="notice-detail-content">{{ activeNotice.content }}</div>
          </div>
          <button class="cyber-notice-close" @click="showNoticeModal = false">知道了</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toolApi } from '@/api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const showGroupQr = ref(false)
// ★ 头像：优先读取 lsjy_user_avatar（用户自定义），其次 authStore.user.avatar
const userAvatar = ref(localStorage.getItem('lsjy_user_avatar') || authStore.user?.avatar || '')
const recentExpanded = ref(false)

// 统计卡片 - 带跳转路径
const statCards = ref([
  { icon: '⚡', label: '圣力余额', value: '0', path: '/profile/wallet' },
  { icon: '🛠️', label: '已用工具', value: '0', path: '/profile/works?tab=tools' },
  { icon: '📄', label: '生成作品', value: '0', path: '/profile/works?tab=works' },
  { icon: '🎯', label: '会员等级', value: '普通', path: '/profile' },
])

// 快捷入口
const quickLinks = [
  { name: 'AI智能体', icon: '🤖', path: '/chat' },
  { name: 'AI工具', icon: '🛠️', path: '/tools' },
  { name: '个人中心', icon: '👤', path: '/profile' },
  { name: '圣力中心', icon: '💰', path: '/profile/wallet' },
  { name: '创作记录', icon: '📝', path: '/profile/creation-history' },
  { name: '帮助中心', icon: '❓', path: '/profile/help' },
  { name: '收藏工具', icon: '⭐', path: '/profile/favorites' },
  { name: '会员中心', icon: '👑', path: '/profile/wallet' },
  { name: '系统公告', icon: '📢', path: '/dashboard#notices' },
]

// 最近使用（从localStorage读取）
const recentTools = ref<any[]>([])

// 热门推荐
const hotTools = ref<any[]>([])

// 公告
const notices = ref([
  {
    title: '🎉 罗圣纪元SaaS平台正式上线，205个AI工具全面开放',
    date: '2026-07-07',
    isNew: true,
    content: '罗圣纪元SaaS平台已于2026年7月7日正式上线！平台集成205个AI工具，涵盖内容创作、AI智能、宠物服务、校园助手、电商运营、教育培训六大领域。所有用户均可免费体验部分工具，开通会员更可解锁全部功能。如有问题请联系客服：188-9000-0368。'
  },
  {
    title: '🔧 AI绘画功能升级，支持8种风格、4种尺寸选择',
    date: '2026-07-06',
    isNew: true,
    content: 'AI绘画功能已完成全面升级！现在支持以下8种风格：写实风格、动漫风格、油画风格、水彩风格、赛博朋克、像素风格、3D渲染、素描风格。同时支持4种尺寸选择：512×512、768×1024、1024×1024、1024×1536。更新你的创意，让AI为你绘制独一无二的图片！'
  },
  {
    title: '📹 视频生成功能上线，支持电影感、动漫等6种风格',
    date: '2026-07-05',
    isNew: false,
    content: '全新视频生成功能正式上线！只需输入文案描述，AI即可为你生成创意视频。支持6种风格：电影感、动漫风格、写实风格、赛博朋克、梦幻唯美、复古怀旧。同时支持多种画面比例和镜头运动效果。每个视频消耗圣力不等，会员用户享受8折优惠。'
  },
  {
    title: '💬 加入官方技术交流群，获取最新动态和技术支持',
    date: '2026-07-04',
    isNew: false,
    content: '欢迎加入罗圣纪元官方技术交流群！在这里你可以：获取平台最新功能更新、与开发者直接交流反馈、学习AI工具使用技巧、结识志同道合的创作者。扫码或搜索群号即可加入，群内不定期发放圣力福利！'
  },
])

const activeNotice = ref<any>(null)
const showNoticeModal = ref(false)

function openNotice(notice: any) {
  activeNotice.value = notice
  showNoticeModal.value = true
}

function getMemberLabel() {
  const roles = authStore.user?.roles || []
  const hasBossRole = Array.isArray(roles) && roles.some((role: any) => {
    const value = typeof role === 'string' ? role : role?.code || role?.name
    return value === 'boss' || value === '罗总专属'
  })

  if (authStore.isAdmin || hasBossRole) return '罗总专属'
  if (authStore.user?.userType === 'founder') return '至尊创始人'
  if (authStore.user?.vipLevel && authStore.user.vipLevel > 0) return `VIP${authStore.user.vipLevel}`
  if (authStore.user?.userType === 'enterprise') return '企业版'
  if (authStore.user?.userType === 'merchant') return '商户版'
  return '普通'
}

async function loadRealTimeData() {
  // 圣力余额
  statCards.value[0].value = authStore.user?.username === 'KF02V9'
    ? '∞ 无限'
    : (authStore.coinBalance ? authStore.coinBalance.toLocaleString() : '0')

  // 会员等级
  statCards.value[3].value = getMemberLabel()

  // 最近使用 - 从多个 localStorage 源合并
  const usedTools: any[] = JSON.parse(localStorage.getItem('lsjy_used_tools') || '[]')
  const toolUsage: any[] = JSON.parse(localStorage.getItem('lsjy_tool_usage') || '[]')
  const generatedWorks: any[] = JSON.parse(localStorage.getItem('lsjy_generated_works') || '[]')

  // 合并去重：以 toolId 为主键
  const toolMap = new Map<number, any>()
  for (const u of usedTools) {
    toolMap.set(Number(u.id), { id: Number(u.id), name: u.name, icon: u.icon || '🤖', time: u.time, category: u.category || 'AI工具' })
  }
  // 从 tool_usage 补充不在 used_tools 中的记录
  for (const u of toolUsage) {
    const tid = Number(u.toolId)
    if (tid && !toolMap.has(tid)) {
      toolMap.set(tid, { id: tid, name: u.toolName || '未知工具', icon: '🤖', time: u.createdAt ? new Date(u.createdAt).toLocaleString('zh-CN') : '', category: 'AI工具' })
    }
  }
  for (const w of generatedWorks) {
    const wid = Number(w.toolId || w.id)
    if (wid && !toolMap.has(wid)) {
      toolMap.set(wid, { id: wid, name: w.toolName || '未知工具', icon: '🤖', time: w.createdAt ? new Date(w.createdAt).toLocaleString('zh-CN') : '', category: 'AI工具' })
    }
  }

  // 按时间倒序排列
  const allUsed = Array.from(toolMap.values()).sort((a, b) => {
    const ta = a.time ? new Date(a.time.replace(/\//g, '-')).getTime() : 0
    const tb = b.time ? new Date(b.time.replace(/\//g, '-')).getTime() : 0
    return tb - ta
  })
  recentTools.value = allUsed.slice(0, 8)

  // 统计已用工具数
  statCards.value[1].value = String(toolMap.size)
  statCards.value[2].value = String(generatedWorks.length)

  // 尝试从API获取更多使用记录来补充 localStorage（本地模式跳过）
  if (!authStore.isLocalAuth) {
    try {
      const res = await toolApi.getHistory({ page: 1, pageSize: 20 }) as any
      const historyItems = res?.data?.data?.items || res?.data?.items || []
      if (historyItems.length > 0) {
        // 从API历史记录中提取工具使用信息
        for (const h of historyItems) {
          const hid = Number(h.toolId)
          if (hid && !toolMap.has(hid)) {
            const toolName = h.toolName || '未知工具'
            const toolIcon = h.toolIcon || '🤖'
            const timeStr = h.createdAt ? new Date(h.createdAt).toLocaleString('zh-CN') : ''
            toolMap.set(hid, { id: hid, name: toolName, icon: toolIcon, time: timeStr, category: 'AI工具' })
          }
        }
        // 重新排序
        const merged = Array.from(toolMap.values()).sort((a, b) => {
          const ta = a.time ? new Date(a.time.replace(/\//g, '-')).getTime() : 0
          const tb = b.time ? new Date(b.time.replace(/\//g, '-')).getTime() : 0
          return tb - ta
        })
        recentTools.value = merged.slice(0, 8)
        statCards.value[1].value = String(toolMap.size)
      }
    } catch (e) {
      // API 调用失败，使用 localStorage 数据即可
    }
  }

  // 加载热门工具
  try {
    const res = await toolApi.getTools({ page: 1, pageSize: 8 }) as any
    const items = res?.data?.data?.items || res?.data?.items || []
    hotTools.value = items.slice(0, 4).map((t: any) => ({
      id: t.id,
      name: t.name,
      icon: t.icon || '🤖',
      desc: t.description?.substring(0, 20) + '...' || 'AI智能工具',
      category: t.category || 'AI工具',
      cost: t.coinCost || 1,
    }))
  } catch (e) {
    hotTools.value = [
      { id: 1, name: 'AI文生图', icon: '🎨', desc: '根据描述生成精美图片', category: 'AI绘画', cost: 2 },
      { id: 2, name: 'AI文案助手', icon: '✍️', desc: '一键生成营销文案', category: '内容创作', cost: 1 },
      { id: 3, name: 'AI视频生成', icon: '🎬', desc: '文本生成创意视频', category: '视频创作', cost: 5 },
      { id: 4, name: 'AI智能对话', icon: '💬', desc: '多轮对话智能问答', category: 'AI智能', cost: 1 },
    ]
  }
}

onMounted(() => {
  loadRealTimeData()
})
</script>

<style scoped>
.cyber-welcome-banner {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(124, 58, 237, 0.1));
  border: 1px solid rgba(0, 240, 255, 0.15);
  position: relative;
}
.cyber-welcome-banner::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), var(--cyber-purple), transparent);
}
.welcome-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
  background-size: 30px 30px;
}
.welcome-glow {
  position: absolute;
  top: -50%; right: -20%;
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%);
  border-radius: 50%;
}

.official-group-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.group-icon, .group-action {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.35);
}

.cyber-stat-card {
  background: rgba(15, 15, 25, 0.85);
  border: 1px solid rgba(0, 240, 255, 0.1);
  backdrop-filter: blur(8px);
  transition: all 0.3s;
}
.cyber-stat-card:hover {
  border-color: rgba(0, 240, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.1);
  transform: translateY(-2px);
}

/* 功能模块卡片 */
.cyber-module-card {
  background: rgba(15, 15, 25, 0.7);
  border: 1px solid rgba(0, 240, 255, 0.08);
  backdrop-filter: blur(8px);
}
.cyber-module-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--cyber-text);
  margin: 0 0 4px 0;
  font-family: 'JetBrains Mono', monospace;
}
.cyber-module-title .title-bar {
  width: 3px;
  height: 16px;
  background: linear-gradient(180deg, var(--cyber-cyan), var(--cyber-purple));
  border-radius: 2px;
}

/* 快捷入口 */
.cyber-quick-item {
  background: rgba(0, 240, 255, 0.03);
  border: 1px solid rgba(0, 240, 255, 0.08);
  transition: all 0.3s;
}
.cyber-quick-item:hover {
  background: rgba(0, 240, 255, 0.06);
  border-color: rgba(0, 240, 255, 0.2);
  transform: translateY(-2px);
}

/* 最近使用 */
.cyber-recent-item {
  background: rgba(0, 240, 255, 0.02);
  border: 1px solid transparent;
  transition: all 0.25s;
}
.cyber-recent-item:hover {
  background: rgba(0, 240, 255, 0.05);
  border-color: rgba(0, 240, 255, 0.1);
}

/* 推荐工具 */
.cyber-tool-card {
  background: rgba(0, 240, 255, 0.02);
  border: 1px solid rgba(0, 240, 255, 0.08);
  transition: all 0.3s;
}
.cyber-tool-card:hover {
  border-color: rgba(0, 240, 255, 0.2);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.05);
  transform: translateY(-2px);
}
.cyber-tag {
  background: rgba(0, 240, 255, 0.1);
  color: var(--cyber-cyan);
  border: 1px solid rgba(0, 240, 255, 0.15);
}
.cyber-text-link {
  color: var(--cyber-cyan);
  cursor: pointer;
  transition: all 0.2s;
}
.cyber-text-link:hover {
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
}

/* 公告 */
.cyber-notice-item {
  background: rgba(0, 240, 255, 0.02);
  border-left: 2px solid rgba(0, 240, 255, 0.15);
}
.cyber-new-badge {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* 公告弹窗 */
.cyber-notice-modal {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0, 240, 255, 0.2);
  position: relative;
}
.cyber-notice-modal::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), transparent);
}
.cyber-modal-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--cyber-text);
  font-family: 'JetBrains Mono', monospace;
}
.cyber-modal-close-btn {
  width: 28px; height: 28px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: var(--cyber-text-dim);
  background: rgba(255,255,255,0.05);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.cyber-modal-close-btn:hover {
  color: var(--cyber-text);
  background: rgba(255,255,255,0.1);
}
.cyber-notice-detail { margin: 16px 0; }
.notice-detail-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--cyber-text);
  line-height: 1.5;
  margin-bottom: 8px;
}
.notice-detail-date {
  font-size: 12px;
  color: var(--cyber-text-dim);
  margin-bottom: 12px;
}
.notice-detail-content {
  font-size: 14px;
  color: var(--cyber-text-dim);
  line-height: 1.8;
  padding: 16px;
  background: rgba(0, 240, 255, 0.03);
  border: 1px solid rgba(0, 240, 255, 0.08);
  border-radius: 12px;
}
.cyber-notice-close {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple));
  border: none;
  border-radius: 10px;
  color: #000;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.cyber-notice-close:hover { opacity: 0.9; }
</style>