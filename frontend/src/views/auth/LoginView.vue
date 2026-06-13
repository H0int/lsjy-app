<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-200 dark:via-dark-100 dark:to-dark-200 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white text-2xl font-bold shadow-lg shadow-blue-500/30 mb-4">罗</div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">欢迎回到罗圣纪元</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">AI赋能实体经济，一站式数字化转型平台</p>
      </div>

      <!-- 登录卡片 -->
      <div class="bg-white dark:bg-dark-100 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none p-8">
        <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin">
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名 / 邮箱" prefix-icon="User" size="large" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" size="large" show-password />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" size="large" class="w-full" :loading="authStore.loading" @click="handleLogin"
              style="background: linear-gradient(135deg, #3b82f6, #2563eb); border: none;">
              登 录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="text-center text-sm text-gray-500 dark:text-gray-400">
          还没有账号？
          <router-link to="/register" class="text-primary hover:underline">立即注册</router-link>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="text-center mt-6 text-xs text-gray-400">
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
