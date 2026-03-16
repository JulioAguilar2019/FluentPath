import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const defaultTaskCategories = [
  { slug: "vocabulary", name_en: "Vocabulary", name_es: "Vocabulario", color: "#2563eb", sort_order: 1 },
  { slug: "grammar", name_en: "Grammar", name_es: "Gramatica", color: "#7c3aed", sort_order: 2 },
  { slug: "listening", name_en: "Listening", name_es: "Escucha", color: "#0f766e", sort_order: 3 },
  { slug: "speaking", name_en: "Speaking", name_es: "Habla", color: "#ea580c", sort_order: 4 },
  { slug: "reading", name_en: "Reading", name_es: "Lectura", color: "#ca8a04", sort_order: 5 },
  { slug: "writing", name_en: "Writing", name_es: "Escritura", color: "#db2777", sort_order: 6 },
] as const;

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function ensureUserProfile(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) {
  const supabase = await createClient();

  const profilePayload = {
    id: user.id,
    email: user.email ?? null,
    full_name:
      typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim().length > 0
        ? user.user_metadata.full_name.trim()
        : user.email?.split("@")[0] ?? "FluentPath user",
  };

  const { error: profileError } = await supabase.from("profiles").upsert(profilePayload, {
    onConflict: "id",
    ignoreDuplicates: false,
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { error: categoriesError } = await supabase.from("task_categories").upsert(
    defaultTaskCategories.map((category) => ({
      user_id: user.id,
      ...category,
    })),
    {
      onConflict: "user_id,slug",
      ignoreDuplicates: false,
    }
  );

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  await ensureUserProfile(user);

  return user;
}
