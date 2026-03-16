# FluentPath Agent Guide

## Project Overview

- Project name: `FluentPath`
- Product type: bilingual web app for tracking English-study progress
- Main goal: let users organize study tasks, run timers, save study sessions, and review progress
- Current stage: `Sprint 1 - MVP`
- Repository status: base project setup completed

## Product Vision

FluentPath starts as a study tracking platform focused on English learning. The MVP helps users create study tasks, track time with free and Pomodoro timers, save study sessions, and review progress in a clean dashboard. The platform is designed as multiuser from day one even if the first real user is the owner of the project.

## Core Product Principles

- Keep the MVP small, usable, and demoable
- Prioritize real user value over feature quantity
- Build with professional structure and maintainability in mind
- Support Spanish and English UI
- Keep authentication and data ownership secure for multiuser usage

## Confirmed Product Decisions

- App name: `FluentPath`
- Architecture: `multiuser`
- Interface: `bilingual` (`es` and `en`)
- Timer modes: `free timer` and `pomodoro`
- Auth in Sprint 1: `email/password`
- Google OAuth: moved to `Sprint 2`

## Approved Tech Stack

- Framework: `Next.js`
- Language: `TypeScript`
- Styling: `Tailwind CSS`
- UI components: `shadcn/ui`
- Backend platform: `Supabase`
- Database: `PostgreSQL` via `Supabase`
- Data access for MVP: `Supabase client`
- Deployment: `Vercel`
- Charts: `Recharts`
- Package manager: `pnpm`

## Current Architecture Direction

### App Scope for MVP

- authentication
- task management
- free timer
- pomodoro timer
- study session history
- dashboard with core metrics
- bilingual support
- basic settings
- first deployment

### Features Excluded From Sprint 1

- Google OAuth
- AI features
- flashcards
- vocabulary trainer
- social features
- notifications
- advanced gamification
- advanced reports

## Current Folder Intent

The project already includes a base structure that will grow during the sprint:

```text
src/
  app/
  components/
    shared/
    ui/
  config/
  features/
  hooks/
  lib/
  types/
```

### Intended Responsibilities

- `src/app`: routes, layouts, page-level server components
- `src/components/ui`: generated and reusable `shadcn/ui` components
- `src/components/shared`: app-specific shared UI pieces
- `src/features`: domain modules like `auth`, `tasks`, `timer`, `progress`, `settings`
- `src/config`: static config like site metadata and future locale config
- `src/lib`: helpers, utilities, clients, adapters
- `src/hooks`: client hooks when needed
- `src/types`: shared TypeScript contracts

## Setup Already Completed

- `pnpm` activated with `corepack`
- `Next.js` app created with `App Router`, `TypeScript`, `Tailwind CSS`, and `src/`
- `shadcn/ui` initialized
- initial landing page replaced with FluentPath starter screen
- global theme tokens customized
- `.env.example` created with Supabase public variables
- production build and lint verified successfully
- Supabase client packages and base factories prepared
- Supabase env supports both `publishable` and legacy `anon` key naming
- email/password auth routes and protected dashboard shell are implemented
- initial SQL schema and RLS plan are documented for Supabase execution
- task management CRUD is implemented with server actions and Supabase-backed pages
- free timer flow is implemented and saves study sessions to Supabase
- study session history is available in the protected progress view
- dashboard now shows real MVP metrics for today, this week, sessions, active tasks, and streak

