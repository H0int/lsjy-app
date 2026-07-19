<template>
  <div class="max-w-6xl mx-auto px-4 py-6 cyber-works">
    <div class="works-head">
      <div>
        <h1 class="works-title">🎨 {{ activeTab === 'works' ? '我的作品' : '已用工具' }}</h1>
        <p class="works-sub">{{ activeTab === 'works' ? '图文库 / 视频库会自动同步 AI 工具生成结果' : '最近使用过的 AI 工具记录' }}</p>
      </div>
      <button class="works-refresh" :disabled="loading" @click="loadWorks">刷新</button>
    </div>

    <div class="works-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="works-tab"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >{{ tab.label }}</button>
    </div>

    <div v-if="loading" class="works-loading">
      <div class="cyber-spinner"></div>
      <span>正在加载作品库...</span>
    </div>

    <div v-else-if="filteredWorks.length === 0" class="works-empty">
      <div class="empty-icon">🗂️</div>
      <p>{{ activeTab === 'works' ? '暂无作品' : '暂无已用工具记录' }}</p>
      <router-link to="/tools" class="works-refresh">去 AI 工具体验</router-link>
    </div>

    <div v-else class="works-grid">
      <article v-for="work in filteredWorks" :key="work.id" class="work-card">
        <div class="work-preview">
          <img v-if="isImageWork(work) && firstUrl(work)" :src="firstUrl(work)" alt="AI生成图片" />
          <video v-else-if="isVideoWork(work) && firstUrl(work)" :src="firstUrl(work)" controls />
          <div v-else-if="isAudioWork(work)" class="work-audio">
            <div class="audio-icon">🎤</div>
            <span>音频作品</span>
          </div>
          <div v-else-if="work.status === 'processing'" class="work-processing">
            <div class="cyber-spinner small"></div>
            <span>生成处理中</span>
            <small>可离开页面，稍后刷新查看</small>
          </div>
          <div v-else class="work-text">{{ work.outputText || '文本作品' }}</div>
        </div>
        <div class="work-body">
          <div class="work-row">
            <h3>{{ work.tool?.name || work.toolName || 'AI作品' }}</h3>
            <span class="work-badge" :class="work.status">{{ statusText(work.status) }}</span>
          </div>
          <p class="work-prompt">{{ work.inputText || '无输入内容' }}</p>
          <div class="work-meta">
            <span>{{ mediaLabel(work) }}</span>
            <span>{{ formatTime(work.createdAt) }}</span>
          </div>
          <div class="work-actions">
            <a v-if="firstUrl(work)" :href="firstUrl(work)" target="_blank" class="work-link">打开原文件</a>
            <button v-if="work.status === 'processing' && taskIdOf(work)" class="work-link" @click="refreshTask(work)">查询进度</button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { toolApi } from '@/api'

const route = useRoute()
const router = useRouter()

const works = ref<any[]>([])
const loading = ref(false)
let timer: number | null = null

const tabs = [
  { key: 'works', label: '生成作品' },
  { key: 'tools', label: '已用工具' }
]

const activeTab = ref<string>((route.query.tab as string) || 'works')

const filteredWorks = computed(() => {
  if (activeTab.value === 'tools') {
    // 已用工具：显示所有有记录的工具调用，区分文本对话 vs 媒体生成
    return works.value.filter(w => {
      // 后端 source: live-chat = 文本对话/工具调用, live-generation = 媒体生成
      // 将 live-chat 和有 toolId 的全部显示在已用工具
      return w.source === 'live-chat' || (w.toolId && !isImageWork(w) && !isVideoWork(w) && !w.outputUrl && !w.outputUrls?.length)
    })
  }
  // 生成作品：有图片、视频URL、音频metadata、或outputText的记录
  return works.value.filter(w => isImageWork(w) || isVideoWork(w) || isAudioWork(w) || w.outputUrl || (w.outputUrls && w.outputUrls.length > 0) || w.outputText)
})

function switchTab(tab: string) {
  activeTab.value = tab
  router.replace({ path: '/profile/works', query: { tab } })
}

function firstUrl(work: any) {
  return work.outputUrl || work.outputUrls?.[0] || ''
}

function taskIdOf(work: any) {
  return work.metadata?.taskId || ''
}

function isImageWork(work: any) {
  return work.tool?.toolType === 'image' || /\.(png|jpg|jpeg|webp|gif)(\?|$)/i.test(firstUrl(work))
}

function isVideoWork(work: any) {
  return work.tool?.toolType === 'video' || work.metadata?.mediaType === 'video' || /\.(mp4|mov|webm)(\?|$)/i.test(firstUrl(work))
}

function isAudioWork(work: any) {
  return work.metadata?.mediaType === 'audio' || /\.(mp3|wav|ogg|m4a)(\?|$)/i.test(firstUrl(work))
}

