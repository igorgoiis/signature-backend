import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe, UseGuards, Query } from '@nestjs/common'; // Import UseGuards
import { UserService, UserPublicProfile } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator'; // Import Roles decorator
import { UserRole } from './user.entity'; // Import UserRole enum
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes } from "@nestjs/swagger";

@Controller('api/users')
@ApiTags('Usuários')
// Apply RolesGuard to the entire controller or specific routes
// Note: JwtAuthGuard is already applied globally via AppModule
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(RolesGuard) // Apply RolesGuard
  @Roles(UserRole.ADMIN)
    @ApiOperation({
            summary: 'Criar usuário',
            description: 'Cria um novo usuário no sistema (apenas administradores)'
          })
    @ApiBearerAuth()
    @ApiBody({
                type: CreateUserDto,
                description: 'Dados para criação',
                examples: {
                  example1: {
                    summary: 'Exemplo de requisição',
                    value: {
      "email": "usuario@exemplo.com",
      "name": "João Silva",
      "password": "MinhaSenh@123",
      "role": "USER",
      "sectorId": 1
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
            }) // Only ADMIN can create users
  create(@Body() createUserDto: CreateUserDto): Promise<UserPublicProfile> {
    return this.userService.create(createUserDto);
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
  // No specific role needed, any authenticated user can list users (due to global JwtAuthGuard)
  // If only ADMIN should list all users, add @UseGuards(RolesGuard) and @Roles(UserRole.ADMIN)
  findAll(): Promise<UserPublicProfile[]> {
    return this.userService.findAll();
  }
  //adicionado metodo search
  @Get('search')
    @ApiOperation({
            summary: 'GET searchUsers',
            description: 'Endpoint GET para searchUsers'
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
  searchUsers(@Query('q') query: string): Promise<UserPublicProfile[]> {
  return this.userService.searchUsers(query);
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
  // No specific role needed, any authenticated user can view a user profile
  // If only ADMIN or the user themselves should view, more complex logic/guard needed
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserPublicProfile> {
    return this.userService.findOne(id);
  }
  
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
    @ApiOperation({
            summary: 'Atualizar usuário',
            description: 'Atualiza informações de um usuário (apenas administradores)'
          })
    @ApiBearerAuth()
    @ApiBody({
                type: UpdateUserDto,
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
            }) // Only ADMIN can update users (for now)
  // If users should update themselves, a different logic/guard is needed
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<UserPublicProfile> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
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
            }) // Only ADMIN can delete users
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }
}

