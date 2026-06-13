<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
      <span style="color: var(--cyber-cyan);">▍</span>个人中心
    </h1>

    <div class="grid md:grid-cols-3 gap-6">
      <!-- 左侧用户卡片 -->
      <div class="md:col-span-1">
        <div class="cyber-card p-6 text-center">
          <div class="w-20 h-20 rounded-full flex items-center justify-center text-black text-3xl font-bold mx-auto mb-4"
            style="background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-magenta)); box-shadow: 0 0 20px rgba(0,240,255,0.3);">
            {{ (authStore.nickname || 'U')[0] }}
          </div>
          <h2 class="text-lg font-bold" style="color: var(--cyber-text);">{{ authStore.user?.nickname }}</h2>
          <p class="text-sm mt-1" style="color: var(--cyber-text-dim);">@{{ authStore.user?.username }}</p>
          <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium" :style="roleBadgeStyle">
            {{ roleBadge.label }}
          </span>

          <div class="mt-6 pt-4 space-y-3" style="border-top: 1px solid var(--cyber-border);">
            <div class="flex justify-between text-sm">
              <span style="color: var(--cyber-text-dim);">⚡ 圣点余额</span>
              <span class="font-bold glow-cyan" style="color: var(--cyber-cyan);">{{ authStore.coinBalance.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span style="color: var(--cyber-text-dim);">📅 注册日期</span>
              <span style="color: var(--cyber-text);">{{ formatDate(authStore.user?.createdAt || '') }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span style="color: var(--cyber-text-dim);">🏷️ 用户类型</span>
              <span style="color: var(--cyber-text);">{{ userTypeLabel }}</span>
            </div>
          </div>

          <div class="mt-6 space-y-2">
            <router-link to="/profile/wallet"
              class="block w-full py-2.5 rounded-lg text-sm font-medium transition-all text-center"
              style="background: rgba(0,240,255,0.08); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.2);"
              @mouseover="($event.currentTarget as HTMLElement).style.background='rgba(0,240,255,0.15)'"
              @mouseleave="($event.currentTarget as HTMLElement).style.background='rgba(0,240,255,0.08)'">
              💰 圣点账户
            </router-link>
            <button
              class="block w-full py-2.5 rounded-lg text-sm font-medium transition-all"
              style="background: rgba(136,136,170,0.08); color: var(--cyber-text-dim); border: 1px solid var(--cyber-border);">
              🔒 安全设置
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧信息编辑 -->
      <div class="md:col-span-2">
        <div class="cyber-card p-6">
          <h3 class="font-bold mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
            <span style="color: var(--cyber-magenta);">▍</span>编辑个人信息
          </h3>
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
            class="cyber-card p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1">
            <div class="text-2xl mb-2" style="filter: drop-shadow(0 0 4px rgba(0,240,255,0.3));">{{ item.icon }}</div>
            <div class="text-sm font-medium" style="color: var(--cyber-text);">{{ item.label }}</div>
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
  if (roles.includes('super_admin')) return { label: '👑 超级管理员', bg: 'rgba(124,58,237,0.15)', color: 'var(--cyber-purple)', border: 'rgba(124,58,237,0.3)' }
  if (roles.includes('operator')) return { label: '🔧 运营', bg: 'rgba(0,255,136,0.1)', color: 'var(--cyber-green)', border: 'rgba(0,255,136,0.2)' }
  if (roles.includes('merchant')) return { label: '🏢 商户', bg: 'rgba(255,184,0,0.1)', color: 'var(--cyber-amber)', border: 'rgba(255,184,0,0.2)' }
  return { label: '👤 普通用户', bg: 'rgba(136,136,170,0.1)', color: 'var(--cyber-text-dim)', border: 'var(--cyber-border)' }
})

const roleBadgeStyle = computed(() => ({
  background: roleBadge.value.bg,
  color: roleBadge.value.color,
  border: `1px solid ${roleBadge.value.border}`
}))

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
    if (profileForm.phone !== (authStore.user?.phone || '')) {
      // TODO: 单独的手机号修改接口
    }
    if (profileForm.email !== (authStore.user?.email || '')) {
      // TODO: 单独的邮箱修改接口
    }
    await authStore.fetchUserProfile()
    ElMessage.success('保存成功')
  } catch {
  } finally {
    saving.value = false
  }
}
</script>
