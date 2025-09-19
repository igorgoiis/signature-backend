export interface LogActionParams {
  userId: number | null;
  action: string;
  entityType: string;
  entityId: number;
  details?: Record<string, any>;
}
