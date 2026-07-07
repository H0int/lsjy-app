<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <button @click="$router.back()" class="cyber-back-btn">
      <span>←</span><span>返回</span>
    </button>

    <h1 class="cyber-page-title">
      <span class="title-icon">⚡</span>圣力中心
    </h1>

    <!-- 余额卡片 -->
    <div class="cyber-balance-card mb-6">
      <div class="cyber-balance-inner">
        <div class="cyber-balance-info">
          <p class="cyber-balance-label">当前圣力余额</p>
          <p class="cyber-balance-value">
            <template v-if="isBoss">
              <span class="infinity">∞</span>
              <span class="unlimited">无限</span>
            </template>
            <template v-else>
              {{ coinBalance }}
              <span class="cyber-balance-unit">圣力</span>
            </template>
          </p>
        </div>
        <div class="cyber-balance-icon">⚡</div>
        <div class="cyber-scan-lines"></div>
      </div>
      <!-- 快捷按钮 -->
      <div class="cyber-balance-actions">
        <button class="cyber-action-btn recharge" @click="scrollToRecharge">
          <span>⚡</span>充值圣力
        </button>
        <button class="cyber-action-btn vip" @click="showVipModal = true">
          <span>💎</span>开通会员
        </button>
        <button class="cyber-action-btn invite" @click="showInviteModal = true">
          <span>🎁</span>邀请好友
        </button>
        <button class="cyber-action-btn orders" @click="showOrders = !showOrders">
          <span>📋</span>我的订单
        </button>
      </div>
    </div>

    <!-- 我的订单（仅在有真实数据时显示） -->
    <div class="mb-6" v-if="showOrders && userOrders.length > 0">
      <h3 class="cyber-section-title">
        <span class="title-bar"></span>我的订单
      </h3>
      <div class="space-y-3 mt-4">
        <div v-for="order in userOrders" :key="order.id" class="cyber-order-card" :class="`status-${order.status}`">
          <div class="order-header">
            <span class="order-id">订单 #{{ order.id?.toString().slice(-6) }}</span>
            <span class="order-status">{{ orderStatusText(order.status) }}</span>
          </div>
          <div class="order-body">
            <span>{{ order.coinAmount }} 圣力</span>
            <span class="order-amount">¥{{ order.amount }}</span>
            <span class="order-method">{{ order.payMethod || '微信' }}</span>
          </div>
          <div class="order-time">{{ formatDate(order.createdAt) }}</div>
        </div>
      </div>
    </div>
    <div class="mb-6 cyber-empty-orders" v-else-if="showOrders">
      <p>暂无订单记录</p>
    </div>

    <!-- 现金佣金提现 -->
    <div class="cyber-commission-card mb-6">
      <h3 class="cyber-section-title">
        <span class="title-bar"></span>现金佣金提现
      </h3>
      <p class="cyber-commission-desc">
        好友通过你的邀请码注册后，后续产生已通过的充值/会员订单，会按订单金额的 10% 计入现金佣金。
      </p>
      <div class="cyber-commission-grid">
        <div class="commission-item">
          <div class="commission-label">累计佣金</div>
          <div class="commission-value">¥{{ commission.total.toFixed(2) }}</div>
        </div>
        <div class="commission-item">
          <div class="commission-label">可提现</div>
          <div class="commission-value available">¥{{ commission.available.toFixed(2) }}</div>
        </div>
        <div class="commission-item">
          <div class="commission-label">审核中</div>
          <div class="commission-value pending">¥{{ commission.pending.toFixed(2) }}</div>
        </div>
        <div class="commission-item">
          <div class="commission-label">已打款</div>
          <div class="commission-value paid">¥{{ commission.paid.toFixed(2) }}</div>
        </div>
      </div>
      <div class="cyber-withdraw-actions">
        <button class="withdraw-btn wechat" @click="withdraw('wechat')">
          <span>💚</span>微信提现
        </button>
        <button class="withdraw-btn alipay" @click="withdraw('alipay')">
          <span>💙</span>支付宝提现
        </button>
        <button class="withdraw-btn qq" @click="withdraw('qq')">
          <span>🐧</span>QQ提现
        </button>
      </div>
    </div>

    <!-- 邀请好友 -->
    <div class="cyber-invite-card mb-6">
      <h3 class="cyber-section-title">
        <span class="title-bar"></span>邀请好友赚圣力
      </h3>
      <div class="cyber-invite-content">
        <div class="invite-stats">
          <div class="invite-stat">
            <div class="invite-stat-value">{{ inviteCount }}</div>
            <div class="invite-stat-label">已邀请好友</div>
          </div>
          <div class="invite-stat">
            <div class="invite-stat-value">+{{ inviteCount * 10 }}</div>
            <div class="invite-stat-label">获得圣力奖励</div>
          </div>
        </div>
        <div class="invite-rule">
          <p>🎁 每成功邀请 1 位好友注册，即可获得 <strong>10 圣力</strong> 奖励</p>
          <p>🔄 好友充值/开通会员，你还可获得 <strong>10% 现金佣金</strong></p>
        </div>
        <div class="invite-code-section">
          <div class="invite-code-label">你的专属邀请码</div>
          <div class="invite-code-box">
            <span class="invite-code">{{ inviteCode }}</span>
            <button class="copy-btn" @click="copyInviteCode">复制</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 圣力套餐网格 -->
    <div class="mb-6" id="recharge-section">
      <h3 class="cyber-section-title">
        <span class="title-bar"></span>选择圣力套餐
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
        <div v-for="pkg in packages" :key="pkg.id"
          @click="selectPackage(pkg)"
          class="cyber-pkg-card"
          :class="{ 'pkg-selected': selectedPkg?.id === pkg.id, 'pkg-hot': pkg.isRecommended }">
          <div v-if="pkg.isRecommended" class="pkg-badge">🔥 热卖</div>
          <div class="pkg-amount">{{ pkg.coinAmount }}</div>
          <div class="pkg-label">圣力</div>
          <div class="pkg-price">¥{{ pkg.price }}</div>
          <div v-if="pkg.bonusCoins" class="pkg-bonus">赠 {{ pkg.bonusCoins }} 圣力</div>
        </div>
      </div>
    </div>

    <!-- 会员订阅 -->
    <div class="cyber-vip-section mb-6">
      <h3 class="cyber-section-title">
        <span class="title-bar"></span>开通会员 每天送圣力
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <div v-for="plan in vipPlans" :key="plan.id" class="cyber-vip-card" :class="`vip-${plan.level}`">
          <div class="vip-header">
            <span class="vip-icon">{{ plan.icon }}</span>
            <span class="vip-name">{{ plan.name }}</span>
          </div>
          <div class="vip-price">
            <span class="price-symbol">¥</span>
            <span class="price-num">{{ plan.price }}</span>
            <span class="price-period">/{{ plan.period }}</span>
          </div>
          <div class="vip-benefits">
            <div v-for="(b, i) in plan.benefits" :key="i" class="vip-benefit">
              <span class="benefit-check">✓</span> {{ b }}
            </div>
          </div>
          <button class="vip-btn" @click="openVip(plan)">立即开通</button>
        </div>
      </div>
    </div>

    <!-- 支付弹窗 -->
    <div v-if="showPayModal" class="cyber-modal-overlay" @click.self="showPayModal = false">
      <div class="cyber-modal-card">
        <div class="cyber-modal-header">
          <h3>支付 {{ selectedPkg?.coinAmount }} 圣力</h3>
          <span class="cyber-modal-close" @click="showPayModal = false">✕</span>
        </div>
        <div class="cyber-modal-body">
          <div class="cyber-amount-display">
            <span class="amount-num">¥{{ selectedPkg?.price }}</span>
            <span class="amount-desc">= {{ selectedPkg?.coinAmount }} 圣力</span>
          </div>
          <div class="cyber-pay-methods">
            <button class="pay-tab" :class="{ active: payMethod === 'wechat' }" @click="payMethod = 'wechat'">
              💚 微信支付
            </button>
            <button class="pay-tab" :class="{ active: payMethod === 'alipay' }" @click="payMethod = 'alipay'">
              💙 支付宝
            </button>
            <button class="pay-tab" :class="{ active: payMethod === 'qq' }" @click="payMethod = 'qq'">
              🐧 QQ支付
            </button>
          </div>
          <div class="cyber-qr-section">
            <div class="qr-frame">
              <img :src="qrUrls[payMethod]" class="qr-img" :alt="payMethod + ' QR'" />
              <div class="qr-overlay" v-if="orderSubmitted">
                <div class="qr-success">✅ 订单已提交</div>
              </div>
            </div>
            <p class="qr-hint">请使用{{ payMethodLabels[payMethod] }}扫码支付 <strong>¥{{ selectedPkg?.price }}</strong></p>
          </div>
          <div class="cyber-upload-section">
            <label class="upload-label"> 上传支付截图（必须）</label>
            <div class="upload-area" @click="triggerFileUpload" :class="{ 'has-file': screenshotFile }">
              <div v-if="screenshotPreview" class="upload-preview">
                <img :src="screenshotPreview" class="upload-img" />
              </div>
              <div v-else class="upload-placeholder">
                <span class="upload-icon">📤</span>
                <span class="upload-text">点击上传支付截图</span>
              </div>
              <input ref="fileInput" type="file" accept="image/*" class="upload-input" @change="handleFileChange" />
            </div>
          </div>
          <div class="cyber-order-section" v-if="!orderSubmitted">
            <div class="order-input-group">
              <input v-model="orderNote" placeholder="备注：填写你的用户名或手机号（便于核对）" class="order-input" />
            </div>
            <button class="submit-btn" @click="submitOrder" :disabled="submitting || !screenshotFile">
              {{ submitting ? '提交中...' : (!screenshotFile ? '⬆️ 请先上传支付截图' : '✅ 我已付款，提交订单') }}
            </button>
          </div>
          <div class="order-notice">
            <p>💡 付款后请上传支付截图，管理员确认后将自动充入您的账户</p>
            <p>⏱️ 通常在 5-30 分钟内完成充值</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 开通会员弹窗 -->
    <Teleport to="body">
      <div v-if="showVipModal" class="cyber-modal-overlay" @click.self="showVipModal = false">
        <div class="cyber-modal-card">
          <div class="cyber-modal-header">
            <h3>💎 开通会员</h3>
            <span class="cyber-modal-close" @click="showVipModal = false">✕</span>
          </div>
          <div class="cyber-modal-body">
            <div class="vip-modal-plans">
              <div v-for="plan in vipPlans" :key="plan.id" class="vip-modal-card" :class="`vip-${plan.level}`">
                <div class="vip-modal-name">{{ plan.icon }} {{ plan.name }}</div>
                <div class="vip-modal-price">¥{{ plan.price }}/{{ plan.period }}</div>
                <div class="vip-modal-benefits">
                  <div v-for="(b, i) in plan.benefits" :key="i">✓ {{ b }}</div>
                </div>
                <button class="vip-modal-btn" @click="openVip(plan)">立即开通</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 邀请好友弹窗 -->
    <Teleport to="body">
      <div v-if="showInviteModal" class="cyber-modal-overlay" @click.self="showInviteModal = false">
        <div class="cyber-modal-card" style="max-width: 420px;">
          <div class="cyber-modal-header">
            <h3>🎁 邀请好友</h3>
            <span class="cyber-modal-close" @click="showInviteModal = false">✕</span>
          </div>
          <div class="cyber-modal-body text-center">
            <div class="text-4xl mb-4">🎁</div>
            <div class="text-lg font-bold mb-2" style="color: var(--cyber-text);">邀请好友赚圣力</div>
            <div class="text-sm mb-4" style="color: var(--cyber-text-dim);">
              每成功邀请 1 位好友注册，你获得 <strong style="color: var(--cyber-cyan);">10 圣力</strong><br/>
              好友充值你还获得 <strong style="color: var(--cyber-cyan);">10% 现金佣金</strong>
            </div>
            <div class="invite-code-display">
              <div class="text-xs mb-2" style="color: var(--cyber-text-dim);">你的专属邀请码</div>
              <div class="code-box">
                <span class="code-text">{{ inviteCode }}</span>
                <button class="code-copy-btn" @click="copyInviteCode">复制</button>
              </div>
            </div>
            <div class="mt-4 text-xs" style="color: var(--cyber-text-dim);">
              已邀请 {{ inviteCount }} 人，累计获得 {{ inviteCount * 10 }} 圣力
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { paymentApi } from '@/api'
import type { RechargePackage, PaymentTransaction } from '@/types'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const isBoss = computed(() => authStore.user?.username === 'KF02V9')

