export interface IDocumentAllocation {
  id: number;
  documentId: number;
  filial: string;
  centroCusto: string;
  valor: number;
  percentual: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
