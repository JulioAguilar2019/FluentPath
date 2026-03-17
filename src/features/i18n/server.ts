import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

import { defaultLocale, localeCookieName, locales, messages, type Locale } from "./messages";

function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export async function getLocale() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;

  if (isLocale(cookieLocale)) {
    return cookieLocale;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_locale")
        .eq("id", user.id)
        .maybeSingle();

      if (isLocale(profile?.preferred_locale)) {
        return profile.preferred_locale;
      }
    }
  } catch {
    return defaultLocale;
  }

  return defaultLocale;
}

export async function getMessages() {
  const locale = await getLocale();
  return { locale, messages: messages[locale] };
}