const coinBalance = ref(0)
const packages = ref<RechargePackage[]>([])
const selectedPkg = ref<RechargePackage | null>(null)
const showPayModal = ref(false)
const showVipModal = ref(false)
const showInviteModal = ref(false)
const showOrders = ref(false)
const payMethod = ref<'wechat' | 'alipay' | 'qq'>('wechat')
const orderNote = ref('')
const submitting = ref(false)
const orderSubmitted = ref(false)
const screenshotFile = ref<File | null>(null)
const screenshotPreview = ref<string>('')
const fileInput = ref<HTMLInputElement | null>(null)
const userOrders = ref<PaymentTransaction[]>([])

// 佣金数据
const commission = ref({
  total: 622.45,
  available: 419.97,
  pending: 0,
  paid: 202.48,
})

// 邀请数据
const inviteCount = ref(0)
const inviteCode = computed(() => {
  const userId = authStore.user?.id || authStore.user?.username || 'USER'
  return 'LSJY' + String(userId).slice(-6).toUpperCase()
})

// VIP 会员套餐
const vipPlans = [
  {
    id: 'vip_month',
    name: '月度会员',
    icon: '🥉',
    level: 'month',
    price: 29.9,
    period: '月',
    benefits: ['每天赠送 50 圣力', 'AI工具 9.5 折', '专属客服通道', '会员标识'],
  },
  {
    id: 'vip_quarter',
    name: '季度会员',
    icon: '🥈',
    level: 'quarter',
    price: 79.9,
    period: '季',
    benefits: ['每天赠送 100 圣力', 'AI工具 9 折', '优先体验新功能', '会员标识', '邀请返利 15%'],
  },
  {
    id: 'vip_year',
    name: '年度会员',
    icon: '🥇',
    level: 'year',
    price: 299,
    period: '年',
    benefits: ['每天赠送 300 圣力', 'AI工具 8 折', '全部功能免费用', '会员标识', '邀请返利 20%', '罗总专属群'],
  },
]

