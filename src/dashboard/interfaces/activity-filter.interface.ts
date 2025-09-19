export interface ActivityFilter {
  sectorId?: number;
  userId?: number;
  entityType?: string;
  entityId?: number;
  startDate?: Date;
  endDate?: Date;
  actions?: string[];
  limit?: number;
}
