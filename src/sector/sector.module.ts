// src/sector/sector.module.ts
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SectorService } from "./sector.service";
import { SectorController } from "./sector.controller";
import { Sector } from "./entities/sector.entity";
import { IsUniqueSectorNameConstraint } from "./validators";
import { AuditLogModule } from "src/audit-log/audit-log.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Sector]),
    forwardRef(() => AuditLogModule),
  ],
  providers: [SectorService, IsUniqueSectorNameConstraint],
  controllers: [SectorController],
  exports: [SectorService],
})
export class SectorModule {}
