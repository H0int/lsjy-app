<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; text-shadow: 0 0 10px var(--cyber-cyan), 0 0 20px rgba(0,240,255,0.25);">
          📝 创作记录
        </h1>
        <p class="mt-1" style="color: var(--cyber-text-dim); font-size: 13px;">您的AI工具使用历史与创作成果</p>
      </div>
      <div class="flex items-center gap-2">
        <el-select v-model="toolTypeFilter" placeholder="按工具类型筛选" size="default" clearable
          style="width: 150px; background: rgba(0,240,255,0.03); border-color: rgba(0,240,255,0.2);">
          <el-option label="全部" value="" />
          <el-option label="内容创作" value="内容创作" />
          <el-option label="AI绘画" value="AI绘画" />
          <el-option label="视频创作" value="视频创作" />
          <el-option label="AI智能" value="AI智能" />
          <el-option label="其他" value="其他" />
        </el-select>
        <el-button v-if="allRecords.length > 0" @click="exportRecords" size="default"
          style="border-color: rgba(0,240,255,0.4); color: var(--cyber-cyan); background: rgba(0,240,255,0.05);">
          导出记录
        </el-button>
        <el-button v-if="allRecords.length > 0" @click="clearRecords" size="default"
          style="border-color: rgba(239,68,68,0.4); color: #ef4444; background: rgba(239,68,68,0.05);">
          🗑️ 清空记录
        </el-button>
      </div>
    </div>

    <!-- 筛选标签 -->
    <div v-if="allRecords.length > 0" class="flex flex-wrap gap-2 mb-4">
      <button v-for="tab in filterTabs" :key="tab.value"
        @click="activeFilter = tab.value"
        class="cyber-filter-btn" :class="{ active: activeFilter === tab.value }">
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- 记录列表 -->
    <div v-if="filteredRecords.length > 0" class="space-y-3">
      <div v-for="record in filteredRecords" :key="record.id" class="cyber-record-card">
        <div class="record-header">
          <div class="flex items-center gap-3">
            <span class="record-icon">{{ record.icon || '🤖' }}</span>
            <div>
              <div class="record-name">{{ record.name || '未知工具' }}</div>
              <div class="record-time">{{ record.time }}</div>
            </div>
          </div>
          <span class="record-type-badge">{{ record.category || 'AI工具' }}</span>
        </div>
        <div v-if="record.inputText" class="record-section">
          <span class="section-label">输入</span>
          <p class="section-text">{{ record.inputText }}</p>
        </div>
        <div v-if="record.outputText" class="record-section">
          <span class="section-label">输出</span>
          <p class="section-text">{{ record.outputText }}</p>
        </div>
        <div v-if="record.outputUrl" class="record-output-preview">
          <img v-if="record.outputUrl.match(/\.(jpg|jpeg|png|gif|webp)/i)" :src="record.outputUrl" class="preview-img" @click="previewUrl = record.outputUrl" />
          <video v-else-if="record.outputUrl.match(/\.(mp4|webm)/i)" :src="record.outputUrl" class="preview-video" controls />
          <a v-else :href="record.outputUrl" target="_blank" class="preview-link">{{ record.outputUrl }}</a>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="cyber-empty-state">
      <div class="cyber-empty-icon">📝</div>
      <p class="cyber-empty-title">暂无创作记录</p>
      <p class="cyber-empty-desc">使用AI工具后，创作记录会自动保存在这里</p>
      <el-button @click="router.push('/tools')" type="primary" size="large"
        style="margin-top: 20px; background: linear-gradient(135deg, rgba(0,240,255,0.2), rgba(124,58,237,0.2)); border-color: var(--cyber-cyan); color: var(--cyber-cyan);">
        🤖 去使用工具
      </el-button>
    </div>

    <!-- 图片预览弹窗 -->
    <Teleport to="body">
      <div v-if="previewUrl" class="fixed inset-0 z-50 flex items-center justify-center" style="background: rgba(0,0,0,0.8);" @click="previewUrl = ''">
        <img :src="previewUrl" class="max-w-[90vw] max-h-[90vh] rounded-lg" @click.stop />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const activeFilter = ref('all')
const toolTypeFilter = ref('')
const previewUrl = ref('')

const filterTabs = [
  { label: '全部', value: 'all', icon: '📦' },
  { label: '文本生成', value: '文本生成', icon: '✍️' },
  { label: '图片生成', value: '图片生成', icon: '🎨' },
  { label: '视频生成', value: '视频生成', icon: '🎬' },
  { label: '其他', value: '其他', icon: '🔧' },
]

interface Record {
  id: number
  name: string
  icon: string
  time: string
  category: string
  toolType?: string
  inputText?: string
  outputText?: string
  outputUrl?: string
}

const allRecords = ref<Record[]>([])

