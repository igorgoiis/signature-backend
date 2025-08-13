import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secretKey',
    });
  }

  async validate(payload: any) {
    // O 'sub' no payload do JWT geralmente contém o ID do usuário
    // O 'email' e 'role' também estão presentes no payload do seu token
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}


