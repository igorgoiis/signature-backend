import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// Use a versão legacy do pdf.js que é compatível com Node.js
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import * as pdfParse from 'pdf-parse';
import * as path from 'path';

@Injectable()
export class PdfValidationService {
  private readonly logger = new Logger(PdfValidationService.name);
  private readonly maxPdfSizeMB: number;
  private readonly maxPdfPages: number;

  constructor(private readonly configService: ConfigService) {
    // Configuração dos limites de tamanho e páginas
    this.maxPdfSizeMB = this.configService.get<number>('MAX_PDF_SIZE_MB') || 10;
    this.maxPdfPages = this.configService.get<number>('MAX_PDF_PAGES') || 100;
    
    // Configuração do worker usando require.resolve para obter o caminho absoluto
    try {
      // Usando require.resolve para obter o caminho absoluto do worker
      const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.min.js');
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
      this.logger.log(`Worker do PDF.js configurado em: ${workerPath}`);
    } catch (error) {
      this.logger.error(`Erro ao configurar worker do PDF.js: ${error.message}`, error.stack);
    }
  }

  /**
   * Valida um arquivo PDF verificando vários aspectos de segurança e integridade
   * @param buffer Buffer contendo o arquivo PDF
   * @returns true se o PDF for válido, lança exceção caso contrário
   */
  async validatePdf(buffer: Buffer): Promise<boolean> {
    this.logger.log(`Iniciando validação de PDF. Tamanho do buffer: ${buffer.length} bytes`);
    
    // Verificação básica de integridade do arquivo
    if (!buffer || buffer.length === 0) {
      this.logger.error('Buffer do PDF vazio ou nulo');
      throw new BadRequestException('O arquivo PDF está vazio ou corrompido');
    }
    
    // Verificação básica de assinatura de PDF (%PDF no início do arquivo)
    const pdfSignature = buffer.slice(0, 4).toString();
    if (pdfSignature !== '%PDF') {
      this.logger.error(`Assinatura de PDF inválida: "${pdfSignature}". Esperado: "%PDF"`);
      throw new BadRequestException('O arquivo não parece ser um PDF válido (assinatura inválida)');
    }
    
    // Verifica o tamanho do arquivo
    const fileSizeMB = buffer.length / (1024 * 1024);
    this.logger.log(`Tamanho do arquivo: ${fileSizeMB.toFixed(2)}MB (limite: ${this.maxPdfSizeMB}MB)`);
    
    if (fileSizeMB > this.maxPdfSizeMB) {
      this.logger.warn(`Arquivo excede o tamanho máximo permitido: ${fileSizeMB.toFixed(2)}MB > ${this.maxPdfSizeMB}MB`);
      throw new BadRequestException(
        `O tamanho do arquivo PDF excede o máximo permitido de ${this.maxPdfSizeMB}MB`
      );
    }

    try {
      // Converte o Buffer para Uint8Array
      const data = new Uint8Array(buffer);
      this.logger.log('Convertendo buffer para Uint8Array e carregando documento PDF');

      // Carrega o documento PDF
      const pdfDocument = await pdfjsLib.getDocument({ data }).promise;
      this.logger.log('Documento PDF carregado com sucesso');
      
      // Verifica o número de páginas
      const numPages = pdfDocument.numPages;
      this.logger.log(`Número de páginas no PDF: ${numPages} (limite: ${this.maxPdfPages})`);
      
      if (numPages > this.maxPdfPages) {
        this.logger.warn(`PDF excede o número máximo de páginas: ${numPages} > ${this.maxPdfPages}`);
        throw new BadRequestException(
          `O PDF tem ${numPages} páginas, excedendo o limite de ${this.maxPdfPages} páginas`
        );
      }

      // Verifica conteúdo malicioso
      this.logger.log('Analisando conteúdo do PDF para extração de texto');
      const dataParsed = await pdfParse(buffer);
      const pdfText = dataParsed.text.toLowerCase();
      this.logger.log(`Texto extraído do PDF: ${pdfText.length} caracteres`);
      
      /* Comentado temporariamente a verificação de conteúdo suspeito
      // Verifica padrões suspeitos no texto do PDF
      const suspiciousPatterns = [
        'javascript', 
        '/js', 
        '/javascript',
        '/launch',
        '/openaction',
        '/aa',
        '/jbig2decode',
        'eval\\(',
        'function\\(\\)',
        'this\\.\\w+\\(\\)'
      ];
      
      const hasSuspiciousContent = suspiciousPatterns.some(pattern => {
        const regex = new RegExp(pattern, 'i');
        return regex.test(pdfText);
      });

      if (hasSuspiciousContent) {
        throw new BadRequestException(
          'O PDF contém scripts ou ações potencialmente maliciosos'
        );
      }
      */
      
      this.logger.log('Validação de PDF concluída com sucesso');
      return true;
    } catch (error) {
      // Verifica se o PDF está protegido por senha
      if (error.name === 'PasswordException' || error.message.includes('password')) {
        this.logger.warn(`PDF protegido por senha: ${error.message}`);
        throw new BadRequestException('O PDF está protegido por senha');
      }
      
      // Verifica se o arquivo é um PDF válido
      if (error.name === 'InvalidPDFException' || error.message.includes('invalid')) {
        this.logger.warn(`PDF inválido ou corrompido: ${error.message}`);
        throw new BadRequestException('O arquivo não é um PDF válido ou está corrompido');
      }
      
      this.logger.error(`Erro ao validar PDF: ${error.message}`, error.stack);
      throw new BadRequestException('Erro ao validar o arquivo PDF');
    }
  }
}