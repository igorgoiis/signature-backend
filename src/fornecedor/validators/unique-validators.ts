import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Fornecedor } from "../entities";

@Injectable()
@ValidatorConstraint({ async: true })
export class IsCodigoUniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(Fornecedor)
    private fornecedorRepository: Repository<Fornecedor>,
  ) {}

  async validate(codigo: string, args: ValidationArguments) {
    const fornecedor = await this.fornecedorRepository.findOne({
      where: { codigo },
    });
    return !fornecedor;
  }

  defaultMessage(args: ValidationArguments) {
    return `O código "${args.value}" já está em uso por outro fornecedor.`;
  }
}

export function IsCodigoUnique(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isCodigoUnique",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCodigoUniqueConstraint,
    });
  };
}

@Injectable()
@ValidatorConstraint({ async: true })
export class IsCpfCnpjUniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(Fornecedor)
    private fornecedorRepository: Repository<Fornecedor>,
  ) {}

  async validate(cpfCnpj: string, args: ValidationArguments) {
    const fornecedor = await this.fornecedorRepository.findOne({
      where: { cpfCnpj },
    });
    return !fornecedor;
  }

  defaultMessage(args: ValidationArguments) {
    return `O CPF/CNPJ "${args.value}" já está em uso por outro fornecedor.`;
  }
}

export function IsCpfCnpjUnique(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isCpfCnpjUnique",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCpfCnpjUniqueConstraint,
    });
  };
}

@ValidatorConstraint({ name: "isCpfCnpjValid", async: false })
export class IsCpfCnpjValid implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    if (!value) return false;

    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, "");

    if (numericValue.length === 11) {
      return this.validateCpf(numericValue);
    } else if (numericValue.length === 14) {
      return this.validateCnpj(numericValue);
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return "O CPF ou CNPJ informado não é válido.";
  }

  // Função para validar CPF
  private validateCpf(cpf: string): boolean {
    // Verifica se todos os dígitos são iguais (ex: 11111111111)
    if (/^(\d)\1+$/.test(cpf)) return false;

    // Calculando o primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let mod = sum % 11;
    const digit1 = mod < 2 ? 0 : 11 - mod;

    // Calculando o segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    mod = sum % 11;
    const digit2 = mod < 2 ? 0 : 11 - mod;

    // Verifica se os dígitos verificadores estão corretos
    return (
      parseInt(cpf.charAt(9)) === digit1 && parseInt(cpf.charAt(10)) === digit2
    );
  }

  // Função para validar CNPJ
  private validateCnpj(cnpj: string): boolean {
    // Verifica se todos os dígitos são iguais (ex: 11111111111111)
    if (/^(\d)\1+$/.test(cnpj)) return false;

    // Calculando o primeiro dígito verificador
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    // Calculando o segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    return resultado === parseInt(digitos.charAt(1));
  }
}
