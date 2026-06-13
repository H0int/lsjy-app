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

    <!-- 余额卡片 - 赛博朋克风格 -->
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
        <el-button plain @click="showTransactions = !showTransactions"
          :style="{ borderColor: 'var(--cyber-amber)', color: 'var(--cyber-amber)' }">
          {{ showTransactions ? '隐藏明细' : '消费明细' }}
        </el-button>
      </div>
      <!-- 角落装饰 -->
      <div class="absolute top-0 right-0 w-16 h-16 opacity-20"
        style="border-top: 2px solid var(--cyber-amber); border-right: 2px solid var(--cyber-amber);"></div>
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

    <!-- 交易记录 -->
    <div class="cyber-card p-6" v-if="showTransactions">
      <h3 class="font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
        <span style="color: var(--cyber-purple);">▍</span>交易记录
      </h3>
      <div class="space-y-3">
        <div v-for="tx in transactions" :key="tx.id"
          class="flex items-center justify-between py-3"
          style="border-bottom: 1px solid var(--cyber-border);">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              :style="tx.transactionType === 'recharge'
                ? 'background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.2);'
                : 'background: rgba(255,0,100,0.1); border: 1px solid rgba(255,0,100,0.2);'">
              {{ tx.transactionType === 'recharge' ? '💰' : '🔻' }}
            </div>
            <div>
              <div class="text-sm font-medium" style="color: var(--cyber-text);">{{ tx.remark || tx.transactionType }}</div>
              <div class="text-xs" style="color: var(--cyber-text-dim);">{{ formatDate(tx.createdAt) }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-bold" :style="{ color: tx.amount > 0 ? 'var(--cyber-green)' : '#ff4466' }">
              {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
            </div>
            <div class="text-xs" style="color: var(--cyber-text-dim);">余额 {{ tx.balanceAfter }}</div>
          </div>
        </div>
        <div v-if="transactions.length === 0" class="text-center py-8" style="color: var(--cyber-text-dim);">暂无交易记录</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { paymentApi } from '@/api'
import { formatDate } from '@/utils'
import type { CoinTransaction, RechargePackage } from '@/types'
import { ElMessage } from 'element-plus'

const coinBalance = ref(0)
const showRecharge = ref(false)
const showTransactions = ref(false)
const selectedPkgId = ref<number | null>(null)
const recharging = ref(false)
const packages = ref<RechargePackage[]>([])
const transactions = ref<CoinTransaction[]>([])

onMounted(async () => {
  const balRes = await paymentApi.getBalance()
  coinBalance.value = balRes.data.balance

  const pkgRes = await paymentApi.getPackages()
  packages.value = pkgRes.data

  const recommended = pkgRes.data.find(p => p.isRecommended)
  if (recommended) selectedPkgId.value = recommended.id
  else if (pkgRes.data.length) selectedPkgId.value = pkgRes.data[0].id
})

async function handleRecharge() {
  if (!selectedPkgId.value) return ElMessage.warning('请选择充值套餐')
  recharging.value = true
  try {
    const res = await paymentApi.recharge(selectedPkgId.value)
    ElMessage.success(`充值订单已创建，订单号：${res.data.paymentTransaction.transactionNo}，金额：${res.data.paymentTransaction.amount}元`)
    const balRes = await paymentApi.getBalance()
    coinBalance.value = balRes.data.balance
  } catch {
  } finally {
    recharging.value = false
  }
}

async function loadTransactions() {
  try {
    const res = await paymentApi.getTransactions()
    transactions.value = res.data.items
  } catch { /* ignore */ }
}

watch(showTransactions, (val) => {
  if (val && transactions.value.length === 0) loadTransactions()
})
</script>
