import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

import type { SessionHistoryWorkspace, StudySessionItem } from "./types";

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
        task:tasks(id, title)
      `,
      { count: "exact" }
    )
    .order("started_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  const sessions = ((data ?? []) as Array<StudySessionItem & { task: StudySessionItem["task"] | StudySessionItem["task"][] }>).map(
    (session) => ({
      ...session,
      task: Array.isArray(session.task) ? session.task[0] ?? null : session.task,
    })
  );

  return {
    sessions,
    totalSessions: sessions.length,
    totalFocusSeconds: sessions.reduce((sum, session) => sum + session.duration_seconds, 0),
    totalFreeSessions: sessions.filter((session) => session.mode === "free").length,
    totalPomodoroSessions: sessions.filter((session) => session.mode === "pomodoro").length,
  };
});
