import { All, Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class AdminExtrasController {
  private userTags: any[] = [];
  private blacklist: any[] = [];
  private sensitiveWords: any[] = [];
  private pushMessages: any[] = [];
  private contentLibrary: any[] = [];
  private knowledgeDocs: any[] = [];
  private roles: any[] = [
    {
      id: 1,
      name: 'boss',
      displayName: 'Boss账号',
      description: '老板最高权限，可管理后台和充值圣点',
      permissions: ['dashboard:view', 'users:manage', 'finance:manage', 'system:manage'],
      userCount: 1,
      permissionCount: 4,
      status: '启用',
    },
    {
      id: 2,
      name: 'admin',
      displayName: '管理员',
      description: '后台管理权限',
      permissions: ['dashboard:view', 'users:manage'],
      userCount: 0,
      permissionCount: 2,
      status: '启用',
    },
  ];
  private permissions = [
    'dashboard:view',
    'users:manage',
    'finance:manage',
    'tools:manage',
    'content:manage',
    'system:manage',
  ];
  private agents: any[] = [
    { id: 101, name: '总指挥罗圣', icon: '👑', category: '综合', status: 'active', coinCost: 1 },
  ];

  private page(items: any[] = [], page = 1, pageSize = 20) {
    const p = Number(page) || 1;
    const ps = Number(pageSize) || 20;
    return {
      items: items.slice((p - 1) * ps, p * ps),
      list: items.slice((p - 1) * ps, p * ps),
      total: items.length,
      page: p,
      pageSize: ps,
    };
  }

  @Get('admin/dashboard')
  dashboard() {
    return {
      code: 0,
      data: {
        activeUsers: 0,
        onlineUsers: 0,
        todayRegistrations: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        todayAIUsage: 0,
        apiErrorRate: 0,
        paymentFailureRate: 0,
        realtimeStats: [
          { label: '在线用户', value: 0 },
          { label: '今日注册', value: 0 },
          { label: '今日营收', value: 0 },
          { label: '圣力消耗', value: 0 },
        ],
        trend: { dates: [], newUsers: [], revenue: [] },
        modules: [
          { name: 'AI工具', users: 0, revenue: 0 },
          { name: '自媒体', users: 0, revenue: 0 },
          { name: '电商', users: 0, revenue: 0 },
          { name: '教育', users: 0, revenue: 0 },
          { name: '宠物', users: 0, revenue: 0 },
          { name: '伯雅校园', users: 0, revenue: 0 },
        ],
        topTools: [],
        topProducts: [],
        recentLogs: [],
      },
    };
  }

  @Get('admin/online-users')
  onlineUsers() {
    return { code: 0, data: { items: [], list: [], total: 0 } };
  }

  @Get('admin/locations')
  locations() {
    return { code: 0, data: { items: [], list: [], total: 0 } };
  }

  @Get('admin/user-tags')
  getUserTags() {
    return { code: 0, data: this.userTags };
  }

  @Post('admin/user-tags')
  createUserTag(@Body() body: any) {
    const item = { id: Date.now(), ...body, createdAt: new Date().toISOString() };
    this.userTags.unshift(item);
    return { code: 0, data: item, message: '创建成功' };
  }

  @Get('admin/blacklist')
  getBlacklist() {
    return { code: 0, data: { users: this.blacklist.filter(i => i.type === 'user'), ips: this.blacklist.filter(i => i.type === 'ip') } };
  }

  @Post('admin/blacklist/users')
  addBlacklistUser(@Body() body: any) {
    const item = { id: Date.now(), type: 'user', ...body, createdAt: new Date().toISOString() };
    this.blacklist.unshift(item);
    return { code: 0, data: item, message: '已加入黑名单' };
  }

  @Post('admin/blacklist/ips')
  addBlacklistIp(@Body() body: any) {
    const item = { id: Date.now(), type: 'ip', ...body, createdAt: new Date().toISOString() };
    this.blacklist.unshift(item);
    return { code: 0, data: item, message: '已加入黑名单' };
  }

  @Get('admin/commissions')
  commissions() {
    return { code: 0, data: [] };
  }

  @Get('admin/withdraws')
  withdraws() {
    return { code: 0, data: [] };
  }

  @Get('admin/feedback')
  feedback() {
    return { code: 0, data: [] };
  }

  @Get('admin/permissions')
  getPermissions() {
    return {
      code: 0,
      data: {
        roles: this.roles.map(role => ({ ...role, permissionCount: role.permissions?.length || 0 })),
        permissions: this.permissions,
        stats: {
          totalRoles: this.roles.length,
          totalPermissions: this.permissions.length,
          assignedUsers: this.roles.reduce((sum, role) => sum + Number(role.userCount || 0), 0),
        },
      },
    };
  }

  @Post('admin/permissions')
  createPermissionRole(@Body() body: any) {
    const item = {
      id: Date.now(),
      name: body.name || body.displayName || `role_${Date.now()}`,
      displayName: body.displayName || body.name || '新角色',
      description: body.description || '',
      permissions: body.permissions || [],
      userCount: 0,
      status: '启用',
    };
    this.roles.unshift(item);
    return { code: 0, data: item, message: '创建成功' };
  }

  @Put('admin/permissions/:id')
  updatePermissionRole(@Param('id') id: string, @Body() body: any) {
    const role = this.roles.find(item => String(item.id) === String(id));
    if (!role) return { code: 404, data: null, message: '角色不存在' };
    Object.assign(role, {
      displayName: body.displayName ?? role.displayName,
      description: body.description ?? role.description,
      permissions: body.permissions ?? role.permissions,
      permissionCount: (body.permissions ?? role.permissions ?? []).length,
    });
    return { code: 0, data: role, message: '保存成功' };
  }

  @All('admin/permissions/:id')
  removePermissionRole(@Param('id') id: string) {
    this.roles = this.roles.filter(item => String(item.id) !== String(id));
    return { code: 0, data: null, message: '删除成功' };
  }

  @Get('admin/sensitive-words')
  getSensitiveWords() {
    return { code: 0, data: this.sensitiveWords };
  }

  @Post('admin/sensitive-words')
  createSensitiveWord(@Body() body: any) {
    const item = { id: Date.now(), ...body, createdAt: new Date().toISOString() };
    this.sensitiveWords.unshift(item);
    return { code: 0, data: item, message: '添加成功' };
  }

  @Get('admin/push-messages')
  getPushMessages() {
    return { code: 0, data: this.pushMessages };
  }

  @Post('admin/push-messages')
  createPushMessage(@Body() body: any) {
    const item = { id: Date.now(), status: 'draft', ...body, createdAt: new Date().toISOString() };
    this.pushMessages.unshift(item);
    return { code: 0, data: item, message: '创建成功' };
  }

  @Post('admin/push-messages/:id/send')
  sendPushMessage(@Param('id') id: string) {
    const item = this.pushMessages.find(i => String(i.id) === String(id));
    if (item) item.status = 'sent';
    return { code: 0, data: item || null, message: '发送成功' };
  }

  @Get('admin/distribution')
  distribution() {
    return { code: 0, data: { links: [], rules: {}, totalClicks: 0, conversions: 0 } };
  }

  @Put('admin/distribution/rules')
  saveDistributionRules(@Body() body: any) {
    return { code: 0, data: body, message: '保存成功' };
  }

  @Get('admin/affiliates')
  affiliates() {
    return { code: 0, data: [] };
  }

  @Post('admin/affiliates')
  createAffiliate(@Body() body: any) {
    return { code: 0, data: { id: Date.now(), ...body }, message: '创建成功' };
  }

  @Get('admin/content-library')
  getContentLibrary(@Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return { code: 0, data: this.page(this.contentLibrary, Number(page), Number(pageSize)) };
  }

  @Post('admin/content-library')
  createContent(@Body() body: any) {
    const item = { id: Date.now(), ...body, createdAt: new Date().toISOString() };
    this.contentLibrary.unshift(item);
    return { code: 0, data: item, message: '创建成功' };
  }

  @Get('admin/chat-logs')
  chatLogs(@Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return { code: 0, data: this.page([], Number(page), Number(pageSize)) };
  }

  @Get('admin/agents')
  getAgents() {
    return { code: 0, data: this.agents };
  }

  @Post('admin/agents')
  saveAgent(@Body() body: any) {
    const item = { id: body.id || Date.now(), ...body };
    const index = this.agents.findIndex(i => i.id === item.id);
    if (index >= 0) this.agents[index] = item;
    else this.agents.unshift(item);
    return { code: 0, data: item, message: '保存成功' };
  }

  @Get('admin/api-errors')
  apiErrors(@Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return { code: 0, data: this.page([], Number(page), Number(pageSize)) };
  }

  @Post('admin/api-errors/:id/retry')
  retryApiError() {
    return { code: 0, data: null, message: '已重试' };
  }

  @Post('admin/api-errors/batch-resolve')
  batchResolveApiErrors() {
    return { code: 0, data: null, message: '已处理' };
  }

  @Put('admin/api-errors/:id')
  updateApiError() {
    return { code: 0, data: null, message: '已更新' };
  }

  @Get('admin/payment-failures')
  paymentFailures(@Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return { code: 0, data: this.page([], Number(page), Number(pageSize)) };
  }

  @Post('admin/payment-failures/:id/retry')
  retryPaymentFailure() {
    return { code: 0, data: null, message: '已重试' };
  }

  @Post('admin/payment-failures/batch-resolve')
  batchResolvePaymentFailures() {
    return { code: 0, data: null, message: '已处理' };
  }

  @Put('admin/payment-failures/:id')
  updatePaymentFailure() {
    return { code: 0, data: null, message: '已更新' };
  }

  @All('admin/:section')
  genericAdmin(@Param('section') section: string) {
    return { code: 0, data: { items: [], list: [], total: 0, section }, message: 'success' };
  }

  @Get('knowledge')
  getKnowledge(@Query('keyword') keyword = '', @Query('type') type = '') {
    let list = [...this.knowledgeDocs];
    if (keyword) {
      const kw = String(keyword).toLowerCase();
      list = list.filter(item => `${item.title || ''} ${item.content || ''}`.toLowerCase().includes(kw));
    }
    if (type) {
      list = list.filter(item => item.type === type);
    }
    return { code: 0, data: list, message: 'success' };
  }

  @Post('knowledge')
  createKnowledge(@Body() body: any) {
    const content = String(body.content || '');
    const item = {
      id: Date.now(),
      title: body.title || '未命名文档',
      content,
      type: body.type || '其他',
      tags: Array.isArray(body.tags) ? body.tags : [],
      chunks: Math.max(1, Math.ceil(content.length / 500)),
      status: 'indexed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.knowledgeDocs.unshift(item);
    return { code: 0, data: item, message: '上传成功' };
  }

  @All('knowledge/:id')
  removeKnowledge(@Param('id') id: string) {
    this.knowledgeDocs = this.knowledgeDocs.filter(item => String(item.id) !== String(id));
    return { code: 0, data: null, message: '删除成功' };
  }
}
