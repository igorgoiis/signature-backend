// src/sector/dto/update-sector.dto.ts
import { IsString, IsNotEmpty, IsOptional, MaxLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateSectorDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "O nome do setor não pode estar vazio se fornecido." })
  @MaxLength(100, {
    message: "O nome do setor deve ter no máximo 100 caracteres.",
  })
  @ApiPropertyOptional({
    description: "Nome do setor",
    example: "Recursos Humanos",
    maxLength: 100,
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "A descrição deve ter no máximo 500 caracteres." })
  @ApiPropertyOptional({
    description: "Descrição detalhada do setor",
    example: "Setor responsável pela gestão de recursos humanos",
    maxLength: 500,
  })
  description?: string;
}
