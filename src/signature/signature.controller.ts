import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Get,
  Param,
  Query,
  Delete,
  Patch,
  ParseIntPipe,
} from "@nestjs/common";
import { SignatureService } from "./signature.service";
import { CreateSignatureDto } from "./dto/request/create-signature.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../user/enums/user-role.enum";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import {
  SignatureResponse,
  PaginatedSignatureResponse,
} from "./interfaces/signature.interface";
import {
  SignatureResponseDto,
  PaginatedSignatureResponseDto,
} from "./dto/response/signature.response.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { AuthenticatedUser } from "src/common/decorators/authenticated-user.decorator";
import { AuthenticatedUser as AuthenticatedUserInterface } from "src/common/interfaces/authenticated-user.interface";

@Controller("api/signatures")
@UseGuards(JwtAuthGuard)
@ApiTags("Assinaturas")
export class SignatureController {
  private readonly logger = new Logger(SignatureController.name);

  constructor(private readonly signatureService: SignatureService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Criar assinatura",
    description: "Cria uma nova assinatura para um documento",
  })
  @ApiBearerAuth()
  @ApiBody({
    type: CreateSignatureDto,
    description: "Dados da assinatura",
    examples: {
      example1: {
        summary: "Exemplo de requisição",
        value: {
          documentId: 1,
          signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAM...",
          positionData: {
            page: 1,
            x: 150,
            y: 200,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Assinatura criada com sucesso",
    type: SignatureResponseDto,
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
    description: "Não é a sua vez de assinar este documento",
  })
  @ApiResponse({
    status: 404,
    description: "Registro de signatário pendente não encontrado",
  })
  async create(
    @AuthenticatedUser() user: AuthenticatedUserInterface,
    @Body() createSignatureDto: CreateSignatureDto,
  ): Promise<SignatureResponse> {
    const userId = user.id;
    this.logger.log(
      `User ID ${userId} submitting signature for document ID: ${createSignatureDto.documentId}`,
    );
    return this.signatureService.create(createSignatureDto, userId);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Buscar assinatura por ID",
    description: "Retorna os detalhes de uma assinatura específica",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "id",
    description: "ID da assinatura",
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Assinatura encontrada com sucesso",
    type: SignatureResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Assinatura não encontrada",
  })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<SignatureResponse> {
    return this.signatureService.findOne(id);
  }

  @Get("document/:documentId")
  @ApiOperation({
    summary: "Listar assinaturas por documento",
    description: "Retorna todas as assinaturas para um documento específico",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "documentId",
    description: "ID do documento",
    type: Number,
  })
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
    description: "Lista de assinaturas retornada com sucesso",
    type: PaginatedSignatureResponseDto,
  })
  async findByDocument(
    @Param("documentId", ParseIntPipe) documentId: number,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedSignatureResponse> {
    return this.signatureService.findByDocument(documentId, paginationDto);
  }

  @Get("user/:userId")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Listar assinaturas por usuário",
    description:
      "Retorna todas as assinaturas de um usuário específico (apenas admin)",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "userId",
    description: "ID do usuário",
    type: Number,
  })
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
    description: "Lista de assinaturas retornada com sucesso",
    type: PaginatedSignatureResponseDto,
  })
  async findByUser(
    @Param("userId", ParseIntPipe) userId: number,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedSignatureResponse> {
    return this.signatureService.findByUser(userId, paginationDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Remover assinatura",
    description: "Remove uma assinatura do sistema (soft delete)",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "id",
    description: "ID da assinatura",
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: "Assinatura removida com sucesso",
  })
  @ApiResponse({
    status: 404,
    description: "Assinatura não encontrada",
  })
  async remove(
    @AuthenticatedUser() user: AuthenticatedUserInterface,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<void> {
    await this.signatureService.remove(id, user.id);
  }

  @Patch(":id/restore")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Restaurar assinatura",
    description: "Restaura uma assinatura previamente removida",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "id",
    description: "ID da assinatura",
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Assinatura restaurada com sucesso",
    type: SignatureResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Assinatura não encontrada",
  })
  async restore(
    @AuthenticatedUser() user: AuthenticatedUserInterface,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<SignatureResponse> {
    return this.signatureService.restore(id, user.id);
  }
}
