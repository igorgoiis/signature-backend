import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaginatedResponseDto } from "../../../common/dto/paginated-response.dto";

export class FornecedorResponseDto {
  @ApiProperty({
    description: "ID único do fornecedor",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "Código único do fornecedor",
    example: "FORN001",
  })
  codigo: string;

  @ApiProperty({
    description: "CNPJ do fornecedor",
    example: "12345678000195",
  })
  cnpj: string;

  @ApiProperty({
    description: "Razão social do fornecedor",
    example: "Empresa Fornecedora LTDA",
  })
  razaoSocial: string;

  @ApiPropertyOptional({
    description: "Nome fantasia do fornecedor",
    example: "Fornecedora Express",
  })
  nomeFantasia?: string;

  @ApiProperty({
    description: "Data de criação do registro",
    example: "2023-01-01T00:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Data da última atualização do registro",
    example: "2023-01-01T00:00:00.000Z",
  })
  updatedAt: Date;
}

export class PaginatedFornecedorResponseDto extends PaginatedResponseDto {
  @ApiProperty({
    description: "Lista de fornecedores",
    type: [FornecedorResponseDto],
  })
  data: FornecedorResponseDto[];
}
