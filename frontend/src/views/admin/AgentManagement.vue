<template>
  <div class="cyber-page">
    <div class="page-header">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div>
          <h1>🤖 Agent 调度中心</h1>
          <p class="subtitle">管理 Coze 智能体配置、调度状态与用量监控</p>
        </div>
        <div style="display:flex;gap:8px;">
          <el-button size="small" @click="syncAgents" :loading="syncing">🔄 同步 Agent</el-button>
        </div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">🤖</div><div class="stat-info"><div class="stat-value">{{ agents.length }}</div><div class="stat-label">总 Agent 数</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value" style="color:#00ff88;">{{ activeCount }}</div><div class="stat-label">已启用</div></div></div>
      <div class="stat-card"><div class="stat-icon">💬</div><div class="stat-info"><div class="stat-value" style="color:#00f0ff;">{{ totalCalls }}</div><div class="stat-label">总调用次数</div></div></div>
      <div class="stat-card"><div class="stat-icon">⚡</div><div class="stat-info"><div class="stat-value" style="color:#ffb800;">{{ totalCost }}</div><div class="stat-label">总圣力消耗</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header">
        <h2>Agent 列表</h2>
        <el-select v-model="categoryFilter" placeholder="分类筛选" clearable size="small" style="width:120px">
          <el-option label="全部" value="" />
          <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
        </el-select>
      </div>
      <el-table :data="filteredAgents" style="width:100%" class="cyber-table" v-loading="loading">
        <el-table-column label="Agent" width="180">
          <template #default="{ row }">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:1.5rem;">{{ getAgentIcon(row.category) }}</span>
              <div>
                <div style="font-weight:600;">{{ row.name }}</div>
                <div style="font-size:11px;color:#8888aa;">{{ row.clawId }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }"><el-tag size="small" effect="plain">{{ row.category }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="圣力/次" width="90" align="center">
          <template #default="{ row }"><span style="color:#ffb800;font-weight:600;">⚡{{ row.coinCost }}</span></template>
        </el-table-column>
        <el-table-column label="调用次数" width="90" align="center">
          <template #default="{ row }"><span style="font-family:'JetBrains Mono',monospace;">{{ row.callCount || 0 }}</span></template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small" effect="dark">{{ row.status === 'active' ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link @click="editAgent(row)" style="color:#00f0ff;">编辑</el-button>
            <el-button size="small" link @click="toggleStatus(row)" :style="'color:' + (row.status === 'active' ? '#ff4444' : '#00ff88')">{{ row.status === 'active' ? '停用' : '启用' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="cyber-card">
      <div class="card-header">
        <h2>用量日志</h2>
        <el-button size="small" @click="fetchUsageLog">刷新</el-button>
      </div>
      <el-table :data="usageLogs" style="width:100%" class="cyber-table" v-loading="logLoading">
        <el-table-column prop="agentName" label="Agent" width="140" />
        <el-table-column prop="userName" label="用户" width="120" />
        <el-table-column prop="message" label="消息" show-overflow-tooltip />
        <el-table-column prop="coinCost" label="圣力" width="70" align="center">
          <template #default="{ row }"><span style="color:#ffb800;">{{ row.coinCost }}</span></template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="160" />
      </el-table>
      <div style="display:flex;justify-content:flex-end;margin-top:12px;">
        <el-pagination layout="total, prev, pager, next" :total="logTotal" :page-size="20" :current-page="logPage" @current-change="onLogPageChange" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { agentApi } from '@/api'
import { ElMessage } from 'element-plus'
const loading = ref(false); const syncing = ref(false); const logLoading = ref(false)
const agents = ref<any[]>([]); const usageLogs = ref<any[]>([]); const logTotal = ref(0); const logPage = ref(1)
const categoryFilter = ref('')
const categories = ['general', 'content', 'research', 'finance', 'legal', 'dev', 'test']
const filteredAgents = computed(() => { if (!categoryFilter.value) return agents.value; return agents.value.filter(a => a.category === categoryFilter.value) })
const activeCount = computed(() => agents.value.filter(a => a.status === 'active').length)
const totalCalls = computed(() => agents.value.reduce((s, a) => s + (a.callCount || 0), 0))
const totalCost = computed(() => agents.value.reduce((s, a) => s + (a.totalCost || 0), 0))
function getAgentIcon(category: string): string { const m: Record<string, string> = { general:'👑', content:'✍️', research:'🔍', finance:'💰', legal:'⚖️', dev:'⚙️', test:'🧪' }; return m[category] || '🤖' }
async function fetchAgents() { loading.value = true; try { const res = await agentApi.getAgents(); if (res.code === 0) agents.value = res.data || [] } catch { ElMessage.error('加载 Agent 列表失败') } finally { loading.value = false } }
async function fetchUsageLog() { logLoading.value = true; try { const res = await agentApi.getUsageLog({ page: logPage.value, pageSize: 20 }); if (res.code === 0) { usageLogs.value = res.data?.logs || []; logTotal.value = res.data?.total || 0 } } catch { ElMessage.error('加载用量日志失败') } finally { logLoading.value = false } }
function onLogPageChange(p: number) { logPage.value = p; fetchUsageLog() }
async function syncAgents() { syncing.value = true; try { const res = await agentApi.syncAgents(); if (res.code === 0) { ElMessage.success('同步成功'); fetchAgents() } else ElMessage.error(res.message || '同步失败') } catch { ElMessage.error('同步请求失败') } finally { syncing.value = false } }
function editAgent(row: any) { ElMessage.info('Agent编辑功能开发中') }
async function toggleStatus(row: any) { const ns = row.status === 'active' ? 'inactive' : 'active'; row.status = ns; ElMessage.success(ns === 'active' ? '已启用' : '已停用') }
onMounted(() => { fetchAgents(); fetchUsageLog() })
</script>
<style scoped>
.cyber-page { padding: 1.5rem; min-height: 100vh; background: #0a0a0f; color: #e0e0ff; }
.page-header { margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.5rem; font-weight: bold; color: #00f0ff; margin: 0 0 0.25rem 0; }
.subtitle { color: #8888aa; font-size: 0.875rem; margin: 0; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: rgba(15,15,25,0.8); border: 1px solid rgba(0,240,255,0.15); border-radius: 0.75rem; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; }
.stat-icon { font-size: 2rem; }
.stat-value { font-size: 1.5rem; font-weight: bold; color: #00f0ff; font-family: 'JetBrains Mono', monospace; }
.stat-label { font-size: 0.75rem; color: #8888aa; }
.cyber-card { background: rgba(15,15,25,0.8); border: 1px solid rgba(0,240,255,0.15); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1.5rem; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 8px; }
.card-header h2 { font-size: 1rem; font-weight: bold; color: #e0e0ff; margin: 0; }
.cyber-table { --el-table-bg-color: transparent; --el-table-tr-bg-color: transparent; --el-table-header-bg-color: rgba(0,240,255,0.05); --el-table-row-hover-bg-color: rgba(0,240,255,0.08); --el-table-border-color: rgba(0,240,255,0.1); --el-table-text-color: #e0e0ff; --el-table-header-text-color: #00f0ff; }
</style>
