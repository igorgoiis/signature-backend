import {
  IsNumber,
  IsDateString,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateInstallmentDto {
  @IsNumber()
  @Min(1)
  @ApiProperty({
    description: "Número da parcela (1, 2, 3...)",
    example: 1,
    minimum: 1,
  })
  installmentNumber: number;

  @IsNumber()
  @Min(0.01)
  @ApiProperty({
    description: "Valor da parcela",
    example: 5000.0,
    minimum: 0.01,
    type: "number",
  })
  amount: number;

  @IsDateString()
  @ApiProperty({
    description: "Data de vencimento da parcela",
    example: "2024-12-31",
    type: "string",
    format: "date",
  })
  dueDate: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "Descrição adicional da parcela",
    example: "Primeira parcela do contrato",
  })
  description?: string;
}
