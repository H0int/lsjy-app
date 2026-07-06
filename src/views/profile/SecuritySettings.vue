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

    <div class="cyber-card p-5 mb-5">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="font-bold" style="color: var(--cyber-text);">账号安全评分</h2>
          <p class="text-xs mt-1" style="color: var(--cyber-text-dim);">绑定越完整，账号找回和异常登录提醒越可靠。</p>
        </div>
        <div class="text-right">
          <div class="text-3xl font-bold" :style="{ color: securityScore >= 80 ? 'var(--cyber-green)' : securityScore >= 55 ? 'var(--cyber-amber)' : '#ff6b6b' }">
            {{ securityScore }}分
          </div>
          <div class="text-xs" style="color: var(--cyber-text-dim);">{{ securityLevel }}</div>
        </div>
      </div>
      <div class="mt-4 h-2 rounded-full overflow-hidden" style="background: rgba(255,255,255,0.08);">
        <div class="h-full rounded-full transition-all" :style="{ width: securityScore + '%', background: 'linear-gradient(90deg, var(--cyber-cyan), var(--cyber-green))' }"></div>
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-5">
      <div class="cyber-card p-5">
        <h2 class="font-bold mb-4" style="color: var(--cyber-text);">账号安全绑定</h2>
        <div class="space-y-3">
          <div v-for="item in bindItems" :key="item.key" class="security-row">
            <div class="flex items-center gap-3 min-w-0">
              <div class="security-icon">{{ item.icon }}</div>
              <div class="min-w-0">
                <div class="text-sm" style="color: var(--cyber-text);">{{ item.label }}</div>
                <div class="text-xs truncate" style="color: var(--cyber-text-dim);">{{ item.value || item.placeholder }}</div>
              </div>
            </div>
            <button type="button" class="security-action" @click="openBindDialog(item)">
              {{ item.value ? '修改' : '绑定' }}
            </button>
          </div>
        </div>
        <p class="mt-4 text-xs" style="color: var(--cyber-text-dim);">
          绑定信息会保存到账号资料中，后续可接入短信、邮箱验证码和微信 OAuth 做二次校验。
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
      <h2 class="font-bold mb-4" style="color: var(--cyber-text);">安全保护</h2>
      <div class="space-y-3">
        <div class="security-row">
          <div>
            <div class="text-sm" style="color: var(--cyber-text);">登录提醒</div>
            <div class="text-xs mt-1" style="color: var(--cyber-text-dim);">参考微信安全提醒，后续异常登录可通过绑定方式通知。</div>
          </div>
          <el-switch v-model="securityForm.loginAlertEnabled" @change="saveSecurityOptions" />
        </div>
        <div class="security-row">
          <div>
            <div class="text-sm" style="color: var(--cyber-text);">常用设备保护</div>
            <div class="text-xs mt-1" style="color: var(--cyber-text-dim);">开启后可用于后续限制陌生设备敏感操作。</div>
          </div>
          <el-switch v-model="securityForm.deviceLockEnabled" @change="saveSecurityOptions" />
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

    <el-dialog v-model="bindDialog.visible" :title="bindDialog.title" width="420px" class="security-bind-dialog">
      <div class="space-y-3">
        <p class="text-xs" style="color: var(--cyber-text-dim);">{{ bindDialog.tip }}</p>
        <el-input v-model="bindDialog.value" :placeholder="bindDialog.placeholder" clearable />
      </div>
      <template #footer>
        <el-button @click="bindDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="savingBind" @click="saveBind">保存绑定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api'
import { useAuthStore } from '@/stores/auth'
import service from '@/api/request'

const router = useRouter()
const authStore = useAuthStore()
const saving = ref(false)
const savingBind = ref(false)
const userAgent = navigator.userAgent

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const securityForm = reactive({
  phone: '',
  email: '',
  wechatId: '',
  qq: '',
  emergencyContact: '',
  emergencyPhone: '',
  securityQuestion: '',
  loginAlertEnabled: true,
  deviceLockEnabled: false,
})

const bindDialog = reactive({
  visible: false,
  key: '',
  title: '',
  value: '',
  placeholder: '',
  tip: '',
})

