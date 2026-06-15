<template>
  <div>
    <div class="cyber-toolbar">
      <div class="toolbar-left">
        <el-input v-model="search" placeholder="搜索工具..." class="cyber-input w-64" clearable prefix-icon="Search" />
        <el-select v-model="typeFilter" placeholder="类型筛选" class="cyber-input w-36" clearable>
          <el-option v-for="(label, key) in toolTypeMap" :key="key" :label="label" :value="key" />
        </el-select>
      </div>
      <el-button type="primary" @click="openAddDialog">+ 添加工具</el-button>
    </div>

    <el-table :data="filteredTools" stripe class="cyber-table">
      <el-table-column label="工具" min-width="200">
        <template #default="{ row }">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ row.icon }}</span>
            <div>
              <div class="font-medium text-white">{{ row.name }}</div>
              <div class="text-xs text-[#4a4a6a]">{{ row.description }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <span class="text-sm text-[#a0a0cc]">{{ toolTypeMap[row.toolType] || row.toolType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="费用" width="100">
        <template #default="{ row }">
          <span :class="row.isFree ? 'text-green-400' : 'text-amber-400'" class="font-medium">
            {{ row.isFree ? '免费' : `${row.coinCost}圣力` }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="使用次数" width="100">
        <template #default="{ row }">
          <span class="font-mono text-[#a0a0cc]">{{ row.usageCount.toLocaleString() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="提供商" width="100">
        <template #default="{ row }">
          <span class="text-sm text-[#6a6a8a]">{{ row.provider }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <span class="cyber-badge" :class="'badge-' + row.status">
            {{ toolStatusLabel(row.status) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" link type="danger" @click="handleToggleStatus(row)">
            {{ row.status === 'active' ? '停用' : row.status === 'disabled' ? '启用' : '恢复' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="mt-4 flex justify-end">
      <el-pagination layout="total, prev, pager, next" :total="total" :page-size="pageSize"
        @current-change="handlePageChange" />
    </div>

    <!-- 添加/编辑工具对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEditing ? '编辑工具' : '添加工具'" width="580px" destroy-on-close>
      <el-form :model="form" label-width="90px" class="cyber-form">
        <el-form-item label="工具名称">
          <el-input v-model="form.name" placeholder="请输入工具名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="工具描述" />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="分类">
            <el-select v-model="form.categoryId" placeholder="选择分类" class="w-full">
              <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="图标">
            <el-input v-model="form.icon" placeholder="emoji图标" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="Provider">
            <el-select v-model="form.provider" placeholder="选择提供商" class="w-full">
              <el-option label="OpenAI" value="openai" />
              <el-option label="Stability" value="stability" />
              <el-option label="ByteDance" value="bytedance" />
              <el-option label="Local" value="local" />
              <el-option label="Multi" value="multi" />
            </el-select>
          </el-form-item>
          <el-form-item label="模型ID">
            <el-input v-model="form.modelId" placeholder="如 gpt-4o" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="工具类型">
            <el-select v-model="form.toolType" placeholder="类型" class="w-full">
              <el-option v-for="(label, key) in toolTypeMap" :key="key" :label="label" :value="key" />
            </el-select>
          </el-form-item>
          <el-form-item label="圣力价格">
            <el-input-number v-model="form.coinCost" :min="0" :max="9999" class="w-full" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="是否免费">
            <el-switch v-model="form.isFreeBool" active-text="免费" inactive-text="收费" />
          </el-form-item>
          <el-form-item label="每日限额">
            <el-input-number v-model="form.freeDailyLimit" :min="0" :max="999" class="w-full" />
          </el-form-item>
        </div>
        <el-form-item label="状态">
          <el-select v-model="form.status" class="w-full">
            <el-option label="上线" value="active" />
            <el-option label="维护" value="maintenance" />
            <el-option label="下线" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveTool" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api'
import { toolTypeMap } from '@/utils'
import type { Tool, ToolCategory } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const search = ref('')
const typeFilter = ref('')
const tools = ref<Tool[]>([])
const total = ref(0)
const pageSize = 20
const dialogVisible = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const categories = ref<ToolCategory[]>([])

const form = ref({
  name: '',
  description: '',
  categoryId: 1,
  icon: '',
  provider: 'openai',
  modelId: '',
  toolType: 'text' as string,
  coinCost: 10,
  isFreeBool: false,
  freeDailyLimit: 0,
  status: 'active'
})

const filteredTools = computed(() => {
  let list = tools.value
  if (search.value) list = list.filter(t => t.name.toLowerCase().includes(search.value.toLowerCase()))
  if (typeFilter.value) list = list.filter(t => t.toolType === typeFilter.value)
  return list
})

function toolStatusLabel(s: string): string {
  return { active: '上线', maintenance: '维护', disabled: '下线' }[s] || s
}

async function fetchTools(page = 1) {
  const res = await adminApi.getAdminTools({ page, pageSize })
  tools.value = res.data.items
  total.value = res.data.total
}

async function fetchCategories() {
  try {
    const res = await adminApi.getCategories()
    categories.value = res.data
  } catch {
    categories.value = [{ id: 1, name: '默认分类', slug: 'default', icon: null, description: null, module: 'ai', toolCount: 0 }]
  }
}

function handlePageChange(page: number) {
  fetchTools(page)
}

function openAddDialog() {
  isEditing.value = false
  form.value = {
    name: '', description: '', categoryId: 1, icon: '🔧', provider: 'openai',
    modelId: '', toolType: 'text', coinCost: 10, isFreeBool: false, freeDailyLimit: 0, status: 'active'
  }
  dialogVisible.value = true
}

function openEditDialog(tool: Tool) {
  isEditing.value = true
  form.value = {
    name: tool.name,
    description: tool.description || '',
    categoryId: tool.categoryId,
    icon: tool.icon || '',
    provider: tool.provider,
    modelId: tool.modelId,
    toolType: tool.toolType,
    coinCost: tool.coinCost,
    isFreeBool: tool.isFree === 1,
    freeDailyLimit: tool.freeDailyLimit,
    status: tool.status
  }
  dialogVisible.value = true
}

async function handleSaveTool() {
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入工具名称')
    return
  }
  saving.value = true
  try {
    await adminApi.saveTool({
      name: form.value.name,
      description: form.value.description,
      categoryId: form.value.categoryId,
      icon: form.value.icon,
      provider: form.value.provider,
      modelId: form.value.modelId,
      toolType: form.value.toolType as any,
      coinCost: form.value.coinCost,
      isFree: form.value.isFreeBool ? 1 : 0,
      freeDailyLimit: form.value.freeDailyLimit,
      status: form.value.status as any
    })
    ElMessage.success(isEditing.value ? '工具已更新' : '工具添加成功')
    dialogVisible.value = false
    fetchTools()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    saving.value = false
  }
}

async function handleToggleStatus(tool: Tool) {
  const newStatus = tool.status === 'active' ? 'disabled' : 'active'
  const action = newStatus === 'disabled' ? '停用' : '启用'
  try {
    await ElMessageBox.confirm(`确认${action}工具「${tool.name}」？`)
    await adminApi.updateToolStatus(tool.id, newStatus)
    ElMessage.success(`${action}成功`)
    fetchTools()
  } catch { /* cancelled */ }
}

onMounted(() => {
  fetchTools()
  fetchCategories()
})
</script>

<style scoped>
.cyber-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.toolbar-left { display: flex; gap: 12px; }
.cyber-input { flex-shrink: 0; }

.cyber-badge {
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.badge-active {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.badge-maintenance {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.badge-disabled {
  background: rgba(255, 68, 102, 0.1);
  color: #ff4466;
  border: 1px solid rgba(255, 68, 102, 0.2);
}

.text-green-400 { color: #00ff88; }
.text-amber-400 { color: #f59e0b; }
.w-full { width: 100%; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
</style>
