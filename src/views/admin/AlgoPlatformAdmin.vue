<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">⚡ 算法中台管理</h2>
      <div class="flex gap-2">
        <el-button @click="refreshData">刷新</el-button>
        <el-button type="primary" @click="refreshData">同步中台数据</el-button>
      </div>
    </div>

    <!-- 核心指标概览 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div class="cyber-card p-3 text-center">
        <div class="text-xs" style="color:rgba(0,240,255,0.5);">自研模型数</div>
        <div class="text-xl font-bold" style="color:#00f0ff;">{{ models.length }}</div>
      </div>
      <div class="cyber-card p-3 text-center">
        <div class="text-xs" style="color:rgba(0,240,255,0.5);">在线引擎</div>
        <div class="text-xl font-bold" style="color:#00e5a0;">{{ engines.filter(e => e.status === 'online').length }}/{{ engines.length }}</div>
      </div>
      <div class="cyber-card p-3 text-center">
        <div class="text-xs" style="color:rgba(0,240,255,0.5);">已生成卡密</div>
        <div class="text-xl font-bold" style="color:#a78bfa;">{{ cardKeys.length }}</div>
      </div>
      <div class="cyber-card p-3 text-center">
        <div class="text-xs" style="color:rgba(0,240,255,0.5);">授权用户</div>
        <div class="text-xl font-bold" style="color:#fbbf24;">{{ authorizedUsers.length }}</div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" type="border-card">
      <!-- ==================== 自研模型管理 ==================== -->
      <el-tab-pane label="🧠 自研模型管理" name="models">
        <div class="flex justify-end mb-3">
          <el-button type="primary" size="small" @click="openModelDialog()">+ 新增自研模型</el-button>
        </div>
        <div class="cyber-card p-4">
          <el-table :data="models" stripe v-loading="loading">
            <el-table-column prop="name" label="模型名称" width="200" />
            <el-table-column prop="provider" label="来源" width="140" />
            <el-table-column prop="category" label="分类" width="120">
              <template #default="{ row }">
                <el-tag size="small" :type="categoryTagType(row.category)" effect="dark" round>{{ row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="params" label="参数量" width="130" />
            <el-table-column prop="engine" label="推理引擎" width="120" />
            <el-table-column prop="endpoint" label="API端点" width="180" show-overflow-tooltip />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'online' ? 'success' : 'warning'" effect="dark" round>
                  {{ row.status === 'online' ? '运行中' : '未部署' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" link type="primary" @click="openModelDialog(row)">编辑</el-button>
                <el-button size="small" link :type="row.status === 'online' ? 'danger' : 'success'" @click="toggleModelStatus(row)">
                  {{ row.status === 'online' ? '停止' : '启动' }}
                </el-button>
                <el-button size="small" link type="danger" @click="deleteModel(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- ==================== 引擎状态监控 ==================== -->
      <el-tab-pane label="📊 引擎状态监控" name="engines">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="engine in engines" :key="engine.id" class="cyber-card p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-xl">{{ engine.icon }}</span>
                <div>
                  <div class="text-sm font-bold">{{ engine.name }}</div>
                  <div class="text-xs" style="color:rgba(0,240,255,0.5);">{{ engine.model }}</div>
                </div>
              </div>
              <el-tag :type="engine.status === 'online' ? 'success' : 'danger'" size="small" effect="dark" round>
                {{ engine.status === 'online' ? '在线' : '离线' }}
              </el-tag>
            </div>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between"><span style="color:rgba(255,255,255,0.4);">GPU 显存</span><span style="color:#00f0ff;">{{ engine.gpuMem }}</span></div>
              <div class="w-full h-1.5 rounded" style="background:rgba(255,255,255,0.08);">
                <div class="h-full rounded" :style="{ width: engine.gpuUsage + '%', background: engine.gpuUsage > 80 ? '#ef4444' : '#00f0ff' }"></div>
              </div>
              <div class="flex justify-between"><span style="color:rgba(255,255,255,0.4);">今日调用</span><span style="color:#00f0ff;">{{ formatNum(engine.calls) }}</span></div>
              <div class="flex justify-between"><span style="color:rgba(255,255,255,0.4);">平均延迟</span><span style="color:#00f0ff;">{{ engine.latency }}</span></div>
              <div class="flex justify-between"><span style="color:rgba(255,255,255,0.4);">成功/失败</span><span style="color:#00e5a0;">{{ formatNum(engine.success) }}</span><span style="color:rgba(255,255,255,0.3);">/</span><span style="color:#ef4444;">{{ formatNum(engine.failed) }}</span></div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- ==================== 卡密管理 ==================== -->
      <el-tab-pane label="🔑 卡密管理" name="cardkeys">
        <div class="flex justify-between items-center mb-3">
          <div class="text-sm" style="color:rgba(255,255,255,0.5);">
            算法中台通行证卡密 · 售价 ¥1,888 · 生成后发给付费用户激活
          </div>
          <el-button type="primary" size="small" @click="generateCardKeys">🔑 批量生成卡密</el-button>
        </div>
        <div class="cyber-card p-4">
          <el-table :data="cardKeys" stripe v-loading="loading">
            <el-table-column prop="code" label="卡密" width="260">
              <template #default="{ row }">
                <code style="color:#00f0ff; font-family: 'JetBrains Mono', monospace; font-size:12px;">{{ row.code }}</code>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="生成时间" width="180" />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="row.status === 'unused' ? 'success' : 'info'" size="small" effect="dark" round>
                  {{ row.status === 'unused' ? '未使用' : '已激活' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="usedBy" label="使用者" width="120" />
            <el-table-column prop="usedAt" label="激活时间" width="180" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button size="small" link type="primary" @click="copyCardKey(row.code)">复制</el-button>
                <el-button v-if="row.status === 'unused'" size="small" link type="danger" @click="deleteCardKey(row)">作废</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- ==================== 权限用户管理 ==================== -->
      <el-tab-pane label="👤 权限用户管理" name="users">
        <div class="flex justify-between items-center mb-3">
          <div class="text-sm" style="color:rgba(255,255,255,0.5);">
            Boss账号 KF02V9 永久拥有权限，其他用户需付费或使用卡密激活
          </div>
          <el-button type="primary" size="small" @click="openUserDialog()">+ 手动授权用户</el-button>
        </div>
        <div class="cyber-card p-4">
          <el-table :data="authorizedUsers" stripe v-loading="loading">
            <el-table-column prop="username" label="用户名" width="140" />
            <el-table-column prop="nickname" label="昵称" width="140" />
            <el-table-column label="权限来源" width="120">
              <template #default="{ row }">
                <el-tag :type="row.source === 'boss' ? 'danger' : row.source === 'cardkey' ? 'success' : 'warning'" size="small" effect="dark" round>
                  {{ row.source === 'boss' ? 'BOSS' : row.source === 'cardkey' ? '卡密激活' : '手动授权' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="activatedAt" label="授权时间" width="180" />
            <el-table-column prop="cardCode" label="关联卡密" width="240" show-overflow-tooltip>
              <template #default="{ row }">
                <code v-if="row.cardCode" style="color:rgba(0,240,255,0.6); font-size:11px;">{{ row.cardCode }}</code>
                <span v-else style="color:rgba(255,255,255,0.2);">-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button v-if="row.source !== 'boss'" size="small" link type="danger" @click="revokeAccess(row)">撤销权限</el-button>
                <span v-else class="text-xs" style="color:rgba(255,255,255,0.3);">不可撤销</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- ==================== 新增/编辑自研模型弹窗 ==================== -->
    <el-dialog v-model="modelDialogVisible" :title="modelForm.id ? '编辑自研模型' : '新增自研模型'" width="600px">
      <el-form :model="modelForm" label-width="100px">
        <el-form-item label="模型名称"><el-input v-model="modelForm.name" placeholder="如：Qwen 3 (235B MoE)" /></el-form-item>
        <el-form-item label="来源"><el-input v-model="modelForm.provider" placeholder="如：阿里 Qwen" /></el-form-item>
        <el-form-item label="分类">
          <el-select v-model="modelForm.category" class="w-full">
            <el-option label="文本LLM" value="文本LLM" />
            <el-option label="图片生成" value="图片生成" />
            <el-option label="视频生成" value="视频生成" />
            <el-option label="语音合成" value="语音合成" />
            <el-option label="语音识别" value="语音识别" />
            <el-option label="基础设施" value="基础设施" />
          </el-select>
        </el-form-item>
        <el-form-item label="参数量"><el-input v-model="modelForm.params" placeholder="如：235B (22B 活跃)" /></el-form-item>
        <el-form-item label="推理引擎">
          <el-select v-model="modelForm.engine" class="w-full">
            <el-option label="vLLM" value="vLLM" />
            <el-option label="ComfyUI" value="ComfyUI" />
            <el-option label="CosyVoice" value="CosyVoice" />
            <el-option label="自定义" value="自定义" />
          </el-select>
        </el-form-item>
        <el-form-item label="API端点"><el-input v-model="modelForm.endpoint" placeholder="如：http://127.0.0.1:8200/v1/chat/completions" /></el-form-item>
        <el-form-item label="最大Token"><el-input-number v-model="modelForm.maxTokens" :min="1" :max="128000" class="w-full" /></el-form-item>
        <el-form-item label="温度"><el-slider v-model="modelForm.temperature" :min="0" :max="2" :step="0.1" show-stops /></el-form-item>
        <el-form-item label="许可证"><el-input v-model="modelForm.license" placeholder="如：Apache-2.0 / MIT" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="modelForm.description" type="textarea" :rows="3" placeholder="模型功能描述" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitModel">保存</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 手动授权用户弹窗 ==================== -->
    <el-dialog v-model="userDialogVisible" title="手动授权用户" width="450px">
      <el-form :model="userForm" label-width="80px">
        <el-form-item label="用户名"><el-input v-model="userForm.username" placeholder="输入要授权的用户名" /></el-form-item>
        <el-form-item label="授权原因">
          <el-select v-model="userForm.source" class="w-full">
            <el-option label="手动授权（管理员操作）" value="manual" />
            <el-option label="Boss指定" value="boss" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUser">授权</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { algoPlatformApi } from '@/api'

const loading = ref(false)
const activeTab = ref('models')

// ===== 自研模型 =====
const models = ref<any[]>([])
const modelDialogVisible = ref(false)
const modelForm = reactive<any>({
  id: null, name: '', provider: '', category: '文本LLM', params: '',
  engine: 'vLLM', endpoint: '', maxTokens: 4096, temperature: 0.7,
  license: 'Apache-2.0', description: '', status: 'offline'
})

// ===== 引擎状态 =====
const engines = ref<any[]>([])

// ===== 卡密 =====
const cardKeys = ref<any[]>([])

// ===== 授权用户 =====
const authorizedUsers = ref<any[]>([])
const userDialogVisible = ref(false)
const userForm = reactive<any>({ username: '', source: 'manual' })

function categoryTagType(cat: string) {
  const map: Record<string, string> = { '文本LLM': '', '图片生成': 'success', '视频生成': 'warning', '语音合成': 'info', '语音识别': 'info', '基础设施': 'danger' }
  return map[cat] || ''
}

function formatNum(n: number) {
  return n === undefined || n === null ? '0' : n.toLocaleString()
}

// ===== 加载数据 =====
async function refreshData() {
  loading.value = true
  await Promise.all([loadModels(), loadEngines(), loadCardKeys(), loadUsers()])
  loading.value = false
}

async function loadModels() {
  try {
    const saved = localStorage.getItem('lsjy_admin_algo_models')
    if (saved) { models.value = JSON.parse(saved); return }
  } catch { /* ignore */ }
  // 后端API不可用时使用默认数据
  models.value = getDefaultModels()
  saveModels()
}

async function loadEngines() {
  try {
    const res = await algoPlatformApi.getEngines()
    engines.value = res.data?.engines || res.data || getDefaultEngines()
  } catch {
    engines.value = getDefaultEngines()
  }
}

async function loadCardKeys() {
  try {
    const saved = localStorage.getItem('lsjy_admin_algo_cardkeys')
    if (saved) { cardKeys.value = JSON.parse(saved); return }
  } catch { /* ignore */ }
  cardKeys.value = []
  saveCardKeys()
}

async function loadUsers() {
  try {
    const saved = localStorage.getItem('lsjy_admin_algo_users')
    if (saved) { authorizedUsers.value = JSON.parse(saved); return }
  } catch { /* ignore */ }
  // Boss始终在列表中
  authorizedUsers.value = [
    { username: 'KF02V9', nickname: 'Boss', source: 'boss', activatedAt: '2026-01-01 00:00:00', cardCode: null }
  ]
  saveUsers()
}

function getDefaultModels() {
  return [
    { id: 1, name: 'Qwen 3 (235B MoE)', provider: '阿里 Qwen', category: '文本LLM', params: '235B (22B 活跃)', engine: 'vLLM', endpoint: 'http://127.0.0.1:8200/v1/chat/completions', maxTokens: 32768, temperature: 0.7, license: 'Apache-2.0', description: '1M上下文，MoE架构，中文理解最强', status: 'online' },
    { id: 2, name: 'DeepSeek-V3', provider: 'DeepSeek', category: '文本LLM', params: '671B (37B 活跃)', engine: 'vLLM', endpoint: 'http://127.0.0.1:8201/v1/chat/completions', maxTokens: 32768, temperature: 0.7, license: 'MIT', description: '代码/推理能力突出', status: 'online' },
    { id: 3, name: 'Qwen 3 (8B)', provider: '阿里 Qwen', category: '文本LLM', params: '8B', engine: 'vLLM', endpoint: 'http://127.0.0.1:8200/v1/chat/completions', maxTokens: 8192, temperature: 0.7, license: 'Apache-2.0', description: '轻量高性能', status: 'online' },
    { id: 4, name: 'GLM-4 (9B)', provider: '智谱 AI', category: '文本LLM', params: '9B', engine: 'vLLM', endpoint: 'http://127.0.0.1:8200/v1/chat/completions', maxTokens: 8192, temperature: 0.7, license: '可商用', description: 'Function Calling优秀', status: 'online' },
    { id: 5, name: 'FLUX.1-schnell', provider: 'Black Forest Labs', category: '图片生成', params: '12B', engine: 'ComfyUI', endpoint: 'http://127.0.0.1:8300/v1/images/generations', maxTokens: 0, temperature: 0, license: 'Apache-2.0', description: '极快生成，对标即梦v2', status: 'online' },
    { id: 6, name: 'FLUX.2-klein (4B)', provider: 'Black Forest Labs', category: '图片生成', params: '4B', engine: 'ComfyUI', endpoint: 'http://127.0.0.1:8300/v1/images/generations', maxTokens: 0, temperature: 0, license: 'Apache-2.0', description: '亚秒级生成', status: 'online' },
    { id: 7, name: 'SDXL 1.0', provider: 'Stability AI', category: '图片生成', params: '3.5B', engine: 'ComfyUI', endpoint: 'http://127.0.0.1:8301/v1/images/generations', maxTokens: 0, temperature: 0, license: 'RAIL-M', description: '生态最丰富', status: 'online' },
    { id: 8, name: 'Wan2.1 (1.3B)', provider: '阿里通义实验室', category: '视频生成', params: '1.3B', engine: 'ComfyUI', endpoint: 'http://127.0.0.1:8400/v1/videos/generations', maxTokens: 0, temperature: 0, license: 'Apache-2.0', description: '当前最强开源视频模型', status: 'online' },
    { id: 9, name: 'Wan2.1 (14B)', provider: '阿里通义实验室', category: '视频生成', params: '14B', engine: 'ComfyUI', endpoint: 'http://127.0.0.1:8400/v1/videos/generations', maxTokens: 0, temperature: 0, license: 'Apache-2.0', description: '旗舰画质', status: 'offline' },
    { id: 10, name: 'CosyVoice 2', provider: '阿里 FunAudioLLM', category: '语音合成', params: '0.5B', engine: 'CosyVoice', endpoint: 'http://127.0.0.1:8500/v1/audio/speech', maxTokens: 0, temperature: 0, license: 'Apache-2.0', description: '中文TTS最强', status: 'online' },
    { id: 11, name: 'Whisper Large V3', provider: 'OpenAI (私有化)', category: '语音识别', params: '1.5B', engine: '自定义', endpoint: 'http://127.0.0.1:8600/v1/audio/transcriptions', maxTokens: 0, temperature: 0, license: 'MIT', description: '多语言语音识别', status: 'online' },
    { id: 12, name: 'vLLM v0.25.1', provider: 'vLLM Project', category: '基础设施', params: '-', engine: 'vLLM', endpoint: '-', maxTokens: 0, temperature: 0, license: 'Apache-2.0', description: '推理引擎', status: 'online' },
    { id: 13, name: 'ComfyUI', provider: 'Comfy Org', category: '基础设施', params: '-', engine: 'ComfyUI', endpoint: '-', maxTokens: 0, temperature: 0, license: 'GPL-3.0', description: '图片/视频生成引擎', status: 'online' },
  ]
}

function getDefaultEngines() {
  return [
    { id: 'qwen-8b', name: '文本对话(轻量)', model: 'Qwen 3 (8B)', icon: '🧠', status: 'online', gpuMem: '18.2GB / 24GB', gpuUsage: 76, calls: 2341, latency: '180ms', success: 2338, failed: 3 },
    { id: 'qwen-235b', name: '文本对话(主力)', model: 'Qwen 3 (235B MoE)', icon: '🧠', status: 'online', gpuMem: '62.4GB / 80GB', gpuUsage: 78, calls: 5672, latency: '520ms', success: 5651, failed: 21 },
    { id: 'flux', name: '图片生成', model: 'FLUX.1-schnell', icon: '🎨', status: 'online', gpuMem: '14.8GB / 24GB', gpuUsage: 62, calls: 1890, latency: '2.1s', success: 1885, failed: 5 },
    { id: 'sdxl', name: '图片生成(备选)', model: 'SDXL 1.0', icon: '🎨', status: 'online', gpuMem: '8.2GB / 24GB', gpuUsage: 34, calls: 320, latency: '3.5s', success: 319, failed: 1 },
    { id: 'wan21', name: '视频生成', model: 'Wan2.1 (1.3B)', icon: '🎬', status: 'online', gpuMem: '7.8GB / 24GB', gpuUsage: 33, calls: 456, latency: '45s', success: 448, failed: 8 },
    { id: 'cosyvoice', name: '语音合成', model: 'CosyVoice 2', icon: '🎤', status: 'online', gpuMem: '3.1GB / 8GB', gpuUsage: 39, calls: 168, latency: '150ms', success: 167, failed: 1 },
  ]
}

// ===== 持久化 =====
function saveModels() { localStorage.setItem('lsjy_admin_algo_models', JSON.stringify(models.value)) }
function saveCardKeys() { localStorage.setItem('lsjy_admin_algo_cardkeys', JSON.stringify(cardKeys.value)) }
function saveUsers() { localStorage.setItem('lsjy_admin_algo_users', JSON.stringify(authorizedUsers.value)) }

// ===== 模型操作 =====
function openModelDialog(row?: any) {
  if (row) Object.assign(modelForm, JSON.parse(JSON.stringify(row)))
  else Object.assign(modelForm, { id: null, name: '', provider: '', category: '文本LLM', params: '', engine: 'vLLM', endpoint: '', maxTokens: 4096, temperature: 0.7, license: 'Apache-2.0', description: '', status: 'offline' })
  modelDialogVisible.value = true
}

function submitModel() {
  if (!modelForm.name.trim()) { return ElMessage.warning('请输入模型名称') }
  if (modelForm.id) {
    const idx = models.value.findIndex(m => m.id === modelForm.id)
    if (idx >= 0) models.value[idx] = { ...modelForm }
  } else {
    modelForm.id = Date.now()
    models.value.push({ ...modelForm })
  }
  saveModels()
  modelDialogVisible.value = false
  ElMessage.success('保存成功')
}

function toggleModelStatus(row: any) {
  row.status = row.status === 'online' ? 'offline' : 'online'
  saveModels()
  ElMessage.success(row.status === 'online' ? '已启动' : '已停止')
}

async function deleteModel(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除模型「${row.name}」？`)
    models.value = models.value.filter(m => m.id !== row.id)
    saveModels()
    ElMessage.success('删除成功')
  } catch { /* cancelled */ }
}

// ===== 卡密操作 =====
function generateCardKeys() {
  ElMessageBox.prompt('请输入要生成的卡密数量', '批量生成算法中台卡密', {
    confirmButtonText: '生成',
    cancelButtonText: '取消',
    inputPattern: /^[1-9]\d*$/,
    inputErrorMessage: '请输入正整数',
    inputValue: '5'
  }).then(({ value }) => {
    const count = parseInt(value)
    const newKeys = []
    for (let i = 0; i < count; i++) {
      const code = 'LSJY-ALGO-' + generateCodeSegment() + '-' + generateCodeSegment()
      newKeys.push({
        code,
        status: 'unused',
        createdAt: new Date().toLocaleString('zh-CN'),
        usedBy: null,
        usedAt: null
      })
    }
    cardKeys.value = [...newKeys, ...cardKeys.value]
    saveCardKeys()
    ElMessage.success(`已生成 ${count} 张卡密`)
  }).catch(() => { /* cancelled */ })
}

function generateCodeSegment() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 4; i++) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

function copyCardKey(code: string) {
  navigator.clipboard.writeText(code)
  ElMessage.success('卡密已复制')
}

async function deleteCardKey(row: any) {
  try {
    await ElMessageBox.confirm(`确认作废卡密「${row.code}」？此操作不可恢复`)
    cardKeys.value = cardKeys.value.filter(k => k.code !== row.code)
    saveCardKeys()
    ElMessage.success('卡密已作废')
  } catch { /* cancelled */ }
}

// ===== 用户授权操作 =====
function openUserDialog() {
  Object.assign(userForm, { username: '', source: 'manual' })
  userDialogVisible.value = true
}

function submitUser() {
  if (!userForm.username.trim()) { return ElMessage.warning('请输入用户名') }
  if (authorizedUsers.value.some(u => u.username === userForm.username)) {
    return ElMessage.warning('该用户已有权限')
  }
  authorizedUsers.value.push({
    username: userForm.username,
    nickname: userForm.username,
    source: userForm.source,
    activatedAt: new Date().toLocaleString('zh-CN'),
    cardCode: null
  })
  saveUsers()
  userDialogVisible.value = false
  ElMessage.success(`已授权用户 ${userForm.username}`)
}

async function revokeAccess(row: any) {
  try {
    await ElMessageBox.confirm(`确认撤销用户「${row.username}」的算法中台权限？`)
    authorizedUsers.value = authorizedUsers.value.filter(u => u.username !== row.username)
    saveUsers()
    ElMessage.success('权限已撤销')
  } catch { /* cancelled */ }
}

onMounted(refreshData)
</script>
