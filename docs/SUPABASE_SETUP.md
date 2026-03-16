# Supabase Setup

## Goal

Connect `FluentPath` to a new `Supabase` project so the app is ready for authentication and database work.

## What Is Already Done In Code

- installed `@supabase/ssr`
- installed `@supabase/supabase-js`
- added environment helpers in `src/lib/env.ts`
- added browser client factory in `src/lib/supabase/client.ts`
- added server client factory in `src/lib/supabase/server.ts`

## What You Need To Do In Supabase

1. Create a new project in `Supabase`
2. Open `Project Settings`
3. Go to `Data API` or `API` settings
4. Copy these values:
   - `Project URL`
   - `Publishable key`

If your dashboard still shows the legacy tab, you may also see `anon` keys. For this project:

- prefer `Publishable key`
- legacy `anon` also works as a fallback because the app supports both names

## Local Environment Setup

Create a local env file named `.env.local` in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

You can use `.env.example` as the template.

Legacy fallback if needed:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-legacy-anon-key
```

## Validation Checklist

After adding the values, the project will be ready for:

- `email/password` auth implementation
- server and browser Supabase access
- future route protection
- database schema work

## Next Story After This One

- `Authentication`

## Notes

- `Google OAuth` stays out of Sprint 1
- auth token refresh proxy logic will be added in the authentication story
