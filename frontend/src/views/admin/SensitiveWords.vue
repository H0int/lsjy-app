<template>
  <div class="cyber-page">
    <div class="page-header"><h1>🚫 敏感词库</h1><p class="subtitle">内容过滤敏感词管理</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">📝</div><div class="stat-info"><div class="stat-value">{{ stats.total ?? '-' }}</div><div class="stat-label">敏感词总数</div></div></div>
      <div class="stat-card"><div class="stat-icon">🔍</div><div class="stat-info"><div class="stat-value">{{ stats.todayFiltered ?? '-' }}</div><div class="stat-label">今日过滤</div></div></div>
      <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-info"><div class="stat-value">{{ Object.keys(stats.categories || {}).length || '-' }}</div><div class="stat-label">分类数</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>敏感词列表</h2><div class="header-actions"><el-button type="primary" size="small" @click="showAddDialog">+ 添加词汇</el-button></div></div>
      <el-table :data="words" style="width: 100%" class="cyber-table" v-loading="loading">
        <el-table-column prop="word" label="敏感词" width="200" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }"><el-tag size="small" effect="dark">{{ row.category }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }"><el-tag :type="row.level === '高' ? 'danger' : row.level === '中' ? 'warning' : 'info'" size="small" effect="dark">{{ row.level }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="filterCount" label="过滤次数" width="100" />
        <el-table-column prop="action" label="处理方式" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }"><el-button size="small" type="primary" link @click="showEditDialog(row)">编辑</el-button><el-button size="small" type="danger" link @click="deleteWord(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加敏感词对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑敏感词' : '添加敏感词'" width="400px">
      <el-form label-width="80px">
        <el-form-item label="敏感词">
          <el-input v-model="form.word" placeholder="输入敏感词" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" placeholder="选择分类" style="width:100%">
            <el-option label="政治" value="政治" />
            <el-option label="色情" value="色情" />
            <el-option label="暴力" value="暴力" />
            <el-option label="广告" value="广告" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="级别">
          <el-select v-model="form.level" placeholder="选择级别" style="width:100%">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理方式">
          <el-select v-model="form.action" placeholder="选择处理方式" style="width:100%">
            <el-option label="拦截" value="拦截" />
            <el-option label="人工审核" value="人工审核" />
            <el-option label="仅记录" value="仅记录" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitWord" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import service from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const submitting = ref(false)
const words = ref<any[]>([])
const stats = ref<any>({})
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ word: '', category: '其他', level: '中', action: '人工审核' })

async function fetchWords() {
  loading.value = true
  try {
    const res = await service.get('/admin/sensitive-words')
    if (res.data.code === 0) {
      words.value = res.data.data.words || res.data.data.list || []
      stats.value = res.data.data.stats || {}
    }
  } catch {
    ElMessage.error('加载敏感词列表失败')
  } finally {
    loading.value = false
  }
}

function showAddDialog() {
  isEdit.value = false
  editingId.value = null
  form.value = { word: '', category: '其他', level: '中', action: '人工审核' }
  dialogVisible.value = true
}

function showEditDialog(row: any) {
  isEdit.value = true
  editingId.value = row.id
  form.value = { word: row.word, category: row.category, level: row.level || '中', action: row.action || '人工审核' }
  dialogVisible.value = true
}

async function submitWord() {
  if (!form.value.word.trim()) {
    ElMessage.warning('请输入敏感词')
    return
  }
  submitting.value = true
  try {
    const payload = { word: form.value.word, category: form.value.category, level: form.value.level, action: form.value.action }
    const res = isEdit.value && editingId.value
      ? await service.put(`/admin/sensitive-words/${editingId.value}`, payload)
      : await service.post('/admin/sensitive-words', payload)
    if (res.data.code === 0) {
      ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
      dialogVisible.value = false
      fetchWords()
    } else {
      ElMessage.error(res.data.message || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

async function deleteWord(row: any) {
  try {
    await ElMessageBox.confirm(`确定要删除敏感词 "${row.word}" 吗？`, '确认删除', { type: 'warning' })
    const res = await service.delete(`/admin/sensitive-words/${row.id}`)
    if (res.data.code === 0) {
      ElMessage.success('删除成功')
      fetchWords()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(fetchWords)
</script>
<style scoped>
.cyber-page { padding: 1.5rem; min-height: 100vh; background: #0a0a0f; color: #e0e0ff; }
.page-header { margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.5rem; font-weight: bold; color: #00f0ff; margin: 0 0 0.25rem 0; }
.subtitle { color: #8888aa; font-size: 0.875rem; margin: 0; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: rgba(15,15,25,0.8); border: 1px solid rgba(0,240,255,0.15); border-radius: 0.75rem; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; }
.stat-icon { font-size: 2rem; }
.stat-value { font-size: 1.5rem; font-weight: bold; color: #00f0ff; font-family: 'JetBrains Mono', monospace; }
.stat-label { font-size: 0.75rem; color: #8888aa; }
.cyber-card { background: rgba(15,15,25,0.8); border: 1px solid rgba(0,240,255,0.15); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1.5rem; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.card-header h2 { font-size: 1rem; font-weight: bold; color: #e0e0ff; margin: 0; }
.cyber-table { --el-table-bg-color: transparent; --el-table-tr-bg-color: transparent; --el-table-header-bg-color: rgba(0,240,255,0.05); --el-table-row-hover-bg-color: rgba(0,240,255,0.08); --el-table-border-color: rgba(0,240,255,0.1); --el-table-text-color: #e0e0ff; --el-table-header-text-color: #00f0ff; }
</style>
