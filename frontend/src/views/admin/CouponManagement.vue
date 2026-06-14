<template>
  <div>
    <div class="cyber-grid-4 mb-4">
      <div class="cyber-stat-mini">
        <p class="stat-lbl">有效优惠券</p>
        <p class="stat-num text-white">{{ list.filter(c => c.status === 'active').length }}</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-lbl">总发放量</p>
        <p class="stat-num text-cyan-400">{{ list.reduce((s, c) => s + c.totalQuantity, 0).toLocaleString() }}</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-lbl">已使用</p>
        <p class="stat-num text-green-400">{{ list.reduce((s, c) => s + c.usedQuantity, 0).toLocaleString() }}</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-lbl">使用率</p>
        <p class="stat-num text-amber-400">{{ usageRate }}%</p>
      </div>
    </div>

    <div class="cyber-toolbar">
      <select v-model="filterType" class="cyber-select">
        <option value="">全部类型</option>
        <option value="full_reduce">满减券</option>
        <option value="discount">折扣券</option>
        <option value="coin_gift">圣点赠送</option>
      </select>
      <button @click="showDialog = true" class="cyber-btn cyber-btn-cyan">+ 创建优惠券</button>
    </div>

    <div class="cyber-grid-2">
      <div v-for="coupon in list" :key="coupon.id" class="cyber-coupon-card">
        <div class="coupon-value-side" :class="'coupon-bg-' + coupon.type">
          <span class="coupon-value">{{ coupon.type === 'discount' ? coupon.discountValue + '折' : coupon.type === 'coin_gift' ? '+' + coupon.discountValue : '¥' + coupon.discountValue }}</span>
          <span class="coupon-type-label">{{ couponTypeLabel(coupon.type) }}</span>
        </div>
        <div class="coupon-info">
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-semibold text-white text-sm">{{ coupon.name }}</h3>
            <span class="cyber-badge" :class="coupon.status === 'active' ? 'badge-active' : coupon.status === 'paused' ? 'badge-paused' : 'badge-expired'">{{ couponStatusLabel(coupon.status) }}</span>
          </div>
          <p class="text-xs text-[#6a6a8a] mb-2">{{ coupon.minAmount > 0 ? '满¥' + coupon.minAmount + '可用' : '无门槛' }} | 发放规则: {{ issueRuleLabel(coupon.issueRule) }}</p>
          <div class="flex items-center justify-between">
            <div class="text-xs text-[#4a4a6a]">{{ coupon.usedQuantity }}/{{ coupon.totalQuantity }} 已领取</div>
            <div class="text-xs text-[#4a4a6a]">有效期至 {{ coupon.validTo }}</div>
          </div>
          <div class="cyber-progress mt-2">
            <div class="cyber-progress-fill" :style="{ width: (coupon.usedQuantity / coupon.totalQuantity * 100) + '%' }"></div>
          </div>
          <div class="flex gap-2 mt-3">
            <button @click="toggleStatus(coupon)" class="cyber-btn-xs" :class="coupon.status === 'active' ? 'cyber-btn-amber' : 'cyber-btn-green'">{{ coupon.status === 'active' ? '暂停' : '启用' }}</button>
            <button @click="handleDelete(coupon)" class="cyber-btn-xs cyber-btn-magenta">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDialog" class="cyber-overlay">
      <div class="cyber-dialog">
        <h3 class="dialog-title">创建优惠券</h3>
        <div class="space-y-4">
          <div><label class="cyber-label">名称</label><input v-model="form.name" class="cyber-text-input w-full" /></div>
          <div class="cyber-grid-2">
            <div><label class="cyber-label">类型</label><select v-model="form.type" class="cyber-select w-full"><option value="full_reduce">满减券</option><option value="discount">折扣券</option><option value="coin_gift">圣点赠送</option></select></div>
            <div><label class="cyber-label">面值</label><input v-model.number="form.discountValue" type="number" class="cyber-text-input w-full" /></div>
          </div>
          <div class="cyber-grid-2">
            <div><label class="cyber-label">发放总量</label><input v-model.number="form.totalQuantity" type="number" class="cyber-text-input w-full" /></div>
            <div><label class="cyber-label">最低消费</label><input v-model.number="form.minAmount" type="number" class="cyber-text-input w-full" /></div>
          </div>
          <div class="cyber-grid-2">
            <div><label class="cyber-label">生效时间</label><input v-model="form.validFrom" type="date" class="cyber-text-input w-full" /></div>
            <div><label class="cyber-label">过期时间</label><input v-model="form.validTo" type="date" class="cyber-text-input w-full" /></div>
          </div>
          <div><label class="cyber-label">发放规则</label><select v-model="form.issueRule" class="cyber-select w-full"><option value="new_user">新用户注册</option><option value="consume_threshold">消费满额</option><option value="activity">活动发放</option><option value="manual">手动发放</option></select></div>
        </div>
        <div class="dialog-footer">
          <button @click="showDialog = false" class="cyber-btn cyber-btn-ghost">取消</button>
          <button @click="handleCreate" class="cyber-btn cyber-btn-cyan">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api'
import type { Coupon } from '@/types'
import { ElMessage } from 'element-plus'

const filterType = ref('')
const showDialog = ref(false)
const form = ref({ name: '', type: 'full_reduce', discountValue: 10, minAmount: 0, totalQuantity: 1000, validFrom: '2025-07-20', validTo: '2025-08-20', issueRule: 'new_user' })
const list = ref<Coupon[]>([])

