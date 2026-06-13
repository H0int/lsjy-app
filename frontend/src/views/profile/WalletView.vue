<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <button @click="$router.back()" class="flex items-center gap-2 text-gray-500 hover:text-primary mb-4 transition-colors">
      <span>←</span><span>返回</span>
    </button>

    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">💰 圣点账户</h1>

    <!-- 余额卡片 -->
    <div class="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
      <div class="relative z-10">
        <p class="text-amber-100 text-sm">当前余额</p>
        <p class="text-4xl font-bold mt-1">{{ coinBalance }} <span class="text-lg font-normal">圣点</span></p>
      </div>
      <div class="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-20">⚡</div>
      <div class="mt-4 flex gap-3 relative z-10">
        <el-button type="warning" @click="showRecharge = true">充值</el-button>
        <el-button plain style="border-color: white; color: white;" @click="showTransactions = !showTransactions">
          {{ showTransactions ? '隐藏明细' : '消费明细' }}
        </el-button>
      </div>
    </div>

    <!-- 充值套餐 -->
    <div class="mb-6" v-if="showRecharge">
      <h3 class="font-bold text-gray-900 dark:text-white mb-3">充值套餐</h3>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div v-for="pkg in packages" :key="pkg.id"
          @click="selectedPkgId = pkg.id"
          class="bg-white dark:bg-dark-100 rounded-xl p-4 text-center cursor-pointer transition-all border-2 relative"
          :class="selectedPkgId === pkg.id ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-200'">
          <div v-if="pkg.isRecommended" class="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">推荐</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ pkg.coinAmount }}</div>
          <div class="text-xs text-gray-500 mt-1">圣点</div>
          <div class="text-sm font-bold text-primary mt-2">¥{{ pkg.price }}</div>
          <div v-if="pkg.bonusCoins" class="text-xs text-green-500 mt-1">送{{ pkg.bonusCoins }}圣点</div>
        </div>
      </div>
      <div class="mt-4 text-center">
        <el-button type="primary" size="large" :loading="recharging" @click="handleRecharge">
          确认充值
        </el-button>
      </div>
    </div>

    <!-- 交易记录 -->
    <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-sm" v-if="showTransactions">
      <h3 class="font-bold text-gray-900 dark:text-white mb-4">交易记录</h3>
      <div class="space-y-3">
        <div v-for="tx in transactions" :key="tx.id" class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              :class="tx.transactionType === 'recharge' ? 'bg-green-100' : 'bg-red-100'">
              {{ tx.transactionType === 'recharge' ? '💰' : '🔻' }}
            </div>
            <div>
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ tx.remark || tx.transactionType }}</div>
              <div class="text-xs text-gray-400">{{ formatDate(tx.createdAt) }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-bold" :class="tx.amount > 0 ? 'text-green-500' : 'text-red-500'">
              {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
            </div>
            <div class="text-xs text-gray-400">余额 {{ tx.balanceAfter }}</div>
          </div>
        </div>
        <div v-if="transactions.length === 0" class="text-center py-8 text-gray-400">暂无交易记录</div>
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
  // 获取余额
  const balRes = await paymentApi.getBalance()
  coinBalance.value = balRes.data.balance

  // 获取套餐
  const pkgRes = await paymentApi.getPackages()
  packages.value = pkgRes.data

  // 默认选中推荐套餐
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
    // 刷新余额
    const balRes = await paymentApi.getBalance()
    coinBalance.value = balRes.data.balance
  } catch {
    // 错误由拦截器处理
  } finally {
    recharging.value = false
  }
}

// 加载交易记录（用户点击时触发）
async function loadTransactions() {
  try {
    const res = await paymentApi.getTransactions()
    transactions.value = res.data.items
  } catch { /* ignore */ }
}

// watch showTransactions to lazy load
watch(showTransactions, (val) => {
  if (val && transactions.value.length === 0) loadTransactions()
})
</script>
