import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());

  // CORS - 支持手机端和管理后台访问
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://lsjyapp.cn',
      'https://www.lsjyapp.cn',
      'https://h0int.github.io',
      'http://h0int.github.io',
      // 允许所有移动端浏览器（生产环境可配置白名单）
      /.*/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('罗圣纪元SaaS平台 API')
    .setDescription('罗圣纪元SaaS平台后端API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', '认证授权')
    .addTag('users', '用户管理')
    .addTag('roles', '角色权限')
    .addTag('ai', 'AI能力')
    .addTag('ai-tools', 'AI工具')
    .addTag('payment', '支付中心(圣力)')
    .addTag('announcements', '公告管理')
    .addTag('coupons', '优惠券管理')
    .addTag('campaigns', '活动管理')
    .addTag('tickets', '工单管理')
    .addTag('faqs', 'FAQ管理')
    .addTag('automation', '自动化规则')
    .addTag('moderation', '内容审核')
    .addTag('reports', '数据报表')
    .addTag('system', '系统管理')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);


  // 安全检查：JWT密钥
  const jwtSecret = configService.get<string>('JWT_SECRET');
  if (!jwtSecret || jwtSecret === 'default_secret_change_me') {
    console.warn('⚠️  WARNING: JWT_SECRET 未设置或使用默认值！生产环境请务必设置安全的 JWT_SECRET');
  }

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 Application running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/${apiPrefix}/docs`);
}
bootstrap();
