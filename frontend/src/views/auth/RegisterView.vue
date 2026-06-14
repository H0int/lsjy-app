<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-200 via-dark-100 to-dark-200 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <img src="/logo.png" alt="罗圣纪元" class="w-20 h-20 rounded-2xl object-cover shadow-lg shadow-blue-500/30 mb-4" />
        <h1 class="text-2xl font-bold text-white">注册罗圣纪元</h1>
        <p class="text-gray-400 mt-1">AI赋能实体经济，一站式数字化转型平台</p>
      </div>

      <!-- 注册卡片 -->
      <div class="bg-dark-100 rounded-2xl shadow-xl shadow-black/30 p-8 border border-gray-800">
        <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleRegister">
          <el-form-item prop="account">
            <el-input v-model="form.account" placeholder="请输入账号（4-20位字母数字）" prefix-icon="User" size="large" />
          </el-form-item>
          <el-form-item prop="nickname">
            <el-input v-model="form.nickname" placeholder="请输入昵称" prefix-icon="UserFilled" size="large" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码（至少6位）" prefix-icon="Lock" size="large" show-password />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" placeholder="请确认密码" prefix-icon="Lock" size="large" show-password @keyup.enter="handleRegister" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" size="large" class="w-full" :loading="loading" @click="handleRegister"
              style="background: linear-gradient(135deg, #3b82f6, #2563eb); border: none;">
              注 册
            </el-button>
          </el-form-item>
        </el-form>

        <div class="text-center text-sm text-gray-400">
          已有账号？
          <router-link to="/login" class="text-blue-400 hover:underline">立即登录</router-link>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="text-center mt-6 text-xs text-gray-500">
        注册即表示同意《用户协议》和《隐私政策》
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

const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  account: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, max: 20, message: '账号长度为4-20位', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '账号只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

async function handleRegister() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const { authApi } = await import('@/api')
      const res = await authApi.register({
        username: form.account,
        password: form.password,
        nickname: form.nickname
      })
      if (res.code === 0) {
        ElMessage.success('注册成功！')
        // 自动登录
        const success = await authStore.login(form.account, form.password)
        if (success) router.push('/dashboard')
        else router.push('/login')
      } else {
        ElMessage.error(res.message || '注册失败')
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || '注册失败，请稍后重试'
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  })
}
</script>
