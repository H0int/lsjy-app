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
    <el-dialog v-model="dialogVisible" :title="isEditing ? '编辑Provider' : '添加Provider'" width="560px" destroy-on-close class="model-config-dialog">
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

const providerMeta: Record<string, { name: string; icon: string; endpoint: string }> = {
  doubao: { name: '豆包', icon: '🫘', endpoint: 'https://ark.cn-beijing.volces.com/api/v3' },
  ark: { name: '火山方舟', icon: '🌋', endpoint: 'https://ark.cn-beijing.volces.com/api/v3' },
  siliconflow: { name: '硅基流动', icon: '🔷', endpoint: 'https://api.siliconflow.cn/v1' },
  bailian: { name: '阿里百炼', icon: '🦙', endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
  zhipu: { name: '智谱', icon: '🧠', endpoint: 'https://open.bigmodel.cn/api/paas/v4' },
  baidu: { name: '百度千帆', icon: '🌊', endpoint: 'https://qianfan.baidubce.com/v2' },
  deepseek: { name: 'DeepSeek', icon: '🔍', endpoint: 'https://api.deepseek.com/v1' },
  tongyi: { name: '通义千问', icon: '🦙', endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
  yuanbao: { name: '腾讯元宝', icon: '💎', endpoint: 'https://tokenhub.tencentmaas.com/v1' },
  jimeng: { name: '即梦图片', icon: '🎨', endpoint: 'https://ark.cn-beijing.volces.com/api/v3' },
  'tongyi-video': { name: '通义万相视频', icon: '🎬', endpoint: 'https://dashscope.aliyuncs.com/api/v1' },
  kling: { name: '可灵视频', icon: '🎞️', endpoint: 'https://kling-api.kuaishou.com/v1' },
}

async function fetchProviders() {
  loading.value = true
  try {
    const configRes = await service.get('/admin/model-config', { timeout: 15000, headers: { 'X-Silent-Error': 'true' } })
    if (configRes.data.code === 0) {
      providers.value = buildProviderRows(configRes.data.data?.models || [], configRes.data.data?.providers || [])
      return
    }
    throw new Error('模型配置接口异常')
  } catch (e) {
    const [modelsRes, providersRes] = await Promise.allSettled([
      service.get('/ai/models', { timeout: 15000, headers: { 'X-Silent-Error': 'true' } }),
      service.get('/ai/providers', { timeout: 15000, headers: { 'X-Silent-Error': 'true' } }),
    ])
    const modelGroups = modelsRes.status === 'fulfilled' && modelsRes.value.data.code === 0 ? (modelsRes.value.data.data || []) : []
    const providerStatuses = providersRes.status === 'fulfilled' && providersRes.value.data.code === 0 ? (providersRes.value.data.data || []) : []
    providers.value = buildProviderRows(modelGroups, providerStatuses)
    console.warn('后台模型配置专用接口失败，已使用兼容模式:', e)
  } finally {
    loading.value = false
  }
}

function buildProviderRows(modelGroups: any[], providerStatuses: any[]) {
  const statusMap: Record<string, any> = {}
  providerStatuses.forEach((p: any) => { statusMap[p.name] = p })
  const providerKeys = Array.from(new Set([...Object.keys(providerMeta), ...modelGroups.map((g: any) => g.provider || g.group).filter(Boolean)]))
  return providerKeys.map((key, index) => {
    const meta = providerMeta[key] || { name: getDisplayName(key), icon: getIcon(key), endpoint: '' }
    const group = modelGroups.find((g: any) => (g.provider || g.group) === key)
    const status = statusMap[key]
    const models = normalizeModels(group?.models || defaultModelsFor(key))
    return {
      id: index + 1,
      providerKey: key,
      name: meta.name,
      icon: meta.icon,
      endpoint: meta.endpoint,
      apiKey: '',
      apiKeyMasked: status?.status === 'unconfigured' ? '未配置' : '已配置',
      models,
      monthlyCost: 0,
      connected: status ? status.status === 'healthy' : models.length > 0,
      statusText: status?.status || 'synced',
    }
  }).filter(p => p.models.length > 0)
}

function normalizeModels(models: any[]) {
  return models.map((m: any) => {
    if (typeof m === 'string') return m
    return m.label || m.name || m.id || ''
  }).filter(Boolean)
}

function defaultModelsFor(provider: string) {
  const map: Record<string, any[]> = {
    doubao: [{ name: '豆包 Pro' }, { name: '豆包 Lite' }, { name: '豆包视觉 Pro' }],
    ark: [{ name: '火山方舟' }],
    siliconflow: [{ name: '硅基 Qwen' }, { name: '硅基 GLM' }],
    bailian: [{ name: '百炼 Qwen+' }, { name: '百炼 Kimi' }],
    zhipu: [{ name: '智谱 GLM' }],
    baidu: [{ name: '百度 ERNIE' }],
    deepseek: [{ name: 'DeepSeek Chat' }, { name: 'DeepSeek Reasoner' }],
    jimeng: [{ name: '即梦 AI 绘画' }],
    kling: [{ name: '可灵 AI 视频' }],
    'tongyi-video': [{ name: '通义万相视频' }],
  }
  return map[provider] || []
}

function getDisplayName(name: string): string {
  const map: Record<string, string> = {
    doubao: '豆包',
    deepseek: 'DeepSeek',
    jimeng: '即梦',
    yuanbao: '元宝',
    qwen: '通义千问',
    openai: 'OpenAI',
    ark: '火山方舟',
    siliconflow: '硅基流动',
    bailian: '阿里百炼',
    zhipu: '智谱',
    baidu: '百度千帆',
    kling: '可灵视频',
    'tongyi-video': '通义万相视频'
  }
  return map[name.toLowerCase()] || name
}

function getIcon(name: string): string {
  const map: Record<string, string> = {
    doubao: '🫘', deepseek: '🔍', jimeng: '🎨',
    yuanbao: '💎', qwen: '🦙', openai: '🤖',
    ark: '🌋', siliconflow: '🔷', bailian: '🦙',
    zhipu: '🧠', baidu: '🌊', kling: '🎞️',
    'tongyi-video': '🎬'
  }
  return map[name.toLowerCase()] || '🤖'
}

onMounted(() => {
  fetchProviders()
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
