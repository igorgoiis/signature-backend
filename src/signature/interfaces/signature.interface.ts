import { PaginatedResponse } from "../../common/interfaces/paginated-response.interface";

export interface SignaturePosition {
  page: number;
  x: number;
  y: number;
}

export interface SignatureResponse {
  id: number;
  documentId: number;
  userId: number;
  signatureData: string;
  positionData: SignaturePosition | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PaginatedSignatureResponse = PaginatedResponse<SignatureResponse>;
