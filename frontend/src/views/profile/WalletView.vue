<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <button @click="$router.back()" class="flex items-center gap-2 mb-4 transition-colors"
      style="color: var(--cyber-text-dim);"
      @mouseover="($event.currentTarget as HTMLElement).style.color='var(--cyber-cyan)'"
      @mouseleave="($event.currentTarget as HTMLElement).style.color='var(--cyber-text-dim)'">
      <span>←</span><span>返回</span>
    </button>

    <h1 class="text-2xl font-bold mb-6" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
      <span style="color: var(--cyber-amber);">▍</span>圣力中心
    </h1>

    <!-- 余额卡片 -->
    <div class="relative rounded-2xl p-6 mb-6 overflow-hidden cyber-scanline"
      style="background: linear-gradient(135deg, rgba(255,184,0,0.08), rgba(124,58,237,0.1), rgba(255,0,255,0.06)); border: 1px solid rgba(255,184,0,0.3);">
      <div class="relative z-10">
        <p class="text-sm" style="color: var(--cyber-amber); opacity: 0.8;">当前圣力余额</p>
        <p class="text-4xl font-bold mt-1 glow-cyan" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">
          {{ coinBalance >= 999999 ? '∞ 无限' : coinBalance }} <span class="text-lg font-normal" style="color: var(--cyber-text-dim);">圣力</span>
        </p>
      </div>
      <div class="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-15" style="filter: drop-shadow(0 0 10px rgba(255,184,0,0.5));">⚡</div>
      <div class="mt-4 flex gap-3 relative z-10 flex-wrap">
        <el-button type="warning" @click="showRecharge = true" style="min-width: 80px;">⚡ 充值圣力</el-button>
        <el-button type="success" plain @click="scrollToMemberSection" style="min-width: 96px;">💎 开通会员</el-button>
        <el-button plain @click="scrollToInviteSection" :style="{ borderColor: 'var(--cyber-cyan)', color: 'var(--cyber-cyan)' }">🎁 邀请好友</el-button>
        <el-button plain @click="showMyOrders = !showMyOrders"
          :style="{ borderColor: 'var(--cyber-green)', color: 'var(--cyber-green)' }">
          {{ showMyOrders ? '隐藏订单' : '我的订单' }}
        </el-button>
      </div>
    </div>

    <!-- ========== 会员订阅 ========== -->
    <div ref="memberSection" class="cyber-card p-5 mb-6">
      <div class="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div>
          <h3 class="font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
            <span style="color: var(--cyber-amber);">▍</span>会员订阅
          </h3>
          <p class="text-xs mt-1" style="color: var(--cyber-text-dim);">订阅后每天领取圣力，比单次充值更适合持续使用。</p>
        </div>
        <div class="text-xs px-3 py-1 rounded-full"
          :style="subscriptionStatus.active ? 'background: rgba(0,255,136,0.1); color: var(--cyber-green);' : 'background: rgba(255,184,0,0.1); color: var(--cyber-amber);'">
          {{ subscriptionStatus.active ? `会员有效至 ${formatDate(subscriptionStatus.expiresAt, 'YYYY-MM-DD')}` : '暂未开通' }}
        </div>
      </div>
      <div class="grid sm:grid-cols-2 gap-3">
        <div v-for="plan in subscriptionPlans" :key="plan.id" class="rounded-xl p-4 relative"
          style="background: rgba(255,184,0,0.05); border: 1px solid rgba(255,184,0,0.22);">
          <div v-if="plan.isRecommended" class="absolute right-3 top-3 text-[10px] px-2 py-0.5 rounded-full text-white"
            style="background: linear-gradient(135deg, var(--cyber-amber), #ff6b00);">推荐</div>
          <div class="font-bold" style="color: var(--cyber-text);">{{ plan.name }}</div>
          <div class="text-2xl font-bold mt-2" style="color: var(--cyber-amber);">¥{{ plan.price }}<span class="text-xs font-normal">/月</span></div>
          <div class="text-sm mt-2" style="color: var(--cyber-cyan);">每天送 {{ plan.dailyCoins }} 圣力，30天共 {{ plan.totalCoins }} 圣力</div>
          <div class="text-xs mt-1" style="color: var(--cyber-text-dim);">{{ plan.description }}</div>
          <el-button class="mt-4 w-full" type="warning" :loading="subscribing" @click="handleSubscribe(plan)">
            开通 {{ plan.name }}
          </el-button>
        </div>
      </div>
      <div v-if="subscriptionStatus.active" class="mt-4 flex items-center justify-between gap-3 flex-wrap rounded-xl p-3"
        style="background: rgba(0,255,136,0.05); border: 1px solid rgba(0,255,136,0.18);">
        <div class="text-sm" style="color: var(--cyber-text);">
          当前会员：{{ subscriptionStatus.planName }}，每日可领 {{ subscriptionStatus.dailyCoins }} 圣力
        </div>
        <el-button type="success" :loading="claimingDaily" @click="claimDailyCoins">领取今日圣力</el-button>
      </div>
    </div>

    <!-- ========== 邀请好友 ========== -->
    <div ref="inviteSection" class="cyber-card p-5 mb-6">
      <h3 class="font-bold mb-2" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
        <span style="color: var(--cyber-cyan);">▍</span>邀请好友送圣力
      </h3>
      <p class="text-xs mb-4" style="color: var(--cyber-text-dim);">好友填写你的邀请码后，你得80圣力，好友得30圣力。每个账号只能填写一次。</p>
      <div class="grid sm:grid-cols-2 gap-3">
        <div class="rounded-xl p-4" style="background: rgba(0,240,255,0.05); border: 1px solid rgba(0,240,255,0.18);">
          <div class="text-xs mb-1" style="color: var(--cyber-text-dim);">我的邀请码</div>
          <div class="text-2xl font-bold tracking-wider" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">{{ referralInfo.code || '--' }}</div>
          <div class="text-xs mt-2" style="color: var(--cyber-text-dim);">已邀请 {{ referralInfo.invitedCount || 0 }} 人，累计获得 {{ referralInfo.earnedCoins || 0 }} 圣力</div>
          <el-button class="mt-3" size="small" @click="copyInviteCode">复制邀请码</el-button>
        </div>
        <div class="rounded-xl p-4" style="background: rgba(124,58,237,0.06); border: 1px solid rgba(124,58,237,0.2);">
          <div class="text-xs mb-2" style="color: var(--cyber-text-dim);">填写好友邀请码</div>
          <div class="flex gap-2">
            <el-input v-model="inviteCodeInput" placeholder="例如 LSJY0001" />
            <el-button type="primary" :loading="applyingInvite" @click="applyInviteCode">领取</el-button>
          </div>
          <div class="text-[10px] mt-2" style="color: var(--cyber-text-dim);">成功后立即到账30圣力。</div>
        </div>
      </div>
    </div>

    <!-- ========== 充值套餐选择 ========== -->
    <div class="mb-6" v-if="showRecharge">
      <h3 class="font-bold mb-3" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
        <span style="color: var(--cyber-green);">▍</span>选择充值套餐
      </h3>

      <!-- 轻量档 -->
      <div class="mb-3">
        <div class="text-[10px] mb-1.5 px-1" style="color: var(--cyber-text-dim);">── 轻量体验 ──</div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div v-for="pkg in lightPackages" :key="pkg.id"
            @click="selectedPkgId = pkg.id"
            class="cyber-card p-3 text-center cursor-pointer transition-all duration-300 relative"
            :style="selectedPkgId === pkg.id
              ? 'border-color: var(--cyber-cyan); box-shadow: 0 0 15px rgba(0,240,255,0.2);'
              : ''">
            <div v-if="pkg.isRecommended" class="absolute -top-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-white text-[10px] rounded-full whitespace-nowrap"
              style="background: linear-gradient(135deg, var(--cyber-magenta), var(--cyber-purple));">🔥 推荐</div>
            <div class="text-xl font-bold" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">{{ pkg.coinAmount }}</div>
            <div class="text-[10px] mt-0.5" style="color: var(--cyber-text-dim);">圣力</div>
            <div class="text-sm font-bold mt-1.5" style="color: var(--cyber-amber);">¥{{ pkg.price }}</div>
            <div v-if="pkg.bonusCoins" class="text-[10px] mt-0.5" style="color: var(--cyber-green);">+{{ pkg.bonusCoins }}赠送</div>
          </div>
        </div>
      </div>

      <!-- 标准档 -->
      <div class="mb-3">
        <div class="text-[10px] mb-1.5 px-1" style="color: var(--cyber-text-dim);">── 标准畅用 ──</div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div v-for="pkg in standardPackages" :key="pkg.id"
            @click="selectedPkgId = pkg.id"
            class="cyber-card p-3 text-center cursor-pointer transition-all duration-300 relative"
            :style="selectedPkgId === pkg.id
              ? 'border-color: var(--cyber-cyan); box-shadow: 0 0 15px rgba(0,240,255,0.2);'
              : ''">
            <div v-if="pkg.isRecommended" class="absolute -top-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-white text-[10px] rounded-full whitespace-nowrap"
              style="background: linear-gradient(135deg, var(--cyber-magenta), var(--cyber-purple));">🔥 推荐</div>
            <div class="text-xl font-bold" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">{{ pkg.coinAmount }}</div>
            <div class="text-[10px] mt-0.5" style="color: var(--cyber-text-dim);">圣力</div>
            <div class="text-sm font-bold mt-1.5" style="color: var(--cyber-amber);">¥{{ pkg.price }}</div>
            <div v-if="pkg.bonusCoins" class="text-[10px] mt-0.5" style="color: var(--cyber-green);">+{{ pkg.bonusCoins }}赠送</div>
          </div>
        </div>
      </div>

      <!-- 高端档 -->
      <div class="mb-3">
        <div class="text-[10px] mb-1.5 px-1" style="color: var(--cyber-text-dim);">── 高端尊享 ──</div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div v-for="pkg in premiumPackages" :key="pkg.id"
            @click="selectedPkgId = pkg.id"
            class="cyber-card p-3 text-center cursor-pointer transition-all duration-300 relative"
            :style="selectedPkgId === pkg.id
              ? 'border-color: var(--cyber-amber); box-shadow: 0 0 15px rgba(255,184,0,0.3);'
              : ''">
            <div v-if="pkg.isRecommended" class="absolute -top-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-white text-[10px] rounded-full whitespace-nowrap"
              style="background: linear-gradient(135deg, var(--cyber-amber), #ff6b00);">👑 超值</div>
            <div class="text-xl font-bold" style="color: var(--cyber-amber); font-family: 'JetBrains Mono', monospace;">{{ pkg.coinAmount }}</div>
            <div class="text-[10px] mt-0.5" style="color: var(--cyber-text-dim);">圣力</div>
            <div class="text-sm font-bold mt-1.5" style="color: var(--cyber-amber);">¥{{ pkg.price }}</div>
            <div v-if="pkg.bonusCoins" class="text-[10px] mt-0.5" style="color: var(--cyber-green);">+{{ pkg.bonusCoins }}赠送</div>
          </div>
        </div>
      </div>

      <!-- 支付方式选择 -->
      <div class="mt-4 mb-3">
        <div class="text-[10px] mb-1.5 px-1" style="color: var(--cyber-text-dim);">── 支付方式 ──</div>
        <div class="flex gap-3">
          <div @click="payMethod = 'wechat'" class="flex-1 cyber-card p-3 text-center cursor-pointer transition-all"
            :style="payMethod === 'wechat' ? 'border-color: #07C160; background: rgba(7,193,96,0.05);' : ''">
            <div class="text-xl"></div>
            <div class="text-[11px] mt-1" style="color: #07C160;">微信支付</div>
          </div>
          <div @click="payMethod = 'alipay'" class="flex-1 cyber-card p-3 text-center cursor-pointer transition-all"
            :style="payMethod === 'alipay' ? 'border-color: #00A0FF; background: rgba(0,160,255,0.05);' : ''">
            <div class="text-xl"></div>
            <div class="text-[11px] mt-1" style="color: #00A0FF;">支付宝</div>
          </div>
          <div @click="payMethod = 'qq'" class="flex-1 cyber-card p-3 text-center cursor-pointer transition-all"
            :style="payMethod === 'qq' ? 'border-color: #12B7F5; background: rgba(18,183,245,0.05);' : ''">
            <div class="text-xl">🐧</div>
            <div class="text-[11px] mt-1" style="color: #12B7F5;">QQ支付</div>
          </div>
        </div>
      </div>

      <div class="mt-4 text-center">
        <el-button type="warning" size="large" :loading="recharging" @click="handleRecharge"
          style="min-width: 200px; font-weight: bold;">
          ⚡ 确认充值 {{ selectedPkg?.coinAmount || 0 }} 圣力（¥{{ selectedPkg?.price || 0 }}）
        </el-button>
      </div>
    </div>

    <!-- ========== 支付二维码弹窗 ========== -->
    <el-dialog v-model="showPayDialog" title="扫码支付" width="420px" :close-on-click-modal="false">
      <div class="text-center mb-3">
        <p class="text-lg font-bold mb-1" style="color: var(--cyber-text);">
          订单金额：<span style="color: var(--cyber-amber); font-family: 'JetBrains Mono', monospace;">¥{{ currentOrder?.price }}</span>
        </p>
        <p class="text-sm" style="color: var(--cyber-text-dim);">
          获得 <span style="color: var(--cyber-cyan); font-weight: bold;">{{ currentOrder?.coinAmount }}</span> 圣力
        </p>
      </div>

      <!-- 支付方式切换 -->
      <div class="flex justify-center gap-3 mb-4">
        <div @click="switchPayMethod('wechat')" class="cursor-pointer p-2.5 rounded-lg transition-all flex flex-col items-center"
          :style="payMethod === 'wechat' ? 'background: rgba(7,193,96,0.1); border: 2px solid #07C160;' : 'border: 2px solid transparent;'">
          <div class="text-xl">💚</div>
          <div class="text-[10px] mt-0.5" style="color: #07C160;">微信</div>
        </div>
        <div @click="switchPayMethod('alipay')" class="cursor-pointer p-2.5 rounded-lg transition-all flex flex-col items-center"
          :style="payMethod === 'alipay' ? 'background: rgba(0,160,255,0.1); border: 2px solid #00A0FF;' : 'border: 2px solid transparent;'">
          <div class="text-xl">💙</div>
          <div class="text-[10px] mt-0.5" style="color: #00A0FF;">支付宝</div>
        </div>
        <div @click="switchPayMethod('qq')" class="cursor-pointer p-2.5 rounded-lg transition-all flex flex-col items-center"
          :style="payMethod === 'qq' ? 'background: rgba(18,183,245,0.1); border: 2px solid #12B7F5;' : 'border: 2px solid transparent;'">
          <div class="text-xl">🐧</div>
          <div class="text-[10px] mt-0.5" style="color: #12B7F5;">QQ</div>
        </div>
      </div>

      <!-- 二维码显示区 -->
      <div class="flex justify-center mb-3">
        <div class="rounded-xl overflow-hidden p-2"
          :style="payMethod === 'wechat' ? 'background: #07C160;' : payMethod === 'alipay' ? 'background: #00A0FF;' : 'background: #12B7F5;'">
          <div class="bg-white rounded-lg p-3">
            <img :src="qrCodeUrl" class="w-56 h-56 object-contain" alt="收款二维码" />
          </div>
        </div>
      </div>

      <div class="text-center text-xs mb-4" style="color: var(--cyber-text-dim);">
        请使用 <span style="font-weight: bold;" :style="{
          color: payMethod === 'wechat' ? '#07C160' : payMethod === 'alipay' ? '#00A0FF' : '#12B7F5'
        }">{{ payMethodName }}</span> 扫描上方二维码完成支付
      </div>

      <!-- 上传付款截图 -->
      <div class="border-t pt-4" style="border-color: var(--cyber-border);">
        <p class="text-sm font-bold mb-2" style="color: var(--cyber-text);">📸 上传付款截图（提交后自动到账）</p>
        <el-upload
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          accept="image/*"
          @change="handleScreenshotUpload">
          <el-button type="primary" :loading="uploading" size="small">
            {{ uploading ? '上传中...' : '选择截图' }}
          </el-button>
        </el-upload>
        <p v-if="screenshotUrl" class="text-xs mt-2" style="color: var(--cyber-green);">✅ 截图已上传，点击"确认到账"完成充值</p>
        <p v-else class="text-[10px] mt-1" style="color: var(--cyber-text-dim);">支持 JPG/PNG 格式</p>
      </div>

      <template #footer>
        <el-button @click="showPayDialog = false">取消</el-button>
        <el-button type="success" :disabled="!screenshotUrl" :loading="submitting" @click="submitScreenshot">
          ✅ 确认到账
        </el-button>
      </template>
    </el-dialog>

    <!-- ========== 我的订单 ========== -->
    <div ref="ordersSection" class="cyber-card p-6" v-if="showMyOrders">
      <h3 class="font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
        <span style="color: var(--cyber-green);"></span>我的充值订单
      </h3>
      <div class="space-y-3">
        <div v-for="order in myOrders" :key="order.id"
          class="flex items-center justify-between py-3"
          style="border-bottom: 1px solid var(--cyber-border);">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              :style="order.status === 'approved'
                ? 'background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.2);'
                : order.status === 'rejected'
                ? 'background: rgba(255,0,100,0.1); border: 1px solid rgba(255,0,100,0.2);'
                : 'background: rgba(255,184,0,0.1); border: 1px solid rgba(255,184,0,0.2);'">
              {{ order.status === 'approved' ? '✅' : order.status === 'rejected' ? '❌' : '⏳' }}
            </div>
            <div>
              <div class="text-sm font-medium" style="color: var(--cyber-text);">{{ order.coinAmount }} 圣力</div>
              <div class="text-xs" style="color: var(--cyber-text-dim);">{{ formatDate(order.createdAt) }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-bold" style="color: var(--cyber-amber);">¥{{ order.price }}</div>
            <div class="text-xs" :style="{
              color: order.status === 'approved' ? 'var(--cyber-green)' : order.status === 'rejected' ? '#ff4466' : 'var(--cyber-amber)'
            }">
              {{ order.status === 'approved' ? '已到账' : order.status === 'rejected' ? '已拒绝' : order.status === 'pending_review' ? '审核中' : '待付款' }}
            </div>
          </div>
        </div>
        <div v-if="myOrders.length === 0" class="text-center py-8" style="color: var(--cyber-text-dim);">暂无订单</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { paymentApi } from '@/api'
