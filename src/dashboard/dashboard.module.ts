
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Document } from '../document/document.entity';
import { User } from '../user/user.entity';
import { AuditLog } from '../audit-log/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, User, AuditLog]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
