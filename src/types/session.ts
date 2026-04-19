export const SESSION_RECORD_KEYS = [
  'session_id',
  'start_time',
  'end_time',
  'duration_seconds',
  'custom_name',
  'method',
  'amount',
  'amount_unit',
  'rating',
  'is_adjusted',
] as const;

export interface SessionRecord {
  session_id: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  custom_name?: string;
  method?: string;
  amount?: number;
  amount_unit?: 'g' | 'mg';
  rating?: string;
  is_adjusted?: boolean;
}
