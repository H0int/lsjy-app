<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <h2 class="text-xl font-bold" style="color:#00f0ff">📚 知识库管理</h2>
      <div class="flex gap-2 flex-wrap">
        <el-input v-model="search" placeholder="搜索文档..." clearable style="width:200px" />
        <el-button @click="refresh">刷新</el-button>
        <el-button type="primary" @click="showAdd=true">+ 新增</el-button>
        <el-button @click="exportData">导出</el-button>
      </div>
    </div>

    <div v-if="showAdd" class="cyber-card rounded-xl p-4">
      <h3 class="text-sm font-bold mb-3" style="color:#00f0ff">新增知识库记录</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <el-input v-model="newRow.title" placeholder="文档标题" />
        <el-input v-model="newRow.category" placeholder="分类" />
        <el-input v-model="newRow.type" placeholder="类型" />
        <el-input-number v-model="newRow.chunks" :min="0" placeholder="切片数" class="w-full" />
        <el-select v-model="newRow.status" placeholder="状态" class="w-full">
          <el-option label="已索引" value="indexed" />
          <el-option label="处理中" value="processing" />
          <el-option label="待处理" value="pending" />
        </el-select>
      </div>
      <el-input v-model="newRow.content" type="textarea" :rows="3" placeholder="文档内容" class="mt-3" />
      <div class="mt-3 flex gap-2">
        <el-button type="primary" @click="addRow">确认添加</el-button>
        <el-button @click="showAdd=false">取消</el-button>
      </div>
    </div>

    <div class="cyber-card rounded-xl overflow-hidden">
      <el-table :data="paged" stripe v-loading="loading">
        <el-table-column prop="title" label="文档标题" min-width="200" />
        <el-table-column prop="type" label="分类" width="100" />
        <el-table-column prop="updatedAt" label="更新时间" width="160">
          <template #default="{ row }">{{ formatDate(row.updatedAt || row.updated) }}</template>
        </el-table-column>
        <el-table-column prop="chunks" label="切片数" width="90" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" effect="dark" round>{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="viewDetail(row)">详情</el-button>
            <el-button size="small" link type="primary" @click="editRow(row)">编辑</el-button>
            <el-button size="small" link type="danger" @click="delRow(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex items-center justify-end px-4 py-3">
        <el-pagination v-model:current-page="page" :page-size="perPage" :total="filtered.length" layout="total, prev, pager, next" />
      </div>
    </div>

    <el-dialog v-model="detailVisible" title="知识库详情" width="600px">
      <div v-if="detail" class="space-y-2 text-sm" style="color:#e0e0ff;">
        <div><span style="color:#808099;">标题:</span> {{ detail.title }}</div>
        <div><span style="color:#808099;">分类:</span> {{ detail.type || detail.category }}</div>
        <div><span style="color:#808099;">状态:</span> {{ statusLabel(detail.status) }}</div>
        <div><span style="color:#808099;">标签:</span> {{ (detail.tags || []).join(', ') || '-' }}</div>
        <div><span style="color:#808099;">内容:</span></div>
        <div class="p-3 rounded" style="background:#0d0d1a;max-height:300px;overflow-y:auto;">{{ detail.content || '-' }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api'
import { formatDate } from '@/utils'

const search = ref('')
const showAdd = ref(false)
const page = ref(1)
const perPage = 10
const loading = ref(false)
const rows = ref<any[]>([])
const detailVisible = ref(false)
const detail = ref<any>(null)
const newRow = ref<any>({ title: '', category: '', type: '', content: '', chunks: 0, status: 'indexed' })

function statusType(s: string) {
  return { indexed: 'success', processing: 'warning', pending: 'info' }[s] || 'info'
}
function statusLabel(s: string) {
  return { indexed: '已索引', processing: '处理中', pending: '待处理' }[s] || s
}

async function refresh() {
  loading.value = true
  try {
    const res = await adminApi.getKnowledgeBase()
    rows.value = res.data?.items || res.data?.items || res.data || []
  } catch (e: any) { ElMessage.error(e.message || '加载失败') }
  finally { loading.value = false }
}

const filtered = computed(() => {
  const s = search.value.toLowerCase()
  return s ? rows.value.filter(r => String(r.title || '').toLowerCase().includes(s) || String(r.content || '').toLowerCase().includes(s)) : rows.value
})
const paged = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage))

async function addRow() {
  try {
    await adminApi.createKnowledge(newRow.value)
    ElMessage.success('添加成功')
    newRow.value = { title: '', category: '', type: '', content: '', chunks: 0, status: 'indexed' }
    showAdd.value = false
    refresh()
  } catch (e: any) { ElMessage.error(e.message || '添加失败') }
}

function viewDetail(row: any) {
  detail.value = row
  detailVisible.value = true
}

function editRow(row: any) {
  ElMessage.info('编辑功能演示：' + row.title)
}

async function delRow(id: any) {
  try {
    await ElMessageBox.confirm('确认删除该知识库记录？')
    await adminApi.deleteKnowledge(id)
    ElMessage.success('删除成功')
    refresh()
  } catch { /* cancelled */ }
}

function exportData() {
  const csv = [
    ['标题','分类','更新时间','切片数','状态'].join(','),
    ...rows.value.map(r => [r.title, r.type || r.category, formatDate(r.updatedAt || r.updated), r.chunks, r.status].join(','))
  ].join('\n')
  const blob = new Blob(['\ufeff'+csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `knowledge-base-${new Date().toISOString().slice(0,10)}.csv`
  link.click()
}

onMounted(refresh)
</script>
