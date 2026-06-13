<template>
  <div class="min-h-screen cyber-circuit-bg flex items-center justify-center p-4" style="background-color: var(--cyber-bg);">
    <!-- 背景装饰 -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
        style="background: radial-gradient(circle, var(--cyber-cyan), transparent 70%);"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10"
        style="background: radial-gradient(circle, var(--cyber-magenta), transparent 70%);"></div>
    </div>

    <div class="w-full max-w-md relative z-10">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-black text-2xl font-bold mb-4 neon-flicker"
          style="background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); box-shadow: 0 0 20px rgba(0,240,255,0.4), 0 0 40px rgba(0,240,255,0.1);">罗</div>
        <h1 class="text-2xl font-bold glow-cyan" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">欢迎回到罗圣纪元</h1>
        <p class="mt-1" style="color: var(--cyber-text-dim);">AI赋能实体经济，一站式数字化转型平台</p>
      </div>

      <!-- 登录卡片 -->
      <div class="cyber-card p-8 cyber-scanline">
        <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin">
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名 / 邮箱" prefix-icon="User" size="large" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" size="large" show-password />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" size="large" class="w-full" :loading="authStore.loading" @click="handleLogin"
              style="height: 48px; font-size: 16px; letter-spacing: 4px;">
              登 录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="text-center text-sm" style="color: var(--cyber-text-dim);">
          还没有账号？
          <router-link to="/register" class="font-medium" style="color: var(--cyber-magenta);">立即注册</router-link>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="text-center mt-6 text-xs" style="color: var(--cyber-text-dim);">
        登录即表示同意《用户协议》和《隐私政策》
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名或邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }]
}

async function handleLogin() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    const success = await authStore.login(form.username, form.password)
    if (success) router.push('/dashboard')
  } catch {
    // 验证失败，不执行登录
  }
}
</script>
