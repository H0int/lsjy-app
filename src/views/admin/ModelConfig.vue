<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">模型配置</h2>
      <div class="flex gap-2">
        <el-button @click="loadData">刷新</el-button>
        <el-button type="primary" @click="openDialog()">+ 新增模型</el-button>
        <el-button @click="exportData">导出</el-button>
      </div>
    </div>
    <div class="cyber-card p-4">
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="provider" label="提供商" width="120" />
        <el-table-column prop="model" label="模型ID" width="160" />
        <el-table-column prop="temperature" label="温度" width="90" />
        <el-table-column prop="maxTokens" label="MaxTokens" width="110" />
        <el-table-column prop="coinCost" label="消耗" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'primary' : 'info'" effect="dark" round>
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" link :type="row.status === 'active' ? 'danger' : 'success'" @click="toggleStatus(row)">
              {{ row.status === 'active' ? '停用' : '启用' }}
            </el-button>
            <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑模型' : '新增模型'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="提供商"><el-input v-model="form.provider" /></el-form-item>
        <el-form-item label="模型ID"><el-input v-model="form.model" /></el-form-item>
        <el-form-item label="温度"><el-slider v-model="form.temperature" :min="0" :max="2" :step="0.1" show-stops /></el-form-item>
        <el-form-item label="MaxTokens"><el-input-number v-model="form.maxTokens" :min="1" :max="32000" class="w-full" /></el-form-item>
        <el-form-item label="消耗"><el-input-number v-model="form.coinCost" :min="0" class="w-full" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
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
const form = reactive<any>({ id: null, name: '', provider: '', model: '', temperature: 0.7, maxTokens: 4096, coinCost: 0, description: '', status: 'active' })

async function loadData() {
  loading.value = true
  try {
    const res = await adminApi.getModelConfigs()
    list.value = res.data || []
  } catch (e: any) { console.warn('[API] 加载失败:', e?.message) }
  finally { loading.value = false }
}

function openDialog(row?: any) {
  if (row) Object.assign(form, JSON.parse(JSON.stringify(row)))
  else Object.assign(form, { id: null, name: '', provider: '', model: '', temperature: 0.7, maxTokens: 4096, coinCost: 0, description: '', status: 'active' })
  dialogVisible.value = true
}

async function toggleStatus(row: any) {
  try {
    const status = row.status === 'active' ? 'inactive' : 'active'
    await adminApi.updateModelConfig(row.id, { status })
    ElMessage.success(status === 'active' ? '已启用' : '已停用')
    loadData()
  } catch (e: any) { console.warn('[API] 操作失败:', e?.message) }
}

async function submit() {
  try {
    if (form.id) await adminApi.updateModelConfig(form.id, form)
    else await adminApi.createModelConfig(form)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e: any) { console.warn('[API] 保存失败:', e?.message) }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除模型「${row.name}」？`)
    await adminApi.deleteModelConfig(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch { /* cancelled */ }
}

function exportData() {
  const csv = [
    ['ID','名称','提供商','模型ID','温度','MaxTokens','消耗','状态'].join(','),
    ...list.value.map(r => [r.id, r.name, r.provider, r.model, r.temperature, r.maxTokens, r.coinCost, r.status].join(','))
  ].join('\n')
  const blob = new Blob(['\ufeff'+csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `model-configs-${new Date().toISOString().slice(0,10)}.csv`
  link.click()
}

onMounted(loadData)
</script>