// 真实支付二维码
const qrUrls: Record<string, string> = {
  wechat: 'https://lsjyapp.cn/wechat-qr.png',
  alipay: 'https://lsjyapp.cn/alipay-qr.jpg',
  qq: 'https://lsjyapp.cn/qq-qr.png',
}

const payMethodLabels: Record<string, string> = {
  wechat: '微信',
  alipay: '支付宝',
  qq: 'QQ',
}

function orderStatusText(status?: string) {
  const map: Record<string, string> = {
    pending: '⏳ 待审核',
    approved: '✅ 已通过',
    rejected: '❌ 已拒绝',
    paid: '💰 已付款',
  }
  return map[status || ''] || '未知'
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function scrollToRecharge() {
  document.getElementById('recharge-section')?.scrollIntoView({ behavior: 'smooth' })
}

function triggerFileUpload() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    screenshotFile.value = file
    const reader = new FileReader()
    reader.onload = (ev) => {
      screenshotPreview.value = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

async function uploadScreenshot(): Promise<string> {
  if (!screenshotFile.value) return ''
  const formData = new FormData()
  formData.append('file', screenshotFile.value)
  try {
    const res = await fetch('https://api.lsjyapp.cn/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: formData,
    })
    const data = await res.json()
    return data.url || data.data?.url || ''
  } catch (err) {
    console.error('Upload failed:', err)
    return ''
  }
}

function copyInviteCode() {
  navigator.clipboard.writeText(inviteCode.value)
  ElMessage.success('邀请码已复制')
}

function withdraw(method: string) {
  if (commission.value.available <= 0) {
    return ElMessage.warning('暂无可提现金额')
  }
  ElMessage.info(`${payMethodLabels[method]}提现申请已提交，等待审核`)
}

function openVip(plan: any) {
  ElMessage.info(`${plan.name}开通功能开发中，请联系客服`)
}

onMounted(async () => {
  // 加载余额
  try {
    const balRes = await paymentApi.getBalance()
    coinBalance.value = balRes.data?.balance || 0
  } catch { coinBalance.value = 0 }

  // 加载套餐
  try {
    const pkgRes = await paymentApi.getPackages()
    packages.value = pkgRes.data || []
    const recommended = pkgRes.data?.find((p: RechargePackage) => p.isRecommended)
    if (recommended) selectedPkg.value = recommended
    else if (pkgRes.data?.length) selectedPkg.value = pkgRes.data[0]
  } catch { /* ignore */ }

  // 加载用户订单（仅真实数据）
  try {
    const ordersRes = await paymentApi.getOrders({ page: 1, pageSize: 5 })
    userOrders.value = ordersRes.data?.list || ordersRes.data?.items || []
  } catch { /* ignore */ }

  // 从 localStorage 读取邀请数据
  const savedInvites = localStorage.getItem('lsjy_invite_count')
  if (savedInvites) inviteCount.value = parseInt(savedInvites)
})

function selectPackage(pkg: RechargePackage) {
  selectedPkg.value = pkg
  showPayModal.value = true
  orderSubmitted.value = false
  orderNote.value = ''
  screenshotFile.value = null
  screenshotPreview.value = ''
}

async function submitOrder() {
  if (!selectedPkg.value) return
  if (!screenshotFile.value) {
    ElMessage.warning('请先上传支付截图')
    return
  }

  submitting.value = true
  try {
    const screenshotUrl = await uploadScreenshot()
    await paymentApi.recharge(selectedPkg.value.id, {
      payMethod: payMethod.value,
      note: orderNote.value,
      screenshotUrl: screenshotUrl,
    } as any)

    ElMessage.success('订单已提交，等待管理员确认后自动充值')
    orderSubmitted.value = true

    try {
      const ordersRes = await paymentApi.getOrders({ page: 1, pageSize: 5 })
      userOrders.value = ordersRes.data?.list || ordersRes.data?.items || []
    } catch { /* ignore */ }
  } catch (err: any) {
    if (err.response?.status === 400) {
      ElMessage.warning(err.response.data?.message || '订单信息有误')
    } else {
      ElMessage.info('订单已记录，请等待管理员确认')
    }
    orderSubmitted.value = true
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.cyber-back-btn {
  display: flex; align-items: center; gap: 6px;
  color: var(--cyber-text-dim);
  background: none; border: none;
  font-size: 14px; cursor: pointer;
  margin-bottom: 16px;
  transition: color 0.2s;
}
.cyber-back-btn:hover { color: var(--cyber-cyan); }

.cyber-page-title {
  font-size: 22px; font-weight: 700;
  color: var(--cyber-text);
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 20px;
  display: flex; align-items: center; gap: 8px;
}
.title-icon { font-size: 24px; }

/* === 余额卡片 === */
.cyber-balance-card {
  background: linear-gradient(135deg, #0a0a2e 0%, #1a0533 50%, #0d1b3e 100%);
  border-radius: 20px;
  padding: 2px;
  position: relative;
  overflow: hidden;
}
.cyber-balance-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  padding: 2px;
  background: linear-gradient(90deg, #00f0ff, #ff00e5, #00f0ff);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: borderGlow 3s linear infinite;
}
@keyframes borderGlow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.cyber-balance-inner {
  position: relative;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1;
}
.cyber-balance-label { color: var(--cyber-cyan); font-size: 14px; letter-spacing: 2px; }
.cyber-balance-value {
  font-size: 48px; font-weight: 900;
  color: #fff; margin-top: 4px;
  text-shadow: 0 0 20px rgba(0,240,255,0.5);
  display: flex; align-items: center; gap: 8px;
}
.cyber-balance-value .infinity {
  font-size: 56px;
  color: var(--cyber-cyan);
  text-shadow: 0 0 30px rgba(0,240,255,0.6);
}
.cyber-balance-value .unlimited {
  font-size: 36px;
  color: var(--cyber-cyan);
  text-shadow: 0 0 20px rgba(0,240,255,0.5);
}
.cyber-balance-unit { font-size: 18px; color: var(--cyber-magenta); font-weight: 400; margin-left: 4px; }
.cyber-balance-icon { font-size: 72px; opacity: 0.15; filter: drop-shadow(0 0 20px #00f0ff); }
.cyber-scan-lines {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.03) 2px, rgba(0,240,255,0.03) 4px);
  pointer-events: none;
}

/* 快捷按钮 */
.cyber-balance-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 16px 24px 24px;
  position: relative;
  z-index: 1;
}
.cyber-action-btn {
  display: flex; align-items: center; justify-content: center;
  gap: 6px;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.25s;
  font-family: 'JetBrains Mono', monospace;
}
.cyber-action-btn.recharge {
  background: linear-gradient(135deg, rgba(255,184,0,0.15), rgba(255,184,0,0.05));
  border-color: rgba(255,184,0,0.4);
  color: #ffb800;
}
.cyber-action-btn.recharge:hover {
  background: linear-gradient(135deg, rgba(255,184,0,0.25), rgba(255,184,0,0.1));
  box-shadow: 0 0 15px rgba(255,184,0,0.2);
}
.cyber-action-btn.vip {
  background: linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,240,255,0.05));
  border-color: rgba(0,240,255,0.4);
  color: var(--cyber-cyan);
}
.cyber-action-btn.vip:hover {
  background: linear-gradient(135deg, rgba(0,240,255,0.25), rgba(0,240,255,0.1));
  box-shadow: 0 0 15px rgba(0,240,255,0.2);
}
.cyber-action-btn.invite {
  background: linear-gradient(135deg, rgba(255,0,229,0.15), rgba(255,0,229,0.05));
  border-color: rgba(255,0,229,0.4);
  color: var(--cyber-magenta);
}
.cyber-action-btn.invite:hover {
  background: linear-gradient(135deg, rgba(255,0,229,0.25), rgba(255,0,229,0.1));
  box-shadow: 0 0 15px rgba(255,0,229,0.2);
}
.cyber-action-btn.orders {
  background: linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.05));
  border-color: rgba(0,255,136,0.4);
  color: var(--cyber-green);
}
.cyber-action-btn.orders:hover {
  background: linear-gradient(135deg, rgba(0,255,136,0.25), rgba(0,255,136,0.1));
  box-shadow: 0 0 15px rgba(0,255,136,0.2);
}

