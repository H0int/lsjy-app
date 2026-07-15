import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ComputingService } from './computing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('算力调度与虚拟数字员工')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('computing')
export class ComputingController {
  constructor(private readonly computingService: ComputingService) {}

  // ======================== 算力调度配置 ========================

  @Get('dispatch/config')
  @ApiOperation({ summary: '获取算力调度配置' })
  async getDispatchConfig(@CurrentUser('id') userId: number) {
    const data = await this.computingService.getDispatchConfig(userId);
    return { code: 0, message: 'ok', data };
  }

  @Put('dispatch/config')
  @ApiOperation({ summary: '更新算力调度配置' })
  async updateDispatchConfig(@CurrentUser('id') userId: number, @Body() body: any) {
    const data = await this.computingService.updateDispatchConfig(userId, body);
    return { code: 0, message: 'ok', data };
  }

  // ======================== 调度日志 ========================

  @Get('dispatch/logs')
  @ApiOperation({ summary: '获取调度日志' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getDispatchLogs(
    @CurrentUser('id') userId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const data = await this.computingService.getDispatchLogs(userId, +page, +pageSize);
    return { code: 0, message: 'ok', data };
  }

  // ======================== 调度统计 ========================

  @Get('dispatch/stats')
  @ApiOperation({ summary: '获取调度统计' })
  async getDispatchStats(@CurrentUser('id') userId: number) {
    const data = await this.computingService.getDispatchStats(userId);
    return { code: 0, message: 'ok', data };
  }

  // ======================== 手动切换模型 ========================

  @Post('dispatch/switch')
  @ApiOperation({ summary: '手动触发模型切换（测试用）' })
  async manualSwitch(@CurrentUser('id') userId: number, @Body() body: any) {
    const data = await this.computingService.manualSwitch(userId, body);
    return { code: 0, message: 'ok', data };
  }

  // ======================== 虚拟员工列表 ========================

  @Get('employees')
  @ApiOperation({ summary: '获取虚拟员工列表' })
  async getEmployees(@CurrentUser('id') userId: number) {
    const data = await this.computingService.getEmployees(userId);
    return { code: 0, message: 'ok', data };
  }

  // ======================== 创建虚拟员工 ========================

  @Post('employees')
  @ApiOperation({ summary: '创建虚拟员工' })
  async createEmployee(@CurrentUser('id') userId: number, @Body() body: any) {
    const data = await this.computingService.createEmployee(userId, body);
    return { code: 0, message: 'ok', data };
  }

  // ======================== 虚拟员工详情 ========================

  @Get('employees/:id')
  @ApiOperation({ summary: '获取虚拟员工详情' })
  async getEmployeeDetail(@CurrentUser('id') userId: number, @Param('id') id: number) {
    const data = await this.computingService.getEmployeeDetail(+id, userId);
    return { code: 0, message: 'ok', data };
  }

  // ======================== 更新虚拟员工 ========================

  @Put('employees/:id')
  @ApiOperation({ summary: '更新虚拟员工' })
  async updateEmployee(@CurrentUser('id') userId: number, @Param('id') id: number, @Body() body: any) {
    const data = await this.computingService.updateEmployee(+id, userId, body);
    return { code: 0, message: 'ok', data };
  }

  // ======================== 删除虚拟员工 ========================

  @Delete('employees/:id')
  @ApiOperation({ summary: '删除虚拟员工' })
  async deleteEmployee(@CurrentUser('id') userId: number, @Param('id') id: number) {
    const data = await this.computingService.deleteEmployee(+id, userId);
    return { code: 0, message: 'ok', data };
  }

  // ======================== 启动虚拟员工 ========================

  @Post('employees/:id/start')
  @ApiOperation({ summary: '启动虚拟员工' })
  async startEmployee(@CurrentUser('id') userId: number, @Param('id') id: number) {
    const data = await this.computingService.startEmployee(+id, userId);
    return { code: 0, message: 'ok', data };
  }

  // ======================== 停止虚拟员工 ========================

  @Post('employees/:id/stop')
  @ApiOperation({ summary: '停止虚拟员工' })
  async stopEmployee(@CurrentUser('id') userId: number, @Param('id') id: number) {
    const data = await this.computingService.stopEmployee(+id, userId);
    return { code: 0, message: 'ok', data };
  }

  // ======================== 增值套餐（用户端） ========================

  @Get('packages')
  @ApiOperation({ summary: '获取增值套餐列表' })
  async getPackages() {
    const data = await this.computingService.getPackages();
    return { code: 0, message: 'ok', data };
  }

  // ======================== 创建订单 ========================

  @Post('orders')
  @ApiOperation({ summary: '创建增值订单' })
  async createOrder(@CurrentUser('id') userId: number, @Body() body: any) {
    const data = await this.computingService.createOrder(userId, body);
    return { code: 0, message: 'ok', data };
  }

  // ======================== 获取订单列表 ========================

  @Get('orders')
  @ApiOperation({ summary: '获取订单列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getOrders(
    @CurrentUser('id') userId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const data = await this.computingService.getOrders(userId, +page, +pageSize);
    return { code: 0, message: 'ok', data };
  }

  // ======================== 一键导出 ========================

  @Post('export')
  @ApiOperation({ summary: '一键导出数据（创赛答辩稿、商业计划书、竞品分析）' })
  async generateExportData(@CurrentUser('id') userId: number, @Body() body: any) {
    const data = await this.computingService.generateExportData(userId, body?.employeeId);
    return { code: 0, message: 'ok', data };
  }

  // ====================== 管理后台API ======================

  // --- 套餐管理 ---
  @Get('admin/packages')
  @ApiOperation({ summary: '管理后台：获取全部套餐' })
  async adminGetPackages() {
    const data = await this.computingService.adminGetPackages();
    return { code: 0, message: 'ok', data };
  }

  @Post('admin/packages')
  @ApiOperation({ summary: '管理后台：创建套餐' })
  async adminCreatePackage(@Body() body: any) {
    const data = await this.computingService.adminCreatePackage(body);
    return { code: 0, message: '套餐已创建', data };
  }

  @Put('admin/packages/:id')
  @ApiOperation({ summary: '管理后台：更新套餐' })
  async adminUpdatePackage(@Param('id') id: number, @Body() body: any) {
    const data = await this.computingService.adminUpdatePackage(+id, body);
    return { code: 0, message: '套餐已更新', data };
  }

  @Delete('admin/packages/:id')
  @ApiOperation({ summary: '管理后台：删除套餐' })
  async adminDeletePackage(@Param('id') id: number) {
    await this.computingService.adminDeletePackage(+id);
    return { code: 0, message: '套餐已删除' };
  }

  // --- 订单管理 ---
  @Get('admin/orders')
  @ApiOperation({ summary: '管理后台：获取全部订单' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'status', required: false })
  async adminGetOrders(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('status') status?: string,
  ) {
    const data = await this.computingService.adminGetOrders(+page, +pageSize, status);
    return { code: 0, message: 'ok', data };
  }

  @Put('admin/orders/:id')
  @ApiOperation({ summary: '管理后台：更新订单状态' })
  async adminUpdateOrder(@Param('id') id: number, @Body() body: any) {
    const data = await this.computingService.adminUpdateOrder(+id, body);
    return { code: 0, message: '订单已更新', data };
  }

  // --- 虚拟员工管理（全平台） ---
  @Get('admin/employees')
  @ApiOperation({ summary: '管理后台：获取全部虚拟员工' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'industry', required: false })
  @ApiQuery({ name: 'status', required: false })
  async adminGetEmployees(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('industry') industry?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.computingService.adminGetEmployees(+page, +pageSize, industry, status);
    return { code: 0, message: 'ok', data };
  }

  // --- 调度日志（全平台） ---
  @Get('admin/logs')
  @ApiOperation({ summary: '管理后台：获取全部调度日志' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async adminGetLogs(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const data = await this.computingService.adminGetLogs(+page, +pageSize);
    return { code: 0, message: 'ok', data };
  }

  // --- 全局调度配置 ---
  @Get('admin/config')
  @ApiOperation({ summary: '管理后台：获取全局调度配置' })
  async adminGetConfig() {
    const data = await this.computingService.adminGetConfig();
    return { code: 0, message: 'ok', data };
  }

  @Put('admin/config')
  @ApiOperation({ summary: '管理后台：更新全局调度配置' })
  async adminUpdateConfig(@Body() body: any) {
    const data = await this.computingService.adminUpdateConfig(body);
    return { code: 0, message: '全局配置已保存', data };
  }

  @Post('admin/tools/pricing')
  @ApiOperation({ summary: '管理后台：批量更新工具价格' })
  async adminUpdateToolPricing(@Body() body: any) {
    const data = await this.computingService.adminUpdateToolPricing(body);
    return { code: 0, message: '工具价格已更新', data };
  }

  // ====================== AI员工接入与分享 ======================

  @Get('employee/:id/access')
  @ApiOperation({ summary: '获取AI员工全部接入方式（分享链接+各平台配置）' })
  async getEmployeeAccess(@Param('id') id: number, @CurrentUser('id') userId: number) {
    const data = await this.computingService.getEmployeeAccess(+id);
    return { code: 0, message: 'ok', data };
  }

  @Post('employee/:id/embed-code')
  @ApiOperation({ summary: '生成网页嵌入代码' })
  async generateEmbedCode(@Param('id') id: number, @Body() body: any, @CurrentUser('id') userId: number) {
    const code = this.computingService.generateEmbedCode(+id, body);
    return { code: 0, message: 'ok', data: { embedCode: code } };
  }

  // ---- 兼容旧接口 ----

  @Post('admin/employee/deploy')
  @ApiOperation({ summary: '一键部署AI员工到第三方平台（旧版兼容）' })
  async deployEmployeeToPlatform(@Body() body: { employeeId: number; platform: string }) {
    const data = await this.computingService.deployEmployeeIntegration(body.employeeId, body.platform);
    return { code: 0, message: '部署成功', data };
  }

  @Get('admin/employee/deploy/:employeeId')
  @ApiOperation({ summary: '获取AI员工部署配置（旧版兼容）' })
  async getEmployeeDeployments(@Param('employeeId') employeeId: number) {
    const data = await this.computingService.getEmployeeDeployments(+employeeId);
    return { code: 0, message: 'ok', data };
  }
}