function mediaLabel(work: any) {
  if (isAudioWork(work)) return '音频库'
  if (isVideoWork(work)) return '视频库'
  if (isImageWork(work)) return '图文库'
  return '文本作品'
}

function statusText(status: string) {
  if (status === 'processing') return '生成中'
  if (status === 'failed') return '失败'
  return '已完成'
}

function formatTime(value: string) {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-CN')
}

async function refreshTask(work: any) {
  const taskId = taskIdOf(work)
  if (!taskId) return
  const res = await toolApi.getVideoTask(taskId)
  if (res.code === 0 && res.data?.status === 'SUCCEEDED') {
    ElMessage.success('视频已生成完成')
    await loadWorks()
  } else if (res.data?.status) {
    ElMessage.info(`当前状态：${res.data.status}`)
  } else {
    ElMessage.warning(res.message || '暂未查询到结果')
  }
}

async function loadWorks() {
  loading.value = true
  try {
    // 分页加载所有作品（pageSize=50避免网络截断）
    let allItems: any[] = []
    let page = 1
    const pageSize = 50
    while (true) {
      const res = await toolApi.getWorks({ page, pageSize })
      const items = res.data?.items || []
      allItems = allItems.concat(items)
      const total = res.data?.total || 0
      if (allItems.length >= total || items.length < pageSize) break
      page++
    }
    works.value = allItems
  } finally {
    loading.value = false
  }
}

async function pollProcessing() {
  const pending = works.value.filter(w => w.status === 'processing' && taskIdOf(w))
  for (const work of pending.slice(0, 3)) {
    await refreshTask(work)
  }
}

onMounted(async () => {
  await loadWorks()
  timer = window.setInterval(pollProcessing, 15000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<style scoped>
.cyber-works { color: var(--cyber-text); }
.works-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 16px; }
.works-tabs { display: flex; gap: 12px; margin-bottom: 20px; }
.works-tab { border: 1px solid rgba(0,240,255,.2); background: rgba(0,240,255,.05); color: var(--cyber-text-dim); padding: 8px 18px; border-radius: 10px; cursor: pointer; font-size: 14px; transition: .2s; }
.works-tab.active { border-color: var(--cyber-cyan); color: var(--cyber-cyan); background: rgba(0,240,255,.12); box-shadow: 0 0 12px rgba(0,240,255,.2); }
.works-title { font-size: 24px; font-weight: 800; color: var(--cyber-cyan); text-shadow: 0 0 10px rgba(0,240,255,.35); }
.works-sub { color: var(--cyber-text-dim); font-size: 13px; margin-top: 4px; }
.works-refresh, .work-link { border: 1px solid rgba(0,240,255,.28); color: var(--cyber-cyan); background: rgba(0,240,255,.06); padding: 8px 14px; border-radius: 10px; font-size: 13px; cursor: pointer; text-decoration: none; }
.works-refresh:disabled { opacity: .5; cursor: not-allowed; }
.works-loading, .works-empty { min-height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; border: 1px solid rgba(0,240,255,.15); border-radius: 16px; background: rgba(0,240,255,.03); }
.empty-icon { font-size: 42px; }
.works-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.work-card { border: 1px solid rgba(0,240,255,.16); border-radius: 16px; overflow: hidden; background: linear-gradient(135deg,#0d0d2b,#1a0a3a); }
.work-preview { height: 210px; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; overflow: hidden; }
.work-preview img, .work-preview video { width: 100%; height: 100%; object-fit: cover; }
.work-processing, .work-text { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--cyber-cyan); text-align: center; padding: 18px; }
.work-text { color: var(--cyber-text); line-height: 1.6; }
.work-audio { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--cyber-cyan); }
.audio-icon { font-size: 42px; }
.work-body { padding: 14px; }
.work-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.work-row h3 { font-size: 15px; font-weight: 700; }
.work-badge { font-size: 12px; border-radius: 999px; padding: 3px 8px; background: rgba(0,255,136,.12); color: var(--cyber-green); }
.work-badge.processing { color: var(--cyber-amber); background: rgba(255,184,0,.12); }
.work-badge.failed { color: #ff6b6b; background: rgba(255,80,80,.12); }
.work-prompt { color: var(--cyber-text-dim); font-size: 12px; line-height: 1.6; margin: 10px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.work-meta, .work-actions { display: flex; justify-content: space-between; align-items: center; gap: 8px; color: var(--cyber-text-dim); font-size: 12px; }
.work-actions { margin-top: 12px; justify-content: flex-start; }
.cyber-spinner { width: 34px; height: 34px; border: 3px solid rgba(0,240,255,.15); border-top-color: var(--cyber-cyan); border-radius: 50%; animation: spin .8s linear infinite; }
.cyber-spinner.small { width: 28px; height: 28px; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 640px) { .works-head { align-items: flex-start; flex-direction: column; } }
</style>
