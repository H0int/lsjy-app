<template>
  <div>
    <!-- 操作栏 -->
    <div class="cyber-toolbar">
      <div class="toolbar-left">
        <select v-model="filterCategory" class="cyber-select">
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <input v-model="searchKeyword" type="text" placeholder="搜索问题..." class="cyber-text-input" />
      </div>
      <button @click="showDialog = true" class="cyber-btn cyber-btn-cyan">+ 添加FAQ</button>
    </div>

    <!-- 分类统计 -->
    <div class="cyber-grid-6 mb-4">
      <div v-for="cat in categories" :key="cat" class="cyber-cat-card" :class="{ 'cat-active': filterCategory === cat }" @click="filterCategory = filterCategory === cat ? '' : cat">
        <p class="cat-num">{{ getCategoryCount(cat) }}</p>
        <p class="cat-label">{{ cat }}</p>
      </div>
    </div>

    <!-- FAQ列表 -->
    <div class="space-y-3">
      <div v-for="item in filteredList" :key="item.id" class="cyber-card faq-card">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="cyber-tag tag-category">{{ item.category }}</span>
              <span class="cyber-badge" :class="item.status === 'active' ? 'badge-active' : 'badge-disabled'">{{ item.status === 'active' ? '启用' : '禁用' }}</span>
              <span class="text-xs text-[#4a4a6a]">🔍 搜索热度: {{ item.searchCount }}</span>
            </div>
            <h3 class="font-semibold text-white mb-1">Q: {{ item.question }}</h3>
            <p class="text-sm text-[#6a6a8a]">A: {{ item.answer }}</p>
          </div>
          <div class="flex gap-2 ml-4">
            <button @click="handleEdit(item)" class="cyber-btn-xs cyber-btn-ghost">编辑</button>
            <button @click="toggleStatus(item)" class="cyber-btn-xs" :class="item.status === 'active' ? 'cyber-btn-amber' : 'cyber-btn-green'">{{ item.status === 'active' ? '禁用' : '启用' }}</button>
            <button @click="handleDelete(item)" class="cyber-btn-xs cyber-btn-magenta">删除</button>
          </div>
        </div>
      </div>
      <div v-if="filteredList.length === 0" class="text-center py-12 text-[#4a4a6a] cyber-card">暂无FAQ</div>
    </div>

    <!-- 添加/编辑弹窗 -->
    <div v-if="showDialog" class="cyber-overlay">
      <div class="cyber-dialog">
        <h3 class="dialog-title">{{ editingId ? '编辑FAQ' : '添加FAQ' }}</h3>
        <div class="space-y-4">
          <div><label class="cyber-label">分类</label>
            <select v-model="form.category" class="cyber-select w-full">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div><label class="cyber-label">问题</label><input v-model="form.question" class="cyber-text-input w-full" /></div>
          <div><label class="cyber-label">答案</label><textarea v-model="form.answer" rows="4" class="cyber-text-input w-full"></textarea></div>
          <div><label class="cyber-label">排序权重</label><input v-model.number="form.sortOrder" type="number" class="cyber-text-input w-32" /></div>
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
import type { FAQItem } from '@/types'
import { ElMessage } from 'element-plus'

const filterCategory = ref('')
const searchKeyword = ref('')
const showDialog = ref(false)
const editingId = ref<number | null>(null)
const categories = ['账号相关', '支付充值', 'AI工具', '电商购物', '课程学习', '宠物服务']
const form = ref({ category: '账号相关', question: '', answer: '', sortOrder: 0 })
const list = ref<FAQItem[]>([])

const filteredList = computed(() => {
  let result = list.value
  if (filterCategory.value) result = result.filter(i => i.category === filterCategory.value)
  if (searchKeyword.value) { const kw = searchKeyword.value.toLowerCase(); result = result.filter(i => i.question.toLowerCase().includes(kw) || i.answer.toLowerCase().includes(kw)) }
  return result
})

