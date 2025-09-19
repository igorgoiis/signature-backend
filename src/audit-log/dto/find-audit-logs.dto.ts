import { Type } from "class-transformer";
import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class FindAuditLogsQueryDto {
  @ApiProperty({
    description: "ID do usuário que realizou a ação",
    required: false,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @ApiProperty({
    description: "Tipo da entidade afetada",
    required: false,
    example: "Document",
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({
    description: "ID da entidade afetada",
    required: false,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  entityId?: number;

  @ApiProperty({
    description: "Tipo da ação realizada",
    required: false,
    example: "CREATE_DOCUMENT",
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({
    description: "Número máximo de registros",
    required: false,
    default: 100,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number = 100;

  @ApiProperty({
    description: "Número de registros para pular (paginação)",
    required: false,
    default: 0,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;
}
