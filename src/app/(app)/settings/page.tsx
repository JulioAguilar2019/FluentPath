import { getMessages } from "@/features/i18n/server";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { getSettingsWorkspace } from "@/features/settings/server";

export default async function SettingsPage() {
  const { messages } = await getMessages();
  const settings = await getSettingsWorkspace();

  return (
    <main className="space-y-6 pb-8 text-slate-950">
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.15)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">
            {messages.settings.badge}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{messages.settings.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            {messages.settings.description}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm text-slate-500">{messages.settings.languageCard}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {settings.preferred_locale === "es" ? messages.localeNames.es : messages.localeNames.en}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm text-slate-500">{messages.settings.modeCard}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {settings.default_timer_mode === "pomodoro" ? messages.common.pomodoro : messages.common.freeTimer}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm text-slate-500">{messages.settings.focusCard}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {settings.pomodoro_focus_minutes} min
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm text-slate-500">{messages.settings.breakCard}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {settings.pomodoro_short_break_minutes}/{settings.pomodoro_long_break_minutes} min
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="mb-5 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
            {messages.settings.formTitle}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            {messages.settings.overviewTitle}
          </h2>
          <p className="text-sm text-slate-600">{messages.settings.formDescription}</p>
          <p className="text-sm text-slate-600">{messages.settings.overviewDescription}</p>
        </div>

        <SettingsForm messages={messages} defaults={settings} />
      </section>
    </main>
  );
}
