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
        <p class="stat-change change-up">↑ 12.5%</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-lbl">本月Token消耗</p>
        <p class="stat-num text-purple-400">{{ monthlyTokens.toLocaleString() }}</p>
        <p class="stat-change change-down">↓ 3.2%</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-lbl">平均响应时间</p>
        <p class="stat-num text-green-400">{{ avgLatency }}ms</p>
        <p class="stat-change change-up">↑ 优化8%</p>
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
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const search = ref('')
const statusFilter = ref('')
const dialogVisible = ref(false)
const chatLogVisible = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const currentAgentName = ref('')
const editingId = ref<number | null>(null)

const todayCalls = ref(12847)
const monthlyTokens = ref(3256000)
const avgLatency = ref(342)

const modelOptions = [
  // 豆包
  'Doubao-Pro-32K', 'Doubao-Pro-4K', 'Doubao-Lite-32K',
  // DeepSeek
  'DeepSeek-V3', 'DeepSeek-R1',
  // 即梦
  '即梦 2.1', '即梦 2.0 Pro',
  // 元宝
  '元宝 Pro', '元宝 Lite',
  // 千问
  'Qwen-Max', 'Qwen-Plus', 'Qwen-Turbo',
  // GPT
  'GPT-4o', 'GPT-4o Mini', 'GPT-4 Turbo',
]

const agents = ref([
  { id: 1, name: '罗圣AI', icon: '🧠', description: '罗圣纪元核心AI - 6大模型智能路由，全能力通用助手', model: 'DeepSeek-V3', temperature: 0.7, maxTokens: 8192, systemPrompt: '你是罗圣AI，罗圣纪元平台的智能助手。你可以调用豆包、DeepSeek、即梦、元宝、千问、GPT六大模型，根据用户需求智能选择最优模型。回答专业、高效、友好。', totalCalls: 128500, status: 'active' },
  { id: 2, name: '代码助手', icon: '💻', description: '全栈编程辅助，支持多语言', model: 'DeepSeek-R1', temperature: 0.3, maxTokens: 8192, systemPrompt: 'You are an expert programmer...', totalCalls: 45230, status: 'active' },
  { id: 3, name: '文案创作', icon: '✍️', description: '营销文案、广告语、社交媒体内容生成', model: 'GPT-4o', temperature: 0.8, maxTokens: 4096, systemPrompt: 'You are a creative copywriter...', totalCalls: 28100, status: 'active' },
  { id: 4, name: 'AI文生图', icon: '🎨', description: '即梦AI绘画，文字描述生成高清图片', model: '即梦 2.1', temperature: 0.9, maxTokens: 4096, systemPrompt: 'You are an AI image generation assistant powered by Jimeng...', totalCalls: 22400, status: 'active' },
  { id: 5, name: '数据分析', icon: '📊', description: '数据解读、报表分析、趋势预测', model: '元宝 Pro', temperature: 0.2, maxTokens: 16384, systemPrompt: 'You are a data analyst...', totalCalls: 15670, status: 'active' },
  { id: 6, name: '客服机器人', icon: '🎧', description: '自动回答常见问题，引导用户', model: 'Qwen-Plus', temperature: 0.5, maxTokens: 2048, systemPrompt: '你是罗圣纪元平台的客服助手...', totalCalls: 89400, status: 'active' },
  { id: 7, name: '豆包助手', icon: '🫘', description: '豆包大模型 - 中文理解与创作专家', model: 'Doubao-Pro-32K', temperature: 0.7, maxTokens: 32768, systemPrompt: '你是豆包大模型驱动的助手，擅长中文理解和创作...', totalCalls: 35800, status: 'active' },
  { id: 8, name: '翻译专家', icon: '🌐', description: '多语言互译，保持语境和风格', model: 'GPT-4o Mini', temperature: 0.3, maxTokens: 4096, systemPrompt: 'You are a professional translator...', totalCalls: 19300, status: 'disabled' },
  { id: 9, name: '学习导师', icon: '🎓', description: '个性化学习辅导，知识讲解', model: 'Qwen-Max', temperature: 0.6, maxTokens: 8192, systemPrompt: 'You are a patient tutor...', totalCalls: 8920, status: 'active' },
])

const chatLogs = ref([
  { id: 1, time: '2026-06-14 15:23:01', userName: '张三', question: '如何用Python实现快速排序？', answer: '快速排序可以使用分治法实现...', tokens: 1250, latency: 320, rating: 5 },
  { id: 2, time: '2026-06-14 15:20:45', userName: '李四', question: '帮我写一段产品推广文案', answer: '好的，请问是什么产品？目标人群是？', tokens: 180, latency: 150, rating: 4 },
  { id: 3, time: '2026-06-14 14:55:12', userName: '王五', question: '分析这份销售数据的趋势', answer: '根据数据，Q2销售额环比增长23%...', tokens: 3200, latency: 890, rating: 5 },
])

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

function handleSave() {
  if (!form.value.name.trim()) return ElMessage.warning('请输入名称')
  saving.value = true
  setTimeout(() => {
    if (isEditing.value && editingId.value) {
      const idx = agents.value.findIndex(a => a.id === editingId.value)
      if (idx >= 0) Object.assign(agents.value[idx], { ...form.value })
      ElMessage.success('智能体已更新')
    } else {
      agents.value.push({ id: Date.now(), ...form.value, totalCalls: 0 })
      ElMessage.success('智能体创建成功')
    }
    saving.value = false
    dialogVisible.value = false
  }, 500)
}

function toggleAgent(agent: any) {
  ElMessage.success(`智能体「${agent.name}」已${agent.status === 'active' ? '启用' : '禁用'}`)
}

function viewChatLogs(agent: any) {
  currentAgentName.value = agent.name
  chatLogVisible.value = true
}

function deleteAgent(agent: any) {
  ElMessageBox.confirm(`确认删除智能体「${agent.name}」？`).then(() => {
    agents.value = agents.value.filter(a => a.id !== agent.id)
    ElMessage.success('已删除')
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
