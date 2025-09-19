import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";
import { AuditLog } from "../entities/audit-log.entity";

@Injectable()
export class AuditLogRepository extends Repository<AuditLog> {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super(AuditLog, dataSource.createEntityManager());
  }

  /**
   * Encontrar logs de auditoria para um usuário específico
   */
  async findByUser(userId: number): Promise<AuditLog[]> {
    return this.find({
      where: { user: { id: userId } },
      order: { timestamp: "DESC" },
      relations: ["user"],
    });
  }

  /**
   * Encontrar logs de um período específico
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return this.createQueryBuilder("log")
      .leftJoinAndSelect("log.user", "user")
      .where("log.timestamp BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .orderBy("log.timestamp", "DESC")
      .getMany();
  }

  /**
   * Encontrar logs por tipo de ação
   */
  async findByAction(action: string): Promise<AuditLog[]> {
    return this.find({
      where: { action },
      order: { timestamp: "DESC" },
      relations: ["user"],
    });
  }
}
