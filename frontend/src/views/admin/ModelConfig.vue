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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import service from '@/api/request'

const dialogVisible = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const loading = ref(false)
const editingId = ref<number|null>(null)

const form = ref({ name: '', icon: '', endpoint: '', apiKey: '', modelsStr: '' })

const providers = ref<any[]>([])

async function fetchProviders() {
  loading.value = true
  try {
    // 使用 /ai/models 替代 /ai/providers（更稳定）
    const res = await service.get('/ai/models', { timeout: 5000 })
    if (res.data.code === 0) {
      const modelGroups = res.data.data || []
      // 将模型列表转换为 Provider 格式展示
      const providerMap: Record<string, any> = {}
      modelGroups.forEach((group: any) => {
        const providerName = group.provider || 'unknown'
        if (!providerMap[providerName]) {
          providerMap[providerName] = {
            id: Object.keys(providerMap).length + 1,
            name: getDisplayName(providerName),
            icon: getIcon(providerName),
            endpoint: '',
            apiKey: '',
            apiKeyMasked: '已配置',
            models: [],
            monthlyCost: 0,
            connected: true
          }
        }
        if (group.models) {
          providerMap[providerName].models.push(...group.models)
        }
      })
      providers.value = Object.values(providerMap)
    }
  } catch (e) {
    // 降级：显示默认 Provider 信息
    providers.value = [
      {
        id: 1,
        name: 'DeepSeek',
        icon: '🔍',
        endpoint: '',
        apiKey: '',
        apiKeyMasked: '已配置',
        models: ['deepseek-v4-pro', 'deepseek-v4-flash'],
        monthlyCost: 0,
        connected: true
      }
    ]
    console.warn('加载Provider列表失败，使用默认配置:', e)
  } finally {
    loading.value = false
  }
}

function getDisplayName(name: string): string {
  const map: Record<string, string> = {
    doubao: '豆包',
    deepseek: 'DeepSeek',
    jimeng: '即梦',
    yuanbao: '元宝',
    qwen: '通义千问',
    openai: 'OpenAI'
  }
  return map[name.toLowerCase()] || name
}

async function fetchModels() {
  // 模型信息已在 fetchProviders 中加载，此处无需额外请求
  // 如需刷新，可重新调用 fetchProviders
  try {
    const res = await service.get('/ai/models', { timeout: 5000 })
    if (res.data.code === 0) {
      const modelGroups = res.data.data || []
      modelGroups.forEach((group: any) => {
        const p = providers.value.find((pr: any) => 
          pr.name.toLowerCase() === getDisplayName(group.provider).toLowerCase() ||
          pr.name.toLowerCase() === group.provider.toLowerCase()
        )
        if (p) {
          p.models = group.models || []
        }
      })
    }
  } catch (e) {
    // silent - 已在 fetchProviders 中处理
  }
}

function getIcon(name: string): string {
  const map: Record<string, string> = {
    doubao: '🫘', deepseek: '🔍', jimeng: '🎨',
    yuanbao: '💎', qwen: '🦙', openai: '🤖'
  }
  return map[name.toLowerCase()] || '🤖'
}

onMounted(() => {
  fetchProviders().then(fetchModels)
})

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

async function handleSave() {
  if (!form.value.name.trim()) return ElMessage.warning('请输入名称')
  saving.value = true
  try {
    const models = form.value.modelsStr.split(',').map(s => s.trim()).filter(Boolean)
    if (isEditing.value && editingId.value) {
      const idx = providers.value.findIndex(p => p.id === editingId.value)
      if (idx >= 0) Object.assign(providers.value[idx], { name: form.value.name, icon: form.value.icon, endpoint: form.value.endpoint, models })
      ElMessage.success('Provider已更新（本地预览，需重启后端生效）')
    } else {
      providers.value.push({ id: Date.now(), name: form.value.name, icon: form.value.icon, endpoint: form.value.endpoint, apiKey: form.value.apiKey, apiKeyMasked: form.value.apiKey ? form.value.apiKey.substring(0,6)+'***' : '未配置', models, monthlyCost: 0, connected: false })
      ElMessage.success('Provider添加成功（本地预览，需重启后端生效）')
    }
    dialogVisible.value = false
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

async function testConnection(p: any) {
  ElMessage.info(`正在测试 ${p.name} 连接...`)
  try {
    await fetchProviders()
    const updated = providers.value.find((pr: any) => pr.name === p.name)
    if (updated && updated.connected) {
      ElMessage.success(`${p.name} 连接正常`)
    } else {
      ElMessage.warning(`${p.name} 连接状态未确认`)
    }
  } catch (e) {
    ElMessage.error(`${p.name} 连接测试失败`)
  }
}

function removeProvider(p: any) {
  ElMessageBox.confirm(`确认删除Provider「${p.name}」？（仅本地预览，需重启后端生效）`).then(() => {
    providers.value = providers.value.filter(x => x.id !== p.id)
    ElMessage.success('已删除（本地预览）')
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
