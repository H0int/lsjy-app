<template>
  <div>
    <div class="cyber-toolbar">
      <div class="toolbar-left">
        <el-input v-model="search" placeholder="搜索工具..." class="cyber-input w-64" clearable prefix-icon="Search" />
        <el-select v-model="typeFilter" placeholder="类型筛选" class="cyber-input w-36" clearable>
          <el-option v-for="(label, key) in toolTypeMap" :key="key" :label="label" :value="key" />
        </el-select>
      </div>
      <el-button type="primary">+ 添加工具</el-button>
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
            {{ row.isFree ? '免费' : `${row.coinCost}圣点` }}
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
        <template #default>
          <el-button size="small" link type="primary">编辑</el-button>
          <el-button size="small" link type="danger">停用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="mt-4 flex justify-end">
      <el-pagination layout="total, prev, pager, next" :total="total" :page-size="pageSize"
        @current-change="handlePageChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api'
import { toolTypeMap } from '@/utils'
import type { Tool } from '@/types'

const search = ref('')
const typeFilter = ref('')
const tools = ref<Tool[]>([])
const total = ref(0)
const pageSize = 20

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

function handlePageChange(page: number) {
  fetchTools(page)
}

onMounted(() => fetchTools())
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
</style>