const usageRate = computed(() => {
  const total = list.value.reduce((s, c) => s + c.totalQuantity, 0)
  const used = list.value.reduce((s, c) => s + c.usedQuantity, 0)
  return total > 0 ? ((used / total) * 100).toFixed(1) : '0'
})

function couponTypeLabel(t: string) { return { full_reduce: '满减券', discount: '折扣券', coin_gift: '圣点赠送' }[t] || t }
function couponStatusLabel(s: string) { return { active: '生效中', paused: '已暂停', expired: '已过期' }[s] || s }
function issueRuleLabel(r: string) { return { new_user: '新用户', consume_threshold: '消费满额', activity: '活动发放', manual: '手动发放' }[r] || r }

async function fetchData() {
  const res = await adminApi.getCoupons()
  list.value = res.data
}

async function toggleStatus(c: Coupon) {
  const newStatus = c.status === 'active' ? 'paused' : 'active'
  await adminApi.updateCoupon(c.id, { status: newStatus })
  ElMessage.success(newStatus === 'paused' ? '已暂停' : '已启用')
  fetchData()
}

async function handleDelete(c: Coupon) {
  if (!confirm(`确认删除优惠券「${c.name}」？`)) return
  await adminApi.deleteCoupon(c.id)
  ElMessage.success('已删除')
  fetchData()
}

async function handleCreate() {
  if (!form.value.name.trim()) { ElMessage.warning('请输入名称'); return }
  await adminApi.createCoupon({ ...form.value })
  ElMessage.success('优惠券已创建')
  showDialog.value = false
  fetchData()
}

onMounted(() => fetchData())
</script>

<style scoped>
.cyber-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.cyber-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.cyber-stat-mini { background: #12121f; border: 1px solid #1a1a2e; border-radius: 10px; padding: 16px; text-align: center; }
.stat-num { font-size: 24px; font-weight: 800; font-family: 'Courier New', monospace; margin-top: 4px; }
.stat-lbl { font-size: 11px; color: #6a6a8a; }
.cyber-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.cyber-select { background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #a0a0cc; outline: none; }
.cyber-select:focus { border-color: #00f0ff; }
.cyber-select option { background: #12121f; }
.cyber-btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.cyber-btn-cyan { background: rgba(0,240,255,0.1); color: #00f0ff; border-color: #00f0ff44; }
.cyber-btn-cyan:hover { background: rgba(0,240,255,0.2); box-shadow: 0 0 12px rgba(0,240,255,0.3); }
.cyber-btn-ghost { background: rgba(100,100,140,0.1); color: #8888aa; border-color: #2a2a4e; }
.cyber-btn-ghost:hover { color: #c0c0ff; }
.cyber-btn-xs { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.cyber-btn-green { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }
.cyber-btn-green:hover { background: rgba(0,255,136,0.2); box-shadow: 0 0 8px rgba(0,255,136,0.3); }
.cyber-btn-amber { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
.cyber-btn-amber:hover { background: rgba(245,158,11,0.2); }
.cyber-btn-magenta { background: rgba(255,0,255,0.1); color: #ff00ff; border: 1px solid rgba(255,0,255,0.2); }
.cyber-btn-magenta:hover { background: rgba(255,0,255,0.2); box-shadow: 0 0 8px rgba(255,0,255,0.3); }
.cyber-coupon-card { background: #12121f; border: 1px solid #1a1a2e; border-radius: 12px; overflow: hidden; display: flex; transition: border-color 0.2s; }
.cyber-coupon-card:hover { border-color: #2a2a4e; }
.coupon-value-side { width: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
.coupon-bg-full_reduce { background: linear-gradient(135deg, #ff4466, #f59e0b); }
.coupon-bg-discount { background: linear-gradient(135deg, #7c3aed, #00f0ff); }
.coupon-bg-coin_gift { background: linear-gradient(135deg, #00ff88, #00f0ff); }
.coupon-value { font-size: 22px; font-weight: 800; color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.3); }
.coupon-type-label { font-size: 10px; color: rgba(255,255,255,0.7); margin-top: 4px; }
.coupon-info { flex: 1; padding: 16px; }
.cyber-badge { padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-active { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }
.badge-paused { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
.badge-expired { background: rgba(100,100,140,0.1); color: #6a6a8a; border: 1px solid #2a2a4e; }
.cyber-progress { height: 4px; background: #1a1a2e; border-radius: 2px; overflow: hidden; }
.cyber-progress-fill { height: 100%; background: linear-gradient(90deg, #00f0ff, #7c3aed); border-radius: 2px; transition: width 0.3s; }
.cyber-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; }
.cyber-dialog { background: #12121f; border: 1px solid #1a1a2e; border-radius: 16px; padding: 24px; width: 100%; max-width: 520px; }
.dialog-title { font-size: 18px; font-weight: 700; color: #e0e0ff; margin-bottom: 20px; }
.cyber-label { display: block; font-size: 12px; color: #6a6a8a; margin-bottom: 6px; }
.cyber-text-input { background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #e0e0ff; outline: none; }
.cyber-text-input:focus { border-color: #00f0ff; }
.cyber-text-input::placeholder { color: #4a4a6a; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.space-y-4 > * + * { margin-top: 16px; }
.w-full { width: 100%; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mb-4 { margin-bottom: 16px; }
.gap-2 { gap: 8px; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.font-semibold { font-weight: 600; }
.text-sm { font-size: 13px; }
.text-xs { font-size: 11px; }
.text-white { color: #fff; }
.text-cyan-400 { color: #00f0ff; }
.text-green-400 { color: #00ff88; }
.text-amber-400 { color: #f59e0b; }
</style>
