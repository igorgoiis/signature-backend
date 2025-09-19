import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsObject,
  ValidateNested,
  IsDefined,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { PositionDataDto } from "./position-data.dto";

export class CreateSignatureDto {
  @IsNumber()
  @ApiProperty({
    description: "ID do documento a ser assinado",
    example: 1,
    type: "number",
  })
  documentId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Dados da assinatura (Base64, SVG, ou dados vetoriais JSON)",
    example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAM...",
    type: "string",
  })
  signatureData: string;

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => PositionDataDto)
  @ApiProperty({
    description: "Dados de posicionamento da assinatura no documento",
    type: PositionDataDto,
    example: {
      page: 1,
      x: 150,
      y: 200,
    },
  })
  positionData: PositionDataDto;
}
