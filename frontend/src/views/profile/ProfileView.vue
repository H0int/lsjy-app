<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
      <span style="color: var(--cyber-cyan);">▍</span>个人中心
    </h1>

    <div class="grid md:grid-cols-3 gap-6">
      <!-- 左侧用户卡片 -->
      <div class="md:col-span-1">
        <div class="cyber-card p-6 text-center">
          <div class="relative w-20 h-20 mx-auto mb-4 group cursor-pointer" @click="triggerAvatarUpload">
            <div v-if="!avatarUrl" class="w-20 h-20 rounded-full flex items-center justify-center text-black text-3xl font-bold"
              style="background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-magenta)); box-shadow: 0 0 20px rgba(0,240,255,0.3);">
              {{ (authStore.nickname || 'U')[0] }}
            </div>
            <img v-else :src="avatarUrl" class="w-20 h-20 rounded-full object-cover" style="box-shadow: 0 0 20px rgba(0,240,255,0.3);" />
            <div class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style="backdrop-filter: blur(2px);">
              <span class="text-xs text-white">更换头像</span>
            </div>
            <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="handleAvatarChange" />
          </div>
          <h2 class="text-lg font-bold" style="color: var(--cyber-text);">{{ authStore.user?.nickname }}</h2>
          <p class="text-sm mt-1" style="color: var(--cyber-text-dim);">@{{ authStore.user?.username }}</p>
          <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium" :style="roleBadgeStyle">
            {{ roleBadge.label }}
          </span>

          <div class="mt-6 pt-4 space-y-3" style="border-top: 1px solid var(--cyber-border);">
            <div class="flex justify-between text-sm">
              <span style="color: var(--cyber-text-dim);">⚡ 圣力余额</span>
              <span class="font-bold glow-cyan" style="color: var(--cyber-cyan);">{{ authStore.coinBalance >= 999999 ? '∞ 无限' : authStore.coinBalance.toFixed(2) }}</span>
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
              💰 圣力中心
            </router-link>
            <router-link to="/profile/security"
              class="block w-full py-2.5 rounded-lg text-sm font-medium transition-all"
              style="background: rgba(136,136,170,0.08); color: var(--cyber-text-dim); border: 1px solid var(--cyber-border);">
              🔒 安全设置
            </router-link>
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
          <router-link v-for="item in navigationActions" :key="item.label"
            :to="item.to"
            class="cyber-card p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 focus:outline-none block"
            :aria-label="item.label"
            role="button">
            <div class="text-2xl mb-2" style="filter: drop-shadow(0 0 4px rgba(0,240,255,0.3));">{{ item.icon }}</div>
            <div class="text-sm font-medium" style="color: var(--cyber-text);">{{ item.label }}</div>
          </router-link>
          <a
            :href="`tel:${CUSTOMER_SERVICE_PHONE}`"
            class="cyber-card p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 focus:outline-none block"
            aria-label="联系客服"
            role="button"
            @click="showCustomerServicePhone">
            <div class="text-2xl mb-2" style="filter: drop-shadow(0 0 4px rgba(0,240,255,0.3));">🎧</div>
            <div class="text-sm font-medium" style="color: var(--cyber-text);">联系客服</div>
          </a>
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

const CUSTOMER_SERVICE_PHONE = '18774656292'

const authStore = useAuthStore()
const saving = ref(false)
const avatarUrl = ref(authStore.user?.avatar || '')
const avatarInput = ref<HTMLInputElement>()

function triggerAvatarUpload() {
  avatarInput.value?.click()
}

async function handleAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }
  try {
    const dataUrl = await compressAvatar(file)
    avatarUrl.value = dataUrl
    const res = await userApi.updateProfile({ avatar: dataUrl })
    const updatedUser = (res as any).data?.data || (res as any).data
    if (authStore.user) {
      Object.assign(authStore.user, updatedUser || {}, { avatar: dataUrl })
      localStorage.setItem('lsjy_user', JSON.stringify(authStore.user))
    }
    ElMessage.success('头像已更新')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || '头像上传失败')
  } finally {
    ;(e.target as HTMLInputElement).value = ''
  }
}

function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('图片读取失败'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('图片解析失败'))
      img.onload = () => {
        const max = 512
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('头像压缩失败'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

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
  // 按优先级从高到低检查
  if (roles.includes('boss')) return { label: ' 罗总专属', bg: 'rgba(255,215,0,0.15)', color: '#ffd700', border: 'rgba(255,215,0,0.3)' }
  if (roles.includes('ultimate_admin')) return { label: '💎 至尊管理员', bg: 'rgba(255,0,255,0.15)', color: 'var(--cyber-magenta)', border: 'rgba(255,0,255,0.3)' }
  if (roles.includes('super_admin')) return { label: '⭐ 超级管理员', bg: 'rgba(124,58,237,0.15)', color: 'var(--cyber-purple)', border: 'rgba(124,58,237,0.3)' }
  if (roles.includes('admin')) return { label: ' 普通管理员', bg: 'rgba(0,240,255,0.1)', color: 'var(--cyber-cyan)', border: 'rgba(0,240,255,0.2)' }
  if (roles.includes('premium')) return { label: ' 高级用户', bg: 'rgba(0,255,136,0.1)', color: 'var(--cyber-green)', border: 'rgba(0,255,136,0.2)' }
  if (roles.includes('operator')) return { label: '🔧 运营', bg: 'rgba(0,255,136,0.1)', color: 'var(--cyber-green)', border: 'rgba(0,255,136,0.2)' }
  if (roles.includes('merchant')) return { label: '🏢 商户', bg: 'rgba(255,184,0,0.1)', color: 'var(--cyber-amber)', border: 'rgba(255,184,0,0.2)' }
  return { label: ' 普通用户', bg: 'rgba(136,136,170,0.1)', color: 'var(--cyber-text-dim)', border: 'var(--cyber-border)' }
})

const roleBadgeStyle = computed(() => ({
  background: roleBadge.value.bg,
  color: roleBadge.value.color,
  border: `1px solid ${roleBadge.value.border}`
}))

const userTypeLabel = computed(() => {
  return userTypeMap[authStore.user?.userType || 'personal'] || '个人版'
})

const navigationActions = [
  { icon: '📋', label: '我的订单', to: { path: '/profile/wallet', query: { section: 'orders' } } },
  { icon: '🎨', label: '我的作品', to: '/profile/works' },
  { icon: '⭐', label: '收藏工具', to: '/profile/favorites' },
]

function showCustomerServicePhone() {
  ElMessage.info(`客服电话：${CUSTOMER_SERVICE_PHONE}`)
}

async function saveProfile() {
  saving.value = true
  try {
    const res = await userApi.updateProfile({
      nickname: profileForm.nickname,
      bio: profileForm.bio,
      gender: profileForm.gender,
      phone: profileForm.phone,
      email: profileForm.email,
    })
    const updatedUser = (res as any).data?.data || (res as any).data
    if (authStore.user && updatedUser) {
      Object.assign(authStore.user, updatedUser)
      localStorage.setItem('lsjy_user', JSON.stringify(authStore.user))
    } else {
      await authStore.fetchUserProfile()
    }
    ElMessage.success('保存成功')
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败，请重试')
  } finally {
    saving.value = false
  }
}
</script>
