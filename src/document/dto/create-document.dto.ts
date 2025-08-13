
import { IsString, IsOptional, IsArray, ValidateNested, IsEnum, IsNumber, IsDateString, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '../document.entity';
import { CreateInstallmentDto } from './create-installment.dto';
import { CreateAllocationDto } from './create-allocation.dto';

export class CreateSignatoryDto {
  @IsNumber()
  @ApiProperty({
    description: 'ID do usuário signatário',
    example: 1
  })
  userId: number;

  @IsNumber()
  @ApiProperty({
    description: 'Ordem de assinatura (1, 2, 3...)',
    example: 1
  })
  order: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Observações específicas para este signatário',
    example: 'Revisar cláusulas contratuais antes de assinar'
  })
  notes?: string;
}

export class CreateDocumentDto {
  @IsString()
  @ApiProperty({
    description: 'Título do documento',
    example: 'Contrato de Prestação de Serviços - Empresa XYZ'
  })
  title: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Descrição detalhada do documento',
    example: 'Contrato para prestação de serviços de consultoria em tecnologia da informação'
  })
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSignatoryDto)
  @ApiProperty({
    description: 'Lista de signatários do documento',
    type: [CreateSignatoryDto],
    example: [
      {
        userId: 1,
        order: 1,
        notes: 'Revisar cláusulas contratuais'
      },
      {
        userId: 2,
        order: 2,
        notes: 'Aprovação final'
      }
    ]
  })
  signatories: CreateSignatoryDto[];

  // Campo do fornecedor
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'ID do fornecedor associado ao documento',
    example: 1,
    type: 'number'
  })
  fornecedorId?: number;

  // Campos financeiros
  @IsEnum(DocumentType)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Tipo do documento',
    enum: DocumentType,
    example: DocumentType.CONTRACT
  })
  tipoDocumento?: DocumentType;

  @IsString()
  @ApiProperty({
    description: 'Natureza do documento',
    example: 'Despesa operacional'
  })
  natureza: string;

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

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Observações adicionais sobre o documento',
    example: 'Documento requer aprovação do diretor financeiro antes da assinatura final'
  })
  observacoes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInstallmentDto)
  @ApiProperty({
    description: 'Lista de parcelas do documento (se aplicável)',
    type: [CreateInstallmentDto],
    example: [
      {
        installmentNumber: 1,
        amount: 7500.00,
        dueDate: '2024-12-31',
        description: 'Primeira parcela'
      },
      {
        installmentNumber: 2,
        amount: 7500.00,
        dueDate: '2025-01-31',
        description: 'Segunda parcela'
      }
    ]
  })
  installments: CreateInstallmentDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAllocationDto)
  @ApiProperty({
    description: 'Lista de rateio do documento',
    type: [CreateAllocationDto],
    example: [
      {
        id: '1754870720899',
        filial: 'Matriz Juazeiro',
        centroCusto: 'TI',
        valor: 5,
        percentual: 50
      },
      {
        id: '1754870726731',
        filial: 'Filial Petrolina Maquinas',
        centroCusto: 'TI',
        valor: 5,
        percentual: 50
      }
    ]
  })
  rateio: CreateAllocationDto[];
}


