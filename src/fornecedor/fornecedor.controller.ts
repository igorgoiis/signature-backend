import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from "@nestjs/common";
import { FornecedorService } from "./fornecedor.service";
import { CreateFornecedorDto, UpdateFornecedorDto } from "./dto";
import { Fornecedor } from "./entities";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { PaginatedResponse } from "src/common/interfaces/paginated-response.interface";
import { FornecedorResponse, FornecedorSearchParams } from "./interfaces";

@Controller("api/fornecedores")
@ApiTags("Fornecedores")
export class FornecedorController {
  constructor(private readonly fornecedorService: FornecedorService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Criar fornecedor",
    description: "Cria um novo fornecedor no sistema",
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateFornecedorDto })
  @ApiResponse({
    status: 201,
    description: "Fornecedor criado com sucesso",
    type: Fornecedor,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos na requisição",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  create(
    @Body() createFornecedorDto: CreateFornecedorDto,
  ): Promise<FornecedorResponse> {
    return this.fornecedorService.create(createFornecedorDto);
  }

  @Get()
  @ApiOperation({
    summary: "Listar fornecedores",
    description: "Retorna lista de todos os fornecedores",
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Lista de fornecedores retornada com sucesso",
    type: [Fornecedor],
  })
  findAll(
    @Query() paginationDto?: PaginationDto,
  ): Promise<FornecedorResponse[] | PaginatedResponse<FornecedorResponse>> {
    return this.fornecedorService.findAll(paginationDto);
  }

  @Get("search")
  @ApiOperation({
    summary: "Buscar fornecedores",
    description:
      "Busca fornecedores por código, CNPJ, razão social ou nome fantasia",
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
    description: "Fornecedores encontrados com sucesso",
    type: [Fornecedor],
  })
  search(@Query("q") query: string): Promise<FornecedorResponse[]> {
    return this.fornecedorService.search(query);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Obter fornecedor",
    description: "Retorna informações de um fornecedor específico",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "id",
    description: "ID único do fornecedor",
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Fornecedor encontrado com sucesso",
    type: Fornecedor,
  })
  @ApiResponse({
    status: 404,
    description: "Fornecedor não encontrado",
  })
  findOne(@Param("id", ParseIntPipe) id: number): Promise<FornecedorResponse> {
    return this.fornecedorService.findOne(id);
  }

  @Patch(":id")
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: true,
    }),
  )
  @ApiOperation({
    summary: "Atualizar fornecedor",
    description: "Atualiza informações de um fornecedor",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "id",
    description: "ID único do fornecedor",
    type: Number,
  })
  @ApiBody({ type: UpdateFornecedorDto })
  @ApiResponse({
    status: 200,
    description: "Fornecedor atualizado com sucesso",
    type: Fornecedor,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos na requisição",
  })
  @ApiResponse({
    status: 404,
    description: "Fornecedor não encontrado",
  })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateFornecedorDto: UpdateFornecedorDto,
  ): Promise<FornecedorResponse> {
    return this.fornecedorService.update(id, updateFornecedorDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Remover fornecedor",
    description: "Remove um fornecedor do sistema",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "id",
    description: "ID único do fornecedor",
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: "Fornecedor removido com sucesso",
  })
  @ApiResponse({
    status: 404,
    description: "Fornecedor não encontrado",
  })
  remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.fornecedorService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({
    summary: "Restaurar fornecedor",
    description: "Restaura um fornecedor previamente removido",
  })
  @ApiBearerAuth()
  @ApiParam({
    name: "id",
    description: "ID único do fornecedor",
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Fornecedor restaurado com sucesso",
    type: Fornecedor,
  })
  @ApiResponse({
    status: 404,
    description: "Fornecedor não encontrado",
  })
  restore(@Param("id", ParseIntPipe) id: number): Promise<FornecedorResponse> {
    return this.fornecedorService.restore(id);
  }
}
