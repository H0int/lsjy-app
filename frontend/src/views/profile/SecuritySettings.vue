<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
        <span style="color: var(--cyber-cyan);">▍</span>安全设置
      </h1>
      <router-link to="/profile" class="px-4 py-2 rounded-lg text-sm"
        style="background: rgba(0,240,255,0.08); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.25);">
        返回个人中心
      </router-link>
    </div>

    <div class="grid md:grid-cols-2 gap-5">
      <div class="cyber-card p-5">
        <h2 class="font-bold mb-4" style="color: var(--cyber-text);">账号绑定</h2>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between gap-4">
            <span style="color: var(--cyber-text-dim);">手机号</span>
            <span style="color: var(--cyber-text);">{{ authStore.user?.phone || '未绑定' }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span style="color: var(--cyber-text-dim);">邮箱</span>
            <span style="color: var(--cyber-text);">{{ authStore.user?.email || '未绑定' }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span style="color: var(--cyber-text-dim);">账号状态</span>
            <span style="color: var(--cyber-green);">正常</span>
          </div>
        </div>
        <p class="mt-4 text-xs" style="color: var(--cyber-text-dim);">
          修改手机号或邮箱请先在个人资料中保存，后续可扩展短信/邮箱验证码校验。
        </p>
      </div>

      <div class="cyber-card p-5">
        <h2 class="font-bold mb-4" style="color: var(--cyber-text);">修改密码</h2>
        <div class="space-y-3">
          <input v-model="form.oldPassword" type="password" placeholder="当前密码"
            class="w-full px-4 py-3 rounded-xl border outline-none"
            style="background: rgba(10,10,20,0.6); color: var(--cyber-text); border-color: var(--cyber-border);" />
          <input v-model="form.newPassword" type="password" placeholder="新密码，至少6位"
            class="w-full px-4 py-3 rounded-xl border outline-none"
            style="background: rgba(10,10,20,0.6); color: var(--cyber-text); border-color: var(--cyber-border);" />
          <input v-model="form.confirmPassword" type="password" placeholder="再次输入新密码"
            class="w-full px-4 py-3 rounded-xl border outline-none"
            style="background: rgba(10,10,20,0.6); color: var(--cyber-text); border-color: var(--cyber-border);" />
          <button type="button" class="w-full py-3 rounded-xl font-medium transition-all disabled:opacity-60"
            style="background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #020617;"
            :disabled="saving" @click="changePassword">
            {{ saving ? '提交中...' : '确认修改密码' }}
          </button>
        </div>
      </div>
    </div>

    <div class="cyber-card p-5 mt-5">
      <h2 class="font-bold mb-4" style="color: var(--cyber-text);">登录设备</h2>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm" style="color: var(--cyber-text);">当前设备</p>
          <p class="text-xs mt-1" style="color: var(--cyber-text-dim);">{{ userAgent }}</p>
        </div>
        <button type="button" class="px-4 py-2 rounded-lg text-sm"
          style="background: rgba(255,68,68,0.08); color: #ff6b6b; border: 1px solid rgba(255,68,68,0.25);"
          @click="logout">
          退出当前登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const saving = ref(false)
const userAgent = navigator.userAgent

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

async function changePassword() {
  if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
    ElMessage.warning('请完整填写密码信息')
    return
  }
  if (form.newPassword.length < 6) {
    ElMessage.warning('新密码至少6位')
    return
  }
  if (form.newPassword !== form.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }
  saving.value = true
  try {
    await authApi.changePassword(form.oldPassword, form.newPassword)
    ElMessage.success('密码修改成功，请妥善保存新密码')
    form.oldPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } finally {
    saving.value = false
  }
}

async function logout() {
  try {
    await authApi.logout()
  } catch {
    // 退出时忽略网络异常，前端本地状态仍会清理
  }
  authStore.logout()
  router.replace('/login')
}
</script>
