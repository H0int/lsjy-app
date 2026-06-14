import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ChangePasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';
    const result = await this.authService.register(dto, ip);
    return { data: result };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';
    const result = await this.authService.login(dto, ip);
    return { data: result };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新Token' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(dto.refreshToken);
    return { data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户登出' })
  async logout() {
    // Token blacklist will be handled via Redis in production
    return { data: { message: '登出成功' } };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码' })
  async changePassword(
    @CurrentUser('id') userId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(userId, dto);
    return { data: { message: '密码修改成功' } };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@CurrentUser() user: any) {
    return { data: user };
  }
}
