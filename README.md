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
cp .env.example .env   # adjust DB credentials if you want
docker compose up --build
```

- Dashboard: http://localhost:8080
- API directly: http://localhost:4000/api/projects

The backend runs Prisma migrations and seeds a handful of example projects
automatically on first startup, so the dashboard isn't empty.

## Local development (without Docker)

Requires Node 20+ and a local Postgres instance.

```bash
# Backend
cd backend
cp .env.example .env   # point DATABASE_URL at your local Postgres
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

- User accounts / login (currently no auth — anyone with network access can edit)
- File/document attachments (drawings, contracts, correspondence)
- Audit history of changes to a project
- Notifications for approaching deadlines
- Integration with existing GVW systems (e.g. finance, GIS/asset data)

## Project structure

```
backend/    Express API + Prisma schema/migrations
frontend/   React dashboard (Vite)
docker-compose.yml
```
