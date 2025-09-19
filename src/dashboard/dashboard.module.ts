import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { Document } from "../document/entities/document.entity";
import { User } from "../user/entities";
import { AuditLog } from "../audit-log/entities/audit-log.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Document, User, AuditLog])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
