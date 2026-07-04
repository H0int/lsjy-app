<template>
  <div>
    <div class="cyber-grid-4 mb-4">
      <div class="cyber-stat-mini"><p class="stat-num text-green-400">{{ list.filter(c => c.status === 'active').length }}</p><p class="stat-lbl">进行中</p></div>
      <div class="cyber-stat-mini"><p class="stat-num text-cyan-400">{{ list.reduce((s, c) => s + c.participantCount, 0).toLocaleString() }}</p><p class="stat-lbl">总参与人次</p></div>
      <div class="cyber-stat-mini"><p class="stat-num text-amber-400">¥{{ list.reduce((s, c) => s + c.totalReward, 0).toLocaleString() }}</p><p class="stat-lbl">累计奖励</p></div>
      <div class="cyber-stat-mini"><p class="stat-num text-purple-400">{{ list.length }}</p><p class="stat-lbl">活动总数</p></div>
    </div>
    <div class="cyber-toolbar">
      <select v-model="filterStatus" class="cyber-select"><option value="">全部状态</option><option value="draft">草稿</option><option value="active">进行中</option><option value="ended">已结束</option><option value="paused">已暂停</option></select>
      <button @click="showDialog = true" class="cyber-btn cyber-btn-cyan">+ 创建活动</button>
    </div>
    <div class="space-y-4">
      <div v-for="item in filteredList" :key="item.id" class="cyber-card campaign-card">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="cyber-tag" :class="'tag-' + item.type">{{ campaignTypeLabel(item.type) }}</span>
              <span class="cyber-badge" :class="'badge-' + item.status">{{ campaignStatusLabel(item.status) }}</span>
            </div>
            <h3 class="font-semibold text-white mb-1">{{ item.name }}</h3>
            <p class="text-sm text-[#6a6a8a] mb-3">{{ item.description }}</p>
            <div class="cyber-grid-4 campaign-metrics">
              <div><p class="metric-label">参与人数</p><p class="metric-value">{{ item.participantCount.toLocaleString() }}</p></div>
              <div><p class="metric-label">奖励总额</p><p class="metric-value text-amber-400">¥{{ item.totalReward.toLocaleString() }}</p></div>
              <div><p class="metric-label">开始时间</p><p class="metric-time">{{ item.startTime }}</p></div>
              <div><p class="metric-label">结束时间</p><p class="metric-time">{{ item.endTime }}</p></div>
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <button v-if="item.status === 'draft'" @click="handleActivate(item)" class="cyber-btn-xs cyber-btn-green">上线</button>
            <button v-if="item.status === 'active'" @click="handlePause(item)" class="cyber-btn-xs cyber-btn-amber">暂停</button>
            <button v-if="item.status === 'paused'" @click="handleActivate(item)" class="cyber-btn-xs cyber-btn-green">恢复</button>
            <button @click="handleDelete(item)" class="cyber-btn-xs cyber-btn-magenta">删除</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showDialog" class="cyber-overlay">
      <div class="cyber-dialog">
        <h3 class="dialog-title">创建活动</h3>
        <div class="space-y-4">
          <div><label class="cyber-label">活动名称</label><input v-model="form.name" class="cyber-text-input w-full" /></div>
          <div><label class="cyber-label">描述</label><textarea v-model="form.description" rows="2" class="cyber-text-input w-full"></textarea></div>
          <div class="cyber-grid-2">
            <div><label class="cyber-label">类型</label><select v-model="form.type" class="cyber-select w-full"><option value="flash_sale">限时折扣</option><option value="check_in">签到奖励</option><option value="invite_reward">邀请返利</option><option value="coupon_event">优惠券活动</option></select></div>
            <div><label class="cyber-label">奖励金额</label><input v-model.number="form.totalReward" type="number" class="cyber-text-input w-full" /></div>
          </div>
          <div class="cyber-grid-2">
            <div><label class="cyber-label">开始时间</label><input v-model="form.startTime" type="datetime-local" class="cyber-text-input w-full" /></div>
            <div><label class="cyber-label">结束时间</label><input v-model="form.endTime" type="datetime-local" class="cyber-text-input w-full" /></div>
          </div>
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
import type { Campaign } from '@/types'
import { ElMessage } from 'element-plus'

const filterStatus = ref('')
const showDialog = ref(false)
const form = ref({ name: '', description: '', type: 'flash_sale', totalReward: 0, startTime: '', endTime: '' })
const list = ref<Campaign[]>([])

const filteredList = computed(() => {
  if (!filterStatus.value) return list.value
  return list.value.filter(c => c.status === filterStatus.value)
})