const bindItems = computed(() => [
  { key: 'phone', icon: '📱', label: '手机号', value: maskPhone(securityForm.phone), raw: securityForm.phone, placeholder: '未绑定，用于登录验证和账号找回', inputPlaceholder: '请输入手机号', tip: '建议绑定常用手机号，后续可用于短信验证码和账号找回。' },
  { key: 'email', icon: '✉️', label: '邮箱', value: maskEmail(securityForm.email), raw: securityForm.email, placeholder: '未绑定，用于接收安全通知', inputPlaceholder: '请输入邮箱', tip: '建议绑定常用邮箱，后续可用于安全通知和找回账号。' },
  { key: 'wechatId', icon: '💬', label: '微信号', value: securityForm.wechatId, raw: securityForm.wechatId, placeholder: '未绑定，可参考微信生态做身份关联', inputPlaceholder: '请输入微信号', tip: '这里先保存微信号信息，后续接入微信 OAuth 后可升级为真正授权绑定。' },
  { key: 'qq', icon: '🐧', label: 'QQ号', value: securityForm.qq, raw: securityForm.qq, placeholder: '未绑定，备用联系方式', inputPlaceholder: '请输入QQ号', tip: 'QQ号可作为备用联系方式，便于客服核验身份。' },
  { key: 'emergencyContact', icon: '🛟', label: '应急联系人', value: securityForm.emergencyContact, raw: securityForm.emergencyContact, placeholder: '未设置，账号异常时辅助核验', inputPlaceholder: '请输入联系人姓名', tip: '应急联系人用于账号异常时辅助身份核验。' },
  { key: 'emergencyPhone', icon: '☎️', label: '应急电话', value: maskPhone(securityForm.emergencyPhone), raw: securityForm.emergencyPhone, placeholder: '未设置，建议填写备用手机号', inputPlaceholder: '请输入备用手机号', tip: '应急电话建议不同于登录手机号，提升账号找回成功率。' },
  { key: 'securityQuestion', icon: '🔐', label: '安全问题', value: securityForm.securityQuestion ? '已设置' : '', raw: securityForm.securityQuestion, placeholder: '未设置，建议设置一句只有你知道的提示', inputPlaceholder: '例如：我的第一所学校？', tip: '请只填写问题提示，不要把答案直接写在这里。' },
])

const securityScore = computed(() => {
  const score = bindItems.value.reduce((sum, item) => sum + (item.raw ? 10 : 0), 20)
    + (securityForm.loginAlertEnabled ? 5 : 0)
    + (securityForm.deviceLockEnabled ? 5 : 0)
  return Math.min(score, 100)
})

const securityLevel = computed(() => {
  if (securityScore.value >= 80) return '安全等级：高'
  if (securityScore.value >= 55) return '安全等级：中'
  return '安全等级：待加强'
})

onMounted(async () => {
  await authStore.fetchUserProfile()
  hydrateSecurityForm()
})

function hydrateSecurityForm() {
  const user: any = authStore.user || {}
  securityForm.phone = user.phone || ''
  securityForm.email = user.email || ''
  securityForm.wechatId = user.wechatId || ''
  securityForm.qq = user.qq || ''
  securityForm.emergencyContact = user.emergencyContact || ''
  securityForm.emergencyPhone = user.emergencyPhone || ''
  securityForm.securityQuestion = user.securityQuestion || ''
  securityForm.loginAlertEnabled = user.loginAlertEnabled !== false
  securityForm.deviceLockEnabled = !!user.deviceLockEnabled
}

function openBindDialog(item: any) {
  bindDialog.key = item.key
  bindDialog.title = `${item.value ? '修改' : '绑定'}${item.label}`
  bindDialog.value = item.raw || ''
  bindDialog.placeholder = item.inputPlaceholder
  bindDialog.tip = item.tip
  bindDialog.visible = true
}

async function saveBind() {
  if (!bindDialog.key) return
  const value = bindDialog.value.trim()
  if (bindDialog.key === 'phone' && value && !/^1\d{10}$/.test(value)) return ElMessage.warning('请输入正确的手机号')
  if (bindDialog.key === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return ElMessage.warning('请输入正确的邮箱')
  if (bindDialog.key === 'qq' && value && !/^\d{5,12}$/.test(value)) return ElMessage.warning('请输入正确的QQ号')
  if (bindDialog.key === 'emergencyPhone' && value && !/^1\d{10}$/.test(value)) return ElMessage.warning('请输入正确的备用手机号')
  savingBind.value = true
  try {
    await saveSecurityPatch({ [bindDialog.key]: value })
    ;(securityForm as any)[bindDialog.key] = value
    bindDialog.visible = false
    ElMessage.success('安全绑定已保存')
  } finally {
    savingBind.value = false
  }
}

async function saveSecurityOptions() {
  await saveSecurityPatch({
    loginAlertEnabled: securityForm.loginAlertEnabled,
    deviceLockEnabled: securityForm.deviceLockEnabled,
  })
  ElMessage.success('安全保护设置已更新')
}

async function saveSecurityPatch(patch: Record<string, any>) {
  const res = await service.put('/users/me', patch)
  const updatedUser = (res as any).data?.data || (res as any).data
  if (authStore.user) {
    Object.assign(authStore.user, updatedUser || {}, patch)
    localStorage.setItem('lsjy_user', JSON.stringify(authStore.user))
  }
}

function maskPhone(phone?: string) {
  if (!phone) return ''
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}

function maskEmail(email?: string) {
  if (!email) return ''
  const [name, domain] = email.split('@')
  if (!domain) return email
  return `${name.slice(0, 2)}***@${domain}`
}

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

<style scoped>
.security-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(10, 10, 20, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.security-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 240, 255, 0.08);
  border: 1px solid rgba(0, 240, 255, 0.18);
  flex: 0 0 auto;
}

.security-action {
  color: var(--cyber-cyan);
  border: 1px solid rgba(0, 240, 255, 0.25);
  background: rgba(0, 240, 255, 0.08);
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 12px;
  white-space: nowrap;
}

.security-action:hover {
  background: rgba(0, 240, 255, 0.14);
}
</style>
