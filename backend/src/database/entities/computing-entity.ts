import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('computing_dispatch_configs')
export class ComputingDispatchConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  userId: number;

  @Column({ default: true })
  autoDispatch: boolean; // 是否开启自动算力调度

  @Column({ default: 'balanced' })
  strategy: string; // balanced=均衡, cost-saving=省钱优先, performance=性能优先

  @Column({ type: 'simple-json', nullable: true })
  modelPriority: string[]; // 模型优先级列表

  @Column({ type: 'simple-json', nullable: true })
  switchRules: any; // 切换规则配置

  @Column({ default: 0 })
  totalSaved: number; // 总共节省的Token数

  @Column({ default: 0 })
  totalSwitched: number; // 总共切换次数

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('virtual_employees')
export class VirtualEmployee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  industry: string; // 行业：电商、教育、宠物、校园创业、自媒体等

  @Column({ length: 100 })
  position: string; // 岗位：客服、运营、内容创作、开发等

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ type: 'simple-json', nullable: true })
  workflow: any; // 工作流配置 JSON

  @Column({ type: 'simple-json', nullable: true })
  knowledgeBase: any; // 企业专属知识库

  @Column({ default: 'active' })
  status: string; // active=运行中, paused=已暂停, stopped=已停止

  @Column({ default: 0 })
  tasksCompleted: number; // 已完成任务数

  @Column({ default: 0 })
  hoursWorked: number; // 工作时长（小时）

  @Column({ type: 'simple-json', nullable: true })
  agentConfig: any; // 多智能体协同配置

  @Column({ length: 50, nullable: true })
  membershipType: string; // 会员类型：free=免费, annual=年度会员

  @Column({ type: 'datetime', nullable: true })
  membershipExpiry: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('computing_dispatch_logs')
export class ComputingDispatchLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ length: 50 })
  taskType: string; // chat=对话, tool=工具, image=图片, video=视频

  @Column({ length: 100, nullable: true })
  fromModel: string;

  @Column({ length: 100, nullable: true })
  toModel: string;

  @Column({ type: 'simple-json', nullable: true })
  reason: any; // 切换原因

  @Column({ default: 0 })
  tokensSaved: number;

  @Column({ default: 'success' })
  status: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('value_added_packages')
export class ValueAddedPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  type: string; // employee_annual=虚拟员工年度会员, computing_pro=高阶算力调度, industry_agent=行业定制智能体, tech_consulting=创业赛事技术咨询

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  originalPrice: number;

  @Column({ type: 'simple-json', nullable: true })
  features: string[]; // 功能列表

  @Column({ length: 50, nullable: true })
  duration: string; // year=年, permanent=永久

  @Column({ default: 1 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'simple-json', nullable: true })
  config: any; // 额外配置

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('value_added_orders')
export class ValueAddedOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  orderNo: string;

  @Column()
  userId: number;

  @Column()
  packageId: number;

  @Column({ length: 100 })
  packageName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 50, default: 'coin' })
  payMethod: string; // coin=圣力, wechat=微信, alipay=支付宝

  @Column({ default: 'pending' })
  status: string; // pending=待支付, paid=已支付, cancelled=已取消, refunded=已退款

  @Column({ type: 'simple-json', nullable: true })
  extraData: any;

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
