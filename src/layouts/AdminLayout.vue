<template>
  <div class="min-h-screen cyber-bg">
    <div v-if="sidebarOpen && isMobile" class="fixed inset-0 z-30" style="background:rgba(0,0,0,0.7);" @click="sidebarOpen=false"></div>
    <aside class="fixed left-0 top-0 bottom-0 z-40 w-64 transition-transform duration-300 overflow-y-auto cyber-sidebar"
      :class="isMobile ? (sidebarOpen?'':'-translate-x-full') : (appStore.sidebarCollapsed?'-translate-x-full':'')"
      style="scrollbar-width:thin;scrollbar-color:#00f0ff40 transparent;">
      <div class="h-16 flex items-center px-5 gap-3" style="border-bottom:1px solid #00f0ff30;">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold" style="background:linear-gradient(135deg,#00f0ff,#b700ff);">罗</div>
        <div><div class="font-bold text-sm cyber-glow-text" style="color:#00f0ff;">罗圣纪元</div><div class="text-xs" style="color:#ff2d95;">COMMAND CENTER</div></div>
        <button v-if="isMobile" @click="sidebarOpen=false" class="ml-auto p-2" style="color:#00f0ff;">✕</button>
      </div>
      <nav class="mt-2 px-2 pb-20">
        <div v-for="group in menuGroups" :key="group.label" class="mb-1">
          <div class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all" style="color:#ff2d95;" @click="toggleGroup(group.label)">
            <span class="text-xs">{{group.icon}}</span>
            <span class="text-xs tracking-wider font-bold flex-1">{{group.label}}</span>
            <span class="text-xs" :style="expanded[group.label]?'color:#ff2d95;':'color:#505080;'">{{group.items.length}}</span>
            <span class="text-xs transition-transform" :style="'color:#505080;'+(expanded[group.label]?'transform:rotate(90deg);':'')">▶</span>
          </div>
          <div v-show="expanded[group.label]" class="ml-2 pl-2" style="border-left:1px solid #00f0ff15;">
            <router-link v-for="item in group.items" :key="item.path" :to="item.path"
              class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all my-0.5"
              :style="route.path===item.path?'background:#00f0ff18;color:#00f0ff;border-left:2px solid #00f0ff;padding-left:10px;':'color:#808099;border-left:2px solid transparent;padding-left:10px;'"
              @click="isMobile && (sidebarOpen = false)">
              <span class="text-sm w-5 text-center">{{item.icon}}</span><span>{{item.label}}</span>
            </router-link>
          </div>
        </div>
      </nav>
      <div class="absolute bottom-4 left-0 right-0 px-3">
        <router-link to="/dashboard" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm" style="color:#a0a0cc;border:1px solid #00f0ff20;">
          <span>↩️</span><span>返回前台</span>
        </router-link>
      </div>
    </aside>
    <div class="transition-all duration-300" :class="isMobile?'ml-0':(appStore.sidebarCollapsed?'ml-0':'ml-64')">
      <header class="h-16 flex items-center justify-between px-4 sticky top-0 z-30" style="background:#0d0d1aee;backdrop-filter:blur(10px);border-bottom:1px solid #00f0ff30;">
        <div class="flex items-center gap-3">
          <button v-if="isMobile" @click="sidebarOpen=!sidebarOpen" class="p-2 text-xl" style="color:#00f0ff;">☰</button>
          <button v-else @click="appStore.toggleSidebar()" class="p-2 text-xl" style="color:#00f0ff;">☰</button>
          <h1 class="text-base font-bold cyber-glow-text" style="color:#00f0ff;">{{currentTitle}}</h1>
        </div>
        <div class="flex items-center gap-2">
          <el-dropdown trigger="click">
            <div class="flex items-center gap-2 cursor-pointer">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style="background:linear-gradient(135deg,#ff2d95,#b700ff);">管</div>
              <span class="text-sm hidden sm:block" style="color:#e0e0ff;">{{authStore.nickname}}</span>
            </div>
            <template #dropdown><el-dropdown-menu><el-dropdown-item @click="$router.push('/dashboard')">返回前台</el-dropdown-item><el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item></el-dropdown-menu></template>
          </el-dropdown>
        </div>
      </header>
      <main class="p-4"><router-view v-slot="{Component}"><transition name="fade" mode="out-in"><component :is="Component"/></transition></router-view></main>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed,ref,reactive,onMounted,onUnmounted} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth'
