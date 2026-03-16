export type TaskCategory = {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  color: string;
};

export type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  target_minutes: number;
  timer_mode_preference: "free" | "pomodoro" | null;
  status: "active" | "completed" | "archived";
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  category_id: string | null;
  category: TaskCategory | null;
};

export type TaskWorkspace = {
  categories: TaskCategory[];
  tasks: TaskItem[];
};
