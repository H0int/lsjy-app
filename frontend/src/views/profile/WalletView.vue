<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <button @click="$router.back()" class="flex items-center gap-2 mb-4 transition-colors"
      style="color: var(--cyber-text-dim);"
      @mouseover="($event.currentTarget as HTMLElement).style.color='var(--cyber-cyan)'"
      @mouseleave="($event.currentTarget as HTMLElement).style.color='var(--cyber-text-dim)'">
      <span>←</span><span>返回</span>
    </button>

    <h1 class="text-2xl font-bold mb-6" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
      <span style="color: var(--cyber-amber);">▍</span>圣点账户
    </h1>

    <!-- 余额卡片 -->
    <div class="relative rounded-2xl p-6 mb-6 overflow-hidden cyber-scanline"
      style="background: linear-gradient(135deg, rgba(255,184,0,0.08), rgba(124,58,237,0.1), rgba(255,0,255,0.06)); border: 1px solid rgba(255,184,0,0.3);">
      <div class="relative z-10">
        <p class="text-sm" style="color: var(--cyber-amber); opacity: 0.8;">当前余额</p>
        <p class="text-4xl font-bold mt-1 glow-cyan" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">
          {{ coinBalance }} <span class="text-lg font-normal" style="color: var(--cyber-text-dim);">圣点</span>
        </p>
      </div>
      <div class="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-15" style="filter: drop-shadow(0 0 10px rgba(255,184,0,0.5));">⚡</div>
      <div class="mt-4 flex gap-3 relative z-10 flex-wrap">
        <el-button type="warning" @click="showRecharge = true" style="min-width: 80px;">充值</el-button>
        <el-button plain @click="showMyOrders = !showMyOrders"
          :style="{ borderColor: 'var(--cyber-green)', color: 'var(--cyber-green)' }">
          {{ showMyOrders ? '隐藏订单' : '我的订单' }}
        </el-button>
      </div>
    </div>

    <!-- 充值套餐 -->
    <div class="mb-6" v-if="showRecharge">
      <h3 class="font-bold mb-3" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
        <span style="color: var(--cyber-green);">▍</span>充值套餐
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div v-for="pkg in packages" :key="pkg.id"
          @click="selectedPkgId = pkg.id"
          class="cyber-card p-4 text-center cursor-pointer transition-all duration-300"
          :style="selectedPkgId === pkg.id
            ? 'border-color: var(--cyber-cyan); box-shadow: 0 0 15px rgba(0,240,255,0.2);'
            : ''">
          <div v-if="pkg.isRecommended" class="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-white text-xs rounded-full"
            style="background: linear-gradient(135deg, var(--cyber-magenta), var(--cyber-purple));">推荐</div>
          <div class="text-2xl font-bold" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">{{ pkg.coinAmount }}</div>
          <div class="text-xs mt-1" style="color: var(--cyber-text-dim);">圣点</div>
          <div class="text-sm font-bold mt-2" style="color: var(--cyber-amber);">¥{{ pkg.price }}</div>
          <div v-if="pkg.bonusCoins" class="text-xs mt-1" style="color: var(--cyber-green);">送{{ pkg.bonusCoins }}圣点</div>
        </div>
      </div>
      <div class="mt-4 text-center">
        <el-button type="primary" size="large" :loading="recharging" @click="handleRecharge">
          确认充值
        </el-button>
      </div>
    </div>

    <!-- 支付二维码弹窗 -->
    <el-dialog v-model="showPayDialog" title="扫码支付" width="400px" :close-on-click-modal="false">
      <div class="text-center mb-4">
        <p class="text-lg font-bold mb-2" style="color: var(--cyber-text);">订单金额：<span style="color: var(--cyber-amber);">¥{{ currentOrder?.price }}</span></p>
        <p class="text-sm" style="color: var(--cyber-text-dim);">获得 {{ currentOrder?.coinAmount }} 圣点</p>
      </div>
      
      <!-- 支付方式选择 -->
      <div class="flex justify-center gap-4 mb-4">
        <div @click="switchPayMethod('wechat')" class="cursor-pointer p-3 rounded-lg transition-all"
          :style="payMethod === 'wechat' ? 'background: rgba(7,193,96,0.1); border: 2px solid #07C160;' : 'border: 2px solid transparent;'">
          <div class="text-2xl">💚</div>
          <div class="text-xs mt-1">微信</div>
        </div>
        <div @click="switchPayMethod('alipay')" class="cursor-pointer p-3 rounded-lg transition-all"
          :style="payMethod === 'alipay' ? 'background: rgba(0,160,255,0.1); border: 2px solid #00A0FF;' : 'border: 2px solid transparent;'">
          <div class="text-2xl">💙</div>
          <div class="text-xs mt-1">支付宝</div>
        </div>
        <div @click="switchPayMethod('qq')" class="cursor-pointer p-3 rounded-lg transition-all"
          :style="payMethod === 'qq' ? 'background: rgba(18,183,245,0.1); border: 2px solid #12B7F5;' : 'border: 2px solid transparent;'">
          <div class="text-2xl">🐧</div>
          <div class="text-xs mt-1">QQ</div>
        </div>
      </div>

      <!-- 二维码显示 -->
      <div class="flex justify-center mb-4">
        <div class="w-64 h-64 rounded-lg overflow-hidden" style="border: 2px solid var(--cyber-border);">
          <img :src="qrCodeUrl" class="w-full h-full object-contain" alt="收款二维码" />
        </div>
      </div>

      <div class="text-center text-sm mb-4" style="color: var(--cyber-text-dim);">
        请使用{{ payMethodName }}扫描上方二维码完成支付
      </div>

      <!-- 上传付款截图 -->
      <div class="border-t pt-4" style="border-color: var(--cyber-border);">
        <p class="text-sm font-bold mb-2" style="color: var(--cyber-text);">上传付款截图</p>
        <el-upload
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          accept="image/*"
          @change="handleScreenshotUpload">
          <el-button type="primary" :loading="uploading">
            {{ uploading ? '上传中...' : '选择图片' }}
          </el-button>
        </el-upload>
        <p v-if="screenshotUrl" class="text-xs mt-2" style="color: var(--cyber-green);">✓ 截图已上传</p>
      </div>

      <template #footer>
        <el-button @click="showPayDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!screenshotUrl" :loading="submitting" @click="submitScreenshot">
          提交审核
        </el-button>
      </template>
    </el-dialog>

    <!-- 我的订单 -->
    <div class="cyber-card p-6" v-if="showMyOrders">
      <h3 class="font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
        <span style="color: var(--cyber-green);">▍</span>我的充值订单
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
              <div class="text-sm font-medium" style="color: var(--cyber-text);">{{ order.coinAmount }} 圣点</div>
              <div class="text-xs" style="color: var(--cyber-text-dim);">{{ formatDate(order.createdAt) }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-bold" style="color: var(--cyber-amber);">¥{{ order.price }}</div>
            <div class="text-xs" :style="{
              color: order.status === 'approved' ? 'var(--cyber-green)' : order.status === 'rejected' ? '#ff4466' : 'var(--cyber-amber)'
            }">
              {{ order.status === 'approved' ? '已通过' : order.status === 'rejected' ? '已拒绝' : order.status === 'pending_review' ? '审核中' : '待付款' }}
            </div>
          </div>
        </div>
        <div v-if="myOrders.length === 0" class="text-center py-8" style="color: var(--cyber-text-dim);">暂无订单</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { paymentApi } from '@/api'
