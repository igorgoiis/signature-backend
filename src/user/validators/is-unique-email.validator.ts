import { Injectable } from "@nestjs/common";
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
} from "class-validator";
import { DataSource } from "typeorm";
import { User } from "../entities/user.entity";

@ValidatorConstraint({ name: "isUniqueEmail", async: true })
@Injectable()
export class IsUniqueEmailConstraint implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource) {}

  async validate(email: string, args: ValidationArguments) {
    if (!email) return true; // Permitir valores vazios (outros validadores lidam com isso)

    const userRepository = this.dataSource.getRepository(User);

    // Verificar se estamos em um contexto de atualização (update)
    const currentUserId = (args.object as any).currentUserId;

    // Consulta base
    const queryBuilder = userRepository
      .createQueryBuilder("user")
      .where("user.email = :email", { email });

    // Se for uma atualização, excluir o usuário atual
    if (currentUserId) {
      queryBuilder.andWhere("user.id != :id", { id: currentUserId });
    }

    const count = await queryBuilder.getCount();
    return count === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return `O email '${args.value}' já está em uso.`;
  }
}

export function IsUniqueEmail(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: "isUniqueEmail",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueEmailConstraint,
    });
  };
}
