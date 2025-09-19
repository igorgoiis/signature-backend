import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  IsArray,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";
import { DashboardTimeRange } from "../constants/dashboard.constants";

export class DashboardQueryDto {
  @ApiProperty({
    description: "Time range for dashboard data",
    enum: DashboardTimeRange,
    default: DashboardTimeRange.LAST_30_DAYS,
    required: false,
  })
  @IsOptional()
  @IsEnum(DashboardTimeRange)
  timeRange?: DashboardTimeRange = DashboardTimeRange.LAST_30_DAYS;

  @ApiProperty({
    description: "Custom start date (if timeRange is CUSTOM)",
    example: "2024-01-01",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: "Custom end date (if timeRange is CUSTOM)",
    example: "2024-01-31",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: "Number of recent activities to return",
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: "Filter by specific activity types",
    example: ["DOCUMENT_CREATED", "DOCUMENT_SIGNED"],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actions?: string[];
}
