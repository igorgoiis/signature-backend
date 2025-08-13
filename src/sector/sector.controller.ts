import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { SectorService } from './sector.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { Sector } from './sector.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes } from "@nestjs/swagger";

@Controller('api/sectors')
@ApiTags('Setores') // Ajustado para /api/sectors para corresponder ao frontend
export class SectorController {
  constructor(private readonly sectorService: SectorService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
            summary: 'Criar usuário',
            description: 'Cria um novo usuário no sistema (apenas administradores)'
          })
    @ApiBearerAuth()
    @ApiBody({
                type: CreateSectorDto,
                description: 'Dados para criação',
                examples: {
                  example1: {
                    summary: 'Exemplo de requisição',
                    value: {
      "name": "Recursos Humanos",
      "code": "RH"
    }
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
  create(@Body() createSectorDto: CreateSectorDto): Promise<Sector> {
    return this.sectorService.create(createSectorDto);
  }

  @Get()
    @ApiOperation({
            summary: 'Listar usuários',
            description: 'Retorna lista paginada de usuários'
          })
    @ApiBearerAuth()
    @ApiQuery({
              name: 'page',
              description: 'Número da página',
              required: false,
              type: 'number',
              example: 1
            })
    @ApiQuery({
              name: 'limit',
              description: 'Itens por página',
              required: false,
              type: 'number',
              example: 10
            })
    @ApiResponse({
              status: 200,
              description: 'Operação realizada com sucesso',
              
              example: {
      "data": [
        {
          "id": 1,
          "name": "João Silva",
          "email": "joao@exemplo.com",
          "role": "USER",
          "isActive": true
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 10
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
  findAll(): Promise<Sector[]> {
    return this.sectorService.findAll();
  }

  @Get(':id')
    @ApiOperation({
            summary: 'Obter usuário',
            description: 'Retorna informações de um usuário específico'
          })
    @ApiBearerAuth()
    @ApiParam({
              name: 'id',
              description: 'ID único do recurso',
              type: 'number',
              example: 1
            })
    @ApiResponse({
              status: 200,
              description: 'Operação realizada com sucesso',
              
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
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Sector> {
    return this.sectorService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true }))
    @ApiOperation({
            summary: 'Atualizar usuário',
            description: 'Atualiza informações de um usuário (apenas administradores)'
          })
    @ApiBearerAuth()
    @ApiBody({
                type: UpdateSectorDto,
                description: 'Dados para atualização',
                examples: {
                  example1: {
                    summary: 'Exemplo de requisição',
                    value: {
      "name": "Nome Atualizado",
      "isActive": true
    }
                  }
                }
              })
    @ApiParam({
              name: 'id',
              description: 'ID único do recurso',
              type: 'number',
              example: 1
            })
    @ApiResponse({
              status: 200,
              description: 'Recurso atualizado com sucesso',
              
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
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSectorDto: UpdateSectorDto): Promise<Sector> {
    return this.sectorService.update(id, updateSectorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
            summary: 'Remover usuário',
            description: 'Remove um usuário do sistema (apenas administradores)'
          })
    @ApiBearerAuth()
    @ApiParam({
              name: 'id',
              description: 'ID único do recurso',
              type: 'number',
              example: 1
            })
    @ApiResponse({
              status: 200,
              description: 'Recurso removido com sucesso',
              
              example: {
      "message": "Recurso removido com sucesso"
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
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sectorService.remove(id);
  }
}

