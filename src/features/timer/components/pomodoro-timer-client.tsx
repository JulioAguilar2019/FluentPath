"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { savePomodoroSessionAction } from "@/features/timer/actions";
import type { TaskItem } from "@/features/tasks/types";

import type { PomodoroPreferences } from "../types";

type PomodoroTimerClientProps = {
  tasks: TaskItem[];
  preferences: PomodoroPreferences;
};

type Phase = "focus" | "shortBreak" | "longBreak";
type TimerStatus = "idle" | "running" | "paused" | "saving";

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function formatTargetMinutes(minutes: number) {
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function getPhaseDuration(phase: Phase, preferences: PomodoroPreferences) {
  if (phase === "focus") return preferences.focusMinutes * 60;
  if (phase === "longBreak") return preferences.longBreakMinutes * 60;
  return preferences.shortBreakMinutes * 60;
}

const phaseCopy: Record<Phase, { label: string; accent: string; helper: string }> = {
  focus: {
    label: "Focus",
    accent: "from-emerald-400 to-teal-500",
    helper: "Stay with the task until this focus block completes.",
  },
  shortBreak: {
    label: "Short break",
    accent: "from-amber-300 to-orange-400",
    helper: "A quick reset before the next focus cycle.",
  },
  longBreak: {
    label: "Long break",
    accent: "from-fuchsia-400 to-violet-500",
    helper: "A longer reset after a full set of focus cycles.",
  },
};

export function PomodoroTimerClient({ tasks, preferences }: PomodoroTimerClientProps) {
  const [focusMinutes, setFocusMinutes] = useState(preferences.focusMinutes);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(preferences.shortBreakMinutes);
  const [longBreakMinutes, setLongBreakMinutes] = useState(preferences.longBreakMinutes);
  const [longBreakInterval, setLongBreakInterval] = useState(preferences.longBreakInterval);

  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id ?? "");
  const [phase, setPhase] = useState<Phase>("focus");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [sessionStartMs, setSessionStartMs] = useState<number | null>(null);
  const [phaseStartMs, setPhaseStartMs] = useState<number | null>(null);
  const [phaseElapsedSeconds, setPhaseElapsedSeconds] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60);
  const [completedFocusCycles, setCompletedFocusCycles] = useState(0);
  const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);
  const [totalBreakSeconds, setTotalBreakSeconds] = useState(0);
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks]
  );

  const phaseDuration = getPhaseDuration(phase, {
    focusMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    longBreakInterval,
  });
  const isRunning = status === "running";
  const isPaused = status === "paused";
  const canSave = completedFocusCycles > 0 && totalFocusSeconds > 0;
  const canEditSetup = status === "idle";

  function syncIdleTimer(nextValues: {
    focusMinutes?: number;
    shortBreakMinutes?: number;
    longBreakMinutes?: number;
  }) {
    if (!canEditSetup) {
      return;
    }

    const nextFocusMinutes = nextValues.focusMinutes ?? focusMinutes;
    const nextShortBreakMinutes = nextValues.shortBreakMinutes ?? shortBreakMinutes;
    const nextLongBreakMinutes = nextValues.longBreakMinutes ?? longBreakMinutes;

    if (phase === "focus") {
      setSecondsLeft(nextFocusMinutes * 60);
      return;
    }

    if (phase === "shortBreak") {
      setSecondsLeft(nextShortBreakMinutes * 60);
      return;
    }

    setSecondsLeft(nextLongBreakMinutes * 60);
  }

  function handleFocusMinutesChange(value: string) {
    const nextValue = Number(value) || 1;
    setFocusMinutes(nextValue);
    syncIdleTimer({ focusMinutes: nextValue });
  }

  function handleShortBreakMinutesChange(value: string) {
    const nextValue = Number(value) || 1;
    setShortBreakMinutes(nextValue);
    syncIdleTimer({ shortBreakMinutes: nextValue });
  }

  function handleLongBreakMinutesChange(value: string) {
    const nextValue = Number(value) || 1;
    setLongBreakMinutes(nextValue);
    syncIdleTimer({ longBreakMinutes: nextValue });
  }

  useEffect(() => {
    if (!isRunning || !phaseStartMs) {
      return;
    }

    const interval = window.setInterval(() => {
      const elapsed = phaseElapsedSeconds + Math.floor((Date.now() - phaseStartMs) / 1000);
      const nextSecondsLeft = Math.max(phaseDuration - elapsed, 0);
      setSecondsLeft(nextSecondsLeft);

      if (nextSecondsLeft === 0) {
        window.clearInterval(interval);

        if (phase === "focus") {
          const newCompletedCycles = completedFocusCycles + 1;
          const newTotalFocusSeconds = totalFocusSeconds + phaseDuration;
          const nextPhase: Phase =
            newCompletedCycles % longBreakInterval === 0 ? "longBreak" : "shortBreak";

          setCompletedFocusCycles(newCompletedCycles);
          setTotalFocusSeconds(newTotalFocusSeconds);
          setPhase(nextPhase);
          setPhaseElapsedSeconds(0);
          setPhaseStartMs(Date.now());
          setSecondsLeft(
            getPhaseDuration(nextPhase, {
              focusMinutes,
              shortBreakMinutes,
              longBreakMinutes,
              longBreakInterval,
            })
          );
        } else {
          const newTotalBreakSeconds = totalBreakSeconds + phaseDuration;
          setTotalBreakSeconds(newTotalBreakSeconds);
          setPhase("focus");
          setPhaseElapsedSeconds(0);
          setPhaseStartMs(Date.now());
          setSecondsLeft(
            getPhaseDuration("focus", {
              focusMinutes,
              shortBreakMinutes,
              longBreakMinutes,
              longBreakInterval,
            })
          );
        }
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [
    completedFocusCycles,
    isRunning,
    longBreakInterval,
    phase,
    phaseDuration,
    phaseElapsedSeconds,
    phaseStartMs,
    focusMinutes,
    longBreakMinutes,
    shortBreakMinutes,
    totalBreakSeconds,
    totalFocusSeconds,
  ]);

  function resetSession() {
    setPhase("focus");
    setStatus("idle");
    setSessionStartMs(null);
    setPhaseStartMs(null);
    setPhaseElapsedSeconds(0);
    setSecondsLeft(focusMinutes * 60);
    setCompletedFocusCycles(0);
    setTotalFocusSeconds(0);
    setTotalBreakSeconds(0);
    setNotes("");
  }

  function startPomodoro() {
    if (!selectedTaskId) {
      setErrorMessage("Choose a task before starting Pomodoro mode.");
      return;
    }

    if (focusMinutes <= 0 || shortBreakMinutes <= 0 || longBreakMinutes <= 0 || longBreakInterval <= 0) {
      setErrorMessage("Focus, break times, and long break interval must be greater than zero.");
      return;
    }

    const now = Date.now();
    setErrorMessage(null);
    setSuccessMessage(null);
    setPhase("focus");
    setStatus("running");
    setSessionStartMs(now);
    setPhaseStartMs(now);
    setPhaseElapsedSeconds(0);
    setSecondsLeft(focusMinutes * 60);
    setCompletedFocusCycles(0);
    setTotalFocusSeconds(0);
    setTotalBreakSeconds(0);
  }

  function pausePomodoro() {
    if (!phaseStartMs) return;

    const elapsed = phaseElapsedSeconds + Math.floor((Date.now() - phaseStartMs) / 1000);
    setPhaseElapsedSeconds(elapsed);
    setSecondsLeft(Math.max(phaseDuration - elapsed, 0));
    setPhaseStartMs(null);
    setStatus("paused");
  }

  function resumePomodoro() {
    setPhaseStartMs(Date.now());
    setStatus("running");
  }

  function savePomodoro() {
    if (!selectedTaskId || !sessionStartMs || !canSave) {
      setErrorMessage("Complete at least one focus cycle before saving the session.");
      return;
    }

    const endMs = Date.now();
    setErrorMessage(null);
    setSuccessMessage(null);
    setStatus("saving");

    startTransition(async () => {
      try {
        await savePomodoroSessionAction({
          taskId: selectedTaskId,
          startedAt: new Date(sessionStartMs).toISOString(),
          endedAt: new Date(endMs).toISOString(),
          durationSeconds: totalFocusSeconds,
          focusMinutes: Math.round(totalFocusSeconds / 60),
          breakMinutes: Math.round(totalBreakSeconds / 60),
          pomodoroCycles: completedFocusCycles,
          notes,
        });

        resetSession();
        setSuccessMessage(`Pomodoro session saved for ${selectedTask?.title ?? "task"}.`);
      } catch (error) {
        setStatus(phaseStartMs ? "running" : "paused");
        setErrorMessage(error instanceof Error ? error.message : "Could not save the pomodoro session.");
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.15)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">
          Pomodoro timer
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Study in structured focus blocks with automatic break transitions.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Pomodoro mode uses your profile preferences and saves completed focus time, break minutes, and total cycles into `study_sessions`.
        </p>

        <div className={`mt-8 rounded-[1.75rem] border border-white/10 bg-linear-to-br ${phaseCopy[phase].accent} p-6 text-center text-slate-950`}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-900/70">
            {phaseCopy[phase].label}
          </p>
          <p className="mt-4 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
            {formatClock(secondsLeft)}
          </p>
          <p className="mt-4 text-sm text-slate-900/80">{phaseCopy[phase].helper}</p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {status === "idle" ? (
              <button
                type="button"
                onClick={startPomodoro}
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Start pomodoro
              </button>
            ) : null}

            {isRunning ? (
              <button
                type="button"
                onClick={pausePomodoro}
                className="rounded-full border border-slate-900/10 bg-white/50 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-white/70"
              >
                Pause
              </button>
            ) : null}

            {isPaused ? (
              <button
                type="button"
                onClick={resumePomodoro}
                className="rounded-full border border-slate-900/10 bg-white/50 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-white/70"
              >
                Resume
              </button>
            ) : null}

            {status !== "idle" ? (
              <button
                type="button"
                onClick={savePomodoro}
                disabled={!canSave || isPending || status === "saving"}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending || status === "saving" ? "Saving..." : "Finish and save"}
              </button>
            ) : null}

            {status !== "idle" ? (
              <button
                type="button"
                onClick={resetSession}
                disabled={isPending}
                className="rounded-full border border-slate-900/10 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
            Pomodoro setup
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
              Task
              <select
                value={selectedTaskId}
                onChange={(event) => setSelectedTaskId(event.target.value)}
                disabled={status !== "idle"}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Focus minutes
              <input
                type="number"
                min={1}
                value={focusMinutes}
                disabled={!canEditSetup}
                onChange={(event) => handleFocusMinutesChange(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Short break minutes
              <input
                type="number"
                min={1}
                value={shortBreakMinutes}
                disabled={!canEditSetup}
                onChange={(event) => handleShortBreakMinutesChange(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Long break minutes
              <input
                type="number"
                min={1}
                value={longBreakMinutes}
                disabled={!canEditSetup}
                onChange={(event) => handleLongBreakMinutesChange(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Long break every
              <input
                type="number"
                min={1}
                value={longBreakInterval}
                disabled={!canEditSetup}
                onChange={(event) => setLongBreakInterval(Number(event.target.value) || 1)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
              Notes
              <textarea
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional notes about what you practiced during the pomodoro session"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-400"
              />
            </label>
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
            Session summary
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Completed cycles</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{completedFocusCycles}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Focus tracked</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{formatTargetMinutes(Math.round(totalFocusSeconds / 60))}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Break tracked</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{formatTargetMinutes(Math.round(totalBreakSeconds / 60))}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Task target</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {selectedTask ? formatTargetMinutes(selectedTask.target_minutes) : "-"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
