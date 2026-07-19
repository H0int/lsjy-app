<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">AI 智能体</h2>
      <div class="flex gap-2">
        <el-button @click="loadData">刷新</el-button>
        <el-button type="primary" @click="openDialog()">+ 新增智能体</el-button>
        <el-button @click="exportData">导出</el-button>
      </div>
    </div>
    <div class="cyber-card p-4">
      <el-table :data="list" stripe v-loading="loading" style="width:100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="model" label="模型" width="140" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="coinCost" label="消耗" width="80" />
        <el-table-column prop="usageCount" label="使用次数" width="100" />
        <el-table-column prop="todayCalls" label="今日调用" width="100" />
        <el-table-column prop="monthlyTokens" label="本月Tokens" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'primary' : 'info'" effect="dark" round>
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="viewDetail(row)">详情</el-button>
            <el-button size="small" link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" link :type="row.status === 'active' ? 'danger' : 'success'" @click="toggleStatus(row)">
              {{ row.status === 'active' ? '停用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑智能体' : '新增智能体'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="模型"><el-input v-model="form.model" /></el-form-item>
        <el-form-item label="分类"><el-input v-model="form.category" /></el-form-item>
        <el-form-item label="消耗"><el-input-number v-model="form.coinCost" :min="0" class="w-full" /></el-form-item>
        <el-form-item label="温度"><el-slider v-model="form.temperature" :min="0" :max="2" :step="0.1" show-stops /></el-form-item>
        <el-form-item label="MaxTokens"><el-input-number v-model="form.maxTokens" :min="1" :max="32000" class="w-full" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="智能体详情" width="500px">
      <div v-if="detail" class="space-y-2 text-sm" style="color:#e0e0ff;">
        <div><span style="color:#808099;">ID:</span> {{ detail.id }}</div>
        <div><span style="color:#808099;">名称:</span> {{ detail.name }}</div>
        <div><span style="color:#808099;">模型:</span> {{ detail.model }}</div>
        <div><span style="color:#808099;">总调用:</span> {{ detail.totalCalls }}</div>
        <div><span style="color:#808099;">今日调用:</span> {{ detail.todayCalls }}</div>
        <div><span style="color:#808099;">总Tokens:</span> {{ detail.totalTokens }}</div>
        <div><span style="color:#808099;">平均延迟:</span> {{ detail.avgLatency }}ms</div>
        <div><span style="color:#808099;">描述:</span> {{ detail.description || '-' }}</div>
      </div>
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
const detailVisible = ref(false)
const detail = ref<any>(null)
const form = reactive<any>({ id: null, name: '', model: '', category: '', coinCost: 0, temperature: 0.7, maxTokens: 4096, description: '' })

async function loadData() {
  loading.value = true
  try {
    const res = await adminApi.getAdminAgents()
    list.value = res.data?.list || res.data?.items || res.data || []
  } catch (e: any) { console.warn('[API] 加载失败:', e?.message) }
  finally { loading.value = false }
}

function openDialog(row?: any) {
  if (row) Object.assign(form, JSON.parse(JSON.stringify(row)))
  else Object.assign(form, { id: null, name: '', model: '', category: '', coinCost: 0, temperature: 0.7, maxTokens: 4096, description: '' })
  dialogVisible.value = true
}

function viewDetail(row: any) {
  detail.value = row
  detailVisible.value = true
}

async function toggleStatus(row: any) {
  try {
    const status = row.status === 'active' ? 'inactive' : 'active'
    await adminApi.updateAgentStatus(row.id, status)
    ElMessage.success(status === 'active' ? '已启用' : '已停用')
    loadData()
  } catch (e: any) { console.warn('[API] 操作失败:', e?.message) }
}

async function submit() {
  ElMessage.info('保存功能演示：数据已更新本地')
  dialogVisible.value = false
  loadData()
}

function exportData() {
  const csv = [
    ['ID', '名称', '模型', '分类', '消耗', '使用次数', '状态'].join(','),
    ...list.value.map(r => [r.id, r.name, r.model, r.category, r.coinCost, r.usageCount, r.status].join(','))
  ].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `ai-agents-${new Date().toISOString().slice(0,10)}.csv`
  link.click()
}

onMounted(loadData)
</script>