import { formatDate } from '@/utils'
import type { RechargePackage } from '@/types'
import { ElMessage } from 'element-plus'
import service from '@/api/request'

const route = useRoute()
const coinBalance = ref(0)
const showRecharge = ref(false)
const showMyOrders = ref(false)
const ordersSection = ref<HTMLElement | null>(null)
const memberSection = ref<HTMLElement | null>(null)
const inviteSection = ref<HTMLElement | null>(null)
const selectedPkgId = ref<number | null>(null)
const recharging = ref(false)
const packages = ref<RechargePackage[]>([])
const myOrders = ref<any[]>([])
const subscriptionPlans = ref<any[]>([])
const subscriptionStatus = ref<any>({ active: false })
const referralInfo = ref<any>({})
const inviteCodeInput = ref('')
const subscribing = ref(false)
const claimingDaily = ref(false)
const applyingInvite = ref(false)

// 支付弹窗相关
const showPayDialog = ref(false)
const currentOrder = ref<any>(null)
const payMethod = ref('wechat')
const screenshotUrl = ref('')
const uploading = ref(false)
const submitting = ref(false)

// 套餐分组
const lightPackages = computed(() => packages.value.filter(p => p.price < 50))
const standardPackages = computed(() => packages.value.filter(p => p.price >= 50 && p.price < 300))
const premiumPackages = computed(() => packages.value.filter(p => p.price >= 300))

