// src/user/user.module.ts
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { User } from "./entities/user.entity";
import { SectorModule } from "../sector/sector.module";
import { IsUniqueEmailConstraint, IsValidSectorConstraint } from "./validators";
import { AuditLogModule } from "src/audit-log/audit-log.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    SectorModule,
    forwardRef(() => AuditLogModule),
  ],
  providers: [UserService, IsUniqueEmailConstraint, IsValidSectorConstraint],
  controllers: [UserController],
  exports: [UserService, IsUniqueEmailConstraint, IsValidSectorConstraint],
})
export class UserModule {}
