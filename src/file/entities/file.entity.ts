import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Document, DocumentInstallment } from "../../document/entities";

@Entity("files")
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "Caminho do arquivo no storage" })
  @Column({ name: "file_path", length: 500 })
  filePath: string;

  @ApiProperty({ description: "Nome do arquivo original" })
  @Column({ name: "file_name", length: 255 })
  fileName: string;

  @ApiProperty({ description: "Tamanho do arquivo em bytes" })
  @Column({ name: "file_size", type: "bigint" })
  fileSize: number;

  @ApiProperty({ description: "Tipo MIME do arquivo" })
  @Column({ name: "mime_type", length: 100 })
  mimeType: string;

  @ApiProperty({
    description: "Hash SHA-256 do arquivo para verificar integridade",
  })
  @Column({ name: "file_hash", length: 64, unique: true })
  fileHash: string;

  // Adicionar campos de auditoria
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date;

  @OneToOne(() => Document, (document) => document.file)
  document: Document;

  @OneToOne(() => DocumentInstallment, (document) => document.proofPayment)
  documentInstallment: DocumentInstallment;
}
