import { IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PositionDataDto {
  @IsNumber()
  @ApiProperty({
    description: "Número da página do documento",
    example: 1,
    type: "number",
  })
  page: number;

  @IsNumber()
  @ApiProperty({
    description: "Coordenada X na página",
    example: 150,
    type: "number",
  })
  x: number;

  @IsNumber()
  @ApiProperty({
    description: "Coordenada Y na página",
    example: 200,
    type: "number",
  })
  y: number;
}
