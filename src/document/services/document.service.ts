import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThanOrEqual, Repository } from "typeorm";
import { Document } from "../entities/document.entity";
import {
  UpdateDocumentDto,
  CreateDocumentDto,
  CreateInstallmentDto,
  CreateAllocationDto,
} from "../dto";
import {
  DocumentInstallment,
  DocumentAllocation,
  DocumentSignatory,
} from "../entities";
import { User } from "../../user/entities/user.entity";
import { Fornecedor } from "../../fornecedor/entities/fornecedor.entity";
import { AuditLogService } from "../../audit-log/audit-log.service";
import { Readable } from "stream";
import { DocumentStatus, DocumentType, SignatoryStatus } from "../types";
import { DocumentQueryDto } from "../dto/document/document-query.dto";
import { FileService } from "src/file/services/file.service";
import { RecentActivityActions } from "src/dashboard/constants/dashboard.constants";
import { AuditAction } from "src/audit-log/constants/audit-actions.constant";
import { addDays } from "date-fns";
import { PaymentInstallmentDto } from "../dto/installment/payment-installment.dto";
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
    private fileService: FileService,
  ) {}

  async findAll(queryDto: DocumentQueryDto): Promise<Document[]> {
    try {
      this.logger.log("Fetching all documents");

      const { limit, sort } = queryDto;
      const field = sort?.split(":")[0] || "createdAt";
      const sortOrder = sort?.split(":")[1] || "DESC";

      return this.documentRepository.find({
        relations: {
          owner: true,
          fornecedor: true,
          installments: true,
          allocations: true,
          file: true,
        },
        order: { [field]: sortOrder || "createdAt" },
      });
    } catch (error) {
      this.logger.error(
        `Error fetching documents: ${error.message}`,
        error.stack,
      );

      throw new InternalServerErrorException(
        "Erro ao buscar documentos. Tente novamente mais tarde.",
      );
    }
  }

  async findOne(id: number): Promise<Document> {
    this.logger.log(`Fetching document with ID: ${id}`);
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        fornecedor: true,
        installments: true,
        allocations: true,
        file: true,
      },
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
      relations: ["owner", "fornecedor", "installments", "allocations"],
      order: { createdAt: "DESC" },
    });
  }

  async update(
    id: number,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<Document> {
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
      document.dataVencimento = updateDocumentDto.dataVencimento
        ? new Date(updateDocumentDto.dataVencimento)
        : null;
    }

    if (updateDocumentDto.observacoes !== undefined) {
      document.observacoes = updateDocumentDto.observacoes?.trim() || null;
    }

    // Adicionado campo natureza
    if (updateDocumentDto.natureza !== undefined) {
      document.natureza = updateDocumentDto.natureza;
    }

    // Atualizar fornecedor se fornecido
    if (updateDocumentDto.fornecedorId !== undefined) {
      if (updateDocumentDto.fornecedorId) {
        const fornecedor = await this.fornecedorRepository.findOne({
          where: { id: updateDocumentDto.fornecedorId },
        });
        if (!fornecedor) {
          throw new NotFoundException(
            `Fornecedor com ID ${updateDocumentDto.fornecedorId} não encontrado.`,
          );
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
      await this.fileService.deleteFileFromStorage(document.file.filePath);
      this.logger.log(`File removed from MinIO: ${document.file.filePath}`);
    } catch (error) {
      this.logger.warn(
        `Could not remove file from MinIO: ${document.file.filePath}`,
        error.message,
      );
    }

    // Remover documento do banco (cascade irá remover signatários, parcelas e rateios)
    await this.documentRepository.remove(document);
    this.logger.log(`Document ${id} removed successfully`);
  }

  async getDocumentFile(
    id: number,
  ): Promise<{ stream: Readable; fileName: string; mimeType: string }> {
    this.logger.log(`Getting file for document ID: ${id}`);

    const document = await this.findOne(id);

    try {
      // Baixar arquivo do MinIO
      const stream = await this.fileService.downloadFileFromStorage(
        document.file.filePath,
      );
      this.logger.log(
        `File stream retrieved from MinIO: ${document.file.filePath}`,
      );

      return {
        stream: stream,
        fileName: document.file.fileName,
        mimeType: document.file.mimeType,
      };
    } catch (error) {
      this.logger.error(
        `Error getting file from MinIO: ${document.file.filePath}`,
        error.message,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        "Erro ao recuperar arquivo do documento.",
      );
    }
  }

  /**
   * Busca parcelas de um documento específico
   */
  async getDocumentInstallments(
    documentId: number,
  ): Promise<DocumentInstallment[]> {
    this.logger.log(`Fetching installments for document ID: ${documentId}`);

    // Verificar se o documento existe
    await this.findOne(documentId);

    return this.installmentRepository.find({
      where: { documentId },
      order: { installmentNumber: "ASC" },
    });
  }

  /**
   * Atualiza o status de pagamento de uma parcela
   */
  async updateInstallmentPaymentStatus(
    installmentId: number,
    isPaid: boolean,
    paidDate?: string,
  ): Promise<DocumentInstallment> {
    this.logger.log(
      `Updating payment status for installment ID: ${installmentId}`,
    );

    const installment = await this.installmentRepository.findOne({
      where: { id: installmentId },
    });
    if (!installment) {
      throw new NotFoundException(
        `Parcela com ID ${installmentId} não encontrada.`,
      );
    }

    installment.isPaid = isPaid;
    installment.paidDate = isPaid && paidDate ? new Date(paidDate) : null;

    return this.installmentRepository.save(installment);
  }

  async findSignatoriesByDocumentId(
    documentId: number,
  ): Promise<DocumentSignatory[]> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ["signatories", "signatories.user"],
    });

    if (!document) {
      throw new NotFoundException(
        `Documento com ID ${documentId} não encontrado.`,
      );
    }

    return document.signatories;
  }

  async signDocument(
    documentId: number,
    userId: number,
  ): Promise<DocumentSignatory> {
    this.logger.log(`User ${userId} attempting to sign document ${documentId}`);

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ["signatories", "signatories.user"],
    });

    if (!document) {
      throw new NotFoundException(
        `Documento com ID ${documentId} não encontrado.`,
      );
    }

    const userSignatory = document.signatories.find(
      (s) => s.user.id === userId,
    );

    if (!userSignatory) {
      throw new BadRequestException(
        `Usuário ${userId} não é um signatário para o documento ${documentId}.`,
      );
    }

    if (userSignatory.status === SignatoryStatus.SIGNED) {
      throw new BadRequestException(
        `Documento ${documentId} já foi assinado por ${userSignatory.user.name}.`,
      );
    }

    // Verificar a ordem de assinatura
    const pendingSignatories = document.signatories
      .filter((s) => s.status === SignatoryStatus.PENDING)
      .sort((a, b) => a.order - b.order);

    if (
      pendingSignatories.length > 0 &&
      pendingSignatories[0].order !== userSignatory.order
    ) {
      throw new BadRequestException(
        `Não é a vez do usuário ${userSignatory.user.name} assinar. A próxima assinatura é do signatário na ordem ${pendingSignatories[0].order}.`,
      );
    }

    userSignatory.status = SignatoryStatus.SIGNED;
    userSignatory.signedAt = new Date();
    await this.documentSignatoryRepository.save(userSignatory);

    this.logger.log(
      `User ${userId} successfully signed document ${documentId}.`,
    );

    // Verificar se todos os signatários assinaram
    const allSigned = document.signatories.every(
      (s) => s.status === SignatoryStatus.SIGNED,
    );
    if (allSigned) {
      document.status = DocumentStatus.COMPLETED;
      await this.documentRepository.save(document);
      this.logger.log(`Document ${documentId} is now fully signed.`);
    }

    // Log de auditoria
    await this.auditLogService.logAction(
      userId,
      AuditAction.SIGN_DOCUMENT,
      "Document",
      documentId,
      {
        signatoryId: userSignatory.id,
        documentStatus: document.status,
      },
    );

    return userSignatory;
  }

  async installmentPayment(
    documentId: number,
    installmentId: number,
    dto: PaymentInstallmentDto,
    userId: number,
  ): Promise<{ message: string }> {
    try {
      const document = await this.documentRepository.findOne({
        where: { id: documentId },
      });

      if (!document)
        throw new HttpException(
          `Documento com o ID ${documentId} não encontrado`,
          HttpStatus.BAD_REQUEST,
        );

      const installment = await this.installmentRepository.findOne({
        where: { id: installmentId, documentId },
      });

      if (!installment) {
        throw new HttpException(
          `Parcela com o ID ${installmentId} do documento com ID ${documentId} não encontrada`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const proofPayment = await this.fileService.findOneById(dto.fileId);

      if (!proofPayment)
        throw new HttpException(
          "O comprovante de pagamento precisa ser anexado",
          HttpStatus.BAD_REQUEST,
        );

      await this.installmentRepository.update(
        { id: installmentId, documentId },
        { isPaid: true, paidDate: dto.paymentDate, fileId: dto.fileId },
      );

      const installmentUpdated = await this.installmentRepository.findOne({
        where: { id: installmentId },
      });

      if (!installmentUpdated) {
        throw new HttpException(
          "Parcela atualizada não encontrada",
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.auditLogService.logAction(
        userId,
        AuditAction.PAID_INSTALLMENT,
        "Document Installment",
        installmentId,
        {
          installment: installmentUpdated,
          document: document,
          dto,
        },
      );

      return { message: "Pagamento realizado com sucesso" };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        "Houve um erro ao tentar realizar o pagamento da parcela.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async rejectDocument(
    documentId: number,
    userId: number,
    reason: string,
  ): Promise<DocumentSignatory> {
    this.logger.log(
      `User ${userId} attempting to reject document ${documentId} with reason: ${reason}`,
    );

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ["signatories", "signatories.user"],
    });

    if (!document) {
      throw new NotFoundException(
        `Documento com ID ${documentId} não encontrado.`,
      );
    }

    const userSignatory = document.signatories.find(
      (s) => s.user.id === userId,
    );

    if (!userSignatory) {
      throw new BadRequestException(
        `Usuário ${userId} não é um signatário para o documento ${documentId}.`,
      );
    }

    if (userSignatory.status !== SignatoryStatus.PENDING) {
      throw new BadRequestException(
        `Documento ${documentId} já foi ${userSignatory.status === SignatoryStatus.SIGNED ? "assinado" : "rejeitado"} por ${userSignatory.user.name}.`,
      );
    }

    userSignatory.status = SignatoryStatus.REJECTED;
    userSignatory.rejectionReason = reason;
    await this.documentSignatoryRepository.save(userSignatory);

    // Atualizar status do documento para REJECTED
    document.status = DocumentStatus.CANCELLED;
    await this.documentRepository.save(document);

    this.logger.log(
      `User ${userId} successfully rejected document ${documentId}.`,
    );

    // Log de auditoria
    await this.auditLogService.logAction(
      userId,
      AuditAction.REJECT_DOCUMENT,
      "Document",
      documentId,
      {
        signatoryId: userSignatory.id,
        rejectionReason: reason,
        documentStatus: document.status,
      },
    );

    return userSignatory;
  }

  async createDocument(
    createDocumentDto: CreateDocumentDto,
    ownerId: number,
  ): Promise<Document> {
    this.logger.log(`Starting document creation for user ${ownerId}`);

    // Validações básicas (algumas já feitas pelo class-validator no DTO)
    if (!createDocumentDto.title || createDocumentDto.title.trim() === "") {
      this.logger.error("Document title is required but not provided.");
      throw new BadRequestException("Título do documento é obrigatório.");
    }

    // A validação de signatários, parcelas e rateio vazios já está no DTO com @IsNotEmpty

    // Verificar fornecedor (opcional)
    let fornecedor: Fornecedor | null = null;
    if (createDocumentDto.fornecedorId) {
      fornecedor = await this.fornecedorRepository.findOne({
        where: { id: createDocumentDto.fornecedorId },
      });
      if (!fornecedor) {
        this.logger.error(
          `Fornecedor with ID ${createDocumentDto.fornecedorId} not found.`,
        );
        throw new NotFoundException(
          `Fornecedor com ID ${createDocumentDto.fornecedorId} não encontrado.`,
        );
      }
    }

    // A validação de mimetype já foi feita na rota de upload de arquivo
    // A validação de hash duplicado já foi feita na rota de upload de arquivo

    try {
      await this.fileService.findOneById(createDocumentDto.fileId);

      // Criar documento no banco de dados
      const document = this.documentRepository.create({
        title: createDocumentDto.title.trim(),
        description: createDocumentDto.description?.trim() || null,
        fileId: createDocumentDto.fileId,
        ownerId: ownerId,
        fornecedorId: createDocumentDto.fornecedorId || null,
        tipoDocumento: createDocumentDto.tipoDocumento || DocumentType.GENERAL,
        valor: createDocumentDto.valor || null,
        dataVencimento: createDocumentDto.dataVencimento
          ? new Date(createDocumentDto.dataVencimento)
          : null,
        observacoes: createDocumentDto.observacoes?.trim() || null,
        natureza: createDocumentDto.natureza,
        status: DocumentStatus.PENDING,
      });

      const savedDocument = await this.documentRepository.save(document);
      this.logger.log(`Document saved with ID: ${savedDocument.id}`);

      // Processar signatários
      const signatoryEntities = await Promise.all(
        createDocumentDto.signatories.map(async (s) => {
          const user = await this.userRepository.findOne({
            where: { id: s.userId },
          });
          if (!user) {
            throw new NotFoundException(
              `Usuário com ID ${s.userId} não encontrado para signatário.`,
            );
          }
          return this.documentSignatoryRepository.create({
            order: s.order,
            status: SignatoryStatus.PENDING,
            document: savedDocument,
            user,
          });
        }),
      );
      await this.documentSignatoryRepository.save(signatoryEntities);
      this.logger.log(
        `Processed ${signatoryEntities.length} signatories for document ${savedDocument.id}`,
      );

      // Processar parcelas
      await this.processInstallments(
        savedDocument.id,
        createDocumentDto.installments,
      );
      this.logger.log(
        `Processed ${createDocumentDto.installments.length} installments for document ${savedDocument.id}`,
      );

      // Processar rateio
      await this.processAllocations(savedDocument.id, createDocumentDto.rateio);
      this.logger.log(
        `Processed ${createDocumentDto.rateio.length} allocation items for document ${savedDocument.id}`,
      );

      // Log de auditoria
      await this.auditLogService.logAction(
        ownerId,
        AuditAction.CREATE_DOCUMENT,
        "Document",
        savedDocument.id,
        {
          title: savedDocument.title,
          fornecedorId: fornecedor?.id,
          installmentsCount: createDocumentDto.installments.length,
          rateioCount: createDocumentDto.rateio.length,
        },
      );

      return savedDocument;
    } catch (error) {
      this.logger.error(
        `Error creating document: ${error.message}`,
        error.stack,
      );

      // Se houve erro no processamento do documento, o arquivo já está no MinIO.
      // Você pode adicionar uma lógica aqui para remover o arquivo do MinIO se
      // o processamento falhar, mas isso introduz complexidade de transação distribuída.
      // Uma alternativa é ter um job de limpeza que remove arquivos órfãos no MinIO.

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        "Erro interno do servidor ao processar o documento.",
      );
    }
  }

  async findInstallmentsForExpiredAndUpcomingDocuments(): Promise<Document[]> {
    try {
      const goalDate = addDays(new Date(), 5);

      const documents = await this.documentRepository.find({
        where: {
          installments: { dueDate: LessThanOrEqual(goalDate), isPaid: false },
        },
        relations: {
          allocations: true,
          fornecedor: true,
          installments: true,
          signatories: {
            user: true,
          },
          owner: true,
        },
      });

      return documents;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        "Houve um erro ao tentar buscar as parcelas vencidas e à vencer dos documentos",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  private async processInstallments(
    documentId: number,
    installments: CreateInstallmentDto[],
  ): Promise<void> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found.`);
    }

    const installmentEntities = installments.map((i) =>
      this.installmentRepository.create({
        document: document,
        installmentNumber: i.installmentNumber,
        amount: i.amount,
        dueDate: new Date(i.dueDate),
        description: i.description,
      }),
    );
    await this.installmentRepository.save(installmentEntities);
  }

  private async processAllocations(
    documentId: number,
    allocations: CreateAllocationDto[],
  ): Promise<void> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found.`);
    }

    const allocationEntities = allocations.map((a) =>
      this.allocationRepository.create({
        document: document,
        filial: a.filial,
        centroCusto: a.centroCusto,
        valor: a.valor,
        percentual: a.percentual,
      }),
    );
    await this.allocationRepository.save(allocationEntities);
  }
}
