import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get()
  getRoot() {
    return {
      name: '罗圣纪元 API',
      version: '2.0.0',
      status: 'running',
      description: '后端服务运行正常，所有接口完全开放',
      timestamp: new Date().toISOString(),
      endpoints: [
        '/api/v1/health - 健康检查',
        '/api/v1/auth/login - 登录',
        '/api/v1/auth/register - 注册', 
        '/api/v1/ai/tools/:id/chat - AI对话',
        '/api/v1/admin/dashboard - 管理后台',
        '/api/v1/users/me - 获取用户信息',
        '/api-docs - API文档(Swagger)',
      ],
      permission: 'full-access',
    };
  }
}
