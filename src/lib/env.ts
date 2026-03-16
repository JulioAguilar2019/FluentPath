const publicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;

const requiredPublicEnvKeys = ["NEXT_PUBLIC_SUPABASE_URL"] as const;

export function hasSupabaseEnv() {
  return Boolean(publicEnv.NEXT_PUBLIC_SUPABASE_URL) && Boolean(getSupabaseKey());
}

export function getMissingSupabaseEnvKeys() {
  const missingKeys: string[] = requiredPublicEnvKeys.filter((key) => !publicEnv[key]);

  if (!getSupabaseKey()) {
    missingKeys.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return missingKeys;
}

function getSupabaseKey() {
  return (
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabaseEnv() {
  const missingKeys = getMissingSupabaseEnvKeys();

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing Supabase environment variables: ${missingKeys.join(", ")}`
    );
  }

  return {
    url: publicEnv.NEXT_PUBLIC_SUPABASE_URL as string,
    publishableKey: getSupabaseKey() as string,
  };
}
