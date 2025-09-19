export interface SectorResponse {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// export interface PaginatedSectorsResponse {
//   data: SectorResponse[];
//   meta: {
//     total: number;
//     page: number;
//     limit: number;
//     totalPages: number;
//   };
// }
