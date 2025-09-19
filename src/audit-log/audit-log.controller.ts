import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
  Param,
  Logger,
} from "@nestjs/common";
import { AuditLogService } from "./audit-log.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../user/enums";
import { AuditLog } from "./entities/audit-log.entity";
import { FindAuditLogsQueryDto } from "./dto/find-audit-logs.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";

@Controller("api/audit-logs")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags("Logs de Auditoria")
export class AuditLogController {
  private readonly logger = new Logger(AuditLogController.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({
    summary: "Listar logs de auditoria",
    description: "Retorna logs de auditoria com base nos filtros fornecidos",
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Logs de auditoria recuperados com sucesso",
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos na requisição",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  @ApiResponse({
    status: 403,
    description: "Acesso proibido (apenas administradores)",
  })
  async findLogs(
    @Query(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    queryDto: FindAuditLogsQueryDto,
  ): Promise<AuditLog[]> {
    this.logger.log(
      `Retrieving audit logs with filters: ${JSON.stringify(queryDto)}`,
    );
    return this.auditLogService.findLogs(queryDto);
  }

  @Get("entity/:entityType/:entityId")
  @ApiOperation({
    summary: "Listar logs para entidade específica",
    description:
      "Retorna logs de auditoria relacionados a uma entidade específica",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "entityType",
    description: "Tipo da entidade",
    example: "Document",
  })
  @ApiParam({ name: "entityId", description: "ID da entidade", example: 1 })
  @ApiResponse({
    status: 200,
    description: "Logs de auditoria recuperados com sucesso",
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos na requisição",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  @ApiResponse({
    status: 403,
    description: "Acesso proibido (apenas administradores)",
  })
  async findLogsByEntity(
    @Param("entityType") entityType: string,
    @Param("entityId", ParseIntPipe) entityId: number,
  ): Promise<AuditLog[]> {
    this.logger.log(`Retrieving logs for ${entityType} with ID ${entityId}`);
    return this.auditLogService.findLogsByEntity(entityType, entityId);
  }
}
