export type EventCategory = 'Spiritual' | 'Community' | 'Sacraments' | 'Activities' | 'Evaluation' | 'Rest';

export interface MissionEvent {
  id: string;
  date: string;
  day: string;
  time: string;
  title: string;
  category: EventCategory;
  location?: string;
  reminder?: number; // Custom reminder time in minutes before the event
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export interface EvaluationData {
  id: string; // date + time identifier e.g., "18-20:00"
  content: string;
  createdAt: number;
}
