<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <div class="cyber-welcome-banner rounded-2xl p-6 mb-6 relative overflow-hidden">
      <div class="welcome-bg-grid"></div>
      <div class="welcome-glow"></div>
      <div class="relative z-10 flex items-center gap-4">
        <img
          src="/company-logo.jpg"
          alt="罗圣纪元"
          class="w-14 h-14 rounded-xl object-cover"
          style="border: 2px solid rgba(0,240,255,0.4); box-shadow: 0 0 15px rgba(0,240,255,0.3);"
        />
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
          <div class="rounded-xl p-4 mb-4 inline-block" style="background: white;">
            <img src="/official-group-qrcode.jpg" alt="官方群二维码" class="w-56 h-56 object-contain" />
          </div>
          <p class="text-xs" style="color: var(--cyber-text-dim);">请使用微信或企业微信扫码加入</p>
          <p class="text-xs mt-1" style="color: var(--cyber-amber);">二维码有效期至 2026年7月11日</p>
        </div>
      </div>
    </Teleport>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div v-for="card in statCards" :key="card.label" class="cyber-stat-card rounded-xl p-5">
        <div class="text-3xl mb-3">{{ card.icon }}</div>
        <div class="text-3xl font-bold mb-2" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          {{ card.value }}
        </div>
        <div class="text-sm" style="color: var(--cyber-text-dim);">{{ card.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const showGroupQr = ref(false)

const statCards = ref([
  { icon: '⚡', label: '圣力余额', value: '0' },
  { icon: '🛠️', label: '已用工具', value: '0' },
  { icon: '📄', label: '生成作品', value: '0' },
  { icon: '🎯', label: '会员等级', value: '普通' },
])

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

onMounted(() => {
  statCards.value[0].value = authStore.isAdmin || authStore.coinBalance >= 999999
    ? '∞ 无限'
    : (authStore.coinBalance ? authStore.coinBalance.toLocaleString() : '0')
  statCards.value[3].value = getMemberLabel()
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
  top: 0;
  left: 0;
  right: 0;
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
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%);
  border-radius: 50%;
}

.official-group-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.group-icon,
.group-action {
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
  border-color: rgba(0, 240, 255, 0.25);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.05);
}
</style>
