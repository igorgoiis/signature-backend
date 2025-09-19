import { ApiProperty } from "@nestjs/swagger";

export class UserInfoDto {
  @ApiProperty({
    description: "User full name",
    example: "João Silva",
  })
  name: string;

  @ApiProperty({
    description: "User email address",
    example: "joao.silva@empresa.com",
  })
  email: string;
}

export class RecentActivityDto {
  @ApiProperty({
    description: "Activity unique identifier",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "Action performed",
    example: "DOCUMENT_CREATED",
  })
  action: string;

  @ApiProperty({
    description: "Type of entity affected",
    example: "Document",
    nullable: true,
  })
  entityType: string | null;

  @ApiProperty({
    description: "ID of the entity affected",
    example: 123,
    nullable: true,
  })
  entityId: number | null;

  @ApiProperty({
    description: "User who performed the action",
    type: UserInfoDto,
    nullable: true,
  })
  performedBy: UserInfoDto | null;

  @ApiProperty({
    description: "When the action was performed",
    example: "2024-01-15T10:30:00.000Z",
  })
  performedAt: Date;

  @ApiProperty({
    description: "Additional details about the action",
    example: {
      documentTitle: "Contrato de Prestação de Serviços",
      previousStatus: "PENDING",
    },
    nullable: true,
  })
  details: any | null;
}
