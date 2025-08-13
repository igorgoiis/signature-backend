
import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus } from './document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentInstallment } from './document-installment.entity';
import { DocumentAllocation } from './document-allocation.entity';
import { User } from '../user/user.entity';
import { Fornecedor } from '../fornecedor/fornecedor.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MinioService } from './minio.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Readable } from 'stream';
import { DocumentSignatory, SignatoryStatus } from './document-signatory.entity';

export interface UploadDocumentDto {
  title: string;
  description?: string;
  signatories: Array<{
    userId: number;
    order: number;
    notes?: string;
  }>;
  fornecedorId?: number;
  tipoDocumento?: string;
  valor?: number;
  dataVencimento?: string;
  observacoes?: string;
  natureza: string;
  installments: Array<{
    installmentNumber: number;
    amount: number;
    dueDate: string;
    description?: string;
  }>;
  rateio: Array<{
    id: string;
    filial: string;
    centroCusto: string;
    valor: number;
    percentual: number;
  }>;
}

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(DocumentInstallment)
    private installmentRepository: Repository<DocumentInstallment>,
    @InjectRepository(DocumentAllocation)
    private allocationRepository: Repository<DocumentAllocation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Fornecedor)
    private fornecedorRepository: Repository<Fornecedor>,
    @InjectRepository(DocumentSignatory)
    private documentSignatoryRepository: Repository<DocumentSignatory>,
    private auditLogService: AuditLogService,
    private minioService: MinioService,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    uploadDto: UploadDocumentDto,
    ownerId: number,
  ): Promise<Document> {
    this.logger.log(`Starting document upload for user ${ownerId}`);

    // Validações básicas
    if (!file) {
      this.logger.error('No file provided for upload.');
      throw new BadRequestException('Arquivo é obrigatório.');
    }

    if (!uploadDto.title || uploadDto.title.trim() === '') {
      this.logger.error('Document title is required but not provided.');
      throw new BadRequestException('Título do documento é obrigatório.');
    }

    if (!uploadDto.signatories || uploadDto.signatories.length === 0) {
      this.logger.error('At least one signatory is required.');
      throw new BadRequestException('Pelo menos um signatário é obrigatório.');
    }

    if (!uploadDto.installments || uploadDto.installments.length === 0) {
      this.logger.error('At least one installment is required.');
      throw new BadRequestException('Pelo menos uma parcela é obrigatória.');
    }

    if (!uploadDto.rateio || uploadDto.rateio.length === 0) {
      this.logger.error('At least one allocation is required.');
      throw new BadRequestException('Pelo menos um item de rateio é obrigatório.');
    }

    // Verificar fornecedor (opcional)
    let fornecedor: Fornecedor | null = null;
    if (uploadDto.fornecedorId) {
      fornecedor = await this.fornecedorRepository.findOne({ where: { id: uploadDto.fornecedorId } });
      if (!fornecedor) {
        this.logger.error(`Fornecedor with ID ${uploadDto.fornecedorId} not found.`);
        throw new NotFoundException(`Fornecedor com ID ${uploadDto.fornecedorId} não encontrado.`);
      }
    }

    // Verificar se o mimetype é PDF
    if (!file.mimetype.includes('pdf')) {
      this.logger.error(`Invalid file type: ${file.mimetype}. Only PDF files are allowed.`);
      throw new BadRequestException('Apenas arquivos PDF são permitidos.');
    }

    // Gerar hash do arquivo para verificar duplicatas
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    
    // Verificar se já existe um documento com o mesmo hash
    const existingDocument = await this.documentRepository.findOne({ where: { fileHash } });
    if (existingDocument) {
      this.logger.warn(`Document with hash ${fileHash} already exists.`);
      throw new BadRequestException('Este arquivo já foi enviado anteriormente.');
    }

    // Gerar nome único para o arquivo
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `documents/${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;

    try {
      // Salvar arquivo no MinIO
      const uploadResult = await this.minioService.uploadFile(uniqueFileName, file.buffer, file.mimetype);
      this.logger.log(`File uploaded to MinIO: ${uniqueFileName}, ETag: ${uploadResult.etag}`);

      // Criar documento no banco de dados
      const document = this.documentRepository.create({
        title: uploadDto.title.trim(),
        description: uploadDto.description?.trim() || null,
        filePath: uniqueFileName, // Caminho no MinIO
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileHash: fileHash,
        ownerId: ownerId,
        fornecedorId: fornecedor?.id || null,
        tipoDocumento: uploadDto.tipoDocumento as any || 'OTHER',
        valor: uploadDto.valor || null,
        dataVencimento: uploadDto.dataVencimento ? new Date(uploadDto.dataVencimento) : null,
        observacoes: uploadDto.observacoes?.trim() || null,
        natureza: uploadDto.natureza.trim(),
        status: DocumentStatus.PENDING,
      });

      const savedDocument = await this.documentRepository.save(document);
      this.logger.log(`Document saved with ID: ${savedDocument.id}`);

      // Processar signatários
      const signatoryEntities = await Promise.all(uploadDto.signatories.map(async (s) => {
        const user = await this.userRepository.findOne({ where: { id: s.userId } });
        if (!user) {
          throw new NotFoundException(`Usuário com ID ${s.userId} não encontrado para signatário.`);
        }
        return this.documentSignatoryRepository.create({
          document: savedDocument,
          user: user,
          order: s.order,
          status: SignatoryStatus.PENDING,
          rejectionReason: null,
          signedAt: null,
        });
      }));
      await this.documentSignatoryRepository.save(signatoryEntities);
      this.logger.log(`Processed ${signatoryEntities.length} signatories for document ${savedDocument.id}`);

      // Processar parcelas
      await this.processInstallments(savedDocument.id, uploadDto.installments);
      this.logger.log(`Processed ${uploadDto.installments.length} installments for document ${savedDocument.id}`);

      // Processar rateio
      await this.processAllocations(savedDocument.id, uploadDto.rateio);
      this.logger.log(`Processed ${uploadDto.rateio.length} allocation items for document ${savedDocument.id}`);

      // Log de auditoria
      await this.auditLogService.logAction(ownerId, 'CREATE_DOCUMENT', 'Document', savedDocument.id, { 
        title: savedDocument.title, 
        fornecedorId: fornecedor?.id,
        installmentsCount: uploadDto.installments.length,
        rateioCount: uploadDto.rateio.length,
      });

      return savedDocument;

    } catch (error) {
      // Se houve erro, tentar remover o arquivo do MinIO se foi criado
      try {
        await this.minioService.deleteFile(uniqueFileName);
        this.logger.log(`Removed file from MinIO due to error: ${uniqueFileName}`);
      } catch (deleteError) {
        this.logger.warn(`Could not remove file from MinIO: ${uniqueFileName}`, deleteError.message);
      }

      this.logger.error(`Error uploading document: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Erro interno do servidor ao fazer upload do documento.');
    }
  }

  async findAll(): Promise<Document[]> {
    this.logger.log('Fetching all documents');
    return this.documentRepository.find({
      relations: ['owner', 'fornecedor', 'installments', 'allocations'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Document> {
    this.logger.log(`Fetching document with ID: ${id}`);
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['owner', 'fornecedor', 'installments', 'allocations'],
    });

    if (!document) {
      this.logger.warn(`Document with ID ${id} not found`);
      throw new NotFoundException(`Documento com ID ${id} não encontrado.`);
    }

    return document;
  }

  async findByOwner(ownerId: number): Promise<Document[]> {
    this.logger.log(`Fetching documents for owner ID: ${ownerId}`);
    return this.documentRepository.find({
      where: { ownerId },
      relations: ['owner', 'fornecedor', 'installments', 'allocations'],
      order: { createdAt: 'DESC' }
    });
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto): Promise<Document> {
    this.logger.log(`Updating document with ID: ${id}`);
    
    const document = await this.findOne(id);
    
    // Atualizar campos básicos
    if (updateDocumentDto.title !== undefined) {
      document.title = updateDocumentDto.title.trim();
    }
    
    if (updateDocumentDto.description !== undefined) {
      document.description = updateDocumentDto.description?.trim() || null;
    }

    if (updateDocumentDto.tipoDocumento !== undefined) {
      document.tipoDocumento = updateDocumentDto.tipoDocumento;
    }

    if (updateDocumentDto.valor !== undefined) {
      document.valor = updateDocumentDto.valor || null;
    }

    if (updateDocumentDto.dataVencimento !== undefined) {
      document.dataVencimento = updateDocumentDto.dataVencimento ? new Date(updateDocumentDto.dataVencimento) : null;
    }

    if (updateDocumentDto.observacoes !== undefined) {
      document.observacoes = updateDocumentDto.observacoes?.trim() || null;
    }

    // Adicionado campo natureza
    if (updateDocumentDto.natureza !== undefined) {
      document.natureza = updateDocumentDto.natureza.trim();
    }

    // Atualizar fornecedor se fornecido
    if (updateDocumentDto.fornecedorId !== undefined) {
      if (updateDocumentDto.fornecedorId) {
        const fornecedor = await this.fornecedorRepository.findOne({ where: { id: updateDocumentDto.fornecedorId } });
        if (!fornecedor) {
          throw new NotFoundException(`Fornecedor com ID ${updateDocumentDto.fornecedorId} não encontrado.`);
        }
        document.fornecedorId = fornecedor.id;
      } else {
        document.fornecedorId = null;
      }
    }

    // Atualizar parcelas se fornecidas
    if (updateDocumentDto.installments !== undefined) {
      // Remover parcelas existentes e criar novas
      await this.installmentRepository.delete({ documentId: id });
      await this.processInstallments(id, updateDocumentDto.installments);
      this.logger.log(`Updated installments for document ${id}`);
    }

    // Atualizar rateio se fornecido
    if (updateDocumentDto.rateio !== undefined) {
      await this.allocationRepository.delete({ documentId: id });
      await this.processAllocations(id, updateDocumentDto.rateio);
      this.logger.log(`Updated allocations for document ${id}`);
    }

    const updatedDocument = await this.documentRepository.save(document);
    this.logger.log(`Document ${id} updated successfully`);
    
    return updatedDocument;
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing document with ID: ${id}`);
    
    const document = await this.findOne(id);
    
    // Remover arquivo do MinIO
    try {
      await this.minioService.deleteFile(document.filePath);
      this.logger.log(`File removed from MinIO: ${document.filePath}`);
    } catch (error) {
      this.logger.warn(`Could not remove file from MinIO: ${document.filePath}`, error.message);
    }
    
    // Remover documento do banco (cascade irá remover signatários, parcelas e rateios)
    await this.documentRepository.remove(document);
    this.logger.log(`Document ${id} removed successfully`);
  }

  async getDocumentFile(id: number): Promise<{ stream: Readable; fileName: string; mimeType: string }> {
    this.logger.log(`Getting file for document ID: ${id}`);
    
    const document = await this.findOne(id);
    
    try {
      // Baixar arquivo do MinIO
      const stream = await this.minioService.downloadFile(document.filePath);
      this.logger.log(`File stream retrieved from MinIO: ${document.filePath}`);
      
      return {
        stream: stream,
        fileName: document.fileName,
        mimeType: document.mimeType
      };
    } catch (error) {
      this.logger.error(`Error getting file from MinIO: ${document.filePath}`, error.message);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Erro ao recuperar arquivo do documento.');
    }
  }

  /**
   * Processa e salva as parcelas de um documento
   */
  private async processInstallments(
    documentId: number, 
    installments: Array<{
      installmentNumber: number;
      amount: number;
      dueDate: string;
      description?: string;
    }>
  ): Promise<void> {
    // Validar se os números das parcelas são únicos e sequenciais
    const installmentNumbers = installments.map(i => i.installmentNumber);
    const uniqueNumbers = new Set(installmentNumbers);
    
    if (uniqueNumbers.size !== installments.length) {
      throw new BadRequestException('Números de parcelas devem ser únicos.');
    }

    // Validar se a soma dos valores das parcelas não excede muito o valor total do documento (se definido)
    const document = await this.documentRepository.findOne({ where: { id: documentId } });
    if (document?.valor) {
      const totalInstallments = installments.reduce((sum, inst) => sum + inst.amount, 0);
      const difference = Math.abs(totalInstallments - document.valor);
      const tolerance = document.valor * 0.01; // 1% de tolerância
      
      if (difference > tolerance) {
        this.logger.warn(`Installments total (${totalInstallments}) differs from document value (${document.valor}) by ${difference}`);
      }
    }

    // Criar e salvar as parcelas
    const installmentEntities = installments.map(installment => 
      this.installmentRepository.create({
        documentId,
        installmentNumber: installment.installmentNumber,
        amount: installment.amount,
        dueDate: new Date(installment.dueDate),
        description: installment.description?.trim() || null,
        isPaid: false,
        paidDate: null
      })
    );

    await this.installmentRepository.save(installmentEntities);
  }

  /**
   * Processa e salva os rateios de um documento
   */
  private async processAllocations(
    documentId: number, 
    allocations: Array<{
      id: string;
      filial: string;
      centroCusto: string;
      valor: number;
      percentual: number;
    }>
  ): Promise<void> {
    const allocationEntities = allocations.map(allocation => 
      this.allocationRepository.create({
        documentId,
        filial: allocation.filial,
        centroCusto: allocation.centroCusto,
        valor: allocation.valor,
        percentual: allocation.percentual,
      })
    );
    await this.allocationRepository.save(allocationEntities);
  }

  /**
   * Busca parcelas de um documento específico
   */
  async getDocumentInstallments(documentId: number): Promise<DocumentInstallment[]> {
    this.logger.log(`Fetching installments for document ID: ${documentId}`);
    
    // Verificar se o documento existe
    await this.findOne(documentId);
    
    return this.installmentRepository.find({
      where: { documentId },
      order: { installmentNumber: 'ASC' }
    });
  }

  /**
   * Atualiza o status de pagamento de uma parcela
   */
  async updateInstallmentPaymentStatus(
    installmentId: number, 
    isPaid: boolean, 
    paidDate?: string
  ): Promise<DocumentInstallment> {
    this.logger.log(`Updating payment status for installment ID: ${installmentId}`);
    
    const installment = await this.installmentRepository.findOne({ where: { id: installmentId } });
    if (!installment) {
      throw new NotFoundException(`Parcela com ID ${installmentId} não encontrada.`);
    }

    installment.isPaid = isPaid;
    installment.paidDate = isPaid && paidDate ? new Date(paidDate) : null;

    return this.installmentRepository.save(installment);
  }

  async findSignatoriesByDocumentId(documentId: number): Promise<DocumentSignatory[]> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['signatories', 'signatories.user'],
    });

    if (!document) {
      throw new NotFoundException(`Documento com ID ${documentId} não encontrado.`);
    }

    return document.signatories;
  }

  async signDocument(documentId: number, userId: number): Promise<DocumentSignatory> {
    this.logger.log(`User ${userId} attempting to sign document ${documentId}`);

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['signatories', 'signatories.user'],
    });

    if (!document) {
      throw new NotFoundException(`Documento com ID ${documentId} não encontrado.`);
    }

    const userSignatory = document.signatories.find(s => s.user.id === userId);

    if (!userSignatory) {
      throw new BadRequestException(`Usuário ${userId} não é um signatário para o documento ${documentId}.`);
    }

    if (userSignatory.status === SignatoryStatus.SIGNED) {
      throw new BadRequestException(`Documento ${documentId} já foi assinado por ${userSignatory.user.name}.`);
    }

    // Verificar a ordem de assinatura
    const pendingSignatories = document.signatories
      .filter(s => s.status === SignatoryStatus.PENDING)
      .sort((a, b) => a.order - b.order);

    if (pendingSignatories.length > 0 && pendingSignatories[0].order !== userSignatory.order) {
      throw new BadRequestException(`Não é a vez do usuário ${userSignatory.user.name} assinar. A próxima assinatura é do signatário na ordem ${pendingSignatories[0].order}.`);
    }

    userSignatory.status = SignatoryStatus.SIGNED;
    userSignatory.signedAt = new Date();
    await this.documentSignatoryRepository.save(userSignatory);

    this.logger.log(`User ${userId} successfully signed document ${documentId}.`);

    // Verificar se todos os signatários assinaram
    const allSigned = document.signatories.every(s => s.status === SignatoryStatus.SIGNED);
    if (allSigned) {
      document.status = DocumentStatus.COMPLETED;
      await this.documentRepository.save(document);
      this.logger.log(`Document ${documentId} is now fully signed.`);
    }

    // Log de auditoria
    await this.auditLogService.logAction(userId, 'SIGN_DOCUMENT', 'Document', documentId, { 
      signatoryId: userSignatory.id, 
      documentStatus: document.status 
    });

    return userSignatory;
  }

  async rejectDocument(documentId: number, userId: number, reason: string): Promise<DocumentSignatory> {
    this.logger.log(`User ${userId} attempting to reject document ${documentId} with reason: ${reason}`);

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['signatories', 'signatories.user'],
    });

    if (!document) {
      throw new NotFoundException(`Documento com ID ${documentId} não encontrado.`);
    }

    const userSignatory = document.signatories.find(s => s.user.id === userId);

    if (!userSignatory) {
      throw new BadRequestException(`Usuário ${userId} não é um signatário para o documento ${documentId}.`);
    }

    if (userSignatory.status !== SignatoryStatus.PENDING) {
      throw new BadRequestException(`Documento ${documentId} já foi ${userSignatory.status === SignatoryStatus.SIGNED ? 'assinado' : 'rejeitado'} por ${userSignatory.user.name}.`);
    }

    userSignatory.status = SignatoryStatus.REJECTED;
    userSignatory.rejectionReason = reason;
    await this.documentSignatoryRepository.save(userSignatory);

    // Atualizar status do documento para REJECTED
    document.status = DocumentStatus.CANCELLED;
    await this.documentRepository.save(document);

    this.logger.log(`User ${userId} successfully rejected document ${documentId}.`);

    // Log de auditoria
    await this.auditLogService.logAction(userId, 'REJECT_DOCUMENT', 'Document', documentId, { 
      signatoryId: userSignatory.id, 
      rejectionReason: reason,
      documentStatus: document.status 
    });

    return userSignatory;
  }
}


