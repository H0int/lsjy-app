<template>
  <div>
    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4 mb-4">
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">有效优惠券</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ list.filter(c => c.status === 'active').length }}</p>
      </div>
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">总发放量</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ list.reduce((s, c) => s + c.totalQuantity, 0).toLocaleString() }}</p>
      </div>
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">已使用</p>
        <p class="text-2xl font-bold text-green-600 mt-1">{{ list.reduce((s, c) => s + c.usedQuantity, 0).toLocaleString() }}</p>
      </div>
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">使用率</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">{{ usageRate }}%</p>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-3">
        <select v-model="filterType" class="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200">
          <option value="">全部类型</option>
          <option value="full_reduce">满减券</option>
          <option value="discount">折扣券</option>
          <option value="coin_gift">圣力赠送</option>
        </select>
      </div>
      <button @click="showDialog = true" class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">+ 创建优惠券</button>
    </div>

    <!-- 优惠券列表 -->
    <div class="grid md:grid-cols-2 gap-4">
      <div v-for="coupon in list" :key="coupon.id" class="bg-white dark:bg-dark-100 rounded-xl shadow-sm overflow-hidden">
        <div class="flex">
          <div class="w-28 flex flex-col items-center justify-center text-white" :class="couponTypeBg(coupon.type)">
            <span class="text-2xl font-bold">{{ coupon.type === 'discount' ? coupon.discountValue + '折' : coupon.type === 'coin_gift' ? '+' + coupon.discountValue : '¥' + coupon.discountValue }}</span>
            <span class="text-xs opacity-80 mt-1">{{ couponTypeLabel(coupon.type) }}</span>
          </div>
          <div class="flex-1 p-4">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-semibold text-gray-900 dark:text-white text-sm">{{ coupon.name }}</h3>
              <span class="px-2 py-0.5 rounded-full text-xs" :class="coupon.status === 'active' ? 'bg-green-100 text-green-700' : coupon.status === 'paused' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'">{{ couponStatusLabel(coupon.status) }}</span>
            </div>
            <p class="text-xs text-gray-500 mb-2">{{ coupon.minAmount > 0 ? '满¥' + coupon.minAmount + '可用' : '无门槛' }} | 发放规则: {{ issueRuleLabel(coupon.issueRule) }}</p>
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-400">{{ coupon.usedQuantity }}/{{ coupon.totalQuantity }} 已领取</div>
              <div class="text-xs text-gray-400">有效期至 {{ coupon.validTo }}</div>
            </div>
            <div class="mt-2 h-1.5 bg-gray-100 dark:bg-dark-300 rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full" :style="{ width: (coupon.usedQuantity / coupon.totalQuantity * 100) + '%' }"></div>
            </div>
            <div class="flex gap-2 mt-3">
              <button @click="toggleStatus(coupon)" class="px-3 py-1 text-xs rounded-lg" :class="coupon.status === 'active' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'">{{ coupon.status === 'active' ? '暂停' : '启用' }}</button>
              <button @click="handleDelete(coupon)" class="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建弹窗 -->
    <div v-if="showDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">创建优惠券</h3>
        <div class="space-y-4">
          <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">名称</label><input v-model="form.name" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" /></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">类型</label><select v-model="form.type" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200"><option value="full_reduce">满减券</option><option value="discount">折扣券</option><option value="coin_gift">圣力赠送</option></select></div>
            <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">面值</label><input v-model.number="form.discountValue" type="number" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" /></div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">发放总量</label><input v-model.number="form.totalQuantity" type="number" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" /></div>
            <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">最低消费</label><input v-model.number="form.minAmount" type="number" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" /></div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">生效时间</label><input v-model="form.validFrom" type="date" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" /></div>
            <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">过期时间</label><input v-model="form.validTo" type="date" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" /></div>
          </div>
          <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">发放规则</label><select v-model="form.issueRule" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200"><option value="new_user">新用户注册</option><option value="consume_threshold">消费满额</option><option value="activity">活动发放</option><option value="manual">手动发放</option></select></div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showDialog = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">取消</button>
          <button @click="handleCreate" class="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Coupon } from '@/types'

const filterType = ref('')
const showDialog = ref(false)
const form = ref({ name: '', type: 'full_reduce', discountValue: 10, minAmount: 0, totalQuantity: 1000, validFrom: '2025-07-20', validTo: '2025-08-20', issueRule: 'new_user' })

const list = ref<Coupon[]>([
  { id: 1, name: '新用户满50减10', type: 'full_reduce', discountValue: 10, minAmount: 50, maxReduce: null, totalQuantity: 5000, usedQuantity: 3280, validFrom: '2025-07-01', validTo: '2025-08-31', issueRule: 'new_user', status: 'active', createdAt: '2025-07-01 00:00' },
  { id: 2, name: '暑期8折优惠券', type: 'discount', discountValue: 8, minAmount: 100, maxReduce: 50, totalQuantity: 2000, usedQuantity: 856, validFrom: '2025-07-15', validTo: '2025-08-15', issueRule: 'activity', status: 'active', createdAt: '2025-07-15 10:00' },
  { id: 3, name: '充值赠送100圣力', type: 'coin_gift', discountValue: 100, minAmount: 200, maxReduce: null, totalQuantity: 1000, usedQuantity: 423, validFrom: '2025-07-01', validTo: '2025-07-31', issueRule: 'consume_threshold', status: 'active', createdAt: '2025-07-01 00:00' },
  { id: 4, name: 'VIP专属9折券', type: 'discount', discountValue: 9, minAmount: 0, maxReduce: 30, totalQuantity: 500, usedQuantity: 120, validFrom: '2025-06-01', validTo: '2025-06-30', issueRule: 'manual', status: 'expired', createdAt: '2025-06-01 00:00' },
])

const usageRate = computed(() => {
  const total = list.value.reduce((s, c) => s + c.totalQuantity, 0)
  const used = list.value.reduce((s, c) => s + c.usedQuantity, 0)
  return total > 0 ? ((used / total) * 100).toFixed(1) : '0'
})

function couponTypeLabel(t: string) { return { full_reduce: '满减券', discount: '折扣券', coin_gift: '圣力赠送' }[t] || t }
function couponTypeBg(t: string) { return { full_reduce: 'bg-gradient-to-br from-red-500 to-orange-500', discount: 'bg-gradient-to-br from-blue-500 to-purple-500', coin_gift: 'bg-gradient-to-br from-green-500 to-teal-500' }[t] || 'bg-gray-500' }
function couponStatusLabel(s: string) { return { active: '生效中', paused: '已暂停', expired: '已过期' }[s] || s }
function issueRuleLabel(r: string) { return { new_user: '新用户', consume_threshold: '消费满额', activity: '活动发放', manual: '手动发放' }[r] || r }
function toggleStatus(c: Coupon) { c.status = c.status === 'active' ? 'paused' : 'active' }
function handleDelete(c: Coupon) { const i = list.value.findIndex(x => x.id === c.id); if (i >= 0) list.value.splice(i, 1) }
function handleCreate() {
  list.value.unshift({ id: Date.now(), name: form.value.name, type: form.value.type as any, discountValue: form.value.discountValue, minAmount: form.value.minAmount, maxReduce: null, totalQuantity: form.value.totalQuantity, usedQuantity: 0, validFrom: form.value.validFrom, validTo: form.value.validTo, issueRule: form.value.issueRule as any, status: 'active', createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ') })
  showDialog.value = false
}
</script>
