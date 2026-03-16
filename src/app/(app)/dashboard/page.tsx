import Link from "next/link";

import { getSessionHistoryWorkspace } from "@/features/progress/server";
import { getTaskWorkspace } from "@/features/tasks/server";
import { requireUser } from "@/lib/auth";

const nextStories = [
  "Pomodoro mode and dashboard metrics",
  "Bilingual support",
  "Settings and charts",
];

export default async function DashboardPage() {
  const user = await requireUser();
  const { tasks, categories } = await getTaskWorkspace();
  const { totalSessions, totalFocusSeconds } = await getSessionHistoryWorkspace();
  const activeTasks = tasks.filter((task) => task.status === "active").length;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;

  const trackedHours = Math.floor(totalFocusSeconds / 3600);
  const trackedMinutes = Math.floor((totalFocusSeconds % 3600) / 60);

  return (
    <main className="space-y-6 pb-8 text-slate-950">
      <div className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur xl:p-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-700">
              Protected workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard shell ready</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              You are authenticated as <span className="font-medium text-slate-900">{user.email}</span>. The workspace is protected and ready for the next stories.
            </p>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <p className="text-sm uppercase tracking-[0.26em] text-sky-300">Workspace snapshot</p>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-white/8 p-4">
                <p className="text-sm text-slate-300">Active tasks</p>
                <p className="mt-2 text-lg font-semibold">{activeTasks}</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-4">
                <p className="text-sm text-slate-300">Completed</p>
                <p className="mt-2 text-lg font-semibold">{completedTasks}</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-4">
                <p className="text-sm text-slate-300">Categories</p>
                <p className="mt-2 text-lg font-semibold">{categories.length}</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-4">
                <p className="text-sm text-slate-300">Sessions tracked</p>
                <p className="mt-2 text-lg font-semibold">{totalSessions}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {trackedHours > 0 ? `${trackedHours}h ${trackedMinutes}m` : `${trackedMinutes} min`}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-700">Next up</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {nextStories.map((story) => (
                <li key={story} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  {story}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link href="/tasks" className="rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50">
                Open tasks
              </Link>
              <Link href="/timer" className="rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50">
                Open timer
              </Link>
              <Link href="/progress" className="rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50">
                View history
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
