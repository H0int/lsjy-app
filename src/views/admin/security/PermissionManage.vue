<template><div class="space-y-4"><h2 class="text-xl font-bold" style="color:#00f0ff">🔑 权限管理</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div v-for="r in roles" :key="r.name" class="cyber-card rounded-xl p-4"><div class="flex items-center justify-between mb-3"><div class="flex items-center gap-2"><span class="text-lg">{{r.icon}}</span><span class="font-bold text-sm" style="color:#e0e0ff">{{r.name}}</span></div><span class="text-xs px-2 py-0.5 rounded" style="background:#00f0ff20;color:#00f0ff">{{r.count}}人</span></div><div class="flex flex-wrap gap-1"><span v-for="p in r.perms" :key="p" class="text-xs px-2 py-0.5 rounded" style="background:#0d0d1a;color:#a0a0cc;border:1px solid #00f0ff15">{{p}}</span></div></div></div></div></template>
<script setup lang="ts">
import {ref} from 'vue'
const roles=ref([
{name:'罗总专属',icon:'👑',count:1,perms:['全部权限','超级管理','财务','安全审计']},
{name:'至尊管理员',icon:'💎',count:0,perms:['用户管理','内容管理','数据报表','系统配置']},
{name:'超级管理员',icon:'🌟',count:1,perms:['用户管理','内容管理','订单管理','数据报表']},
{name:'普通管理员',icon:'🔧',count:0,perms:['内容审核','工单管理','FAQ管理']},
{name:'高级用户',icon:'⭐',count:12,perms:['AI工具','个人中心','圣点账户']},
{name:'普通用户',icon:'👤',count:156,perms:['AI工具','个人中心']}
])
</script>