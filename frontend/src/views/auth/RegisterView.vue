<template>
  <div class="min-h-screen cyber-circuit-bg flex items-center justify-center p-4" style="background-color: var(--cyber-bg);">
    <!-- 背景装饰 -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-10"
        style="background: radial-gradient(circle, var(--cyber-magenta), transparent 70%);"></div>
      <div class="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full opacity-8"
        style="background: radial-gradient(circle, var(--cyber-purple), transparent 70%);"></div>
    </div>

    <div class="w-full max-w-md relative z-10">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-black text-2xl font-bold mb-4"
          style="background: linear-gradient(135deg, var(--cyber-magenta), var(--cyber-purple)); box-shadow: 0 0 20px rgba(255,0,255,0.4);">罗</div>
        <h1 class="text-2xl font-bold glow-magenta" style="color: var(--cyber-magenta); font-family: 'JetBrains Mono', monospace;">创建账号</h1>
        <p class="mt-1" style="color: var(--cyber-text-dim);">加入罗圣纪元，开启AI数字化之旅</p>
      </div>

      <div class="cyber-card p-8">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="字母数字下划线，3位以上" size="large" />
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="form.nickname" placeholder="请输入昵称" size="large" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号（选填）" size="large" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱（选填）" size="large" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码（至少6位）" size="large" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" size="large" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" class="w-full" :loading="loading" @click="handleRegister"
              style="height: 48px; font-size: 16px; letter-spacing: 4px;">
              注 册
            </el-button>
          </el-form-item>
        </el-form>

        <div class="text-center text-sm" style="color: var(--cyber-text-dim);">
          已有账号？<router-link to="/login" class="font-medium" style="color: var(--cyber-cyan);">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateConfirm = (_rule: any, value: string, callback: any) => {
  if (value !== form.password) callback(new Error('两次输入密码不一致'))
  else callback()
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少3位', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }, { validator: validateConfirm, trigger: 'blur' }]
}

async function handleRegister() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await authApi.register({
        username: form.username,
        password: form.password,
        nickname: form.nickname,
        phone: form.phone || undefined,
        email: form.email || undefined
      })
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    } catch (e: any) {
      // 错误已由拦截器处理
    } finally {
      loading.value = false
    }
  })
}
</script>
