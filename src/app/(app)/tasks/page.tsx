import {
  activateTaskAction,
  archiveTaskAction,
  completeTaskAction,
  createTaskAction,
  updateTaskAction,
} from "@/features/tasks/actions";
import { getMessages } from "@/features/i18n/server";
import { getTaskWorkspace } from "@/features/tasks/server";
import type { TaskCategory, TaskItem } from "@/features/tasks/types";

function TaskFormFields({
  categories,
  task,
  messages,
  locale,
}: {
  categories: TaskCategory[];
  task?: TaskItem;
  messages: Awaited<ReturnType<typeof getMessages>>["messages"];
  locale: "en" | "es";
}) {
  return (
    <>
      {task ? <input type="hidden" name="taskId" value={task.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
          {messages.tasks.titleLabel}
          <input
            name="title"
            required
            defaultValue={task?.title ?? ""}
            placeholder={messages.tasks.placeholders.title}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-400"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
          {messages.tasks.descriptionLabel}
          <textarea
            name="description"
            defaultValue={task?.description ?? ""}
            rows={3}
            placeholder={messages.tasks.placeholders.description}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-400"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          {messages.tasks.categoryLabel}
          <select
            name="categoryId"
            defaultValue={task?.category_id ?? ""}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-400"
          >
            <option value="">{messages.tasks.noCategory}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {locale === "es" ? category.name_es : category.name_en}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          {messages.tasks.targetMinutes}
          <input
            name="targetMinutes"
            type="number"
            min={1}
            required
            defaultValue={task?.target_minutes ?? 25}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-400"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
          {messages.tasks.preferredMode}
          <select
            name="timerModePreference"
            defaultValue={task?.timer_mode_preference ?? ""}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-400"
          >
            <option value="">{messages.common.noPreference}</option>
            <option value="free">{messages.common.freeTimer}</option>
            <option value="pomodoro">{messages.common.pomodoro}</option>
          </select>
        </label>
      </div>
    </>
  );
}

function TaskCard({ task, categories, messages, locale }: { task: TaskItem; categories: TaskCategory[]; messages: Awaited<ReturnType<typeof getMessages>>["messages"]; locale: "en" | "es" }) {
  const isActive = task.status === "active";
  const isArchived = task.status === "archived";
  const statusLabels = {
    active: messages.tasks.active,
    completed: messages.tasks.completed,
    archived: messages.tasks.archived,
  } as const;
  const timerLabels = {
    free: messages.common.freeTimer,
    pomodoro: messages.common.pomodoro,
  } as const;

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
              {statusLabels[task.status]}
            </span>
            {task.category ? (
              <span
                className="rounded-full px-3 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: task.category.color }}
              >
                {locale === "es" ? task.category.name_es : task.category.name_en}
              </span>
            ) : null}
            {task.timer_mode_preference ? (
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                {timerLabels[task.timer_mode_preference]}
              </span>
            ) : null}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-950">{task.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {task.description || messages.tasks.noDescription}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p>{messages.tasks.target}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{task.target_minutes} min</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {isActive ? (
          <form action={completeTaskAction}>
            <input type="hidden" name="taskId" value={task.id} />
            <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500">
              {messages.tasks.markCompleted}
            </button>
          </form>
        ) : (
          <form action={activateTaskAction}>
            <input type="hidden" name="taskId" value={task.id} />
            <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
              {messages.tasks.setActiveAgain}
            </button>
          </form>
        )}

        {!isArchived ? (
          <form action={archiveTaskAction}>
            <input type="hidden" name="taskId" value={task.id} />
            <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              {messages.tasks.archive}
            </button>
          </form>
        ) : null}
      </div>

      <details className="mt-5 rounded-[1.25rem] border border-slate-200 bg-slate-50/70 px-4 py-3">
        <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800">
          {messages.tasks.editTask}
        </summary>

        <form action={updateTaskAction} className="mt-4 space-y-4">
          <TaskFormFields categories={categories} task={task} messages={messages} locale={locale} />
          <button className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500">
            {messages.tasks.saveChanges}
          </button>
        </form>
      </details>
    </article>
  );
}

export default async function TasksPage() {
  const { messages, locale } = await getMessages();
  const { categories, tasks } = await getTaskWorkspace();

  const activeTasks = tasks.filter((task) => task.status === "active");
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const archivedTasks = tasks.filter((task) => task.status === "archived");

  return (
    <main className="space-y-6 pb-8">
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.15)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">
            {messages.tasks.badge}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{messages.tasks.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            {messages.tasks.description}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-sm text-slate-300">{messages.tasks.active}</p>
              <p className="mt-2 text-3xl font-semibold">{activeTasks.length}</p>
            </div>
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-sm text-slate-300">{messages.tasks.completed}</p>
              <p className="mt-2 text-3xl font-semibold">{completedTasks.length}</p>
            </div>
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-sm text-slate-300">{messages.tasks.categories}</p>
              <p className="mt-2 text-3xl font-semibold">{categories.length}</p>
            </div>
          </div>
        </div>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">{messages.tasks.createTask}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{messages.tasks.addNext}</h2>
          </div>

          <form action={createTaskAction} className="space-y-4">
            <TaskFormFields categories={categories} messages={messages} locale={locale} />
            <button className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
              {messages.tasks.createButton}
            </button>
          </form>
        </section>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{messages.tasks.activeTasks}</h2>
          <p className="mt-2 text-sm text-slate-600">{messages.tasks.activeTasksHelper}</p>
        </div>

        {activeTasks.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {activeTasks.map((task) => (
              <TaskCard key={task.id} task={task} categories={categories} messages={messages} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 p-8 text-sm text-slate-600">
            {messages.tasks.noActiveTasks}
          </div>
        )}
      </section>

      {completedTasks.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{messages.tasks.completedTasks}</h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} categories={categories} messages={messages} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}

      {archivedTasks.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{messages.tasks.archivedTasks}</h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {archivedTasks.map((task) => (
              <TaskCard key={task.id} task={task} categories={categories} messages={messages} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
