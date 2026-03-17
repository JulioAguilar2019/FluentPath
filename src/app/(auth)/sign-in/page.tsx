import Link from "next/link";

import { AuthForm } from "@/features/auth/components/auth-form";
import { LocaleSwitcher } from "@/features/i18n/components/locale-switcher";
import { getMessages } from "@/features/i18n/server";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const nextPath = Array.isArray(params.next) ? params.next[0] : params.next;
  const { locale, messages } = await getMessages();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(88,129,255,0.24),_transparent_26%),linear-gradient(180deg,_#0f172a_0%,_#111827_100%)] px-6 py-12 text-white">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-1 text-sm text-sky-100">
              {messages.auth.signInBadge}
            </span>
            <LocaleSwitcher locale={locale} messages={messages} />
          </div>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {messages.auth.signInTitle}
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-300">
            {messages.auth.signInDescription}
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.35)] backdrop-blur xl:p-8">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold">{messages.auth.signInHeading}</h2>
            <p className="text-sm text-slate-300">
              {messages.auth.signInHelper}
            </p>
          </div>

          <AuthForm
            mode="sign-in"
            nextPath={nextPath}
            copy={{
              email: messages.auth.form.email,
              password: messages.auth.form.password,
              emailPlaceholder: messages.auth.form.emailPlaceholder,
              passwordPlaceholder: messages.auth.form.passwordPlaceholder,
              submitLabel: messages.auth.form.signIn,
              loadingLabel: messages.auth.form.signingIn,
              successLabel: messages.auth.form.signedIn,
              genericError: messages.auth.form.genericError,
              footerLabel: messages.auth.noAccount,
              footerHref: "/sign-up",
              footerLinkLabel: messages.auth.createOne,
            }}
          />

          <p className="mt-6 text-sm text-slate-300">
            {messages.auth.noAccount}{" "}
            <Link href="/sign-up" className="font-medium text-white underline underline-offset-4">
              {messages.auth.createOne}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
