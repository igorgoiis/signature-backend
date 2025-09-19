/**
 * Interface que define o formato do payload do JWT
 */
export interface JwtPayload {
  email: string;
  sub: number;
  role: string;
  name: string;
}
