"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import type { Locale, Messages } from "@/features/i18n/messages";
import { saveFreeSessionAction } from "@/features/timer/actions";
import type { TaskItem } from "@/features/tasks/types";

type FreeTimerClientProps = {
  tasks: TaskItem[];
  messages: Messages;
  locale: Locale;
};

type TimerStatus = "idle" | "running" | "paused" | "saving";

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function formatTargetMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export function FreeTimerClient({ tasks, messages, locale }: FreeTimerClientProps) {
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id ?? "");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [sessionStartMs, setSessionStartMs] = useState<number | null>(null);
  const [segmentStartMs, setSegmentStartMs] = useState<number | null>(null);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks]
  );

  const isRunning = status === "running";
  const isPaused = status === "paused";
  const canStart = Boolean(selectedTaskId) && status === "idle";
  const canFinish = accumulatedSeconds > 0 || displaySeconds > 0;

  useEffect(() => {
    let animationFrame = 0;

    const tick = () => {
      if (isRunning && segmentStartMs) {
        const liveSeconds = Math.floor((Date.now() - segmentStartMs) / 1000);
        setDisplaySeconds(accumulatedSeconds + liveSeconds);
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [accumulatedSeconds, isRunning, segmentStartMs]);

  function resetSession() {
    setStatus("idle");
    setSessionStartMs(null);
    setSegmentStartMs(null);
    setAccumulatedSeconds(0);
    setDisplaySeconds(0);
    setNotes("");
  }

  function startTimer() {
      if (!selectedTaskId) {
      setErrorMessage(messages.timer.free.chooseTaskError);
      return;
    }

    const now = Date.now();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSessionStartMs(now);
    setSegmentStartMs(now);
    setAccumulatedSeconds(0);
    setDisplaySeconds(0);
    setStatus("running");
  }

  function pauseTimer() {
    if (!segmentStartMs) {
      return;
    }

    const totalSeconds = accumulatedSeconds + Math.floor((Date.now() - segmentStartMs) / 1000);
    setAccumulatedSeconds(totalSeconds);
    setDisplaySeconds(totalSeconds);
    setSegmentStartMs(null);
    setStatus("paused");
  }

  function resumeTimer() {
    const now = Date.now();
    setSegmentStartMs(now);
    setStatus("running");
  }

  function saveSession() {
    if (!selectedTaskId || !sessionStartMs) {
      setErrorMessage(messages.timer.free.startBeforeSaveError);
      return;
    }

    const endMs = Date.now();
    const durationSeconds =
      status === "running" && segmentStartMs
        ? accumulatedSeconds + Math.floor((endMs - segmentStartMs) / 1000)
        : displaySeconds;

    if (durationSeconds <= 0) {
      setErrorMessage(messages.timer.free.minimumDurationError);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setStatus("saving");

    startTransition(async () => {
      try {
        await saveFreeSessionAction({
          taskId: selectedTaskId,
          startedAt: new Date(sessionStartMs).toISOString(),
          endedAt: new Date(endMs).toISOString(),
          durationSeconds,
          notes,
        });

        resetSession();
        setSuccessMessage(`${messages.timer.free.saveSuccess} ${selectedTask?.title ?? messages.timer.free.task}.`);
      } catch (error) {
        setStatus(segmentStartMs ? "running" : "paused");
        setErrorMessage(error instanceof Error ? error.message : messages.timer.free.saveError);
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.15)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">
          {messages.timer.free.badge}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {messages.timer.free.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          {messages.timer.free.description}
        </p>

        <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/6 p-6 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{messages.timer.free.liveDuration}</p>
          <p className="mt-4 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
            {formatDuration(displaySeconds)}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {status === "idle" ? (
              <button
                type="button"
                onClick={startTimer}
                disabled={!canStart}
                className="rounded-full bg-sky-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {messages.timer.free.start}
              </button>
            ) : null}

            {isRunning ? (
              <button
                type="button"
                onClick={pauseTimer}
                className="rounded-full border border-white/20 bg-white/8 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/12"
              >
                {messages.timer.free.pause}
              </button>
            ) : null}

            {isPaused ? (
              <button
                type="button"
                onClick={resumeTimer}
                className="rounded-full border border-white/20 bg-white/8 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/12"
              >
                {messages.timer.free.resume}
              </button>
            ) : null}

            {status !== "idle" ? (
              <button
                type="button"
                onClick={saveSession}
                disabled={!canFinish || isPending || status === "saving"}
                className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending || status === "saving" ? messages.timer.free.saving : messages.timer.free.finish}
              </button>
            ) : null}

            {status !== "idle" ? (
              <button
                type="button"
                onClick={resetSession}
                disabled={isPending}
                className="rounded-full border border-white/20 bg-transparent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {messages.timer.free.reset}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
            {messages.timer.free.setup}
          </p>
          <div className="mt-5 space-y-4">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              {messages.timer.free.task}
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

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              {messages.timer.free.notes}
              <textarea
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={messages.timer.free.notesPlaceholder}
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
            {messages.timer.free.selectedTask}
          </p>

          {selectedTask ? (
            <div className="mt-5 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {selectedTask.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedTask.description || messages.tasks.noDescription}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{messages.tasks.target}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatTargetMinutes(selectedTask.target_minutes)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{messages.tasks.categoryLabel}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {selectedTask.category ? (locale === "es" ? selectedTask.category.name_es : selectedTask.category.name_en) : messages.common.noCategory}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{messages.tasks.preferredMode}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {selectedTask.timer_mode_preference === "pomodoro"
                        ? messages.common.pomodoro
                        : selectedTask.timer_mode_preference === "free"
                        ? messages.common.freeTimer
                        : messages.common.noPreference}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-600">{messages.timer.free.noActiveTaskSelected}</p>
          )}
        </div>
      </section>
    </div>
  );
}
