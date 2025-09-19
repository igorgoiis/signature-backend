import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsNotEmpty } from "class-validator";

export class UploadedFileResponseDto {
  @ApiProperty({
    description: "Caminho do arquivo no armazenamento (MinIO)",
    example: "documents/1701010101010-123456789.pdf",
  })
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @ApiProperty({
    description: "Nome original do arquivo",
    example: "contrato_servicos.pdf",
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ description: "Tamanho do arquivo em bytes", example: 1024000 })
  @IsNumber()
  fileSize: number;

  @ApiProperty({
    description: "Tipo MIME do arquivo",
    example: "application/pdf",
  })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({
    description:
      "Hash SHA256 do conteúdo do arquivo para verificação de duplicidade",
    example: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
  })
  @IsString()
  @IsNotEmpty()
  fileHash: string;
}
