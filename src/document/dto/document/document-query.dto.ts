import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  IsArray,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";
import { DocumentStatus } from "src/document/types";

export class DocumentQueryDto {
  @ApiProperty({
    description: "Number of recent activities to return",
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({
    example: "createdAt:desc",
    required: false,
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiProperty({
    example: DocumentStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}
