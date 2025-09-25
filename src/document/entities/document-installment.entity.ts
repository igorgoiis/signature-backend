import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
} from "typeorm";
import { Document } from "./document.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IDocumentInstallment } from "../types/installment.types";
import { File } from "../../file/entities";

@Entity("document_installments")
export class DocumentInstallment implements IDocumentInstallment {
  @ApiProperty({ description: "ID único da parcela" })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "Número da parcela" })
  @Column({ type: "int", name: "installment_number" })
  installmentNumber: number;

  @ApiProperty({ description: "Valor da parcela" })
  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: "Data de vencimento da parcela" })
  @Column({ type: "date", name: "due_date" })
  dueDate: Date;

  @ApiPropertyOptional({ description: "Descrição adicional da parcela" })
  @Column({ type: "text", nullable: true })
  description: string | null;

  @ApiProperty({ description: "Indica se a parcela foi paga", default: false })
  @Column({ type: "boolean", default: false, name: "is_paid" })
  isPaid: boolean;

  @ApiPropertyOptional({ description: "Data em que a parcela foi paga" })
  @Column({ type: "date", nullable: true, name: "paid_date" })
  paidDate: Date | null;

  @ApiProperty({ description: "Data de criação do registro" })
  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;

  @ApiProperty({ description: "Data da última atualização" })
  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt: Date;

  @ApiPropertyOptional({ description: "Data de exclusão (soft delete)" })
  @DeleteDateColumn({ type: "timestamptz", nullable: true, name: "deleted_at" })
  deletedAt?: Date;

  @ApiProperty({ description: "ID do documento associado" })
  @Column({ name: "document_id" })
  documentId: number;

  @ApiProperty({ description: "ID do comprovante de pagamento" })
  @Column({ name: "file_id" })
  fileId: number;

  // Relacionamentos
  @ManyToOne(() => Document, (document) => document.installments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "document_id" })
  document: Document;

  @OneToOne(() => File, { cascade: true })
  @JoinColumn({ name: "file_id", referencedColumnName: "id" })
  proofPayment: File;
}
