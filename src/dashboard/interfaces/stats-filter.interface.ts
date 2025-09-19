import { DocumentStatus } from "../../document/types";

export interface StatsFilter {
  sectorId?: number;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  status?: DocumentStatus;
}

export interface StatsFilterOptions {
  filterBySector: boolean;
  filterByDateRange: boolean;
}
