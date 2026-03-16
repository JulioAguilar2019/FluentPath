import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

import type { TaskCategory, TaskItem, TaskWorkspace } from "./types";

export const getTaskWorkspace = cache(async (): Promise<TaskWorkspace> => {
  const supabase = await createClient();

  const [{ data: categories, error: categoriesError }, { data: tasks, error: tasksError }] =
    await Promise.all([
      supabase
        .from("task_categories")
        .select("id, slug, name_en, name_es, color")
        .order("sort_order", { ascending: true }),
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
        .order("created_at", { ascending: false }),
    ]);

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  return {
    categories: (categories ?? []) as TaskCategory[],
    tasks: ((tasks ?? []) as Array<TaskItem & { category: TaskCategory | TaskCategory[] | null }>).map(
      (task) => ({
        ...task,
        category: Array.isArray(task.category) ? task.category[0] ?? null : task.category,
      })
    ),
  };
});
