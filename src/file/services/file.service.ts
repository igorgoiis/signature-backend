import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { MinioService } from "./minio.service";
import * as crypto from "crypto";
import * as path from "path";
import { UploadedFileResponseDto } from "../dto/uploaded-file.response.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Document } from "../../document/entities/document.entity";
import { Readable } from "stream";
import { File } from "../entities/file.entity";

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private readonly minioService: MinioService,
    @InjectRepository(File)
    private repository: Repository<File>,
  ) {}

  async uploadFileToStorage(
    file: Express.Multer.File,
  ): Promise<UploadedFileResponseDto> {
    console.log(file);
    this.logger.log(`Starting file upload: ${file.originalname}`);

    // // 1. Validação do tipo de arquivo
    // if (!file.mimetype.includes("pdf")) {
    //   this.logger.error(
    //     `Invalid file type: ${file.mimetype}. Only PDF files are allowed.`,
    //   );
    //   throw new BadRequestException("Apenas arquivos PDF são permitidos.");
    // }

    // 2. Gerar hash do arquivo para verificar duplicatas
    const fileHash = crypto
      .createHash("sha256")
      .update(file.buffer)
      .digest("hex");

    // 3. Verificar se já existe um documento com o mesmo hash
    const existingFile = await this.repository.findOne({
      where: { fileHash },
    });

    if (existingFile) {
      this.logger.warn(`File with hash ${fileHash} already exists.`);
      throw new BadRequestException(
        "Este arquivo já foi enviado anteriormente.",
      );
    }

    // 4. Gerar nome único para o arquivo
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `documents/${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;

    try {
      // 5. Salvar arquivo no MinIO
      const uploadResult = await this.minioService.uploadFile(
        uniqueFileName,
        file.buffer,
        file.mimetype,
      );
      this.logger.log(
        `File uploaded to MinIO: ${uniqueFileName}, ETag: ${uploadResult.etag}`,
      );

      const savedFile = await this.repository.save({
        fileName: file.originalname,
        filePath: uniqueFileName,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileHash: fileHash,
      });

      // 6. Retornar metadados do arquivo
      return savedFile;
    } catch (error) {
      this.logger.error(
        `Error uploading file to MinIO: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Erro interno do servidor ao fazer upload do arquivo.",
      );
    }
  }

  // Método opcional para remover arquivo do MinIO, caso o processamento falhe posteriormente
  async deleteFileFromStorage(filePath: string): Promise<void> {
    try {
      await this.minioService.deleteFile(filePath);
      this.logger.log(`File ${filePath} successfully deleted from MinIO.`);
    } catch (error) {
      this.logger.error(
        `Failed to delete file ${filePath} from MinIO: ${error.message}`,
        error.stack,
      );
      // Decida se quer relançar o erro ou apenas logar
      throw new InternalServerErrorException(
        `Falha ao remover arquivo do armazenamento: ${error.message}`,
      );
    }
  }

  async downloadFileFromStorage(filePath: string): Promise<Readable> {
    try {
      const fileBuffer = await this.minioService.downloadFile(filePath);
      this.logger.log(`File ${filePath} successfully downloaded from MinIO.`);
      return fileBuffer;
    } catch (error) {
      this.logger.error(
        `Failed to download file ${filePath} from MinIO: ${error.message}`,
        error.stack,
      );
      throw new NotFoundException(
        `Arquivo não encontrado no armazenamento: ${error.message}`,
      );
    }
  }

  async findOneById(id: number): Promise<File> {
    try {
      const file = await this.repository.findOne({ where: { id } });

      if (!file)
        throw new HttpException(
          "Arquivo não encontrado!",
          HttpStatus.BAD_REQUEST,
        );

      return file;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        "Houve um erro ao tentar buscar o arquivo",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
