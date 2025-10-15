import { IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class RejectDocumentDto {
  @ApiPropertyOptional({
    description: "Motivo de rejeitar o documento",
    example: "Documento rejeitado por está incorreto.",
  })
  @IsString()
  reason: string;
}
