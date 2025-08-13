
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Fornecedor } from '../fornecedor/fornecedor.entity';
import { DocumentInstallment } from './document-installment.entity';
import { DocumentSignatory } from './document-signatory.entity';
import { DocumentAllocation } from './document-allocation.entity';

export enum DocumentType {
  CONTRACT = 'CONTRACT',
  INVOICE = 'INVOICE',
  FATURA = 'FATURA',
  SERVICE_ORDER = 'SERVICE_ORDER',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  AGREEMENT = 'AGREEMENT',
  PROPOSAL = 'PROPOSAL',
  REPORT = 'REPORT',
  OTHER = 'OTHER'
}


export enum DocumentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ length: 500 })
  filePath: string;

  @Column({ length: 255 })
  fileName: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ length: 100 })
  mimeType: string;

  @Column({ length: 64, unique: true })
  fileHash: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER
  })
  tipoDocumento: DocumentType;

  @Column({ length: 255, nullable: false })
  natureza: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING
  })
  status: DocumentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valor: number | null;

  @Column({ type: 'date', nullable: true })
  dataVencimento: Date | null;

  @Column({ type: 'text', nullable: true })
  observacoes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  ownerId: number | null;

  @Column({ nullable: true })
  fornecedorId: number | null;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ManyToOne(() => Fornecedor, { nullable: true, eager: false })
  fornecedor: Fornecedor | null;

  @OneToMany(() => DocumentInstallment, installment => installment.document, { cascade: true })
  installments: DocumentInstallment[];

  @OneToMany(() => DocumentSignatory, signatory => signatory.document, { cascade: true })
  signatories: DocumentSignatory[];

  @OneToMany(() => DocumentAllocation, allocation => allocation.document, { cascade: true })
  allocations: DocumentAllocation[];
}


