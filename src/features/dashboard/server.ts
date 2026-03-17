import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

import type { DashboardMetricWorkspace } from "./types";

type SessionRow = {
  id: string;
  started_at: string;
  duration_seconds: number;
  mode: "free" | "pomodoro";
  task: { title: string } | { title: string }[] | null;
};

type TaskStatusRow = {
  status: "active" | "completed" | "archived";
};

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function startOfWeek() {
  const today = startOfToday();
  const day = today.getDay();
  const offset = day === 0 ? 6 : day - 1;
  today.setDate(today.getDate() - offset);
  return today;
}

function normalizeDateKey(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentStreak(sessions: SessionRow[]) {
  const studyDays = new Set(sessions.map((session) => normalizeDateKey(session.started_at)));
  const cursor = startOfToday();
  let streak = 0;

  while (studyDays.has(normalizeDateKey(cursor.toISOString()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export const getDashboardWorkspace = cache(async (): Promise<DashboardMetricWorkspace> => {
  const supabase = await createClient();

  const [sessionsResponse, tasksResponse] = await Promise.all([
    supabase
      .from("study_sessions")
      .select(
        `
          id,
          started_at,
          duration_seconds,
          mode,
          task:tasks(title)
        `
      )
      .eq("status", "completed")
      .order("started_at", { ascending: false })
      .limit(200),
    supabase.from("tasks").select("status"),
  ]);

  if (sessionsResponse.error) {
    throw new Error(sessionsResponse.error.message);
  }

  if (tasksResponse.error) {
    throw new Error(tasksResponse.error.message);
  }

  const sessions = (sessionsResponse.data ?? []) as SessionRow[];
  const tasks = (tasksResponse.data ?? []) as TaskStatusRow[];

  const todayStart = startOfToday();
  const weekStart = startOfWeek();

  const todaySeconds = sessions.reduce((sum, session) => {
    return new Date(session.started_at) >= todayStart ? sum + session.duration_seconds : sum;
  }, 0);

  const weekSeconds = sessions.reduce((sum, session) => {
    return new Date(session.started_at) >= weekStart ? sum + session.duration_seconds : sum;
  }, 0);

  return {
    todaySeconds,
    weekSeconds,
    totalSessions: sessions.length,
    activeTasks: tasks.filter((task) => task.status === "active").length,
    completedTasks: tasks.filter((task) => task.status === "completed").length,
    currentStreak: getCurrentStreak(sessions),
    recentActivity: sessions.slice(0, 5).map((session) => ({
      id: session.id,
      startedAt: session.started_at,
      durationSeconds: session.duration_seconds,
      mode: session.mode,
      taskTitle: Array.isArray(session.task)
        ? session.task[0]?.title ?? null
        : session.task?.title ?? null,
    })),
  };
});
