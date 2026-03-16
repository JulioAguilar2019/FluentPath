"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.replace("/");
    router.refresh();
    setIsPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="inline-flex h-10 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
