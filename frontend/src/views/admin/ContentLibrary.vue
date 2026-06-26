<template>
  <div>
    <div class="cyber-toolbar">
      <div class="toolbar-left">
        <el-input v-model="search" placeholder="搜索内容..." class="cyber-input w-64" clearable />
        <el-select v-model="typeFilter" placeholder="内容类型" class="cyber-input w-36" clearable>
          <el-option v-for="t in types" :key="t" :label="t" :value="t" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态" class="cyber-input w-32" clearable>
          <el-option label="已发布" value="published" />
          <el-option label="草稿" value="draft" />
          <el-option label="已下架" value="archived" />
        </el-select>
      </div>
      <el-button type="primary" @click="dialogVisible = true">+ 新建内容</el-button>
    </div>

    <div class="cyber-grid-4 mb-6">
      <div class="cyber-stat-mini">
        <p class="stat-lbl">总内容数</p>
        <p class="stat-num text-white">{{ contents.length }}</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-lbl">已发布</p>
        <p class="stat-num text-green-400">{{ contents.filter(c=>c.status==='published').length }}</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-lbl">AI生成率</p>
        <p class="stat-num text-cyan-400">87%</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-lbl">本月浏览量</p>
        <p class="stat-num text-purple-400">24.5K</p>
      </div>
    </div>

    <!-- 桌面端 -->
    <div class="hidden md:block">
      <el-table :data="filteredContents" stripe class="cyber-table">
        <el-table-column label="标题" min-width="250">
          <template #default="{ row }">
            <div>
              <div class="font-medium text-white">{{ row.title }}</div>
              <div class="text-xs text-[#4a4a6a]">{{ row.summary }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <span class="cyber-tag tag-cyan">{{ row.type }}</span>
          </template>
        </el-table-column>
        <el-table-column label="生成方式" width="100">
          <template #default="{ row }">
            <span :class="row.aiGenerated ? 'text-cyan-400' : 'text-[#6a6a8a]'" class="text-sm">{{ row.aiGenerated ? '🤖 AI' : '✍️ 人工' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="浏览量" width="90">
          <template #default="{ row }">
            <span class="font-mono text-sm text-[#a0a0cc]">{{ row.views.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <span class="cyber-badge" :class="'badge-' + row.status">{{ statusLabel(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="110">
          <template #default="{ row }">
            <span class="text-xs text-[#6a6a8a]">{{ row.createdAt }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="viewContent(row)">查看</el-button>
            <el-button size="small" link :type="row.status === 'published' ? 'danger' : 'primary'" @click="togglePublish(row)">
              {{ row.status === 'published' ? '下架' : '发布' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 移动端 -->
    <div class="md:hidden space-y-3">
      <div v-for="row in filteredContents" :key="row.id" class="cyber-card p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="cyber-tag tag-cyan">{{ row.type }}</span>
          <span class="cyber-badge" :class="'badge-' + row.status">{{ statusLabel(row.status) }}</span>
        </div>
        <h3 class="text-white font-medium mb-1">{{ row.title }}</h3>
        <p class="text-xs text-[#6a6a8a] mb-3">{{ row.summary }}</p>
        <div class="flex items-center justify-between text-xs text-[#4a4a6a]">
          <span>{{ row.aiGenerated ? '🤖 AI' : '✍️ 人工' }} · {{ row.views.toLocaleString() }}浏览</span>
          <span>{{ row.createdAt }}</span>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="新建内容" width="600px" destroy-on-close>
      <el-form label-width="80px" class="cyber-form">
        <el-form-item label="标题"><el-input v-model="form.title" placeholder="输入标题" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" placeholder="选择类型" class="w-full">
            <el-option v-for="t in types" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="6" placeholder="输入内容或使用AI生成" /></el-form-item>
        <el-form-item label="标签"><el-input v-model="form.tags" placeholder="标签用逗号分隔" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createContent">保存草稿</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewDialogVisible" title="内容详情" width="600px" destroy-on-close>
      <div v-if="currentContent" class="cyber-form" style="padding: 0 20px;">
        <h3 style="color: #00f0ff; margin-bottom: 12px;">{{ currentContent.title }}</h3>
        <p style="color: #8888aa; font-size: 13px; margin-bottom: 8px;">
          <span class="cyber-tag tag-cyan">{{ currentContent.type }}</span>
          <span class="cyber-badge" :class="'badge-' + currentContent.status" style="margin-left: 8px;">{{ statusLabel(currentContent.status) }}</span>
          <span style="margin-left: 12px;">{{ currentContent.aiGenerated ? '🤖 AI' : '✍️ 人工' }} · {{ currentContent.views?.toLocaleString() }}浏览</span>
        </p>
        <div style="color: #e0e0ff; line-height: 1.8; white-space: pre-wrap;">{{ currentContent.content || currentContent.summary }}</div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import service from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const search = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const dialogVisible = ref(false)
const loading = ref(false)
const types = ['文章', '教程', '公告', '知识库', '提示词模板']

const contents = ref<any[]>([])
const total = ref(0)

// 新建内容表单
const form = ref({ title: '', content: '', type: '', status: 'draft', tags: '' })

// 查看详情
const viewDialogVisible = ref(false)
const currentContent = ref<any>(null)

function statusLabel(s: string) { return { published: '已发布', draft: '草稿', archived: '已下架' }[s] || s }

const filteredContents = computed(() => contents.value)

async function fetchData() {
  loading.value = true
  try {
    const res = await service.get('/admin/content-library', {
      params: {
        search: search.value,
        type: typeFilter.value,
        status: statusFilter.value,
        page: 1,
        pageSize: 20
      }
    })
    if (res.data.code === 0) {
      contents.value = res.data.data.items || []
      total.value = res.data.data.total || 0
    }
  } catch (e) {
    ElMessage.error('加载内容失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

// 搜索/筛选变化时重新拉取
watch([search, typeFilter, statusFilter], () => {
  fetchData()
})

async function viewContent(c: any) {
  currentContent.value = c
  viewDialogVisible.value = true
}

async function togglePublish(c: any) {
  const newStatus = c.status === 'published' ? 'archived' : 'published'
  const action = newStatus === 'published' ? '发布' : '下架'
  try {
    await ElMessageBox.confirm(`确定要${action}「${c.title}」吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await service.put(`/admin/content-library/${c.id}`, {
      ...c,
      status: newStatus
    })
    if (res.data.code === 0) {
      c.status = newStatus
      ElMessage.success(`已${action}`)
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(`${action}失败`)
    }
  }
}

async function createContent() {
  if (!form.value.title) {
    ElMessage.warning('请输入标题')
    return
  }
  try {
    const res = await service.post('/admin/content-library', {
      title: form.value.title,
      content: form.value.content,
      type: form.value.type,
      status: form.value.status,
      tags: form.value.tags ? form.value.tags.split(',').map((t: string) => t.trim()) : []
    })
    if (res.data.code === 0) {
      ElMessage.success('创建成功')
      dialogVisible.value = false
      form.value = { title: '', content: '', type: '', status: 'draft', tags: '' }
      fetchData()
    }
  } catch (e) {
    ElMessage.error('创建失败')
  }
}
</script>

<style scoped>
.cyber-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.toolbar-left { display: flex; gap: 12px; flex-wrap: wrap; }
.cyber-input { flex-shrink: 0; }
.w-full { width: 100%; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-6 { margin-bottom: 24px; }
.space-y-3 > * + * { margin-top: 12px; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.p-4 { padding: 16px; }
.text-white { color: #fff; }
.text-xs { font-size: 11px; }
.text-sm { font-size: 13px; }
.font-medium { font-weight: 600; }
.font-mono { font-family: 'Courier New', monospace; }
.text-green-400 { color: #00ff88; }
.text-cyan-400 { color: #00f0ff; }
.text-purple-400 { color: #c084fc; }
.cyber-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.tag-cyan { background: rgba(0,240,255,0.1); color: #00f0ff; border: 1px solid rgba(0,240,255,0.2); }
.cyber-badge { padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-published { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }
.badge-draft { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
.badge-archived { background: rgba(100,100,120,0.15); color: #6a6a8a; border: 1px solid rgba(100,100,120,0.3); }
@media (max-width: 767px) { .hidden { display: none; } .md\:hidden { display: none; } .md\:block { display: none; } .cyber-grid-4 { grid-template-columns: 1fr 1fr !important; } }
@media (min-width: 768px) { .md\:hidden { display: block; } .md\:block { display: block; } }
</style>
