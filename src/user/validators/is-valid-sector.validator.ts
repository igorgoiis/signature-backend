// src/user/validators/is-valid-sector.validator.ts
import { Injectable } from "@nestjs/common";
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
} from "class-validator";
import { DataSource } from "typeorm";
import { Sector } from "../../sector/entities/sector.entity";

@ValidatorConstraint({ name: "isValidSector", async: true })
@Injectable()
export class IsValidSectorConstraint implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource) {}

  async validate(sectorId: number | null, args: ValidationArguments) {
    // Aceitar null explicitamente
    if (sectorId === null) return true;
    // Aceitar undefined para tornar o campo opcional
    if (sectorId === undefined) return true;

    if (!sectorId || typeof sectorId !== "number") return false;

    const sectorRepository = this.dataSource.getRepository(Sector);
    const sector = await sectorRepository.findOne({ where: { id: sectorId } });

    return !!sector;
  }

  defaultMessage(args: ValidationArguments) {
    return `O setor com ID '${args.value}' não existe.`;
  }
}

export function IsValidSector(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: "isValidSector",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidSectorConstraint,
    });
  };
}
