
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Fornecedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: string;

  @Column({ unique: true, length: 14 })
  cnpj: string;

  @Column()
  razaoSocial: string;

  @Column({ nullable: true })
  nomeFantasia: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
