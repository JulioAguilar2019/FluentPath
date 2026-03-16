import type { TaskItem } from "@/features/tasks/types";

export type PomodoroPreferences = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
};

export type TimerWorkspace = {
  tasks: TaskItem[];
  pomodoro: PomodoroPreferences;
};
