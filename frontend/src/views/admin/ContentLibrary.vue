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
        <el-form-item label="标题"><el-input placeholder="输入标题" /></el-form-item>
        <el-form-item label="类型">
          <el-select placeholder="选择类型" class="w-full">
            <el-option v-for="t in types" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容"><el-input type="textarea" :rows="6" placeholder="输入内容或使用AI生成" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">保存草稿</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const search = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const dialogVisible = ref(false)
const types = ['文章', '教程', '公告', '知识库', '提示词模板']

const contents = ref([
  { id: 1, title: 'GPT-4o最新功能详解', summary: '深入解析GPT-4o的多模态能力提升', type: '文章', aiGenerated: true, views: 3420, status: 'published', createdAt: '2026-06-14' },
  { id: 2, title: 'AI绘画入门教程', summary: '从零开始学习AI绘画技巧', type: '教程', aiGenerated: true, views: 2180, status: 'published', createdAt: '2026-06-13' },
  { id: 3, title: '平台升级公告 v2.5', summary: '新增多模型切换功能', type: '公告', aiGenerated: false, views: 5600, status: 'published', createdAt: '2026-06-12' },
  { id: 4, title: 'Prompt工程最佳实践', summary: '提升AI输出质量的系统方法', type: '知识库', aiGenerated: true, views: 1890, status: 'published', createdAt: '2026-06-11' },
  { id: 5, title: '代码生成提示词合集', summary: '覆盖前后端的代码生成模板', type: '提示词模板', aiGenerated: true, views: 980, status: 'draft', createdAt: '2026-06-10' },
  { id: 6, title: 'Claude vs GPT对比评测', summary: '主流大模型能力全面对比', type: '文章', aiGenerated: false, views: 4200, status: 'published', createdAt: '2026-06-09' },
  { id: 7, title: 'API调用优化指南', summary: '降低延迟和成本的实战技巧', type: '教程', aiGenerated: true, views: 1560, status: 'archived', createdAt: '2026-06-08' },
])

function statusLabel(s: string) { return { published: '已发布', draft: '草稿', archived: '已下架' }[s] || s }

const filteredContents = computed(() => {
  let list = contents.value
  if (search.value) list = list.filter(c => c.title.includes(search.value))
  if (typeFilter.value) list = list.filter(c => c.type === typeFilter.value)
  if (statusFilter.value) list = list.filter(c => c.status === statusFilter.value)
  return list
})

function viewContent(c: any) { ElMessage.info(`查看: ${c.title}`) }
function togglePublish(c: any) {
  c.status = c.status === 'published' ? 'archived' : 'published'
  ElMessage.success(`已${c.status === 'published' ? '发布' : '下架'}`)
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
