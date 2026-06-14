<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-200 via-dark-100 to-dark-200 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <img src="/logo.png" alt="罗圣纪元" class="w-20 h-20 rounded-2xl object-cover shadow-lg shadow-blue-500/30 mb-4" />
        <h1 class="text-2xl font-bold text-white">欢迎回到罗圣纪元</h1>
        <p class="text-gray-400 mt-1">AI赋能实体经济，一站式数字化转型平台</p>
      </div>

      <!-- 登录卡片 -->
      <div class="bg-dark-100 rounded-2xl shadow-xl shadow-black/30 p-8 border border-gray-800">
        <!-- 锁定提示 -->
        <div v-if="isLocked" class="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-xl text-center">
          <div class="text-red-400 text-lg mb-1">🔒 账号已锁定</div>
          <div class="text-red-300 text-sm">密码连续错误5次，账号已锁定10分钟</div>
          <div class="text-red-200 text-2xl font-bold mt-2">{{ lockCountdown }}</div>
          <div class="text-gray-400 text-xs mt-1">请稍后再试</div>
        </div>

        <!-- 错误次数提示 -->
        <div v-if="!isLocked && failCount > 0" class="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-center">
          <span class="text-yellow-400 text-sm">⚠️ 密码错误 {{ failCount }}/5 次</span>
          <span class="text-gray-400 text-xs ml-2">（{{ 5 - failCount }} 次后锁定10分钟）</span>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin">
          <el-form-item prop="account">
            <el-input v-model="form.account" placeholder="请输入账号" prefix-icon="User" size="large" :disabled="isLocked" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" size="large" show-password :disabled="isLocked" @keyup.enter="handleLogin" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" size="large" class="w-full" :loading="loading" :disabled="isLocked" @click="handleLogin"
              style="background: linear-gradient(135deg, #3b82f6, #2563eb); border: none;">
              {{ isLocked ? '账号已锁定' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="text-center text-sm text-gray-400">
          还没有账号？
          <router-link to="/register" class="text-blue-400 hover:underline">立即注册</router-link>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="text-center mt-6 text-xs text-gray-500">
        登录即表示同意《用户协议》和《隐私政策》
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  account: '',
  password: ''
})

const rules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }]
}

// ===== 锁定机制 =====
const LOCK_KEY = 'lsjy_login_lock'
const FAIL_KEY = 'lsjy_login_fails'
const MAX_FAILS = 5
const LOCK_DURATION = 10 * 60 * 1000 // 10分钟

const isLocked = ref(false)
const lockCountdown = ref('00:00')
const failCount = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

function loadLockState() {
  try {
    const lockUntil = localStorage.getItem(LOCK_KEY)
    const fails = localStorage.getItem(FAIL_KEY)
    failCount.value = fails ? parseInt(fails) : 0

    if (lockUntil) {
      const until = parseInt(lockUntil)
      if (Date.now() < until) {
        isLocked.value = true
        startCountdown(until)
      } else {
        // 锁定已过期，清除
        clearLockState()
      }
    }
  } catch (e) {}
}

function startCountdown(until: number) {
  if (countdownTimer) clearInterval(countdownTimer)
  
  const updateCountdown = () => {
    const remaining = until - Date.now()
    if (remaining <= 0) {
      clearLockState()
      return
    }
    const mins = Math.floor(remaining / 60000)
    const secs = Math.floor((remaining % 60000) / 1000)
    lockCountdown.value = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
}

function recordFail() {
  failCount.value++
  localStorage.setItem(FAIL_KEY, String(failCount.value))
  
  if (failCount.value >= MAX_FAILS) {
    const lockUntil = Date.now() + LOCK_DURATION
    localStorage.setItem(LOCK_KEY, String(lockUntil))
    isLocked.value = true
    startCountdown(lockUntil)
    ElMessage.error(`连续错误${MAX_FAILS}次，账号已锁定10分钟`)
  } else {
    ElMessage.error(`密码错误，还剩 ${MAX_FAILS - failCount.value} 次机会`)
  }
}

function clearLockState() {
  isLocked.value = false
  failCount.value = 0
  lockCountdown.value = '00:00'
  localStorage.removeItem(LOCK_KEY)
  localStorage.removeItem(FAIL_KEY)
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function clearFailCount() {
  failCount.value = 0
  localStorage.removeItem(FAIL_KEY)
}

async function handleLogin() {
  if (!formRef.value) return
  if (isLocked.value) {
    ElMessage.warning('账号已锁定，请等待10分钟后重试')
    return
  }
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const success = await authStore.login(form.account, form.password)
      if (success) {
        clearLockState()
        router.push('/dashboard')
      } else {
        recordFail()
      }
    } catch (e: any) {
      recordFail()
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  loadLockState()
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>
