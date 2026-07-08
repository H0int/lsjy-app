<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">Boss 充值卡</h2>
      <div class="flex gap-2">
        <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 120px;">
          <el-option label="未使用" value="unused" />
          <el-option label="已使用" value="used" />
        </el-select>
        <el-button @click="loadData">刷新</el-button>
        <el-button type="primary" @click="openDialog">批量生成</el-button>
        <el-button @click="exportData">导出</el-button>
      </div>
    </div>

    <div class="cyber-card p-4 mb-4">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div class="p-3 rounded" style="background:#0d0d1a;">
          <div class="text-xs" style="color:#808099;">总卡数</div>
          <div class="text-xl font-bold" style="color:#00f0ff;">{{ stats.total }}</div>
        </div>
        <div class="p-3 rounded" style="background:#0d0d1a;">
          <div class="text-xs" style="color:#808099;">未使用</div>
          <div class="text-xl font-bold" style="color:#00f0ff;">{{ stats.unused }}</div>
        </div>
        <div class="p-3 rounded" style="background:#0d0d1a;">
          <div class="text-xs" style="color:#808099;">已使用</div>
          <div class="text-xl font-bold" style="color:#00f0ff;">{{ stats.used }}</div>
        </div>
      </div>
    </div>

    <div class="cyber-card p-4">
      <el-table :data="list" stripe v-loading="loading" empty-text="暂无充值卡">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="code" label="卡号" />
        <el-table-column prop="amount" label="金额" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'unused' ? 'success' : 'info'" effect="dark" round>{{ row.status === 'unused' ? '未使用' : '已使用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="usedBy" label="使用者" width="120" />
        <el-table-column prop="usedAt" label="使用时间" width="160">
          <template #default="{ row }">{{ formatDate(row.usedAt) }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" title="批量生成充值卡" width="400px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="金额"><el-input-number v-model="form.amount" :min="1" class="w-full" /></el-form-item>
        <el-form-item label="数量"><el-input-number v-model="form.count" :min="1" :max="100" class="w-full" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api'
import { formatDate } from '@/utils'

const loading = ref(false)
const list = ref<any[]>([])
const statusFilter = ref('')
const dialogVisible = ref(false)
const form = reactive({ amount: 100, count: 10 })

const filteredList = computed(() => statusFilter.value ? list.value.filter(c => c.status === statusFilter.value) : list.value)
const stats = computed(() => {
  return { total: list.value.length, unused: list.value.filter(c => c.status === 'unused').length, used: list.value.filter(c => c.status === 'used').length }
})

async function loadData() {
  loading.value = true
  try {
    const res = await adminApi.getBossCards()
    list.value = res.data?.items || []
  } catch (e: any) { ElMessage.error(e.message || '加载失败') }
  finally { loading.value = false }
}

function openDialog() { dialogVisible.value = true }

async function submit() {
  try {
    await adminApi.createBossCards(form)
    ElMessage.success('生成成功')
    dialogVisible.value = false
    loadData()
  } catch (e: any) { ElMessage.error(e.message || '生成失败') }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除充值卡 ${row.code}？`)
    await adminApi.deleteBossCard(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch { /* cancelled */ }
}

function exportData() {
  const csv = ['卡号,金额,状态,使用者,使用时间,创建时间'].join(',') + '\n' + list.value.map(r => [r.code, r.amount, r.status, r.usedBy, formatDate(r.usedAt), formatDate(r.createdAt)].join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `boss-cards-${new Date().toISOString().slice(0,10)}.csv`
  link.click()
}

onMounted(loadData)
</script>