const selectedPkg = computed(() => packages.value.find(p => p.id === selectedPkgId.value))

// 二维码URL映射
const qrCodeMap: Record<string, string> = {
  wechat: 'qrcodes/wechat_pay.jpg',
  alipay: 'qrcodes/alipay.jpg',
  qq: 'qrcodes/qq_pay.jpg',
}

const qrCodeUrl = computed(() => {
  const baseUrl = import.meta.env.BASE_URL || '/'
  if (payMethod.value === 'wechat') return baseUrl + 'payment/wechat.png'
  if (payMethod.value === 'alipay') return baseUrl + 'payment/alipay.jpg'
  return baseUrl + 'payment/qq.png'
})

const payMethodName = computed(() => {
  if (payMethod.value === 'wechat') return '微信支付'
  if (payMethod.value === 'alipay') return '支付宝'
  return 'QQ支付'
})

// 前端兜底套餐（后端返回空时使用）
const fallbackPackages: RechargePackage[] = [
  { id: 101, coinAmount: 100, price: 9.9, isRecommended: false, bonusCoins: 0 } as any,
  { id: 102, coinAmount: 300, price: 24.9, isRecommended: false, bonusCoins: 20 } as any,
  { id: 103, coinAmount: 500, price: 39.9, isRecommended: true, bonusCoins: 50 } as any,
  { id: 104, coinAmount: 1000, price: 69.9, isRecommended: false, bonusCoins: 150 } as any,
  { id: 105, coinAmount: 2000, price: 129, isRecommended: false, bonusCoins: 400 } as any,
  { id: 106, coinAmount: 5000, price: 299, isRecommended: false, bonusCoins: 1200 } as any,
]

