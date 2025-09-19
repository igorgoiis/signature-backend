import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  Matches,
  Validate,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsCpfCnpjUnique,
  IsCodigoUnique,
  IsCpfCnpjValid,
} from "src/fornecedor/validators/unique-validators";

export class CreateFornecedorDto {
  @IsString()
  @IsNotEmpty({ message: "O código do fornecedor não pode estar vazio." })
  @IsCodigoUnique({
    message: "Este código já está em uso por outro fornecedor.",
  })
  @ApiProperty({
    description: "Código único do fornecedor",
    example: "FORN001",
    type: "string",
  })
  codigo: string;

  @IsString()
  @IsNotEmpty({ message: "O CPF ou CNPJ não pode estar vazio." })
  @Length(11, 14, {
    message: "O CPF ou CNPJ deve ter 11 (CPF) ou 14 (CNPJ) dígitos.",
  })
  @Matches(/^\d+$/, { message: "O CPF ou CNPJ deve conter apenas números." })
  @Validate(IsCpfCnpjValid, {
    message: "O CPF ou CNPJ informado não é válido.",
  })
  @IsCpfCnpjUnique({
    message: "Este CPF ou CNPJ já está cadastrado no sistema.",
  })
  @ApiProperty({
    description:
      "CPF (11 dígitos) ou CNPJ (14 dígitos) do fornecedor (apenas números)",
    example: "12345678000195",
    type: "string",
    minLength: 11,
    maxLength: 14,
  })
  cpfCnpj: string;

  @IsString()
  @IsNotEmpty({ message: "A razão social não pode estar vazia." })
  @ApiProperty({
    description: "Razão social do fornecedor",
    example: "Empresa Fornecedora LTDA",
    type: "string",
  })
  razaoSocial: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: "Nome fantasia do fornecedor",
    example: "Fornecedora Express",
    type: "string",
  })
  nomeFantasia?: string;
}
