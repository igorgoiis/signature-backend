
import { IsString, IsOptional, IsEnum, IsNumber, Min, IsInt, IsArray, IsDateString, ValidateNested, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentStatus, DocumentType } from '../document.entity';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CreateInstallmentDto } from './create-installment.dto';
import { CreateAllocationDto } from './create-allocation.dto';

// DTO for Rateio Item update
class UpdateRateioItemDto {
  @IsString()
  @IsOptional()
    @ApiPropertyOptional({
              description: 'filial do UpdateRateioItemDto',
              example: "Exemplo de texto",
              type: 'string'
            })
  filial?: string;

  @IsString()
  @IsOptional()
    @ApiPropertyOptional({
              description: 'centroCusto do UpdateRateioItemDto',
              example: "Exemplo de texto",
              type: 'string'
            })
  centroCusto?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
    @ApiPropertyOptional({
              description: 'percentual do UpdateRateioItemDto',
              example: 123,
              type: 'number'
            })
  percentual?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
    @ApiPropertyOptional({
              description: 'valorLancamento do UpdateRateioItemDto',
              example: 123,
              type: 'number'
            })
  valorLancamento?: number;
}

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
    @ApiPropertyOptional({
              description: 'Título do documento',
              example: "Contrato de Prestação de Serviços",
              type: 'string'
            })
  title?: string;

  @IsString()
  @IsOptional()
    @ApiPropertyOptional({
              description: 'Descrição detalhada do documento',
              example: "Contrato para prestação de serviços de consultoria",
              type: 'string'
            })
  description?: string;

  // Optionally allow updating status directly (e.g., to CANCELED)
  // Be cautious with allowing direct status updates other than cancellation
  @IsEnum(DocumentStatus)
  @IsOptional()
    @ApiPropertyOptional({
              description: 'Status atual do documento',
              example: "PENDING",
              type: 'string'
            })
  status?: DocumentStatus;

  // New fields for enhanced document metadata
  @IsEnum(DocumentType)
  @IsOptional()
    @ApiPropertyOptional({
              description: 'Tipo do documento',
              example: "CONTRACT",
              enum: DocumentType
            })
  tipoDocumento?: DocumentType;

  @IsOptional()
  @IsNumber()
    @ApiPropertyOptional({
              description: 'ID do fornecedor associado ao documento',
              example: 1,
              type: 'number'
            })
  fornecedorId?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
    @ApiPropertyOptional({
              description: 'Valor monetário do documento',
              example: 15000.50,
              type: 'number'
            })
  valor?: number;

  @IsOptional()
  @IsDateString()
    @ApiPropertyOptional({
              description: 'Data de vencimento do documento',
              example: '2024-12-31',
              type: 'string',
              format: 'date'
            })
  dataVencimento?: string;

  @IsString()
  @IsOptional()
    @ApiPropertyOptional({
              description: 'Observações adicionais sobre o documento',
              example: "Documento requer aprovação do diretor financeiro",
              type: 'string'
            })
  observacoes?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Natureza do documento',
    example: 'Despesa operacional',
    type: 'string'
  })
  natureza?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInstallmentDto)
  @ApiPropertyOptional({
    description: 'Lista de parcelas do documento (substitui as parcelas existentes)',
    type: [CreateInstallmentDto],
    example: [
      {
        installmentNumber: 1,
        amount: 8000.00,
        dueDate: '2024-12-31',
        description: 'Primeira parcela atualizada'
      },
      {
        installmentNumber: 2,
        amount: 7000.00,
        dueDate: '2025-01-31',
        description: 'Segunda parcela atualizada'
      }
    ]
  })
  installments?: CreateInstallmentDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAllocationDto)
  @ApiPropertyOptional({
    description: 'Lista de rateio do documento (substitui os rateios existentes)',
    type: [CreateAllocationDto],
    example: [
      {
        id: "1754870720899",
        filial: "Matriz Juazeiro",
        centroCusto: "TI",
        valor: 5,
        percentual: 50
      },
      {
        id: "1754870726731",
        filial: "Filial Petrolina Maquinas",
        centroCusto: "TI",
        valor: 5,
        percentual: 50
      }
    ]
  })
  rateio?: CreateAllocationDto[];

  // Note: Updating signatories might be complex and handled via separate endpoints
}


