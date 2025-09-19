import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { Document } from "./document.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IDocumentAllocation } from "../types/allocation.types";

@Entity("document_allocation")
export class DocumentAllocation implements IDocumentAllocation {
  @ApiProperty({ description: "ID único da alocação" })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "ID do documento" })
  @Column({ name: "document_id", type: "int", nullable: false })
  documentId: number;

  @ApiProperty({ description: "Filial associada" })
  @Column({ type: "varchar", length: 255, nullable: false })
  filial: string;

  @ApiProperty({ description: "Centro de custo" })
  @Column({
    name: "centro_custo",
    type: "varchar",
    length: 255,
    nullable: false,
  })
  centroCusto: string;

  @ApiProperty({ description: "Valor alocado" })
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  valor: number;

  @ApiProperty({
    description: "Percentual do documento alocado para este centro de custo",
  })
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: false })
  percentual: number;

  @ApiProperty({ description: "Data de criação do registro" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ApiProperty({ description: "Data da última atualização" })
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ApiPropertyOptional({ description: "Data de exclusão (soft delete)" })
  @DeleteDateColumn({ nullable: true, name: "deleted_at" })
  deletedAt?: Date;

  // Relacionamentos
  @ManyToOne(() => Document, (document) => document.allocations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "document_id" })
  document: Document;
}
