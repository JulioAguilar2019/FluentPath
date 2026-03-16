import { cache } from "react";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import type { TaskCategory, TaskItem } from "@/features/tasks/types";

import type { TimerWorkspace } from "./types";

export const getTimerWorkspace = cache(async (): Promise<TimerWorkspace> => {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: profile, error: profileError }, { data: tasks, error: tasksError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "pomodoro_focus_minutes, pomodoro_short_break_minutes, pomodoro_long_break_minutes, pomodoro_long_break_interval"
        )
        .eq("id", user.id)
        .single(),
      supabase
        .from("tasks")
        .select(
          `
            id,
            title,
            description,
            target_minutes,
            timer_mode_preference,
            status,
            completed_at,
            created_at,
            updated_at,
            category_id,
            category:task_categories(id, slug, name_en, name_es, color)
          `
        )
        .eq("status", "active")
        .order("created_at", { ascending: false }),
    ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  const normalizedTasks = ((tasks ?? []) as Array<
    TaskItem & { category: TaskCategory | TaskCategory[] | null }
  >).map((task) => ({
    ...task,
    category: Array.isArray(task.category) ? task.category[0] ?? null : task.category,
  }));

  return {
    tasks: normalizedTasks,
    pomodoro: {
      focusMinutes: profile.pomodoro_focus_minutes,
      shortBreakMinutes: profile.pomodoro_short_break_minutes,
      longBreakMinutes: profile.pomodoro_long_break_minutes,
      longBreakInterval: profile.pomodoro_long_break_interval,
    },
  };
});
