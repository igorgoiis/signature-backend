// auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
  ForbiddenException,
} from "@nestjs/common";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RefreshToken } from "./entities/refresh-token.entity";
import { jwtConstants } from "./constants/jwt.constants";
import { JwtPayload } from "./interfaces/jwt-payload.interface";
import { TokenResponse } from "./interfaces/token-response.interface";
import { UserPublicProfile } from "src/user/interfaces";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /**
   * Valida credenciais de usuário para autenticação local
   */
  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserPublicProfile | null> {
    try {
      console.log("DEBUG (validateUser): Email for validation:", email);
      console.log("DEBUG (validateUser): Plain password entered:", pass);

      const user = await this.userService.findByEmailWithPassword(email);

      if (!user) {
        return null;
      }

      const passwordMatch = await bcrypt.compare(pass, user.password);

      if (passwordMatch) {
        const { password, ...result } = user;
        return result;
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Erro ao validar usuário: ${this.getErrorMessage(error)}`,
      );
      return null;
    }
  }

  /**
   * Autentica o usuário e gera tokens de acesso e renovação
   */
  async login(user: UserPublicProfile): Promise<TokenResponse> {
    try {
      return await this.generateTokens(user);
    } catch (error) {
      this.logger.error(
        `Erro ao realizar login: ${this.getErrorMessage(error)}`,
      );
      throw new InternalServerErrorException("Erro ao processar login");
    }
  }

  /**
   * Gera tokens de acesso e renovação para o usuário
   */
  private async generateTokens(
    user: UserPublicProfile,
  ): Promise<TokenResponse> {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      name: user.name,
    };

    // Gera o token de acesso
    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.expiresIn,
    });

    // Gera o token de renovação
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: jwtConstants.refreshSecret,
        expiresIn: jwtConstants.refreshExpiresIn,
      },
    );

    // Armazena o token de renovação no banco
    await this.storeRefreshToken(refreshToken, user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    };
  }

  /**
   * Armazena o token de renovação no banco de dados
   */
  private async storeRefreshToken(
    token: string,
    userId: number,
  ): Promise<void> {
    try {
      // Hash do token antes de armazenar
      const hashedToken = await bcrypt.hash(token, 10);

      // Calcula a data de expiração
      const expiresAt = this.calculateExpiryDate(jwtConstants.refreshExpiresIn);

      // Revoga tokens anteriores do usuário (opcional)
      await this.refreshTokenRepository.update(
        { userId, isRevoked: false },
        { isRevoked: true },
      );

      // Cria e salva o novo registro de token
      const refreshTokenRecord = this.refreshTokenRepository.create({
        userId,
        hashedToken,
        expiresAt,
        isRevoked: false,
      });

      await this.refreshTokenRepository.save(refreshTokenRecord);
    } catch (error) {
      this.logger.error(
        `Erro ao armazenar refresh token: ${this.getErrorMessage(error)}`,
      );
      throw new InternalServerErrorException(
        "Não foi possível processar o token de autenticação",
      );
    }
  }

  /**
   * Calcula a data de expiração com base na string de duração
   */
  private calculateExpiryDate(duration: string): Date {
    const expiresAt = new Date();
    const match = duration.match(/^(\d+)([smhdwy])$/);

    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];

      switch (unit) {
        case "s": // segundos
          expiresAt.setSeconds(expiresAt.getSeconds() + value);
          break;
        case "m": // minutos
          expiresAt.setMinutes(expiresAt.getMinutes() + value);
          break;
        case "h": // horas
          expiresAt.setHours(expiresAt.getHours() + value);
          break;
        case "d": // dias
          expiresAt.setDate(expiresAt.getDate() + value);
          break;
        case "w": // semanas
          expiresAt.setDate(expiresAt.getDate() + value * 7);
          break;
        case "y": // anos
          expiresAt.setFullYear(expiresAt.getFullYear() + value);
          break;
      }
    } else {
      // Padrão: 7 dias
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

    return expiresAt;
  }

  /**
   * Renova o token de acesso usando o token de renovação
   */
  async refreshToken(refreshTokenValue: string): Promise<TokenResponse> {
    try {
      // Verifica a assinatura e expiração do token
      const payload = this.jwtService.verify(refreshTokenValue, {
        secret: jwtConstants.refreshSecret,
      });

      const userId = payload.sub;

      // Busca tokens não revogados para o usuário
      const storedTokens = await this.refreshTokenRepository.find({
        where: { userId, isRevoked: false },
        order: { expiresAt: "DESC" },
      });

      // Encontra o token válido comparando hashes
      const validToken = await this.findValidToken(
        storedTokens,
        refreshTokenValue,
      );

      if (!validToken) {
        throw new UnauthorizedException("Refresh token inválido ou revogado");
      }

      // Revoga o token usado
      await this.revokeToken(validToken);

      // Busca dados atualizados do usuário
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException("Usuário não encontrado");
      }

      // Gera novo token de acesso
      return await this.generateTokens(user);
    } catch (error) {
      this.logger.error(
        `Erro ao renovar token: ${this.getErrorMessage(error)}`,
      );

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException("Refresh token inválido ou expirado");
    }
  }

  /**
   * Encontra um token válido comparando o valor com os hashes armazenados
   */
  private async findValidToken(
    tokens: RefreshToken[],
    tokenValue: string,
  ): Promise<RefreshToken | null> {
    for (const token of tokens) {
      if (await bcrypt.compare(tokenValue, token.hashedToken)) {
        // Verifica se o token expirou
        if (token.expiresAt < new Date()) {
          await this.revokeToken(token);
          throw new ForbiddenException("Token expirado");
        }
        return token;
      }
    }
    return null;
  }

  /**
   * Revoga um token específico
   */
  private async revokeToken(token: RefreshToken): Promise<void> {
    try {
      token.isRevoked = true;
      await this.refreshTokenRepository.save(token);
    } catch (error) {
      this.logger.error(
        `Erro ao revogar token: ${this.getErrorMessage(error)}`,
      );
      throw new InternalServerErrorException("Erro ao processar o token");
    }
  }

  /**
   * Revoga um token específico pelo seu valor
   */
  async revokeRefreshToken(tokenValue: string): Promise<void> {
    try {
      // Verifica a assinatura do token para obter o userId
      const payload = this.jwtService.verify(tokenValue, {
        secret: jwtConstants.refreshSecret,
        ignoreExpiration: true, // Permite revogar mesmo tokens expirados
      });

      const userId = payload.sub;

      // Busca tokens não revogados para o usuário
      const storedTokens = await this.refreshTokenRepository.find({
        where: { userId, isRevoked: false },
      });

      // Encontra e revoga o token correspondente
      let tokenFound = false;
      for (const token of storedTokens) {
        if (await bcrypt.compare(tokenValue, token.hashedToken)) {
          await this.revokeToken(token);
          tokenFound = true;
          break;
        }
      }

      if (!tokenFound) {
        this.logger.debug("Token não encontrado ou já revogado");
      }
    } catch (error) {
      this.logger.error(
        `Erro ao revogar token: ${this.getErrorMessage(error)}`,
      );
      // Não lançamos erro aqui para evitar revelar informações sobre tokens
    }
  }

  /**
   * Revoga todos os tokens de renovação para um usuário
   */
  async revokeAllUserTokens(userId: number): Promise<void> {
    try {
      await this.refreshTokenRepository.update(
        { userId, isRevoked: false },
        { isRevoked: true },
      );
    } catch (error) {
      this.logger.error(
        `Erro ao revogar tokens do usuário: ${this.getErrorMessage(error)}`,
      );
      throw new InternalServerErrorException(
        "Erro ao processar operação de segurança",
      );
    }
  }

  /**
   * Extrai a mensagem de erro de forma segura
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
