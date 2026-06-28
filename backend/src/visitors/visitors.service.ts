import { Injectable, Logger } from '@nestjs/common';

interface VisitorRecord {
  id: number;
  ip: string;
  page: string;
  referer: string;
  userAgent: string;
  createdAt: Date;
}

@Injectable()
export class VisitorsService {
  private readonly logger = new Logger(VisitorsService.name);
  private visitors: VisitorRecord[] = [];
  private nextId = 1;

  async checkin(ip: string, page: string, referer: string, userAgent: string) {
    const record: VisitorRecord = {
      id: this.nextId++,
      ip,
      page,
      referer,
      userAgent,
      createdAt: new Date(),
    };
    this.visitors.push(record);
    // Keep only last 10000 records
    if (this.visitors.length > 10000) {
      this.visitors = this.visitors.slice(-10000);
    }
    this.logger.log(`Visitor checkin: ${ip} -> ${page}`);
    return { message: '签到成功' };
  }

  async getStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayVisitors = this.visitors.filter(v => v.createdAt >= today);
    const uniqueTodayIps = new Set(todayVisitors.map(v => v.ip));
    const uniqueAllIps = new Set(this.visitors.map(v => v.ip));

    const lastVisit = this.visitors.length > 0 
      ? this.visitors[this.visitors.length - 1].createdAt 
      : null;

    return {
      totalVisitors: uniqueAllIps.size,
      todayVisitors: uniqueTodayIps.size,
      todayVisits: todayVisitors.length,
      totalVisits: this.visitors.length,
      lastVisitTime: lastVisit ? lastVisit.toISOString() : null,
    };
  }

  async getList(page = 1, pageSize = 20) {
    const start = (page - 1) * pageSize;
    const items = this.visitors.slice(-start - pageSize, -start || undefined).reverse();
    return {
      items,
      total: this.visitors.length,
      page,
      pageSize,
    };
  }
}
