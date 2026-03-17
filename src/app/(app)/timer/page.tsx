import Link from "next/link";

import { getMessages } from "@/features/i18n/server";
import { TimerWorkspaceClient } from "@/features/timer/components/timer-workspace-client";
import { getTimerWorkspace } from "@/features/timer/server";

export default async function TimerPage() {
  const workspace = await getTimerWorkspace();
  const { messages, locale } = await getMessages();
  const activeTasks = workspace.tasks;

  return (
    <main className="space-y-6 pb-8">
      {activeTasks.length > 0 ? (
        <TimerWorkspaceClient tasks={activeTasks} pomodoro={workspace.pomodoro} messages={messages} locale={locale} />
      ) : (
        <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
            {messages.timer.workspace.emptyBadge}
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            {messages.timer.workspace.emptyTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            {messages.timer.workspace.emptyDescription}
          </p>
          <Link
            href="/tasks"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {messages.timer.workspace.goToTasks}
          </Link>
        </section>
      )}
    </main>
  );
}
