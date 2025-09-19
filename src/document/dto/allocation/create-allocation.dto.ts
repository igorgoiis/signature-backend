import { IsString, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAllocationDto {
  @IsNumber()
  @ApiProperty({
    description: "ID do rateio",
    example: "1754870720899",
  })
  id: number;

  @IsString()
  @ApiProperty({
    description: "Filial do rateio",
    example: "Matriz Juazeiro",
  })
  filial: string;

  @IsString()
  @ApiProperty({
    description: "Centro de Custo do rateio",
    example: "TI",
  })
  centroCusto: string;

  @IsNumber()
  @ApiProperty({
    description: "Valor do rateio",
    example: 5000.0,
    type: "number",
  })
  valor: number;

  @IsNumber()
  @ApiProperty({
    description: "Percentual do rateio",
    example: 50,
    type: "number",
  })
  percentual: number;
}
