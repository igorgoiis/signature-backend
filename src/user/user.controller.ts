import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  UseGuards,
  Query,
  ParseBoolPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, UpdateUserDto } from "./dto";
import { UserPublicProfile } from "./interfaces/user.interface";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "./enums/user-role.enum";
import { RolesGuard } from "../auth/guards/roles.guard";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { User } from "./entities";
import { AuthenticatedUser } from "src/common/decorators/authenticated-user.decorator";
import { AuthenticatedUser as AuthenticatedUserInterface } from "src/common/interfaces/authenticated-user.interface";

@Controller("api/users")
@ApiTags("Usuários")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Criar usuário",
    description: "Cria um novo usuário no sistema (apenas administradores)",
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: "Usuário criado com sucesso",
  })
  @ApiResponse({ status: 400, description: "Dados inválidos na requisição" })
  @ApiResponse({ status: 401, description: "Não autorizado" })
  create(
    @AuthenticatedUser() user: AuthenticatedUserInterface,
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserPublicProfile> {
    return this.userService.create(createUserDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: "Listar usuários",
    description: "Retorna lista de todos os usuários",
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: "includeDeleted",
    type: Boolean,
    required: false,
    description: "Incluir usuários deletados na resposta",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de usuários retornada com sucesso",
  })
  findAll(
    @Query("includeDeleted", ParseBoolPipe) includeDeleted?: boolean,
  ): Promise<User[]> {
    return this.userService.findAll(includeDeleted);
  }

  @Get("search")
  @ApiOperation({
    summary: "Buscar usuários",
    description: "Busca usuários por nome ou email",
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: "q",
    description: "Termo de busca",
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Busca realizada com sucesso",
  })
  searchUsers(@Query("q") query: string): Promise<UserPublicProfile[]> {
    return this.userService.searchUsers(query);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Obter usuário",
    description: "Retorna informações de um usuário específico",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "id",
    description: "ID do usuário",
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Usuário encontrado",
  })
  @ApiResponse({
    status: 404,
    description: "Usuário não encontrado",
  })
  findOne(@Param("id", ParseIntPipe) id: number): Promise<UserPublicProfile> {
    return this.userService.findOne(id);
  }

  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Atualizar usuário",
    description: "Atualiza informações de um usuário (apenas administradores)",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "id",
    description: "ID do usuário",
    type: "number",
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: "Usuário atualizado com sucesso",
  })
  @ApiResponse({
    status: 404,
    description: "Usuário não encontrado",
  })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @AuthenticatedUser() user: AuthenticatedUserInterface,
  ): Promise<UserPublicProfile> {
    return this.userService.update(id, updateUserDto, user.id);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Remover usuário",
    description: "Remove um usuário do sistema (apenas administradores)",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "id",
    description: "ID do usuário",
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Usuário removido com sucesso",
  })
  @ApiResponse({
    status: 404,
    description: "Usuário não encontrado",
  })
  remove(
    @Param("id", ParseIntPipe) id: number,
    @AuthenticatedUser() user: AuthenticatedUserInterface,
  ): Promise<void> {
    return this.userService.remove(id, user.id);
  }

  @Post(":id/restore")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Restaurar usuário",
    description:
      "Restaura um usuário previamente deletado (apenas administradores)",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "id",
    description: "ID do usuário",
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Usuário restaurado com sucesso",
  })
  @ApiResponse({
    status: 404,
    description: "Usuário não encontrado",
  })
  restore(
    @AuthenticatedUser() user: AuthenticatedUserInterface,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<User> {
    return this.userService.restore(id, user.id);
  }
}