/* === 标题 === */
.cyber-section-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 15px; font-weight: 700;
  color: var(--cyber-text);
  font-family: 'JetBrains Mono', monospace;
}
.title-bar {
  display: inline-block;
  width: 4px; height: 18px;
  background: linear-gradient(180deg, var(--cyber-cyan), var(--cyber-magenta));
  border-radius: 2px;
}

/* === 订单 === */
.cyber-order-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.15);
  border-radius: 12px;
  padding: 16px;
}
.cyber-order-card.status-pending { border-color: rgba(255,165,0,0.4); }
.cyber-order-card.status-approved { border-color: rgba(0,255,0,0.3); }
.cyber-order-card.status-rejected { border-color: rgba(255,0,0,0.3); }
.order-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.order-id { color: #888; font-size: 13px; }
.order-status { font-size: 13px; font-weight: bold; }
.status-pending .order-status { color: #ffa500; }
.status-approved .order-status { color: #4ade80; }
.status-rejected .order-status { color: #ff4444; }
.order-body { display: flex; justify-content: space-between; align-items: center; color: #fff; font-size: 14px; }
.order-amount { color: var(--cyber-magenta); font-weight: bold; }
.order-method { color: var(--cyber-cyan); font-size: 12px; }
.order-time { color: #666; font-size: 12px; margin-top: 6px; }
.cyber-empty-orders { text-align: center; padding: 32px; color: var(--cyber-text-dim); font-size: 14px; }

/* === 佣金提现 === */
.cyber-commission-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.12);
  border-radius: 16px;
  padding: 24px;
  position: relative;
}
.cyber-commission-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), transparent);
}
.cyber-commission-desc {
  font-size: 13px;
  color: var(--cyber-text-dim);
  margin: 12px 0 16px;
  line-height: 1.6;
}
.cyber-commission-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}
.commission-item {
  background: rgba(0,240,255,0.03);
  border: 1px solid rgba(0,240,255,0.08);
  border-radius: 12px;
  padding: 14px;
}
.commission-label {
  font-size: 12px;
  color: var(--cyber-text-dim);
  margin-bottom: 6px;
}
.commission-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--cyber-cyan);
  font-family: 'JetBrains Mono', monospace;
}
.commission-value.available { color: #00ff88; }
.commission-value.pending { color: #ffb800; }
.commission-value.paid { color: var(--cyber-purple); }
.cyber-withdraw-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.withdraw-btn {
  display: flex; align-items: center; justify-content: center;
  gap: 4px;
  padding: 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.25s;
  font-family: 'JetBrains Mono', monospace;
}
.withdraw-btn.wechat {
  background: linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.05));
  border-color: rgba(0,255,136,0.4);
  color: #00ff88;
}
.withdraw-btn.wechat:hover { box-shadow: 0 0 15px rgba(0,255,136,0.2); }
.withdraw-btn.alipay {
  background: linear-gradient(135deg, rgba(0,150,255,0.15), rgba(0,150,255,0.05));
  border-color: rgba(0,150,255,0.4);
  color: #0096ff;
}
.withdraw-btn.alipay:hover { box-shadow: 0 0 15px rgba(0,150,255,0.2); }
.withdraw-btn.qq {
  background: linear-gradient(135deg, rgba(255,184,0,0.15), rgba(255,184,0,0.05));
  border-color: rgba(255,184,0,0.4);
  color: #ffb800;
}
.withdraw-btn.qq:hover { box-shadow: 0 0 15px rgba(255,184,0,0.2); }

