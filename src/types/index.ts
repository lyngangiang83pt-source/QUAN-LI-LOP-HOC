export type AttendanceStatus = 'present' | 'late' | 'absent';

export interface Student {
  id: string; // e.g., 'HS01'
  name: string;
  attendance: AttendanceStatus;
  points: number;
  lastNote?: string;
  dbId?: number; // Supabase Primary Key
}

export interface ClassItem {
  id: string; // e.g., 'class_10a1'
  dbId?: number; // Supabase Primary Key
  name: string; // e.g., '10A1'
  subject: string; // e.g., 'Tin học'
  defaultPoints: number;
  students: Student[];
}

export interface Criteria {
  icon: string;
  label: string;
  pts: number;
}

export type FilterType = 'all' | 'top' | 'qualified' | 'present' | 'absent';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'wheel' | 'rank' | 'info';
}

export type SyncState = 'idle' | 'syncing' | 'connected' | 'error' | 'offline';

export interface SyncStatus {
  state: SyncState;
  message: string;
}
