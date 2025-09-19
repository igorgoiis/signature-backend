import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, Min, Max, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
  @ApiPropertyOptional({
    description: "Número da página (começando em 1)",
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: "Número de itens por página",
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: "Número de itens por página",
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeDeleted?: boolean;
}
