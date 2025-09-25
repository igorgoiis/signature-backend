import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
  Res,
  HttpStatus,
  Logger,
  NotFoundException,
  Query,
  HttpException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";

// Importações services
import { DocumentService } from "./services/document.service";

// Importações DTOs
import { CreateDocumentDto, UpdateDocumentDto } from "./dto";

// Importações guards
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

// Importações types
import { DocumentQueryDto } from "./dto/document/document-query.dto";
import { Document } from "./entities";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { UserRole } from "src/user/enums";
import { AuthenticatedUser } from "src/common/decorators/authenticated-user.decorator";
import { AuthenticatedUser as AuthenticatedUserInterface } from "src/common/interfaces/authenticated-user.interface";
import { PaymentInstallmentDto } from "./dto/installment/payment-installment.dto";

@ApiTags("documents")
@Controller("api/documents")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DocumentController {
  private readonly logger = new Logger(DocumentController.name);

  constructor(private readonly documentService: DocumentService) {}

  @Post("process")
  @ApiOperation({
    summary: "Processar documento",
    description:
      "Recebe metadados de um arquivo já enviado e dados adicionais para criar e processar um novo documento.",
  })
  @ApiBody({ type: CreateDocumentDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Documento processado e criado com sucesso.",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Documento processado com sucesso.",
        },
        data: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            title: {
              type: "string",
              example: "Contrato de Prestação de Serviços - Empresa XYZ",
            },
            description: {
              type: "string",
              example: "Contrato para prestação de serviços de consultoria",
            },
            fileName: { type: "string", example: "contrato.pdf" },
            fileSize: { type: "number", example: 1024000 },
            mimeType: { type: "string", example: "application/pdf" },
            status: { type: "string", example: "PENDING" },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Dados inválidos.",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      "Recurso não encontrado (e.g., fornecedor, usuário signatário).",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Não autorizado.",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Erro interno do servidor.",
  })
  @Roles(UserRole.ADMIN)
  async processDocument(
    @Body() createDocumentDto: CreateDocumentDto,
    @Request() req: any,
  ) {
    try {
      this.logger.log(
        `Document processing request received from user ${req.user.id}`,
      );

      const document = await this.documentService.createDocument(
        createDocumentDto,
        req.user.id,
      );

      this.logger.log(
        `Document processed successfully with ID: ${document.id}`,
      );

      return {
        success: true,
        message: "Documento processado com sucesso.",
        data: document,
      };
    } catch (error) {
      this.logger.error(
        `Document processing failed: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: "Erro interno do servidor ao processar documento.",
          error: "Internal Server Error",
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(":id/sign")
  @ApiOperation({
    summary: "Assinar documento",
    description: "Permite que um signatário assine um documento específico.",
  })
  @ApiParam({
    name: "id",
    description: "ID único do documento a ser assinado",
    type: "number",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Documento assinado com sucesso",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Documento assinado com sucesso." },
        data: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            status: { type: "string", example: "SIGNED" },
            signedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Requisição inválida",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        message: {
          type: "string",
          example: "Não é sua vez de assinar ou documento já assinado.",
        },
        error: { type: "string", example: "Bad Request" },
        statusCode: { type: "number", example: 400 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        message: {
          type: "string",
          example: "Token de acesso inválido ou expirado.",
        },
        error: { type: "string", example: "Unauthorized" },
        statusCode: { type: "number", example: 401 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Documento ou signatário não encontrado",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        message: {
          type: "string",
          example: "Documento ou signatário não encontrado.",
        },
        error: { type: "string", example: "Not Found" },
        statusCode: { type: "number", example: 404 },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: "Erro interno do servidor",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        message: {
          type: "string",
          example: "Erro interno do servidor ao assinar documento.",
        },
        error: { type: "string", example: "Internal Server Error" },
        statusCode: { type: "number", example: 500 },
      },
    },
  })
  async signDocument(
    @Param("id", ParseIntPipe) documentId: number,
    @Request() req: any,
  ) {
    try {
      this.logger.log(
        `Sign request received for document ${documentId} from user ${req.user.id}`,
      );
      const signedDocument = await this.documentService.signDocument(
        documentId,
        req.user.id,
      );
      return {
        success: true,
        message: "Documento assinado com sucesso.",
        data: {
          id: signedDocument.id,
          status: signedDocument.status,
          signedAt: signedDocument.signedAt,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to sign document ${documentId}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message:
          error.message || "Erro interno do servidor ao assinar documento.",
        error: error.name || "Internal Server Error",
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Post(":id/pay/installment/:installmentId")
  @ApiOperation({
    summary: "Pagar parcela do documento",
    description: "Permite que um usuário pague uma parcela de um documento.",
  })
  @ApiParam({
    name: "id",
    description: "ID único do documento a ser assinado",
    type: "number",
    example: 1,
  })
  @ApiParam({
    name: "installmentId",
    description: "ID único da parcela do documento a ser paga",
    type: "number",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Parcela paga com sucesso",
  })
  @Roles(UserRole.ADMIN, UserRole.FINANCIAL)
  async installmentPayment(
    @Param("id", ParseIntPipe) documentId: number,
    @Param("installmentId", ParseIntPipe) installmentId: number,
    @Body() dto: PaymentInstallmentDto,
    @AuthenticatedUser() user: AuthenticatedUserInterface,
  ): Promise<{ message: string }> {
    this.logger.log(
      `Payment request for installment ${installmentId} received for document ${documentId} from user ${user.id}`,
    );

    return await this.documentService.installmentPayment(
      documentId,
      installmentId,
      dto,
      user.id,
    );
  }

  @Get()
  @ApiOperation({
    summary: "Listar documentos",
    description: "Retorna lista de todos os documentos",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de documentos retornada com sucesso",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Documentos recuperados com sucesso.",
        },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number", example: 1 },
              title: {
                type: "string",
                example: "Contrato de Prestação de Serviços",
              },
              description: {
                type: "string",
                example: "Contrato para prestação de serviços",
              },
              fileName: { type: "string", example: "contrato.pdf" },
              fileSize: { type: "number", example: 1024000 },
              status: { type: "string", example: "PENDING" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
              owner: {
                type: "object",
                properties: {
                  id: { type: "number", example: 1 },
                  name: { type: "string", example: "João Silva" },
                  email: { type: "string", example: "joao@empresa.com" },
                },
              },
              signatories: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number", example: 1 },
                    order: { type: "number", example: 1 },
                    notes: { type: "string", example: "Revisar cláusulas" },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "number", example: 2 },
                        name: { type: "string", example: "Maria Santos" },
                        email: { type: "string", example: "maria@empresa.com" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async findAll(@Query() queryDto: DocumentQueryDto) {
    this.logger.log("Fetching all documents");
    return this.documentService.findAll(queryDto);
  }

  @Get("installments")
  @ApiOperation({
    summary:
      "Obter documentos com parcelas vencidas e que irá vencer nos próximos 5 dias.",
    description:
      "Retorna informações dos documentos com parcelas vencidas e que irá vencer nos próximos 5 dias.",
  })
  @ApiResponse({
    status: 200,
    description: "Documentos encontrado com sucesso",
  })
  @Roles(UserRole.ADMIN)
  async findInstallmentsForExpiredAndUpcomingDocuments(): Promise<Document[]> {
    return await this.documentService.findInstallmentsForExpiredAndUpcomingDocuments();
  }

  @Get(":id")
  @ApiOperation({
    summary: "Obter documento",
    description: "Retorna informações de um documento específico",
  })
  @ApiParam({
    name: "id",
    description: "ID único do documento",
    type: "number",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Documento encontrado com sucesso",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Documento encontrado com sucesso.",
        },
        data: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            title: {
              type: "string",
              example: "Contrato de Prestação de Serviços",
            },
            description: {
              type: "string",
              example: "Contrato para prestação de serviços",
            },
            fileName: { type: "string", example: "contrato.pdf" },
            fileSize: { type: "number", example: 1024000 },
            mimeType: { type: "string", example: "application/pdf" },
            status: { type: "string", example: "PENDING" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            owner: {
              type: "object",
              properties: {
                id: { type: "number", example: 1 },
                name: { type: "string", example: "João Silva" },
                email: { type: "string", example: "joao@empresa.com" },
              },
            },
            signatories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number", example: 1 },
                  order: { type: "number", example: 1 },
                  notes: { type: "string", example: "Revisar cláusulas" },
                  user: {
                    type: "object",
                    properties: {
                      id: { type: "number", example: 2 },
                      name: { type: "string", example: "Maria Santos" },
                      email: { type: "string", example: "maria@empresa.com" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    try {
      this.logger.log(`Fetching document with ID: ${id}`);
      const document = await this.documentService.findOne(id);
      if (!document) {
        throw new NotFoundException(`Documento com ID ${id} não encontrado.`);
      }
      return {
        success: true,
        message: "Documento encontrado com sucesso.",
        data: document,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch document ${id}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message:
          error.message || "Erro interno do servidor ao buscar documento.",
        error: error.name || "Internal Server Error",
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Atualizar documento",
    description: "Atualiza informações de um documento existente",
  })
  @ApiParam({
    name: "id",
    description: "ID único do documento a ser atualizado",
    type: "number",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Documento atualizado com sucesso",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Documento atualizado com sucesso.",
        },
        data: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            title: {
              type: "string",
              example: "Contrato de Prestação de Serviços - Versão 2",
            },
            description: {
              type: "string",
              example: "Contrato atualizado com novas cláusulas",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        message: { type: "string", example: "Dados de atualização inválidos." },
        error: { type: "string", example: "Bad Request" },
        statusCode: { type: "number", example: 400 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  @ApiResponse({
    status: 404,
    description: "Documento não encontrado",
  })
  @ApiResponse({
    status: 500,
    description: "Erro interno do servidor",
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    try {
      this.logger.log(`Updating document with ID: ${id}`);
      const updatedDocument = await this.documentService.update(
        id,
        updateDocumentDto,
      );
      return {
        success: true,
        message: "Documento atualizado com sucesso.",
        data: updatedDocument,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update document ${id}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message:
          error.message || "Erro interno do servidor ao atualizar documento.",
        error: error.name || "Internal Server Error",
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Remover documento",
    description: "Remove um documento existente pelo ID",
  })
  @ApiParam({
    name: "id",
    description: "ID único do documento a ser removido",
    type: "number",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Documento removido com sucesso",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Documento removido com sucesso." },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  @ApiResponse({
    status: 404,
    description: "Documento não encontrado",
  })
  @ApiResponse({
    status: 500,
    description: "Erro interno do servidor",
  })
  async remove(@Param("id", ParseIntPipe) id: number) {
    try {
      this.logger.log(`Removing document with ID: ${id}`);
      await this.documentService.remove(id);
      return {
        success: true,
        message: "Documento removido com sucesso.",
      };
    } catch (error) {
      this.logger.error(
        `Failed to remove document ${id}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message:
          error.message || "Erro interno do servidor ao remover documento.",
        error: error.name || "Internal Server Error",
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get(":id/download")
  @ApiOperation({
    summary: "Download de documento",
    description: "Faz o download de um documento PDF específico pelo ID",
  })
  @ApiParam({
    name: "id",
    description: "ID único do documento a ser baixado",
    type: "number",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Download do documento realizado com sucesso",
    content: {
      "application/pdf": {
        schema: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Documento não encontrado",
  })
  @ApiResponse({
    status: 500,
    description: "Erro interno do servidor",
  })
  async downloadDocument(
    @Param("id", ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(`Download request for document ID: ${id}`);
      const fileStream = await this.documentService.getDocumentFile(id);

      if (!fileStream) {
        throw new NotFoundException(`Documento com ID ${id} não encontrado.`);
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="document_${id}.pdf"`,
      );
      fileStream.stream.pipe(res);
    } catch (error) {
      this.logger.error(
        `Failed to download document ${id}: ${error.message}`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: error.message,
          error: "Not Found",
          statusCode: HttpStatus.NOT_FOUND,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message:
            error.message || "Erro interno do servidor ao baixar documento.",
          error: "Internal Server Error",
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }
  @Get(":id/signatories")
  @ApiOperation({
    summary: "Listar signatários de um documento",
    description: "Retorna a lista de signatários para um documento específico",
  })
  @ApiParam({
    name: "id",
    description: "ID único do documento",
    type: "number",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Signatários recuperados com sucesso",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Signatários recuperados com sucesso.",
        },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number", example: 1 },
              order: { type: "number", example: 0 },
              status: { type: "string", example: "PENDING" },
              signedAt: { type: "string", format: "date-time", nullable: true },
              user: {
                type: "object",
                properties: {
                  id: { type: "number", example: 1 },
                  name: { type: "string", example: "Nome do Signatário" },
                  email: { type: "string", example: "signatario@example.com" },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Documento não encontrado",
  })
  async findSignatories(@Param("id", ParseIntPipe) id: number) {
    try {
      this.logger.log(`Fetching signatories for document ID: ${id}`);
      const signatories =
        await this.documentService.findSignatoriesByDocumentId(id);
      return {
        success: true,
        message: "Signatários recuperados com sucesso.",
        data: signatories,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch signatories for document ${id}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message:
          error.message || "Erro interno do servidor ao buscar signatários.",
        error: error.name || "Internal Server Error",
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
