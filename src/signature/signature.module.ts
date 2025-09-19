import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Signature } from "./entities/signature.entity";
import { SignatureController } from "./signature.controller";
import { SignatureService } from "./signature.service";
import { DocumentModule } from "../document/document.module";
import { NotificationModule } from "../notification/notification.module";
import { AuditLogModule } from "../audit-log/audit-log.module";
import { UserModule } from "../user/user.module";
import { DocumentSignatory } from "../document/entities/document-signatory.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Signature, DocumentSignatory]),
    DocumentModule,
    NotificationModule,
    AuditLogModule,
    UserModule,
  ],
  controllers: [SignatureController],
  providers: [SignatureService],
  exports: [SignatureService],
})
export class SignatureModule {}
