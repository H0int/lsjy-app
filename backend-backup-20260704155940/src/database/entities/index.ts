// Base
export { BaseEntity, SoftDeleteEntity } from './base.entity';

// User Center
export { User } from './user.entity';
export { Role } from './role.entity';
export { Permission } from './permission.entity';
export { UserRole } from './user-role.entity';
export { LoginLog } from './login-log.entity';

// AI Tools
export { ToolCategory } from './tool-category.entity';
export { AiTool } from './ai-tool.entity';
export { AiCallRecord } from './ai-call-record.entity';
export { AiUserDailyQuota } from './ai-user-daily-quota.entity';
export { AiProvider } from '../../ai/entities/ai-provider.entity';

// Payment (Sacred Points)
export { CoinAccount } from './coin-account.entity';
export { CoinRechargePackage } from './coin-recharge-package.entity';
export { CoinTransaction } from './coin-transaction.entity';
export { PaymentTransaction } from './payment-transaction.entity';

// E-commerce
export { Shop } from './shop.entity';
export { ProductCategory } from './product-category.entity';
export { Product } from './product.entity';
export { ProductSku } from './product-sku.entity';
export { Order } from './order.entity';
export { OrderItem } from './order-item.entity';
export { ShippingRecord } from './shipping-record.entity';

// Education
export { Course } from './course.entity';
export { CourseChapter } from './course-chapter.entity';
export { CourseLesson } from './course-lesson.entity';
export { Question } from './question.entity';
export { LearningRecord } from './learning-record.entity';
export { CourseEnrollment } from './course-enrollment.entity';

// Pet
export { Pet } from './pet.entity';
export { PetHealthRecord } from './pet-health-record.entity';
export { PetVaccination } from './pet-vaccination.entity';

// Campus
export { Campus } from './campus.entity';
export { CampusUser } from './campus-user.entity';
export { Club } from './club.entity';
export { SecondhandItem } from './secondhand-item.entity';

// System
export { SystemConfig } from './system-config.entity';
export { OperationLog } from './operation-log.entity';
export { Notification } from './notification.entity';
