import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
  Param, // Import Param decorator
} from "@nestjs/common";
import { Optional } from "@nestjs/common"; // Import Optional
import { AuditLogService } from "./audit-log.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"; // Assuming JWT guard exists
import { RolesGuard } from "../auth/guards/roles.guard"; // Assuming Roles guard exists
import { Roles } from "../auth/decorators/roles.decorator"; // Assuming Roles decorator exists
import { UserRole } from "../user/user.entity"; // Adjust path
import { FindManyOptions } from "typeorm";
import { AuditLog } from "./audit-log.entity";
import { Type } from "class-transformer"; // Import Type
import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes } from "@nestjs/swagger";

// DTO for query parameters
class FindAuditLogsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  entityId?: number;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number = 100; // Default limit

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0; // Default offset
}

@Controller("audit-logs")
@UseGuards(JwtAuthGuard, RolesGuard) // Protect endpoints
@Roles(UserRole.ADMIN)
@ApiTags('Logs de Auditoria') // Only Admins can access audit logs
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
    @ApiOperation({
            summary: 'GET findLogs',
            description: 'Endpoint GET para findLogs'
          })
    @ApiBearerAuth()
    @ApiResponse({
              status: 200,
              description: 'Operação realizada com sucesso',
              
              example: {
      "message": "Operação realizada com sucesso"
    }
            })
    @ApiResponse({
              status: 400,
              description: 'Dados inválidos na requisição',
              
              example: {
      "statusCode": 400,
      "message": [
        "Dados inválidos"
      ],
      "error": "Bad Request"
    }
            })
    @ApiResponse({
              status: 401,
              description: 'Não autorizado',
              
              example: {
      "statusCode": 401,
      "message": "Unauthorized",
      "error": "Unauthorized"
    }
            })
    @ApiResponse({
              status: 404,
              description: 'Recurso não encontrado',
              
              example: {
      "statusCode": 404,
      "message": "Recurso não encontrado",
      "error": "Not Found"
    }
            })
    @ApiResponse({
              status: 500,
              description: 'Erro interno do servidor',
              
              example: {
      "statusCode": 500,
      "message": "Internal server error",
      "error": "Internal Server Error"
    }
            })
  async findLogs(
    // Use ValidationPipe to enable DTO transformation and validation
    @Query(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
    query: FindAuditLogsQueryDto,
  ): Promise<AuditLog[]> {
    const { userId, entityType, entityId, action, take, skip } = query;

    const options: FindManyOptions<AuditLog> = {
      where: {},
      take: take,
      skip: skip,
      order: { timestamp: "DESC" }, // Default order
      relations: ["user"], // Include user details
    };

    if (userId !== undefined) { // Check for undefined as 0 is a valid ID
      options.where = { ...options.where, user: { id: userId } };
    }
    if (entityType) {
      options.where = { ...options.where, entityType: entityType };
    }
    if (entityId !== undefined) {
      options.where = { ...options.where, entityId: entityId };
    }
    if (action) {
      options.where = { ...options.where, action: action };
    }

    return this.auditLogService.findLogs(options);
  }

  @Get("entity/:entityType/:entityId")
    @ApiOperation({
            summary: 'GET findLogsForEntity',
            description: 'Endpoint GET para findLogsForEntity'
          })
    @ApiBearerAuth()
    @ApiResponse({
              status: 200,
              description: 'Operação realizada com sucesso',
              
              example: {
      "message": "Operação realizada com sucesso"
    }
            })
    @ApiResponse({
              status: 400,
              description: 'Dados inválidos na requisição',
              
              example: {
      "statusCode": 400,
      "message": [
        "Dados inválidos"
      ],
      "error": "Bad Request"
    }
            })
    @ApiResponse({
              status: 401,
              description: 'Não autorizado',
              
              example: {
      "statusCode": 401,
      "message": "Unauthorized",
      "error": "Unauthorized"
    }
            })
    @ApiResponse({
              status: 404,
              description: 'Recurso não encontrado',
              
              example: {
      "statusCode": 404,
      "message": "Recurso não encontrado",
      "error": "Not Found"
    }
            })
    @ApiResponse({
              status: 500,
              description: 'Erro interno do servidor',
              
              example: {
      "statusCode": 500,
      "message": "Internal server error",
      "error": "Internal Server Error"
    }
            })
  async findLogsForEntity(
    @Param("entityType") entityType: string,
    @Param("entityId", new ParseIntPipe()) entityId: number, // Use new ParseIntPipe() here for path param
  ): Promise<AuditLog[]> {
    return this.auditLogService.findLogsForEntity(entityType, entityId);
  }
}

