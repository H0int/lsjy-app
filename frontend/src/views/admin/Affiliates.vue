<template>
  <div class="cyber-page">
    <div class="page-header"><h1>🤝 合作伙伴</h1><p class="subtitle">合作伙伴管理与商务对接</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">🤝</div><div class="stat-info"><div class="stat-value">{{ stats.totalPartners }}</div><div class="stat-label">合作伙伴</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">{{ stats.active }}</div><div class="stat-label">活跃合作</div></div></div>
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><div class="stat-value">¥{{ stats.totalRevenue }}</div><div class="stat-label">合作收入</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>合作伙伴列表</h2><el-button type="primary" size="small" @click="openAddDialog">+ 添加伙伴</el-button></div>
      <el-table :data="partners" style="width: 100%" class="cyber-table" v-loading="loading">
        <el-table-column prop="name" label="公司名称" width="180" />
        <el-table-column prop="contact" label="联系人" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="commissionRate" label="佣金比例" width="100">
          <template #default="{ row }"><span style="color: #00f0ff;">{{ row.commissionRate }}%</span></template>
        </el-table-column>
        <el-table-column prop="revenue" label="合作收入" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === '合作中' ? 'success' : 'info'" size="small" effect="dark">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="viewDetail(row)">详情</el-button>
            <el-button size="small" type="warning" link @click="openEditDialog(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

    <!-- 新建/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑合作伙伴' : '添加合作伙伴'" width="500px" destroy-on-close>
      <el-form label-width="90px" class="cyber-form" style="padding: 0 20px;">
        <el-form-item label="公司名称"><el-input v-model="form.name" placeholder="输入公司名称" /></el-form-item>
        <el-form-item label="联系人"><el-input v-model="form.contact" placeholder="输入联系人" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="form.email" placeholder="输入邮箱" /></el-form-item>
        <el-form-item label="佣金比例(%)">
          <el-input-number v-model="form.commissionRate" :min="0" :max="100" :step="0.1" class="w-full" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" class="w-full">
            <el-option label="合作中" value="合作中" />
            <el-option label="洽谈中" value="洽谈中" />
            <el-option label="已终止" value="已终止" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePartner">保存</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="合作伙伴详情" width="500px" destroy-on-close>
      <div v-if="currentPartner" style="padding: 0 20px;">
        <h3 style="color: #00f0ff; margin-bottom: 12px;">{{ currentPartner.name }}</h3>
        <p style="color: #8888aa; font-size: 13px; margin-bottom: 8px;">
          联系人: {{ currentPartner.contact }} | 邮箱: {{ currentPartner.email }}
        </p>
        <p style="color: #8888aa; font-size: 13px; margin-bottom: 12px;">
          佣金比例: {{ currentPartner.commissionRate }}% | 合作收入: {{ currentPartner.revenue }} | 状态: {{ currentPartner.status }}
        </p>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import service from '@/api/request'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const stats = ref({ totalPartners: 0, active: 0, totalRevenue: '0' })
const partners = ref<any[]>([])

// 新建/编辑弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({ name: '', contact: '', email: '', commissionRate: 0, status: '合作中' })
const editingId = ref<number | null>(null)

// 详情弹窗
const detailDialogVisible = ref(false)
const currentPartner = ref<any>(null)

async function fetchData() {
  loading.value = true
  try {
    const res = await service.get('/admin/affiliates')
    if (res.data.code === 0) {
      const data = res.data.data
      partners.value = data.affiliates || []
      const s = data.stats || {}
      stats.value = {
        totalPartners: s.total || 0,
        active: s.active || 0,
        totalRevenue: s.revenue || '0'
      }
    }
  } catch (e) {
    ElMessage.error('加载合作伙伴数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

function openAddDialog() {
  isEdit.value = false
  editingId.value = null
  form.value = { name: '', contact: '', email: '', commissionRate: 0, status: '合作中' }
  dialogVisible.value = true
}

async function createPartner() {
  if (!form.value.name) {
    ElMessage.warning('请输入公司名称')
    return
  }
  try {
    const res = await service.post('/admin/affiliates', {
      name: form.value.name,
      contact: form.value.contact,
      email: form.value.email,
      commissionRate: form.value.commissionRate,
      status: form.value.status
    })
    if (res.data.code === 0) {
      ElMessage.success('添加成功')
      dialogVisible.value = false
      fetchData()
    }
  } catch (e) {
    ElMessage.error('添加失败')
  }
}

function openEditDialog(row: any) {
  isEdit.value = true
  editingId.value = row.id
  form.value = {
    name: row.name || '',
    contact: row.contact || '',
    email: row.email || '',
    commissionRate: row.commissionRate || 0,
    status: row.status || '合作中'
  }
  dialogVisible.value = true
}

async function updatePartner() {
  if (!form.value.name) {
    ElMessage.warning('请输入公司名称')
    return
  }
  try {
    const res = await service.put(`/admin/affiliates/${editingId.value}`, {
      name: form.value.name,
      contact: form.value.contact,
      email: form.value.email,
      commissionRate: form.value.commissionRate,
      status: form.value.status
    })
    if (res.data.code === 0) {
      ElMessage.success('更新成功')
      dialogVisible.value = false
      fetchData()
    }
  } catch (e) {
    ElMessage.error('更新失败')
  }
}

function savePartner() {
  if (isEdit.value) {
    updatePartner()
  } else {
    createPartner()
  }
}

function viewDetail(row: any) {
  currentPartner.value = row
  detailDialogVisible.value = true
}
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
.w-full { width: 100%; }
</style>
