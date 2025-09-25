import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from "typeorm";
import { Sector } from "../../sector/entities/sector.entity";
import * as bcrypt from "bcryptjs";
import { UserRole } from "../enums/user-role.enum";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ name: "sector_id", nullable: true })
  sectorId: number | null;

  @ManyToOne(() => Sector, (sector) => sector.id, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "sector_id" })
  sector: Sector | null;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamptz", name: "deleted_at" })
  deletedAt: Date;

  // @BeforeInsert()
  // async hashPasswordBeforeInsert() {
  //   if (this.password) {
  //     const saltRounds = 10;
  //     this.password = await bcrypt.hash(this.password, saltRounds);
  //   }
  // }

  // @BeforeUpdate()
  // async hashPasswordBeforeUpdate() {
  //   // Implementação removida - lógica de hash feita no service
  // }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password);
  }
}
