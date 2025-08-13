import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) return false;

    // Extract token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');
    if (!token) return false;

    try {
      const payload = this.jwtService.verify(token);
      // Add user info to request for use in controllers
      request.user = payload;
      return true;
    } catch (e) {
      return false;
    }
  }
}
