export interface AnalyticsEvent {
  id: string;
  name: string;
  timestamp: Date;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}
