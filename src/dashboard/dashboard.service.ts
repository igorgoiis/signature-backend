
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus } from '../document/document.entity';
import { User, UserRole } from '../user/user.entity';
import { AuditLog } from '../audit-log/audit-log.entity';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { RecentActivityDto } from './dto/recent-activity.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async getStats(currentUser: User): Promise<DashboardStatsDto> {
    // Base query builder for documents
    let documentsQuery = this.documentRepository.createQueryBuilder('document');
    
    // If user is not admin, filter by sector
    if (currentUser.role !== UserRole.ADMIN && currentUser.sector) {
      documentsQuery = documentsQuery
        .innerJoin('document.owner', 'owner')
        .innerJoin('owner.sector', 'sector')
        .where('sector.id = :sectorId', { sectorId: currentUser.sector.id });
    }

    // Get total documents count
    const totalDocuments = await documentsQuery.getCount();

    // Get pending documents count
    const pendingDocuments = await documentsQuery
      .clone()
      .andWhere('document.status = :status', { status: DocumentStatus.PENDING })
      .getCount();

    // Get approved/completed documents count
    const approvedDocuments = await documentsQuery
      .clone()
      .andWhere('document.status = :status', { status: DocumentStatus.COMPLETED })
      .getCount();

    // Get active users count (logged in last 30 days)
    // We'll use audit logs to determine activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let activeUsersQuery = this.auditLogRepository
      .createQueryBuilder('audit')
      .select('DISTINCT audit.user.id')
      .where('audit.timestamp >= :thirtyDaysAgo', { thirtyDaysAgo })
      .andWhere('audit.user IS NOT NULL');

    // If user is not admin, filter by sector
    if (currentUser.role !== UserRole.ADMIN && currentUser.sector) {
      activeUsersQuery = activeUsersQuery
        .innerJoin('audit.user', 'user')
        .innerJoin('user.sector', 'sector')
        .andWhere('sector.id = :sectorId', { sectorId: currentUser.sector.id });
    }

    const activeUsersResult = await activeUsersQuery.getRawMany();
    const activeUsers = activeUsersResult.length;

    return {
      totalDocuments,
      pendingDocuments,
      approvedDocuments,
      activeUsers,
    };
  }

  async getRecentActivity(currentUser: User): Promise<RecentActivityDto[]> {
    let query = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.timestamp', 'DESC')
      .limit(10);

    // If user is not admin, filter by sector
    if (currentUser.role !== UserRole.ADMIN && currentUser.sector) {
      query = query
        .innerJoin('user.sector', 'sector')
        .where('sector.id = :sectorId', { sectorId: currentUser.sector.id });
    }

    const activities = await query.getMany();

    return activities.map(activity => ({
      id: activity.id,
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      performedBy: activity.user ? {
        name: activity.user.name,
        email: activity.user.email,
      } : null,
      performedAt: activity.timestamp,
      details: activity.details,
    }));
  }
}
