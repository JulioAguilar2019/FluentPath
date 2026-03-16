import Link from "next/link";

import { AuthForm } from "@/features/auth/components/auth-form";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(104,187,255,0.2),_transparent_24%),linear-gradient(180deg,_#0b1120_0%,_#172554_100%)] px-6 py-12 text-white">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.35)] backdrop-blur xl:p-8">
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl font-semibold">Create account</h1>
            <p className="text-sm text-slate-300">
              Start your workspace with email and password. Google OAuth will arrive in Sprint 2.
            </p>
          </div>

          <AuthForm mode="sign-up" />

          <p className="mt-6 text-sm text-slate-300">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-white underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </section>

        <section className="space-y-6">
          <span className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-1 text-sm text-sky-100">
            Sprint 1 authentication
          </span>
          <h2 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Create your account and keep every task and study session tied to you.
          </h2>
          <p className="max-w-xl text-lg leading-8 text-slate-300">
            FluentPath is built as a multiuser app from day one, so each user will have their own tasks, sessions, and future dashboard data.
          </p>
        </section>
      </div>
    </main>
  );
}
