<template>
  <div>
    <!-- 统计 -->
    <div class="grid grid-cols-4 gap-4 mb-4">
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm text-center">
        <p class="text-2xl font-bold text-blue-500">{{ list.filter(r => r.status === 'active').length }}</p>
        <p class="text-xs text-gray-500 mt-1">启用中</p>
      </div>
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm text-center">
        <p class="text-2xl font-bold text-green-500">{{ list.reduce((s, r) => s + r.executionCount, 0).toLocaleString() }}</p>
        <p class="text-xs text-gray-500 mt-1">总执行次数</p>
      </div>
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm text-center">
        <p class="text-2xl font-bold text-amber-500">{{ list.length }}</p>
        <p class="text-xs text-gray-500 mt-1">规则总数</p>
      </div>
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm text-center">
        <p class="text-2xl font-bold text-purple-500">{{ lastExecuted }}</p>
        <p class="text-xs text-gray-500 mt-1">最近执行</p>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-3">
        <select v-model="filterStatus" class="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200">
          <option value="">全部状态</option>
          <option value="active">启用</option>
          <option value="disabled">禁用</option>
        </select>
      </div>
      <button @click="showDialog = true" class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">+ 创建规则</button>
    </div>

    <!-- 规则列表 -->
    <div class="space-y-3">
      <div v-for="rule in list" :key="rule.id" class="bg-white dark:bg-dark-100 rounded-xl p-5 shadow-sm">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-3 h-3 rounded-full" :class="rule.status === 'active' ? 'bg-green-400' : 'bg-gray-300'"></div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ rule.name }}</h3>
              <span class="px-2 py-0.5 rounded-full text-xs" :class="rule.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">{{ rule.status === 'active' ? '启用' : '禁用' }}</span>
            </div>
            <p class="text-sm text-gray-500 mb-3">{{ rule.description }}</p>
            <div class="flex items-center gap-6 text-xs text-gray-400">
              <div class="flex items-center gap-1">
                <span>⚡ 触发:</span>
                <span class="px-2 py-0.5 bg-blue-50 dark:bg-dark-300 rounded text-blue-600 dark:text-blue-400">{{ triggerLabel(rule.triggerEvent) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span>→ 动作:</span>
                <span v-for="(action, idx) in rule.actions" :key="idx" class="px-2 py-0.5 bg-purple-50 dark:bg-dark-300 rounded text-purple-600 dark:text-purple-400">{{ actionLabel(action.type) }}<span v-if="idx < rule.actions.length - 1"> + </span></span>
              </div>
              <div>执行 {{ rule.executionCount }} 次</div>
              <div v-if="rule.lastExecutedAt">最近: {{ rule.lastExecutedAt }}</div>
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <button @click="toggleStatus(rule)" class="px-3 py-1.5 rounded-lg text-xs" :class="rule.status === 'active' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'">{{ rule.status === 'active' ? '禁用' : '启用' }}</button>
            <button @click="handleViewLog(rule)" class="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs">日志</button>
            <button @click="handleDelete(rule)" class="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs">删除</button>
          </div>
        </div>
      </div>
      <div v-if="list.length === 0" class="text-center py-12 text-gray-400 bg-white dark:bg-dark-100 rounded-xl">暂无自动化规则</div>
    </div>

    <!-- 执行日志弹窗 -->
    <div v-if="showLog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 w-full max-w-lg mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">执行日志 - {{ logRule?.name }}</h3>
          <button @click="showLog = false" class="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg text-gray-400">✕</button>
        </div>
        <div class="space-y-2 max-h-80 overflow-y-auto">
          <div v-for="log in executionLogs" :key="log.id" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
            <div class="w-2 h-2 rounded-full" :class="log.success ? 'bg-green-400' : 'bg-red-400'"></div>
            <div class="flex-1">
              <p class="text-sm text-gray-700 dark:text-gray-300">{{ log.message }}</p>
              <p class="text-xs text-gray-400">{{ log.time }}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded" :class="log.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">{{ log.success ? '成功' : '失败' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建规则弹窗 -->
    <div v-if="showDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">创建自动化规则</h3>
        <div class="space-y-4">
          <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">规则名称</label><input v-model="form.name" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" placeholder="如: 新用户欢迎奖励" /></div>
          <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">描述</label><textarea v-model="form.description" rows="2" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" placeholder="规则描述..."></textarea></div>
          <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">触发事件</label>
            <select v-model="form.triggerEvent" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200">
              <option value="user_register">新用户注册</option>
              <option value="first_recharge">首次充值</option>
              <option value="consume_threshold">消费达到阈值</option>
              <option value="tool_call_count">工具调用次数达标</option>
              <option value="course_complete">完成课程</option>
              <option value="invite_success">邀请成功</option>
            </select>
          </div>
          <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">执行动作</label>
            <select v-model="form.actionType" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200">
              <option value="send_coins">发放圣点</option>
              <option value="send_notification">发送通知</option>
              <option value="send_coupon">发放优惠券</option>
              <option value="change_role">变更角色/VIP</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showDialog = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">取消</button>
          <button @click="handleCreate" class="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AutomationRule } from '@/types'

const filterStatus = ref('')
const showDialog = ref(false)
const showLog = ref(false)
const logRule = ref<AutomationRule | null>(null)
const form = ref({ name: '', description: '', triggerEvent: 'user_register', actionType: 'send_coins' })

const list = ref<AutomationRule[]>([
  { id: 1, name: '新用户欢迎奖励', description: '新用户注册后自动发放20圣点作为欢迎奖励', triggerEvent: 'user_register', triggerCondition: {}, actions: [{ type: 'send_coins', config: { amount: 20, remark: '新用户注册奖励' } }, { type: 'send_notification', config: { template: 'welcome_bonus' } }], status: 'active', executionCount: 3420, lastExecutedAt: '2025-07-18 14:30', createdAt: '2025-06-01 10:00' },
  { id: 2, name: '消费满100自动升级VIP1', description: '用户累计消费满100圣点自动升级为VIP1', triggerEvent: 'consume_threshold', triggerCondition: { threshold: 100 }, actions: [{ type: 'change_role', config: { vipLevel: 1 } }, { type: 'send_notification', config: { template: 'vip_upgrade' } }], status: 'active', executionCount: 856, lastExecutedAt: '2025-07-18 12:15', createdAt: '2025-06-05 14:00' },
  { id: 3, name: '首次充值双倍返还', description: '用户首次充值额外赠送等额圣点', triggerEvent: 'first_recharge', triggerCondition: {}, actions: [{ type: 'send_coins', config: { amount: 'equal', remark: '首充双倍奖励' } }, { type: 'send_coupon', config: { couponId: 2, count: 1 } }], status: 'active', executionCount: 1230, lastExecutedAt: '2025-07-18 10:00', createdAt: '2025-06-10 09:00' },
  { id: 4, name: '邀请3人奖励', description: '用户成功邀请3位好友注册各得50圣点', triggerEvent: 'invite_success', triggerCondition: { count: 3 }, actions: [{ type: 'send_coins', config: { amount: 50, remark: '邀请奖励', target: 'both' } }], status: 'active', executionCount: 345, lastExecutedAt: '2025-07-17 18:00', createdAt: '2025-06-15 16:00' },
  { id: 5, name: '完成课程奖励', description: '用户完成任意课程全部章节后奖励30圣点', triggerEvent: 'course_complete', triggerCondition: { progress: 100 }, actions: [{ type: 'send_coins', config: { amount: 30, remark: '课程完成奖励' } }, { type: 'send_coupon', config: { couponId: 1, count: 1 } }], status: 'disabled', executionCount: 89, lastExecutedAt: '2025-07-10 09:30', createdAt: '2025-06-20 11:00' },
])

const lastExecuted = computed(() => {
  const dates = list.value.filter(r => r.lastExecutedAt).map(r => r.lastExecutedAt!).sort().reverse()
  return dates[0]?.slice(5, 16) || '-'
})

const executionLogs = ref([
  { id: 1, message: '用户 张三(id:1001) 注册触发，发放20圣点', success: true, time: '2025-07-18 14:30:22' },
  { id: 2, message: '用户 李四(id:1002) 注册触发，发放20圣点', success: true, time: '2025-07-18 14:28:10' },
  { id: 3, message: '用户 王五(id:1003) 注册触发，发送通知失败(用户通知关闭)', success: false, time: '2025-07-18 13:45:33' },
  { id: 4, message: '用户 赵六(id:1004) 注册触发，发放20圣点', success: true, time: '2025-07-18 12:20:15' },
  { id: 5, message: '用户 孙七(id:1005) 注册触发，发放20圣点', success: true, time: '2025-07-18 11:10:08' },
])

function triggerLabel(t: string) { return { user_register: '用户注册', first_recharge: '首次充值', consume_threshold: '消费达标', tool_call_count: '工具调用达标', course_complete: '完成课程', invite_success: '邀请成功' }[t] || t }
function actionLabel(a: string) { return { send_coins: '发放圣点', send_notification: '发送通知', send_coupon: '发放优惠券', change_role: '变更角色' }[a] || a }
function toggleStatus(rule: AutomationRule) { rule.status = rule.status === 'active' ? 'disabled' : 'active' }
function handleViewLog(rule: AutomationRule) { logRule.value = rule; showLog.value = true }
function handleDelete(rule: AutomationRule) { const i = list.value.findIndex(x => x.id === rule.id); if (i >= 0) list.value.splice(i, 1) }
function handleCreate() {
  list.value.unshift({ id: Date.now(), name: form.value.name, description: form.value.description, triggerEvent: form.value.triggerEvent, triggerCondition: {}, actions: [{ type: form.value.actionType as any, config: {} }], status: 'active', executionCount: 0, lastExecutedAt: null, createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ') })
  showDialog.value = false
}
</script>
