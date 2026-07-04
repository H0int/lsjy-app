<template>
  <div>
    <!-- 筛选栏 -->
    <div class="cyber-card cyber-toolbar">
      <select v-model="filters.contentType" class="cyber-select">
        <option value="">全部内容类型</option>
        <option value="post">帖子</option>
        <option value="comment">评论</option>
        <option value="course">课程</option>
        <option value="product">商品</option>
      </select>
      <select v-model="filters.status" class="cyber-select">
        <option value="">全部状态</option>
        <option value="pending">待审核</option>
        <option value="approved">已通过</option>
        <option value="rejected">已拒绝</option>
        <option value="flagged">已标记</option>
      </select>
      <input v-model="filters.keyword" type="text" placeholder="搜索标题/作者" class="cyber-text-input" />
      <button @click="handleSearch" class="cyber-btn cyber-btn-cyan">搜索</button>
      <div class="flex-1" />
      <button v-if="selectedIds.length > 0" @click="handleBatchApprove" class="cyber-btn cyber-btn-green">批量通过 ({{ selectedIds.length }})</button>
      <button v-if="selectedIds.length > 0" @click="handleBatchReject" class="cyber-btn cyber-btn-magenta">批量拒绝</button>
    </div>

    <!-- 统计卡片 -->
    <div class="cyber-grid-4 mb-4">
      <div class="cyber-stat-mini">
        <p class="stat-num text-amber-400">{{ stats.pending }}</p>
        <p class="stat-lbl">待审核</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-num text-green-400">{{ stats.approved }}</p>
        <p class="stat-lbl">已通过</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-num text-red-400">{{ stats.rejected }}</p>
        <p class="stat-lbl">已拒绝</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-num text-cyan-400">{{ stats.todayReviewed }}</p>
        <p class="stat-lbl">今日审核</p>
      </div>
    </div>

    <!-- 表格 -->
    <div class="cyber-card p-0 overflow-hidden">
      <table class="cyber-html-table">
        <thead>
          <tr>
            <th class="w-10"><input type="checkbox" @change="toggleAll" :checked="allSelected" /></th>
            <th>类型</th>
            <th>标题</th>
            <th>作者</th>
            <th>摘要</th>
            <th>状态</th>
            <th>提交时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id" class="table-row-hover">
            <td><input type="checkbox" :value="item.id" v-model="selectedIds" /></td>
            <td>
              <span class="cyber-tag" :class="'tag-' + item.contentType">{{ typeLabel(item.contentType) }}</span>
            </td>
            <td class="text-white font-medium max-w-[200px] truncate">{{ item.contentTitle }}</td>
            <td class="text-[#8888aa]">{{ item.authorName }}</td>
            <td class="text-[#6a6a8a] max-w-[200px] truncate">{{ item.summary }}</td>
            <td>
              <span class="cyber-badge" :class="'badge-' + item.status">{{ statusLabel(item.status) }}</span>
            </td>
            <td class="text-[#4a4a6a] text-xs font-mono">{{ item.createdAt }}</td>
            <td>
              <div class="flex gap-1">
                <button v-if="item.status === 'pending'" @click="handleApprove(item)" class="cyber-btn-xs cyber-btn-green">通过</button>
                <button v-if="item.status === 'pending'" @click="handleReject(item)" class="cyber-btn-xs cyber-btn-magenta">拒绝</button>
                <button @click="handleFlag(item)" class="cyber-btn-xs cyber-btn-cyan">标记</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="list.length === 0" class="text-center py-12 text-[#4a4a6a]">暂无审核内容</div>
      <div class="cyber-pagination">
        <span class="text-sm text-[#6a6a8a]">共 {{ total }} 条</span>
        <div class="flex gap-1">
          <button v-for="p in totalPages" :key="p" @click="page = p" class="page-btn" :class="{ 'page-btn-active': p === page }">{{ p }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api'
import service from '@/api/request'
import type { ModerationItem } from '@/types'
import { ElMessage } from 'element-plus'

const filters = ref({ contentType: '', status: '', keyword: '' })
const page = ref(1)
const pageSize = 10
const selectedIds = ref<number[]>([])
const stats = ref({ pending: 0, approved: 0, rejected: 0, todayReviewed: 0 })
const list = ref<ModerationItem[]>([])

const total = computed(() => list.value.length)
const totalPages = computed(() => Math.ceil(list.value.length / pageSize))
const allSelected = computed(() => list.value.length > 0 && selectedIds.value.length === list.value.length)

function typeLabel(t: string) { return { post: '帖子', comment: '评论', course: '课程', product: '商品' }[t] || t }
function statusLabel(s: string) { return { pending: '待审核', approved: '已通过', rejected: '已拒绝', flagged: '已标记' }[s] || s }

function updateStats() {
  stats.value.pending = list.value.filter(i => i.status === 'pending').length
  stats.value.approved = list.value.filter(i => i.status === 'approved').length
  stats.value.rejected = list.value.filter(i => i.status === 'rejected').length
}

async function fetchData() {
  try {
    const res = await adminApi.getContentModerations()
    list.value = res.data || []
    updateStats()
  } catch (e) {
    console.error('获取审核内容失败', e)
    list.value = []
  }
}

function toggleAll(e: Event) { const checked = (e.target as HTMLInputElement).checked; selectedIds.value = checked ? list.value.map(i => i.id) : [] }
function handleSearch() { page.value = 1 }

async function handleApprove(item: ModerationItem) {
  await adminApi.approveContent(item.id)
  ElMessage.success('已通过')
  fetchData()
}

async function handleReject(item: ModerationItem) {
  await adminApi.rejectContent(item.id, '不符合规范')
  ElMessage.success('已拒绝')
  fetchData()
}

async function handleFlag(item: ModerationItem) {
  try {
    await service.post(`/moderation/${item.id}/flag`, { reason: '管理员标记' })
    item.status = 'flagged'
    stats.value.todayReviewed++
    ElMessage.success('已标记')
  } catch (e) {
    ElMessage.error('标记失败')
  }
}

async function handleBatchApprove() {
  for (const id of selectedIds.value) {
    await adminApi.approveContent(id)
  }
  ElMessage.success(`已批量通过 ${selectedIds.value.length} 条`)
  selectedIds.value = []
  fetchData()
}

async function handleBatchReject() {
  for (const id of selectedIds.value) {
    await adminApi.rejectContent(id, '批量拒绝')
  }
  ElMessage.success(`已批量拒绝 ${selectedIds.value.length} 条`)
  selectedIds.value = []
  fetchData()
}

onMounted(() => fetchData())

</script>

<style scoped>
.cyber-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 16px;
  margin-bottom: 16px;
}

