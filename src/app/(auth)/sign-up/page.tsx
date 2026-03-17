import Link from "next/link";

import { AuthForm } from "@/features/auth/components/auth-form";
import { LocaleSwitcher } from "@/features/i18n/components/locale-switcher";
import { getMessages } from "@/features/i18n/server";

export default async function SignUpPage() {
  const { locale, messages } = await getMessages();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(104,187,255,0.2),_transparent_24%),linear-gradient(180deg,_#0b1120_0%,_#172554_100%)] px-6 py-12 text-white">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.35)] backdrop-blur xl:p-8">
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl font-semibold">{messages.auth.signUpHeading}</h1>
            <p className="text-sm text-slate-300">
              {messages.auth.signUpHelper}
            </p>
          </div>

          <AuthForm
            mode="sign-up"
            copy={{
              email: messages.auth.form.email,
              password: messages.auth.form.password,
              emailPlaceholder: messages.auth.form.emailPlaceholder,
              passwordPlaceholder: messages.auth.form.passwordPlaceholder,
              submitLabel: messages.auth.form.createAccount,
              loadingLabel: messages.auth.form.creatingAccount,
              successLabel: messages.auth.form.accountCreated,
              genericError: messages.auth.form.genericError,
              footerLabel: messages.auth.alreadyRegistered,
              footerHref: "/sign-in",
              footerLinkLabel: messages.auth.signInLink,
            }}
          />

          <p className="mt-6 text-sm text-slate-300">
            {messages.auth.alreadyRegistered}{" "}
            <Link href="/sign-in" className="font-medium text-white underline underline-offset-4">
              {messages.auth.signInLink}
            </Link>
          </p>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-1 text-sm text-sky-100">
              {messages.auth.signUpBadge}
            </span>
            <LocaleSwitcher locale={locale} messages={messages} />
          </div>
          <h2 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {messages.auth.signUpTitle}
          </h2>
          <p className="max-w-xl text-lg leading-8 text-slate-300">
            {messages.auth.signUpDescription}
          </p>
        </section>
      </div>
    </main>
  );
}
