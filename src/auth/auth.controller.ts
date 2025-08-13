import { Controller, Request, Post, UseGuards, Body, HttpCode, HttpStatus, Get } from '@nestjs/common'; // Import Get
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserPublicProfile, UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes } from "@nestjs/swagger";

// JwtAuthGuard is applied globally, no need to import/use it here unless overriding

@Controller('api/auth')
@ApiTags('Autenticação')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @Public() // Login endpoint is public
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
    @ApiOperation({
            summary: 'Realizar login',
            description: 'Autentica um usuário e retorna tokens de acesso'
          })
    @ApiBody({
                type: LoginDto,
                description: 'Dados de login do usuário',
                examples: {
                  example1: {
                    summary: 'Exemplo de requisição',
                    value: {
      "email": "usuario@exemplo.com",
      "password": "MinhaSenh@123"
    }
                  }
                }
              })
    @ApiResponse({
              status: 201,
              description: 'Recurso criado com sucesso',
              
              example: {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "email": "usuario@exemplo.com",
        "name": "João Silva",
        "role": "USER"
      }
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
  async login(@Request() req: { user: UserPublicProfile }, @Body() loginDto: LoginDto) {
    // req.user is populated by LocalStrategy
    return this.authService.login(req.user);
  }

  @Public() // Registration endpoint is public
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
            summary: 'Registrar usuário',
            description: 'Cria uma nova conta de usuário no sistema'
          })
    @ApiBody({
                type: CreateUserDto,
                description: 'Dados para criação de novo usuário',
                examples: {
                  example1: {
                    summary: 'Exemplo de requisição',
                    value: {
      "email": "novo@exemplo.com",
      "password": "MinhaSenh@123",
      "name": "Novo Usuário",
      "sectorId": 1
    }
                  }
                }
              })
    @ApiResponse({
              status: 201,
              description: 'Recurso criado com sucesso',
              
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
  async register(@Body() createUserDto: CreateUserDto): Promise<UserPublicProfile> {
    return this.userService.create(createUserDto);
  }

  @Public() // Refresh endpoint is public
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
    @ApiOperation({
            summary: 'Renovar token',
            description: 'Renova o token de acesso usando o refresh token'
          })
    @ApiBody({
                type: RefreshTokenDto,
                description: 'Token de renovação',
                examples: {
                  example1: {
                    summary: 'Exemplo de requisição',
                    value: {
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
                  }
                }
              })
    @ApiResponse({
              status: 201,
              description: 'Recurso criado com sucesso',
              
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
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  // Protected route to get the profile of the currently logged-in user
  // JwtAuthGuard is applied globally, so this route is protected by default
  @Get('profile')
    @ApiOperation({
            summary: 'Obter perfil',
            description: 'Retorna informações do perfil do usuário logado'
          })
    @ApiBearerAuth()
    @ApiResponse({
              status: 200,
              description: 'Operação realizada com sucesso',
              
              example: {
      "id": 1,
      "email": "usuario@exemplo.com",
      "name": "João Silva",
      "role": "USER",
      "isActive": true,
      "sector": {
        "id": 1,
        "name": "Recursos Humanos"
      }
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
  getProfile(@Request() req: { user: UserPublicProfile }) {
    // req.user is populated by JwtStrategy's validate method
    return req.user;
  }

  // Example: Endpoint to explicitly revoke tokens (logout)
  // This would require the user to be authenticated with an access token
  // @Post('logout')
  // @HttpCode(HttpStatus.OK)
  // async logout(@Request() req: { user: UserPublicProfile }) {
  //   await this.authService.revokeRefreshTokenForUser(req.user.id);
  //   return { message: 'Logout successful' };
  // }
}

