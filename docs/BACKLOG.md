# FluentPath Backlog

## Sprint Context

- Sprint name: `Sprint 1 - MVP FluentPath`
- Duration: `2 weeks`
- Goal: deliver a functional MVP with authentication, tasks, timers, saved sessions, progress dashboard, bilingual UI, and first deployment

## Sprint Goal

Deliver a working bilingual MVP where a user can register, sign in, create English-study tasks, run a free timer or Pomodoro timer, save study sessions, and review core progress metrics in a deployed app.

## MVP Scope In

- project setup
- Supabase base integration
- email/password authentication
- multiuser data model
- app shell and navigation
- task CRUD
- free timer
- pomodoro timer
- study session history
- dashboard metrics
- progress charts
- bilingual support
- settings
- deployment

## MVP Scope Out

- Google OAuth
- AI features
- flashcards
- vocabulary management
- social features
- notifications
- advanced gamification
- advanced analytics beyond core dashboard value

## Epic and Story Map

### Epic 1 - Project Setup

#### Story - Project Setup

- status: completed
- story points: `3`
- priority: `Highest`

Goal:

- establish the project foundation using the agreed stack and tooling

Acceptance criteria:

- project is created with `Next.js`, `TypeScript`, `Tailwind`, `App Router`, and `pnpm`
- `shadcn/ui` is initialized
- the project runs locally
- lint and build pass
- basic structure exists for future features

Delivered notes:

- this story is already done in the repository

#### Story - Supabase Base

- status: in progress
- story points: `3`
- priority: `Highest`

Goal:

- connect the app to Supabase and prepare the environment for auth and data access

Acceptance criteria:

- Supabase client is configured
- environment variables are wired correctly
- the app can safely consume Supabase config
- the project is ready for auth implementation

Suggested subtasks:

- create Supabase project
- add local env values
- install Supabase packages
- create browser and server client setup
- verify config works in app runtime

Implementation notes:

- packages installed: `@supabase/ssr`, `@supabase/supabase-js`
- created base env helper and Supabase client factories
- pending manual step: project URL and anon key in `.env.local`
- pending manual step: project URL and publishable key in `.env.local`

### Epic 2 - Authentication and User Management

#### Story - Authentication

- status: completed with profile bootstrap deferred to schema story
- story points: `5`
- priority: `Highest`

Goal:

- allow users to register and sign in with email/password and access only protected pages when authenticated

Acceptance criteria:

- user can sign up
- user can sign in
- user can sign out
- protected routes reject unauthenticated access
- profile bootstrap exists for new accounts

Suggested subtasks:

- create auth screens
- integrate sign-up flow
- integrate sign-in flow
- create logout action
- add route protection
- create initial profile record

Implementation notes:

- sign-in, sign-up, logout, and route protection are implemented
- protected dashboard shell is live
- profile bootstrap is intentionally deferred because `profiles` table belongs to the `Database Schema` story

### Epic 3 - App Shell and Navigation

#### Story - App Layout

- status: pending
- story points: `3`
- priority: `High`

Goal:

- provide a clear app shell and navigable structure for the MVP

Acceptance criteria:

- public and private layouts exist
- navigation to main sections exists
- pages for dashboard, tasks, timer, progress, and settings are scaffolded
- mobile and desktop base layout works

Suggested subtasks:

- create public layout
- create private layout
- create navigation
- add route placeholders
- add shared shell components

### Epic 4 - Database and Security

#### Story - Database Schema

- status: in progress
- story points: `5`
- priority: `Highest`

Goal:

- define and secure the core data model for the MVP

Acceptance criteria:

- `profiles`, `tasks`, `study_sessions`, and `task_categories` exist
- relations are coherent
- row-level security is enabled
- users only access their own data

Suggested subtasks:

- design schema
- create SQL migrations or setup scripts
- enable RLS
- create access policies
- validate ownership rules

Implementation notes:

- migration file created at `supabase/migrations/001_initial_schema.sql`
- schema includes `profiles`, `task_categories`, `tasks`, and `study_sessions`
- profile bootstrap is handled by a trigger on `auth.users`
- default task categories are seeded per new user
- pending manual step: run the SQL in Supabase and confirm it succeeds

### Epic 5 - Task Management

#### Story - Task Management

- status: completed
- story points: `5`
- priority: `Highest`

Goal:

- let users create and manage study tasks tied to their account

Acceptance criteria:

- user can create a task
- user can view their tasks
- user can edit a task
- user can mark a task as completed
- user can define category and target time

Suggested subtasks:

- create task form
- create task list view
- add edit flow
- add complete state
- add category selection
- add target duration field

Implementation notes:

- protected tasks route created at `src/app/(app)/tasks/page.tsx`
- server actions handle create, update, complete, reactivate, and archive flows
- task data is fetched from Supabase with category joins
- dashboard now surfaces task counts from real data
- app-side fallback profile bootstrap was added to handle users created before the schema migration ran

### Epic 6 - Study Timer

#### Story - Free Timer

- status: completed
- story points: `5`
- priority: `Highest`

Goal:

- let users run an open-ended study timer and save the result as a study session

Acceptance criteria:

- user can pick a task
- user can start a timer
- user can pause and resume
- user can finish the session
- session duration is saved correctly

Suggested subtasks:

- build timer state logic
- build timer UI
- attach timer to selected task
- save completed session
- validate stored duration

Implementation notes:

