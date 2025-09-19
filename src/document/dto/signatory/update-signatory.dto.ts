import { IsNumber, IsOptional, IsString, IsEnum } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { SignatoryStatus } from "../../types/signatory.types";

export class UpdateSignatoryDto {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: "Ordem de assinatura (1, 2, 3...)",
    example: 2,
  })
  order?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "Observações específicas para este signatário",
    example: "Atualização: Por favor verificar anexos também",
  })
  notes?: string;

  @IsOptional()
  @IsEnum(SignatoryStatus)
  @ApiPropertyOptional({
    description: "Status da assinatura",
    enum: SignatoryStatus,
    example: SignatoryStatus.SIGNED,
  })
  status?: SignatoryStatus;
}
