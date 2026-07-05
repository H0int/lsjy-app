<template>
  <div>
    <!-- 统计 -->
    <div class="cyber-grid-4 mb-4">
      <div class="cyber-stat-mini">
        <p class="stat-num text-cyan-400">{{ list.filter(r => r.status === 'active').length }}</p>
        <p class="stat-lbl">启用中</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-num text-green-400">{{ list.reduce((s, r) => s + Number(r.executionCount || 0), 0).toLocaleString() }}</p>
        <p class="stat-lbl">总执行次数</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-num text-amber-400">{{ list.length }}</p>
        <p class="stat-lbl">规则总数</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-num text-purple-400">{{ lastExecuted }}</p>
        <p class="stat-lbl">最近执行</p>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="cyber-toolbar">
      <select v-model="filterStatus" class="cyber-select">
        <option value="">全部状态</option>
        <option value="active">启用</option>
        <option value="disabled">禁用</option>
      </select>
      <button @click="showDialog = true" class="cyber-btn cyber-btn-cyan">+ 创建规则</button>
    </div>

    <!-- 规则列表 -->
    <div class="space-y-3">
      <div v-for="rule in filteredRules" :key="rule.id" class="cyber-card rule-card">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <div class="status-dot" :class="rule.status === 'active' ? 'dot-active' : 'dot-disabled'"></div>
              <h3 class="font-semibold text-white">{{ rule.name }}</h3>
              <span class="cyber-badge" :class="rule.status === 'active' ? 'badge-active' : 'badge-disabled'">{{ rule.status === 'active' ? '启用' : '禁用' }}</span>
            </div>
            <p class="text-sm text-[#6a6a8a] mb-3">{{ rule.description }}</p>
            <div class="flex items-center gap-6 text-xs">
              <div class="flex items-center gap-1">
                <span class="text-[#4a4a6a]">⚡ 触发:</span>
                <span class="rule-tag trigger-tag">{{ triggerLabel(rule.triggerEvent) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[#4a4a6a]">→ 动作:</span>
              <span v-for="(action, idx) in (rule.actions || [])" :key="idx" class="rule-tag action-tag">{{ actionLabel(action.type) }}<span v-if="idx < (rule.actions || []).length - 1"> + </span></span>
              </div>
              <div class="text-[#4a4a6a] font-mono">执行 {{ Number(rule.executionCount || 0) }} 次</div>
              <div v-if="rule.lastExecutedAt" class="text-[#4a4a6a] font-mono">最近: {{ rule.lastExecutedAt }}</div>
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <button @click="toggleStatus(rule)" class="cyber-btn-xs" :class="rule.status === 'active' ? 'cyber-btn-amber' : 'cyber-btn-green'">{{ rule.status === 'active' ? '禁用' : '启用' }}</button>
            <button @click="handleViewLog(rule)" class="cyber-btn-xs cyber-btn-cyan">日志</button>
            <button @click="handleDelete(rule)" class="cyber-btn-xs cyber-btn-magenta">删除</button>
          </div>
        </div>
      </div>
      <div v-if="filteredRules.length === 0" class="text-center py-12 text-[#4a4a6a] cyber-card">暂无自动化规则</div>
    </div>

    <!-- 执行日志弹窗 -->
    <div v-if="showLog" class="cyber-overlay">
      <div class="cyber-dialog">
        <div class="flex items-center justify-between mb-4">
          <h3 class="dialog-title mb-0">执行日志 - {{ logRule?.name }}</h3>
          <button @click="showLog = false" class="close-btn">✕</button>
        </div>
        <div class="space-y-2 max-h-80 overflow-y-auto">
          <div v-for="log in executionLogs" :key="log.id" class="log-entry">
            <div class="log-dot" :class="log.success ? 'dot-green' : 'dot-red'"></div>
            <div class="flex-1">
              <p class="text-sm text-[#a0a0cc]">{{ log.message }}</p>
              <p class="text-xs text-[#4a4a6a] font-mono">{{ log.time }}</p>
            </div>
            <span class="cyber-badge" :class="log.success ? 'badge-active' : 'badge-danger'">{{ log.success ? '成功' : '失败' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建规则弹窗 -->
    <div v-if="showDialog" class="cyber-overlay">
      <div class="cyber-dialog">
        <h3 class="dialog-title">创建自动化规则</h3>
        <div class="space-y-4">
          <div><label class="cyber-label">规则名称</label><input v-model="form.name" class="cyber-text-input w-full" placeholder="如: 新用户欢迎奖励" /></div>
          <div><label class="cyber-label">描述</label><textarea v-model="form.description" rows="2" class="cyber-text-input w-full" placeholder="规则描述..."></textarea></div>
          <div><label class="cyber-label">触发事件</label>
            <select v-model="form.triggerEvent" class="cyber-select w-full">
              <option value="user_register">新用户注册</option>
              <option value="first_recharge">首次充值</option>
              <option value="consume_threshold">消费达到阈值</option>
              <option value="tool_call_count">工具调用次数达标</option>
              <option value="course_complete">完成课程</option>
              <option value="invite_success">邀请成功</option>
            </select>
          </div>
          <div><label class="cyber-label">执行动作</label>
            <select v-model="form.actionType" class="cyber-select w-full">
              <option value="send_coins">发放圣力</option>
              <option value="send_notification">发送通知</option>
              <option value="send_coupon">发放优惠券</option>
              <option value="change_role">变更角色/VIP</option>
            </select>
          </div>
        </div>
        <div class="dialog-footer">
          <button @click="showDialog = false" class="cyber-btn cyber-btn-ghost">取消</button>
          <button @click="handleCreate" class="cyber-btn cyber-btn-cyan">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api'
import type { AutomationRule } from '@/types'
import { ElMessage } from 'element-plus'

const filterStatus = ref('')
const showDialog = ref(false)
const showLog = ref(false)
const logRule = ref<AutomationRule | null>(null)
const form = ref({ name: '', description: '', triggerEvent: 'user_register', actionType: 'send_coins' })
const list = ref<AutomationRule[]>([])

const lastExecuted = computed(() => {
  const dates = list.value.filter(r => r.lastExecutedAt).map(r => r.lastExecutedAt!).sort().reverse()
  return dates[0]?.slice(5, 16) || '-'
})

const executionLogs = ref<any[]>([])
const logsLoading = ref(false)

function triggerLabel(t: string) { return { user_register: '用户注册', first_recharge: '首次充值', consume_threshold: '消费达标', tool_call_count: '工具调用达标', course_complete: '完成课程', invite_success: '邀请成功' }[t] || t }
function actionLabel(a: string) { return { send_coins: '发放圣力', send_notification: '发送通知', send_coupon: '发放优惠券', change_role: '变更角色' }[a] || a }

const filteredRules = computed(() => {
  if (!filterStatus.value) return list.value
  return list.value.filter((r: any) => r.status === filterStatus.value)
})

async function fetchData() {
  try {
    const res = await adminApi.getAutomationRules()
    list.value = res.data?.items || res.data || []
  } catch (e) {
    console.error('获取自动化规则失败', e)
    list.value = []
  }
}

async function toggleStatus(rule: AutomationRule) {
  await adminApi.toggleRule(rule.id)
  ElMessage.success(rule.status === 'active' ? '已禁用' : '已启用')
  fetchData()
}

async function handleViewLog(rule: AutomationRule) {
  logRule.value = rule; showLog.value = true
  logsLoading.value = true
  try {
    const res = await adminApi.getRuleLogs(rule.id, { page: 1, pageSize: 50 })
    executionLogs.value = (res.data.list || []).map((l: any) => ({
      id: l.id,
      message: l.message || `${rule.name} 执行`,
      success: l.success !== false,
      time: l.createdAt || l.time || new Date().toISOString()
    }))
  } catch (e) {
    executionLogs.value = []
    ElMessage.warning('暂无执行日志')
  } finally {
    logsLoading.value = false
  }
}

async function handleDelete(rule: AutomationRule) {
  if (!confirm(`确认删除规则「${rule.name}」？`)) return
  await adminApi.deleteRule(rule.id)
  ElMessage.success('已删除')
  fetchData()
}

async function handleCreate() {
  if (!form.value.name.trim()) { ElMessage.warning('请输入规则名称'); return }
  await adminApi.createRule({
    name: form.value.name,
    description: form.value.description,
    triggerEvent: form.value.triggerEvent,
    actions: [{ type: form.value.actionType, config: {} }]
  })
  ElMessage.success('规则已创建')
  showDialog.value = false
  fetchData()
}

onMounted(() => fetchData())

</script>

<style scoped>
.cyber-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.cyber-stat-mini { background: #12121f; border: 1px solid #1a1a2e; border-radius: 10px; padding: 16px; text-align: center; }
.stat-num { font-size: 24px; font-weight: 800; font-family: 'Courier New', monospace; }
.stat-lbl { font-size: 11px; color: #6a6a8a; margin-top: 4px; }

.cyber-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.space-y-3 > * + * { margin-top: 12px; }
.space-y-2 > * + * { margin-top: 8px; }

.cyber-card { background: #12121f; border: 1px solid #1a1a2e; border-radius: 12px; padding: 20px; transition: border-color 0.2s; }
.rule-card:hover { border-color: #2a2a4e; }

.cyber-select { background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #a0a0cc; outline: none; }
.cyber-select:focus { border-color: #00f0ff; }
.cyber-select option { background: #12121f; }

.cyber-btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.cyber-btn-cyan { background: rgba(0,240,255,0.1); color: #00f0ff; border-color: #00f0ff44; }
.cyber-btn-cyan:hover { background: rgba(0,240,255,0.2); box-shadow: 0 0 12px rgba(0,240,255,0.3); }
.cyber-btn-ghost { background: rgba(100,100,140,0.1); color: #8888aa; border-color: #2a2a4e; }
.cyber-btn-ghost:hover { color: #c0c0ff; }

.cyber-btn-xs { padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.cyber-btn-green { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }
.cyber-btn-green:hover { background: rgba(0,255,136,0.2); box-shadow: 0 0 8px rgba(0,255,136,0.3); }
.cyber-btn-amber { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
.cyber-btn-amber:hover { background: rgba(245,158,11,0.2); }
.cyber-btn-magenta { background: rgba(255,0,255,0.1); color: #ff00ff; border: 1px solid rgba(255,0,255,0.2); }
.cyber-btn-magenta:hover { background: rgba(255,0,255,0.2); box-shadow: 0 0 8px rgba(255,0,255,0.3); }

.status-dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-active { background: #00ff88; box-shadow: 0 0 6px #00ff88; }
.dot-disabled { background: #4a4a6a; }

.cyber-badge { padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-active { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }
.badge-disabled { background: rgba(100,100,140,0.1); color: #6a6a8a; border: 1px solid #2a2a4e; }
.badge-danger { background: rgba(255,68,102,0.1); color: #ff4466; border: 1px solid rgba(255,68,102,0.2); }

.rule-tag { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
.trigger-tag { background: rgba(0,240,255,0.08); color: #00f0ff; }
.action-tag { background: rgba(124,58,237,0.08); color: #c084fc; }

/* Log Entry */
.log-entry { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(26,26,46,0.3); border: 1px solid #1a1a2e; border-radius: 8px; }
.log-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-green { background: #00ff88; box-shadow: 0 0 4px #00ff88; }
.dot-red { background: #ff4466; box-shadow: 0 0 4px #ff4466; }

/* Dialog */
.cyber-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; }
.cyber-dialog { background: #12121f; border: 1px solid #1a1a2e; border-radius: 16px; padding: 24px; width: 100%; max-width: 520px; }
.dialog-title { font-size: 18px; font-weight: 700; color: #e0e0ff; margin-bottom: 20px; }
.close-btn { padding: 8px; border-radius: 8px; background: transparent; border: none; color: #4a4a6a; cursor: pointer; font-size: 16px; }
.close-btn:hover { background: rgba(255,255,255,0.05); color: #a0a0cc; }
.cyber-label { display: block; font-size: 12px; color: #6a6a8a; margin-bottom: 6px; }
.cyber-text-input { background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #e0e0ff; outline: none; resize: vertical; }
.cyber-text-input:focus { border-color: #00f0ff; }
.cyber-text-input::placeholder { color: #4a4a6a; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.space-y-4 > * + * { margin-top: 16px; }
.w-full { width: 100%; }
.mb-0 { margin-bottom: 0; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.ml-4 { margin-left: 16px; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-6 { gap: 24px; }
.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-between { justify-content: space-between; }
.font-semibold { font-weight: 600; }
.font-mono { font-family: 'Courier New', monospace; }
.text-sm { font-size: 13px; }
.text-xs { font-size: 11px; }
.text-white { color: #fff; }
.text-cyan-400 { color: #00f0ff; }
.text-green-400 { color: #00ff88; }
.text-amber-400 { color: #f59e0b; }
.text-purple-400 { color: #c084fc; }
.max-h-80 { max-height: 320px; }
.overflow-y-auto { overflow-y: auto; }
</style>
