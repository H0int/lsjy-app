<template>
  <div>
    <!-- 统计 -->
    <div class="grid grid-cols-4 gap-4 mb-4">
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm text-center">
        <p class="text-2xl font-bold text-green-500">{{ list.filter(c => c.status === 'active').length }}</p>
        <p class="text-xs text-gray-500 mt-1">进行中</p>
      </div>
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm text-center">
        <p class="text-2xl font-bold text-blue-500">{{ list.reduce((s, c) => s + c.participantCount, 0).toLocaleString() }}</p>
        <p class="text-xs text-gray-500 mt-1">总参与人次</p>
      </div>
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm text-center">
        <p class="text-2xl font-bold text-amber-500">¥{{ list.reduce((s, c) => s + c.totalReward, 0).toLocaleString() }}</p>
        <p class="text-xs text-gray-500 mt-1">累计奖励</p>
      </div>
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm text-center">
        <p class="text-2xl font-bold text-purple-500">{{ list.length }}</p>
        <p class="text-xs text-gray-500 mt-1">活动总数</p>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-3">
        <select v-model="filterStatus" class="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200">
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="active">进行中</option>
          <option value="ended">已结束</option>
          <option value="paused">已暂停</option>
        </select>
      </div>
      <button @click="showDialog = true" class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">+ 创建活动</button>
    </div>

    <!-- 活动列表 -->
    <div class="space-y-4">
      <div v-for="item in list" :key="item.id" class="bg-white dark:bg-dark-100 rounded-xl p-5 shadow-sm">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2 py-0.5 rounded text-xs font-medium" :class="campaignTypeClass(item.type)">{{ campaignTypeLabel(item.type) }}</span>
              <span class="px-2 py-0.5 rounded-full text-xs" :class="campaignStatusClass(item.status)">{{ campaignStatusLabel(item.status) }}</span>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">{{ item.name }}</h3>
            <p class="text-sm text-gray-500 mb-3">{{ item.description }}</p>
            <div class="grid grid-cols-4 gap-4">
              <div><p class="text-xs text-gray-400">参与人数</p><p class="font-semibold text-gray-800 dark:text-gray-200">{{ item.participantCount.toLocaleString() }}</p></div>
              <div><p class="text-xs text-gray-400">奖励总额</p><p class="font-semibold text-gray-800 dark:text-gray-200">¥{{ item.totalReward.toLocaleString() }}</p></div>
              <div><p class="text-xs text-gray-400">开始时间</p><p class="text-sm text-gray-600 dark:text-gray-400">{{ item.startTime }}</p></div>
              <div><p class="text-xs text-gray-400">结束时间</p><p class="text-sm text-gray-600 dark:text-gray-400">{{ item.endTime }}</p></div>
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <button v-if="item.status === 'draft'" @click="item.status = 'active'" class="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs">上线</button>
            <button v-if="item.status === 'active'" @click="item.status = 'paused'" class="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs">暂停</button>
            <button v-if="item.status === 'paused'" @click="item.status = 'active'" class="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs">恢复</button>
            <button @click="handleDelete(item)" class="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建弹窗 -->
    <div v-if="showDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">创建活动</h3>
        <div class="space-y-4">
          <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">活动名称</label><input v-model="form.name" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" /></div>
          <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">描述</label><textarea v-model="form.description" rows="2" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200"></textarea></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">类型</label><select v-model="form.type" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200"><option value="flash_sale">限时折扣</option><option value="check_in">签到奖励</option><option value="invite_reward">邀请返利</option><option value="coupon_event">优惠券活动</option></select></div>
            <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">奖励金额</label><input v-model.number="form.totalReward" type="number" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" /></div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">开始时间</label><input v-model="form.startTime" type="datetime-local" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" /></div>
            <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">结束时间</label><input v-model="form.endTime" type="datetime-local" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" /></div>
          </div>
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
import { ref } from 'vue'
import type { Campaign } from '@/types'

const filterStatus = ref('')
const showDialog = ref(false)
const form = ref({ name: '', description: '', type: 'flash_sale', totalReward: 0, startTime: '', endTime: '' })

const list = ref<Campaign[]>([
  { id: 1, name: '暑期充值大返利', type: 'flash_sale', description: '暑期限时充值返利活动，充值满200返30，满500返100', startTime: '2025-07-20 00:00', endTime: '2025-08-20 23:59', participantCount: 2340, totalReward: 56000, status: 'active', config: {}, createdAt: '2025-07-15 10:00' },
  { id: 2, name: '每日签到领圣点', type: 'check_in', description: '连续签到7天可获得50圣点奖励，连续30天获得300圣点', startTime: '2025-07-01 00:00', endTime: '2025-09-30 23:59', participantCount: 8920, totalReward: 123000, status: 'active', config: {}, createdAt: '2025-06-28 14:00' },
  { id: 3, name: '邀请好友得奖励', type: 'invite_reward', description: '每邀请一位新用户注册并完成首充，双方各得20圣点', startTime: '2025-07-01 00:00', endTime: '2025-12-31 23:59', participantCount: 1560, totalReward: 31200, status: 'active', config: {}, createdAt: '2025-06-25 09:00' },
  { id: 4, name: '618大促', type: 'flash_sale', description: '618限时折扣，全场AI工具8折', startTime: '2025-06-18 00:00', endTime: '2025-06-20 23:59', participantCount: 15600, totalReward: 280000, status: 'ended', config: {}, createdAt: '2025-06-10 10:00' },
])

function campaignTypeLabel(t: string) { return { flash_sale: '限时折扣', check_in: '签到奖励', invite_reward: '邀请返利', coupon_event: '优惠券活动' }[t] || t }
function campaignTypeClass(t: string) { return { flash_sale: 'bg-red-100 text-red-700', check_in: 'bg-green-100 text-green-700', invite_reward: 'bg-blue-100 text-blue-700', coupon_event: 'bg-purple-100 text-purple-700' }[t] || '' }
function campaignStatusLabel(s: string) { return { draft: '草稿', active: '进行中', ended: '已结束', paused: '已暂停' }[s] || s }
function campaignStatusClass(s: string) { return { draft: 'bg-gray-100 text-gray-600', active: 'bg-green-100 text-green-700', ended: 'bg-gray-200 text-gray-500', paused: 'bg-amber-100 text-amber-700' }[s] || '' }
function handleDelete(item: Campaign) { const i = list.value.findIndex(x => x.id === item.id); if (i >= 0) list.value.splice(i, 1) }
function handleCreate() {
  list.value.unshift({ id: Date.now(), name: form.value.name, type: form.value.type as any, description: form.value.description, startTime: form.value.startTime, endTime: form.value.endTime, participantCount: 0, totalReward: form.value.totalReward, status: 'draft', config: {}, createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ') })
  showDialog.value = false
}
</script>
