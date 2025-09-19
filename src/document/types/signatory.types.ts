export enum SignatoryStatus {
  PENDING = "PENDING",
  SIGNED = "SIGNED",
  REJECTED = "REJECTED",
}

export interface IDocumentSignatory {
  id: number;
  documentId: number;
  userId: number;
  order: number;
  status: SignatoryStatus;
  signedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
