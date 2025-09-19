import { IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateSignatoryDto {
  @IsNumber()
  @ApiProperty({
    description: "ID do usuário signatário",
    example: 1,
  })
  userId: number;

  @IsNumber()
  @ApiProperty({
    description: "Ordem de assinatura (1, 2, 3...)",
    example: 1,
  })
  order: number;
}
