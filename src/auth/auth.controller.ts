import {
  Controller,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Request,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { LoginDto } from "./dto/login.dto";
import { Public } from "./decorators/public.decorator";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { UserService } from "../user/user.service";
import { CreateUserDto } from "../user/dto/create-user.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthenticatedUser } from "../common/decorators/authenticated-user.decorator";
import { ApiResponseDto } from "../common/dto/api-response.dto";
import { UserPublicProfile } from "src/user/interfaces";
import { AuthenticatedUser as AuthenticatedUserInterface } from "src/common/interfaces/authenticated-user.interface";

@Controller("api/auth")
@ApiTags("Autenticação")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Realizar login",
    description: "Autentica um usuário e retorna tokens de acesso",
  })
  @ApiBody({
    type: LoginDto,
    description: "Dados de login do usuário",
    examples: {
      example1: {
        summary: "Exemplo de requisição",
        value: {
          email: "usuario@exemplo.com",
          password: "MinhaSenh@123",
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Login realizado com sucesso",
    schema: {
      example: {
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        user: {
          id: 1,
          email: "usuario@exemplo.com",
          name: "João Silva",
          role: "USER",
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Credenciais inválidas",
    type: ApiResponseDto,
  })
  async login(
    @AuthenticatedUser() user: AuthenticatedUserInterface,
    @Body() _loginDto: LoginDto, // Mantido apenas para documentação do Swagger
  ) {
    return this.authService.login(user);
  }

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Registrar usuário",
    description: "Cria uma nova conta de usuário no sistema",
  })
  @ApiBody({
    type: CreateUserDto,
    description: "Dados para criação de novo usuário",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Usuário registrado com sucesso",
    schema: {
      example: {
        id: 1,
        name: "Novo Usuário",
        email: "novo@exemplo.com",
        role: "USER",
        sector: {
          id: 1,
          name: "Recursos Humanos",
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Dados inválidos na requisição",
    type: ApiResponseDto,
  })
  async register(
    @Body() createUserDto: CreateUserDto,
    @Request() req: any,
  ): Promise<UserPublicProfile> {
    return this.userService.create(createUserDto, req.user.id);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Renovar token",
    description: "Renova o token de acesso usando o refresh token",
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: "Token de renovação",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Token renovado com sucesso",
    schema: {
      example: {
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Token inválido ou expirado",
    type: ApiResponseDto,
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Get("profile")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Obter perfil",
    description: "Retorna informações do perfil do usuário logado",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Perfil do usuário",
    schema: {
      example: {
        id: 1,
        email: "usuario@exemplo.com",
        name: "João Silva",
        role: "USER",
        sector: {
          id: 1,
          name: "Recursos Humanos",
        },
      },
    },
  })
  getProfile(@AuthenticatedUser() user: AuthenticatedUserInterface) {
    return user;
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Encerrar sessão",
    description: "Revoga o refresh token do usuário",
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: "Token de renovação a ser revogado",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Logout realizado com sucesso",
    schema: {
      example: {
        message: "Logout realizado com sucesso",
      },
    },
  })
  async logout(
    @AuthenticatedUser() user: AuthenticatedUserInterface,
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    await this.authService.revokeRefreshToken(refreshTokenDto.refresh_token);
    return { message: "Logout realizado com sucesso" };
  }
}
