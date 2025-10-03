import { Transform } from "class-transformer";
import { IsOptional, IsDateString, Validate } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { DateRangerValidator } from "../../validators/date-ranger.validator";

export class DocumentInstalmentQueryDto {
  @ApiPropertyOptional({
    description: "Data inicial do período (YYYY-MM-DD ou ISO string)",
    example: "2024-01-01",
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) return value;

    const date = new Date(value);
    return value.includes("T")
      ? date.toISOString()
      : new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        ).toISOString();
  })
  startDate?: string;

  @ApiPropertyOptional({
    description: "Data final do período (YYYY-MM-DD ou ISO string)",
    example: "2024-12-31",
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) return value;

    const date = new Date(value);
    return value.includes("T")
      ? date.toISOString()
      : new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          23,
          59,
          59,
          999,
        ).toISOString();
  })
  @Validate(DateRangerValidator, {
    message: "A data final deve ser maior ou igual à data inicial",
  })
  endDate?: string;
}