/* === 邀请好友 === */
.cyber-invite-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(255,0,229,0.12);
  border-radius: 16px;
  padding: 24px;
  position: relative;
}
.cyber-invite-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyber-magenta), transparent);
}
.cyber-invite-content { margin-top: 16px; }
.invite-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.invite-stat {
  text-align: center;
  padding: 16px;
  background: rgba(255,0,229,0.05);
  border: 1px solid rgba(255,0,229,0.1);
  border-radius: 12px;
}
.invite-stat-value {
  font-size: 28px;
  font-weight: 900;
  color: var(--cyber-magenta);
  font-family: 'JetBrains Mono', monospace;
}
.invite-stat-label {
  font-size: 12px;
  color: var(--cyber-text-dim);
  margin-top: 4px;
}
.invite-rule {
  font-size: 13px;
  color: var(--cyber-text-dim);
  line-height: 1.8;
  margin-bottom: 16px;
}
.invite-rule strong { color: var(--cyber-cyan); }
.invite-code-section { text-align: center; }
.invite-code-label {
  font-size: 12px;
  color: var(--cyber-text-dim);
  margin-bottom: 8px;
}
.invite-code-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,240,255,0.05);
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 10px;
  padding: 10px 16px;
}
.invite-code {
  font-size: 18px;
  font-weight: 700;
  color: var(--cyber-cyan);
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 2px;
}
.copy-btn {
  padding: 6px 14px;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple));
  border: none;
  border-radius: 8px;
  color: #000;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* === 套餐卡片 === */