## Main Files Added or Updated During Setup

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/config/site.ts`
- `.env.example`
- `src/lib/env.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/proxy.ts`
- `proxy.ts`
- `src/lib/auth.ts`
- `src/app/(auth)/sign-in/page.tsx`
- `src/app/(auth)/sign-up/page.tsx`
- `src/app/(app)/dashboard/page.tsx`
- `src/app/(app)/layout.tsx`
- `src/app/(app)/tasks/page.tsx`
- `src/app/(app)/timer/page.tsx`
- `src/app/(app)/progress/page.tsx`
- `src/features/dashboard/server.ts`
- `src/features/dashboard/types.ts`
- `src/features/auth/components/auth-form.tsx`
- `src/features/auth/components/sign-out-button.tsx`
- `src/features/progress/server.ts`
- `src/features/progress/types.ts`
- `src/features/tasks/actions.ts`
- `src/features/tasks/server.ts`
- `src/features/tasks/types.ts`
- `src/features/timer/actions.ts`
- `src/features/timer/components/free-timer-client.tsx`
- `docs/SUPABASE_SETUP.md`
- `supabase/migrations/001_initial_schema.sql`
- `docs/DATABASE_SCHEMA.md`

## Development Workflow

### Project Management

- Project board tool: `Jira`
- Work style: `Scrum-like`, focused on one sprint that delivers the MVP in two weeks
- Jira is the source of truth for sprint execution

### Sprint Workflow

- move one story into progress
- implement the story in focused increments
- validate acceptance criteria
- move the story to review or done
- continue with the next highest-priority story

### Branch Naming Convention

Recommended branch naming:

- `feature/FP-xx-short-description`
- `fix/FP-xx-short-description`
- `chore/FP-xx-short-description`

### Definition of Ready

A ticket should be ready when:

- scope is clear
- acceptance criteria exist
- dependencies are known
- it fits the sprint

### Definition of Done

A ticket is done when:

- implementation is complete
- manual validation passes
- lint/build still pass when relevant
- the feature satisfies its acceptance criteria

## Data Model Direction for MVP

Planned initial tables:

- `profiles`
- `tasks`
- `study_sessions`
- `task_categories`

Current schema decision:

- settings-related MVP preferences live in `profiles`
- `task_categories` are user-owned and seeded automatically on sign-up
- profile bootstrap is handled by a database trigger on `auth.users`

### Data Ownership Rules

- every user can access only their own data
- tasks belong to one user
- sessions belong to one user and optionally to one task
- future RLS policies must enforce data isolation

## UX Direction

- responsive for desktop and mobile
- not generic-looking; keep a clear visual identity
- clean, motivating, study-focused UI
- avoid unnecessary complexity in the MVP
- maintain room for bilingual content from the start

## Authentication Plan

### Sprint 1

- sign up with email/password
- sign in with email/password
- logout
- route protection
- profile bootstrap is pending the database schema story because the `profiles` table does not exist yet

### Sprint 2

- Google OAuth

## Recommended Implementation Order

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

## Session Handoff Notes

Any future agent should assume:

- the project uses `pnpm`
- the app is a `Next.js App Router` project
- `shadcn/ui` is already initialized
- the MVP should stay tight and avoid scope creep
- `Google OAuth` is not part of Sprint 1
- Jira backlog already exists and the markdown backlog in `docs/BACKLOG.md` mirrors that planning

## Immediate Next Story

The next implementation target after setup is:

- `Task Management` is implemented and the next strong candidate is `Free Timer`

Expected manual user actions for that story:

- test creating, editing, completing, reactivating, and archiving tasks with a real account

Expected implementation work for that story:

- build timer flows using the existing task model and study session table

### Supabase Base Progress

- base dependencies are installed
- environment helpers exist
- browser and server client factories exist
- local project values are still required from the user to complete runtime setup

### Authentication Progress

- sign-in page exists
- sign-up page exists
- dashboard route is protected
- authenticated users are redirected away from auth pages
- logout exists
- profile bootstrap is defined in the SQL schema and becomes active once the migration is run
- authenticated requests now also backfill missing `profiles` and default categories for users created before the schema trigger existed

### Task Management Progress

- protected `/tasks` page exists
- users can create tasks
- users can edit tasks
- users can mark tasks completed
- users can reactivate completed tasks
- users can archive tasks
- dashboard now reads real task counts from Supabase

### Free Timer Progress

- protected `/timer` page exists
- user can select an active task
- user can start a free timer
- user can pause and resume
- user can finish and save a study session into `study_sessions`

### Study Sessions History Progress

- protected `/progress` page exists
- recent sessions are fetched from `study_sessions`
- each session shows task, mode, duration, and timestamps
- dashboard now includes session counts from real saved data

### Dashboard Progress

- dashboard uses real session and task data
- shows studied time for today and current week
- shows total sessions and active/completed task counts
- shows a simple current streak based on consecutive study days
- surfaces recent session activity for quick review
