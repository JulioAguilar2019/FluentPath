import Link from "next/link";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { requireUser } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/timer", label: "Timer" },
  { href: "/progress", label: "Progress" },
];

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-[1.75rem] border border-white/80 bg-white/85 px-5 py-4 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
              FluentPath workspace
            </p>
            <p className="mt-2 text-sm text-slate-600">Signed in as {user.email}</p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
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

            <SignOutButton />
          </div>
        </header>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
