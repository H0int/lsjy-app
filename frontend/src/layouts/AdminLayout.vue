<template>
  <div class="cyber-admin">
    <!-- 背景网格 -->
    <div class="cyber-bg-grid"></div>

    <!-- 移动端遮罩 -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

    <!-- 侧边栏 (桌面端固定, 移动端抽屉) -->
    <aside class="cyber-sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">罗</div>
        <div class="logo-text">
          <div class="logo-title">罗圣纪元</div>
          <div class="logo-subtitle">ADMIN CONSOLE</div>
        </div>
        <!-- 移动端关闭按钮 -->
        <button class="sidebar-close-btn" @click="sidebarOpen = false">✕</button>
      </div>
      <div class="sidebar-divider"></div>

      <!-- 菜单 -->
      <nav class="sidebar-nav">
        <div v-for="group in menuGroups" :key="group.label" class="menu-group">
          <div class="menu-group-label">{{ group.label }}</div>
          <router-link v-for="item in group.items" :key="item.path" :to="item.path"
            class="menu-item"
            :class="{ 'menu-active': isActive(item.path) }"
            @click="sidebarOpen = false">
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-label">{{ item.label }}</span>
            <span v-if="isActive(item.path)" class="menu-indicator"></span>
          </router-link>
        </div>
      </nav>

      <!-- 返回前台 -->
      <div class="sidebar-footer">
        <router-link to="/dashboard" class="back-link">
          <span>↩️</span><span>返回前台</span>
        </router-link>
      </div>
    </aside>

    <!-- 主区域 -->
    <div class="cyber-main">
      <!-- 顶栏 -->
      <header class="cyber-header">
        <div class="header-left">
          <!-- 汉堡菜单按钮(移动端) -->
          <button class="hamburger-btn" @click="sidebarOpen = true">
            <span></span><span></span><span></span>
          </button>
          <h1 class="header-title">
            <span class="title-accent">//</span> {{ currentTitle }}
          </h1>
        </div>
        <div class="header-center">
          <div class="sys-stat">
            <span class="stat-dot stat-dot-cyan"></span>
            <span class="stat-label">CPU</span>
            <span class="stat-value">23%</span>
          </div>
          <div class="sys-stat">
            <span class="stat-dot stat-dot-green"></span>
            <span class="stat-label">MEM</span>
            <span class="stat-value">4.2G</span>
          </div>
          <div class="sys-stat sys-stat-mobile-hide">
            <span class="stat-dot stat-dot-magenta"></span>
            <span class="stat-label">ONLINE</span>
            <span class="stat-value">3,256</span>
          </div>
        </div>
        <div class="header-right">
          <div class="admin-avatar">
            <div class="avatar-ring">
              <span class="avatar-text">管</span>
            </div>
            <el-dropdown trigger="click">
              <span class="admin-name">{{ authStore.nickname }}</span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push('/dashboard')">返回前台</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </header>

      <!-- 内容区 -->
      <main class="cyber-content">
        <router-view v-slot="{ Component }">
          <transition name="cyber-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- 移动端底部快速导航 -->
    <nav class="mobile-bottom-nav">
      <router-link v-for="item in bottomNavItems" :key="item.path" :to="item.path"
        class="bottom-nav-item"
        :class="{ 'bottom-nav-active': isActive(item.path) }">
        <span class="bottom-nav-icon">{{ item.icon }}</span>
        <span class="bottom-nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

onMounted(() => {
  if (!authStore.user) {
    authStore.fetchUserProfile()
  }
  if (!authStore.isAdmin) {
    ElMessage.error('无权访问管理后台')
    router.push('/dashboard')
  }
})

const menuGroups = [
  {
    label: '概览',
    items: [
      { path: '/admin/dashboard', label: '数据看板', icon: '📊' },
    ]
  },
  {
    label: '业务管理',
    items: [
      { path: '/admin/users', label: '用户管理', icon: '👥' },
      { path: '/admin/tools', label: '工具管理', icon: '🔧' },
      { path: '/admin/orders', label: '订单管理', icon: '📦' },
    ]
  },
  {
    label: '运营管理',
    items: [
      { path: '/admin/content-moderation', label: '内容审核', icon: '📝' },
      { path: '/admin/announcements', label: '公告管理', icon: '📢' },
      { path: '/admin/coupons', label: '优惠券', icon: '🎫' },
      { path: '/admin/campaigns', label: '活动管理', icon: '🎯' },
    ]
  },
  {
    label: '客服与自动化',
    items: [
      { path: '/admin/tickets', label: '工单管理', icon: '🎧' },
      { path: '/admin/faq', label: 'FAQ管理', icon: '❓' },
      { path: '/admin/automation', label: '自动化规则', icon: '🤖' },
    ]
  },
  {
    label: '数据与配置',
    items: [
      { path: '/admin/reports', label: '数据报表', icon: '📈' },
      { path: '/admin/settings', label: '系统配置', icon: '⚙️' },
    ]
  },
]

