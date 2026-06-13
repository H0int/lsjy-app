<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">👤 个人中心</h1>

    <div class="grid md:grid-cols-3 gap-6">
      <!-- 左侧用户卡片 -->
      <div class="md:col-span-1">
        <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 text-center shadow-sm">
          <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
            {{ (authStore.nickname || 'U')[0] }}
          </div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ authStore.user?.nickname }}</h2>
          <p class="text-sm text-gray-500 mt-1">@{{ authStore.user?.username }}</p>
          <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium"
            :class="roleBadge.class">{{ roleBadge.label }}</span>

          <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">⚡ 圣点余额</span>
              <span class="font-bold text-amber-500">{{ authStore.coinBalance.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">📅 注册日期</span>
              <span class="text-gray-700 dark:text-gray-300">{{ formatDate(authStore.user?.createdAt || '') }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">🏷️ 用户类型</span>
              <span class="text-gray-700 dark:text-gray-300">{{ userTypeLabel }}</span>
            </div>
          </div>

          <div class="mt-6 space-y-2">
            <router-link to="/profile/wallet" class="block w-full py-2.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              💰 圣点账户
            </router-link>
            <button class="block w-full py-2.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors">
              🔒 安全设置
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧信息编辑 -->
      <div class="md:col-span-2">
        <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-sm">
          <h3 class="font-bold text-gray-900 dark:text-white mb-4">编辑个人信息</h3>
          <el-form :model="profileForm" label-position="top">
            <div class="grid sm:grid-cols-2 gap-4">
              <el-form-item label="昵称">
                <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
              </el-form-item>
              <el-form-item label="用户名">
                <el-input v-model="profileForm.username" disabled />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
              </el-form-item>
              <el-form-item label="个人简介">
                <el-input v-model="profileForm.bio" type="textarea" :rows="2" placeholder="介绍一下自己..." />
              </el-form-item>
              <el-form-item label="性别">
                <el-select v-model="profileForm.gender" class="w-full">
                  <el-option label="未设置" :value="0" />
                  <el-option label="男" :value="1" />
                  <el-option label="女" :value="2" />
                </el-select>
              </el-form-item>
            </div>
            <el-form-item>
              <el-button type="primary" @click="saveProfile" :loading="saving">保存修改</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 快捷功能 -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div v-for="item in quickActions" :key="item.label"
            class="bg-white dark:bg-dark-100 rounded-xl p-4 text-center cursor-pointer hover:shadow-md transition-all">
            <div class="text-2xl mb-2">{{ item.icon }}</div>
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api'
import { formatDate, userTypeMap } from '@/utils'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const saving = ref(false)

const profileForm = reactive({
  nickname: authStore.user?.nickname || '',
  username: authStore.user?.username || '',
  phone: authStore.user?.phone || '',
  email: authStore.user?.email || '',
  bio: authStore.user?.bio || '',
  gender: authStore.user?.gender || 0
})

const roleBadge = computed(() => {
  const roles = authStore.userRoles
  if (roles.includes('super_admin')) return { label: '👑 超级管理员', class: 'bg-purple-100 text-purple-600' }
  if (roles.includes('operator')) return { label: '🔧 运营', class: 'bg-green-100 text-green-600' }
  if (roles.includes('merchant')) return { label: '🏢 商户', class: 'bg-amber-100 text-amber-600' }
  return { label: '👤 普通用户', class: 'bg-gray-100 text-gray-600' }
})

const userTypeLabel = computed(() => {
  return userTypeMap[authStore.user?.userType || 'personal'] || '个人版'
})

const quickActions = [
  { icon: '📋', label: '我的订单' },
  { icon: '🎨', label: '我的作品' },
  { icon: '⭐', label: '收藏工具' },
  { icon: '🎧', label: '联系客服' },
]

async function saveProfile() {
  saving.value = true
  try {
    await userApi.updateProfile({
      nickname: profileForm.nickname,
      bio: profileForm.bio,
      gender: profileForm.gender,
    })
    // 注意：phone 和 email 的修改需要后端支持
    if (profileForm.phone !== (authStore.user?.phone || '')) {
      // TODO: 单独的手机号修改接口（需要验证码）
    }
    if (profileForm.email !== (authStore.user?.email || '')) {
      // TODO: 单独的邮箱修改接口（需要验证邮件）
    }
    await authStore.fetchUserProfile()
    ElMessage.success('保存成功')
  } catch {
    // 错误由拦截器处理
  } finally {
    saving.value = false
  }
}
</script>
