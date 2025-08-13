import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
    @ApiProperty({
              description: 'refresh_token do RefreshTokenDto',
              example: "Exemplo de texto",
              type: 'string'
            })
  refresh_token: string;
}

