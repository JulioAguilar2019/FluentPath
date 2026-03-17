export type DashboardMetricWorkspace = {
  todaySeconds: number;
  weekSeconds: number;
  totalSessions: number;
  activeTasks: number;
  completedTasks: number;
  currentStreak: number;
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
  recentActivity: Array<{
    id: string;
    startedAt: string;
    durationSeconds: number;
    mode: "free" | "pomodoro";
    taskTitle: string | null;
  }>;
};
