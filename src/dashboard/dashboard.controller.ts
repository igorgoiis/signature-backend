import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Logger,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { DashboardService } from "./dashboard.service";
import { DashboardStatsDto, DashboardQueryDto, RecentActivityDto } from "./dto";
import { DashboardTimeRange } from "./constants/dashboard.constants";

@ApiTags("Dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/dashboard")
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @Get("stats")
  @ApiOperation({
    summary: "Get dashboard statistics",
    description:
      "Returns statistics including total documents, pending documents, approved documents, and active users. For non-admin users, statistics are filtered by their sector.",
  })
  @ApiQuery({
    name: "timeRange",
    required: false,
    enum: DashboardTimeRange,
    description: "Time range for dashboard data",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    description: "Custom start date (if timeRange is CUSTOM)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    description: "Custom end date (if timeRange is CUSTOM)",
  })
  @ApiResponse({
    status: 200,
    description: "Dashboard statistics retrieved successfully",
    type: DashboardStatsDto,
    examples: {
      admin: {
        summary: "Admin user statistics",
        value: {
          totalDocuments: 150,
          pendingDocuments: 25,
          approvedDocuments: 100,
          activeUsers: 45,
        },
      },
      user: {
        summary: "Regular user statistics (filtered by sector)",
        value: {
          totalDocuments: 35,
          pendingDocuments: 8,
          approvedDocuments: 22,
          activeUsers: 12,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - JWT token required",
  })
  async getStats(
    @Request() req,
    @Query() queryDto: DashboardQueryDto,
  ): Promise<DashboardStatsDto> {
    this.logger.log(
      `Getting dashboard stats for user ${req.user.id} with query ${JSON.stringify(queryDto)}`,
    );
    return this.dashboardService.getStats(req.user, queryDto);
  }

  @Get("recent-activity")
  @ApiOperation({
    summary: "Get recent system activities",
    description:
      "Returns the last 10 activities in the system. For non-admin users, activities are filtered by their sector.",
  })
  @ApiQuery({
    name: "timeRange",
    required: false,
    enum: DashboardTimeRange,
    description: "Time range for activities",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    description: "Custom start date (if timeRange is CUSTOM)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    description: "Custom end date (if timeRange is CUSTOM)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of activities to return",
  })
  @ApiQuery({
    name: "actions",
    required: false,
    isArray: true,
    description: "Filter by specific activity types",
  })
  @ApiResponse({
    status: 200,
    description: "Recent activities retrieved successfully",
    type: [RecentActivityDto],
    examples: {
      success: {
        summary: "Recent activities example",
        value: [
          {
            id: 1,
            action: "DOCUMENT_CREATED",
            entityType: "Document",
            entityId: 123,
            performedBy: {
              name: "João Silva",
              email: "joao.silva@empresa.com",
            },
            performedAt: "2024-01-15T10:30:00.000Z",
            details: {
              documentTitle: "Contrato de Prestação de Serviços",
              documentType: "CONTRACT",
            },
          },
          {
            id: 2,
            action: "DOCUMENT_SIGNED",
            entityType: "Document",
            entityId: 122,
            performedBy: {
              name: "Maria Santos",
              email: "maria.santos@empresa.com",
            },
            performedAt: "2024-01-15T09:45:00.000Z",
            details: {
              documentTitle: "Proposta Comercial",
              signaturePosition: 1,
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - JWT token required",
  })
  async getRecentActivity(
    @Request() req,
    @Query() queryDto: DashboardQueryDto,
  ): Promise<RecentActivityDto[]> {
    this.logger.log(
      `Getting recent activity for user ${req.user.id} with query ${JSON.stringify(queryDto)}`,
    );
    return this.dashboardService.getRecentActivity(req.user, queryDto);
  }
}
