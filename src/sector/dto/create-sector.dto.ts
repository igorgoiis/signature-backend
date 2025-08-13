import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateSectorDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do setor não pode estar vazio.' })
    @ApiProperty({
              description: 'Nome completo do usuário',
              example: "João Silva",
              type: 'string'
            })
  name: string;

  @IsString()
  @IsOptional()
    @ApiPropertyOptional({
              description: 'Descrição detalhada do documento',
              example: "Contrato para prestação de serviços de consultoria",
              type: 'string'
            }) // Make description optional
  description?: string;
}