// 底部快速导航(移动端)
const bottomNavItems = [
  { path: '/admin/dashboard', label: '看板', icon: '📊' },
  { path: '/admin/users', label: '用户', icon: '👥' },
  { path: '/admin/orders', label: '订单', icon: '📦' },
  { path: '/admin/tickets', label: '工单', icon: '🎧' },
  { path: '/admin/settings', label: '更多', icon: '⚙️' },
]

const allMenuItems = menuGroups.flatMap(g => g.items)

const currentTitle = computed(() => {
  const item = allMenuItems.find(i => route.path === i.path || route.path.startsWith(i.path + '/'))
  return item?.label || '管理后台'
})

function isActive(path: string) {
  return route.path === path
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.cyber-admin {
  min-height: 100vh;
  background: #0a0a0f;
  color: #e0e0ff;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  position: relative;
}

/* ========== RESPONSIVE VARIABLES ========== */
/* Mobile < 768px, Tablet 768-1200px, Desktop > 1200px */

/* ========== BACKGROUND ========== */
.cyber-bg-grid {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

/* ========== SIDEBAR OVERLAY (mobile) ========== */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 45;
  backdrop-filter: blur(4px);
}

/* ========== SIDEBAR ========== */
.cyber-sidebar {
  position: fixed;
  left: 0; top: 0; bottom: 0;
  width: 240px;
  background: linear-gradient(180deg, #0d0d1a 0%, #0a0a14 100%);
  border-right: 1px solid #1a1a2e;
  z-index: 50;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cyber-sidebar::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #00f0ff, #7c3aed, #ff00ff);
  opacity: 0.6;
}

/* Mobile: sidebar hidden by default, slide in when open */
@media (max-width: 767px) {
  .cyber-sidebar {
    transform: translateX(-100%);
  }
  .cyber-sidebar.sidebar-open {
    transform: translateX(0);
    box-shadow: 4px 0 20px rgba(0, 240, 255, 0.1);
  }
}

/* Tablet: sidebar hidden by default too */
@media (min-width: 768px) and (max-width: 1199px) {
  .cyber-sidebar {
    transform: translateX(-100%);
  }
  .cyber-sidebar.sidebar-open {
    transform: translateX(0);
    box-shadow: 4px 0 20px rgba(0, 240, 255, 0.1);
  }
}

/* Desktop: always visible */
@media (min-width: 1200px) {
  .cyber-sidebar {
    transform: translateX(0);
  }
  .sidebar-close-btn {
    display: none !important;
  }
}

.sidebar-close-btn {
  margin-left: auto;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255, 68, 102, 0.1);
  border: 1px solid rgba(255, 68, 102, 0.2);
  color: #ff4466;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.sidebar-close-btn:hover {
  background: rgba(255, 68, 102, 0.2);
}

.sidebar-logo {
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00f0ff, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  color: #fff;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
  flex-shrink: 0;
}

.logo-title {
  font-weight: 700;
  font-size: 15px;
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}

.logo-subtitle {
  font-size: 10px;
  color: #00f0ff;
  letter-spacing: 2px;
  opacity: 0.7;
}

.sidebar-divider {
  height: 1px;
  margin: 0 16px;
  background: linear-gradient(90deg, transparent, #1a1a2e, #00f0ff33, transparent);
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px 80px;
}

.menu-group { margin-bottom: 8px; }

.menu-group-label {
  padding: 8px 12px 4px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #4a4a6a;
  font-weight: 600;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  color: #8888aa;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  margin-bottom: 2px;
}

.menu-item:hover {
  color: #c0c0ff;
  background: rgba(0, 240, 255, 0.05);
}

.menu-active {
  color: #00f0ff !important;
  background: rgba(0, 240, 255, 0.08) !important;
  box-shadow: inset 0 0 20px rgba(0, 240, 255, 0.05);
}

.menu-active::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%);
  width: 3px; height: 60%;
  background: #00f0ff;
  border-radius: 0 2px 2px 0;
  box-shadow: 0 0 8px #00f0ff;
}

