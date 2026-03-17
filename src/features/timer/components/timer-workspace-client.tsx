"use client";

import { useState } from "react";

import type { TimerWorkspace } from "@/features/timer/types";

import { FreeTimerClient } from "./free-timer-client";
import { PomodoroTimerClient } from "./pomodoro-timer-client";

type Mode = "free" | "pomodoro";

export function TimerWorkspaceClient({ tasks, pomodoro }: TimerWorkspace) {
  const [mode, setMode] = useState<Mode>("free");

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMode("free")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "free"
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Free timer
          </button>
          <button
            type="button"
            onClick={() => setMode("pomodoro")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "pomodoro"
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Pomodoro
          </button>
        </div>
      </section>

      {mode === "free" ? (
        <FreeTimerClient tasks={tasks} />
      ) : (
        <PomodoroTimerClient tasks={tasks} preferences={pomodoro} />
      )}
    </div>
  );
}
