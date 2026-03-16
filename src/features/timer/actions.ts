"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const TIMER_REVALIDATE_PATHS = ["/timer", "/dashboard", "/progress"];

type SaveFreeSessionInput = {
  taskId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  notes?: string | null;
};

function revalidateTimerViews() {
  TIMER_REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
}

export async function saveFreeSessionAction(input: SaveFreeSessionInput) {
  const user = await requireUser();
  const supabase = await createClient();

  if (!input.taskId) {
    throw new Error("Task is required.");
  }

  if (!input.startedAt || !input.endedAt) {
    throw new Error("Session timestamps are required.");
  }

  if (!Number.isInteger(input.durationSeconds) || input.durationSeconds <= 0) {
    throw new Error("Duration must be greater than zero.");
  }

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", input.taskId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (taskError) {
    throw new Error(taskError.message);
  }

  if (!task) {
    throw new Error("The selected task is not available.");
  }

  const { error } = await supabase.from("study_sessions").insert({
    user_id: user.id,
    task_id: input.taskId,
    mode: "free",
    status: "completed",
    started_at: input.startedAt,
    ended_at: input.endedAt,
    duration_seconds: input.durationSeconds,
    notes: input.notes?.trim() ? input.notes.trim() : null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidateTimerViews();
}