.menu-indicator {
  margin-left: auto;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #00f0ff;
  box-shadow: 0 0 6px #00f0ff;
}

.menu-icon { font-size: 16px; }
.menu-label { font-weight: 500; }

.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid #1a1a2e;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  color: #6666aa;
  text-decoration: none;
  transition: all 0.2s;
}

.back-link:hover {
  color: #ff00ff;
  background: rgba(255, 0, 255, 0.05);
}

/* ========== HAMBURGER BUTTON ========== */
.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 32px;
  height: 32px;
  padding: 6px;
  background: transparent;
  border: 1px solid #1a1a2e;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 10px;
  transition: all 0.2s;
}

.hamburger-btn:hover {
  border-color: #00f0ff44;
  background: rgba(0, 240, 255, 0.05);
}

.hamburger-btn span {
  display: block;
  width: 100%;
  height: 2px;
  background: #a0a0cc;
  border-radius: 1px;
  transition: all 0.2s;
}

@media (max-width: 1199px) {
  .hamburger-btn {
    display: flex;
  }
}

/* ========== HEADER ========== */
.cyber-header {
  height: 56px;
  background: rgba(10, 10, 20, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 30;
}

.header-left { display: flex; align-items: center; }

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #e0e0ff;
}

.title-accent {
  color: #00f0ff;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
  margin-right: 4px;
}

.header-center {
  display: flex;
  gap: 24px;
}

@media (max-width: 767px) {
  .header-center {
    display: none;
  }
  .cyber-header {
    padding: 0 12px;
  }
  .header-title {
    font-size: 14px;
  }
}

.sys-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.stat-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

