import { Injectable } from "@nestjs/common";
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
} from "class-validator";
import { DataSource } from "typeorm";
import { Sector } from "../entities/sector.entity";

@ValidatorConstraint({ name: "isUniqueSectorName", async: true })
@Injectable()
export class IsUniqueSectorNameConstraint
  implements ValidatorConstraintInterface
{
  constructor(private dataSource: DataSource) {}

  async validate(name: string, args: ValidationArguments) {
    if (!name) return true; // Permitir valores vazios (outros validadores lidam com isso)

    const sectorRepository = this.dataSource.getRepository(Sector);

    // Verificar se estamos em um contexto de atualização (update)
    const currentSectorId = (args.object as any).currentSectorId;

    // Consulta base
    const queryBuilder = sectorRepository
      .createQueryBuilder("sector")
      .where("LOWER(sector.name) = LOWER(:name)", { name });

    // Se for uma atualização, excluir o setor atual
    if (currentSectorId) {
      queryBuilder.andWhere("sector.id != :id", { id: currentSectorId });
    }

    const count = await queryBuilder.getCount();
    return count === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return `O setor com nome '${args.value}' já existe.`;
  }
}

export function IsUniqueSectorName(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: "isUniqueSectorName",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueSectorNameConstraint,
    });
  };
}
