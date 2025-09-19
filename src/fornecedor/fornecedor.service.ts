import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, ILike, Repository } from "typeorm";
import { Fornecedor } from "./entities/fornecedor.entity";
import { CreateFornecedorDto } from "./dto/request/create-fornecedor.dto";
import { UpdateFornecedorDto } from "./dto/request/update-fornecedor.dto";
import {
  FornecedorResponse,
  PaginatedFornecedorResponse,
  FornecedorSearchParams,
} from "./interfaces/fornecedor.interface";
import { PaginationParams } from "../common/interfaces/pagination-params.interface";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { PaginatedResponse } from "src/common/interfaces/paginated-response.interface";

@Injectable()
export class FornecedorService {
  private readonly logger = new Logger(FornecedorService.name);

  constructor(
    @InjectRepository(Fornecedor)
    private fornecedorRepository: Repository<Fornecedor>,
  ) {}

  async create(
    createFornecedorDto: CreateFornecedorDto,
  ): Promise<FornecedorResponse> {
    const { codigo, cpfCnpj, razaoSocial, nomeFantasia } = createFornecedorDto;

    this.logger.log(
      `Tentando criar fornecedor com código: ${codigo} e CPF/CNPJ: ${cpfCnpj}`,
    );

    // Verificar se fornecedor com mesmo código já existe
    const existingByCodigo = await this.fornecedorRepository.findOne({
      where: { codigo },
      withDeleted: false,
    });
    if (existingByCodigo) {
      this.logger.warn(
        `Tentativa de criar fornecedor com código já existente: ${codigo}`,
      );
      throw new BadRequestException(
        `Fornecedor com código "${codigo}" já existe.`,
      );
    }

    // Verificar se fornecedor com mesmo CNPJ já existe
    const existingByCpfCnpj = await this.fornecedorRepository.findOne({
      where: { cpfCnpj },
      withDeleted: false,
    });
    if (existingByCpfCnpj) {
      this.logger.warn(
        `Tentativa de criar fornecedor com CPF/CNPJ já existente: ${cpfCnpj}`,
      );
      throw new BadRequestException(
        `Fornecedor com CPF/CNPJ "${cpfCnpj}" já existe.`,
      );
    }

    const fornecedor = this.fornecedorRepository.create({
      codigo,
      cpfCnpj,
      razaoSocial,
      nomeFantasia,
    });

    const savedFornecedor = await this.fornecedorRepository.save(fornecedor);
    this.logger.log(`Fornecedor criado com sucesso. ID: ${savedFornecedor.id}`);

    return this.mapToFornecedorResponse(savedFornecedor);
  }