.stat-dot-cyan { background: #00f0ff; box-shadow: 0 0 6px #00f0ff; }
.stat-dot-green { background: #00ff88; box-shadow: 0 0 6px #00ff88; }
.stat-dot-magenta { background: #ff00ff; box-shadow: 0 0 6px #ff00ff; }

.stat-label { color: #5a5a7a; letter-spacing: 1px; font-weight: 600; }
.stat-value { color: #a0a0cc; font-family: 'Courier New', monospace; }

@media (max-width: 900px) {
  .sys-stat-mobile-hide { display: none; }
}

.header-right { display: flex; align-items: center; }

.admin-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-ring {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 2px solid #7c3aed;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(124, 58, 237, 0.3);
}

.avatar-text {
  font-size: 12px;
  font-weight: 700;
  color: #c084fc;
}

.admin-name {
  font-size: 13px;
  color: #a0a0cc;
  cursor: pointer;
}

/* ========== MAIN ========== */
.cyber-main {
  min-height: 100vh;
  position: relative;
  z-index: 1;
  transition: margin-left 0.3s;
}

@media (min-width: 1200px) {
  .cyber-main {
    margin-left: 240px;
  }
}

.cyber-content {
  padding: 24px;
  padding-bottom: 80px; /* space for bottom nav on mobile */
}

@media (max-width: 767px) {
  .cyber-content {
    padding: 16px 12px 80px;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .cyber-content {
    padding: 20px 16px 24px;
  }
}

/* ========== MOBILE BOTTOM NAV ========== */
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(10, 10, 20, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid #1a1a2e;
  z-index: 40;
  padding: 0 4px;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

@media (max-width: 767px) {
  .mobile-bottom-nav {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  border-radius: 8px;
  text-decoration: none;
  color: #5a5a7a;
  transition: all 0.2s;
  min-width: 52px;
}

.bottom-nav-item:active {
  background: rgba(0, 240, 255, 0.08);
}

.bottom-nav-active {
  color: #00f0ff !important;
}

.bottom-nav-active .bottom-nav-icon {
  filter: drop-shadow(0 0 4px rgba(0, 240, 255, 0.5));
}

.bottom-nav-icon {
  font-size: 20px;
  line-height: 1;
}

.bottom-nav-label {
  font-size: 10px;
  font-weight: 600;
}

/* ========== TRANSITIONS ========== */
.cyber-fade-enter-active,
.cyber-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.cyber-fade-enter-from { opacity: 0; transform: translateY(8px); }
.cyber-fade-leave-to { opacity: 0; transform: translateY(-8px); }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ========== ELEMENT PLUS DARK OVERRIDE ========== */
:deep(.el-input__wrapper),
:deep(.el-select .el-input__wrapper),
:deep(.el-textarea__inner) {
  background-color: #12121f !important;
  box-shadow: 0 0 0 1px #1a1a2e inset !important;
  color: #e0e0ff !important;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  color: #e0e0ff !important;
}

:deep(.el-input__inner::placeholder),
:deep(.el-textarea__inner::placeholder) {
  color: #4a4a6a !important;
}

:deep(.el-select-dropdown) {
  background-color: #12121f !important;
  border: 1px solid #1a1a2e !important;
}

:deep(.el-select-dropdown__item) {
  color: #a0a0cc !important;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background-color: rgba(0, 240, 255, 0.08) !important;
}

:deep(.el-select-dropdown__item.selected) {
  color: #00f0ff !important;
}

:deep(.el-table) {
  --el-table-bg-color: transparent !important;
  --el-table-tr-bg-color: transparent !important;
  --el-table-header-bg-color: rgba(26, 26, 46, 0.5) !important;
  --el-table-row-hover-bg-color: rgba(0, 240, 255, 0.05) !important;
  --el-table-border-color: #1a1a2e !important;
  --el-table-text-color: #a0a0cc !important;
  --el-table-header-text-color: #6a6a8a !important;
}

:deep(.el-table th.el-table__cell) {
  background-color: rgba(26, 26, 46, 0.5) !important;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: rgba(18, 18, 31, 0.3) !important;
}

:deep(.el-button--primary) {
  --el-button-bg-color: #00f0ff;
  --el-button-border-color: #00f0ff;
  --el-button-text-color: #0a0a0f;
  --el-button-hover-bg-color: #33f3ff;
  --el-button-hover-border-color: #33f3ff;
  --el-button-hover-text-color: #0a0a0f;
  font-weight: 600;
}

:deep(.el-button--danger) {
  --el-button-bg-color: transparent;
  --el-button-border-color: #ff00ff55;
  --el-button-text-color: #ff00ff;
  --el-button-hover-bg-color: rgba(255, 0, 255, 0.1);
  --el-button-hover-border-color: #ff00ff;
  --el-button-hover-text-color: #ff00ff;
}

:deep(.el-button--default) {
  --el-button-bg-color: transparent;
  --el-button-border-color: #1a1a2e;
  --el-button-text-color: #a0a0cc;
  --el-button-hover-bg-color: rgba(0, 240, 255, 0.05);
  --el-button-hover-border-color: #00f0ff55;
  --el-button-hover-text-color: #00f0ff;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: #6a6a8a;
  --el-pagination-button-bg-color: #12121f;
  --el-pagination-hover-color: #00f0ff;
}

:deep(.el-pagination .el-pager li.is-active) {
  color: #00f0ff !important;
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
}

:deep(.el-dropdown-menu) {
  background-color: #12121f !important;
  border: 1px solid #1a1a2e !important;
}

:deep(.el-dropdown-menu__item) {
  color: #a0a0cc !important;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: rgba(0, 240, 255, 0.08) !important;
  color: #00f0ff !important;
}

:deep(.el-form-item__label) {
  color: #8888aa !important;
}

:deep(.el-message-box) {
  background-color: #12121f !important;
  border: 1px solid #1a1a2e !important;
}

:deep(.el-message-box__title) {
  color: #e0e0ff !important;
}

:deep(.el-message-box__message p) {
  color: #a0a0cc !important;
}

:deep(.el-input-number) {
  --el-input-number-bg-color: #12121f;
}

:deep(.el-switch) {
  --el-switch-off-color: #1a1a2e;
}

:deep(.el-dialog) {
  background-color: #12121f !important;
  border: 1px solid #1a1a2e !important;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #1a1a2e;
}

:deep(.el-dialog__title) {
  color: #e0e0ff !important;
}

/* Mobile dialog full-width */
@media (max-width: 767px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 0 auto !important;
  }
  :deep(.el-dialog__body) {
    padding: 16px !important;
  }
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #0a0a0f; }
::-webkit-scrollbar-thumb { background: #1a1a2e; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #2a2a4e; }
</style>
