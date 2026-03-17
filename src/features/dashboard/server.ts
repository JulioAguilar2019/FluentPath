import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

import type { DashboardMetricWorkspace } from "./types";

type SessionRow = {
  id: string;
  started_at: string;
  duration_seconds: number;
  mode: "free" | "pomodoro";
  task:
    | ({ title: string; category?: { name_en: string; color: string } | { name_en: string; color: string }[] | null } | null)
    | ({ title: string; category?: { name_en: string; color: string } | { name_en: string; color: string }[] | null } | null)[];
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

function createLast7DaysTemplate() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));

    return {
      key: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("en", { weekday: "short" }).format(date),
      totalMinutes: 0,
    };
  });
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
          task:tasks(title, category:task_categories(name_en, color))
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

  const weeklyActivityMap = new Map(createLast7DaysTemplate().map((day) => [day.key, day]));
  const categoryTotals = new Map<string, { name: string; minutes: number; color: string }>();

  sessions.forEach((session) => {
    const sessionDate = session.started_at.slice(0, 10);
    const dayEntry = weeklyActivityMap.get(sessionDate);

    if (dayEntry) {
      dayEntry.totalMinutes += Math.round(session.duration_seconds / 60);
    }

    const task = Array.isArray(session.task) ? session.task[0] ?? null : session.task;
    const taskCategory = task?.category;
    const category = Array.isArray(taskCategory) ? taskCategory[0] ?? null : taskCategory;

    if (category) {
      const existing = categoryTotals.get(category.name_en);

      if (existing) {
        existing.minutes += Math.round(session.duration_seconds / 60);
      } else {
        categoryTotals.set(category.name_en, {
          name: category.name_en,
          minutes: Math.round(session.duration_seconds / 60),
          color: category.color,
        });
      }
    }
  });

  return {
    todaySeconds,
    weekSeconds,
    totalSessions: sessions.length,
    activeTasks: tasks.filter((task) => task.status === "active").length,
    completedTasks: tasks.filter((task) => task.status === "completed").length,
    currentStreak: getCurrentStreak(sessions),
    weeklyActivity: Array.from(weeklyActivityMap.values()).map(({ key, ...rest }) => ({
      date: key,
      ...rest,
    })),
    categoryBreakdown: Array.from(categoryTotals.values()).sort((a, b) => b.minutes - a.minutes),
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
