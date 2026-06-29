import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Backup - 备份管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('list')
  @ApiOperation({ summary: '获取备份列表' })
  async getBackupList() {
    const result = await this.backupService.getBackupList();
    return { code: 0, data: result };
  }

  @Post('create')
  @ApiOperation({ summary: '创建备份' })
  async createBackup(@Body() body?: { name?: string; remark?: string }) {
    const result = await this.backupService.createBackup(body?.name, body?.remark);
    return { code: 0, data: result };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: '恢复备份' })
  async restoreBackup(
    @Param('id', ParseIntPipe) id: number,
    @Body() body?: { remark?: string },
  ) {
    const result = await this.backupService.restoreBackup(id, body?.remark);
    return { code: 0, data: result };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除备份' })
  async deleteBackup(@Param('id', ParseIntPipe) id: number) {
    const result = await this.backupService.deleteBackup(id);
    return { code: 0, data: result };
  }
}
