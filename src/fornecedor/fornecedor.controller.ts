import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { FornecedorService } from './fornecedor.service';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';
import { Fornecedor } from './fornecedor.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from "@nestjs/swagger";

@Controller('api/fornecedores')
@ApiTags('Fornecedores')
export class FornecedorController {
  constructor(private readonly fornecedorService: FornecedorService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar fornecedor',
    description: 'Cria um novo fornecedor no sistema'
  })
  @ApiBearerAuth()
  @ApiBody({
    type: CreateFornecedorDto,
    description: 'Dados para criação do fornecedor',
    examples: {
      example1: {
        summary: 'Exemplo de requisição',
        value: {
          "codigo": "FORN001",
          "cnpj": "12345678000195",
          "razaoSocial": "Empresa Fornecedora LTDA",
          "nomeFantasia": "Fornecedora Express"
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Fornecedor criado com sucesso',
    example: {
      "id": 1,
      "codigo": "FORN001",
      "cnpj": "12345678000195",
      "razaoSocial": "Empresa Fornecedora LTDA",
      "nomeFantasia": "Fornecedora Express",
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
        "O código do fornecedor não pode estar vazio.",
        "O CNPJ deve ter exatamente 14 dígitos."
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
    status: 500,
    description: 'Erro interno do servidor',
    example: {
      "statusCode": 500,
      "message": "Internal server error",
      "error": "Internal Server Error"
    }
  })
  create(@Body() createFornecedorDto: CreateFornecedorDto): Promise<Fornecedor> {
    return this.fornecedorService.create(createFornecedorDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar fornecedores',
    description: 'Retorna lista de todos os fornecedores'
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Lista de fornecedores retornada com sucesso',
    example: [
      {
        "id": 1,
        "codigo": "FORN001",
        "cnpj": "12345678000195",
        "razaoSocial": "Empresa Fornecedora LTDA",
        "nomeFantasia": "Fornecedora Express",
        "createdAt": "2024-07-25T10:30:00Z",
        "updatedAt": "2024-07-25T10:30:00Z"
      }
    ]
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
    status: 500,
    description: 'Erro interno do servidor',
    example: {
      "statusCode": 500,
      "message": "Internal server error",
      "error": "Internal Server Error"
    }
  })
  findAll(): Promise<Fornecedor[]> {
    return this.fornecedorService.findAll();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar fornecedores',
    description: 'Busca fornecedores por código, CNPJ, razão social ou nome fantasia'
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Fornecedores encontrados com sucesso',
    example: [
      {
        "id": 1,
        "codigo": "FORN001",
        "cnpj": "12345678000195",
        "razaoSocial": "Empresa Fornecedora LTDA",
        "nomeFantasia": "Fornecedora Express",
        "createdAt": "2024-07-25T10:30:00Z",
        "updatedAt": "2024-07-25T10:30:00Z"
      }
    ]
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
    status: 500,
    description: 'Erro interno do servidor',
    example: {
      "statusCode": 500,
      "message": "Internal server error",
      "error": "Internal Server Error"
    }
  })
  search(@Query('q') query: string): Promise<Fornecedor[]> {
    return this.fornecedorService.search(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter fornecedor',
    description: 'Retorna informações de um fornecedor específico'
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'ID único do fornecedor',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Fornecedor encontrado com sucesso',
    example: {
      "id": 1,
      "codigo": "FORN001",
      "cnpj": "12345678000195",
      "razaoSocial": "Empresa Fornecedora LTDA",
      "nomeFantasia": "Fornecedora Express",
      "createdAt": "2024-07-25T10:30:00Z",
      "updatedAt": "2024-07-25T10:30:00Z"
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
    description: 'Fornecedor não encontrado',
    example: {
      "statusCode": 404,
      "message": "Fornecedor com ID 1 não encontrado.",
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
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Fornecedor> {
    return this.fornecedorService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true }))
  @ApiOperation({
    summary: 'Atualizar fornecedor',
    description: 'Atualiza informações de um fornecedor'
  })
  @ApiBearerAuth()
  @ApiBody({
    type: UpdateFornecedorDto,
    description: 'Dados para atualização do fornecedor',
    examples: {
      example1: {
        summary: 'Exemplo de requisição',
        value: {
          "razaoSocial": "Nova Razão Social LTDA",
          "nomeFantasia": "Novo Nome Fantasia"
        }
      }
    }
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do fornecedor',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Fornecedor atualizado com sucesso',
    example: {
      "id": 1,
      "codigo": "FORN001",
      "cnpj": "12345678000195",
      "razaoSocial": "Nova Razão Social LTDA",
      "nomeFantasia": "Novo Nome Fantasia",
      "createdAt": "2024-07-25T10:30:00Z",
      "updatedAt": "2024-07-25T10:35:00Z"
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos na requisição',
    example: {
      "statusCode": 400,
      "message": [
        "O CNPJ deve ter exatamente 14 dígitos."
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
    description: 'Fornecedor não encontrado',
    example: {
      "statusCode": 404,
      "message": "Fornecedor com ID 1 não encontrado.",
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
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFornecedorDto: UpdateFornecedorDto): Promise<Fornecedor> {
    return this.fornecedorService.update(id, updateFornecedorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover fornecedor',
    description: 'Remove um fornecedor do sistema'
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'ID único do fornecedor',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 204,
    description: 'Fornecedor removido com sucesso'
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
    description: 'Fornecedor não encontrado',
    example: {
      "statusCode": 404,
      "message": "Fornecedor com ID 1 não encontrado.",
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
    return this.fornecedorService.remove(id);
  }
}