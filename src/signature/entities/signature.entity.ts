import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from "typeorm";
import { Document } from "../../document/entities/document.entity";
import { User } from "../../user/entities";

@Entity("signatures")
@Index(["document", "user"])
export class Signature {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Document, { nullable: false, onDelete: "CASCADE" })
  document: Document;

  @ManyToOne(() => User, { nullable: false, eager: false })
  user: User;

  @Column({ name: "signature_data", type: "text" })
  signatureData: string;

  @Column({ name: "position_data", type: "jsonb", nullable: true })
  positionData: { page: number; x: number; y: number } | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date;
}
