import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Request,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileService } from "./services/file.service";
import {
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiTags,
} from "@nestjs/swagger";
import { UploadedFileResponseDto } from "./dto/uploaded-file.response.dto";

@ApiTags("Files")
@Controller("api/files")
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly fileService: FileService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({
    summary: "Upload de arquivo",
    description:
      "Faz upload de um arquivo (PDF) para o armazenamento e retorna seus metadados.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Arquivo a ser enviado",
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Arquivo para upload (ex: PDF)",
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Arquivo enviado com sucesso.",
    type: UploadedFileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Arquivo inválido ou duplicado.",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Erro interno do servidor.",
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any, // Para acessar `req.user` se precisar de autenticação aqui
  ): Promise<UploadedFileResponseDto> {
    try {
      console.log({ file });
      this.logger.log(
        `File upload request received from user ${req.user?.sub || "anonymous"}`,
      );
      const uploadedFile = await this.fileService.uploadFileToStorage(file);
      this.logger.log(`File uploaded successfully: ${uploadedFile.filePath}`);
      return uploadedFile;
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`, error.stack);
      throw error; // NestJS vai capturar e formatar a exceção
    }
  }
}
