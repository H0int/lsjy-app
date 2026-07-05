<template>
  <div class="skill-admin-page">
    <div class="hero-card">
      <div>
        <p class="eyebrow">OPEN SOURCE SKILL CENTER</p>
        <h1>开源 Skill 集成中台</h1>
        <p class="desc">独立命名空间、中转 API、页面级样式隔离；未部署的第三方服务不会伪装可用，避免影响现有 AI、视频、圣力和登录链路。</p>
      </div>
      <el-button type="primary" :loading="loading" @click="fetchData">刷新状态</el-button>
    </div>

    <div class="stat-grid">
      <div class="stat-card"><span>Skill总数</span><strong>{{ stats.total || 0 }}</strong></div>
      <div class="stat-card cyan"><span>已内置适配</span><strong>{{ stats.activeAdapters || 0 }}</strong></div>
      <div class="stat-card amber"><span>待部署</span><strong>{{ stats.pendingDeploy || 0 }}</strong></div>
      <div class="stat-card magenta"><span>高风险隔离</span><strong>{{ stats.highRisk || 0 }}</strong></div>
    </div>

    <div class="filter-row">
      <el-select v-model="filters.phase" clearable placeholder="阶段" @change="fetchData">
        <el-option v-for="p in phases" :key="p" :label="p" :value="p" />
      </el-select>
      <el-select v-model="filters.status" clearable placeholder="状态" @change="fetchData">
        <el-option label="已内置适配" value="active_adapter" />
        <el-option label="待部署" value="pending_deploy" />
        <el-option label="规划中" value="planned" />
        <el-option label="已停用" value="disabled" />
      </el-select>
    </div>

    <div class="skill-grid" v-loading="loading">
      <div v-for="item in skills" :key="item.id" class="skill-card">
        <div class="skill-head">
          <div>
            <div class="phase">{{ item.phase }}</div>
            <h3>{{ item.name }}</h3>
          </div>
          <el-tag :type="tagType(item.status)" effect="dark">{{ item.statusLabel }}</el-tag>
        </div>
        <p class="skill-desc">{{ item.description }}</p>
        <div class="meta-grid">
          <div><span>类别</span><b>{{ item.category }}</b></div>
          <div><span>接入模式</span><b>{{ item.adapter }}</b></div>
          <div><span>圣力策略</span><b>{{ item.coinCost }} 圣力</b></div>
          <div><span>风险</span><b>{{ riskLabel(item.riskLevel) }}</b></div>
        </div>
        <div class="repo">GitHub：{{ item.repo }}</div>
        <div class="conflicts">
          <span v-for="c in item.conflicts" :key="c">{{ c }}</span>
        </div>
        <div class="actions">
          <el-button size="small" @click="healthCheck(item)">自检</el-button>
          <el-button size="small" type="success" :disabled="item.status === 'pending_deploy' || item.status === 'planned'" @click="setStatus(item, 'enabled')">启用</el-button>
          <el-button size="small" type="warning" @click="setStatus(item, 'disabled')">停用</el-button>
          <el-button size="small" link type="primary" @click="$router.push(item.entry)">打开入口</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import service from '@/api/request'

const loading = ref(false)
const skills = ref<any[]>([])
const stats = ref<any>({})
const filters = ref({ phase: '', status: '' })

const phases = computed(() => Array.from(new Set(skills.value.map(i => i.phase))))

function tagType(status: string) {
  if (status === 'active_adapter' || status === 'enabled') return 'success'
  if (status === 'pending_deploy') return 'warning'
  if (status === 'planned') return 'info'
  return 'danger'
}

function riskLabel(level: string) {
  return { low: '低', medium: '中', high: '高' }[level] || level
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = {}
    if (filters.value.phase) params.phase = filters.value.phase
    if (filters.value.status) params.status = filters.value.status
    const res = await service.get('/admin/skills/open-source', { params })
    skills.value = res.data.data.skills || []
    stats.value = res.data.data.stats || {}
  } finally {
    loading.value = false
  }
}

async function healthCheck(item: any) {
  const res = await service.post(`/admin/skills/open-source/${item.id}/health-check`)
  ElMessage[res.data.data.ok ? 'success' : 'warning'](res.data.message)
  fetchData()
}

async function setStatus(item: any, status: string) {
  try {
    const res = await service.put(`/admin/skills/open-source/${item.id}`, { status })
    ElMessage.success(res.data.message || '已更新')
    fetchData()
  } catch (e: any) {
    ElMessage.warning(e?.response?.data?.message || '当前 Skill 还不能启用')
  }
}

onMounted(fetchData)
</script>

<style scoped>
.skill-admin-page { max-width: 1280px; margin: 0 auto; padding: 0 12px 32px; }
.hero-card { display: flex; justify-content: space-between; gap: 18px; align-items: center; padding: 24px; border: 1px solid rgba(0,240,255,.18); border-radius: 18px; background: linear-gradient(135deg, rgba(0,240,255,.08), rgba(255,0,255,.05)); margin-bottom: 18px; }
.eyebrow { color: #00f0ff; font: 700 12px 'JetBrains Mono', monospace; letter-spacing: 2px; margin: 0 0 8px; }
h1 { margin: 0; color: #f2f7ff; font-size: 26px; }
.desc { margin: 8px 0 0; color: #9aa4c7; max-width: 780px; line-height: 1.7; }
.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 16px; }
.stat-card { padding: 18px; border-radius: 14px; border: 1px solid rgba(0,240,255,.14); background: rgba(12,14,24,.78); }
.stat-card span { color: #8f9abc; font-size: 12px; }
.stat-card strong { display: block; margin-top: 6px; color: #fff; font-size: 28px; }
.stat-card.cyan strong { color: #00f0ff; } .stat-card.amber strong { color: #ffb800; } .stat-card.magenta strong { color: #ff00ff; }
.filter-row { display: flex; gap: 12px; margin: 16px 0; }
.skill-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(330px, 1fr)); gap: 16px; }
.skill-card { border: 1px solid rgba(0,240,255,.13); background: rgba(10,12,22,.86); border-radius: 16px; padding: 18px; box-shadow: 0 0 28px rgba(0,0,0,.25); }
.skill-head { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
.phase { color: #ff00ff; font-size: 12px; margin-bottom: 5px; }
h3 { color: #eaf6ff; margin: 0; font-size: 16px; }
.skill-desc { color: #9aa4c7; line-height: 1.65; min-height: 72px; }
.meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 12px 0; }
.meta-grid div { background: rgba(0,240,255,.04); border-radius: 10px; padding: 10px; }
.meta-grid span { display: block; color: #737f9f; font-size: 11px; }
.meta-grid b { color: #dcecff; font-size: 13px; }
.repo { color: #00f0ff; font-size: 12px; font-family: 'JetBrains Mono', monospace; margin: 10px 0; word-break: break-all; }
.conflicts { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0; }
.conflicts span { color: #ffb800; border: 1px solid rgba(255,184,0,.24); border-radius: 999px; padding: 4px 8px; font-size: 11px; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
@media (max-width: 720px) { .hero-card { flex-direction: column; align-items: flex-start; } .filter-row { flex-direction: column; } }
</style>
