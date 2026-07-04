import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../database/entities/ticket.entity';
import { TicketReply } from '../database/entities/ticket-reply.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(TicketReply)
    private readonly replyRepo: Repository<TicketReply>,
  ) {}

  async findAll(page = 1, pageSize = 20, status?: string) {
    const qb = this.ticketRepo.createQueryBuilder('t');
    if (status) qb.andWhere('t.status = :status', { status });
    qb.orderBy('t.createdAt', 'DESC').skip((page - 1) * pageSize).take(pageSize);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('工单不存在');
    const replies = await this.replyRepo.find({
      where: { ticketId: id },
      order: { createdAt: 'ASC' },
    });
    return { ...ticket, replies };
  }

  async create(userId: number, data: Partial<Ticket>) {
    data.userId = userId;
    data.ticketNo = 'TK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    const item = this.ticketRepo.create(data);
    return this.ticketRepo.save(item);
  }

  async assign(id: number, assignedTo: number) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('工单不存在');
    ticket.assignedTo = assignedTo;
    ticket.status = 'assigned';
    return this.ticketRepo.save(ticket);
  }

  async reply(id: number, userId: number, content: string, isAdmin = false) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('工单不存在');
    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      throw new BadRequestException('工单已关闭，无法回复');
    }
    const reply = this.replyRepo.create({ ticketId: id, userId, content, isAdmin: isAdmin ? 1 : 0 });
    await this.replyRepo.save(reply);
    if (ticket.status === 'open') ticket.status = 'in_progress';
    await this.ticketRepo.save(ticket);
    return reply;
  }

  async resolve(id: number, userId: number) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('工单不存在');
    ticket.status = 'resolved';
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = userId;
    return this.ticketRepo.save(ticket);
  }
}
