<template>
  <div class="cyber-page">
    <div class="page-header"><h1>🔐 权限管理</h1><p class="subtitle">角色权限配置与管理</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-info"><div class="stat-value">{{ stats.totalRoles ?? '-' }}</div><div class="stat-label">角色总数</div></div></div>
      <div class="stat-card"><div class="stat-icon">🔑</div><div class="stat-info"><div class="stat-value">{{ stats.totalPermissions ?? '-' }}</div><div class="stat-label">权限项</div></div></div>
      <div class="stat-card"><div class="stat-icon">👤</div><div class="stat-info"><div class="stat-value">{{ stats.assignedUsers ?? '-' }}</div><div class="stat-label">已分配用户</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>角色列表</h2><el-button type="primary" size="small" @click="openCreateDialog">+ 新建角色</el-button></div>
      <el-table :data="roles" style="width: 100%" class="cyber-table" v-loading="loading">
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="userCount" label="用户数" width="100" />
        <el-table-column prop="permissionCount" label="权限数" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === '启用' ? 'success' : 'info'" size="small" effect="dark">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }"><el-button size="small" type="primary" link @click="openEditDialog(row)">编辑</el-button><el-button size="small" type="danger" link @click="deleteRole(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑权限对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.displayName" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="权限">
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <el-checkbox v-for="p in allPermissions" :key="p" :label="p" v-model="editForm.permissions">{{ p }}</el-checkbox>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRole" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import service from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const saving = ref(false)
const roles = ref<any[]>([])
const allPermissions = ref<string[]>([])
const stats = ref<any>({})
const dialogVisible = ref(false)
const dialogTitle = ref('编辑角色')
const editingRoleId = ref<number | null>(null)
const editForm = ref({ displayName: '', description: '', permissions: [] as string[] })

async function fetchData() {
  loading.value = true
  try {
    const res = await service.get('/admin/permissions')
    if (res.data.code === 0) {
      const d = res.data.data
      roles.value = d.roles || []
      allPermissions.value = d.permissions || []
      stats.value = d.stats || {}
    }
  } catch {
    ElMessage.error('加载权限数据失败')
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  editingRoleId.value = null
  dialogTitle.value = '新建角色'
  editForm.value = { displayName: '', description: '', permissions: [] }
  dialogVisible.value = true
}

function openEditDialog(row: any) {
  editingRoleId.value = row.id
  dialogTitle.value = '编辑角色'
  editForm.value = {
    displayName: row.displayName || row.name || '',
    description: row.description || '',
    permissions: row.permissions ? [...row.permissions] : [],
  }
  dialogVisible.value = true
}

async function saveRole() {
  if (!editingRoleId.value) {
    ElMessage.warning('请选择要编辑的角色')
    return
  }
  saving.value = true
  try {
    const res = await service.put(`/admin/permissions/${editingRoleId.value}`, {
      permissions: editForm.value.permissions,
      displayName: editForm.value.displayName,
      description: editForm.value.description,
    })
    if (res.data.code === 0) {
      ElMessage.success('保存成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.message || '保存失败')
    }
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

async function deleteRole(row: any) {
  try {
    await ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗？`, '确认删除', { type: 'warning' })
    const res = await service.delete(`/admin/permissions/${row.id}`)
    if (res.data.code === 0) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(fetchData)
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