  async findAll(
    pagination?: PaginationDto,
  ): Promise<FornecedorResponse[] | PaginatedResponse<FornecedorResponse>> {
    if (!pagination) {
      this.logger.log(`Buscando fornecedores sem paginação`);

      const fornecedores = await this.fornecedorRepository.find({
        order: { createdAt: "DESC" },
      });

      return fornecedores.map((f) => this.mapToFornecedorResponse(f));
    }

    const { page = 1, limit = 10 } = pagination || {};

    this.logger.log(
      `Buscando fornecedores com paginação: page=${page}, limit=${limit}`,
    );

    const skip = (page - 1) * limit;

    const options: FindManyOptions<Fornecedor> = {
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    };

    const [fornecedores, total] =
      await this.fornecedorRepository.findAndCount(options);

    const fornecedorResponses = fornecedores.map((f) =>
      this.mapToFornecedorResponse(f),
    );

    return {
      data: fornecedorResponses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<FornecedorResponse> {
    this.logger.log(`Buscando fornecedor com ID: ${id}`);

    const fornecedor = await this.fornecedorRepository.findOne({
      where: { id },
    });

    if (!fornecedor) {
      this.logger.warn(`Fornecedor com ID ${id} não encontrado.`);
      throw new NotFoundException(`Fornecedor com ID ${id} não encontrado.`);
    }

    return this.mapToFornecedorResponse(fornecedor);
  }

  async update(
    id: number,
    updateFornecedorDto: UpdateFornecedorDto,
  ): Promise<FornecedorResponse> {
    this.logger.log(`Tentando atualizar fornecedor com ID: ${id}`);

    // Busca o fornecedor existente ou lança NotFoundException
    const fornecedor = await this.fornecedorRepository.findOne({
      where: { id },
    });

    if (!fornecedor) {
      this.logger.warn(
        `Tentativa de atualizar fornecedor inexistente. ID: ${id}`,
      );
      throw new NotFoundException(`Fornecedor com ID ${id} não encontrado.`);
    }

    const { codigo, cpfCnpj, razaoSocial, nomeFantasia } = updateFornecedorDto;

    // Verificar se o novo código já está em uso por outro fornecedor
    if (codigo && codigo !== fornecedor.codigo) {
      const existingByCodigo = await this.fornecedorRepository.findOne({
        where: { codigo },
        withDeleted: false,
      });
      if (existingByCodigo && existingByCodigo.id !== id) {
        this.logger.warn(
          `Tentativa de atualizar para um código já existente: ${codigo}`,
        );
        throw new BadRequestException(
          `Fornecedor com código "${codigo}" já existe.`,
        );
      }
    }

    // Verificar se o novo CNPJ já está em uso por outro fornecedor
    if (cpfCnpj && cpfCnpj !== fornecedor.cpfCnpj) {
      const existingByCnpj = await this.fornecedorRepository.findOne({
        where: { cpfCnpj },
        withDeleted: false,
      });
      if (existingByCnpj && existingByCnpj.id !== id) {
        this.logger.warn(
          `Tentativa de atualizar para um CPF/CNPJ já existente: ${cpfCnpj}`,
        );
        throw new BadRequestException(
          `Fornecedor com CPF/CNPJ "${cpfCnpj}" já existe.`,
        );
      }
    }

    // Atualiza os campos se fornecidos
    if (codigo) fornecedor.codigo = codigo;
    if (cpfCnpj) fornecedor.cpfCnpj = cpfCnpj;
    if (razaoSocial) fornecedor.razaoSocial = razaoSocial;
    if (nomeFantasia !== undefined) fornecedor.nomeFantasia = nomeFantasia;

    const updatedFornecedor = await this.fornecedorRepository.save(fornecedor);
    this.logger.log(
      `Fornecedor atualizado com sucesso. ID: ${updatedFornecedor.id}`,
    );

    return this.mapToFornecedorResponse(updatedFornecedor);
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Tentando remover fornecedor com ID: ${id}`);

    const result = await this.fornecedorRepository.softDelete(id);

    if (result.affected === 0) {
      this.logger.warn(
        `Tentativa de remover fornecedor inexistente. ID: ${id}`,
      );
      throw new NotFoundException(`Fornecedor com ID ${id} não encontrado.`);
    }

    this.logger.log(`Fornecedor removido com sucesso. ID: ${id}`);
  }

  async restore(id: number): Promise<FornecedorResponse> {
    this.logger.log(`Tentando restaurar fornecedor com ID: ${id}`);

    const result = await this.fornecedorRepository.restore(id);

    if (result.affected === 0) {
      this.logger.warn(
        `Tentativa de restaurar fornecedor inexistente ou já ativo. ID: ${id}`,
      );
      throw new NotFoundException(
        `Fornecedor com ID ${id} não encontrado ou já está ativo.`,
      );
    }

    this.logger.log(`Fornecedor restaurado com sucesso. ID: ${id}`);
    return this.findOne(id);
  }

  async search(params: string): Promise<FornecedorResponse[]> {
    this.logger.log(`Buscando fornecedores com termo: "${params}"`);

    let fornecedores: Fornecedor[] = [];

    if (params && params.trim().length > 0) {
      const searchValue = `%${params.trim()}%`;

      console.log({ searchValue });

      fornecedores = await this.fornecedorRepository.find({
        where: [
          { codigo: ILike(searchValue) },
          { cpfCnpj: ILike(searchValue) },
          { razaoSocial: ILike(searchValue) },
          { nomeFantasia: ILike(searchValue) },
        ],
      });
    }

    const fornecedorResponses = fornecedores.map((f) =>
      this.mapToFornecedorResponse(f),
    );

    return fornecedorResponses;
  }

  async findByCodigo(codigo: string): Promise<FornecedorResponse | null> {
    const fornecedor = await this.fornecedorRepository.findOne({
      where: { codigo },
    });

    return fornecedor ? this.mapToFornecedorResponse(fornecedor) : null;
  }

  async findByCpfCnpj(cpfCnpj: string): Promise<FornecedorResponse | null> {
    const fornecedor = await this.fornecedorRepository.findOne({
      where: { cpfCnpj },
    });

    return fornecedor ? this.mapToFornecedorResponse(fornecedor) : null;
  }

  private mapToFornecedorResponse(fornecedor: Fornecedor): FornecedorResponse {
    return {
      id: fornecedor.id,
      codigo: fornecedor.codigo,
      cpfCnpj: fornecedor.cpfCnpj,
      razaoSocial: fornecedor.razaoSocial,
      nomeFantasia: fornecedor.nomeFantasia,
      createdAt: fornecedor.createdAt,
      updatedAt: fornecedor.updatedAt,
    };
  }
}
