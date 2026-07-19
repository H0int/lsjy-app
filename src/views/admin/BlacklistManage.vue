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
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.type === 'ip' ? 'IP' : row.type === 'account' ? '账号' : '混合' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" />
        <el-table-column prop="duration" label="封禁时长" width="100" />
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

    <el-dialog v-model="dialogVisible" title="添加黑名单" width="450px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="类型">
          <el-radio-group v-model="form.type">
            <el-radio-button label="account">账号</el-radio-button>
            <el-radio-button label="ip">IP</el-radio-button>
            <el-radio-button label="mixed">混合</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="用户名" v-if="form.type !== 'ip'">
          <el-input v-model="form.username" placeholder="请输入要封禁的用户名" />
        </el-form-item>
        <el-form-item label="IP" v-if="form.type !== 'account'">
          <el-input v-model="form.ip" placeholder="请输入要封禁的IP" />
        </el-form-item>
        <el-form-item label="封禁时长">
          <el-select v-model="form.duration" placeholder="请选择封禁时长" class="w-full">
            <el-option label="1小时" value="1h" />
            <el-option label="24小时" value="24h" />
            <el-option label="7天" value="7d" />
            <el-option label="30天" value="30d" />
            <el-option label="永久" value="permanent" />
          </el-select>
        </el-form-item>
        <el-form-item label="原因">
          <el-select v-model="form.reason" placeholder="请选择原因" class="w-full" allow-create filterable>
            <el-option label="恶意刷屏" value="恶意刷屏" />
            <el-option label="异常登录" value="异常登录" />
            <el-option label="违规内容" value="违规内容" />
            <el-option label="攻击行为" value="攻击行为" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="补充说明" />
        </el-form-item>
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
const form = reactive<any>({ username: '', ip: '', type: 'mixed', duration: 'permanent', reason: '', remark: '' })

async function loadData() {
  loading.value = true
  try {
    const res = await adminApi.getBlacklist()
    list.value = res.data || []
  } catch (e: any) { console.warn('[API] 加载失败:', e?.message) }
  finally { loading.value = false }
}

function openDialog() {
  Object.assign(form, { username: '', ip: '', type: 'mixed', duration: 'permanent', reason: '', remark: '' })
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