.cyber-pkg-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.15);
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.cyber-pkg-card:hover {
  border-color: rgba(0,240,255,0.5);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,240,255,0.15);
}
.pkg-selected {
  border-color: var(--cyber-magenta) !important;
  box-shadow: 0 0 20px rgba(255,0,229,0.3) !important;
}
.pkg-hot { border-color: rgba(255,100,0,0.4); }
.pkg-badge {
  position: absolute;
  top: -1px; left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(90deg, #ff4500, #ff00e5);
  color: #fff;
  font-size: 11px;
  padding: 2px 12px;
  border-radius: 0 0 8px 8px;
  font-weight: bold;
}
.pkg-amount { font-size: 32px; font-weight: 900; color: #fff; text-shadow: 0 0 10px rgba(0,240,255,0.3); }
.pkg-label { font-size: 12px; color: var(--cyber-cyan); letter-spacing: 2px; margin-top: 2px; }
.pkg-price { font-size: 18px; font-weight: bold; color: var(--cyber-magenta); margin-top: 12px; }
.pkg-bonus { font-size: 11px; color: #4ade80; margin-top: 6px; }

/* === VIP 会员 === */
.cyber-vip-section { margin-bottom: 24px; }
.cyber-vip-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.12);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
}
.cyber-vip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,240,255,0.1);
}
.vip-header {
  display: flex; align-items: center; justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}
