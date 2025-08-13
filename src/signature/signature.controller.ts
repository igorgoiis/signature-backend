import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SignatureService } from './signature.service';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Adjust path if needed
import { Signature } from './signature.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes } from "@nestjs/swagger";

@Controller('api/signatures')
@UseGuards(JwtAuthGuard)
@ApiTags('Assinaturas') // Protect all routes in this controller
export class SignatureController {
  private readonly logger = new Logger(SignatureController.name);

  constructor(private readonly signatureService: SignatureService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
            summary: 'Criar usuário',
            description: 'Cria um novo usuário no sistema (apenas administradores)'
          })
    @ApiBearerAuth()
    @ApiBody({
                type: CreateSignatureDto,
                description: 'Dados para criação',
                examples: {
                  example1: {
                    summary: 'Exemplo de requisição',
                    value: {}
                  }
                }
              })
    @ApiResponse({
              status: 201,
              description: 'Recurso criado com sucesso',
              
              example: {
      "id": 1,
      "name": "Exemplo",
      "createdAt": "2024-07-25T10:30:00Z",
      "updatedAt": "2024-07-25T10:30:00Z"
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
  async create(
    @Body() createSignatureDto: CreateSignatureDto,
    @Request() req: any, // Get user from request
  ): Promise<Signature> {
    const userId = req.user.userId; // Extract user ID from JWT payload
    this.logger.log(
      `User ID ${userId} submitting signature for document ID: ${createSignatureDto.documentId}`,
    );
    return this.signatureService.create(createSignatureDto, userId);
  }

  // Add other endpoints if needed (e.g., GET signatures for a document)
}

