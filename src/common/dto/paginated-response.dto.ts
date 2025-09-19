import { ApiProperty } from "@nestjs/swagger";

export class PaginationMetaDto {
  @ApiProperty({ description: "Total de itens encontrados", example: 100 })
  total: number;

  @ApiProperty({ description: "Página atual", example: 1 })
  page: number;

  @ApiProperty({ description: "Limite de itens por página", example: 10 })
  limit: number;

  @ApiProperty({ description: "Total de páginas", example: 10 })
  totalPages: number;
}

export class PaginatedResponseDto {
  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
