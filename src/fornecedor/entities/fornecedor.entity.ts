import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("fornecedores")
export class Fornecedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: string;

  @Column({ name: "cpf_cnpj", unique: true, length: 14 })
  cpfCnpj: string;

  @Column({ name: "razao_social" })
  razaoSocial: string;

  @Column({ name: "nome_fantasia", nullable: true })
  nomeFantasia: string;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamptz", name: "deleted_at" })
  deletedAt: Date | null;
}
