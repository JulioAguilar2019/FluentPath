import Link from "next/link";

import { LocaleSwitcher } from "@/features/i18n/components/locale-switcher";
import { getMessages } from "@/features/i18n/server";

export default async function Home() {
  const { locale, messages } = await getMessages();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(82,128,255,0.18),_transparent_34%),radial-gradient(circle_at_80%_15%,_rgba(255,193,122,0.24),_transparent_20%),linear-gradient(180deg,_#fffdf8_0%,_#f5f2ea_52%,_#eef4ff_100%)] px-6 py-8 text-slate-900">
      <div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),transparent)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col rounded-[2rem] border border-white/70 bg-white/72 shadow-[0_24px_90px_rgba(20,31,56,0.12)] backdrop-blur-xl">
        <header className="flex flex-col gap-4 border-b border-slate-200/70 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
              {messages.common.appName}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
              {messages.home.title}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LocaleSwitcher locale={locale} messages={messages} />
            <Link
              href="/sign-in"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-all hover:bg-muted"
            >
              {messages.home.signIn}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground shadow-[0_12px_30px_rgba(73,112,255,0.24)] transition-all hover:opacity-90"
            >
              {messages.home.openApp}
            </Link>
          </div>
        </header>

        <section className="grid flex-1 gap-10 px-6 py-10 md:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14 lg:py-14">
          <div className="flex flex-col justify-between gap-10">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {messages.home.epic}
              </div>
              <h2 className="max-w-xl text-5xl font-semibold leading-none tracking-[-0.05em] text-slate-950 md:text-6xl">
                {messages.home.headline}
              </h2>
              <p className="max-w-xl text-lg leading-8 text-slate-600">
                {messages.home.description}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {messages.home.highlights.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
                >
                  <h3 className="text-base font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-slate-950 p-5 text-slate-50 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-sky-200/80">
                    {messages.home.preview}
                  </p>
                <p className="mt-2 text-xl font-semibold">{messages.home.rhythm}</p>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                {messages.home.mobile}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-[1.4rem] bg-white/8 p-4">
                  <p className="text-sm text-slate-300">{messages.home.quickRoutes}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  {messages.home.routes.map((label) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[1.4rem] bg-linear-to-br from-sky-400 to-blue-600 p-4 text-white">
                  <p className="text-sm text-white/80">{messages.home.focusTarget}</p>
                  <p className="mt-3 text-3xl font-semibold">45 min</p>
                </div>
                <div className="rounded-[1.4rem] bg-white/8 p-4">
                  <p className="text-sm text-slate-300">{messages.home.sectionsOnline}</p>
                  <p className="mt-3 text-3xl font-semibold">5</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
