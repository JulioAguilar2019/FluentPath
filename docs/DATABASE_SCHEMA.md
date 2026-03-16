# Database Schema

## Goal

Define the MVP data model for `FluentPath` and make ownership secure with Supabase Row Level Security.

## Schema File

The initial schema lives in:

- `supabase/migrations/001_initial_schema.sql`

## How To Apply It

Use the `Supabase SQL Editor` and run the contents of `supabase/migrations/001_initial_schema.sql`.

If you later install the Supabase CLI, this file can also serve as the first migration.

## Tables Included

### `profiles`

Purpose:

- stores one row per authenticated user
- keeps profile and app preference data

Key fields:

- `id`
- `email`
- `full_name`
- `preferred_locale`
- `default_timer_mode`
- `pomodoro_focus_minutes`
- `pomodoro_short_break_minutes`
- `pomodoro_long_break_minutes`
- `pomodoro_long_break_interval`

### `task_categories`

Purpose:

- stores per-user task categories
- supports bilingual category names

Key fields:

- `user_id`
- `slug`
- `name_en`
- `name_es`
- `color`
- `sort_order`

Default categories created automatically on sign-up:

- `vocabulary`
- `grammar`
- `listening`
- `speaking`
- `reading`
- `writing`

### `tasks`

Purpose:

- stores study tasks created by each user

Key fields:

- `user_id`
- `category_id`
- `title`
- `description`
- `target_minutes`
- `timer_mode_preference`
- `status`
- `completed_at`

Statuses:

- `active`
- `completed`
- `archived`

### `study_sessions`

Purpose:

- stores completed or interrupted study sessions
- supports both free timer and pomodoro mode

Key fields:

- `user_id`
- `task_id`
- `mode`
- `status`
- `started_at`
- `ended_at`
- `duration_seconds`
- `focus_minutes`
- `break_minutes`
- `pomodoro_cycles`
- `notes`

Modes:

- `free`
- `pomodoro`

Statuses:

- `completed`
- `cancelled`
- `abandoned`

## Automatic Profile Bootstrap

The schema includes a trigger on `auth.users`.

When a new user signs up it will automatically:

- create the `profiles` row
- copy basic user data like email and display name fallback
- create default task categories for that user

This completes the profile bootstrap work that was deferred during the authentication story.

## RLS Rules

RLS is enabled on every application table:

- `profiles`
- `task_categories`
- `tasks`
- `study_sessions`

Policy model:

- users can only read their own rows
- users can only insert rows with their own `user_id`
- users can only update their own rows
- users can only delete their own rows where deletion is allowed

## Indexes Included

The schema adds indexes for common MVP queries:

- profile email lookup
- user category ordering
- task list by user and status
- sessions by user and recent date
- task relation lookups

## Next Implementation Impact

This schema prepares the app for:

- reading the authenticated user profile
- loading default categories after sign-up
- creating tasks safely per user
- saving free timer and pomodoro sessions
- building dashboard metrics from `study_sessions`
