// src/sector/sector.service.ts
import {
  Injectable,
  NotFoundException,
  Logger,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, ILike, Repository } from "typeorm";
import { Sector } from "./entities/sector.entity";
import { CreateSectorDto } from "./dto/create-sector.dto";
import { UpdateSectorDto } from "./dto/update-sector.dto";
import { SectorResponse } from "./interfaces/sector.interface";
import { PaginatedResponse } from "src/common/interfaces/paginated-response.interface";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { AuditLogService } from "src/audit-log/audit-log.service";
import { AuditAction } from "src/audit-log/constants/audit-actions.constant";

@Injectable()
export class SectorService {
  private readonly logger = new Logger(SectorService.name);

  constructor(
    @InjectRepository(Sector)
    private sectorRepository: Repository<Sector>,
    private auditLogService: AuditLogService,
  ) {}

  /**
   * Cria um novo setor
   * @param createSectorDto DTO com dados para criação do setor
   * @returns O setor criado
   */
  async create(
    createSectorDto: CreateSectorDto,
    userId: number,
  ): Promise<Sector> {
    try {
      const sectorExists = await this.sectorRepository.findOne({
        where: { name: ILike(createSectorDto.name) },
        withDeleted: true,
      });

      if (sectorExists) {
        throw new HttpException(
          "Já existe um setor com esse nome.",
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Criando novo setor: ${createSectorDto.name}`);

      const sector = this.sectorRepository.create(createSectorDto);

      const savedSector = await this.sectorRepository.save(sector);

      await this.auditLogService.logAction(
        userId,
        AuditAction.SECTOR_CREATED,
        "Sector",
        savedSector.id,
        {
          ...savedSector,
        },
      );

      this.logger.log(`Setor criado com ID: ${savedSector.id}`);
      return savedSector;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Erro ao criar setor: ${error.message}`, error.stack);

      throw new HttpException(
        "Houve um erro ao tentar criar o setor, por favor tente novamente.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lista todos os setores
   * @param page Número da página
   * @param limit Limite de registros por página
   * @returns Lista de setores
   */
  async findAll(includeDeleted: boolean = false): Promise<Sector[]> {
    return this.sectorRepository.find({
      withDeleted: includeDeleted,
      relations: { users: true },
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Busca um setor pelo ID
   * @param id ID do setor
   * @returns Setor encontrado
   */
  async findOne(id: number): Promise<Sector> {
    const sector = await this.findSectorById(id);
    return sector;
  }

  /**
   * Atualiza um setor existente
   * @param id ID do setor
   * @param updateSectorDto DTO com dados para atualização
   * @returns Setor atualizado
   */
  async update(
    id: number,
    updateSectorDto: UpdateSectorDto,
    userId: number,
  ): Promise<Sector> {
    try {
      this.logger.log(`Atualizando setor com ID: ${id}`);

      // Buscar o setor existente
      const sector = await this.findSectorById(id);

      if (sector.name !== updateSectorDto.name) {
        const sectorExists = await this.sectorRepository.findOne({
          where: { name: updateSectorDto.name },
          withDeleted: true,
        });

        if (sectorExists) {
          throw new HttpException(
            "Já existe setor com esse nome.",
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Atualizar os campos se fornecidos
      if (updateSectorDto.name) {
        sector.name = updateSectorDto.name;
      }

      if (updateSectorDto.description !== undefined) {
        sector.description = updateSectorDto.description;
      }

      // Salvar as alterações
      const updatedSector = await this.sectorRepository.save(sector);

      await this.auditLogService.logAction(
        userId,
        AuditAction.SECTOR_UPDATED,
        "Sector",
        updatedSector.id,
        {
          ...updatedSector,
        },
      );

      this.logger.log(`Setor ${id} atualizado com sucesso`);
      return updatedSector;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Houve um erro ao tentar editar o setor, por favor tente novamente.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Remove um setor pelo ID
   * @param id ID do setor
   */
  async remove(id: number, userId: number): Promise<void> {
    this.logger.log(`Removendo setor com ID: ${id}`);

    // Verificar se o setor existe
    await this.findSectorById(id);

    // Usar soft delete em vez de remoção permanente
    await this.sectorRepository.softDelete(id);

    await this.auditLogService.logAction(
      userId,
      AuditAction.SECTOR_REMOVED,
      "Sector",
      id,
      {
        id,
      },
    );

    this.logger.log(`Setor ${id} removido com sucesso`);
  }

  /**
   * Restaura um setor previamente removido
   * @param id ID do setor
   * @returns Setor restaurado
   */
  async restore(id: number, userId: number): Promise<Sector> {
    this.logger.log(`Restaurando setor com ID: ${id}`);

    // Verificar se o setor existe e está deletado
    const existingSector = await this.sectorRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!existingSector) {
      throw new NotFoundException(`Setor com ID ${id} não encontrado.`);
    }

    if (!existingSector.deletedAt) {
      this.logger.log(`Setor ${id} não está deletado`);
      return existingSector;
    }

    // Restaurar o setor
    await this.sectorRepository.restore(id);

    // Buscar o setor restaurado
    const restoredSector = await this.findSectorById(id);

    await this.auditLogService.logAction(
      userId,
      AuditAction.SECTOR_RESTORED,
      "Sector",
      id,
      {
        id,
      },
    );

    this.logger.log(`Setor ${id} restaurado com sucesso`);
    return restoredSector;
  }

  /**
   * Helper para encontrar um setor pelo ID
   * @param id ID do setor
   * @returns Setor encontrado
   * @throws NotFoundException se o setor não for encontrado
   */
  private async findSectorById(id: number): Promise<Sector> {
    const sector = await this.sectorRepository.findOne({ where: { id } });
    if (!sector) {
      this.logger.warn(`Setor com ID ${id} não encontrado`);
      throw new NotFoundException(`Setor com ID ${id} não encontrado.`);
    }
    return sector;
  }

  /**
   * Converte uma entidade Sector para um objeto de resposta
   * @param sector Entidade Sector
   * @returns Objeto de resposta
   */
  private sectorToResponse(sector: Sector): SectorResponse {
    return {
      id: sector.id,
      name: sector.name,
      description: sector.description,
      createdAt: sector.createdAt,
      updatedAt: sector.updatedAt,
    };
  }
}
