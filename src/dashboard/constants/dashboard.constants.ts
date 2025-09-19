export enum DashboardTimeRange {
  TODAY = "today",
  LAST_7_DAYS = "last7days",
  LAST_30_DAYS = "last30days",
  THIS_MONTH = "thisMonth",
  LAST_MONTH = "lastMonth",
  CUSTOM = "custom",
}

export enum RecentActivityActions {
  DOCUMENT_CREATED = "DOCUMENT_CREATED",
  SIGN_DOCUMENT = "SIGN_DOCUMENT",
  REJECT_DOCUMENT = "REJECT_DOCUMENT",
  CREATE_SIGNATURE = "CREATE_SIGNATURE",
}

export const ACTIVITY_DEFAULT_LIMIT = 10;
export const ACTIVE_USERS_DAYS = 30;
