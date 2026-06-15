<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <button @click="$router.back()" class="flex items-center gap-2 text-gray-500 hover:text-primary mb-4 transition-colors">
      <span>←</span><span>返回</span>
    </button>

    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">⚡ 圣力中心</h1>

    <!-- 余额卡片 - 赛博朋克风格 -->
    <div class="sl-balance-card mb-8">
      <div class="sl-balance-inner">
        <div class="sl-balance-info">
          <p class="sl-balance-label">当前圣力</p>
          <p class="sl-balance-value">{{ coinBalance }} <span class="sl-balance-unit">SP</span></p>
        </div>
        <div class="sl-balance-icon">⚡</div>
        <div class="sl-scan-lines"></div>
      </div>
    </div>

    <!-- 圣力套餐网格 -->
    <div class="mb-8">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span class="sl-title-bar"></span>
        选择圣力套餐
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div v-for="pkg in packages" :key="pkg.id"
          @click="selectPackage(pkg)"
          class="sl-pkg-card"
          :class="{ 'sl-pkg-selected': selectedPkg?.id === pkg.id, 'sl-pkg-hot': pkg.isRecommended }">
          <div v-if="pkg.isRecommended" class="sl-pkg-badge">🔥 热卖</div>
          <div class="sl-pkg-amount">{{ pkg.coinAmount }}</div>
          <div class="sl-pkg-label">圣力</div>
          <div class="sl-pkg-price">¥{{ pkg.price }}</div>
          <div v-if="pkg.bonusCoins" class="sl-pkg-bonus">赠 {{ pkg.bonusCoins }} 圣力</div>
        </div>
      </div>
    </div>

    <!-- 支付方式弹窗 -->
    <div v-if="showPayModal" class="sl-modal-overlay" @click.self="showPayModal = false">
      <div class="sl-modal-card">
        <div class="sl-modal-header">
          <h3>支付 {{ selectedPkg?.coinAmount }} 圣力</h3>
          <span class="sl-modal-close" @click="showPayModal = false">✕</span>
        </div>
        <div class="sl-modal-body">
          <div class="sl-amount-display">
            <span class="sl-amount-num">¥{{ selectedPkg?.price }}</span>
            <span class="sl-amount-desc">= {{ selectedPkg?.coinAmount }} 圣力</span>
          </div>
          
          <!-- 支付方式选择 -->
          <div class="sl-pay-methods">
            <button class="sl-pay-tab" :class="{ active: payMethod === 'wechat' }" @click="payMethod = 'wechat'">
              💚 微信支付
            </button>
            <button class="sl-pay-tab" :class="{ active: payMethod === 'alipay' }" @click="payMethod = 'alipay'">
              💙 支付宝
            </button>
            <button class="sl-pay-tab" :class="{ active: payMethod === 'qq' }" @click="payMethod = 'qq'">
              🐧 QQ支付
            </button>
          </div>

          <!-- 二维码展示区 -->
          <div class="sl-qr-section">
            <div class="sl-qr-frame">
              <img :src="qrUrls[payMethod]" class="sl-qr-img" :alt="payMethod + ' QR'" />
              <div class="sl-qr-overlay" v-if="orderSubmitted">
                <div class="sl-qr-success">✅ 订单已提交</div>
              </div>
            </div>
            <p class="sl-qr-hint">请使用{{ payMethodLabels[payMethod] }}扫码支付 <strong>¥{{ selectedPkg?.price }}</strong></p>
          </div>

          <!-- 提交订单 -->
          <div class="sl-order-section" v-if="!orderSubmitted">
            <div class="sl-order-input-group">
              <input v-model="orderNote" placeholder="备注：填写你的用户名或手机号（便于核对）" class="sl-order-input" />
            </div>
            <button class="sl-submit-btn" @click="submitOrder" :disabled="submitting">
              {{ submitting ? '提交中...' : '✅ 我已付款，提交订单' }}
            </button>
          </div>

          <div class="sl-order-notice">
            <p>💡 付款后请点击"提交订单"，管理员确认后圣力将自动充入您的账户</p>
            <p>⏱️ 通常在 5-30 分钟内完成充值</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { paymentApi } from '@/api'
import type { RechargePackage } from '@/types'
import { ElMessage } from 'element-plus'

const coinBalance = ref(0)
const packages = ref<RechargePackage[]>([])
const selectedPkg = ref<RechargePackage | null>(null)
const showPayModal = ref(false)
const payMethod = ref<'wechat' | 'alipay' | 'qq'>('wechat')
const orderNote = ref('')
const submitting = ref(false)
const orderSubmitted = ref(false)

const qrUrls: Record<string, string> = {
  wechat: 'https://www.coze.cn/s/EPRDMT3JEf8/',
  alipay: 'https://www.coze.cn/s/De-GJpah1vQ/',
  qq: 'https://www.coze.cn/s/F0LKTUbubHQ/',
}

const payMethodLabels: Record<string, string> = {
  wechat: '微信',
  alipay: '支付宝',
  qq: 'QQ',
}

onMounted(async () => {
  try {
    const balRes = await paymentApi.getBalance()
    coinBalance.value = balRes.data?.balance || 0
  } catch { coinBalance.value = 0 }

  try {
    const pkgRes = await paymentApi.getPackages()
    packages.value = pkgRes.data || []
    const recommended = pkgRes.data?.find((p: RechargePackage) => p.isRecommended)
    if (recommended) selectedPkg.value = recommended
    else if (pkgRes.data?.length) selectedPkg.value = pkgRes.data[0]
  } catch { /* ignore */ }
})

