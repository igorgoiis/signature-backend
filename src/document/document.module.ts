import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DocumentController } from "./document.controller";
import { DocumentService } from "./services/document.service";
import {
  Document,
  DocumentSignatory,
  DocumentAllocation,
  DocumentInstallment,
} from "./entities";
import { User } from "../user/entities";
import { Fornecedor } from "../fornecedor/entities/fornecedor.entity";
import { PdfValidationService } from "./services/pdf-validation.service";
import { NotificationModule } from "../notification/notification.module";
import { AuditLogModule } from "../audit-log/audit-log.module";
import { AuthModule } from "../auth/auth.module";
import { FileModule } from "src/file/file.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Document,
      DocumentSignatory,
      DocumentAllocation,
      DocumentInstallment,
      User,
      Fornecedor,
    ]),
    forwardRef(() => NotificationModule),
    forwardRef(() => AuditLogModule),
    AuthModule,
    FileModule,
  ],
  controllers: [DocumentController],
  providers: [DocumentService, PdfValidationService],
  exports: [DocumentService],
})
export class DocumentModule {}
