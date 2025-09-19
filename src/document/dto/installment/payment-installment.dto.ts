import {
  IsNumber,
  IsDateString,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PaymentInstallmentDto {
  @IsDateString()
  @ApiProperty({
    description: "Data de pagamento da parcela",
    example: "2024-12-31",
    type: "string",
    format: "date",
  })
  paymentDate: string;

  @IsString()
  @ApiPropertyOptional({
    description: "Descrição adicional da parcela",
    example: "Primeira parcela do contrato",
  })
  fileId: number;
}
