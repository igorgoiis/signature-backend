import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { UserRole } from "../../user/enums";
import { UserPublicProfile } from "src/user/interfaces"; // Adjust path as needed
import { AuthenticatedUser } from "src/common/interfaces/authenticated-user.interface";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the required roles from the @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required for this route, allow access
    if (!requiredRoles) {
      return true;
    }

    // Get the user object attached to the request by JwtAuthGuard
    // Assuming JwtAuthGuard attaches UserPublicProfile to request.user
    const { user } = context
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();

    // Check if the user object exists and has a role
    if (!user || !user.role) {
      return false; // Or throw ForbiddenException
    }

    // Check if the user's role is included in the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}
