<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">黑名单管理</h2>
      <el-button type="primary" @click="openDialog()">+ 添加黑名单</el-button>
    </div>
    <div class="cyber-card p-4">
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="ip" label="IP" />
        <el-table-column prop="reason" label="原因" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="createdAt" label="添加时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" link type="danger" @click="handleDelete(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" title="添加黑名单" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名"><el-input v-model="form.username" placeholder="可选" /></el-form-item>
        <el-form-item label="IP"><el-input v-model="form.ip" placeholder="可选" /></el-form-item>
        <el-form-item label="原因"><el-input v-model="form.reason" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">添加</el-button>
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
const form = reactive<any>({ username: '', ip: '', reason: '' })

async function loadData() {
  loading.value = true
  try {
    const res = await adminApi.getBlacklist()
    list.value = res.data || []
  } catch (e: any) { ElMessage.error(e.message || '加载失败') }
  finally { loading.value = false }
}

function openDialog() {
  Object.assign(form, { username: '', ip: '', reason: '' })
  dialogVisible.value = true
}

async function submit() {
  if (!form.username && !form.ip) {
    ElMessage.warning('用户名或IP至少填一个')
    return
  }
  try {
    await adminApi.createBlacklist(form)
    ElMessage.success('添加成功')
    dialogVisible.value = false
    loadData()
  } catch (e: any) { ElMessage.error(e.message || '添加失败') }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确认移除该黑名单？')
    await adminApi.deleteBlacklist(row.id)
    ElMessage.success('移除成功')
    loadData()
  } catch { /* cancelled */ }
}

onMounted(loadData)
</script>
