"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { defaultLocale, locales, messages as allMessages, type Locale, type Messages } from "@/features/i18n/messages";

import { updateSettingsAction } from "../actions";

type SettingsFormProps = {
  messages: Messages;
  defaults: {
    preferred_locale: Locale;
    default_timer_mode: "free" | "pomodoro";
    pomodoro_focus_minutes: number;
    pomodoro_short_break_minutes: number;
    pomodoro_long_break_minutes: number;
    pomodoro_long_break_interval: number;
  };
};

export function SettingsForm({ messages, defaults }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function resolveLocale(value: FormDataEntryValue | null): Locale {
    return typeof value === "string" && locales.includes(value as Locale)
      ? (value as Locale)
      : defaultLocale;
  }

  async function handleSubmit(formData: FormData) {
    setSuccessMessage(null);
    setErrorMessage(null);

    const nextLocale = resolveLocale(formData.get("locale"));

    startTransition(async () => {
      try {
        await updateSettingsAction(formData);
        setSuccessMessage(allMessages[nextLocale].settings.success);
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : allMessages[nextLocale].settings.genericError
        );
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          {messages.settings.language}
          <select
            name="locale"
            defaultValue={defaults.preferred_locale}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400"
          >
            <option value="en">{messages.localeNames.en}</option>
            <option value="es">{messages.localeNames.es}</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          {messages.settings.defaultMode}
          <select
            name="defaultTimerMode"
            defaultValue={defaults.default_timer_mode}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400"
          >
            <option value="free">{messages.common.freeTimer}</option>
            <option value="pomodoro">{messages.common.pomodoro}</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          {messages.settings.focusMinutes}
          <input
            type="number"
            min={1}
            name="pomodoroFocusMinutes"
            defaultValue={defaults.pomodoro_focus_minutes}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          {messages.settings.shortBreakMinutes}
          <input
            type="number"
            min={1}
            name="pomodoroShortBreakMinutes"
            defaultValue={defaults.pomodoro_short_break_minutes}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          {messages.settings.longBreakMinutes}
          <input
            type="number"
            min={1}
            name="pomodoroLongBreakMinutes"
            defaultValue={defaults.pomodoro_long_break_minutes}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          {messages.settings.longBreakInterval}
          <input
            type="number"
            min={1}
            name="pomodoroLongBreakInterval"
            defaultValue={defaults.pomodoro_long_break_interval}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400"
          />
        </label>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? messages.settings.saving : messages.settings.save}
      </button>
    </form>
  );
}
