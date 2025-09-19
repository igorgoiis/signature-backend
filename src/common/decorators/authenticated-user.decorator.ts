// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { AuthenticatedUser as AuthenticatedUserInterface } from "src/common/interfaces/authenticated-user.interface";

// Interface para a requisição com usuário
export interface RequestWithUser extends Request {
  user: AuthenticatedUserInterface;
}

/**
 * Decorator para obter o usuário atual da requisição
 */
export const AuthenticatedUser = createParamDecorator(
  (propertyPath: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user) {
      return null;
    }

    // Usando type assertion para definir o tipo de retorno explicitamente
    if (propertyPath) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return request.user[propertyPath];
    }

    // Retorno explicitamente tipado
    return request.user;
  },
);