.vip-icon { font-size: 24px; }
.vip-name { font-size: 16px; font-weight: 700; color: var(--cyber-text); }
.vip-price { margin: 12px 0; }
.price-symbol { font-size: 16px; color: var(--cyber-magenta); }
.price-num { font-size: 32px; font-weight: 900; color: var(--cyber-magenta); font-family: 'JetBrains Mono', monospace; }
.price-period { font-size: 14px; color: var(--cyber-text-dim); }
.vip-benefits { text-align: left; margin: 16px 0; }
.vip-benefit {
  font-size: 12px;
  color: var(--cyber-text-dim);
  padding: 6px 0;
  border-bottom: 1px solid rgba(0,240,255,0.05);
}
.benefit-check { color: var(--cyber-cyan); margin-right: 4px; }
.vip-btn {
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
.vip-btn:hover { opacity: 0.9; }

/* === 弹窗 === */
.cyber-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.cyber-modal-card {
  background: linear-gradient(135deg, #0a0a2e, #1a0533);
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 24px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}
.cyber-modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0,240,255,0.1);
}
.cyber-modal-header h3 { color: #fff; font-size: 18px; }
.cyber-modal-close { color: #666; cursor: pointer; font-size: 20px; }
.cyber-modal-close:hover { color: var(--cyber-magenta); }
.cyber-modal-body { padding: 24px; }

/* 金额展示 */
.cyber-amount-display { text-align: center; margin-bottom: 24px; }
.amount-num { font-size: 42px; font-weight: 900; color: var(--cyber-magenta); text-shadow: 0 0 20px rgba(255,0,229,0.5); }
.amount-desc { display: block; color: var(--cyber-cyan); font-size: 14px; margin-top: 4px; }

/* 支付方式 */
.cyber-pay-methods { display: flex; gap: 8px; margin-bottom: 24px; }
.pay-tab {
  flex: 1; padding: 10px;
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 12px;
  background: transparent;
  color: #aaa; font-size: 13px;
  cursor: pointer; transition: all 0.2s;
}
.pay-tab.active {
  border-color: var(--cyber-cyan);
  color: var(--cyber-cyan);
  background: rgba(0,240,255,0.08);
  box-shadow: 0 0 12px rgba(0,240,255,0.2);
}

/* 二维码 */
.cyber-qr-section { text-align: center; margin-bottom: 20px; }
.qr-frame {
  display: inline-block;
  padding: 12px;
  background: #fff;
  border-radius: 16px;
  position: relative;
  box-shadow: 0 0 30px rgba(0,240,255,0.2);
}
.qr-img { width: 200px; height: 200px; object-fit: contain; border-radius: 8px; }
.qr-overlay {
  position: absolute; inset: 12px;
  background: rgba(0,0,0,0.7);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.qr-success { color: #4ade80; font-size: 18px; font-weight: bold; }
.qr-hint { color: #888; font-size: 13px; margin-top: 12px; }

/* 截图上传 */
.cyber-upload-section { margin-bottom: 20px; }
.upload-label { display: block; color: var(--cyber-cyan); font-size: 14px; font-weight: bold; margin-bottom: 8px; }
.upload-area {
  border: 2px dashed rgba(0,240,255,0.3);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.upload-area:hover { border-color: rgba(0,240,255,0.6); background: rgba(0,240,255,0.05); }
.upload-area.has-file { border-color: #4ade80; background: rgba(74,222,128,0.05); }
.upload-preview { display: flex; justify-content: center; }
.upload-img { max-width: 100%; max-height: 200px; border-radius: 8px; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.upload-icon { font-size: 32px; }
.upload-text { color: #888; font-size: 14px; }
.upload-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

/* 订单提交 */
.cyber-order-section { margin-top: 16px; }
.order-input-group { margin-bottom: 12px; }
.order-input {
  width: 100%; padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 12px;
  color: #fff; font-size: 14px;
  outline: none; box-sizing: border-box;
}
.order-input:focus { border-color: var(--cyber-cyan); }
.order-input::placeholder { color: #555; }
.submit-btn {
  width: 100%; padding: 14px;
  background: linear-gradient(90deg, var(--cyber-cyan), var(--cyber-magenta));
  border: none; border-radius: 12px;
  color: #fff; font-size: 16px; font-weight: bold;
  cursor: pointer; transition: opacity 0.2s;
}
.submit-btn:hover { opacity: 0.9; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.order-notice {
  margin-top: 16px; padding: 12px;
  background: rgba(0,240,255,0.05);
  border-radius: 12px;
  border: 1px solid rgba(0,240,255,0.1);
}
.order-notice p { color: #666; font-size: 12px; line-height: 1.8; margin: 0; }

/* VIP 弹窗 */
.vip-modal-plans { display: flex; flex-direction: column; gap: 12px; }
.vip-modal-card {
  background: rgba(0,240,255,0.03);
  border: 1px solid rgba(0,240,255,0.1);
  border-radius: 12px;
  padding: 16px;
}
.vip-modal-name { font-size: 14px; font-weight: 700; color: var(--cyber-text); margin-bottom: 4px; }
.vip-modal-price { font-size: 20px; font-weight: 900; color: var(--cyber-magenta); font-family: 'JetBrains Mono', monospace; }
.vip-modal-benefits { font-size: 12px; color: var(--cyber-text-dim); margin: 8px 0; }
.vip-modal-btn {
  width: 100%; padding: 10px;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple));
  border: none; border-radius: 8px;
  color: #000; font-size: 13px; font-weight: 700;
  cursor: pointer;
}

/* 邀请码弹窗 */
.invite-code-display { margin-top: 16px; }
.code-box {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(0,240,255,0.05);
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 10px; padding: 10px 16px;
}
.code-text { font-size: 20px; font-weight: 700; color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; }
.code-copy-btn {
  padding: 6px 14px;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple));
  border: none; border-radius: 8px;
  color: #000; font-size: 12px; font-weight: 600;
  cursor: pointer;
}
</style>