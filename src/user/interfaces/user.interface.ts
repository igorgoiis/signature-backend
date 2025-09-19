// src/user/interfaces/user.interface.ts
import { UserRole } from "../enums/user-role.enum";
import { Sector } from "../../sector/entities/sector.entity";

export interface UserPublicProfile {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  sector: Sector | null;
}
