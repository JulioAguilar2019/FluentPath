import { cache } from "react";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const getSettingsWorkspace = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "preferred_locale, default_timer_mode, pomodoro_focus_minutes, pomodoro_short_break_minutes, pomodoro_long_break_minutes, pomodoro_long_break_interval"
    )
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
});
