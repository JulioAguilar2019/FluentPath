"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Locale, Messages } from "@/features/i18n/messages";

type LocaleSwitcherProps = {
  locale: Locale;
  messages: Messages;
};

export function LocaleSwitcher({ locale, messages }: LocaleSwitcherProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleChange(nextLocale: Locale) {
    setIsPending(true);

    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    });

    router.refresh();
    setIsPending(false);
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-600">
      <span>{messages.localeLabel}</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={(event) => handleChange(event.target.value as Locale)}
        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <option value="en">{messages.localeNames.en}</option>
        <option value="es">{messages.localeNames.es}</option>
      </select>
    </label>
  );
}