function campaignTypeLabel(t: string) { return { flash_sale: '限时折扣', check_in: '签到奖励', invite_reward: '邀请返利', coupon_event: '优惠券活动' }[t] || t }
function campaignStatusLabel(s: string) { return { draft: '草稿', active: '进行中', ended: '已结束', paused: '已暂停' }[s] || s }

async function fetchData() {
  const res = await adminApi.getCampaigns()
  list.value = res.data?.items || res.data || []
}

async function handleActivate(item: Campaign) {
  await adminApi.updateCoupon(item.id, { status: 'active' }) // reuse update
  ElMessage.success('已上线')
  fetchData()
}

async function handlePause(item: Campaign) {
  await adminApi.updateCoupon(item.id, { status: 'paused' })
  ElMessage.success('已暂停')
  fetchData()
}

async function handleDelete(item: Campaign) {
  if (!confirm(`确认删除活动「${item.name}」？`)) return
  await adminApi.deleteCampaign(item.id)
  ElMessage.success('已删除')
  fetchData()
}

async function handleCreate() {
  if (!form.value.name.trim()) { ElMessage.warning('请输入名称'); return }
  await adminApi.createCampaign({ ...form.value })
  ElMessage.success('活动已创建')
  showDialog.value = false
  fetchData()
}

onMounted(() => fetchData())
</script>

<style scoped>
.cyber-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.cyber-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.cyber-stat-mini { background: #12121f; border: 1px solid #1a1a2e; border-radius: 10px; padding: 16px; text-align: center; }
.stat-num { font-size: 24px; font-weight: 800; font-family: 'Courier New', monospace; }
.stat-lbl { font-size: 11px; color: #6a6a8a; margin-top: 4px; }
.cyber-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.cyber-card { background: #12121f; border: 1px solid #1a1a2e; border-radius: 12px; padding: 20px; transition: border-color 0.2s; }
.campaign-card:hover { border-color: #2a2a4e; }
.space-y-4 > * + * { margin-top: 16px; }
.cyber-select { background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #a0a0cc; outline: none; }
.cyber-select:focus { border-color: #00f0ff; }
.cyber-select option { background: #12121f; }
.cyber-btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.cyber-btn-cyan { background: rgba(0,240,255,0.1); color: #00f0ff; border-color: #00f0ff44; }
.cyber-btn-cyan:hover { background: rgba(0,240,255,0.2); box-shadow: 0 0 12px rgba(0,240,255,0.3); }
.cyber-btn-ghost { background: rgba(100,100,140,0.1); color: #8888aa; border-color: #2a2a4e; }
.cyber-btn-ghost:hover { color: #c0c0ff; }
.cyber-btn-xs { padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.cyber-btn-green { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }
.cyber-btn-green:hover { background: rgba(0,255,136,0.2); box-shadow: 0 0 8px rgba(0,255,136,0.3); }
.cyber-btn-amber { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
.cyber-btn-amber:hover { background: rgba(245,158,11,0.2); }
.cyber-btn-magenta { background: rgba(255,0,255,0.1); color: #ff00ff; border: 1px solid rgba(255,0,255,0.2); }
.cyber-btn-magenta:hover { background: rgba(255,0,255,0.2); box-shadow: 0 0 8px rgba(255,0,255,0.3); }
.cyber-tag { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
.tag-flash_sale { background: rgba(255,68,102,0.1); color: #ff4466; }
.tag-check_in { background: rgba(0,255,136,0.1); color: #00ff88; }
.tag-invite_reward { background: rgba(0,240,255,0.1); color: #00f0ff; }
.tag-coupon_event { background: rgba(124,58,237,0.1); color: #c084fc; }
.cyber-badge { padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-draft { background: rgba(100,100,140,0.1); color: #6a6a8a; border: 1px solid #2a2a4e; }
.badge-active { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }
.badge-ended { background: rgba(100,100,140,0.1); color: #4a4a6a; border: 1px solid #1a1a2e; }
.badge-paused { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
.campaign-metrics { margin-top: 0; }
.campaign-metrics > div { padding: 8px 0; }
.metric-label { font-size: 10px; color: #4a4a6a; }
.metric-value { font-size: 14px; font-weight: 700; color: #e0e0ff; font-family: 'Courier New', monospace; }
.metric-time { font-size: 12px; color: #6a6a8a; font-family: 'Courier New', monospace; }
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
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.ml-4 { margin-left: 16px; }
.gap-2 { gap: 8px; }
.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-between { justify-content: space-between; }
.font-semibold { font-weight: 600; }
.text-sm { font-size: 13px; }
.text-white { color: #fff; }
.text-green-400 { color: #00ff88; }
.text-cyan-400 { color: #00f0ff; }
.text-amber-400 { color: #f59e0b; }
.text-purple-400 { color: #c084fc; }
</style>
