import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Document } from './document.entity';

@Entity("document_allocation")
export class DocumentAllocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false })
  documentId: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  filial: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  centroCusto: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  valor: number;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: false })
  percentual: number;

  @ManyToOne(() => Document, document => document.allocations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentId' })
  document: Document;
}