import { formatDate } from '@/utils'
import type { RechargePackage } from '@/types'
import { ElMessage } from 'element-plus'
import service from '@/api/request'

const coinBalance = ref(0)
const showRecharge = ref(false)
const showMyOrders = ref(false)
const selectedPkgId = ref<number | null>(null)
const recharging = ref(false)
const packages = ref<RechargePackage[]>([])
const myOrders = ref<any[]>([])

// 支付弹窗相关
const showPayDialog = ref(false)
const currentOrder = ref<any>(null)
const payMethod = ref('wechat')
const screenshotUrl = ref('')
const uploading = ref(false)
const submitting = ref(false)

const qrCodeUrl = computed(() => {
  const baseUrl = import.meta.env.BASE_URL || '/'
  if (payMethod.value === 'wechat') return baseUrl + 'qrcodes/wechat_pay.jpg'
  if (payMethod.value === 'alipay') return baseUrl + 'qrcodes/alipay.jpg'
  return baseUrl + 'assets/pay/alipay_qr.png'
})

const payMethodName = computed(() => {
  if (payMethod.value === 'wechat') return '微信'
  if (payMethod.value === 'alipay') return '支付宝'
  return 'QQ'
})

onMounted(async () => {
  const balRes = await paymentApi.getBalance()
  coinBalance.value = balRes.data.balance

  const pkgRes = await paymentApi.getPackages()
  packages.value = pkgRes.data

  const recommended = pkgRes.data.find((p: any) => p.isRecommended)
  if (recommended) selectedPkgId.value = recommended.id
  else if (pkgRes.data.length) selectedPkgId.value = pkgRes.data[0].id
})

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
    ElMessage.success('订单已创建，请扫码付款')
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
    await service.post('/payment/coin/submit-screenshot', {
      orderId: currentOrder.value.id,
      screenshotUrl: screenshotUrl.value
    })
    ElMessage.success('截图已提交，等待管理员审核')
    showPayDialog.value = false
    screenshotUrl.value = ''
    // 刷新订单列表
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

watch(showMyOrders, (val) => {
  if (val && myOrders.value.length === 0) loadMyOrders()
})
</script>
