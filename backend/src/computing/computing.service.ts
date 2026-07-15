import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ComputingDispatchConfig, VirtualEmployee, ComputingDispatchLog, ValueAddedPackage, ValueAddedOrder } from '../database/entities/computing-entity';

@Injectable()
export class ComputingService {
  constructor(
    @InjectRepository(ComputingDispatchConfig)
    private readonly dispatchConfigRepo: Repository<ComputingDispatchConfig>,
    @InjectRepository(VirtualEmployee)
    private readonly employeeRepo: Repository<VirtualEmployee>,
    @InjectRepository(ComputingDispatchLog)
    private readonly dispatchLogRepo: Repository<ComputingDispatchLog>,
    @InjectRepository(ValueAddedPackage)
    private readonly packageRepo: Repository<ValueAddedPackage>,
    @InjectRepository(ValueAddedOrder)
    private readonly orderRepo: Repository<ValueAddedOrder>,
    private readonly dataSource: DataSource,
  ) {}

  // ======================== 算力调度配置 ========================

  async getDispatchConfig(userId: number) {
    let config = await this.dispatchConfigRepo.findOne({ where: { userId } });
    if (!config) {
      config = this.dispatchConfigRepo.create({ userId });
      config = await this.dispatchConfigRepo.save(config);
    }
    return config;
  }

  async updateDispatchConfig(userId: number, data: Partial<ComputingDispatchConfig>) {
    let config = await this.dispatchConfigRepo.findOne({ where: { userId } });
    if (!config) {
      config = this.dispatchConfigRepo.create({ userId, ...data });
      return await this.dispatchConfigRepo.save(config);
    }
    Object.assign(config, data);
    return await this.dispatchConfigRepo.save(config);
  }

  // ======================== 调度日志 ========================

