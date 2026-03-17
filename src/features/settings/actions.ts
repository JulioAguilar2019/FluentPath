"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { defaultLocale, localeCookieName, locales, type Locale } from "@/features/i18n/messages";

function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

function parsePositiveNumber(value: FormDataEntryValue | null, fieldName: string) {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} must be greater than zero.`);
  }

  return parsed;
}

export async function updateSettingsAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const localeValue = typeof formData.get("locale") === "string" ? String(formData.get("locale")) : defaultLocale;
  const defaultTimerModeValue =
    typeof formData.get("defaultTimerMode") === "string" ? String(formData.get("defaultTimerMode")) : "free";

  const preferredLocale = isLocale(localeValue) ? localeValue : defaultLocale;
  const defaultTimerMode = defaultTimerModeValue === "pomodoro" ? "pomodoro" : "free";

  const pomodoroFocusMinutes = parsePositiveNumber(formData.get("pomodoroFocusMinutes"), "Pomodoro focus minutes");
  const pomodoroShortBreakMinutes = parsePositiveNumber(
    formData.get("pomodoroShortBreakMinutes"),
    "Pomodoro short break minutes"
  );
  const pomodoroLongBreakMinutes = parsePositiveNumber(
    formData.get("pomodoroLongBreakMinutes"),
    "Pomodoro long break minutes"
  );
  const pomodoroLongBreakInterval = parsePositiveNumber(
    formData.get("pomodoroLongBreakInterval"),
    "Pomodoro long break interval"
  );

  const { error } = await supabase
    .from("profiles")
    .update({
      preferred_locale: preferredLocale,
      default_timer_mode: defaultTimerMode,
      pomodoro_focus_minutes: pomodoroFocusMinutes,
      pomodoro_short_break_minutes: pomodoroShortBreakMinutes,
      pomodoro_long_break_minutes: pomodoroLongBreakMinutes,
      pomodoro_long_break_interval: pomodoroLongBreakInterval,
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, preferredLocale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  ["/settings", "/timer", "/dashboard", "/tasks", "/progress"].forEach((path) => {
    revalidatePath(path);
  });
}
