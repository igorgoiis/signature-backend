import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from "typeorm";
import { User } from "../../user/entities";
import { Exclude, Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { AuditAction } from "../constants/audit-actions.constant";

@Entity("audit_logs")
@Index(["entityType", "entityId"])
@Index(["user"])
@Index(["action"])
@Index(["timestamp"])
export class AuditLog {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: "ID único do log de auditoria", example: 1 })
  id: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  @ApiProperty({
    description: "Data e hora da ação",
    example: "2023-08-17T03:01:00.000Z",
  })
  timestamp: Date;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: "user_id" })
  @Transform(
    ({ value }) =>
      value
        ? {
            id: value.id,
            name: value.name,
            email: value.email,
          }
        : null,
    { toPlainOnly: true },
  )
  @ApiProperty({
    description:
      "Usuário que realizou a ação (pode ser nulo para ações do sistema)",
    type: () => Object,
    example: {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
    },
    nullable: true,
  })
  user: User | null;

  @Column({ type: "varchar", length: 100 })
  @ApiProperty({
    description: "Tipo de ação realizada",
    example: "CREATE_DOCUMENT",
    enum: AuditAction,
  })
  action: string;

  @Column({ type: "varchar", length: 100, nullable: true, name: "entity_type" })
  @ApiProperty({
    description: "Tipo da entidade afetada",
    example: "Document",
    nullable: true,
  })
  entityType: string | null;

  @Column({ type: "int", nullable: true, name: "entity_id" })
  @ApiProperty({
    description: "ID da entidade afetada",
    example: 123,
    nullable: true,
  })
  entityId: number | null;

  @Column({ type: "jsonb", nullable: true })
  @ApiProperty({
    description: "Detalhes adicionais sobre a ação",
    example: {
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
      changes: {
        oldValue: "Draft",
        newValue: "Published",
      },
    },
    nullable: true,
  })
  details: Record<string, any> | null;

  // Métodos auxiliares para manipulação de dados

  /**
   * Adiciona um campo aos detalhes do log
   */
  addDetail(key: string, value: any): void {
    if (!this.details) {
      this.details = {};
    }
    this.details[key] = value;
  }

  /**
   * Define informações sobre o dispositivo/cliente que realizou a ação
   */
  setClientInfo(ipAddress: string, userAgent: string): void {
    this.addDetail("ipAddress", ipAddress);
    this.addDetail("userAgent", userAgent);
  }

  /**
   * Define informações sobre alterações em campos
   */
  setChanges(
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
  ): void {
    const changes: Record<string, { oldValue: any; newValue: any }> = {};

    // Identificar campos alterados
    Object.keys(newValues).forEach((key) => {
      if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
        changes[key] = {
          oldValue: oldValues[key],
          newValue: newValues[key],
        };
      }
    });

    this.addDetail("changes", changes);
  }
}
