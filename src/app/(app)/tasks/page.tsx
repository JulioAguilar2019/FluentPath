import {
  activateTaskAction,
  archiveTaskAction,
  completeTaskAction,
  createTaskAction,
  updateTaskAction,
} from "@/features/tasks/actions";
import { getTaskWorkspace } from "@/features/tasks/server";
import type { TaskCategory, TaskItem } from "@/features/tasks/types";

const statusLabels = {
  active: "Active",
  completed: "Completed",
  archived: "Archived",
} as const;

const timerLabels = {
  free: "Free timer",
  pomodoro: "Pomodoro",
} as const;

function TaskFormFields({
  categories,
  task,
}: {
  categories: TaskCategory[];
  task?: TaskItem;
}) {
  return (
    <>
      {task ? <input type="hidden" name="taskId" value={task.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
          Title
          <input
            name="title"
            required
            defaultValue={task?.title ?? ""}
            placeholder="Listening practice with podcast"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-400"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
          Description
          <textarea
            name="description"
            defaultValue={task?.description ?? ""}
            rows={3}
            placeholder="Notes, material, or a short study goal"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-400"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Category
          <select
            name="categoryId"
            defaultValue={task?.category_id ?? ""}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-400"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_en}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Target minutes
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
          Preferred timer mode
          <select
            name="timerModePreference"
            defaultValue={task?.timer_mode_preference ?? ""}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-400"
          >
            <option value="">No preference</option>
            <option value="free">Free timer</option>
            <option value="pomodoro">Pomodoro</option>
          </select>
        </label>
      </div>
    </>
  );
}

function TaskCard({ task, categories }: { task: TaskItem; categories: TaskCategory[] }) {
  const isActive = task.status === "active";
  const isArchived = task.status === "archived";

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
                {task.category.name_en}
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
              {task.description || "No description yet. Add context to make the task easier to start later."}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p>Target</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{task.target_minutes} min</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {isActive ? (
          <form action={completeTaskAction}>
            <input type="hidden" name="taskId" value={task.id} />
            <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500">
              Mark completed
            </button>
          </form>
        ) : (
          <form action={activateTaskAction}>
            <input type="hidden" name="taskId" value={task.id} />
            <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
              Set active again
            </button>
          </form>
        )}

        {!isArchived ? (
          <form action={archiveTaskAction}>
            <input type="hidden" name="taskId" value={task.id} />
            <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Archive
            </button>
          </form>
        ) : null}
      </div>

      <details className="mt-5 rounded-[1.25rem] border border-slate-200 bg-slate-50/70 px-4 py-3">
        <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800">
          Edit task
        </summary>

        <form action={updateTaskAction} className="mt-4 space-y-4">
          <TaskFormFields categories={categories} task={task} />
          <button className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500">
            Save changes
          </button>
        </form>
      </details>
    </article>
  );
}

export default async function TasksPage() {
  const { categories, tasks } = await getTaskWorkspace();

  const activeTasks = tasks.filter((task) => task.status === "active");
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const archivedTasks = tasks.filter((task) => task.status === "archived");

  return (
    <main className="space-y-6 pb-8">
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.15)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">
            Task management
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Build your study queue before the timer starts.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Create focused English-study tasks, assign categories, set target minutes, and keep your queue clean with active, completed, and archived states.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-sm text-slate-300">Active</p>
              <p className="mt-2 text-3xl font-semibold">{activeTasks.length}</p>
            </div>
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-sm text-slate-300">Completed</p>
              <p className="mt-2 text-3xl font-semibold">{completedTasks.length}</p>
            </div>
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-sm text-slate-300">Categories</p>
              <p className="mt-2 text-3xl font-semibold">{categories.length}</p>
            </div>
          </div>
        </div>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Create task</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Add the next study block</h2>
          </div>

          <form action={createTaskAction} className="space-y-4">
            <TaskFormFields categories={categories} />
            <button className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
              Create task
            </button>
          </form>
        </section>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Active tasks</h2>
          <p className="mt-2 text-sm text-slate-600">These are ready to pair with the upcoming free timer and Pomodoro flows.</p>
        </div>

        {activeTasks.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {activeTasks.map((task) => (
              <TaskCard key={task.id} task={task} categories={categories} />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 p-8 text-sm text-slate-600">
            No active tasks yet. Create your first study task to start shaping the MVP workflow.
          </div>
        )}
      </section>

      {completedTasks.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Completed tasks</h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} categories={categories} />
            ))}
          </div>
        </section>
      ) : null}

      {archivedTasks.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Archived tasks</h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {archivedTasks.map((task) => (
              <TaskCard key={task.id} task={task} categories={categories} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
