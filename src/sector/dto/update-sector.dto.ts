import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateSectorDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'O nome do setor não pode estar vazio se fornecido.' })
    @ApiPropertyOptional({
              description: 'Nome completo do usuário',
              example: "João Silva",
              type: 'string'
            })
  name?: string;
}