.cyber-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.cyber-stat-mini {
  background: #12121f;
  border: 1px solid #1a1a2e;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
}

.stat-num { font-size: 24px; font-weight: 800; font-family: 'Courier New', monospace; }
.stat-lbl { font-size: 11px; color: #6a6a8a; margin-top: 4px; }

.cyber-select {
  background: #0a0a14;
  border: 1px solid #1a1a2e;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #a0a0cc;
  outline: none;
  transition: border-color 0.2s;
}
.cyber-select:focus { border-color: #00f0ff; }
.cyber-select option { background: #12121f; color: #a0a0cc; }

.cyber-text-input {
  background: #0a0a14;
  border: 1px solid #1a1a2e;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #e0e0ff;
  width: 180px;
  outline: none;
  transition: border-color 0.2s;
}
.cyber-text-input:focus { border-color: #00f0ff; }
.cyber-text-input::placeholder { color: #4a4a6a; }

.cyber-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.cyber-btn-cyan {
  background: rgba(0, 240, 255, 0.1);
  color: #00f0ff;
  border-color: #00f0ff44;
}
.cyber-btn-cyan:hover {
  background: rgba(0, 240, 255, 0.2);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.3);
}

.cyber-btn-green {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  border-color: rgba(0, 255, 136, 0.3);
}
.cyber-btn-green:hover {
  background: rgba(0, 255, 136, 0.2);
  box-shadow: 0 0 12px rgba(0, 255, 136, 0.3);
}

.cyber-btn-magenta {
  background: rgba(255, 0, 255, 0.1);
  color: #ff00ff;
  border-color: rgba(255, 0, 255, 0.3);
}
.cyber-btn-magenta:hover {
  background: rgba(255, 0, 255, 0.2);
  box-shadow: 0 0 12px rgba(255, 0, 255, 0.3);
}

.cyber-btn-xs {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cyber-card {
  background: #12121f;
  border: 1px solid #1a1a2e;
  border-radius: 12px;
}

.cyber-html-table {
  width: 100%;
  font-size: 13px;
}

.cyber-html-table th {
  padding: 12px 16px;
  text-align: left;
  color: #4a4a6a;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: rgba(26, 26, 46, 0.3);
  border-bottom: 1px solid #1a1a2e;
}

.cyber-html-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #1a1a2e;
}

.table-row-hover:hover {
  background: rgba(0, 240, 255, 0.03);
}

.cyber-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.tag-post { background: rgba(0, 240, 255, 0.1); color: #00f0ff; }
.tag-comment { background: rgba(124, 58, 237, 0.1); color: #c084fc; }
.tag-course { background: rgba(0, 255, 136, 0.1); color: #00ff88; }
.tag-product { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

.cyber-badge {
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.badge-pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.badge-approved {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.badge-rejected {
  background: rgba(255, 68, 102, 0.1);
  color: #ff4466;
  border: 1px solid rgba(255, 68, 102, 0.2);
}

.badge-flagged {
  background: rgba(0, 240, 255, 0.1);
  color: #00f0ff;
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.cyber-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #1a1a2e;
}

.page-btn {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  background: transparent;
  border: 1px solid #1a1a2e;
  color: #6a6a8a;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover { border-color: #00f0ff44; color: #00f0ff; }

.page-btn-active {
  background: rgba(0, 240, 255, 0.1) !important;
  border-color: #00f0ff !important;
  color: #00f0ff !important;
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.2);
}

.text-amber-400 { color: #f59e0b; }
.text-green-400 { color: #00ff88; }
.text-red-400 { color: #ff4466; }
.text-cyan-400 { color: #00f0ff; }
.mb-4 { margin-bottom: 16px; }
.flex { display: flex; }
.flex-1 { flex: 1; }
.gap-1 { gap: 4px; }
.w-10 { width: 2.5rem; }
.max-w-\[200px\] { max-width: 200px; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