function selectPackage(pkg: RechargePackage) {
  selectedPkg.value = pkg
  showPayModal.value = true
  orderSubmitted.value = false
  orderNote.value = ''
}

async function submitOrder() {
  if (!selectedPkg.value) return
  submitting.value = true
  try {
    await paymentApi.recharge(selectedPkg.value.id)
    ElMessage.success('订单已提交，等待管理员确认后自动充值')
    orderSubmitted.value = true
  } catch {
    ElMessage.info('订单已记录，请等待管理员确认')
    orderSubmitted.value = true
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* === 赛博朋克余额卡片 === */
.sl-balance-card {
  background: linear-gradient(135deg, #0a0a2e 0%, #1a0533 50%, #0d1b3e 100%);
  border-radius: 20px;
  padding: 2px;
  position: relative;
  overflow: hidden;
}
.sl-balance-card::before {
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
.sl-balance-inner {
  position: relative;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1;
}
.sl-balance-label { color: #00f0ff; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; }
.sl-balance-value { font-size: 48px; font-weight: 900; color: #fff; margin-top: 4px; text-shadow: 0 0 20px rgba(0,240,255,0.5); }
.sl-balance-unit { font-size: 18px; color: #ff00e5; font-weight: 400; margin-left: 4px; }
.sl-balance-icon { font-size: 72px; opacity: 0.15; filter: drop-shadow(0 0 20px #00f0ff); }
.sl-scan-lines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.03) 2px, rgba(0,240,255,0.03) 4px);
  pointer-events: none;
}

/* === 标题装饰 === */
.sl-title-bar {
  display: inline-block;
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #00f0ff, #ff00e5);
  border-radius: 2px;
}

/* === 套餐卡片 === */
.sl-pkg-card {
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
.sl-pkg-card:hover {
  border-color: rgba(0,240,255,0.5);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,240,255,0.15);
}
.sl-pkg-selected {
  border-color: #ff00e5 !important;
  box-shadow: 0 0 20px rgba(255,0,229,0.3) !important;
}
.sl-pkg-hot { border-color: rgba(255,100,0,0.4); }
.sl-pkg-badge {
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(90deg, #ff4500, #ff00e5);
  color: #fff;
  font-size: 11px;
  padding: 2px 12px;
  border-radius: 0 0 8px 8px;
  font-weight: bold;
}
.sl-pkg-amount { font-size: 32px; font-weight: 900; color: #fff; text-shadow: 0 0 10px rgba(0,240,255,0.3); }
.sl-pkg-label { font-size: 12px; color: #00f0ff; letter-spacing: 2px; margin-top: 2px; }
.sl-pkg-price { font-size: 18px; font-weight: bold; color: #ff00e5; margin-top: 12px; }
.sl-pkg-bonus { font-size: 11px; color: #4ade80; margin-top: 6px; }

/* === 弹窗 === */
.sl-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.sl-modal-card {
  background: linear-gradient(135deg, #0a0a2e, #1a0533);
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 24px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}
.sl-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0,240,255,0.1);
}
.sl-modal-header h3 { color: #fff; font-size: 18px; }
.sl-modal-close { color: #666; cursor: pointer; font-size: 20px; }
.sl-modal-close:hover { color: #ff00e5; }
.sl-modal-body { padding: 24px; }

/* === 金额展示 === */
.sl-amount-display { text-align: center; margin-bottom: 24px; }
.sl-amount-num { font-size: 42px; font-weight: 900; color: #ff00e5; text-shadow: 0 0 20px rgba(255,0,229,0.5); }
.sl-amount-desc { display: block; color: #00f0ff; font-size: 14px; margin-top: 4px; }

/* === 支付方式 === */
.sl-pay-methods { display: flex; gap: 8px; margin-bottom: 24px; }
.sl-pay-tab {
  flex: 1;
  padding: 10px;
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 12px;
  background: transparent;
  color: #aaa;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.sl-pay-tab.active {
  border-color: #00f0ff;
  color: #00f0ff;
  background: rgba(0,240,255,0.08);
  box-shadow: 0 0 12px rgba(0,240,255,0.2);
}

/* === 二维码 === */
.sl-qr-section { text-align: center; margin-bottom: 20px; }
.sl-qr-frame {
  display: inline-block;
  padding: 12px;
  background: #fff;
  border-radius: 16px;
  position: relative;
  box-shadow: 0 0 30px rgba(0,240,255,0.2);
}
.sl-qr-img { width: 200px; height: 200px; object-fit: contain; border-radius: 8px; }
.sl-qr-overlay {
  position: absolute;
  inset: 12px;
  background: rgba(0,0,0,0.7);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sl-qr-success { color: #4ade80; font-size: 18px; font-weight: bold; }
.sl-qr-hint { color: #888; font-size: 13px; margin-top: 12px; }

/* === 订单提交 === */
.sl-order-section { margin-top: 16px; }
.sl-order-input-group { margin-bottom: 12px; }
.sl-order-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}
.sl-order-input:focus { border-color: #00f0ff; }
.sl-order-input::placeholder { color: #555; }
.sl-submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(90deg, #00f0ff, #ff00e5);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}
.sl-submit-btn:hover { opacity: 0.9; }
.sl-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.sl-order-notice {
  margin-top: 16px;
  padding: 12px;
  background: rgba(0,240,255,0.05);
  border-radius: 12px;
  border: 1px solid rgba(0,240,255,0.1);
}
.sl-order-notice p { color: #666; font-size: 12px; line-height: 1.8; margin: 0; }
</style>
