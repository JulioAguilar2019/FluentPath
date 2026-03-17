import { getDashboardWorkspace } from "@/features/dashboard/server";
import { getMessages } from "@/features/i18n/server";
import { ProgressCharts } from "@/features/progress/components/progress-charts";
import { requireUser } from "@/lib/auth";

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

function formatSessionDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const user = await requireUser();
  const dashboard = await getDashboardWorkspace();
  const { locale, messages } = await getMessages();

  return (
    <main className="space-y-6 pb-8 text-slate-950">
      <div className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur xl:p-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-start md:justify-between">
          <div>
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-700">
              {messages.dashboard.badge}
              </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{messages.dashboard.title}</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              {messages.common.signedInAs} <span className="font-medium text-slate-900">{user.email}</span>. {messages.dashboard.description}
            </p>
          </div>
        </header>

        <section className="mt-8 space-y-6">
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
              <p className="text-sm uppercase tracking-[0.26em] text-sky-300">{messages.dashboard.coreMetrics}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-sm text-slate-300">{messages.dashboard.today}</p>
                  <p className="mt-2 text-2xl font-semibold">{formatDuration(dashboard.todaySeconds)}</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-sm text-slate-300">{messages.dashboard.week}</p>
                  <p className="mt-2 text-2xl font-semibold">{formatDuration(dashboard.weekSeconds)}</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-sm text-slate-300">{messages.dashboard.sessions}</p>
                  <p className="mt-2 text-2xl font-semibold">{dashboard.totalSessions}</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-sm text-slate-300">{messages.dashboard.activeTasks}</p>
                  <p className="mt-2 text-2xl font-semibold">{dashboard.activeTasks}</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-sm text-slate-300">{messages.dashboard.completedTasks}</p>
                  <p className="mt-2 text-2xl font-semibold">{dashboard.completedTasks}</p>
                </div>
                <div className="rounded-2xl bg-linear-to-br from-sky-400 to-blue-600 p-4 text-white">
                  <p className="text-sm text-white/80">{messages.dashboard.streak}</p>
                  <p className="mt-2 text-2xl font-semibold">{dashboard.currentStreak} {messages.dashboard.days}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-700">
                {messages.dashboard.recentActivity}
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
                          {session.taskTitle ?? messages.progress.taskRemoved}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {session.mode === "pomodoro" ? messages.common.pomodoro : messages.common.freeTimer} - {formatSessionDate(session.startedAt, locale)}
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
                  {messages.dashboard.noSessions}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <ProgressCharts
        weeklyActivity={dashboard.weeklyActivity}
        categoryBreakdown={dashboard.categoryBreakdown}
        copy={{
          weeklyTitle: messages.dashboard.weeklyTitle,
          weeklyDescription: messages.dashboard.weeklyDescription,
          categoriesTitle: messages.dashboard.categoriesTitle,
          categoriesDescription: messages.dashboard.categoriesDescription,
          minutesLabel: messages.dashboard.minutesLabel,
          empty: messages.dashboard.chartsEmpty,
        }}
      />
    </main>
  );
}
