<template>
  <div>
    <div class="cyber-toolbar">
      <h2 class="text-lg font-bold text-white">🧠 AI模型Provider配置</h2>
      <el-button type="primary" @click="openDialog()">+ 添加Provider</el-button>
    </div>

    <!-- 桌面端 -->
    <div class="hidden md:block">
      <el-table :data="providers" stripe class="cyber-table">
        <el-table-column label="Provider" min-width="180">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ row.icon }}</span>
              <div>
                <div class="font-medium text-white">{{ row.name }}</div>
                <div class="text-xs text-[#4a4a6a]">{{ row.endpoint }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="API Key" width="180">
          <template #default="{ row }">
            <span class="font-mono text-xs text-[#6a6a8a]">{{ row.apiKeyMasked }}</span>
          </template>
        </el-table-column>
        <el-table-column label="可用模型" width="200">
          <template #default="{ row }">
            <div class="flex gap-1 flex-wrap">
              <span v-for="m in row.models" :key="m" class="cyber-tag tag-purple">{{ m }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="月消耗" width="100">
          <template #default="{ row }">
            <span class="font-mono text-sm text-[#00f0ff]">¥{{ row.monthlyCost }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="cyber-badge" :class="row.connected ? 'badge-active' : 'badge-error'">
              {{ row.connected ? '已连接' : '断开' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="testConnection(row)">测试</el-button>
            <el-button size="small" link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" link type="danger" @click="removeProvider(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 移动端卡片 -->
    <div class="md:hidden space-y-3">
      <div v-for="row in providers" :key="row.id" class="cyber-card p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">{{ row.icon }}</span>
            <span class="font-medium text-white">{{ row.name }}</span>
          </div>
          <span class="cyber-badge" :class="row.connected ? 'badge-active' : 'badge-error'">
            {{ row.connected ? '已连接' : '断开' }}
          </span>
        </div>
        <p class="text-xs text-[#4a4a6a] mb-2 font-mono">{{ row.endpoint }}</p>
        <div class="flex gap-1 flex-wrap mb-3">
          <span v-for="m in row.models" :key="m" class="cyber-tag tag-purple">{{ m }}</span>
        </div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-[#00f0ff]">月消耗 ¥{{ row.monthlyCost }}</span>
          <span class="text-xs text-[#6a6a8a] font-mono">{{ row.apiKeyMasked }}</span>
        </div>
        <div class="flex gap-2">
          <el-button size="small" type="primary" plain @click="testConnection(row)" class="flex-1">测试连接</el-button>
          <el-button size="small" plain @click="openDialog(row)" class="flex-1">编辑</el-button>
        </div>
      </div>
    </div>

    <!-- 对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEditing ? '编辑Provider' : '添加Provider'" width="560px" destroy-on-close>
      <el-form :model="form" label-width="100px" class="cyber-form">
        <div class="form-row">
          <el-form-item label="名称">
            <el-input v-model="form.name" placeholder="如：OpenAI" />
          </el-form-item>
          <el-form-item label="图标">
            <el-input v-model="form.icon" placeholder="emoji" />
          </el-form-item>
        </div>
        <el-form-item label="API Endpoint">
          <el-input v-model="form.endpoint" placeholder="https://api.openai.com/v1" />
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="form.apiKey" placeholder="sk-..." show-password />
        </el-form-item>
        <el-form-item label="可用模型">
          <el-input v-model="form.modelsStr" placeholder="GPT-4o, GPT-4o-mini (逗号分隔)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const dialogVisible = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const editingId = ref<number|null>(null)

const form = ref({ name: '', icon: '', endpoint: '', apiKey: '', modelsStr: '' })

const providers = ref([
  { id: 1, name: 'OpenAI', icon: '🟢', endpoint: 'https://api.openai.com/v1', apiKey: 'sk-***abc123', apiKeyMasked: 'sk-***abc123', models: ['GPT-4o','GPT-4o-mini'], monthlyCost: 2340, connected: true },
  { id: 2, name: 'Anthropic', icon: '🟠', endpoint: 'https://api.anthropic.com/v1', apiKey: 'sk-ant-***xyz', apiKeyMasked: 'sk-ant-***xyz', models: ['Claude-3.5-Sonnet','Claude-3-Haiku'], monthlyCost: 1890, connected: true },
  { id: 3, name: 'DeepSeek', icon: '🔵', endpoint: 'https://api.deepseek.com/v1', apiKey: 'sk-ds-***def', apiKeyMasked: 'sk-ds-***def', models: ['DeepSeek-V3','DeepSeek-R1'], monthlyCost: 560, connected: true },
  { id: 4, name: '阿里云通义', icon: '🟣', endpoint: 'https://dashscope.aliyuncs.com/api/v1', apiKey: 'sk-ali-***ghi', apiKeyMasked: 'sk-ali-***ghi', models: ['Qwen-Max','Qwen-Plus'], monthlyCost: 780, connected: false },
  { id: 5, name: '智谱AI', icon: '🔴', endpoint: 'https://open.bigmodel.cn/api/paas/v4', apiKey: '***glm', apiKeyMasked: '***glm', models: ['GLM-4','GLM-4-Flash'], monthlyCost: 320, connected: true },
])

function openDialog(p?: any) {
  if (p) {
    isEditing.value = true; editingId.value = p.id
    form.value = { name: p.name, icon: p.icon, endpoint: p.endpoint, apiKey: '', modelsStr: p.models.join(', ') }
  } else {
    isEditing.value = false; editingId.value = null
    form.value = { name: '', icon: '', endpoint: '', apiKey: '', modelsStr: '' }
  }
  dialogVisible.value = true
}

function handleSave() {
  if (!form.value.name.trim()) return ElMessage.warning('请输入名称')
  saving.value = true
  setTimeout(() => {
    const models = form.value.modelsStr.split(',').map(s => s.trim()).filter(Boolean)
    if (isEditing.value && editingId.value) {
      const idx = providers.value.findIndex(p => p.id === editingId.value)
      if (idx >= 0) Object.assign(providers.value[idx], { name: form.value.name, icon: form.value.icon, endpoint: form.value.endpoint, models })
      ElMessage.success('Provider已更新')
    } else {
      providers.value.push({ id: Date.now(), name: form.value.name, icon: form.value.icon, endpoint: form.value.endpoint, apiKey: form.value.apiKey, apiKeyMasked: form.value.apiKey.substring(0,6)+'***', models, monthlyCost: 0, connected: false })
      ElMessage.success('Provider添加成功')
    }
    saving.value = false; dialogVisible.value = false
  }, 500)
}

function testConnection(p: any) {
  ElMessage.info(`正在测试 ${p.name} 连接...`)
  setTimeout(() => {
    p.connected = true
    ElMessage.success(`${p.name} 连接正常`)
  }, 1500)
}

function removeProvider(p: any) {
  ElMessageBox.confirm(`确认删除Provider「${p.name}」？`).then(() => {
    providers.value = providers.value.filter(x => x.id !== p.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}
</script>

<style scoped>
.cyber-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.w-full { width: 100%; }
.flex { display: flex; }
.flex-wrap { flex-wrap: wrap; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.space-y-3 > * + * { margin-top: 12px; }
.p-4 { padding: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.text-white { color: #fff; }
.text-xs { font-size: 11px; }
.text-sm { font-size: 13px; }
.text-lg { font-size: 18px; }
.text-xl { font-size: 20px; }
.text-2xl { font-size: 24px; }
.font-mono { font-family: 'Courier New', monospace; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 600; }
.cyber-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.tag-purple { background: rgba(124,58,237,0.15); color: #c084fc; border: 1px solid rgba(124,58,237,0.3); }
.cyber-badge { padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-active { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }
.badge-error { background: rgba(255,68,102,0.1); color: #ff4466; border: 1px solid rgba(255,68,102,0.2); }
@media (max-width: 767px) { .hidden { display: none; } .md\:hidden { display: none; } .md\:block { display: none; } }
@media (min-width: 768px) { .md\:hidden { display: block; } .md\:block { display: block; } }
</style>
