<template>
  <div class="min-h-screen cyber-circuit-bg" style="background-color: var(--cyber-bg);">
    <!-- 顶部导航栏 - 赛博朋克 -->
    <header class="fixed top-0 left-0 right-0 z-50" style="background: rgba(10, 10, 15, 0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--cyber-border);">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-3 cursor-pointer" @click="$router.push('/dashboard')">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg" style="background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #000; box-shadow: 0 0 12px rgba(0, 240, 255, 0.4);">罗</div>
          <span class="text-lg font-bold hidden sm:block glow-cyan" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">罗圣纪元</span>
        </div>

        <!-- 导航菜单 -->
        <nav class="hidden md:flex items-center gap-1">
          <router-link v-for="item in navItems" :key="item.path" :to="item.path"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
            :class="isActive(item.path)
              ? 'cyber-nav-active'
              : 'text-gray-400 hover:text-white'"
            :style="isActive(item.path) ? 'color: var(--cyber-cyan); background: rgba(0,240,255,0.08); box-shadow: 0 0 10px rgba(0,240,255,0.15);' : ''">
            <span class="mr-1.5">{{ item.icon }}</span>{{ item.label }}
          </router-link>
        </nav>

        <!-- 右侧操作区 -->
        <div class="flex items-center gap-3">
          <!-- 余额 -->
          <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
            style="background: rgba(255, 184, 0, 0.1); border: 1px solid rgba(255, 184, 0, 0.3); color: var(--cyber-amber);">
            <span>⚡</span>
            <span>{{ (authStore.coinBalance || 0) >= 999999 ? '∞ 无限' : (authStore.coinBalance?.toFixed(2) || '0.00') }}</span>
          </div>
          <!-- 用户头像 -->
          <el-dropdown trigger="click">
            <div class="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg transition-all"
              style="border: 1px solid transparent;"
              @mouseover="($event.currentTarget as HTMLElement).style.borderColor='rgba(0,240,255,0.3)'"
              @mouseleave="($event.currentTarget as HTMLElement).style.borderColor='transparent'">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-black text-sm font-medium"
                style="background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-magenta)); box-shadow: 0 0 8px rgba(0,240,255,0.3);">
                {{ (authStore.nickname || 'U')[0] }}
              </div>
              <span class="text-sm hidden sm:block" style="color: var(--cyber-text);">{{ authStore.nickname }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/profile')">👤 个人中心</el-dropdown-item>
                <el-dropdown-item @click="$router.push('/profile/wallet')">💰 圣力中心</el-dropdown-item>
                <el-dropdown-item v-if="authStore.isAdmin" divided @click="goAdmin">⚙️ 管理后台</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">🚪 退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <!-- 顶部扫描线装饰 -->
      <div class="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
        <div class="h-full w-1/3 animate-scan"
          style="background: linear-gradient(90deg, transparent, var(--cyber-cyan), transparent);"></div>
      </div>
    </header>

    <!-- 移动端底部导航 - 赛博朋克 -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style="background: rgba(10, 10, 15, 0.95); backdrop-filter: blur(12px); border-top: 1px solid var(--cyber-border);">
      <div class="flex justify-around py-1">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          class="flex flex-col items-center py-2 px-3 rounded-lg transition-all relative"
          :style="isActive(item.path)
            ? 'color: var(--cyber-cyan); text-shadow: 0 0 8px rgba(0,240,255,0.5);'
            : 'color: var(--cyber-text-dim);'">
          <span class="text-xl" :style="isActive(item.path) ? 'filter: drop-shadow(0 0 4px rgba(0,240,255,0.6));' : ''">{{ item.icon }}</span>
          <span class="text-xs mt-0.5 font-medium">{{ item.label }}</span>
          <!-- 活跃指示器 -->
          <div v-if="isActive(item.path)" class="absolute bottom-1 w-4 h-0.5 rounded-full"
            style="background: var(--cyber-cyan); box-shadow: 0 0 6px var(--cyber-cyan);"></div>
        </router-link>
      </div>
      <!-- 顶部发光线 -->
      <div class="absolute top-0 left-0 right-0 h-px"
        style="background: linear-gradient(90deg, transparent, var(--cyber-cyan), var(--cyber-magenta), transparent);"></div>
    </nav>

    <!-- 主内容区 -->
    <main class="pt-16 pb-28 md:pb-8" style="min-height: calc(100vh - 4rem); background: var(--cyber-bg);">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- ICP备案信息 -->
    <div class="cyber-footer-beian">
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="nofollow">湘ICP备2026022972号-1</a>
      <span class="beian-sep">|</span>
      <span>祁阳市罗圣纪元互联网科技有限责任公司</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { path: '/dashboard', label: '控制台', icon: '🏠' },
  { path: '/chat', label: 'AI智能体', icon: '🧠' },
  { path: '/tools', label: 'AI工具', icon: '🤖' },
  { path: '/profile', label: '我的', icon: '👤' },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

function goAdmin() {
  // 使用同源hash路由，共享localStorage的token（admin.lsjyapp.cn域名隔离导致token不共享）
  window.location.hash = '/admin/dashboard'
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes scan-move {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

.animate-scan {
  animation: scan-move 4s ease-in-out infinite;
}

.cyber-footer-beian {
  position: relative;
  z-index: 40;
  text-align: center;
  padding: 12px 16px 8px;
  font-size: 11px;
  color: rgba(136, 136, 170, 0.4);
  letter-spacing: 0.5px;
  background: transparent;
  margin-bottom: 60px;
}
.cyber-footer-beian a {
  color: rgba(0, 240, 255, 0.35);
  text-decoration: none;
  transition: color 0.2s;
}
.cyber-footer-beian a:hover {
  color: rgba(0, 240, 255, 0.6);
}
.beian-sep {
  margin: 0 6px;
  opacity: 0.3;
}
</style>
