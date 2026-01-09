export interface UserMetadataType {
  id: number;
  max_streak: number;
  current_streak: number;
  routine_start_date: number;
}

export interface TrainingDay {
  day: number;
  status: string;
}

export type Status = 'completed' | 'failed' | 'pending';

export interface TrainingLogs {
  id: number;
  user_id: number;
  date_recorded: string;
  status: Status;
}

export type EventMap = Record<string, TrainingLogs[]>;