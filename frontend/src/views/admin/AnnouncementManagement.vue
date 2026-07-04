<template>
  <div>
    <div class="cyber-toolbar">
      <div class="toolbar-left">
        <select v-model="filterType" class="cyber-select">
          <option value="">全部类型</option>
          <option value="system">系统通知</option>
          <option value="activity">活动公告</option>
          <option value="update">模块更新</option>
        </select>
        <select v-model="filterStatus" class="cyber-select">
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="scheduled">定时发布</option>
          <option value="published">已发布</option>
          <option value="archived">已归档</option>
        </select>
      </div>
      <button @click="openCreateDialog" class="cyber-btn cyber-btn-cyan">+ 发布公告</button>
    </div>

    <div class="space-y-3">
      <div v-for="item in filteredList" :key="item.id" class="cyber-card announcement-card">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="cyber-tag" :class="'tag-' + item.type">{{ typeLabel(item.type) }}</span>
              <span class="cyber-badge" :class="'badge-' + item.status">{{ statusLabel(item.status) }}</span>
              <span class="text-xs text-[#4a4a6a]">推送: {{ scopeLabel(item.targetScope) }}</span>
            </div>
            <h3 class="font-semibold text-white mb-1">{{ item.title }}</h3>
            <p class="text-sm text-[#6a6a8a] line-clamp-2">{{ item.content }}</p>
            <div class="flex items-center gap-4 mt-3 text-xs text-[#4a4a6a]">
              <span>创建: {{ item.createdAt }}</span>
              <span v-if="item.scheduledAt">定时: {{ item.scheduledAt }}</span>
              <span v-if="item.publishedAt">发布: {{ item.publishedAt }}</span>
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <button v-if="item.status === 'draft'" @click="handlePublish(item)" class="cyber-btn-xs cyber-btn-green">发布</button>
            <button @click="handleEdit(item)" class="cyber-btn-xs cyber-btn-ghost">编辑</button>
            <button @click="handleDelete(item)" class="cyber-btn-xs cyber-btn-magenta">删除</button>
          </div>
        </div>
      </div>
      <div v-if="filteredList.length === 0" class="text-center py-12 text-[#4a4a6a] cyber-card">暂无公告</div>
    </div>

    <!-- 新建/编辑弹窗 -->
    <div v-if="showDialog" class="cyber-overlay">
      <div class="cyber-dialog">
        <h3 class="dialog-title">{{ editingId ? '编辑公告' : '发布公告' }}</h3>
        <div class="space-y-4">
          <div><label class="cyber-label">标题</label><input v-model="form.title" class="cyber-text-input w-full" placeholder="公告标题" /></div>
          <div><label class="cyber-label">内容</label><textarea v-model="form.content" rows="4" class="cyber-text-input w-full" placeholder="公告内容"></textarea></div>
          <div class="cyber-grid-2">
            <div><label class="cyber-label">类型</label><select v-model="form.type" class="cyber-select w-full"><option value="system">系统通知</option><option value="activity">活动公告</option><option value="update">模块更新</option></select></div>
            <div><label class="cyber-label">推送范围</label><select v-model="form.targetScope" class="cyber-select w-full"><option value="all">全部用户</option><option value="personal">个人版用户</option><option value="merchant">商户版用户</option><option value="enterprise">企业版用户</option></select></div>
          </div>
          <div><label class="cyber-label">定时发布（可选）</label><input v-model="form.scheduledAt" type="datetime-local" class="cyber-text-input" /></div>
        </div>
        <div class="dialog-footer">
          <button @click="showDialog = false" class="cyber-btn cyber-btn-ghost">取消</button>
          <button @click="handleSave" class="cyber-btn cyber-btn-cyan">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api'
import type { Announcement } from '@/types'
import { ElMessage } from 'element-plus'

const filterType = ref('')
const filterStatus = ref('')
const showDialog = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ title: '', content: '', type: 'system', targetScope: 'all', scheduledAt: '' })
const list = ref<Announcement[]>([])

const filteredList = computed(() => {
  let result = list.value
  if (filterType.value) result = result.filter(i => i.type === filterType.value)
  if (filterStatus.value) result = result.filter(i => i.status === filterStatus.value)
  return result
})

function typeLabel(t: string) { return { system: '系统通知', activity: '活动公告', update: '模块更新' }[t] || t }
function statusLabel(s: string) { return { draft: '草稿', scheduled: '定时发布', published: '已发布', archived: '已归档' }[s] || s }
function scopeLabel(s: string) { return { all: '全部用户', personal: '个人版', merchant: '商户版', enterprise: '企业版' }[s] || s }

async function fetchData() {
  try {
    const res = await adminApi.getAnnouncements()
    list.value = res.data || []
  } catch (e) {
    console.error('获取公告列表失败', e)
    list.value = []
  }
}

