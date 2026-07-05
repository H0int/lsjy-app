<template>
  <div>
    <!-- 顶部统计卡片 -->
    <div class="cyber-grid-4 mb-6">
      <div class="cyber-stat-mini">
        <p class="stat-lbl">智能体总数</p>
        <p class="stat-num text-white">{{ agents.length }}</p>
        <p class="stat-change change-up">↑ 活跃 {{ agents.filter(a=>a.status==='active').length }}</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-lbl">今日调用</p>
        <p class="stat-num text-cyan-400">{{ todayCalls.toLocaleString() }}</p>
        <p class="stat-change change-up">前端实时同步</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-lbl">本月Token消耗</p>
        <p class="stat-num text-purple-400">{{ monthlyTokens.toLocaleString() }}</p>
        <p class="stat-change change-up">真实Token统计</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-lbl">平均响应时间</p>
        <p class="stat-num text-green-400">{{ avgLatency }}ms</p>
        <p class="stat-change change-up">按真实调用计算</p>
      </div>
    </div>

    <div class="cyber-toolbar">
      <div class="toolbar-left">
        <el-input v-model="search" placeholder="搜索智能体..." class="cyber-input w-64" clearable />
        <el-select v-model="statusFilter" placeholder="状态筛选" class="cyber-input w-36" clearable>
          <el-option label="已启用" value="active" />
          <el-option label="已禁用" value="disabled" />
        </el-select>
      </div>
      <el-button type="primary" @click="openDialog()">+ 新建智能体</el-button>
    </div>

    <!-- 桌面端表格 -->
    <div class="hidden md:block">
      <el-table :data="filteredAgents" stripe class="cyber-table">
        <el-table-column label="智能体" min-width="220">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ row.icon }}</span>
              <div>
                <div class="font-medium text-white">{{ row.name }}</div>
                <div class="text-xs text-[#4a4a6a]">{{ row.description }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="关联模型" width="140">
          <template #default="{ row }">
            <span class="cyber-tag tag-purple">{{ row.model }}</span>
          </template>
        </el-table-column>
        <el-table-column label="温度" width="80">
          <template #default="{ row }">
            <span class="font-mono text-[#a0a0cc]">{{ row.temperature }}</span>
          </template>
        </el-table-column>
        <el-table-column label="调用次数" width="110">
          <template #default="{ row }">
            <span class="font-mono text-[#00f0ff]">{{ row.totalCalls.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="今日调用" width="100">
          <template #default="{ row }">
            <span class="font-mono text-[#00ff88]">{{ (row.todayCalls || 0).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="本月Token" width="120">
          <template #default="{ row }">
            <span class="font-mono text-[#c084fc]">{{ (row.monthlyTokens || 0).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="active" inactive-value="disabled"
              @change="toggleAgent(row)" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" link type="primary" @click="viewChatLogs(row)">对话记录</el-button>
            <el-button size="small" link type="danger" @click="deleteAgent(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 移动端卡片 -->
    <div class="md:hidden space-y-3">
      <div v-for="row in filteredAgents" :key="row.id" class="cyber-card p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">{{ row.icon }}</span>
            <span class="font-medium text-white">{{ row.name }}</span>
          </div>
          <el-switch v-model="row.status" active-value="active" inactive-value="disabled"
            @change="toggleAgent(row)" size="small" />
        </div>
        <p class="text-xs text-[#6a6a8a] mb-3">{{ row.description }}</p>
        <div class="flex items-center gap-2 flex-wrap mb-3">
          <span class="cyber-tag tag-purple">{{ row.model }}</span>
          <span class="cyber-tag tag-cyan">温度 {{ row.temperature }}</span>
          <span class="cyber-tag tag-green">{{ row.totalCalls.toLocaleString() }} 次调用</span>
          <span class="cyber-tag tag-cyan">今日 {{ row.todayCalls || 0 }}</span>
          <span class="cyber-tag tag-purple">{{ (row.monthlyTokens || 0).toLocaleString() }} Token</span>
        </div>
        <div class="flex gap-2">
          <el-button size="small" type="primary" plain @click="openDialog(row)" class="flex-1">编辑</el-button>
          <el-button size="small" plain @click="viewChatLogs(row)" class="flex-1">对话记录</el-button>
        </div>
      </div>
    </div>

    <!-- 新建/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEditing ? '编辑智能体' : '新建智能体'" width="620px" destroy-on-close>
      <el-form :model="form" label-width="110px" class="cyber-form">
        <div class="form-row">
          <el-form-item label="智能体名称">
            <el-input v-model="form.name" placeholder="如：代码助手" />
          </el-form-item>
          <el-form-item label="图标">
            <el-input v-model="form.icon" placeholder="emoji" />
          </el-form-item>
        </div>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="智能体功能描述" />
        </el-form-item>
        <el-form-item label="系统提示词">
          <el-input v-model="form.systemPrompt" type="textarea" :rows="4" placeholder="You are a helpful assistant..." />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="关联模型">
            <el-select v-model="form.model" placeholder="选择模型" class="w-full">
              <el-option v-for="m in modelOptions" :key="m" :label="m" :value="m" />
            </el-select>
          </el-form-item>
          <el-form-item label="温度参数">
            <el-slider v-model="form.temperature" :min="0" :max="2" :step="0.1" show-input />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="最大Token数">
            <el-input-number v-model="form.maxTokens" :min="256" :max="128000" :step="256" class="w-full" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="form.status" class="w-full">
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 对话记录弹窗 -->
    <el-dialog v-model="chatLogVisible" :title="'对话记录 - ' + currentAgentName" width="700px" destroy-on-close>
      <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        <div v-for="log in chatLogs" :key="log.id" class="cyber-card p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-[#6a6a8a]">{{ log.time }}</span>
            <span class="text-xs text-[#4a4a6a]">用户: {{ log.userName }}</span>
          </div>
          <div class="text-sm text-[#a0a0cc] mb-1">
            <span class="text-[#00f0ff]">Q:</span> {{ log.question }}
          </div>
          <div class="text-sm text-[#8888aa]">
            <span class="text-[#7c3aed]">A:</span> {{ log.answer }}
          </div>
          <div class="flex gap-3 mt-2 text-xs text-[#4a4a6a]">
            <span>Tokens: {{ log.tokens }}</span>
            <span>延迟: {{ log.latency }}ms</span>
            <span>评分: {{ log.rating }}⭐</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import service from '@/api/request'

const search = ref('')
const statusFilter = ref('')
const dialogVisible = ref(false)
const chatLogVisible = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const loading = ref(false)
const currentAgentName = ref('')
const editingId = ref<number | null>(null)

const todayCalls = ref(0)
const monthlyTokens = ref(0)
const avgLatency = ref(0)

const modelOptions = [
  'Doubao-Pro-32K', 'Doubao-Pro-4K', 'Doubao-Lite-32K',
  'DeepSeek-V3', 'DeepSeek-R1',
  '即梦 2.1', '即梦 2.0 Pro',
  '元宝 Pro', '元宝 Lite',
  'Qwen-Max', 'Qwen-Plus', 'Qwen-Turbo',
  'GPT-4o', 'GPT-4o Mini', 'GPT-4 Turbo',
]

const agents = ref<any[]>([])

const chatLogs = ref<any[]>([])

const form = ref({
  name: '', icon: '', description: '', systemPrompt: '',
  model: 'GPT-4o', temperature: 0.7, maxTokens: 4096, status: 'active'
})

const filteredAgents = computed(() => {
  let list = agents.value
  if (search.value) list = list.filter(a => a.name.includes(search.value) || a.description.includes(search.value))
  if (statusFilter.value) list = list.filter(a => a.status === statusFilter.value)
  return list
})

async function fetchAgents() {
  loading.value = true
  try {
    const res = await service.get('/admin/agents')
    if (res.data.code === 0) {
      agents.value = res.data.data.agents || res.data.data.list || []
      const stats = res.data.data.stats || {}
      todayCalls.value = stats.todayCalls || 0
      monthlyTokens.value = stats.monthlyTokens || 0
      avgLatency.value = stats.avgLatency || 0
    }
  } catch (e) {
    ElMessage.error('加载智能体列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchAgents)

function openDialog(agent?: any) {
  if (agent) {
    isEditing.value = true
    editingId.value = agent.id
    form.value = { name: agent.name, icon: agent.icon, description: agent.description, systemPrompt: agent.systemPrompt, model: agent.model, temperature: agent.temperature, maxTokens: agent.maxTokens, status: agent.status }
  } else {
    isEditing.value = false
    editingId.value = null
    form.value = { name: '', icon: '🤖', description: '', systemPrompt: '', model: 'GPT-4o', temperature: 0.7, maxTokens: 4096, status: 'active' }
  }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.value.name.trim()) return ElMessage.warning('请输入名称')
  saving.value = true
  try {
    if (isEditing.value && editingId.value) {
      const res = await service.put(`/admin/agents/${editingId.value}`, { ...form.value })
      if (res.data.code === 0) {
        const idx = agents.value.findIndex(a => a.id === editingId.value)
        if (idx >= 0) Object.assign(agents.value[idx], { ...form.value })
        ElMessage.success('智能体已更新')
        dialogVisible.value = false
      }
    } else {
      const res = await service.post('/admin/agents', { ...form.value })
      if (res.data.code === 0) {
        agents.value.push({ id: Date.now(), ...form.value, totalCalls: 0 })
        ElMessage.success('智能体创建成功')
        dialogVisible.value = false
        fetchAgents()
      }
    }
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

async function toggleAgent(agent: any) {
  try {
    const res = await service.put(`/admin/agents/${agent.id}`, { status: agent.status })
    if (res.data.code === 0) {
      ElMessage.success(`智能体「${agent.name}」已${agent.status === 'active' ? '启用' : '禁用'}`)
    }
  } catch (e) {
    agent.status = agent.status === 'active' ? 'disabled' : 'active'
    ElMessage.error('操作失败')
  }
}

async function viewChatLogs(agent: any) {
  currentAgentName.value = agent.name
  chatLogVisible.value = true
  try {
    const res = await service.get(`/admin/chat-logs`, { params: { search: '', toolName: agent.name, page: 1, pageSize: 50 } })
    if (res.data.code === 0) {
      chatLogs.value = res.data.data.logs || []
    }
  } catch (e) {
    chatLogs.value = []
  }
}

function deleteAgent(agent: any) {
  ElMessageBox.confirm(`确认删除智能体「${agent.name}」？`).then(async () => {
    try {
      const res = await service.put(`/admin/agents/${agent.id}`, { status: 'disabled' })
      if (res.data.code === 0) {
        agents.value = agents.value.filter(a => a.id !== agent.id)
        ElMessage.success('已删除')
      }
    } catch (e) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.cyber-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.toolbar-left { display: flex; gap: 12px; }
.cyber-input { flex-shrink: 0; }
.w-full { width: 100%; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.flex-1 { flex: 1; }
.flex-wrap { flex-wrap: wrap; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-6 { margin-bottom: 24px; }
.mt-2 { margin-top: 8px; }
.space-y-3 > * + * { margin-top: 12px; }
.max-h-\[500px\] { max-height: 500px; }
.overflow-y-auto { overflow-y: auto; }
.pr-2 { padding-right: 8px; }
.p-3 { padding: 12px; }
.p-4 { padding: 16px; }

.cyber-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}
.tag-purple { background: rgba(124,58,237,0.15); color: #c084fc; border: 1px solid rgba(124,58,237,0.3); }
.tag-cyan { background: rgba(0,240,255,0.1); color: #00f0ff; border: 1px solid rgba(0,240,255,0.2); }
.tag-green { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }

.text-cyan-400 { color: #00f0ff; }
.text-purple-400 { color: #c084fc; }
.text-green-400 { color: #00ff88; }
.text-white { color: #fff; }
.font-mono { font-family: 'Courier New', monospace; }
.font-medium { font-weight: 600; }
.text-xs { font-size: 11px; }
.text-sm { font-size: 13px; }
.text-xl { font-size: 20px; }
.text-2xl { font-size: 24px; }

@media (max-width: 767px) {
  .hidden { display: none; }
  .md\:hidden { display: none; }
  .md\:block { display: none; }
  .cyber-grid-4 { grid-template-columns: 1fr 1fr !important; }
}
@media (min-width: 768px) {
  .md\:hidden { display: block; }
  .md\:block { display: block; }
}
</style>
