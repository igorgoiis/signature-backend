import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import * as pdfParse from "pdf-parse";

@Injectable()
export class PdfValidationService {
  private readonly logger = new Logger(PdfValidationService.name);
  private readonly maxPdfSizeMB: number;
  private readonly maxPdfPages: number;
  private readonly suspiciousPatterns = [
    "javascript",
    "/js",
    "/javascript",
    "/launch",
    "/openaction",
    "/aa",
    "/jbig2decode",
    "eval\\(",
    "function\\(\\)",
    "this\\.\\w+\\(\\)",
  ];

  constructor(private readonly configService: ConfigService) {
    this.maxPdfSizeMB = this.configService.get<number>("MAX_PDF_SIZE_MB", 10);
    this.maxPdfPages = this.configService.get<number>("MAX_PDF_PAGES", 100);

    this.initPdfWorker();
  }

  private initPdfWorker(): void {
    try {
      const workerPath = require.resolve(
        "pdfjs-dist/legacy/build/pdf.worker.min.js",
      );
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
      this.logger.log(`PDF.js worker configured at: ${workerPath}`);
    } catch (error) {
      this.logger.error(`Failed to configure PDF.js worker: ${error.message}`);
    }
  }

  async validatePdf(buffer: Buffer): Promise<boolean> {
    this.logger.log(`Validating PDF (${buffer?.length || 0} bytes)`);

    this.validateBasicIntegrity(buffer);
    this.validateFileSize(buffer);

    try {
      const data = new Uint8Array(buffer);
      const pdfDocument = await pdfjsLib.getDocument({ data }).promise;
      this.validatePageCount(pdfDocument);

      // Uncomment to validate content
      // await this.validateContent(buffer);

      this.logger.log("PDF validation successful");
      return true;
    } catch (error) {
      this.handlePdfValidationError(error);
    }
  }

  private validateBasicIntegrity(buffer: Buffer): void {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException("PDF file is empty or corrupted");
    }

    const pdfSignature = buffer.slice(0, 4).toString();
    if (pdfSignature !== "%PDF") {
      this.logger.error(`Invalid PDF signature: "${pdfSignature}"`);
      throw new BadRequestException("Invalid PDF file (wrong signature)");
    }
  }

  private validateFileSize(buffer: Buffer): void {
    const fileSizeMB = buffer.length / (1024 * 1024);
    this.logger.log(
      `File size: ${fileSizeMB.toFixed(2)}MB (limit: ${this.maxPdfSizeMB}MB)`,
    );

    if (fileSizeMB > this.maxPdfSizeMB) {
      throw new BadRequestException(
        `PDF file size exceeds maximum allowed (${this.maxPdfSizeMB}MB)`,
      );
    }
  }

  private validatePageCount(pdfDocument: any): void {
    const numPages = pdfDocument.numPages;
    this.logger.log(`Page count: ${numPages} (limit: ${this.maxPdfPages})`);

    if (numPages > this.maxPdfPages) {
      throw new BadRequestException(
        `PDF has ${numPages} pages, exceeding limit of ${this.maxPdfPages}`,
      );
    }
  }

  private async validateContent(buffer: Buffer): Promise<void> {
    const dataParsed = await pdfParse(buffer);
    const pdfText = dataParsed.text.toLowerCase();
    this.logger.log(`Extracted ${pdfText.length} characters from PDF`);

    const hasSuspiciousContent = this.suspiciousPatterns.some((pattern) => {
      const regex = new RegExp(pattern, "i");
      return regex.test(pdfText);
    });

    if (hasSuspiciousContent) {
      throw new BadRequestException(
        "PDF contains potentially malicious scripts or actions",
      );
    }
  }

  private handlePdfValidationError(error: any): never {
    if (error instanceof BadRequestException) {
      throw error;
    }

    if (
      error.name === "PasswordException" ||
      error.message.includes("password")
    ) {
      throw new BadRequestException("PDF is password protected");
    }

    if (
      error.name === "InvalidPDFException" ||
      error.message.includes("invalid")
    ) {
      throw new BadRequestException("Invalid or corrupted PDF file");
    }

    this.logger.error(`PDF validation error: ${error.message}`, error.stack);
    throw new BadRequestException("Error validating PDF file");
  }
}
