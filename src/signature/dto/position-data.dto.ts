import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PositionDataDto {
  @IsNumber()
  @IsNotEmpty()
    @ApiProperty({
              description: 'x do PositionDataDto',
              example: 123,
              type: 'number'
            })
  x: number;

  @IsNumber()
  @IsNotEmpty()
    @ApiProperty({
              description: 'y do PositionDataDto',
              example: 123,
              type: 'number'
            })
  y: number;

  @IsNumber()
  @IsNotEmpty()
    @ApiProperty({
              description: 'page do PositionDataDto',
              example: 123,
              type: 'number'
            })
  page: number;
}

