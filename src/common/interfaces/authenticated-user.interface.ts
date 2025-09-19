import { Sector } from "src/sector/entities";
import { UserRole } from "src/user/enums";

export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  sector: Sector | null;
}
