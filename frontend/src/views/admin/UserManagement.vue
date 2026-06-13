<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-3">
        <el-input v-model="search" placeholder="搜索用户..." class="w-64" clearable prefix-icon="Search" />
        <el-select v-model="statusFilter" placeholder="状态筛选" class="w-36" clearable>
          <el-option label="正常" value="active" />
          <el-option label="冻结" value="frozen" />
          <el-option label="封禁" value="banned" />
        </el-select>
      </div>
      <el-button type="primary">+ 添加用户</el-button>
    </div>

    <el-table :data="filteredUsers" stripe class="bg-white dark:bg-dark-100 rounded-xl overflow-hidden">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="用户" min-width="180">
        <template #default="{ row }">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm">
              {{ row.nickname[0] }}
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">{{ row.nickname }}</div>
              <div class="text-xs text-gray-400">@{{ row.username }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="email" label="邮箱" width="180" />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <span class="text-sm">{{ userTypeLabel(row.userType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <span class="px-2 py-1 rounded-full text-xs" :class="statusClass(row.status)">
            {{ statusLabel(row.status) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="最后登录" width="160">
        <template #default="{ row }">
          <span class="text-xs text-gray-400">{{ row.lastLoginAt ? formatDate(row.lastLoginAt) : '从未' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary">编辑</el-button>
          <el-button size="small" link :type="row.status === 'active' ? 'danger' : 'success'"
            @click="handleStatusChange(row)">
            {{ row.status === 'active' ? '冻结' : '解冻' }}
          </el-button>
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
import { formatDate, userTypeMap, userStatusMap } from '@/utils'
import type { User } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const search = ref('')
const statusFilter = ref('')
const users = ref<User[]>([])
const total = ref(0)
const pageSize = 20

const filteredUsers = computed(() => {
  let list = users.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(u => u.nickname.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
  }
  return list
})

function userTypeLabel(type: string): string {
  return userTypeMap[type] || type
}

function statusLabel(s: string): string {
  return userStatusMap[s] || s
}

function statusClass(s: string): string {
  return {
    active: 'bg-green-100 text-green-600',
    frozen: 'bg-amber-100 text-amber-600',
    banned: 'bg-red-100 text-red-600'
  }[s] || ''
}

async function fetchUsers(page = 1) {
  const res = await adminApi.getUsers({ page, pageSize, status: statusFilter.value || undefined })
  users.value = res.data.items
  total.value = res.data.total
}

function handlePageChange(page: number) {
  fetchUsers(page)
}

async function handleStatusChange(user: User) {
  const newStatus = user.status === 'active' ? 'frozen' : 'active'
  try {
    await ElMessageBox.confirm(`确认${newStatus === 'frozen' ? '冻结' : '解冻'}用户 ${user.nickname}？`)
    await adminApi.updateUserStatus(user.id, newStatus)
    ElMessage.success('操作成功')
    fetchUsers()
  } catch { /* cancelled */ }
}

onMounted(() => fetchUsers())
</script>
