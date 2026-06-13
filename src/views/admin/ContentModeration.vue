<template>
  <div>
    <!-- 筛选栏 -->
    <div class="bg-white dark:bg-dark-100 rounded-xl p-4 mb-4 shadow-sm flex flex-wrap gap-3 items-center">
      <select v-model="filters.contentType" class="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200">
        <option value="">全部内容类型</option>
        <option value="post">帖子</option>
        <option value="comment">评论</option>
        <option value="course">课程</option>
        <option value="product">商品</option>
      </select>
      <select v-model="filters.status" class="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200">
        <option value="">全部状态</option>
        <option value="pending">待审核</option>
        <option value="approved">已通过</option>
        <option value="rejected">已拒绝</option>
        <option value="flagged">已标记</option>
      </select>
      <input v-model="filters.keyword" type="text" placeholder="搜索标题/作者" class="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200 w-48" />
      <button @click="handleSearch" class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">搜索</button>
      <div class="flex-1" />
      <button v-if="selectedIds.length > 0" @click="handleBatchApprove" class="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">批量通过 ({{ selectedIds.length }})</button>
      <button v-if="selectedIds.length > 0" @click="handleBatchReject" class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">批量拒绝</button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4 mb-4">
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm text-center">
        <p class="text-2xl font-bold text-amber-500">{{ stats.pending }}</p>
        <p class="text-xs text-gray-500 mt-1">待审核</p>
      </div>
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm text-center">
        <p class="text-2xl font-bold text-green-500">{{ stats.approved }}</p>
        <p class="text-xs text-gray-500 mt-1">已通过</p>
      </div>
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm text-center">
        <p class="text-2xl font-bold text-red-500">{{ stats.rejected }}</p>
        <p class="text-xs text-gray-500 mt-1">已拒绝</p>
      </div>
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm text-center">
        <p class="text-2xl font-bold text-blue-500">{{ stats.todayReviewed }}</p>
        <p class="text-xs text-gray-500 mt-1">今日审核</p>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-white dark:bg-dark-100 rounded-xl shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-dark-200">
          <tr>
            <th class="px-4 py-3 text-left"><input type="checkbox" @change="toggleAll" :checked="allSelected" /></th>
            <th class="px-4 py-3 text-left text-gray-500">类型</th>
            <th class="px-4 py-3 text-left text-gray-500">标题</th>
            <th class="px-4 py-3 text-left text-gray-500">作者</th>
            <th class="px-4 py-3 text-left text-gray-500">摘要</th>
            <th class="px-4 py-3 text-left text-gray-500">状态</th>
            <th class="px-4 py-3 text-left text-gray-500">提交时间</th>
            <th class="px-4 py-3 text-left text-gray-500">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr v-for="item in list" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-dark-200">
            <td class="px-4 py-3"><input type="checkbox" :value="item.id" v-model="selectedIds" /></td>
            <td class="px-4 py-3">
              <span class="px-2 py-1 rounded text-xs" :class="typeClass(item.contentType)">{{ typeLabel(item.contentType) }}</span>
            </td>
            <td class="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium max-w-[200px] truncate">{{ item.contentTitle }}</td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ item.authorName }}</td>
            <td class="px-4 py-3 text-gray-500 max-w-[200px] truncate">{{ item.summary }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-1 rounded-full text-xs font-medium" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">{{ item.createdAt }}</td>
            <td class="px-4 py-3">
              <div class="flex gap-1">
                <button v-if="item.status === 'pending'" @click="handleApprove(item)" class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">通过</button>
                <button v-if="item.status === 'pending'" @click="handleReject(item)" class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">拒绝</button>
                <button @click="handleFlag(item)" class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">标记</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="list.length === 0" class="text-center py-12 text-gray-400">暂无审核内容</div>
      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <span class="text-sm text-gray-500">共 {{ total }} 条</span>
        <div class="flex gap-1">
          <button v-for="p in totalPages" :key="p" @click="page = p" class="px-3 py-1 rounded text-sm" :class="p === page ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-400'">{{ p }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ModerationItem } from '@/types'

const filters = ref({ contentType: '', status: '', keyword: '' })
const page = ref(1)
const pageSize = 10
const total = ref(56)
const selectedIds = ref<number[]>([])

const stats = ref({ pending: 23, approved: 189, rejected: 12, todayReviewed: 8 })

const list = ref<ModerationItem[]>([
  { id: 1, contentType: 'post', contentTitle: '分享我的AI绘画作品', authorName: '张三', authorId: 101, summary: '这是一篇关于AI绘画的分享帖子...', status: 'pending', reason: null, reviewerId: null, reviewerName: null, createdAt: '2025-07-18 14:30', reviewedAt: null },
  { id: 2, contentType: 'comment', contentTitle: '关于课程评价', authorName: '李四', authorId: 102, summary: '这个课程真的很棒，推荐给大家...', status: 'pending', reason: null, reviewerId: null, reviewerName: null, createdAt: '2025-07-18 13:20', reviewedAt: null },
  { id: 3, contentType: 'course', contentTitle: 'Python从入门到精通', authorName: '王老师', authorId: 103, summary: '零基础Python编程课程...', status: 'approved', reason: null, reviewerId: 1, reviewerName: '管理员', createdAt: '2025-07-18 10:00', reviewedAt: '2025-07-18 11:30' },
  { id: 4, contentType: 'product', contentTitle: '手工陶瓷茶杯套装', authorName: '匠心店铺', authorId: 104, summary: '纯手工制作的陶瓷茶杯...', status: 'pending', reason: null, reviewerId: null, reviewerName: null, createdAt: '2025-07-18 09:15', reviewedAt: null },
  { id: 5, contentType: 'post', contentTitle: '宠物日记：我家猫咪的日常', authorName: '萌宠达人', authorId: 105, summary: '记录猫咪每天的生活日常...', status: 'rejected', reason: '内容涉及隐私信息', reviewerId: 1, reviewerName: '管理员', createdAt: '2025-07-17 16:45', reviewedAt: '2025-07-17 17:00' },
  { id: 6, contentType: 'comment', contentTitle: '商品评价回复', authorName: '赵六', authorId: 106, summary: '感谢反馈，我们会改进的...', status: 'flagged', reason: '疑似广告内容', reviewerId: 1, reviewerName: '管理员', createdAt: '2025-07-17 15:30', reviewedAt: '2025-07-17 16:00' },
  { id: 7, contentType: 'post', contentTitle: '校园二手交易攻略', authorName: '学长小李', authorId: 107, summary: '分享一下校园二手交易的经验...', status: 'pending', reason: null, reviewerId: null, reviewerName: null, createdAt: '2025-07-18 15:00', reviewedAt: null },
  { id: 8, contentType: 'course', contentTitle: '电商运营实战课', authorName: '陈老师', authorId: 108, summary: '从0到1教你做电商运营...', status: 'pending', reason: null, reviewerId: null, reviewerName: null, createdAt: '2025-07-18 14:50', reviewedAt: null },
])

const totalPages = computed(() => Math.ceil(total.value / pageSize))
const allSelected = computed(() => list.value.length > 0 && selectedIds.value.length === list.value.length)

function typeLabel(t: string) { return { post: '帖子', comment: '评论', course: '课程', product: '商品' }[t] || t }
function typeClass(t: string) { return { post: 'bg-blue-100 text-blue-700', comment: 'bg-purple-100 text-purple-700', course: 'bg-green-100 text-green-700', product: 'bg-orange-100 text-orange-700' }[t] || 'bg-gray-100 text-gray-700' }
function statusLabel(s: string) { return { pending: '待审核', approved: '已通过', rejected: '已拒绝', flagged: '已标记' }[s] || s }
function statusClass(s: string) { return { pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', flagged: 'bg-blue-100 text-blue-700' }[s] || '' }

function toggleAll(e: Event) { const checked = (e.target as HTMLInputElement).checked; selectedIds.value = checked ? list.value.map(i => i.id) : [] }
function handleSearch() { page.value = 1 }
function handleApprove(item: ModerationItem) { item.status = 'approved'; item.reviewerName = '管理员'; stats.value.pending--; stats.value.approved++; stats.value.todayReviewed++ }
function handleReject(item: ModerationItem) { item.status = 'rejected'; item.reviewerName = '管理员'; stats.value.pending--; stats.value.rejected++; stats.value.todayReviewed++ }
function handleFlag(item: ModerationItem) { item.status = 'flagged'; stats.value.todayReviewed++ }
function handleBatchApprove() { list.value.filter(i => selectedIds.value.includes(i.id)).forEach(i => { i.status = 'approved'; i.reviewerName = '管理员' }); stats.value.pending -= selectedIds.value.length; stats.value.approved += selectedIds.value.length; selectedIds.value = [] }
function handleBatchReject() { list.value.filter(i => selectedIds.value.includes(i.id)).forEach(i => { i.status = 'rejected'; i.reviewerName = '管理员' }); stats.value.pending -= selectedIds.value.length; stats.value.rejected += selectedIds.value.length; selectedIds.value = [] }
</script>
