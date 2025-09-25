import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
  DeleteDateColumn,
} from "typeorm";
import { Document } from "./document.entity";
import { User } from "../../user/entities";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IDocumentSignatory, SignatoryStatus } from "../types/signatory.types";

@Entity("document_signatories")
@Index(["documentId", "userId"], { unique: true })
@Index(["documentId", "order"])
export class DocumentSignatory implements IDocumentSignatory {
  @ApiProperty({ description: "ID único do signatário" })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "ID do documento" })
  @Column({ name: "document_id" })
  documentId: number;

  @ApiProperty({ description: "ID do usuário signatário" })
  @Column({ name: "user_id" })
  userId: number;

  @ApiProperty({
    description: "Ordem de assinatura (0 para paralelo, >0 para sequencial)",
    default: 0,
  })
  @Column({ type: "int", default: 0 })
  order: number;

  @ApiProperty({
    description: "Status da assinatura",
    enum: SignatoryStatus,
    enumName: "SignatoryStatus",
    default: SignatoryStatus.PENDING,
  })
  @Column({
    type: "enum",
    enum: SignatoryStatus,
    default: SignatoryStatus.PENDING,
  })
  status: SignatoryStatus;

  @ApiPropertyOptional({ description: "Data e hora da assinatura" })
  @Column({ type: "timestamptz", nullable: true, name: "signed_at" })
  signedAt: Date | null;

  @ApiPropertyOptional({ description: "Motivo da rejeição, se aplicável" })
  @Column({ type: "text", nullable: true, name: "rejection_reason" })
  rejectionReason: string | null;

  @ApiProperty({ description: "Data de criação do registro" })
  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;

  @ApiProperty({ description: "Data da última atualização" })
  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt: Date;

  @ApiPropertyOptional({ description: "Data de exclusão (soft delete)" })
  @DeleteDateColumn({ type: "timestamptz", nullable: true, name: "deleted_at" })
  deletedAt?: Date;

  // Relacionamentos
  @ManyToOne(() => Document, (document) => document.signatories, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "document_id" })
  document: Document;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;
}
