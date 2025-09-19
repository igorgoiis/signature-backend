import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "./entities/user.entity";
import { UserRole } from "./enums/user-role.enum";
import { Sector } from "../sector/entities/sector.entity";
import { SectorService } from "../sector/sector.service";
import { CreateUserDto, UpdateUserDto } from "./dto";
import { UserPublicProfile } from "./interfaces/user.interface";
import { PaginationDto } from "../common/dto/pagination.dto";
import { PaginatedResponse } from "../common/interfaces/paginated-response.interface";
import { take } from "rxjs";
import { SectorResponse } from "src/sector/interfaces";
import { AuditLogService } from "src/audit-log/audit-log.service";
import { RecentActivityActions } from "src/dashboard/constants/dashboard.constants";
import { AuditAction } from "src/audit-log/constants/audit-actions.constant";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private sectorService: SectorService,
    private auditLogService: AuditLogService,
  ) {}

  private userToPublicProfile(user: User): UserPublicProfile {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      sector: user.sector,
    };
  }

  private usersToPublicProfile(users: User[]): UserPublicProfile[] {
    return users.map((user) => this.userToPublicProfile(user));
  }

  async create(
    createUserDto: CreateUserDto,
    currentUserId: number,
  ): Promise<UserPublicProfile> {
    const { name, email, password, sectorId, role } = createUserDto;

    await this.validateEmailUniqueness(email);

    const sectorEntity = await this.resolveSector(sectorId);

    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);
    const user = this.userRepository.create({
      name,
      email,
      password: passwordHashed,
      sector: sectorEntity,
      role: role || UserRole.USER,
    });

    const savedUser = await this.userRepository.save(user);

    await this.auditLogService.logAction(
      currentUserId,
      AuditAction.USER_CREATED,
      "User",
      savedUser.id,
      {
        ...savedUser,
      },
    );

    return this.userToPublicProfile(savedUser);
  }

  async findAll(includeDeleted: boolean = false): Promise<User[]> {
    const users = await this.userRepository.find({
      order: { createdAt: "DESC" },
      withDeleted: includeDeleted,
      relations: {
        sector: true,
      },
    });

    return users;
  }

  async findOne(id: number): Promise<UserPublicProfile> {
    const user = await this.findUserById(id);
    return this.userToPublicProfile(user);
  }

  async searchUsers(query: string): Promise<UserPublicProfile[]> {
    if (!query || query.trim() === "") {
      return [];
    }

    const users = await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.sector", "sector")
      .where("user.name ILIKE :query OR user.email ILIKE :query", {
        query: `%${query}%`,
      })
      .getMany();

    return this.usersToPublicProfile(users);
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        sector: true,
      },
      relations: {
        sector: true,
      },
    });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUserId: number,
  ): Promise<User> {
    try {
      const user = await this.findUserByIdWithPassword(id);

      const { name, email, password, sectorId, role } = updateUserDto;

      if (email && email !== user.email) {
        await this.validateEmailUniqueness(email, id);
        user.email = email;
      }

      if (sectorId !== undefined) {
        user.sector = await this.resolveSector(sectorId);
      }

      if (name) user.name = name;
      if (role) user.role = role;

      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      const savedUser = await this.userRepository.save(user);

      await this.auditLogService.logAction(
        currentUserId,
        AuditAction.USER_UPDATED,
        "User",
        savedUser.id,
        {
          ...savedUser,
        },
      );

      return savedUser;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        "Houve um erro ao tentar editar o usuário, por favor tente novamente.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    const user = await this.findUserById(id);

    await this.userRepository.softDelete(id);

    await this.auditLogService.logAction(
      currentUserId,
      AuditAction.USER_DELETED,
      "User",
      user.id,
      {
        ...user,
      },
    );
  }

  async restore(id: number, currentUserId: number): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!existingUser) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    if (!existingUser.deletedAt) {
      throw new BadRequestException(`Usuário com ID ${id} não está deletado.`);
    }

    await this.userRepository.restore(id);

    const restoredUser = await this.findUserById(id);

    await this.auditLogService.logAction(
      currentUserId,
      AuditAction.USER_RESTORED,
      "User",
      restoredUser.id,
      {
        ...restoredUser,
      },
    );

    return restoredUser;
  }

  private async validateEmailUniqueness(
    email: string,
    excludeId?: number,
  ): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser && (!excludeId || existingUser.id !== excludeId)) {
      throw new BadRequestException("Email já cadastrado.");
    }
  }

  private async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["sector"],
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    return user;
  }

  private async findUserByIdWithPassword(id: number): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .leftJoinAndSelect("user.sector", "sector")
      .where("user.id = :id", { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    return user;
  }

  private async resolveSector(
    sectorId: number | null | undefined,
  ): Promise<Sector | null> {
    if (sectorId === undefined) {
      return null;
    }

    if (sectorId === null) {
      return null;
    }

    try {
      const sector = await this.sectorService.findOne(sectorId);

      if (!sector) {
        throw new HttpException(
          `Setor com ID ${sectorId} não encontrado.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return sector;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Houve um erro ao buscar o setor do usuário, por favor tente novamente.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
