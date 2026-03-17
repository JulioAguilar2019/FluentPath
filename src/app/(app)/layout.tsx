import Link from "next/link";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { LocaleSwitcher } from "@/features/i18n/components/locale-switcher";
import { getMessages } from "@/features/i18n/server";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  const { locale, messages } = await getMessages();
  const navItems = [
    { href: "/dashboard", label: messages.nav.dashboard },
    { href: "/tasks", label: messages.nav.tasks },
    { href: "/timer", label: messages.nav.timer },
    { href: "/progress", label: messages.nav.progress },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-[1.75rem] border border-white/80 bg-white/85 px-5 py-4 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
              {messages.common.appName} {messages.common.workspace}
            </p>
            <p className="mt-2 text-sm text-slate-600">{messages.common.signedInAs} {user.email}</p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <LocaleSwitcher locale={locale} messages={messages} />
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <SignOutButton label={messages.nav.signOut} pendingLabel={messages.nav.signingOut} />
          </div>
        </header>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
