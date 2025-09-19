import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaginatedResponseDto } from "../../../common/dto/paginated-response.dto";

class PositionDataResponseDto {
  @ApiProperty({
    description: "Número da página do documento",
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: "Coordenada X na página",
    example: 150,
  })
  x: number;

  @ApiProperty({
    description: "Coordenada Y na página",
    example: 200,
  })
  y: number;
}

export class SignatureResponseDto {
  @ApiProperty({
    description: "ID único da assinatura",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "ID do documento relacionado",
    example: 1,
  })
  documentId: number;

  @ApiProperty({
    description: "ID do usuário que assinou",
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: "Dados da assinatura (Base64, SVG, ou dados vetoriais JSON)",
    example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAM...",
  })
  signatureData: string;

  @ApiPropertyOptional({
    description: "Dados de posicionamento da assinatura no documento",
    type: PositionDataResponseDto,
  })
  positionData: PositionDataResponseDto | null;

  @ApiProperty({
    description: "Data de criação",
    example: "2023-01-01T00:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Data de última atualização",
    example: "2023-01-01T00:00:00.000Z",
  })
  updatedAt: Date;
}

export class PaginatedSignatureResponseDto extends PaginatedResponseDto {
  @ApiProperty({
    description: "Lista de assinaturas",
    type: [SignatureResponseDto],
  })
  data: SignatureResponseDto[];
}