function getCategoryCount(cat: string) { return list.value.filter(i => i.category === cat).length }

async function fetchData() {
  try {
    const res = await adminApi.getFAQs()
    list.value = res.data?.items || res.data || []
  } catch (e) {
    console.error('获取FAQ列表失败', e)
    list.value = []
  }
}

async function toggleStatus(item: FAQItem) {
  const newStatus = item.status === 'active' ? 'disabled' : 'active'
  await adminApi.updateFAQ(item.id, { status: newStatus })
  ElMessage.success(newStatus === 'disabled' ? '已禁用' : '已启用')
  fetchData()
}

function handleEdit(item: FAQItem) {
  editingId.value = item.id
  form.value = { category: item.category, question: item.question, answer: item.answer, sortOrder: item.sortOrder }
  showDialog.value = true
}

async function handleDelete(item: FAQItem) {
  if (!confirm(`确认删除FAQ「${item.question}」？`)) return
  await adminApi.deleteFAQ(item.id)
  ElMessage.success('已删除')
  fetchData()
}

async function handleSave() {
  if (!form.value.question.trim()) { ElMessage.warning('请输入问题'); return }
  if (editingId.value) {
    await adminApi.updateFAQ(editingId.value, { category: form.value.category, question: form.value.question, answer: form.value.answer, sortOrder: form.value.sortOrder })
    ElMessage.success('FAQ已更新')
  } else {
    await adminApi.createFAQ({ category: form.value.category, question: form.value.question, answer: form.value.answer, sortOrder: form.value.sortOrder })
    ElMessage.success('FAQ已添加')
  }
  showDialog.value = false
  editingId.value = null
  fetchData()
}

onMounted(() => fetchData())

</script>

<style scoped>
.cyber-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.toolbar-left { display: flex; gap: 12px; }

.cyber-grid-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }

.cyber-cat-card {
  background: #12121f; border: 1px solid #1a1a2e; border-radius: 10px; padding: 12px;
  text-align: center; cursor: pointer; transition: all 0.2s;
}
.cyber-cat-card:hover { border-color: #00f0ff44; }
.cat-active { border-color: #00f0ff !important; box-shadow: 0 0 12px rgba(0,240,255,0.15); }
.cat-num { font-size: 18px; font-weight: 800; color: #e0e0ff; font-family: 'Courier New', monospace; }
.cat-label { font-size: 11px; color: #6a6a8a; margin-top: 4px; }

.space-y-3 > * + * { margin-top: 12px; }

.cyber-card { background: #12121f; border: 1px solid #1a1a2e; border-radius: 12px; padding: 20px; transition: border-color 0.2s; }
.faq-card:hover { border-color: #2a2a4e; }

.cyber-select { background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #a0a0cc; outline: none; }
.cyber-select:focus { border-color: #00f0ff; }
.cyber-select option { background: #12121f; }

.cyber-text-input { background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #e0e0ff; outline: none; width: 180px; resize: vertical; }
.cyber-text-input:focus { border-color: #00f0ff; }
.cyber-text-input::placeholder { color: #4a4a6a; }

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
.tag-category { background: rgba(0,240,255,0.1); color: #00f0ff; }

.cyber-badge { padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-active { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }
.badge-disabled { background: rgba(100,100,140,0.1); color: #6a6a8a; border: 1px solid #2a2a4e; }

/* Dialog */
.cyber-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; }
.cyber-dialog { background: #12121f; border: 1px solid #1a1a2e; border-radius: 16px; padding: 24px; width: 100%; max-width: 520px; }
.dialog-title { font-size: 18px; font-weight: 700; color: #e0e0ff; margin-bottom: 20px; }
.cyber-label { display: block; font-size: 12px; color: #6a6a8a; margin-bottom: 6px; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.space-y-4 > * + * { margin-top: 16px; }
.w-full { width: 100%; }
.w-32 { width: 128px; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
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
.text-xs { font-size: 11px; }
.text-white { color: #fff; }
</style>
