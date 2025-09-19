import { IsString, IsNotEmpty, IsOptional, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateSectorDto {
  @IsString()
  @IsNotEmpty({ message: "O nome do setor não pode estar vazio." })
  @MaxLength(100, {
    message: "O nome do setor deve ter no máximo 100 caracteres.",
  })
  @ApiProperty({
    description: "Nome do setor",
    example: "Recursos Humanos",
    maxLength: 100,
  })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: "A descrição deve ter no máximo 500 caracteres." })
  @ApiPropertyOptional({
    description: "Descrição detalhada do setor",
    example: "Setor responsável pela gestão de recursos humanos",
    maxLength: 500,
  })
  description?: string;
}
