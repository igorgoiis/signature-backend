
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { Document } from './document.entity';
import { DocumentSignatory } from './document-signatory.entity';
import { DocumentAllocation } from './document-allocation.entity';
import { DocumentInstallment } from './document-installment.entity';
import { User } from '../user/user.entity';
import { Fornecedor } from '../fornecedor/fornecedor.entity';
import { MinioService } from './minio.service';
import { PdfValidationService } from './pdf-validation.service';
import { NotificationModule } from '../notification/notification.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentSignatory, DocumentAllocation, DocumentInstallment, User, Fornecedor]),
    forwardRef(() => NotificationModule),
    forwardRef(() => AuditLogModule),
    AuthModule,
  ],
  controllers: [DocumentController],
  providers: [DocumentService, MinioService, PdfValidationService],
  exports: [DocumentService],
})
export class DocumentModule {}
