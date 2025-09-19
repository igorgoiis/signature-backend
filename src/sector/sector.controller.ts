import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  ParseBoolPipe,
  Put,
} from "@nestjs/common";
import { SectorService } from "./sector.service";
import { CreateSectorDto } from "./dto/create-sector.dto";
import { UpdateSectorDto } from "./dto/update-sector.dto";
import { SectorResponse } from "./interfaces/sector.interface";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../user/enums/user-role.enum";
import { PaginationDto } from "../common/dto/pagination.dto";
import { PaginatedResponse } from "src/common/interfaces/paginated-response.interface";
import { SectorResponseDto } from "./dto";
import { Sector } from "./entities";
import { AuthenticatedUser } from "src/common/decorators/authenticated-user.decorator";
import { AuthenticatedUser as AuthenticatedUserInterface } from "src/common/interfaces/authenticated-user.interface";

@Controller("api/sectors")
@ApiTags("Setores")
@UseGuards(JwtAuthGuard)
export class SectorController {
  constructor(private readonly sectorService: SectorService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Criar setor",
    description: "Cria um novo setor no sistema (apenas administradores)",
  })
  @ApiBearerAuth()
  @ApiBody({
    type: CreateSectorDto,
    description: "Dados para criação do setor",
    examples: {
      example1: {
        summary: "Exemplo de requisição",
        value: {
          name: "Recursos Humanos",
          description: "Setor responsável pela gestão de recursos humanos",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Setor criado com sucesso",
    type: SectorResponseDto,
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
    description: "Acesso proibido",
  })
  create(
    @AuthenticatedUser() user: AuthenticatedUserInterface,
    @Body() createSectorDto: CreateSectorDto,
  ): Promise<Sector> {
    return this.sectorService.create(createSectorDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: "Listar setores",
    description: "Retorna lista de todos os setores",
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: "page",
    description: "Número da página",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    description: "Itens por página",
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Lista de setores retornada com sucesso",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  findAll(
    @Query("includeDeleted", ParseBoolPipe) includeDeleted?: boolean,
  ): Promise<SectorResponse[] | PaginatedResponse<SectorResponse>> {
    return this.sectorService.findAll(includeDeleted);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Obter setor",
    description: "Retorna informações de um setor específico",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "id",
    description: "ID do setor",
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Setor retornado com sucesso",
    type: SectorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  @ApiResponse({
    status: 404,
    description: "Setor não encontrado",
  })
  findOne(@Param("id", ParseIntPipe) id: number): Promise<SectorResponse> {
    return this.sectorService.findOne(id);
  }

  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Atualizar setor",
    description: "Atualiza informações de um setor (apenas administradores)",
  })
  @ApiBearerAuth()
  @ApiBody({
    type: UpdateSectorDto,
    description: "Dados para atualização do setor",
    examples: {
      example1: {
        summary: "Exemplo de requisição",
        value: {
          name: "RH - Recursos Humanos",
          description: "Descrição atualizada",
        },
      },
    },
  })
  @ApiParam({
    name: "id",
    description: "ID do setor",
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Setor atualizado com sucesso",
    type: SectorResponseDto,
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
    description: "Acesso proibido",
  })
  @ApiResponse({
    status: 404,
    description: "Setor não encontrado",
  })
  update(
    @AuthenticatedUser() user: AuthenticatedUserInterface,
    @Param("id", ParseIntPipe) id: number,
    @Body() updateSectorDto: UpdateSectorDto,
  ): Promise<Sector> {
    return this.sectorService.update(id, updateSectorDto, user.id);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Remover setor",
    description: "Remove um setor do sistema (apenas administradores)",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "id",
    description: "ID do setor",
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: "Setor removido com sucesso",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  @ApiResponse({
    status: 403,
    description: "Acesso proibido",
  })
  @ApiResponse({
    status: 404,
    description: "Setor não encontrado",
  })
  remove(
    @AuthenticatedUser() user: AuthenticatedUserInterface,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<void> {
    return this.sectorService.remove(id, user.id);
  }

  @Post(":id/restore")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Restaurar setor",
    description:
      "Restaura um setor previamente deletado (apenas administradores)",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "id",
    description: "ID do setor",
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Setor restaurado com sucesso",
    type: SectorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  @ApiResponse({
    status: 403,
    description: "Acesso proibido",
  })
  @ApiResponse({
    status: 404,
    description: "Setor não encontrado",
  })
  restore(
    @AuthenticatedUser() user: AuthenticatedUserInterface,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<Sector> {
    return this.sectorService.restore(id, user.id);
  }
}
