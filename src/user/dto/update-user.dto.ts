import { IsString, IsEmail, IsOptional, MinLength, IsInt, IsPositive, Length, IsEnum } from 'class-validator';
import { UserRole } from '../user.entity';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 255, { message: 'O nome deve ter entre 1 e 255 caracteres se fornecido.' })
    @ApiPropertyOptional({
              description: 'Nome completo do usuário',
              example: "João Silva",
              type: 'string'
            })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Formato de email inválido se fornecido.' })
    @ApiPropertyOptional({
              description: 'Endereço de email do usuário',
              example: "usuario@exemplo.com",
              type: 'string'
            })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres se fornecida.' })
    @ApiPropertyOptional({
              description: 'Senha do usuário (mínimo 8 caracteres)',
              example: "MinhaSenh@123",
              type: 'string'
            })
  password?: string;

  @IsOptional()
  @IsInt({ message: 'O ID do setor deve ser um número inteiro se fornecido.' })
  @IsPositive({ message: 'O ID do setor deve ser um número positivo se fornecido.' })
    @ApiPropertyOptional({
              description: 'ID do setor ao qual o usuário pertence',
              example: 1,
              type: 'number'
            })
  sectorId?: number;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role inválido. Use \'admin\' ou \'user\'.' })
    @ApiPropertyOptional({
              description: 'Papel do usuário no sistema (USER, ADMIN)',
              example: "USER",
              type: 'string'
            })
  role?: UserRole; // Add optional role field for updates
}

