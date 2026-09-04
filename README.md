# APD Project Management Dashboard

A project management dashboard for Goulburn Valley Water's Asset & Project
Delivery (APD) team. It gives Project Managers a single view of construction
projects — status, budget, key dates, and who owns what — plus a detail page
per project for tracking tasks/milestones and their due dates.

## Stack

- **Frontend:** React + TypeScript (Vite), Tailwind CSS
- **Backend:** Node.js + Express + TypeScript, Prisma ORM
- **Database:** PostgreSQL
- **Runtime:** Docker Compose (three services: `frontend`, `backend`, `db`)

## Running it

```bash
cp .env.example .env
# edit .env: set JWT_SECRET to a random value, e.g. `openssl rand -base64 32`
docker compose up --build
```

- Dashboard: http://localhost:8080
- API directly: http://localhost:4000/api/projects

The backend runs Prisma migrations and seeds a handful of example projects
(and demo user accounts — see **Authentication** below) automatically on
first startup, so the dashboard isn't empty.

## Local development (without Docker)

Requires Node 20+ and a local Postgres instance.

```bash
# Backend
cd backend
cp .env.example .env   # point DATABASE_URL at your local Postgres; set a real JWT_SECRET
npm install
npm run prisma:migrate:dev
npm run dev             # http://localhost:4000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173, proxies /api to backend via vite/nginx in prod
```

The Vite dev server proxies `/api` to `http://localhost:4000` (see
`frontend/vite.config.ts`), matching the nginx proxy used in the Docker build,
so `npm run dev` talks to your local backend out of the box.

## Data model (v1)

Each **Project** tracks:

- Name, description, asset type (e.g. Pipeline, Pump Station, Treatment Plant)
- Status: Planning → Design → Tender → Construction → Defects Liability → Complete
  (plus On Hold / Cancelled)
- Project manager, location, contractor
- Budget vs. contract value
- Start date, target completion date, actual completion date

A project marked "overdue" on the dashboard means its target completion date
has passed while it's still actively in progress — Defects Liability,
Complete, and Cancelled projects are excluded, since passing that date is
expected by then.

Each project also has a list of **Tasks** (visible on its detail page, opened
by clicking a row): title, status (To Do / In Progress / Done), and an
optional due date. Tasks with the nearest due dates across all projects show
up in the "Upcoming Deadlines" panel on the main dashboard.

See `backend/prisma/schema.prisma` for the source of truth.

## Activity history

Every project and task change is written to an append-only `ActivityLog` —
who did what, and when. It's attributed to the logged-in user (name captured
at write time, so entries stay meaningful even if that user is later
removed), and visible in two places:

- Each project's detail page has an **Activity** panel scoped to that project
- The dashboard's **Recent Activity** panel shows the latest changes across
  every project, each linking back to its project

A deleted project's activity entries aren't deleted with it — they survive
(with a snapshot of the project's name) so there's a record that it existed
and was removed, and by whom.

## Authentication

The app requires login — every `/api/projects` and `/api/tasks` route needs a
valid session, enforced by the backend (not just hidden in the UI). Sessions
are a JWT in an httpOnly cookie, issued on `POST /api/auth/login` and checked
by `requireAuth` middleware on every protected route.

The seed script creates three demo accounts (matching the seeded projects'
project managers), all sharing one password:

| Email | Password |
|---|---|
| a.nguyen@example.com | `ChangeMe123!` |
| s.patel@example.com | `ChangeMe123!` |
| j.wilson@example.com | `ChangeMe123!` |

These are demo credentials for a starter project — there's no self-serve
signup or password-reset flow yet (see Roadmap). For real use, change these
passwords directly in the database (or extend the seed script) before
exposing the app beyond your own machine.

`JWT_SECRET` **must** be set to a real random value outside of local dev —
`docker compose up` will refuse to start the backend without it. Generate one
with `openssl rand -base64 32`.

## Reports

The "Reports" link on the dashboard opens a portfolio-level view with three
charts, built from the same project/task data (no separate reporting
backend):

- **Projects by Status** — count of projects at each pipeline stage
- **Budget by Asset Type** — total budget grouped by asset type
- **Task Progress by Project** — a To Do / In Progress / Done breakdown per
  project, sorted so the least-progressed projects surface first

Chart colors and layout follow a small internal palette in
`frontend/src/charts/palette.ts`, chosen for colorblind-safe contrast between
task-status colors.

## Roadmap ideas (not built yet)

This is intentionally a starting point. Natural next steps to discuss:

- Self-serve password reset / change-password flow, and an admin UI for managing users (today: seeded accounts + a shared demo password)
- Per-user permissions (today: any logged-in user can edit/delete any project)
- File/document attachments (drawings, contracts, correspondence)
- Notifications for approaching deadlines
- Integration with existing GVW systems (e.g. finance, GIS/asset data)

## Project structure

```
backend/    Express API + Prisma schema/migrations
frontend/   React dashboard (Vite)
docker-compose.yml
```
