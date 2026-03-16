export type DashboardMetricWorkspace = {
  todaySeconds: number;
  weekSeconds: number;
  totalSessions: number;
  activeTasks: number;
  completedTasks: number;
  currentStreak: number;
  recentActivity: Array<{
    id: string;
    startedAt: string;
    durationSeconds: number;
    mode: "free" | "pomodoro";
    taskTitle: string | null;
  }>;
};
