
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  UseGuards,
  Request,
  Res,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { Document } from './document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as path from 'path';

@ApiTags('documents')
@Controller('api/documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentController {
  private readonly logger = new Logger(DocumentController.name);

  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload de documento',
    description: 'Faz upload de um documento PDF e cria registros de signatários'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Dados do documento e arquivo PDF',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF do documento'
        },
        title: {
          type: 'string',
          example: 'Contrato de Prestação de Serviços - Empresa XYZ',
          description: 'Título do documento'
        },
        description: {
          type: 'string',
          example: 'Contrato para prestação de serviços de consultoria em tecnologia da informação',
          description: 'Descrição detalhada do documento'
        },
        fornecedorId: {
          type: 'number',
          example: 1,
          description: 'ID do fornecedor associado ao documento'
        },
        tipoDocumento: {
          type: 'string',
          enum: ['CONTRACT', 'INVOICE', 'SERVICE_ORDER', 'PURCHASE_ORDER', 'AGREEMENT', 'PROPOSAL', 'REPORT', 'OTHER'],
          example: 'CONTRACT',
          description: 'Tipo do documento'
        },
        natureza: {
          type: 'string',
          example: 'Despesa operacional',
          description: 'Natureza do documento'
        },
        valor: {
          type: 'number',
          example: 15000.50,
          description: 'Valor monetário do documento'
        },
        dataVencimento: {
          type: 'string',
          format: 'date',
          example: '2024-12-31',
          description: 'Data de vencimento do documento'
        },
        signatories: {
          type: 'string',
          example: '[{"userId": 1, "order": 1, "notes": "Revisar cláusulas contratuais"}, {"userId": 2, "order": 2, "notes": "Aprovação final"}]',
          description: 'JSON string com array de signatários'
        },
        observacoes: {
          type: 'string',
          example: 'Documento requer aprovação do diretor financeiro antes da assinatura final',
          description: 'Observações adicionais sobre o documento'
        },
        installments: {
          type: 'string',
          example: '[{"installmentNumber": 1, "amount": 7500.00, "dueDate": "2024-12-31", "description": "Primeira parcela"}, {"installmentNumber": 2, "amount": 7500.00, "dueDate": "2025-01-31", "description": "Segunda parcela"}]',
          description: 'JSON string com array de parcelas (obrigatório)'
        },
        rateio: {
          type: 'string',
          example: '[{"id": "1754870720899", "filial": "Matriz Juazeiro", "centroCusto": "TI", "valor": 5, "percentual": 50}, {"id": "1754870726731", "filial": "Filial Petrolina Maquinas", "centroCusto": "TI", "valor": 5, "percentual": 50}]',
          description: 'JSON string com array de rateio (obrigatório)'
        }
      },
      required: ['file', 'title', 'signatories', 'installments', 'natureza', 'rateio']
    }
  })
  @ApiResponse({
            status: 201,
            description: 'Recurso criado com sucesso',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Documento enviado com sucesso.' },
                data: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 1 },
                    title: { type: 'string', example: 'Contrato de Prestação de Serviços - Empresa XYZ' },
                    description: { type: 'string', example: 'Contrato para prestação de serviços de consultoria' },
                    fileName: { type: 'string', example: 'contrato.pdf' },
                    fileSize: { type: 'number', example: 1024000 },
                    mimeType: { type: 'string', example: 'application/pdf' },
                    status: { type: 'string', example: 'PENDING' },
                    createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
                    updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
                  }
                }
              }
            }
          })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Arquivo é obrigatório.' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Token de acesso inválido ou expirado.' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Erro interno do servidor ao fazer upload do documento.' },
        error: { type: 'string', example: 'Internal Server Error' },
        statusCode: { type: 'number', example: 500 }
      }
    }
  })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req: any,
  ) {
    try {
      this.logger.log(`Upload request received from user ${req.user.userId}`);

      // Parse signatories JSON
      let signatories = [];
      if (body.signatories) {
        try {
          signatories = JSON.parse(body.signatories);
        } catch (error) {
          this.logger.error('Invalid signatories JSON format');
          return {
            success: false,
            message: 'Formato inválido para signatários. Deve ser um JSON válido.',
            error: 'Bad Request',
            statusCode: HttpStatus.BAD_REQUEST
          };
        }
      }

      // Parse installments JSON
      let installments = [];
      if (body.installments) {
        try {
          installments = JSON.parse(body.installments);
        } catch (error) {
          this.logger.error('Invalid installments JSON format');
          return {
            success: false,
            message: 'Formato inválido para parcelas. Deve ser um JSON válido.',
            error: 'Bad Request',
            statusCode: HttpStatus.BAD_REQUEST
          };
        }
      } else {
        return {
          success: false,
          message: 'O campo installments é obrigatório.',
          error: 'Bad Request',
          statusCode: HttpStatus.BAD_REQUEST
        };
      }

      // Parse rateio JSON
      let rateio = [];
      if (body.rateio) {
        try {
          rateio = JSON.parse(body.rateio);
        } catch (error) {
          this.logger.error('Invalid rateio JSON format');
          return {
            success: false,
            message: 'Formato inválido para rateio. Deve ser um JSON válido.',
            error: 'Bad Request',
            statusCode: HttpStatus.BAD_REQUEST
          };
        }
      } else {
        return {
          success: false,
          message: 'O campo rateio é obrigatório.',
          error: 'Bad Request',
          statusCode: HttpStatus.BAD_REQUEST
        };
      }

      const uploadDto: CreateDocumentDto = {
        title: body.title,
        description: body.description,
        signatories: signatories,
        installments: installments,
        natureza: body.natureza,
        rateio: rateio,
        fornecedorId: body.fornecedorId ? parseInt(body.fornecedorId) : undefined,
        tipoDocumento: body.tipoDocumento,
        valor: body.valor ? parseFloat(body.valor) : undefined,
        dataVencimento: body.dataVencimento,
        observacoes: body.observacoes,
      };

      const document = await this.documentService.uploadDocument(
        file,
        uploadDto,
        req.user.userId,
      );

      this.logger.log(`Document uploaded successfully with ID: ${document.id}`);

      return {
        success: true,
        message: 'Documento enviado com sucesso.',
        data: {
          id: document.id,
          title: document.title,
          description: document.description,
          fileName: document.fileName,
          fileSize: document.fileSize,
          mimeType: document.mimeType,
          status: document.status,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`, error.stack);
      
      return {
        success: false,
        message: error.message || 'Erro interno do servidor ao fazer upload do documento.',
        error: error.name || 'Internal Server Error',
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  @Post(':id/sign')
  @ApiOperation({
    summary: 'Assinar documento',
    description: 'Permite que um signatário assine um documento específico.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do documento a ser assinado',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Documento assinado com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Documento assinado com sucesso.' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            status: { type: 'string', example: 'SIGNED' },
            signedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Não é sua vez de assinar ou documento já assinado.' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Token de acesso inválido ou expirado.' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Documento ou signatário não encontrado',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Documento ou signatário não encontrado.' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Erro interno do servidor ao assinar documento.' },
        error: { type: 'string', example: 'Internal Server Error' },
        statusCode: { type: 'number', example: 500 }
      }
    }
  })
  async signDocument(@Param('id', ParseIntPipe) documentId: number, @Request() req: any) {
    try {
      this.logger.log(`Sign request received for document ${documentId} from user ${req.user.sub}`);
      const signedDocument = await this.documentService.signDocument(documentId, req.user.sub);
      return {
        success: true,
        message: 'Documento assinado com sucesso.',
        data: {
          id: signedDocument.id,
          status: signedDocument.status,
          signedAt: signedDocument.signedAt,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to sign document ${documentId}: ${error.message}`, error.stack);
      return {
        success: false,
        message: error.message || 'Erro interno do servidor ao assinar documento.',
        error: error.name || 'Internal Server Error',
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Listar documentos',
    description: 'Retorna lista de todos os documentos'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de documentos retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Documentos recuperados com sucesso.' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              title: { type: 'string', example: 'Contrato de Prestação de Serviços' },
              description: { type: 'string', example: 'Contrato para prestação de serviços' },
              fileName: { type: 'string', example: 'contrato.pdf' },
              fileSize: { type: 'number', example: 1024000 },
              status: { type: 'string', example: 'PENDING' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              owner: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'João Silva' },
                  email: { type: 'string', example: 'joao@empresa.com' }
                }
              },
              signatories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 1 },
                    order: { type: 'number', example: 1 },
                    notes: { type: 'string', example: 'Revisar cláusulas' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'number', example: 2 },
                        name: { type: 'string', example: 'Maria Santos' },
                        email: { type: 'string', example: 'maria@empresa.com' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  async findAll() {
    try {
      this.logger.log('Fetching all documents');
      const documents = await this.documentService.findAll();
      
      return {
        success: true,
        message: 'Documentos recuperados com sucesso.',
        data: documents,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch documents: ${error.message}`, error.stack);
      
      return {
        success: false,
        message: error.message || 'Erro interno do servidor ao buscar documentos.',
        error: error.name || 'Internal Server Error',
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter documento',
    description: 'Retorna informações de um documento específico'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do documento',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Documento encontrado com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Documento encontrado com sucesso.' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            title: { type: 'string', example: 'Contrato de Prestação de Serviços' },
            description: { type: 'string', example: 'Contrato para prestação de serviços' },
            fileName: { type: 'string', example: 'contrato.pdf' },
            fileSize: { type: 'number', example: 1024000 },
            mimeType: { type: 'string', example: 'application/pdf' },
            status: { type: 'string', example: 'PENDING' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            owner: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'João Silva' },
                email: { type: 'string', example: 'joao@empresa.com' }
              }
            },
            signatories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  order: { type: 'number', example: 1 },
                  notes: { type: 'string', example: 'Revisar cláusulas' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 2 },
                      name: { type: 'string', example: 'Maria Santos' },
                      email: { type: 'string', example: 'maria@empresa.com' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      this.logger.log(`Fetching document with ID: ${id}`);
      const document = await this.documentService.findOne(id);
      if (!document) {
        throw new NotFoundException(`Documento com ID ${id} não encontrado.`);
      }
      return {
        success: true,
        message: 'Documento encontrado com sucesso.',
        data: document,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch document ${id}: ${error.message}`, error.stack);
      return {
        success: false,
        message: error.message || 'Erro interno do servidor ao buscar documento.',
        error: error.name || 'Internal Server Error',
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar documento',
    description: 'Atualiza informações de um documento existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do documento a ser atualizado',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Documento atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Documento atualizado com sucesso.' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            title: { type: 'string', example: 'Contrato de Prestação de Serviços - Versão 2' },
            description: { type: 'string', example: 'Contrato atualizado com novas cláusulas' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Dados de atualização inválidos.' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado'
  })
  @ApiResponse({
    status: 404,
    description: 'Documento não encontrado'
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    try {
      this.logger.log(`Updating document with ID: ${id}`);
      const updatedDocument = await this.documentService.update(id, updateDocumentDto);
      return {
        success: true,
        message: 'Documento atualizado com sucesso.',
        data: updatedDocument,
      };
    } catch (error) {
      this.logger.error(`Failed to update document ${id}: ${error.message}`, error.stack);
      return {
        success: false,
        message: error.message || 'Erro interno do servidor ao atualizar documento.',
        error: error.name || 'Internal Server Error',
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover documento',
    description: 'Remove um documento existente pelo ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do documento a ser removido',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Documento removido com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Documento removido com sucesso.' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado'
  })
  @ApiResponse({
    status: 404,
    description: 'Documento não encontrado'
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor'
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      this.logger.log(`Removing document with ID: ${id}`);
      await this.documentService.remove(id);
      return {
        success: true,
        message: 'Documento removido com sucesso.',
      };
    } catch (error) {
      this.logger.error(`Failed to remove document ${id}: ${error.message}`, error.stack);
      return {
        success: false,
        message: error.message || 'Erro interno do servidor ao remover documento.',
        error: error.name || 'Internal Server Error',
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Download de documento',
    description: 'Faz o download de um documento PDF específico pelo ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do documento a ser baixado',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Download do documento realizado com sucesso',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Documento não encontrado'
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor'
  })
  async downloadDocument(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    try {
      this.logger.log(`Download request for document ID: ${id}`);
      const fileStream = await this.documentService.getDocumentFile(id);

      if (!fileStream) {
        throw new NotFoundException(`Documento com ID ${id} não encontrado.`);
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="document_${id}.pdf"`);
      fileStream.stream.pipe(res);
    } catch (error) {
      this.logger.error(`Failed to download document ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: error.message,
          error: 'Not Found',
          statusCode: HttpStatus.NOT_FOUND
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: error.message || 'Erro interno do servidor ao baixar documento.',
          error: 'Internal Server Error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        });
      }
    }
  }
  @Get(':id/signatories')
  @ApiOperation({
    summary: 'Listar signatários de um documento',
    description: 'Retorna a lista de signatários para um documento específico'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do documento',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Signatários recuperados com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Signatários recuperados com sucesso.' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              order: { type: 'number', example: 0 },
              status: { type: 'string', example: 'PENDING' },
              signedAt: { type: 'string', format: 'date-time', nullable: true },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Nome do Signatário' },
                  email: { type: 'string', example: 'signatario@example.com' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Documento não encontrado'
  })
  async findSignatories(@Param('id', ParseIntPipe) id: number) {
    try {
      this.logger.log(`Fetching signatories for document ID: ${id}`);
      const signatories = await this.documentService.findSignatoriesByDocumentId(id);
      return {
        success: true,
        message: 'Signatários recuperados com sucesso.',
        data: signatories,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch signatories for document ${id}: ${error.message}`, error.stack);
      return {
        success: false,
        message: error.message || 'Erro interno do servidor ao buscar signatários.',
        error: error.name || 'Internal Server Error',
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }
}


