import Link from "next/link";

import { AuthForm } from "@/features/auth/components/auth-form";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const nextPath = Array.isArray(params.next) ? params.next[0] : params.next;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(88,129,255,0.24),_transparent_26%),linear-gradient(180deg,_#0f172a_0%,_#111827_100%)] px-6 py-12 text-white">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="space-y-6">
          <span className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-1 text-sm text-sky-100">
            Welcome back to FluentPath
          </span>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Sign in and continue building your English study rhythm.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-300">
            Your dashboard, tasks, timers, and progress will live inside a protected workspace powered by Supabase authentication.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.35)] backdrop-blur xl:p-8">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold">Sign in</h2>
            <p className="text-sm text-slate-300">
              Use your email and password to enter your private study space.
            </p>
          </div>

          <AuthForm mode="sign-in" nextPath={nextPath} />

          <p className="mt-6 text-sm text-slate-300">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-medium text-white underline underline-offset-4">
              Create one
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
