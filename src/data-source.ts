import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { User } from "./user/entities";
import { Sector } from "./sector/entities/sector.entity";
import { Document } from "./document/entities/document.entity";
import { DocumentSignatory } from "./document/entities/document-signatory.entity";
import { DocumentAllocation } from "./document/entities/document-allocation.entity";
import { DocumentInstallment } from "./document/entities/document-installment.entity";
import { RefreshToken } from "./auth/entities/refresh-token.entity";
import { Signature } from "./signature/entities/signature.entity";
import { AuditLog } from "./audit-log/entities/audit-log.entity";
import { Fornecedor } from "./fornecedor/entities/fornecedor.entity";
import { File } from "./file/entities/file.entity";

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: configService.get<string>("DB_HOST", "144.126.136.132"),
  port: configService.get<number>("DB_PORT", 5432),
  username: configService.get<string>("DB_USERNAME", "postgres"),
  password: configService.get<string>("DB_PASSWORD", "dg!!#!((%$"),
  database: configService.get<string>("DB_DATABASE", "signature_db"),
  entities: [
    User,
    Sector,
    Document,
    DocumentSignatory,
    DocumentAllocation,
    DocumentInstallment,
    RefreshToken,
    Signature,
    AuditLog,
    Fornecedor,
    File,
  ],
  migrations: ["src/migrations/*.ts"],
  synchronize: true,
});
