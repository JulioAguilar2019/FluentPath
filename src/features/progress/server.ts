import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

import type { SessionHistoryWorkspace, StudySessionItem } from "./types";

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

export const getSessionHistoryWorkspace = cache(async (): Promise<SessionHistoryWorkspace> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("study_sessions")
    .select(
      `
        id,
        mode,
        status,
        started_at,
        ended_at,
        duration_seconds,
        focus_minutes,
        break_minutes,
        pomodoro_cycles,
        notes,
        task_id,
        task:tasks(id, title, category:task_categories(name_en, color))
      `,
      { count: "exact" }
    )
    .order("started_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  const sessions = ((data ?? []) as Array<
    StudySessionItem & {
      task:
        | (StudySessionItem["task"] & {
            category?: { name_en: string; color: string } | { name_en: string; color: string }[] | null;
          })
        | (StudySessionItem["task"] & {
            category?: { name_en: string; color: string } | { name_en: string; color: string }[] | null;
          })[]
        | null;
    }
  >).map((session) => ({
    ...session,
    task: Array.isArray(session.task) ? session.task[0] ?? null : session.task,
  }));

  const weeklyActivityMap = new Map(createLast7DaysTemplate().map((day) => [day.key, day]));
  const categoryTotals = new Map<string, { name: string; minutes: number; color: string }>();

  sessions.forEach((session) => {
    const sessionDate = session.started_at.slice(0, 10);
    const dayEntry = weeklyActivityMap.get(sessionDate);

    if (dayEntry) {
      dayEntry.totalMinutes += Math.round(session.duration_seconds / 60);
    }

    const taskCategory = session.task && "category" in session.task ? session.task.category : null;
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
    sessions,
    totalSessions: sessions.length,
    totalFocusSeconds: sessions.reduce((sum, session) => sum + session.duration_seconds, 0),
    totalFreeSessions: sessions.filter((session) => session.mode === "free").length,
    totalPomodoroSessions: sessions.filter((session) => session.mode === "pomodoro").length,
    weeklyActivity: Array.from(weeklyActivityMap.values()).map(({ key, ...rest }) => ({
      date: key,
      ...rest,
    })),
    categoryBreakdown: Array.from(categoryTotals.values()).sort((a, b) => b.minutes - a.minutes),
  };
});
