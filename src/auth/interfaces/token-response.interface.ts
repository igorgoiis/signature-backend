import { UserPublicProfile } from "src/user/interfaces";

/**
 * Interface que define o formato da resposta com tokens de autenticação
 */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user: UserPublicProfile;
}
