import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO padrão para respostas de erro da API
 */
export class ApiResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: ["Email inválido", "A senha é obrigatória"] })
  message: string | string[];

  @ApiProperty({ example: "Bad Request" })
  error?: string;
}
