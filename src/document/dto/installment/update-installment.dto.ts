import {
  IsNumber,
  IsDateString,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateInstallmentDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @ApiPropertyOptional({
    description: "Valor da parcela",
    example: 5500.0,
    minimum: 0.01,
    type: "number",
  })
  amount?: number;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: "Data de vencimento da parcela",
    example: "2025-01-15",
    type: "string",
    format: "date",
  })
  dueDate?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "Descrição adicional da parcela",
    example: "Parcela atualizada após renegociação",
  })
  description?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: "Indica se a parcela foi paga",
    example: true,
    type: "boolean",
  })
  isPaid?: boolean;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: "Data em que a parcela foi paga",
    example: "2024-12-28",
    type: "string",
    format: "date",
  })
  paidDate?: string;
}
