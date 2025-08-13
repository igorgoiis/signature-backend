import { IsString, IsEmail, IsNotEmpty, MinLength, IsInt, IsPositive, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../user.entity';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
    @ApiProperty({
              description: 'Nome completo do usuário',
              example: "João Silva",
              type: 'string'
            })
  name: string;

  @IsEmail({}, { message: 'Formato de email inválido.' })
  @IsNotEmpty({ message: 'O email não pode estar vazio.' })
    @ApiProperty({
              description: 'Endereço de email do usuário',
              example: "usuario@exemplo.com",
              type: 'string'
            })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
    @ApiProperty({
              description: 'Senha do usuário (mínimo 8 caracteres)',
              example: "MinhaSenh@123",
              type: 'string'
            })
  password: string;

  @IsInt({ message: 'O ID do setor deve ser um número inteiro.' })
  @IsPositive({ message: 'O ID do setor deve ser um número positivo.' })
  @IsOptional()
    @ApiPropertyOptional({
              description: 'ID do setor ao qual o usuário pertence',
              example: 1,
              type: 'number'
            }) // Making sector optional for now, adjust if needed
  sectorId?: number;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role inválido. Use \'admin\' ou \'user\'.' })
    @ApiPropertyOptional({
              description: 'Papel do usuário no sistema (USER, ADMIN)',
              example: "USER",
              type: 'string'
            })
  role?: UserRole; // Add optional role field
}

