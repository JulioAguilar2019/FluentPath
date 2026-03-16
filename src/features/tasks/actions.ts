"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const TASK_PATHS = ["/tasks", "/dashboard"];

function parseOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseRequiredString(value: FormDataEntryValue | null, fieldName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} is required.`);
  }

  return value.trim();
}

function parsePositiveInt(value: FormDataEntryValue | null, fieldName: string) {
  const rawValue = typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;

  if (!Number.isInteger(rawValue) || rawValue <= 0) {
    throw new Error(`${fieldName} must be a positive number.`);
  }

  return rawValue;
}

function revalidateTaskViews() {
  TASK_PATHS.forEach((path) => revalidatePath(path));
}

export async function createTaskAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const title = parseRequiredString(formData.get("title"), "Title");
  const description = parseOptionalString(formData.get("description"));
  const categoryId = parseOptionalString(formData.get("categoryId"));
  const targetMinutes = parsePositiveInt(formData.get("targetMinutes"), "Target minutes");
  const timerModePreference = parseOptionalString(formData.get("timerModePreference"));

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    title,
    description,
    category_id: categoryId,
    target_minutes: targetMinutes,
    timer_mode_preference: timerModePreference,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidateTaskViews();
}

export async function updateTaskAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const taskId = parseRequiredString(formData.get("taskId"), "Task id");
  const title = parseRequiredString(formData.get("title"), "Title");
  const description = parseOptionalString(formData.get("description"));
  const categoryId = parseOptionalString(formData.get("categoryId"));
  const targetMinutes = parsePositiveInt(formData.get("targetMinutes"), "Target minutes");
  const timerModePreference = parseOptionalString(formData.get("timerModePreference"));

  const { error } = await supabase
    .from("tasks")
    .update({
      title,
      description,
      category_id: categoryId,
      target_minutes: targetMinutes,
      timer_mode_preference: timerModePreference,
    })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateTaskViews();
}

export async function completeTaskAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const taskId = parseRequiredString(formData.get("taskId"), "Task id");

  const { error } = await supabase
    .from("tasks")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateTaskViews();
}

export async function activateTaskAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const taskId = parseRequiredString(formData.get("taskId"), "Task id");

  const { error } = await supabase
    .from("tasks")
    .update({
      status: "active",
      completed_at: null,
    })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateTaskViews();
}

export async function archiveTaskAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const taskId = parseRequiredString(formData.get("taskId"), "Task id");

  const { error } = await supabase
    .from("tasks")
    .update({ status: "archived" })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateTaskViews();
}
