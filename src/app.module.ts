import { Module, ValidationPipe } from "@nestjs/common"; // Import ValidationPipe
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD, APP_PIPE } from "@nestjs/core"; // Import APP_GUARD and APP_PIPE
import { AuthModule } from "./auth/auth.module";
import { DocumentModule } from "./document/document.module";
import { NotificationModule } from "./notification/notification.module";
import { User } from "./user/entities";
import { UserModule } from "./user/user.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SectorModule } from "./sector/sector.module";
import { Sector } from "./sector/entities/sector.entity";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard"; // Import JwtAuthGuard
import { Document } from "./document/entities/document.entity"; // Import Document entity
import { DocumentSignatory } from "./document/entities/document-signatory.entity"; // Import DocumentSignatory entity
import { DocumentAllocation } from "./document/entities/document-allocation.entity"; // Import DocumentAllocation entity
import { DocumentInstallment } from "./document/entities/document-installment.entity"; // Import DocumentInstallment entity
import { RefreshToken } from "./auth/entities/refresh-token.entity"; // Import RefreshToken entity
import { SignatureModule } from "./signature/signature.module"; // Import SignatureModule
import { Signature } from "./signature/entities/signature.entity"; // Import Signature entity
import { AuditLogModule } from "./audit-log/audit-log.module"; // Import AuditLogModule
import { AuditLog } from "./audit-log/entities/audit-log.entity"; // Import AuditLog entity
import { DashboardModule } from "./dashboard/dashboard.module"; // Import DashboardModule
import { FornecedorModule } from "./fornecedor/fornecedor.module"; // Import FornecedorModule
import { Fornecedor } from "./fornecedor/entities/fornecedor.entity"; // Import Fornecedor entity
import { FileModule } from "./file/file.module";
import { File } from "./file/entities";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get<string>("DATABASE_URL"),
        entities: [
          User,
          Sector,
          Document,
          File,
          DocumentSignatory, // Add DocumentSignatory entity
          DocumentAllocation, // Add DocumentAllocation entity
          DocumentInstallment, // Add DocumentInstallment entity
          RefreshToken,
          Signature, // Add Signature entity
          AuditLog, // Add AuditLog entity
          Fornecedor, // Add Fornecedor entity
        ],
        migrations: ["dist/migrations/*.js"],
        migrationsRun: true,
        synchronize: false, // Disable synchronize for production
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    DocumentModule,
    SignatureModule, // Add SignatureModule
    SectorModule,
    NotificationModule,
    AuditLogModule, // Add AuditLogModule
    DashboardModule, // Add DashboardModule
    FornecedorModule, // Add FornecedorModule
    FileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply JwtAuthGuard globally to all routes
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Apply ValidationPipe globally to validate DTOs
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // Strip properties not defined in DTO
        forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
        transform: true, // Automatically transform payloads to DTO instances
      }),
    },
  ],
})
export class AppModule {}
