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

    <div class="cyber-card">
      <div class="card-header"><h2>权限矩阵</h2><span class="hint-text">按模块查看每个角色可用能力</span></div>
      <div class="permission-groups">
        <div v-for="group in permissionGroups" :key="group.name" class="permission-group">
          <div class="group-title">{{ group.name }}</div>
          <div class="perm-list">
            <span v-for="p in group.items" :key="p" class="perm-chip">{{ p }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑权限对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="92vw" class="mobile-safe-dialog" append-to-body>
      <el-form label-width="80px" class="permission-form">
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
import { computed, ref, onMounted } from 'vue'
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

const permissionGroups = computed(() => {
  const groups: Record<string, string[]> = {
    '数据看板': [],
    '用户与财务': [],
    '运营内容': [],
    '客服自动化': [],
    'AI与模型': [],
    '系统安全': [],
  }
  allPermissions.value.forEach(p => {
    if (p.startsWith('dashboard')) groups['数据看板'].push(p)
    else if (p.startsWith('users') || p.startsWith('finance') || p.startsWith('payment') || p.startsWith('withdraw') || p.startsWith('commission')) groups['用户与财务'].push(p)
    else if (p.startsWith('content') || p.startsWith('campaign') || p.startsWith('coupon') || p.startsWith('message')) groups['运营内容'].push(p)
    else if (p.startsWith('faq') || p.startsWith('ticket') || p.startsWith('feedback') || p.startsWith('automation')) groups['客服自动化'].push(p)
    else if (p.startsWith('tools') || p.startsWith('ai') || p.startsWith('model')) groups['AI与模型'].push(p)
    else groups['系统安全'].push(p)
  })
  return Object.entries(groups).map(([name, items]) => ({ name, items }))
})

async function fetchData() {
  loading.value = true
  try {
    const res = await service.get('/admin/permissions')
    if (res.data.code === 0) {
      const d = res.data.data
      roles.value = d.roles || []
      allPermissions.value = d.permissions || d.allPermissions || []
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
  if (!editForm.value.displayName.trim()) {
    ElMessage.warning('请输入角色名称')
    return
  }
  saving.value = true
  try {
    const payload = {
      permissions: editForm.value.permissions,
      displayName: editForm.value.displayName,
      description: editForm.value.description,
    }
    const res = editingRoleId.value
      ? await service.put(`/admin/permissions/${editingRoleId.value}`, payload)
      : await service.post('/admin/permissions', payload)
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
.hint-text { color: #8888aa; font-size: 12px; }
.permission-groups { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
.permission-group { background: rgba(0,240,255,0.04); border: 1px solid rgba(0,240,255,0.12); border-radius: 10px; padding: 14px; }
.group-title { color: #00f0ff; font-weight: 700; font-size: 13px; margin-bottom: 10px; }
.perm-list { display: flex; flex-wrap: wrap; gap: 8px; }
.perm-chip { color: #d8e7ff; border: 1px solid rgba(0,240,255,0.18); background: rgba(0,0,0,0.25); border-radius: 999px; padding: 4px 8px; font-size: 11px; font-family: 'JetBrains Mono', monospace; }
.cyber-table { --el-table-bg-color: transparent; --el-table-tr-bg-color: transparent; --el-table-header-bg-color: rgba(0,240,255,0.05); --el-table-row-hover-bg-color: rgba(0,240,255,0.08); --el-table-border-color: rgba(0,240,255,0.1); --el-table-text-color: #e0e0ff; --el-table-header-text-color: #00f0ff; }

:deep(.mobile-safe-dialog) {
  max-width: 520px;
  margin: 8vh auto 0 !important;
}
:deep(.mobile-safe-dialog .el-dialog__body) {
  max-height: 62vh;
  overflow-y: auto;
}
:deep(.mobile-safe-dialog .el-dialog__footer) {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}
@media (max-width: 640px) {
  .cyber-page { padding: 1rem; }
  .permission-form :deep(.el-form-item) {
    display: block;
  }
  .permission-form :deep(.el-form-item__label) {
    width: auto !important;
    display: block;
    text-align: left;
    margin-bottom: 6px;
  }
  .permission-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}
</style>