onMounted(async () => {
  // 获取余额（静默）
  try {
    const balRes = await paymentApi.getBalance()
    coinBalance.value = balRes.data?.balance ?? 0
  } catch { coinBalance.value = 0 }

  await Promise.allSettled([loadSubscriptionInfo(), loadReferralInfo()])

  // 获取套餐（静默，失败用兜底数据）
  try {
    const pkgRes = await paymentApi.getPackages()
    packages.value = pkgRes.data || []
  } catch { packages.value = [] }

  // 后端套餐为空时使用前端兜底
  if (!packages.value.length) {
    packages.value = fallbackPackages
  }

  const recommended = packages.value.find((p: any) => p.isRecommended)
  if (recommended) selectedPkgId.value = recommended.id
  else if (packages.value.length) selectedPkgId.value = packages.value[0].id

  if (route.query.section === 'orders') {
    await openOrdersSection()
  }
})

async function loadSubscriptionInfo() {
  try {
    const [plansRes, statusRes] = await Promise.all([
      service.get('/payment/subscription/plans'),
      service.get('/payment/subscription/me')
    ])
    subscriptionPlans.value = plansRes.data.data || []
    subscriptionStatus.value = statusRes.data.data || { active: false }
  } catch {
    subscriptionPlans.value = [
      { id: 201, name: '月度成长会员', price: 29.9, dailyCoins: 30, totalCoins: 900, description: '每天自动送30圣力', isRecommended: true }
    ]
  }
}

