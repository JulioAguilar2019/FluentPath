import Link from "next/link";

import { getDashboardWorkspace } from "@/features/dashboard/server";
import { requireUser } from "@/lib/auth";

const nextStories = [
  "Pomodoro mode",
  "Bilingual support",
  "Settings and charts",
];

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const user = await requireUser();
  const dashboard = await getDashboardWorkspace();

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
              You are authenticated as <span className="font-medium text-slate-900">{user.email}</span>. Your workspace now surfaces real study metrics built from tasks and saved sessions.
            </p>
          </div>
        </header>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
              <p className="text-sm uppercase tracking-[0.26em] text-sky-300">Core metrics</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-sm text-slate-300">Today</p>
                  <p className="mt-2 text-2xl font-semibold">{formatDuration(dashboard.todaySeconds)}</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-sm text-slate-300">This week</p>
                  <p className="mt-2 text-2xl font-semibold">{formatDuration(dashboard.weekSeconds)}</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-sm text-slate-300">Sessions</p>
                  <p className="mt-2 text-2xl font-semibold">{dashboard.totalSessions}</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-sm text-slate-300">Active tasks</p>
                  <p className="mt-2 text-2xl font-semibold">{dashboard.activeTasks}</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-sm text-slate-300">Completed tasks</p>
                  <p className="mt-2 text-2xl font-semibold">{dashboard.completedTasks}</p>
                </div>
                <div className="rounded-2xl bg-linear-to-br from-sky-400 to-blue-600 p-4 text-white">
                  <p className="text-sm text-white/80">Current streak</p>
                  <p className="mt-2 text-2xl font-semibold">{dashboard.currentStreak} days</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-700">
                Recent activity
              </p>
              {dashboard.recentActivity.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {dashboard.recentActivity.map((session) => (
                    <div
                      key={session.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium text-slate-950">
                          {session.taskTitle ?? "Task removed"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {session.mode === "pomodoro" ? "Pomodoro" : "Free timer"} - {formatSessionDate(session.startedAt)}
                        </p>
                      </div>
                      <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700">
                        {formatDuration(session.durationSeconds)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600">
                  No sessions yet. Use the timer and your first saved sessions will appear here.
                </div>
              )}
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

            <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-700">MVP dashboard criteria</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Time studied today</li>
                <li>Time studied this week</li>
                <li>Total saved sessions</li>
                <li>Active tasks</li>
                <li>Simple daily streak</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
