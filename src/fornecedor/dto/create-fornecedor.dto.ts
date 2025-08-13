
import { IsString, IsNotEmpty, IsOptional, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateFornecedorDto {
  @IsString()
  @IsNotEmpty({ message: 'O código do fornecedor não pode estar vazio.' })
  @ApiProperty({
    description: 'Código único do fornecedor',
    example: "FORN001",
    type: 'string'
  })
  codigo: string;

  @IsString()
  @IsNotEmpty({ message: 'O CNPJ não pode estar vazio.' })
  @Length(14, 14, { message: 'O CNPJ deve ter exatamente 14 dígitos.' })
  @Matches(/^\d{14}$/, { message: 'O CNPJ deve conter apenas números.' })
  @ApiProperty({
    description: 'CNPJ do fornecedor (apenas números)',
    example: "12345678000195",
    type: 'string',
    minLength: 14,
    maxLength: 14
  })
  cnpj: string;

  @IsString()
  @IsNotEmpty({ message: 'A razão social não pode estar vazia.' })
  @ApiProperty({
    description: 'Razão social do fornecedor',
    example: "Empresa Fornecedora LTDA",
    type: 'string'
  })
  razaoSocial: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Nome fantasia do fornecedor',
    example: "Fornecedora Express",
    type: 'string'
  })
  nomeFantasia?: string;
}
