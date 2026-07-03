<template>
  <div>
    <h2 class="text-xl font-bold mb-6" style="color: #e0e0ff;">👑 Boss充圣点</h2>

    <div class="grid lg:grid-cols-[360px,1fr] gap-6">
      <div class="rounded-xl p-5" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <h3 class="font-bold mb-4" style="color: #00f0ff;">给用户充值</h3>
        <el-form label-position="top">
          <el-form-item label="选择用户">
            <el-select v-model="form.userId" filterable placeholder="搜索/选择用户" class="w-full">
              <el-option
                v-for="user in users"
                :key="user.id"
                :label="`${user.nickname || user.username}（ID:${user.id}）`"
                :value="user.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="充值圣点">
            <el-input-number v-model="form.amount" :min="1" :step="100" class="w-full" />
          </el-form-item>

          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="例如：Boss手动赠送、活动补偿、测试充值" />
          </el-form-item>

          <el-button type="primary" class="w-full" :loading="submitting" @click="submitRecharge">
            确认充值
          </el-button>
        </el-form>
      </div>

      <div class="rounded-xl overflow-hidden" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="flex items-center justify-between p-4 border-b" style="border-color: #1a1a2e;">
          <h3 class="font-bold" style="color: #e0e0ff;">用户列表</h3>
          <el-button size="small" @click="fetchUsers">刷新</el-button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr style="background: rgba(26,26,46,0.5);">
                <th class="text-left p-3" style="color: #6a6a8a;">ID</th>
                <th class="text-left p-3" style="color: #6a6a8a;">用户</th>
                <th class="text-left p-3" style="color: #6a6a8a;">手机号</th>
                <th class="text-left p-3" style="color: #6a6a8a;">状态</th>
                <th class="text-left p-3" style="color: #6a6a8a;">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" style="border-top: 1px solid #1a1a2e;">
                <td class="p-3" style="color: #00f0ff;">{{ user.id }}</td>
                <td class="p-3" style="color: #e0e0ff;">{{ user.nickname || user.username }}</td>
                <td class="p-3" style="color: #8888aa;">{{ user.phone || '-' }}</td>
                <td class="p-3" style="color: #00ff88;">{{ user.status }}</td>
                <td class="p-3">
                  <el-button size="small" @click="selectUser(user.id)">选择</el-button>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="5" class="p-8 text-center" style="color: #5a5a7a;">暂无用户</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api'
import type { User } from '@/types'

const users = ref<User[]>([])
const submitting = ref(false)
const form = reactive({
  userId: undefined as number | undefined,
  amount: 100,
  remark: 'Boss后台手动充值',
})

async function fetchUsers() {
  const res = await adminApi.getUsers({ page: 1, pageSize: 200, status: 'active' })
  users.value = (res.data as any)?.items || []
}

function selectUser(userId: number) {
  form.userId = userId
}

async function submitRecharge() {
  if (!form.userId) {
    ElMessage.warning('请先选择用户')
    return
  }
  if (!form.amount || form.amount <= 0) {
    ElMessage.warning('充值圣点必须大于0')
    return
  }

  const user = users.value.find(item => item.id === form.userId)
  await ElMessageBox.confirm(
    `确认给 ${user?.nickname || user?.username || `用户${form.userId}`} 充值 ${form.amount} 圣点？`,
    'Boss充值确认',
    { confirmButtonText: '确认充值', cancelButtonText: '取消', type: 'warning' },
  )

  submitting.value = true
  try {
    await adminApi.bossAdjustCoins({
      userId: form.userId,
      amount: form.amount,
      remark: form.remark,
    })
    ElMessage.success('充值成功')
  } finally {
    submitting.value = false
  }
}

onMounted(fetchUsers)
</script>
