export type StudySessionItem = {
  id: string;
  mode: "free" | "pomodoro";
  status: "completed" | "cancelled" | "abandoned";
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  focus_minutes: number | null;
  break_minutes: number | null;
  pomodoro_cycles: number;
  notes: string | null;
  task_id: string | null;
  task: {
    id: string;
    title: string;
  } | null;
};

export type SessionHistoryWorkspace = {
  sessions: StudySessionItem[];
  totalSessions: number;
  totalFocusSeconds: number;
  totalFreeSessions: number;
  totalPomodoroSessions: number;
  weeklyActivity: Array<{
    date: string;
    label: string;
    totalMinutes: number;
  }>;
  categoryBreakdown: Array<{
    name: string;
    minutes: number;
    color: string;
  }>;
};
