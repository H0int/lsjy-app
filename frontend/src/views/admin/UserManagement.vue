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
      <el-button type="primary" @click="openAddDialog">+ 添加用户</el-button>
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
          <el-button size="small" link type="primary" @click="openEditDialog(row)">编辑</el-button>
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

    <!-- 添加/编辑用户对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEditing ? '编辑用户' : '添加用户'" width="520px" destroy-on-close>
      <el-form :model="form" label-width="80px" class="cyber-form">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="isEditing" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roles" multiple placeholder="请选择角色" class="w-full">
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="运营" value="operator" />
            <el-option label="商户" value="merchant" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择状态" class="w-full">
            <el-option label="正常" value="active" />
            <el-option label="冻结" value="frozen" />
            <el-option label="封禁" value="banned" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!isEditing" label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入初始密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveUser" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
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
const dialogVisible = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const editingUserId = ref<number | null>(null)

const form = ref({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  roles: [] as string[],
  status: 'active',
  password: ''
})

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

function openAddDialog() {
  isEditing.value = false
  editingUserId.value = null
  form.value = { username: '', nickname: '', phone: '', email: '', roles: ['user'], status: 'active', password: '' }
  dialogVisible.value = true
}

function openEditDialog(user: User) {
  isEditing.value = true
  editingUserId.value = user.id
  form.value = {
    username: user.username,
    nickname: user.nickname,
    phone: user.phone || '',
    email: user.email || '',
    roles: user.roles || ['user'],
    status: user.status,
    password: ''
  }
  dialogVisible.value = true
}

async function handleSaveUser() {
  if (!form.value.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!form.value.nickname.trim()) {
    ElMessage.warning('请输入昵称')
    return
  }
  if (!isEditing.value && !form.value.password.trim()) {
    ElMessage.warning('请输入初始密码')
    return
  }
  saving.value = true
  try {
    await adminApi.saveUser({
      id: editingUserId.value,
      username: form.value.username,
      nickname: form.value.nickname,
      phone: form.value.phone,
      email: form.value.email,
      roles: form.value.roles,
      status: form.value.status,
      password: form.value.password || undefined
    })
    ElMessage.success(isEditing.value ? '用户信息已更新' : '用户添加成功')
    dialogVisible.value = false
    fetchUsers()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    saving.value = false
  }
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

.w-full { width: 100%; }
</style>