  async getDispatchLogs(userId: number, page = 1, pageSize = 20) {
    const [list, total] = await this.dispatchLogRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total, page, pageSize };
  }

  // ======================== 调度统计 ========================

  async getDispatchStats(userId: number) {
    const config = await this.getDispatchConfig(userId);

    // 各任务类型使用统计
    const logs = await this.dispatchLogRepo.find({ where: { userId } });

    const taskTypeStats: Record<string, number> = {};
    let totalTokensSaved = 0;

    for (const log of logs) {
      taskTypeStats[log.taskType] = (taskTypeStats[log.taskType] || 0) + 1;
      totalTokensSaved += log.tokensSaved;
    }

    // 模型使用占比
    const modelStats: Record<string, number> = {};
    for (const log of logs) {
      if (log.toModel) {
        modelStats[log.toModel] = (modelStats[log.toModel] || 0) + 1;
      }
      if (log.fromModel) {
        modelStats[log.fromModel] = (modelStats[log.fromModel] || 0) + 1;
      }
    }

    return {
      totalSaved: config.totalSaved,
      totalSwitched: config.totalSwitched,
      totalTokensSaved,
      taskTypeStats,
      modelStats,
    };
  }

  // ======================== 虚拟员工 ========================

  async createEmployee(userId: number, data: Partial<VirtualEmployee>) {
    const employee = this.employeeRepo.create({ userId, ...data });
    return await this.employeeRepo.save(employee);
  }

  async getEmployees(userId: number) {
    return await this.employeeRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getEmployeeDetail(id: number, userId: number) {
    const employee = await this.employeeRepo.findOne({ where: { id, userId } });
    if (!employee) {
      throw new NotFoundException('虚拟员工不存在');
    }
    return employee;
  }

  async updateEmployee(id: number, userId: number, data: Partial<VirtualEmployee>) {
    const employee = await this.employeeRepo.findOne({ where: { id, userId } });
    if (!employee) {
      throw new NotFoundException('虚拟员工不存在');
    }
    Object.assign(employee, data);
    return await this.employeeRepo.save(employee);
  }

  async deleteEmployee(id: number, userId: number) {
    const employee = await this.employeeRepo.findOne({ where: { id, userId } });
    if (!employee) {
      throw new NotFoundException('虚拟员工不存在');
    }
    await this.employeeRepo.remove(employee);
    return { deleted: true };
  }

  async startEmployee(id: number, userId: number) {
    const employee = await this.employeeRepo.findOne({ where: { id, userId } });
    if (!employee) {
      throw new NotFoundException('虚拟员工不存在');
    }
    employee.status = 'active';
    return await this.employeeRepo.save(employee);
  }

  async stopEmployee(id: number, userId: number) {
    const employee = await this.employeeRepo.findOne({ where: { id, userId } });
    if (!employee) {
      throw new NotFoundException('虚拟员工不存在');
    }
    employee.status = 'stopped';
    return await this.employeeRepo.save(employee);
  }

  // ======================== 增值套餐 ========================

  async getPackages() {
    return await this.packageRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  // ======================== 增值订单 ========================

  async createOrder(userId: number, data: { packageId: number; payMethod?: string }) {
    const pkg = await this.packageRepo.findOne({ where: { id: data.packageId } });
    if (!pkg) {
      throw new NotFoundException('套餐不存在');
    }

    const orderNo = 'VA' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();
    const order = this.orderRepo.create({
      orderNo,
      userId,
      packageId: pkg.id,
      packageName: pkg.name,
      amount: pkg.price,
      payMethod: data.payMethod || 'coin',
      status: 'pending',
    });

    return await this.orderRepo.save(order);
  }

  async getOrders(userId: number, page = 1, pageSize = 20) {
    const [list, total] = await this.orderRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total, page, pageSize };
  }

  // ======================== 手动切换模型（测试用） ========================

  async manualSwitch(userId: number, data: { taskType: string; fromModel: string; toModel: string; reason?: any }) {
    const tokensSaved = Math.floor(Math.random() * 500) + 50; // 模拟节省的Token数

    const log = this.dispatchLogRepo.create({
      userId,
      taskType: data.taskType,
      fromModel: data.fromModel,
      toModel: data.toModel,
      reason: data.reason || { manual: true },
      tokensSaved,
      status: 'success',
    });

    await this.dispatchLogRepo.save(log);

    // 更新配置统计
    const config = await this.getDispatchConfig(userId);
    config.totalSaved += tokensSaved;
    config.totalSwitched += 1;
    await this.dispatchConfigRepo.save(config);

    return {
      switched: true,
      fromModel: data.fromModel,
      toModel: data.toModel,
      tokensSaved,
    };
  }

  // ======================== 一键导出 ========================

  async generateExportData(userId: number, employeeId?: number) {
    let employee: VirtualEmployee | null = null;

    if (employeeId) {
      employee = await this.employeeRepo.findOne({ where: { id: employeeId, userId } });
      if (!employee) {
        throw new NotFoundException('虚拟员工不存在');
      }
    } else {
      // 如果没有指定员工ID，取第一个活跃员工
      employee = await this.employeeRepo.findOne({ where: { userId, status: 'active' } });
    }

    if (!employee) {
      throw new BadRequestException('没有可用的虚拟员工，请先创建或启动一个虚拟员工');
    }

    const exportData = {
      // 创赛答辩稿
      defenseDraft: {
        title: `${employee.industry}行业 - ${employee.name} - 创赛答辩稿`,
        generatedAt: new Date().toISOString(),
        sections: [
          {
            title: '项目概述',
            content: `基于${employee.industry}行业的虚拟数字员工"${employee.name}"，担任${employee.position}岗位，通过多智能体协同工作流实现自动化运营。`,
          },
          {
            title: '核心优势',
            content: `1. 行业定制化知识库\n2. 多智能体协同配置\n3. 自动化工作流\n4. 实时数据驱动决策`,
          },
          {
            title: '技术方案',
            content: `采用大语言模型+多智能体架构，结合${employee.industry}行业数据训练，实现${employee.position}岗位全流程自动化。`,
          },
          {
            title: '运营成果',
            content: `已完成${employee.tasksCompleted}项任务，累计工作${employee.hoursWorked}小时，持续稳定运行中。`,
          },
        ],
      },

      // 商业计划书
      businessPlan: {
        title: `${employee.name} - 商业计划书`,
        generatedAt: new Date().toISOString(),
        sections: [
          {
            title: '市场分析',
            content: `${employee.industry}行业数字化转型需求旺盛，虚拟员工可显著降低人力成本，提高运营效率。`,
          },
          {
            title: '产品方案',
            content: `定位${employee.position}岗位，提供7x24小时不间断服务，支持多渠道接入、知识库问答、自动化任务执行。`,
          },
          {
            title: '盈利模式',
            content: '会员订阅制 + 按量计费 + 行业定制化服务',
          },
          {
            title: '发展规划',
            content: '第一阶段：核心功能上线；第二阶段：行业深耕；第三阶段：生态扩展。',
          },
        ],
      },

      // 竞品分析
      competitorAnalysis: {
        title: `${employee.industry}行业虚拟员工竞品分析`,
        generatedAt: new Date().toISOString(),
        competitors: [
          { name: '传统人工客服', advantage: '灵活性强', disadvantage: '成本高、效率低' },
          { name: '规则型机器人', advantage: '响应快', disadvantage: '理解能力弱、无法处理复杂问题' },
          { name: '通用AI助手', advantage: '智能程度高', disadvantage: '缺乏行业专业知识' },
        ],
        ourAdvantage: `专为${employee.industry}行业${employee.position}岗位打造，兼具智能性与专业度。`,
      },
    };

    return exportData;
  }

  // ====================== 管理后台方法 ======================

  async adminGetPackages() {
    return await this.packageRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async adminCreatePackage(body: any) {
    const pkg = this.packageRepo.create({
      name: body.name,
      type: body.type || 'custom',
      description: body.description || body.name,
      price: Number(body.price) || 0,
      originalPrice: Number(body.originalPrice) || 0,
      features: body.features || [],
      duration: body.duration || 'year',
      isActive: body.isActive !== false,
      sortOrder: body.sortOrder || 99,
    });
    return await this.packageRepo.save(pkg);
  }

  async adminUpdatePackage(id: number, body: any) {
    const pkg = await this.packageRepo.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('套餐不存在');
    const allowed = ['name', 'description', 'price', 'originalPrice', 'features', 'duration', 'isActive', 'sortOrder'];
    const pkgAny = pkg as any;
    const bodyAny = body as any;
    for (const key of allowed) {
      if (bodyAny[key] !== undefined) {
        if (key === 'price' || key === 'originalPrice') pkgAny[key] = Number(bodyAny[key]);
        else if (key === 'sortOrder') pkgAny[key] = Number(bodyAny[key]);
        else if (key === 'isActive') pkgAny[key] = Boolean(bodyAny[key]);
        else pkgAny[key] = bodyAny[key];
      }
    }
    return await this.packageRepo.save(pkg);
  }

  async adminDeletePackage(id: number) {
    const pkg = await this.packageRepo.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('套餐不存在');
    await this.packageRepo.remove(pkg);
  }

  async adminGetOrders(page: number, pageSize: number, status?: string) {
    const where: any = {};
    if (status) where.status = status;
    const [items, total] = await this.orderRepo.findAndCount({
      where, order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize, take: pageSize,
    });
    return { items, total, page, pageSize };
  }

  async adminUpdateOrder(id: number, body: any) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('订单不存在');
    if (body.status === 'paid') { order.status = 'paid'; order.paidAt = new Date(); }
    else if (body.status) order.status = body.status;
    return await this.orderRepo.save(order);
  }

  async adminGetEmployees(page: number, pageSize: number, industry?: string, status?: string) {
    const where: any = {};
    if (industry) where.industry = industry;
    if (status) where.status = status;
    const [items, total] = await this.employeeRepo.findAndCount({
      where, order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize, take: pageSize,
    });
    return { items, total, page, pageSize };
  }

  async adminGetLogs(page: number, pageSize: number) {
    const [items, total] = await this.dispatchLogRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize, take: pageSize,
    });
    return { items, total, page, pageSize };
  }

  async adminGetConfig() {
    // 全局配置暂存内存，后续可迁移到数据库
    return { enabled: true, defaultStrategy: 'balanced' };
  }

  async adminUpdateConfig(body: any) {
    // 全局配置暂存内存，后续可迁移到数据库
    return { ...body, updatedAt: new Date().toISOString() };
  }

  async adminUpdateToolPricing(body: { coinCost?: number; setAllToPaid?: boolean }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      if (body.setAllToPaid && body.coinCost) {
        await queryRunner.query(
          'UPDATE ai_tools SET is_free = 0, coin_cost = ? WHERE is_free = 1',
          [body.coinCost],
        );
        const [result] = await queryRunner.query(
          'SELECT COUNT(*) as affected FROM ai_tools WHERE coin_cost = ? AND is_free = 0',
          [body.coinCost],
        );
        return { updated: result.affected, coinCost: body.coinCost };
      }
      await queryRunner.commitTransaction();
      return { message: 'no action taken' };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  // ====================== 一键部署第三方平台 ======================

  private deploymentStore = new Map<number, Map<string, any>>();

  async deployEmployeeIntegration(employeeId: number, platform: string): Promise<any> {
    const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('AI员工不存在');

    const token = this.generateToken(32);
    const baseUrl = 'https://api.lsjyapp.cn/api/v1';
    const webhookPaths: Record<string, string> = {
      wechat: '/webhook/wechat',
      wework: '/webhook/wework',
      dingtalk: '/webhook/dingtalk',
      webpage: '/webhook/chat',
    };
    const webhookPath = webhookPaths[platform] || '/webhook/chat';
    const webhookUrl = `${baseUrl}${webhookPath}/${employeeId}`;

    if (!this.deploymentStore.has(employeeId)) {
      this.deploymentStore.set(employeeId, new Map());
    }
    this.deploymentStore.get(employeeId)!.set(platform, {
      employeeId,
      employeeName: employee.name,
      industry: employee.industry,
      position: employee.position,
      platform,
      webhookUrl,
      token,
      deployedAt: new Date().toISOString(),
      status: 'active',
    });

    return {
      employeeId,
      employeeName: employee.name,
      platform,
      webhookUrl,
      token,
      qrCode: platform === 'webpage' ? `${baseUrl}/qrcode/chat/${employeeId}` : undefined,
      configGuide: this.getPlatformConfigGuide(platform, webhookUrl, token, employee.name, employeeId),
    };
  }

  async getEmployeeDeployments(employeeId: number): Promise<any[]> {
    const platforms = this.deploymentStore.get(employeeId);
    if (!platforms) return [];
    return Array.from(platforms.values());
  }

  private generateToken(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private getPlatformConfigGuide(platform: string, webhookUrl: string, token: string, employeeName: string, empId: number): string {
    const guides: Record<string, string> = {
      wechat: `1. 登录微信公众号后台 → 开发 → 基本配置\n2. 服务器配置 → 修改配置\n3. URL填写：${webhookUrl}\n4. Token填写：${token}\n5. 消息加解密方式选择「明文模式」\n6. 提交后点击「启用」\n\n✅ 配置完成后，粉丝给公众号发消息，${employeeName}将自动回复。`,
      wework: `1. 登录企业微信管理后台 → 应用管理 → 自建\n2. 创建应用 → 设置接收消息的URL\n3. URL填写：${webhookUrl}\n4. Token填写：${token}\n5. 设置企业可信IP为服务器IP\n6. 在企业微信群中添加该机器人\n\n✅ 配置完成后，群内@机器人，${employeeName}将自动响应。`,
      dingtalk: `1. 登录钉钉开放平台 → 应用开发 → 企业内部应用\n2. 创建应用 → 设置消息接收URL\n3. URL填写：${webhookUrl}\n4. 配置加解密密钥\n5. 发布应用 → 授权给组织\n\n✅ 配置完成后，在钉钉中@机器人，${employeeName}将自动回复。`,
      webpage: `1. 在HTML中添加以下代码嵌入对话窗口\n<script src="https://lsjyapp.cn/sdk/lsjy-chat.js"></script>\n<script>\n  LSJYChat.init({\n    employeeId: ${empId},\n    token: '${token}'\n  });\n</script>\n\n✅ 配置完成后，在任意网页中嵌入该对话窗口即可使用。`,
    };
    return guides[platform] || '配置说明已生成';
  }
}
