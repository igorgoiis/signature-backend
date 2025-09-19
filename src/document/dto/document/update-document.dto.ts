import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsDateString,
  ValidateNested,
  IsDecimal,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  DocumentNature,
  DocumentStatus,
  DocumentType,
} from "../../types/document.types";
import { CreateInstallmentDto } from "../installment/create-installment.dto";
import { CreateAllocationDto } from "../allocation/create-allocation.dto";

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: "Título do documento",
    example: "Contrato de Prestação de Serviços",
    type: "string",
  })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: "Descrição detalhada do documento",
    example: "Contrato para prestação de serviços de consultoria",
    type: "string",
  })
  description?: string;

  // Optionally allow updating status directly (e.g., to CANCELED)
  @IsEnum(DocumentStatus)
  @IsOptional()
  @ApiPropertyOptional({
    description: "Status atual do documento",
    enum: DocumentStatus,
    example: DocumentStatus.PENDING,
  })
  status?: DocumentStatus;

  @IsEnum(DocumentType)
  @IsOptional()
  @ApiPropertyOptional({
    description: "Tipo do documento",
    enum: DocumentType,
    example: DocumentType.GENERAL,
  })
  tipoDocumento?: DocumentType;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: "ID do fornecedor associado ao documento",
    example: 1,
    type: "number",
  })
  fornecedorId?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: "0,2" })
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

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: "Observações adicionais sobre o documento",
    example: "Documento requer aprovação do diretor financeiro",
    type: "string",
  })
  observacoes?: string;

  @IsEnum(DocumentNature)
  @IsOptional()
  @ApiPropertyOptional({
    description: "Natureza do documento",
    example: DocumentNature.SALARIES,
    enum: DocumentNature,
  })
  natureza?: DocumentNature;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInstallmentDto)
  @ApiPropertyOptional({
    description:
      "Lista de parcelas do documento (substitui as parcelas existentes)",
    type: [CreateInstallmentDto],
    example: [
      {
        installmentNumber: 1,
        amount: 8000.0,
        dueDate: "2024-12-31",
        description: "Primeira parcela atualizada",
      },
      {
        installmentNumber: 2,
        amount: 7000.0,
        dueDate: "2025-01-31",
        description: "Segunda parcela atualizada",
      },
    ],
  })
  installments?: CreateInstallmentDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAllocationDto)
  @ApiPropertyOptional({
    description:
      "Lista de rateio do documento (substitui os rateios existentes)",
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
  rateio?: CreateAllocationDto[];
}