- protected timer route created at `src/app/(app)/timer/page.tsx`
- client timer supports start, pause, resume, reset, and finish
- completed sessions are saved through `saveFreeSessionAction`
- timer only works with active tasks and writes to `study_sessions`

#### Story - Pomodoro Timer

- status: completed
- story points: `5`
- priority: `High`

Goal:

- let users study with a structured Pomodoro flow

Acceptance criteria:

- user can start a Pomodoro session
- focus and break states are differentiated
- completed focus time is saved
- the session can be tied to a task

Suggested subtasks:

- create pomodoro mode
- add focus duration settings
- add short break settings
- save effective study time
- connect pomodoro to selected task

Implementation notes:

- timer page now supports switching between free timer and pomodoro mode
- pomodoro preferences are loaded from `profiles`
- focus and break phases auto-transition during a running session
- saved pomodoro sessions write focus minutes, break minutes, and cycles into `study_sessions`

#### Story - Study Sessions History

- status: completed
- story points: `3`
- priority: `High`

Goal:

- let users review recent study activity

Acceptance criteria:

- user sees recent sessions
- each session shows task, mode, duration, and date
- only current user sessions appear

Suggested subtasks:

- fetch sessions
- sort by latest
- render session list
- handle empty states

Implementation notes:

- protected history view created at `src/app/(app)/progress/page.tsx`
- recent sessions are fetched from `study_sessions` with linked task titles
- dashboard now reads total saved sessions for a simple snapshot
- empty history state is handled when no sessions exist

### Epic 7 - Dashboard and Progress

#### Story - Dashboard

- status: completed
- story points: `5`
- priority: `Highest`

Goal:

- give users a quick view of their study progress

Acceptance criteria:

- dashboard shows time studied today
- dashboard shows time studied this week
- dashboard shows number of sessions
- dashboard shows active tasks
- dashboard shows a simple streak metric

Suggested subtasks:

- compute daily total
- compute weekly total
- compute sessions count
- compute active task count
- compute simple streak
- render metric cards

Implementation notes:

- dashboard metrics now come from real `study_sessions` and `tasks` data
- added today total, week total, total sessions, active tasks, completed tasks, and current streak
- dashboard includes a recent activity preview based on saved sessions

#### Story - Progress Charts

- status: pending
- story points: `3`
- priority: `Medium`

Goal:

- visualize study consistency and activity through charts

Acceptance criteria:

- at least one weekly chart exists
- chart data reflects the authenticated user
- chart rendering works without breaking the page

Suggested subtasks:

- install `Recharts`
- prepare chart data shape
- create weekly chart
- create category or activity breakdown chart

### Epic 8 - Bilingual and Preferences

#### Story - Bilingual Support

- status: completed
- story points: `5`
- priority: `High`

Goal:

- allow users to use the app in English or Spanish

Acceptance criteria:

- core UI text supports `es` and `en`
- user can switch language
- selected language persists

Suggested subtasks:

- define translation structure
- add English copy
- add Spanish copy
- add language switcher
- persist preference

Implementation notes:

- translation dictionaries added for English and Spanish
- locale is resolved from cookie first and profile preference second
- locale switcher is available on public and private layouts
- selected language persists and syncs to `profiles.preferred_locale` for authenticated users

#### Story - Settings

- status: completed
- story points: `3`
- priority: `Medium`

Goal:

- allow users to manage basic app and timer preferences

Acceptance criteria:

- settings page exists
- user can configure pomodoro durations
- user can change interface language
- preferences persist between sessions

Suggested subtasks:

- create settings screen
- create form state
- add timer preference fields
- add language preference field
- save settings

Implementation notes:

- protected settings page created at `src/app/(app)/settings/page.tsx`
- settings form persists language, default timer mode, and pomodoro values to `profiles`
- saving settings also syncs the locale cookie for immediate bilingual updates
- app navigation now includes the settings route in the private workspace

### Epic 9 - Deployment and Release

#### Story - Deployment

- status: pending
- story points: `3`
- priority: `High`

Goal:

- release the MVP online and validate the main flows in production

Acceptance criteria:

- app is deployed in `Vercel`
- environment variables are configured
- auth works in production
- core task and session flows work in production

Suggested subtasks:

- connect repository to Vercel
- set production env vars
- run production smoke test
- fix deployment issues if needed

## Priority Order for Execution

1. `Supabase Base`
2. `Authentication`
3. `Database Schema`
4. `App Layout`
5. `Task Management`
6. `Free Timer`
7. `Study Sessions History`
8. `Dashboard`
9. `Pomodoro Timer`
10. `Bilingual Support`
11. `Settings`
12. `Progress Charts`
13. `Deployment`

## Manual Responsibilities

These tasks require user action during the sprint:

- create and manage `Supabase` project
- create and manage `Vercel` project
- maintain `Jira` states and sprint discipline
- validate implemented flows manually
- decide on any product preference not yet locked

## Agent Responsibilities

These tasks can be handled during implementation sessions:

- project setup and configuration
- code structure and feature implementation
- auth integration
- database integration support
- UI implementation
- timer logic
- dashboard and chart implementation
- deployment preparation

## Notes for Future Sessions

- always check `docs/AGENTS.md` first for project context
- use this file as the working backlog reference inside coding sessions
- keep Sprint 1 focused on the MVP only
- if a new idea appears, place it in a future sprint unless it is required for MVP completion
