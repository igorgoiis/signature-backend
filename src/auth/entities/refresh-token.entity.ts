import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
} from "typeorm";
import { User } from "../../user/entities";

@Entity("refresh_tokens")
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Index()
  @Column({ name: "user_id" })
  userId: number;

  @Column({ name: "hashed_token" })
  hashedToken: string;

  @Column({ type: "timestamptz", name: "expires_at" })
  expiresAt: Date;

  @Column({ default: false, name: "is_revoked" })
  isRevoked: boolean;
}
