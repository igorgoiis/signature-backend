import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class LoginDto {
  @IsEmail({}, { message: "Por favor, forneça um email válido." })
  @IsNotEmpty({ message: "O email não pode estar vazio." })
  @ApiProperty({
    description: "Endereço de email do usuário",
    example: "usuario@exemplo.com",
    type: "string",
  })
  email: string;

  @IsString()
  @IsNotEmpty({ message: "A senha não pode estar vazia." })
  @MinLength(6, { message: "A senha deve ter no mínimo 6 caracteres." })
  @ApiProperty({
    description: "Senha do usuário (mínimo 8 caracteres)",
    example: "MinhaSenh@123",
    type: "string",
  })
  password: string;
}
