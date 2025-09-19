import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "../enums/user-role.enum";

export class CreateUserDto {
  @ApiProperty({
    description: "Nome completo do usuário",
    example: "João Silva",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Endereço de email do usuário",
    example: "joao.silva@exemplo.com",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "Senha do usuário",
    example: "Senha@123",
  })
  @IsString({ message: "A senha precisa ser uma string" })
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: "Papel do usuário no sistema",
    enum: UserRole,
    default: UserRole.USER,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    description: "ID do setor do usuário",
    example: 1,
    nullable: true,
  })
  @IsOptional()
  sectorId?: number | null;
}
