import { ApiProperty } from "@nestjs/swagger";

export class DashboardStatsDto {
  @ApiProperty({
    description: "Total number of documents in the system",
    example: 150,
  })
  totalDocuments: number;

  @ApiProperty({
    description: "Number of documents with PENDING status",
    example: 25,
  })
  pendingDocuments: number;

  @ApiProperty({
    description: "Number of documents with COMPLETED status",
    example: 100,
  })
  approvedDocuments: number;

  @ApiProperty({
    description: "Number of users active in the last 30 days",
    example: 45,
  })
  activeUsers: number;
}