async function loadReferralInfo() {
  try {
    const res = await service.get('/payment/referral/me')
    referralInfo.value = res.data.data || {}
  } catch {
    referralInfo.value = {}
  }
}

async function handleSubscribe(plan: any) {
  subscribing.value = true
  try {
    const res = await service.post('/payment/subscription/subscribe', {
      planId: plan.id,
      paymentMethod: payMethod.value
    })
    currentOrder.value = res.data.data.order
    showPayDialog.value = true
    ElMessage.success('会员订单已创建，请扫码付款后上传截图')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '创建会员订单失败')
  } finally {
    subscribing.value = false
  }
}

async function claimDailyCoins() {
  claimingDaily.value = true
  try {
    const res = await service.post('/payment/subscription/claim-daily')
    coinBalance.value = res.data.data.balance
    ElMessage.success(res.data.message || '领取成功')
    await loadSubscriptionInfo()
  } catch (e: any) {
    ElMessage.warning(e?.response?.data?.message || '今日暂不可领取')
  } finally {
    claimingDaily.value = false
  }
}

async function applyInviteCode() {
  if (!inviteCodeInput.value.trim()) return ElMessage.warning('请输入邀请码')
  applyingInvite.value = true
  try {
    const res = await service.post('/payment/referral/apply', { code: inviteCodeInput.value.trim() })
    coinBalance.value = res.data.data.balance
    inviteCodeInput.value = ''
    ElMessage.success(res.data.message || '邀请奖励已到账')
    await loadReferralInfo()
  } catch (e: any) {
    ElMessage.warning(e?.response?.data?.message || '邀请码领取失败')
  } finally {
    applyingInvite.value = false
  }
}