function openCreateDialog() {
  editingId.value = null
  form.value = { title: '', content: '', type: 'system', targetScope: 'all', scheduledAt: '' }
  showDialog.value = true
}

function handleEdit(item: Announcement) {
  editingId.value = item.id
  form.value = { title: item.title, content: item.content, type: item.type, targetScope: item.targetScope, scheduledAt: item.scheduledAt || '' }
  showDialog.value = true
}

async function handleSave() {
  if (!form.value.title.trim()) { ElMessage.warning('请输入标题'); return }
  if (editingId.value) {
    await adminApi.updateAnnouncement(editingId.value, { title: form.value.title, content: form.value.content, type: form.value.type, targetScope: form.value.targetScope, scheduledAt: form.value.scheduledAt || null })
    ElMessage.success('公告已更新')
  } else {
    await adminApi.createAnnouncement({ title: form.value.title, content: form.value.content, type: form.value.type, targetScope: form.value.targetScope, scheduledAt: form.value.scheduledAt || null })
    ElMessage.success('公告已创建')
  }
  showDialog.value = false
  fetchData()
}

async function handlePublish(item: Announcement) {
  await adminApi.updateAnnouncement(item.id, { status: 'published', publishedAt: new Date().toISOString() })
  ElMessage.success('已发布')
  fetchData()
}

async function handleDelete(item: Announcement) {
  if (!confirm(`确认删除公告「${item.title}」？`)) return
  await adminApi.deleteAnnouncement(item.id)
  ElMessage.success('已删除')
  fetchData()
}

onMounted(() => fetchData())
</script>

<style scoped>
.cyber-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.toolbar-left { display: flex; gap: 12px; }
.space-y-3 > * + * { margin-top: 12px; }
.cyber-card { background: #12121f; border: 1px solid #1a1a2e; border-radius: 12px; padding: 20px; transition: border-color 0.2s; }
.announcement-card:hover { border-color: #2a2a4e; }
.cyber-select { background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #a0a0cc; outline: none; }
.cyber-select:focus { border-color: #00f0ff; }
.cyber-select option { background: #12121f; }
.cyber-btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.cyber-btn-cyan { background: rgba(0,240,255,0.1); color: #00f0ff; border-color: #00f0ff44; }
.cyber-btn-cyan:hover { background: rgba(0,240,255,0.2); box-shadow: 0 0 12px rgba(0,240,255,0.3); }
.cyber-btn-ghost { background: rgba(100,100,140,0.1); color: #8888aa; border-color: #2a2a4e; }
.cyber-btn-ghost:hover { color: #c0c0ff; }
.cyber-btn-green { background: rgba(0,255,136,0.1); color: #00ff88; border-color: rgba(0,255,136,0.3); }
.cyber-btn-green:hover { background: rgba(0,255,136,0.2); box-shadow: 0 0 12px rgba(0,255,136,0.3); }
.cyber-btn-magenta { background: rgba(255,0,255,0.1); color: #ff00ff; border-color: rgba(255,0,255,0.3); }
.cyber-btn-magenta:hover { background: rgba(255,0,255,0.2); box-shadow: 0 0 12px rgba(255,0,255,0.3); }
.cyber-btn-xs { padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.cyber-tag { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
.tag-system { background: rgba(0,240,255,0.1); color: #00f0ff; }
.tag-activity { background: rgba(245,158,11,0.1); color: #f59e0b; }
.tag-update { background: rgba(0,255,136,0.1); color: #00ff88; }
.cyber-badge { padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-draft { background: rgba(100,100,140,0.1); color: #6a6a8a; border: 1px solid #2a2a4e; }
.badge-scheduled { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
.badge-published { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }
.badge-archived { background: rgba(100,100,140,0.1); color: #4a4a6a; border: 1px solid #1a1a2e; }
.cyber-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; }
.cyber-dialog { background: #12121f; border: 1px solid #1a1a2e; border-radius: 16px; padding: 24px; width: 100%; max-width: 520px; box-shadow: 0 0 40px rgba(0,240,255,0.05); }
.dialog-title { font-size: 18px; font-weight: 700; color: #e0e0ff; margin-bottom: 20px; }
.cyber-label { display: block; font-size: 12px; color: #6a6a8a; margin-bottom: 6px; }
.cyber-text-input { background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #e0e0ff; outline: none; resize: vertical; }
.cyber-text-input:focus { border-color: #00f0ff; }
.cyber-text-input::placeholder { color: #4a4a6a; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.cyber-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.space-y-4 > * + * { margin-top: 16px; }
.w-full { width: 100%; }
.mb-2 { margin-bottom: 8px; }
.mb-1 { margin-bottom: 4px; }
.ml-4 { margin-left: 16px; }
.mt-3 { margin-top: 12px; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-between { justify-content: space-between; }
.font-semibold { font-weight: 600; }
.text-sm { font-size: 13px; }
.text-xs { font-size: 11px; }
.text-white { color: #fff; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
