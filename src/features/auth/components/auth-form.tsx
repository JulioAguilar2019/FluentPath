"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type AuthFormMode = "sign-in" | "sign-up";

type AuthFormProps = {
  mode: AuthFormMode;
  nextPath?: string;
  copy: {
    email: string;
    password: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    submitLabel: string;
    loadingLabel: string;
    successLabel: string;
    genericError: string;
    footerLabel: string;
    footerHref: string;
    footerLinkLabel: string;
  };
};

export function AuthForm({ mode, nextPath = "/dashboard", copy }: AuthFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsPending(true);

    try {
      const supabase = createClient();

      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        setSuccessMessage(copy.successLabel);
        router.replace(nextPath);
        router.refresh();
        return;
      }

      const redirectTo = `${window.location.origin}/dashboard`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(copy.successLabel);
      router.replace(data.session ? nextPath : "/sign-in");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.genericError);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-100" htmlFor={`${mode}-email`}>
          {copy.email}
        </label>
        <input
          id={`${mode}-email`}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="flex h-11 w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
          placeholder={copy.emailPlaceholder}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-100" htmlFor={`${mode}-password`}>
          {copy.password}
        </label>
        <input
          id={`${mode}-password`}
          type="password"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="flex h-11 w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
          placeholder={copy.passwordPlaceholder}
        />
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {successMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? copy.loadingLabel : copy.submitLabel}
      </button>

      <p className="text-sm text-slate-300">
        {copy.footerLabel}{" "}
        <Link href={copy.footerHref} className="font-medium text-white underline underline-offset-4">
          {copy.footerLinkLabel}
        </Link>
      </p>
    </form>
  );
}
