import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
  OneToOne,
} from "typeorm";
import { User } from "../../user/entities";
import { Fornecedor } from "../../fornecedor/entities/fornecedor.entity";
import { DocumentInstallment } from "./document-installment.entity";
import { DocumentSignatory } from "./document-signatory.entity";
import { DocumentAllocation } from "./document-allocation.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  DocumentNature,
  DocumentStatus,
  DocumentType,
  IDocument,
} from "../types/document.types";
import { File } from "../../file/entities/file.entity";

@Entity("documents")
export class Document implements IDocument {
  @ApiProperty({ description: "ID único do documento" })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "Título do documento" })
  @Column({ length: 255 })
  title: string;

  @ApiPropertyOptional({ description: "Descrição detalhada do documento" })
  @Column({ type: "text", nullable: true })
  description: string | null;

  @ApiProperty({
    description: "Tipo de documento",
    enum: DocumentType,
    enumName: "DocumentType",
  })
  @Column({
    name: "tipo_documento",
    type: "enum",
    enum: DocumentType,
    default: DocumentType.GENERAL,
  })
  tipoDocumento: DocumentType;

  @ApiProperty({
    description: "Natureza do documento",
    enum: DocumentNature,
    enumName: "DocumentNature",
  })
  @Column({
    type: "enum",
    enum: DocumentNature,
    default: DocumentNature.OTHER_REVENUES,
    nullable: false,
  })
  natureza: DocumentNature;

  @ApiProperty({
    description: "Status atual do documento",
    enum: DocumentStatus,
    enumName: "DocumentStatus",
  })
  @Column({
    type: "enum",
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @ApiPropertyOptional({ description: "Valor do documento" })
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  valor: number | null;

  @ApiPropertyOptional({ description: "Data de vencimento do documento" })
  @Column({ name: "data_vencimento", type: "date", nullable: true })
  dataVencimento: Date | null;

  @ApiPropertyOptional({ description: "Observações adicionais" })
  @Column({ type: "text", nullable: true })
  observacoes: string | null;

  @ApiProperty({ description: "Data de criação do registro" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ApiProperty({ description: "Data da última atualização" })
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ApiPropertyOptional({ description: "Data de exclusão (soft delete)" })
  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt?: Date;

  @ApiPropertyOptional({ description: "ID do proprietário do documento" })
  @Column({ name: "owner_id", nullable: true })
  ownerId: number | null;

  @ApiPropertyOptional({
    description: "ID do fornecedor relacionado ao documento",
  })
  @Column({ name: "fornecedor_id", nullable: true })
  fornecedorId: number | null;

  @Column({ name: "file_id", type: "int", nullable: true })
  fileId: number;

  // Relacionamentos
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "owner_id" })
  owner: User;

  @ManyToOne(() => Fornecedor, { nullable: true })
  @JoinColumn({ name: "fornecedor_id" })
  fornecedor: Fornecedor | null;

  @OneToMany(() => DocumentInstallment, (installment) => installment.document, {
    cascade: true,
  })
  installments: DocumentInstallment[];

  @OneToMany(() => DocumentSignatory, (signatory) => signatory.document, {
    cascade: true,
  })
  signatories: DocumentSignatory[];

  @OneToMany(() => DocumentAllocation, (allocation) => allocation.document, {
    cascade: true,
  })
  allocations: DocumentAllocation[];

  @OneToOne(() => File, { cascade: true })
  @JoinColumn({ name: "file_id", referencedColumnName: "id" })
  file: File;
}
