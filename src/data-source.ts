import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './user/user.entity';
import { Sector } from './sector/sector.entity';
import { Document } from './document/document.entity';
import { DocumentSignatory } from './document/document-signatory.entity';
import { DocumentAllocation } from './document/document-allocation.entity';
import { DocumentInstallment } from './document/document-installment.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { Signature } from './signature/signature.entity';
import { AuditLog } from './audit-log/audit-log.entity';
import { Fornecedor } from './fornecedor/fornecedor.entity';

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', '144.126.136.132'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', 'dg!!#!((%$'),
  database: configService.get<string>('DB_DATABASE', 'signature_db'),
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
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: true,
});
