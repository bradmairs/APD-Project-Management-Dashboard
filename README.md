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
- BP Ref. No., Project Manager, Project Director, Project Sponsor
- Location, contractor
- Budget vs. contract value
- Start date, target completion date, actual completion date

A project marked "overdue" on the dashboard means its target completion date
has passed while it's still actively in progress — Defects Liability,
Complete, and Cancelled projects are excluded, since passing that date is
expected by then.

Each project also has a list of **Tasks** (visible on its detail page, opened
by clicking a row): title, status (To Do / In Progress / Done), and an
optional due date. Tasks with the nearest due dates across all projects show
up in the "Upcoming Deadlines" panel on the main dashboard, and in the
notification bell described below.

See `backend/prisma/schema.prisma` for the source of truth.

## Deadline notifications

A bell icon next to the account menu — present on every page, not just the
dashboard — shows a badge with the count of tasks that are overdue or due
within the next 7 days (across all projects, not just your own). The badge
is red if anything is overdue, amber if only "due soon" items remain.
Clicking it opens a list of those tasks, each linking to its project.

There's no email/SMS delivery — this is in-app only, reusing the same
`/api/tasks/upcoming` data as the dashboard's "Upcoming Deadlines" panel, so
the two always agree. Nothing to configure (no SMTP credentials needed).

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

## Attachments

Each project has an **Attachments** panel for drawings, contracts, and
correspondence. Files are stored on disk (not in Postgres), organized by
project under `backend/uploads/<projectId>/` — the Docker Compose setup
mounts that path to a named volume (`uploads_data`) so uploads survive
container restarts and rebuilds.

- Allowed types: PDF, Word, Excel, PowerPoint, images (PNG/JPG/GIF), CSV,
  TXT, DWG, and ZIP — anything else is rejected with a clear error
- Max file size: 20MB
- On-disk filenames are always a fresh random ID, never the name the file was
  uploaded with, so a crafted filename can't be used to overwrite another
  file or escape the upload directory
- Deleting a project deletes its attachments' files from disk too, not just
  their database rows
- Uploads and deletions are recorded in that project's Activity panel like
  any other change

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

These are demo credentials for a starter project. Change them once you're
using the app for real — every user can do this themselves from the account
menu (top right → **Change Password**), no admin needed.

`JWT_SECRET` **must** be set to a real random value outside of local dev —
`docker compose up` will refuse to start the backend without it. Generate one
with `openssl rand -base64 32`.

### Managing users

Admins get a **Manage Users** link in the account menu, opening a page to:

- See every account, its role, and when it joined
- Create a new account (name, email, a temporary password you share with
  them directly — there's no email/invite flow yet) with either role
- Promote or demote a user between `MEMBER` and `ADMIN`

An admin can't demote themselves (the UI disables their own row, and the
backend rejects it too) — a guard against a lone admin locking themselves
out by mistake.

Admins can also **deactivate** an account instead of deleting it — the
"Deactivate" link on each row. A deactivated user can't log in (their
existing session is cut off immediately too, not just future logins — every
request re-checks the flag rather than trusting the session cookie), but
nothing about them is deleted: their projects, tasks, activity history, and
attachments stay exactly as they were, still attributed to them by name.
"Reactivate" restores login access with no other side effects. The same
self-lockout guard applies here — an admin can't deactivate their own
account. There's still no way to permanently delete a user outright, which
is deliberate: deactivating covers the real use case (someone leaves the
team) without the SET NULL cleanup and lost-history trade-offs a hard
delete would need.

### Permissions

Every user has a **role** — `MEMBER` (default) or `ADMIN` — and every project
records who created it. All logged-in users can view every project and
create new ones, but **editing or deleting a project is restricted to its
creator or an admin**; this is enforced by the backend (a 403, not just a
hidden button) as well as reflected in the UI, which hides the Edit/Delete
buttons and shows who owns the project instead. Tasks and attachments stay
open to any logged-in user, matching how a small team actually works day to
day — only the project record itself needs an owner.

A project with no recorded creator (there isn't one in the current seed
data, but this covers a project whose creator's account was later removed)
is editable by anyone, rather than being permanently locked out.

The seed script creates one `admin@example.com` account (same demo
password) alongside the three `MEMBER` accounts, and assigns each seeded
project to the user matching its project manager, so the permission model
has something real to demonstrate out of the box.

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

## Monthly Reports

Each project has a **Monthly Reports** panel, modelled on GVW's existing
board-reporting template: Reporting Month, Project Phase (e.g. "3 - Plan"),
Current Status (e.g. "Concept Design"), free-text "Recently Completed" and
"Monthly Lookahead" notes, and a Budget Health / Schedule Health traffic
light (Green / Amber / Red) each with its own comments.

A report is a **locked snapshot**, not a live view: each (project, month)
pair is its own row, created once and then left alone as the historical
record for that month, the same way the source document is a point-in-time
report rather than something that keeps changing after the fact. Only one
report can exist per project per month. Editing an existing month's report
is still possible (for correcting a mistake), and follows the same
creator-or-admin permission rule as projects — the report's author is
snapshotted by name so it stays attributed even if that account is later
removed or deactivated.

This is the first phase of a larger effort to bring the full monthly report
into the dashboard. Not yet built:

- **Cash flow tracking** — monthly actual/forecast $ by financial year,
  rolling up to the report's expenditure-to-date and variance figures
- **A formatted report view and export** — once the above exists, a page
  that lays everything out like the source document, with a PDF/print
  option for board reporting

## Milestones

Each project has a **Milestones** panel — the source report's WBS schedule
table: Task/Activity, an optional WBS Item code, Percentage Completed
(shown as a progress bar), and Original / Forecasted / Actual Completion
dates, plus free-text notes. A rolled-up "X% complete overall" figure next
to the panel title is the average across all of a project's milestones,
matching the source report's "Project Completion" summary row.

Unlike Monthly Reports, milestones are a **live list**, not a per-month
snapshot — the same way Tasks work. A project's WBS breakdown (Concept
Design, Detailed Design, Construction, ...) mostly doesn't change month to
month, so re-entering the whole table on every report would just be
duplication; a monthly report view (once built) would read the milestones
as they stand at that time, the same way a real report is a point-in-time
look at a schedule that itself keeps moving.

Milestones keep their WBS order via up/down arrows (a new one is appended
to the end) rather than being sorted by date or percentage, since that
sequence is meaningful on its own and isn't derivable from the other
fields. Open to any logged-in user to edit, like Tasks and Attachments —
only the project record itself needs an owner.

## Roadmap ideas (not built yet)

This is intentionally a starting point. Natural next steps to discuss:

- Email/SMS delivery for deadline notifications (today: in-app only, via the notification bell)
- Integration with existing GVW systems (e.g. finance, GIS/asset data)

## Project structure

```
backend/    Express API + Prisma schema/migrations
frontend/   React dashboard (Vite)
docker-compose.yml
```
