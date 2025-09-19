import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { Document } from "../document/entities/document.entity";
import { User } from "../user/entities";
import { AuditLog } from "../audit-log/entities/audit-log.entity";
import { DashboardStatsDto } from "./dto/dashboard-stats.dto";
import { RecentActivityDto, UserInfoDto } from "./dto/recent-activity.dto";
import { UserRole } from "../user/enums";
import { DocumentStatus } from "../document/types";
import {
  StatsFilter,
  StatsFilterOptions,
} from "./interfaces/stats-filter.interface";
import { ActivityFilter } from "./interfaces/activity-filter.interface";
import {
  DashboardTimeRange,
  ACTIVE_USERS_DAYS,
} from "./constants/dashboard.constants";
import { DashboardQueryDto } from "./dto/dashboard-query.dto";

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Get dashboard statistics based on user role and query parameters
   */
  async getStats(
    currentUser: User,
    queryDto?: DashboardQueryDto,
  ): Promise<DashboardStatsDto> {
    try {
      this.logger.log(
        `Getting dashboard stats for user ${currentUser.id} with role ${currentUser.role}`,
      );

      // Create filter based on user role and query params
      const filter = this.createStatsFilter(currentUser, queryDto);

      // Get date range for filtering
      const dateRange = this.getDateRangeFromQuery(queryDto);
      if (dateRange.startDate && dateRange.endDate) {
        filter.startDate = dateRange.startDate;
        filter.endDate = dateRange.endDate;
      }

      // Set options for filtering
      const options: StatsFilterOptions = {
        filterBySector:
          currentUser.role !== UserRole.ADMIN && !!currentUser.sector,
        filterByDateRange: !!(filter.startDate && filter.endDate),
      };

      // Get all required statistics in parallel
      const [totalDocuments, pendingDocuments, approvedDocuments, activeUsers] =
        await Promise.all([
          this.getDocumentCount(filter, options),
          this.getDocumentCount(
            { ...filter, status: DocumentStatus.PENDING },
            options,
          ),
          this.getDocumentCount(
            { ...filter, status: DocumentStatus.COMPLETED },
            options,
          ),
          this.getActiveUsersCount(filter, options),
        ]);

      return {
        totalDocuments,
        pendingDocuments,
        approvedDocuments,
        activeUsers,
      };
    } catch (error) {
      this.logger.error(
        `Error getting dashboard stats for user ${currentUser.id}: ${error.message}`,
      );

      throw new InternalServerErrorException(
        "Erro ao buscar estatísticas. Tente novamente mais tarde.",
      );
    }
  }

  /**
   * Get recent activity based on user role and query parameters
   */
  async getRecentActivity(
    currentUser: User,
    queryDto?: DashboardQueryDto,
  ): Promise<RecentActivityDto[]> {
    try {
      this.logger.log(
        `Getting recent activity for user ${currentUser.id} with role ${currentUser.role}`,
      );

      // Create filter for activities
      const filter: ActivityFilter = {
        limit: queryDto?.limit || 10,
        actions: queryDto?.actions,
      };

      // Add sector filter for non-admin users
      if (currentUser.role !== UserRole.ADMIN && currentUser.sector) {
        filter.sectorId = currentUser.sector.id;
      }

      // Add date range if specified
      const dateRange = this.getDateRangeFromQuery(queryDto);
      if (dateRange.startDate && dateRange.endDate) {
        filter.startDate = dateRange.startDate;
        filter.endDate = dateRange.endDate;
      }

      // Get activities
      const activities = await this.getActivities(filter);

      // Map to DTO
      return activities.map((activity) => this.mapToActivityDto(activity));
    } catch (error) {
      this.logger.error(
        `Error getting recent activity for user ${currentUser.id}: ${error.message}`,
      );

      throw new InternalServerErrorException(
        "Erro ao buscar atividades recentes. Tente novamente mais tarde.",
      );
    }
  }

  /**
   * Get document count based on filters
   */
  private async getDocumentCount(
    filter: StatsFilter,
    options: StatsFilterOptions,
  ): Promise<number> {
    let query = this.documentRepository.createQueryBuilder("document");

    // Apply sector filter if needed
    if (options.filterBySector && filter.sectorId) {
      query = query
        .innerJoin("document.owner", "owner")
        .innerJoin("owner.sector", "sector")
        .where("sector.id = :sectorId", { sectorId: filter.sectorId });
    }

    // Apply status filter if needed
    if (filter.status) {
      query = query.andWhere("document.status = :status", {
        status: filter.status,
      });
    }

    // Apply date filter if needed
    if (options.filterByDateRange && filter.startDate && filter.endDate) {
      query = query.andWhere(
        "document.createdAt BETWEEN :startDate AND :endDate",
        {
          startDate: filter.startDate,
          endDate: filter.endDate,
        },
      );
    }

    return query.getCount();
  }

  /**
   * Get active users count based on filters
   */
  private async getActiveUsersCount(
    filter: StatsFilter,
    options: StatsFilterOptions,
  ): Promise<number> {
    // Default activity period is 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - ACTIVE_USERS_DAYS);

    // Use custom date range if provided
    const startDate = filter.startDate || thirtyDaysAgo;
    const endDate = filter.endDate || new Date();

    let query = this.auditLogRepository
      .createQueryBuilder("audit")
      .select("DISTINCT(audit.user)")
      .where("audit.timestamp BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("audit.user IS NOT NULL");

    // Apply sector filter if needed
    if (options.filterBySector && filter.sectorId) {
      query = query
        .innerJoin("audit.user", "user")
        .innerJoin("user.sector", "sector")
        .andWhere("sector.id = :sectorId", { sectorId: filter.sectorId });
    }

    const activeUsersResult = await query.getRawMany();
    return activeUsersResult.length;
  }

  /**
   * Get activities based on filter
   */
  private async getActivities(filter: ActivityFilter): Promise<AuditLog[]> {
    let query = this.auditLogRepository
      .createQueryBuilder("audit")
      .leftJoinAndSelect("audit.user", "user")
      .orderBy("audit.timestamp", "DESC")
      .limit(filter.limit || 10);

    // Apply sector filter if needed
    if (filter.sectorId) {
      query = query
        .innerJoin("user.sector", "sector")
        .where("sector.id = :sectorId", { sectorId: filter.sectorId });
    }

    // Apply user filter if needed
    if (filter.userId) {
      query = query.andWhere("user.id = :userId", { userId: filter.userId });
    }

    // Apply entity filters if needed
    if (filter.entityType) {
      query = query.andWhere("audit.entityType = :entityType", {
        entityType: filter.entityType,
      });
    }

    if (filter.entityId) {
      query = query.andWhere("audit.entityId = :entityId", {
        entityId: filter.entityId,
      });
    }

    // Apply action filters if needed
    if (filter.actions && filter.actions.length > 0) {
      query = query.andWhere("audit.action IN (:...actions)", {
        actions: filter.actions,
      });
    }

    // Apply date range filter if needed
    if (filter.startDate && filter.endDate) {
      query = query.andWhere(
        "audit.timestamp BETWEEN :startDate AND :endDate",
        {
          startDate: filter.startDate,
          endDate: filter.endDate,
        },
      );
    }

    return query.getMany();
  }

  /**
   * Map AuditLog to RecentActivityDto
   */
  private mapToActivityDto(activity: AuditLog): RecentActivityDto {
    return {
      id: activity.id,
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      performedBy: activity.user ? this.mapToUserInfoDto(activity.user) : null,
      performedAt: activity.timestamp,
      details: activity.details,
    };
  }

  /**
   * Map User to UserInfoDto
   */
  private mapToUserInfoDto(user: User): UserInfoDto {
    return {
      name: user.name,
      email: user.email,
    };
  }

  /**
   * Create stats filter based on user and query parameters
   */
  private createStatsFilter(
    user: User,
    queryDto?: DashboardQueryDto,
  ): StatsFilter {
    const filter: StatsFilter = {};

    // Add sector filter for non-admin users
    if (user.role !== UserRole.ADMIN && user.sector) {
      filter.sectorId = user.sector.id;
    }

    return filter;
  }

  /**
   * Get date range from query DTO
   */
  private getDateRangeFromQuery(queryDto?: DashboardQueryDto): {
    startDate?: Date;
    endDate?: Date;
  } {
    if (!queryDto) {
      return {};
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate: Date | undefined;
    let endDate: Date | undefined = new Date(now.getTime() + 86400000); // Tomorrow

    switch (queryDto.timeRange) {
      case DashboardTimeRange.TODAY:
        startDate = today;
        break;

      case DashboardTimeRange.LAST_7_DAYS:
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;

      case DashboardTimeRange.LAST_30_DAYS:
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30);
        break;

      case DashboardTimeRange.THIS_MONTH:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;

      case DashboardTimeRange.LAST_MONTH:
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;

      case DashboardTimeRange.CUSTOM:
        if (queryDto.startDate) {
          startDate = new Date(queryDto.startDate);
        }
        if (queryDto.endDate) {
          endDate = new Date(queryDto.endDate);
          // Set to end of day
          endDate.setHours(23, 59, 59, 999);
        }
        break;
    }

    return { startDate, endDate };
  }
}
