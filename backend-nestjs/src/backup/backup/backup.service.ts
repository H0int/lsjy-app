import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackupRecord, BackupStatus } from '../entities/backup-record.entity';
import { DataSource } from 'typeorm';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly backupDir: string;
  private readonly dbConfig: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };

  constructor(
    @InjectRepository(BackupRecord)
    private readonly backupRecordRepository: Repository<BackupRecord>,
    private readonly dataSource: DataSource,
  ) {
    this.backupDir = process.env.BACKUP_DIR || '/opt/backup/mysql';
    
    // 从环境变量或配置获取数据库连接信息
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'lsjy',
    };

    // 确保备份目录存在
    this.ensureBackupDir();
  }

  private ensureBackupDir(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async getBackupList() {
    const records = await this.backupRecordRepository.find({
      order: { createdAt: 'DESC' },
    });
    return records;
  }

  async createBackup(name?: string, remark?: string): Promise<BackupRecord> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = name || `backup-${timestamp}`;
    const fileName = `${backupName}.sql`;
    const filePath = path.join(this.backupDir, fileName);

    // 创建备份记录
    const record = this.backupRecordRepository.create({
      name: backupName,
      status: BackupStatus.PENDING,
      remark,
    });
    await this.backupRecordRepository.save(record);

    try {
      // 执行 mysqldump
      const command = `mysqldump -h${this.dbConfig.host} -P${this.dbConfig.port} -u${this.dbConfig.username}${this.dbConfig.password ? ` -p${this.dbConfig.password}` : ''} ${this.dbConfig.database} > "${filePath}"`;

      await execAsync(command);

      // 获取文件大小
      const stats = fs.statSync(filePath);

      // 更新备份记录
      record.status = BackupStatus.COMPLETED;
      record.filePath = filePath;
      record.fileSize = stats.size;
      record.completedAt = new Date();
      await this.backupRecordRepository.save(record);

      return record;
    } catch (error) {
      // 更新备份记录为失败
      record.status = BackupStatus.FAILED;
      record.remark = `备份失败: ${error.message}`;
      await this.backupRecordRepository.save(record);
      throw error;
    }
  }

  async restoreBackup(id: number, remark?: string): Promise<BackupRecord> {
    const record = await this.backupRecordRepository.findOne({ where: { id } });

    if (!record) {
      throw new Error('备份记录不存在');
    }

    if (record.status !== BackupStatus.COMPLETED) {
      throw new Error('只能恢复已完成的备份');
    }

    if (!record.filePath || !fs.existsSync(record.filePath)) {
      throw new Error('备份文件不存在');
    }

    // 更新状态
    record.remark = remark || record.remark;
    await this.backupRecordRepository.save(record);

    try {
      // 执行恢复
      const command = `mysql -h${this.dbConfig.host} -P${this.dbConfig.port} -u${this.dbConfig.username}${this.dbConfig.password ? ` -p${this.dbConfig.password}` : ''} ${this.dbConfig.database} < "${record.filePath}"`;

      await execAsync(command);

      // 更新备份记录
      record.status = BackupStatus.RESTORED;
      await this.backupRecordRepository.save(record);

      return record;
    } catch (error) {
      throw new Error(`恢复失败: ${error.message}`);
    }
  }

  async deleteBackup(id: number): Promise<{ success: boolean }> {
    const record = await this.backupRecordRepository.findOne({ where: { id } });

    if (!record) {
      throw new Error('备份记录不存在');
    }

    // 删除物理文件
    if (record.filePath && fs.existsSync(record.filePath)) {
      fs.unlinkSync(record.filePath);
    }

    // 删除数据库记录
    await this.backupRecordRepository.remove(record);

    return { success: true };
  }
}
