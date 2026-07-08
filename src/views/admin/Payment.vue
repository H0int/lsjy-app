<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">支付渠道</h2>
      <div class="flex gap-2">
        <el-button @click="loadData">刷新</el-button>
        <el-button type="primary" @click="openDialog()">+ 新增渠道</el-button>
      </div>
    </div>

    <div class="cyber-card p-4">
      <el-table :data="list" stripe v-loading="loading" empty-text="暂无支付渠道">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="名称" min-width="160">
          <template #default="{ row }">
            <span class="text-lg">{{ row.icon }}</span>
            <span class="ml-2">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="channel" label="Channel" width="120" />
        <el-table-column prop="feeRate" label="费率" width="100">
          <template #default="{ row }">{{ row.feeRate }}%</template>
        </el-table-column>
        <el-table-column prop="description" label="说明" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" effect="dark" round>{{ row.status === 'active' ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" link :type="row.status === 'active' ? 'danger' : 'success'" @click="toggleStatus(row)">{{ row.status === 'active' ? '停用' : '启用' }}</el-button>
            <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑渠道' : '新增渠道'" width="450px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="图标"><el-input v-model="form.icon" /></el-form-item>
        <el-form-item label="Channel"><el-input v-model="form.channel" /></el-form-item>
        <el-form-item label="费率"><el-input-number v-model="form.feeRate" :min="0" :max="100" :precision="2" class="w-full" /></el-form-item>
        <el-form-item label="说明"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api'

const loading = ref(false)
const list = ref<any[]>([])
const dialogVisible = ref(false)
const form = reactive<any>({ id: null, name: '', icon: '', channel: '', feeRate: 0.6, description: '', status: 'active' })

async function loadData() {
  loading.value = true
  try {
    const res = await adminApi.getPaymentChannels()
    list.value = res.data || []
  } catch (e: any) { ElMessage.error(e.message || '加载失败') }
  finally { loading.value = false }
}

function openDialog(row?: any) {
  if (row) Object.assign(form, JSON.parse(JSON.stringify(row)))
  else Object.assign(form, { id: null, name: '', icon: '', channel: '', feeRate: 0.6, description: '', status: 'active' })
  dialogVisible.value = true
}

async function toggleStatus(row: any) {
  try {
    const status = row.status === 'active' ? 'inactive' : 'active'
    await adminApi.updatePaymentChannel(row.id, { status })
    ElMessage.success(status === 'active' ? '已启用' : '已停用')
    loadData()
  } catch (e: any) { ElMessage.error(e.message || '操作失败') }
}

async function submit() {
  try {
    if (form.id) await adminApi.updatePaymentChannel(form.id, form)
    else await adminApi.createPaymentChannel(form)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e: any) { ElMessage.error(e.message || '保存失败') }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除渠道「${row.name}」？`)
    await adminApi.deletePaymentChannel(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch { /* cancelled */ }
}

onMounted(loadData)
</script>
