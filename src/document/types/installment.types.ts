export interface IDocumentInstallment {
  id: number;
  documentId: number;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  description: string | null;
  isPaid: boolean;
  paidDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