async function copyInviteCode() {
  if (!referralInfo.value.code) return
  await navigator.clipboard.writeText(referralInfo.value.code)
  ElMessage.success('邀请码已复制')
}

async function scrollToMemberSection() {
  await nextTick()
  memberSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function scrollToInviteSection() {
  await nextTick()
  inviteSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function handleRecharge() {
  if (!selectedPkgId.value) return ElMessage.warning('请选择充值套餐')
  recharging.value = true
  try {
    const res = await service.post('/payment/coin/recharge', {
      packageId: selectedPkgId.value,
      paymentMethod: payMethod.value
    })
    currentOrder.value = res.data.data.order
    showPayDialog.value = true
    ElMessage.success('订单已创建，请扫码付款后上传截图')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '创建订单失败')
  } finally {
    recharging.value = false
  }
}

function switchPayMethod(method: string) {
  payMethod.value = method
  if (currentOrder.value) {
    currentOrder.value.paymentMethod = method
  }
}

async function handleScreenshotUpload(file: any) {
  const rawFile = file.raw || file
  if (!rawFile) return

  uploading.value = true
  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      screenshotUrl.value = base64
      uploading.value = false
    }
    reader.onerror = () => {
      uploading.value = false
      ElMessage.error('读取图片失败')
    }
    reader.readAsDataURL(rawFile)
  } catch (e) {
    uploading.value = false
    ElMessage.error('上传失败')
  }
}

async function submitScreenshot() {
  if (!currentOrder.value || !screenshotUrl.value) return
  submitting.value = true
  try {
    const res = await service.post('/payment/coin/submit-screenshot', {
      orderId: currentOrder.value.id,
      screenshotUrl: screenshotUrl.value
    })
    // 后端已改为自动到账，检查返回
    if (res.data.code === 0) {
      ElMessage.success(` 充值成功！${currentOrder.value.coinAmount} 圣力已到账`)
      // 刷新余额
      const balRes = await paymentApi.getBalance()
      coinBalance.value = balRes.data.balance
    } else {
      ElMessage.success('截图已提交，等待管理员审核')
    }
    showPayDialog.value = false
    screenshotUrl.value = ''
    loadMyOrders()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

async function loadMyOrders() {
  try {
    const res = await service.get('/payment/coin/my-orders')
    myOrders.value = res.data.data.items || []
  } catch { /* ignore */ }
}

async function openOrdersSection() {
  showMyOrders.value = true
  await loadMyOrders()
  await nextTick()
  ordersSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(showMyOrders, (val) => {
  if (val && myOrders.value.length === 0) loadMyOrders()
})

watch(() => route.query.section, (section) => {
  if (section === 'orders') openOrdersSection()
})
</script>
