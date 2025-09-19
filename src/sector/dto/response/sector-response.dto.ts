// src/sector/dto/response/sector-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SectorResponseDto {
  @ApiProperty({
    description: "ID único do setor",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "Nome do setor",
    example: "Recursos Humanos",
  })
  name: string;

  @ApiPropertyOptional({
    description: "Descrição detalhada do setor",
    example: "Setor responsável pela gestão de recursos humanos",
  })
  description?: string;

  @ApiProperty({
    description: "Data de criação",
    example: "2023-01-01T10:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Data da última atualização",
    example: "2023-01-01T10:00:00.000Z",
  })
  updatedAt: Date;
}

export class MetaDto {
  @ApiProperty({
    description: "Total de registros",
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: "Página atual",
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: "Limite de registros por página",
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: "Total de páginas",
    example: 10,
  })
  totalPages: number;
}

export class PaginatedSectorsResponseDto {
  @ApiProperty({
    description: "Lista de setores",
    type: [SectorResponseDto],
  })
  data: SectorResponseDto[];

  @ApiProperty({
    description: "Metadados da paginação",
    type: MetaDto,
  })
  meta: MetaDto;
}
