import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenDto {
  @IsString({ message: "O refresh token deve ser uma string" })
  @IsNotEmpty({ message: "O refresh token é obrigatório" })
  @ApiProperty({
    description: "Token de renovação",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  refresh_token: string;
}
