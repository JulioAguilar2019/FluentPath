import Link from "next/link";

import { FreeTimerClient } from "@/features/timer/components/free-timer-client";
import { getTaskWorkspace } from "@/features/tasks/server";

export default async function TimerPage() {
  const { tasks } = await getTaskWorkspace();
  const activeTasks = tasks.filter((task) => task.status === "active");

  return (
    <main className="space-y-6 pb-8">
      {activeTasks.length > 0 ? (
        <FreeTimerClient tasks={activeTasks} />
      ) : (
        <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
            Free timer
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            Create an active task before starting a study session.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            The timer is ready, but it needs a task to attach the session to. Add one in the task workspace and come back here.
          </p>
          <Link
            href="/tasks"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Go to tasks
          </Link>
        </section>
      )}
    </main>
  );
}
