<template>
  <div>
    <!-- 操作栏 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-3">
        <select v-model="filterType" class="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200">
          <option value="">全部类型</option>
          <option value="system">系统通知</option>
          <option value="activity">活动公告</option>
          <option value="update">模块更新</option>
        </select>
        <select v-model="filterStatus" class="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200">
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="scheduled">定时发布</option>
          <option value="published">已发布</option>
          <option value="archived">已归档</option>
        </select>
      </div>
      <button @click="showDialog = true" class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 flex items-center gap-1">+ 发布公告</button>
    </div>

    <!-- 公告列表 -->
    <div class="space-y-3">
      <div v-for="item in list" :key="item.id" class="bg-white dark:bg-dark-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2 py-0.5 rounded text-xs font-medium" :class="typeClass(item.type)">{{ typeLabel(item.type) }}</span>
              <span class="px-2 py-0.5 rounded-full text-xs" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
              <span class="text-xs text-gray-400">推送: {{ scopeLabel(item.targetScope) }}</span>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">{{ item.title }}</h3>
            <p class="text-sm text-gray-500 line-clamp-2">{{ item.content }}</p>
            <div class="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span>创建: {{ item.createdAt }}</span>
              <span v-if="item.scheduledAt">定时: {{ item.scheduledAt }}</span>
              <span v-if="item.publishedAt">发布: {{ item.publishedAt }}</span>
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <button v-if="item.status === 'draft'" @click="handlePublish(item)" class="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs hover:bg-green-200">发布</button>
            <button @click="handleEdit(item)" class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 dark:bg-dark-300 dark:text-gray-300">编辑</button>
            <button @click="handleDelete(item)" class="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200">删除</button>
          </div>
        </div>
      </div>
      <div v-if="list.length === 0" class="text-center py-12 text-gray-400 bg-white dark:bg-dark-100 rounded-xl">暂无公告</div>
    </div>

    <!-- 新建/编辑弹窗 -->
    <div v-if="showDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">{{ editingId ? '编辑公告' : '发布公告' }}</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">标题</label>
            <input v-model="form.title" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" placeholder="公告标题" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">内容</label>
            <textarea v-model="form.content" rows="4" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" placeholder="公告内容"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">类型</label>
              <select v-model="form.type" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200">
                <option value="system">系统通知</option>
                <option value="activity">活动公告</option>
                <option value="update">模块更新</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">推送范围</label>
              <select v-model="form.targetScope" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200">
                <option value="all">全部用户</option>
                <option value="personal">个人版用户</option>
                <option value="merchant">商户版用户</option>
                <option value="enterprise">企业版用户</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">定时发布（可选）</label>
            <input v-model="form.scheduledAt" type="datetime-local" class="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showDialog = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:bg-dark-300 dark:text-gray-300">取消</button>
          <button @click="handleSave" class="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Announcement } from '@/types'

const filterType = ref('')
const filterStatus = ref('')
const showDialog = ref(false)
const editingId = ref<number | null>(null)

const form = ref({ title: '', content: '', type: 'system', targetScope: 'all', scheduledAt: '' })

const list = ref<Announcement[]>([
  { id: 1, title: '平台v3.0版本升级通知', content: '尊敬的用户，平台将于本周六凌晨2:00-6:00进行系统升级维护，届时部分功能可能暂时不可用。本次升级新增了AI工具批量处理、自媒体数据分析等功能。', type: 'system', targetScope: 'all', status: 'published', scheduledAt: null, publishedAt: '2025-07-15 08:00', createdBy: 1, createdAt: '2025-07-14 16:00', updatedAt: '2025-07-15 08:00' },
  { id: 2, title: '暑期大促：圣点充值8折优惠', content: '暑期限时活动，7月20日至8月20日期间，所有充值套餐享受8折优惠！充值满500圣点额外赠送50圣点。', type: 'activity', targetScope: 'all', status: 'published', scheduledAt: null, publishedAt: '2025-07-18 10:00', createdBy: 1, createdAt: '2025-07-17 14:00', updatedAt: '2025-07-18 10:00' },
  { id: 3, title: '自媒体模块新增小红书数据分析', content: '自媒体模块已支持小红书平台数据接入，创作者可以一站式管理小红书内容并查看数据分析。', type: 'update', targetScope: 'all', status: 'scheduled', scheduledAt: '2025-07-20 09:00', publishedAt: null, createdBy: 1, createdAt: '2025-07-18 11:00', updatedAt: '2025-07-18 11:00' },
  { id: 4, title: '电商模块商家入驻规则调整', content: '为提升平台商品质量，自8月1日起，新入驻商家需提供营业执照及相关资质证明。', type: 'system', targetScope: 'merchant', status: 'draft', scheduledAt: null, publishedAt: null, createdBy: 1, createdAt: '2025-07-18 15:00', updatedAt: '2025-07-18 15:00' },
])

function typeLabel(t: string) { return { system: '系统通知', activity: '活动公告', update: '模块更新' }[t] || t }
function typeClass(t: string) { return { system: 'bg-blue-100 text-blue-700', activity: 'bg-orange-100 text-orange-700', update: 'bg-green-100 text-green-700' }[t] || '' }
function statusLabel(s: string) { return { draft: '草稿', scheduled: '定时发布', published: '已发布', archived: '已归档' }[s] || s }
function statusClass(s: string) { return { draft: 'bg-gray-100 text-gray-600', scheduled: 'bg-amber-100 text-amber-700', published: 'bg-green-100 text-green-700', archived: 'bg-gray-200 text-gray-500' }[s] || '' }
function scopeLabel(s: string) { return { all: '全部用户', personal: '个人版', merchant: '商户版', enterprise: '企业版' }[s] || s }

function handlePublish(item: Announcement) { item.status = 'published'; item.publishedAt = new Date().toISOString().slice(0, 16).replace('T', ' ') }
function handleEdit(item: Announcement) { editingId.value = item.id; form.value = { title: item.title, content: item.content, type: item.type, targetScope: item.targetScope, scheduledAt: item.scheduledAt || '' }; showDialog.value = true }
function handleDelete(item: Announcement) { const idx = list.value.findIndex(i => i.id === item.id); if (idx >= 0) list.value.splice(idx, 1) }
function handleSave() {
  if (editingId.value) {
    const item = list.value.find(i => i.id === editingId.value)
    if (item) { Object.assign(item, { title: form.value.title, content: form.value.content, type: form.value.type, targetScope: form.value.targetScope, scheduledAt: form.value.scheduledAt || null }) }
  } else {
    list.value.unshift({ id: Date.now(), title: form.value.title, content: form.value.content, type: form.value.type as any, targetScope: form.value.targetScope as any, status: form.value.scheduledAt ? 'scheduled' : 'draft', scheduledAt: form.value.scheduledAt || null, publishedAt: null, createdBy: 1, createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '), updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') })
  }
  showDialog.value = false; editingId.value = null; form.value = { title: '', content: '', type: 'system', targetScope: 'all', scheduledAt: '' }
}
</script>
