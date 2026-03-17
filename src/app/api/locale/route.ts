import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

import { defaultLocale, localeCookieName, locales, type Locale } from "@/features/i18n/messages";

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { locale?: Locale };
  const locale = isLocale(body.locale) ? body.locale : defaultLocale;

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").update({ preferred_locale: locale }).eq("id", user.id);
    }
  } catch {
    // Ignore profile sync failures and keep cookie persistence.
  }

  return NextResponse.json({ ok: true });
}
