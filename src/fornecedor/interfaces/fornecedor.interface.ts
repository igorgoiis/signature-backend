import { PaginatedResponse } from "../../common/interfaces/paginated-response.interface";

export interface FornecedorResponse {
  id: number;
  codigo: string;
  cpfCnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FornecedorCreateParams {
  codigo: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
}

export interface FornecedorUpdateParams {
  codigo?: string;
  cnpj?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
}

export type PaginatedFornecedorResponse = PaginatedResponse<FornecedorResponse>;

export interface FornecedorSearchParams {
  searchTerm?: string;
  // page?: number;
  // limit?: number;
}