function loadRecords() {
  const works: Record[] = JSON.parse(localStorage.getItem('lsjy_generated_works') || '[]')
  const used: Record[] = JSON.parse(localStorage.getItem('lsjy_used_tools') || '[]')
  // 合并：优先使用 works（有详细信息），补充 used 中没有的
  const worksIds = new Set(works.map(w => w.id))
  const merged: Record[] = [...works]
  for (const u of used) {
    if (!worksIds.has(u.id)) {
      merged.push(u)
    }
  }
  // 按时间倒序
  merged.sort((a, b) => {
    const ta = new Date(a.time.replace(/\//g, '-')).getTime()
    const tb = new Date(b.time.replace(/\//g, '-')).getTime()
    return tb - ta
  })
  allRecords.value = merged
}

const filteredRecords = computed(() => {
  let list = allRecords.value
  if (activeFilter.value !== 'all') {
    list = list.filter(r => r.category?.includes(activeFilter.value))
  }
  if (toolTypeFilter.value) {
    list = list.filter(r => {
      const cat = r.category || r.toolType || ''
      if (toolTypeFilter.value === '其他') {
        return !cat.includes('内容创作') && !cat.includes('AI绘画') && !cat.includes('图片生成') && !cat.includes('视频创作') && !cat.includes('视频生成') && !cat.includes('AI智能')
      }
      return cat.includes(toolTypeFilter.value)
    })
  }
  return list
})

function exportRecords() {
  const records = filteredRecords.value
  if (records.length === 0) {
    ElMessage.warning('没有可导出的记录')
    return
  }
  const lines = records.map((r, i) => {
    const parts = [
      `[${i + 1}] ${r.name || '未知工具'}`,
      `  时间: ${r.time}`,
      `  类型: ${r.category || 'AI工具'}`,
    ]
    if (r.inputText) parts.push(`  输入: ${r.inputText}`)
    if (r.outputText) parts.push(`  输出: ${r.outputText}`)
    if (r.outputUrl) parts.push(`  链接: ${r.outputUrl}`)
    return parts.join('\n')
  })
  const content = `创作记录导出\n导出时间: ${new Date().toLocaleString()}\n共 ${records.length} 条记录\n${'='.repeat(40)}\n\n${lines.join('\n\n')}\n`
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `创作记录_${new Date().toISOString().slice(0, 10)}.txt`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

async function clearRecords() {
  try {
    await ElMessageBox.confirm('确定要清空所有创作记录吗？此操作不可恢复。', '清空确认', {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'warning',
    })
    localStorage.removeItem('lsjy_generated_works')
    localStorage.removeItem('lsjy_used_tools')
    allRecords.value = []
    ElMessage.success('记录已清空')
  } catch {
    // 取消
  }
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.cyber-filter-btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  background: rgba(0,240,255,0.03);
  border: 1px solid rgba(0,240,255,0.1);
  color: var(--cyber-text-dim);
  cursor: pointer;
  transition: all 0.2s;
}
.cyber-filter-btn:hover { border-color: rgba(0,240,255,0.3); color: var(--cyber-text); }
.cyber-filter-btn.active {
  background: rgba(0,240,255,0.1);
  border-color: rgba(0,240,255,0.4);
  color: var(--cyber-cyan);
  box-shadow: 0 0 8px rgba(0,240,255,0.15);
}

.cyber-record-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.1);
  border-radius: 14px;
  padding: 18px;
  transition: all 0.3s;
}
.cyber-record-card:hover {
  border-color: rgba(0,240,255,0.25);
  box-shadow: 0 4px 20px rgba(0,240,255,0.08);
}
.record-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
}
.record-icon { font-size: 28px; }
.record-name {
  font-size: 15px; font-weight: 700;
  color: var(--cyber-text);
  font-family: 'JetBrains Mono', monospace;
}
.record-time {
  font-size: 12px;
  color: var(--cyber-text-dim);
  margin-top: 2px;
}
.record-type-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(0,240,255,0.08);
  color: var(--cyber-cyan);
  border: 1px solid rgba(0,240,255,0.15);
}

.record-section {
  margin-top: 10px;
  padding: 10px 14px;
  background: rgba(0,240,255,0.02);
  border-radius: 10px;
  border-left: 2px solid rgba(0,240,255,0.15);
}
.section-label {
  font-size: 11px;
  color: var(--cyber-cyan);
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}
.section-text {
  font-size: 13px;
  color: var(--cyber-text-dim);
  line-height: 1.6;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.record-output-preview {
  margin-top: 10px;
}
.preview-img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid rgba(0,240,255,0.1);
  transition: all 0.2s;
}
.preview-img:hover { border-color: rgba(0,240,255,0.4); transform: scale(1.02); }
.preview-video {
  max-width: 280px;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid rgba(0,240,255,0.1);
}
.preview-link {
  font-size: 12px;
  color: var(--cyber-cyan);
  word-break: break-all;
}

.cyber-empty-state {
  text-align: center;
  padding: 80px 20px;
}
.cyber-empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 12px rgba(0,240,255,0.4));
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}
.cyber-empty-title {
  font-size: 18px;
  color: var(--cyber-text);
  margin-bottom: 8px;
  font-weight: 600;
}
.cyber-empty-desc {
  font-size: 13px;
  color: var(--cyber-text-dim);
  max-width: 360px;
  margin: 0 auto;
  line-height: 1.6;
}
</style>
