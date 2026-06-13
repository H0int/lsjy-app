<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-3">
        <el-input v-model="search" placeholder="搜索工具..." class="w-64" clearable prefix-icon="Search" />
        <el-select v-model="typeFilter" placeholder="类型筛选" class="w-36" clearable>
          <el-option v-for="(label, key) in toolTypeMap" :key="key" :label="label" :value="key" />
        </el-select>
      </div>
      <el-button type="primary">+ 添加工具</el-button>
    </div>

    <el-table :data="filteredTools" stripe class="bg-white dark:bg-dark-100 rounded-xl overflow-hidden">
      <el-table-column label="工具" min-width="200">
        <template #default="{ row }">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ row.icon }}</span>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">{{ row.name }}</div>
              <div class="text-xs text-gray-400">{{ row.description }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <span class="text-sm">{{ toolTypeMap[row.toolType] || row.toolType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="费用" width="100">
        <template #default="{ row }">
          <span :class="row.isFree ? 'text-green-500' : 'text-amber-500'">
            {{ row.isFree ? '免费' : `${row.coinCost}圣点` }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="使用次数" width="100">
        <template #default="{ row }">
          <span>{{ row.usageCount.toLocaleString() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="提供商" width="100">
        <template #default="{ row }">
          <span class="text-sm text-gray-500">{{ row.provider }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <span class="px-2 py-1 rounded-full text-xs" :class="toolStatusClass(row.status)">
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

function toolStatusClass(s: string): string {
  return {
    active: 'bg-green-100 text-green-600',
    maintenance: 'bg-amber-100 text-amber-600',
    disabled: 'bg-red-100 text-red-600'
  }[s] || ''
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