import {useAppStore} from '@/stores/app'
const route=useRoute(),router=useRouter(),authStore=useAuthStore(),appStore=useAppStore()
const sidebarOpen=ref(false),isMobile=ref(false)
function checkMobile(){isMobile.value=window.innerWidth<768;if(!isMobile.value)sidebarOpen.value=false}
onMounted(()=>{checkMobile();window.addEventListener('resize',checkMobile)})
onUnmounted(()=>window.removeEventListener('resize',checkMobile))
const menuGroups=[
  {label:'概览',icon:'📊',items:[
    {path:'/admin/dashboard',label:'数据看板',icon:'📊'},
    {path:'/admin/realtime',label:'实时监控',icon:'🔴'}
  ]},
  {label:'数据中心',icon:'📈',items:[
    {path:'/admin/traffic',label:'流量分析',icon:'🚦'},
    {path:'/admin/bi',label:'商业智能',icon:'🧠'},
    {path:'/admin/performance',label:'性能监控',icon:'⚡'},
    {path:'/admin/reports',label:'数据报表',icon:'📈'}
  ]},
  {label:'用户管理',icon:'👥',items:[
    {path:'/admin/users',label:'用户管理',icon:'👥'},
    {path:'/admin/registration-audit',label:'注册审核',icon:'📋'},
    {path:'/admin/vip',label:'VIP管理',icon:'💎'},
    {path:'/admin/user-behavior',label:'用户行为',icon:'👁️'},
    {path:'/admin/feedback',label:'反馈管理',icon:'💬'},
    {path:'/admin/account-security',label:'账号安全',icon:'🔒'}
  ]},
  {label:'内容运营',icon:'📝',items:[
    {path:'/admin/content-moderation',label:'内容审核',icon:'📝'},
    {path:'/admin/announcements',label:'公告管理',icon:'📢'},
    {path:'/admin/knowledge',label:'知识库',icon:'📚'},
    {path:'/admin/media',label:'媒体库',icon:'🖼️'},
    {path:'/admin/push',label:'消息推送',icon:'📨'},
    {path:'/admin/faq',label:'FAQ管理',icon:'❓'}
  ]},
  {label:'AI管理',icon:'🤖',items:[
    {path:'/admin/tools',label:'工具管理',icon:'🔧'},
    {path:'/admin/model-monitor',label:'模型监控',icon:'🤖'},
    {path:'/admin/token-usage',label:'Token用量',icon:'🪙'},
    {path:'/admin/prompts',label:'提示词模板',icon:'📝'},
    {path:'/admin/training-data',label:'训练数据',icon:'🏋️'},
    {path:'/admin/chat-history',label:'对话记录',icon:'💬'}
  ]},
  {label:'商业变现',icon:'💰',items:[
    {path:'/admin/orders',label:'订单管理',icon:'📦'},
    {path:'/admin/transactions',label:'交易记录',icon:'💳'},
    {path:'/admin/refunds',label:'退款处理',icon:'↩️'},
    {path:'/admin/payment',label:'支付渠道',icon:'💰'},
    {path:'/admin/invoices',label:'发票管理',icon:'🧾'},
    {path:'/admin/pricing',label:'定价管理',icon:'💲'}
  ]},
  {label:'营销增长',icon:'📈',items:[
    {path:'/admin/coupons',label:'优惠券',icon:'🎫'},
    {path:'/admin/campaigns',label:'活动管理',icon:'🎯'},
    {path:'/admin/referral',label:'推荐追踪',icon:'🔗'},
    {path:'/admin/affiliate',label:'分销管理',icon:'🤝'},
    {path:'/admin/points-mall',label:'积分商城',icon:'🎁'}
  ]},
  {label:'客服支持',icon:'🎧',items:[
    {path:'/admin/tickets',label:'工单管理',icon:'🎧'},
    {path:'/admin/automation',label:'自动化规则',icon:'🤖'},
    {path:'/admin/live-chat',label:'在线聊天',icon:'💬'}
  ]},
  {label:'访客中心',icon:'🚪',items:[
    {path:'/admin/visitors',label:'访客中心',icon:'🚪'},
    {path:'/admin/checkin',label:'签到记录',icon:'✅'},
    {path:'/admin/clock',label:'实时定位',icon:'🕐'},
    {path:'/admin/visitor-stats',label:'访客统计',icon:'📊'}
  ]},
  {label:'系统管理',icon:'⚙️',items:[
    {path:'/admin/settings',label:'系统配置',icon:'⚙️'},
    {path:'/admin/oplog',label:'操作日志',icon:'📋'},
    {path:'/admin/scheduler',label:'定时任务',icon:'⏰'},
    {path:'/admin/api-keys',label:'API密钥',icon:'🔑'},
    {path:'/admin/backup',label:'备份恢复',icon:'💾'},
    {path:'/admin/sysinfo',label:'系统信息',icon:'🖥️'}
  ]},
  {label:'安全中心',icon:'🛡️',items:[
    {path:'/admin/audit',label:'安全审计',icon:'🛡️'},
    {path:'/admin/login-history',label:'登录记录',icon:'🔐'},
    {path:'/admin/ip-blacklist',label:'IP黑名单',icon:'🚫'},
    {path:'/admin/permissions',label:'权限管理',icon:'🔑'}
  ]},
]
const expanded=reactive<Record<string,boolean>>({})
menuGroups.forEach((g,i)=>{expanded[g.label]=i<3})
function toggleGroup(label:string){expanded[label]=!expanded[label]}
const allItems=menuGroups.flatMap(g=>g.items)
const currentTitle=computed(()=>{const i=allItems.find(x=>route.path===x.path);return i?.label||'管理后台'})
function handleLogout(){authStore.logout();router.push('/login')}
</script>
