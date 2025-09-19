import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNumber,
  IsDateString,
  IsDecimal,
  IsNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DocumentNature, DocumentType } from "../../types/document.types";
import { CreateSignatoryDto } from "../signatory/create-signatory.dto";
import { CreateInstallmentDto } from "../installment/create-installment.dto";
import { CreateAllocationDto } from "../allocation/create-allocation.dto";

export class CreateDocumentDto {
  // Metadados do arquivo (vindos da rota de upload)
  @ApiProperty({
    description: "ID do arquivo",
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  fileId: number;

  // Dados do documento
  @ApiProperty({
    description: "Título do documento",
    example: "Contrato de Prestação de Serviços - Empresa XYZ",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: "Descrição detalhada do documento",
    example:
      "Contrato para prestação de serviços de consultoria em tecnologia da informação",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "ID do fornecedor associado ao documento",
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  fornecedorId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSignatoryDto)
  @ApiProperty({
    description: "Lista de signatários do documento",
    type: [CreateSignatoryDto],
    example: [
      {
        userId: 1,
        order: 1,
        notes: "Revisar cláusulas contratuais",
      },
      {
        userId: 2,
        order: 2,
        notes: "Aprovação final",
      },
    ],
  })
  signatories: CreateSignatoryDto[];

  // Campos financeiros
  @IsEnum(DocumentType)
  @IsOptional()
  @ApiPropertyOptional({
    description: "Tipo do documento",
    enum: DocumentType,
    example: DocumentType.GENERAL,
  })
  tipoDocumento?: DocumentType;

  @IsEnum(DocumentNature)
  @ApiProperty({
    description: "Natureza do documento",
    enum: DocumentNature,
    example: DocumentNature.SALARIES,
  })
  natureza: DocumentNature;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: "O valor deve ter no máximo duas casas decimais." },
  )
  @ApiPropertyOptional({
    description: "Valor monetário do documento",
    example: 15000.5,
    type: "number",
  })
  valor?: number;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: "Data de vencimento do documento",
    example: "2024-12-31",
    type: "string",
    format: "date",
  })
  dataVencimento?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "Observações adicionais sobre o documento",
    example:
      "Documento requer aprovação do diretor financeiro antes da assinatura final",
  })
  observacoes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInstallmentDto)
  @ApiProperty({
    description: "Lista de parcelas do documento (se aplicável)",
    type: [CreateInstallmentDto],
    example: [
      {
        installmentNumber: 1,
        amount: 7500.0,
        dueDate: "2024-12-31",
        description: "Primeira parcela",
      },
      {
        installmentNumber: 2,
        amount: 7500.0,
        dueDate: "2025-01-31",
        description: "Segunda parcela",
      },
    ],
  })
  installments: CreateInstallmentDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAllocationDto)
  @ApiProperty({
    description: "Lista de rateio do documento",
    type: [CreateAllocationDto],
    example: [
      {
        id: "1754870720899",
        filial: "Matriz Juazeiro",
        centroCusto: "TI",
        valor: 5000,
        percentual: 50,
      },
      {
        id: "1754870726731",
        filial: "Filial Petrolina Maquinas",
        centroCusto: "TI",
        valor: 5000,
        percentual: 50,
      },
    ],
  })
  rateio: CreateAllocationDto[];
}
