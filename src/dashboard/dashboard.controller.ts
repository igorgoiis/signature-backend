
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { RecentActivityDto } from './dto/recent-activity.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description: 'Returns statistics including total documents, pending documents, approved documents, and active users. For non-admin users, statistics are filtered by their sector.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    type: DashboardStatsDto,
    examples: {
      admin: {
        summary: 'Admin user statistics',
        value: {
          totalDocuments: 150,
          pendingDocuments: 25,
          approvedDocuments: 100,
          activeUsers: 45,
        },
      },
      user: {
        summary: 'Regular user statistics (filtered by sector)',
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
    description: 'Unauthorized - JWT token required',
  })
  async getStats(@Request() req): Promise<DashboardStatsDto> {
    return this.dashboardService.getStats(req.user);
  }

  @Get('recent-activity')
  @ApiOperation({
    summary: 'Get recent system activities',
    description: 'Returns the last 10 activities in the system. For non-admin users, activities are filtered by their sector.',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent activities retrieved successfully',
    type: [RecentActivityDto],
    examples: {
      success: {
        summary: 'Recent activities example',
        value: [
          {
            id: 1,
            action: 'DOCUMENT_CREATED',
            entityType: 'Document',
            entityId: 123,
            performedBy: {
              name: 'João Silva',
              email: 'joao.silva@empresa.com',
            },
            performedAt: '2024-01-15T10:30:00.000Z',
            details: {
              documentTitle: 'Contrato de Prestação de Serviços',
              documentType: 'CONTRACT',
            },
          },
          {
            id: 2,
            action: 'DOCUMENT_SIGNED',
            entityType: 'Document',
            entityId: 122,
            performedBy: {
              name: 'Maria Santos',
              email: 'maria.santos@empresa.com',
            },
            performedAt: '2024-01-15T09:45:00.000Z',
            details: {
              documentTitle: 'Proposta Comercial',
              signaturePosition: 1,
            },
          },
          {
            id: 3,
            action: 'USER_LOGIN',
            entityType: 'User',
            entityId: 45,
            performedBy: {
              name: 'Carlos Oliveira',
              email: 'carlos.oliveira@empresa.com',
            },
            performedAt: '2024-01-15T08:15:00.000Z',
            details: {
              ipAddress: '192.168.1.100',
              userAgent: 'Mozilla/5.0...',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async getRecentActivity(@Request() req): Promise<RecentActivityDto[]> {
    return this.dashboardService.getRecentActivity(req.user);
  }
}
