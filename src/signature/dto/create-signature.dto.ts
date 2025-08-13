import { IsNotEmpty, IsString, IsNumber, IsObject, ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// DTO for position data
class PositionDataDto {
  @IsNumber()
    @ApiProperty({
              description: 'page do PositionDataDto',
              example: 123,
              type: 'number'
            })
  page: number;

  @IsNumber()
    @ApiProperty({
              description: 'x do PositionDataDto',
              example: 123,
              type: 'number'
            })
  x: number;

  @IsNumber()
    @ApiProperty({
              description: 'y do PositionDataDto',
              example: 123,
              type: 'number'
            })
  y: number;
}

export class CreateSignatureDto {
  @IsNumber()
    @ApiProperty({
              description: 'ID do documento a ser assinado',
              example: 1,
              type: 'number'
            })
  documentId: number;

  @IsString()
  @IsNotEmpty()
    @ApiProperty({
              description: 'signatureData do CreateSignatureDto',
              example: "Exemplo de texto",
              type: 'string'
            })
  signatureData: string; // Base64 string, SVG, or JSON for vector data

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => PositionDataDto)
    @ApiProperty({
              description: 'positionData do CreateSignatureDto',
              example: "valor_exemplo",
              type: 'string'
            })
  positionData: PositionDataDto;
}

