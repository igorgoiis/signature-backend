import { IsString, IsNumber, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateAllocationDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "Filial do rateio",
    example: "Matriz Juazeiro Atualizada",
  })
  filial?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "Centro de Custo do rateio",
    example: "Financeiro",
  })
  centroCusto?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: "Valor do rateio",
    example: 6000.0,
    type: "number",
  })
  valor?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: "Percentual do rateio",
    example: 60,
    type: "number",
  })
  percentual?: number;
}
