import { Injectable, Logger } from "@nestjs/common";
import { AuditLog } from "./entities/audit-log.entity";
import { LogActionParams } from "./interfaces/log-action-params.interface";
import { FindAuditLogsQueryDto } from "./dto/find-audit-logs.dto";
import { AuditLogRepository } from "./repositories/audit-log.repository";
import { RecentActivityActions } from "src/dashboard/constants/dashboard.constants";
import { AuditAction } from "./constants/audit-actions.constant";

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private auditLogRepository: AuditLogRepository) {}

  async createLogEntry(params: LogActionParams): Promise<void> {
    const { userId, action, entityType, entityId, details } = params;

    this.logger.log(
      `Logging action: User ${userId || "System"} performed ${action} on ${entityType} ${entityId}`,
    );

    try {
      const logEntry = this.auditLogRepository.create({
        user: userId ? { id: userId } : null,
        action,
        entityType,
        entityId,
        details: details || {},
      });

      await this.auditLogRepository.save(logEntry);
    } catch (error) {
      this.logger.error(
        `Failed to save audit log for action ${action} on ${entityType} ${entityId}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Logs an action performed in the system.
   */
  async logAction(
    userId: number | null,
    action: AuditAction,
    entityType: string,
    entityId: number,
    details?: Record<string, any>,
  ): Promise<void> {
    return this.createLogEntry({
      userId,
      action,
      entityType,
      entityId,
      details,
    });
  }

  /**
   * Logs an action with client info (IP, user agent)
   */
  async logActionWithClientInfo(
    params: LogActionParams,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    const details = params.details || {};
    details.ipAddress = ipAddress;
    details.userAgent = userAgent;

    return this.createLogEntry({
      ...params,
      details,
    });
  }

  /**
   * Finds audit logs based on query parameters.
   */
  async findLogs(queryDto: FindAuditLogsQueryDto): Promise<AuditLog[]> {
    const { userId, entityType, entityId, action, take, skip } = queryDto;

    this.logger.log(
      `Finding audit logs with filters: ${JSON.stringify(queryDto)}`,
    );

    const options: any = {
      where: {},
      take,
      skip,
      order: { timestamp: "DESC" },
      relations: ["user"],
    };

    if (userId !== undefined) {
      options.where = { ...options.where, user: { id: userId } };
    }
    if (entityType) {
      options.where = { ...options.where, entityType };
    }
    if (entityId !== undefined) {
      options.where = { ...options.where, entityId };
    }
    if (action) {
      options.where = { ...options.where, action };
    }

    return this.auditLogRepository.find(options);
  }

  /**
   * Finds audit logs related to a specific entity.
   */
  async findLogsByEntity(
    entityType: string,
    entityId: number,
  ): Promise<AuditLog[]> {
    this.logger.log(`Finding logs for ${entityType} with ID ${entityId}`);

    return this.auditLogRepository.find({
      where: { entityType, entityId },
      relations: ["user"],
      order: { timestamp: "DESC" },
    });
  }

  /**
   * Finds logs from a specific date range
   */
  async findLogsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.findByDateRange(startDate, endDate);
  }
}
