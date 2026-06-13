<template>
  <div>
    <div class="cyber-toolbar">
      <div class="toolbar-left">
        <el-input v-model="search" placeholder="搜索用户..." class="cyber-input w-64" clearable prefix-icon="Search" />
        <el-select v-model="statusFilter" placeholder="状态筛选" class="cyber-input w-36" clearable>
          <el-option label="正常" value="active" />
          <el-option label="冻结" value="frozen" />
          <el-option label="封禁" value="banned" />
        </el-select>
      </div>
      <el-button type="primary">+ 添加用户</el-button>
    </div>

    <el-table :data="filteredUsers" stripe class="cyber-table">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="用户" min-width="180">
        <template #default="{ row }">
          <div class="flex items-center gap-3">
            <div class="cyber-avatar">{{ row.nickname[0] }}</div>
            <div>
              <div class="text-white font-medium">{{ row.nickname }}</div>
              <div class="text-xs text-[#4a4a6a]">@{{ row.username }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="email" label="邮箱" width="180" />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <span class="text-sm text-[#a0a0cc]">{{ userTypeLabel(row.userType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <span class="cyber-badge" :class="'badge-' + row.status">
            {{ statusLabel(row.status) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="最后登录" width="160">
        <template #default="{ row }">
          <span class="text-xs text-[#4a4a6a] font-mono">{{ row.lastLoginAt ? formatDate(row.lastLoginAt) : '从未' }}</span>
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

<style scoped>
.cyber-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.toolbar-left { display: flex; gap: 12px; }
.cyber-input { flex-shrink: 0; }

.cyber-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00f0ff, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
  flex-shrink: 0;
}

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

.badge-frozen {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.badge-banned {
  background: rgba(255, 68, 102, 0.1);
  color: #ff4466;
  border: 1px solid rgba(255, 68, 102, 0.2);
}
</style>
