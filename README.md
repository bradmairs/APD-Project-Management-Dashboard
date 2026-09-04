# APD Project Management Dashboard

A project management dashboard for Goulburn Valley Water's Asset & Project
Delivery (APD) team. Version one gives Project Managers a single view of
construction projects — status, budget, key dates, and who owns what — with
the ability to add and update projects directly.

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

Note: in local dev mode the frontend dev server does not proxy `/api` calls
(that's handled by nginx in the Docker build). If you want to hit a local
backend from `npm run dev`, add a Vite proxy rule for `/api` in
`frontend/vite.config.ts` pointing at `http://localhost:4000`.

## Data model (v1)

Each **Project** currently tracks:

- Name, description, asset type (e.g. Pipeline, Pump Station, Treatment Plant)
- Status: Planning → Design → Tender → Construction → Defects Liability → Complete
  (plus On Hold / Cancelled)
- Project manager, location, contractor
- Budget vs. contract value
- Start date, target completion date, actual completion date

See `backend/prisma/schema.prisma` for the source of truth.

## Roadmap ideas (not built yet)

This is intentionally a starting point. Natural next steps to discuss:

- User accounts / login (currently no auth — anyone with network access can edit)
- Task or milestone tracking within a project
- File/document attachments (drawings, contracts, correspondence)
- Charts: projects by status, spend over time, upcoming deadlines
- Audit history of changes to a project
- Notifications for approaching deadlines
- Integration with existing GVW systems (e.g. finance, GIS/asset data)

## Project structure

```
backend/    Express API + Prisma schema/migrations
frontend/   React dashboard (Vite)
docker-compose.yml
```
