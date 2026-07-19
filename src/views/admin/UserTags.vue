<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">用户标签</h2>
      <el-button type="primary" @click="openDialog()">+ 新增标签</el-button>
    </div>
    <div class="cyber-card p-4">
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="name" label="标签名称">
          <template #default="{ row }">
            <el-tag :color="row.color" effect="dark">{{ row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" />
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑标签' : '新增标签'" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="form.color" />
        </el-form-item>
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
import { formatDate } from '@/utils'

const loading = ref(false)
const list = ref<any[]>([])
const dialogVisible = ref(false)
const form = reactive<any>({ id: null, name: '', color: '#00f0ff', description: '' })

async function loadData() {
  loading.value = true
  try {
    const res = await adminApi.getUserTags()
    list.value = res.data || []
  } catch (e: any) { console.warn('[API] 加载失败:', e?.message) }
  finally { loading.value = false }
}

function openDialog(row?: any) {
  if (row) Object.assign(form, JSON.parse(JSON.stringify(row)))
  else Object.assign(form, { id: null, name: '', color: '#00f0ff', description: '' })
  dialogVisible.value = true
}

async function submit() {
  try {
    if (form.id) await adminApi.updateUserTag(form.id, form)
    else await adminApi.createUserTag(form)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e: any) { console.warn('[API] 保存失败:', e?.message) }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除标签「${row.name}」？`)
    await adminApi.deleteUserTag(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch { /* cancelled */ }
}

onMounted(loadData)
</script>
