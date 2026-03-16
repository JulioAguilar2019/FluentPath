import { getSessionHistoryWorkspace } from "@/features/progress/server";

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

const modeLabels = {
  free: "Free timer",
  pomodoro: "Pomodoro",
} as const;

const statusLabels = {
  completed: "Completed",
  cancelled: "Cancelled",
  abandoned: "Abandoned",
} as const;

export default async function ProgressPage() {
  const {
    sessions,
    totalSessions,
    totalFocusSeconds,
    totalFreeSessions,
    totalPomodoroSessions,
  } = await getSessionHistoryWorkspace();

  return (
    <main className="space-y-6 pb-8 text-slate-950">
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.15)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">
            Study sessions history
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Review recent study activity before building the full analytics dashboard.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            This page shows the latest completed sessions saved from the timer flow, grouped into a simple history view for validation and future progress metrics.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm text-slate-500">Recent sessions</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{totalSessions}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm text-slate-500">Time tracked</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{formatDuration(totalFocusSeconds)}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm text-slate-500">Free sessions</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{totalFreeSessions}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm text-slate-500">Pomodoro sessions</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{totalPomodoroSessions}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
            Recent activity
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Latest saved sessions
          </h2>
        </div>

        {sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <article
                key={session.id}
                className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 text-xs font-medium">
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-white">
                        {modeLabels[session.mode]}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">
                        {statusLabels[session.status]}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">
                        {session.task?.title ?? "Task removed"}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Started {formatSessionDate(session.started_at)}
                        {session.ended_at ? ` and ended ${formatSessionDate(session.ended_at)}` : ""}
                      </p>
                    </div>

                    {session.notes ? (
                      <p className="max-w-3xl text-sm leading-6 text-slate-600">{session.notes}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 md:min-w-[19rem] md:grid-cols-1 lg:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-sm text-slate-500">Duration</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">
                        {formatDuration(session.duration_seconds)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-sm text-slate-500">Cycles</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">
                        {session.pomodoro_cycles}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-sm text-slate-500">Focus mins</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">
                        {session.focus_minutes ?? Math.round(session.duration_seconds / 60)}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 p-8 text-sm text-slate-600">
            No study sessions yet. Save a timer session first and it will appear here.
          </div>
        )}
      </section>
    </main>
  );
}
