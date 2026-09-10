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

## Notifications

A bell icon next to the account menu — present on every page, not just the
dashboard — shows a badge with the count of items that are overdue/expired
or due/expiring within their respective windows (across all projects, not
just your own): tasks and open RFIs due within 7 days, and permits or
insurance/warranties expiring within 60 days. The badge is red if anything
is overdue or expired, amber if only "due soon"/"expiring soon" items
remain. Clicking it opens one merged list — tasks, permits, insurance/
warranties, and RFIs together, sorted soonest first, each tagged with its
type and linking to its project.

`frontend/src/components/NotificationBell.tsx` composes this from four
existing portfolio-wide endpoints and their existing expiry/overdue
helpers rather than adding new backend logic: `getUpcomingTasks()` (all
fetched tasks are listed, but only overdue/due-soon ones count toward the
badge, via `taskMeta.ts`'s `isTaskOverdue`/`isTaskDueSoon`),
`getAllPermits()` / `getAllInsuranceWarranties()` filtered to flagged
items only via `permitMeta.ts`'s and `insuranceWarrantyMeta.ts`'s expiry
helpers, and `getAllRfis()` filtered via `rfiMeta.ts`'s
`isRfiOverdue`/`isRfiDueSoon` — the same helpers the dashboard's
"Permits Expiring Soon", "Insurance & Warranties Expiring Soon", and
"Open RFIs" panels use, so all four stay in agreement.

There's no email/SMS delivery — this is in-app only. Nothing to configure
(no SMTP credentials needed).

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

## Charts

The dashboard shows a **Spend vs Budget Over Time — All Projects** chart
right below the stat cards, then a **Projects by Status** chart below
that — so both the portfolio's financial trajectory and its pipeline
shape are visible without a click. The "Reports" link opens a dedicated
page with the status chart plus two more, all built from the same
project/task data (no separate reporting backend):

- **Projects by Status** — count of projects at each pipeline stage
- **Budget by Asset Type** — total budget grouped by asset type
- **Task Progress by Project** — a To Do / In Progress / Done breakdown per
  project, sorted so the least-progressed projects surface first

The dashboard's **Spend vs Budget Over Time — All Projects** chart is the
portfolio-wide sibling of each project's own chart described below: every
project's own cumulative Actual-then-Forecast series (see the per-project
description for how that series is built) is computed independently and
only then summed by month, rather than pooling every project's raw cash
flow entries into one bucket — that distinction matters because a project
still on Forecast for a given month must keep contributing its forecast
figure to the total even in a month where some *other* project has
already booked an Actual, which a naive combined-entries approach would
silently drop. The reference line sums every project's *revised* budget
(Approved Budget plus its own approved variations — see Variations
below), relabeling itself "Total Revised Budget" once any project in the
portfolio has one, the same way the per-project chart's own reference
line does. Both this and the per-project chart share their SVG rendering
(`frontend/src/charts/CumulativeSpendChartView.tsx`) and cumulative-series
math (`frontend/src/charts/cumulativeSpend.ts`).

Each project's Cash Flow panel has two charts:

- **Spend vs Budget Over Time** — a cumulative line: Actual spend (solid
  blue) running into Forecast spend (dashed orange) as the project's
  Actual entries run out, plotted against a flat budget reference line
  (dashed gray, labelled "Revised Budget" once the project has an
  approved variation, "Approved Budget" otherwise) and a "Today" marker.
  The x-axis spans the project's
  own Start Date to Target Completion (extended to cover any entry outside
  that range), so the chart doubles as a where-are-we-in-the-schedule view,
  not just a spend total. This is the one chart in the app drawn as an SVG
  line rather than HTML/CSS bars — a diagonal line isn't something bars can
  do, and a threshold like the budget line gets a neutral gray rather than
  a categorical hue since it isn't a data series.
- **Monthly Spend** — the existing bar-per-month Actual (blue) vs Forecast
  (orange) view, for comparing individual months rather than the running
  total.

Every chart is hand-rolled with plain HTML/CSS or SVG (no charting library)
and draws its colors from a small validated palette in
`frontend/src/charts/palette.ts` — chosen and checked for colorblind-safe
contrast (see the `dataviz` skill this project follows: categorical hues
assigned in a fixed order, never cycled, and validated with its palette
checker before use).

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

Click a report's **View** link to open it as a formatted, printable page —
see **Formatted Report View** below.

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

## Variations

Each project has a **Variations** panel for tracking contract variations
(scope, cost, and time changes) as they move through their own lifecycle:
Proposed → Approved or Rejected, changeable inline from the panel itself
(a status `<select>` per row) or from the full edit form. A variation
records a Reference (e.g. "VAR-01"), Title, Category (free text, with
suggestions like "Latent Conditions" or "Scope Change"), Description, a
Cost Impact (can be negative, for a credit/deduction), an optional Time
Impact in days, the date it was raised, and free-text notes. `dateDecided`
is stamped automatically the moment a variation leaves Proposed, rather
than needing to be entered by hand. The panel header totals the value of
every currently Approved variation and flags how many are still awaiting
a decision.

Only an **Approved** variation counts toward a project's budget — a
Proposed one hasn't been agreed to yet, and a Rejected one never
happened. `frontend/src/variations.ts` computes each project's *revised
budget* (its Approved Budget plus the sum of its approved variations'
cost impact) once, and every other budget-aware figure in the app —
the Cash Flow panel's Variance calculation, both cumulative-spend charts'
budget reference line — reads from that revised figure rather than the
raw project budget. When a project has no approved variations the revised
budget is identical to the Approved Budget, so nothing downstream changes
its wording or behavior until a variation is actually approved.

Like Milestones and Cash Flow entries, a variation is live data with no
per-month snapshot — its current state (and history of status changes,
via the Activity panel) is what matters, not what it looked like on some
past reporting date. Open to any logged-in user to edit, matching Tasks,
Attachments, and Milestones.

## Extension of Time (EOT) Claims

Each project has an **Extension of Time Claims** panel — distinct from
Variations even though both are raised against a contract. A Variation
is a scope/cost/time change the parties agree to; an EOT claim argues
the existing schedule itself was disrupted (weather, latent conditions,
a client-caused delay) and should be pushed out, independent of any
scope change. A claim records a Reference, Title, Cause (free text, with
suggestions like "Weather" or "Latent Conditions"), Description, Days
Claimed, Days Granted (once decided — can be less than Days Claimed for
a partial grant, which is why it's a separate field rather than a fourth
status), a Status of Submitted/Approved/Rejected, the date submitted,
and notes. `dateDecided` stamps automatically on leaving Submitted, the
same pattern Variations use.

Only an **Approved** claim's granted days extend a project's expected
completion date. `frontend/src/eot.ts` computes each project's *revised
completion date* (its Target Completion plus the sum of its approved
claims' granted days) — the schedule equivalent of Variations' revised
budget — and the project overview shows it alongside Target Completion
once it differs. Project Health's Schedule dimension (below) uses this
revised date too, so an approved EOT claim pushes back the
overdue/approaching-due threshold the same way an approved Variation
revises the budget threshold — deliberately different from the
dashboard's "Overdue" stat and project table, which always reflect the
literal contractual date.

Like Variations, an EOT claim is live data with no per-month snapshot.
Open to any logged-in user to edit.

## Commissioning & Handover

Each project has a **Commissioning & Handover** checklist — one shared
`ChecklistItem` model with a `phase` discriminator (Commissioning or
Handover), the same discriminator pattern used by Risks/Opportunities and
Lessons Learned, since both phases track the same shape of item (a
Title, Description, Responsible party, Due Date, Status, and Notes) and
only which stage of project closeout they belong to differs. Milestones
already track high-level WBS-phase dates, but commissioning and handover
each involve many small, checkable steps (functional tests, O&M manual
handover, training, defects sign-off) that don't warrant their own
milestone rows — this checklist gives them a home.

Status is Not Started, In Progress, Complete, or Not Applicable,
changeable inline from the panel. `completedDate` stamps automatically
the moment status changes to Complete, and clears if it's moved back off
Complete — the same auto-stamp pattern used by Variations'
`dateDecided`, Actions' `dateClosed`, SQE's `dateClosed`, and EOT's
`dateDecided`. The panel header shows a running count per phase (e.g.
"Commissioning 2/5 complete · Handover 0/3 complete"), excluding
Not Applicable items from the denominator so they don't dilute the
completion picture.

Like Stakeholders, this register has no portfolio-wide view — a
project's commissioning checklist doesn't aggregate meaningfully across
the portfolio the way an open risk or an expiring permit does. Open to
any logged-in user to edit.

## Defects & Punch List

Each project has a **Defects & Punch List** register for physical work
that needs rectifying — distinct from an SQE record (which documents a
safety/quality/environment event) and from an Actions & Decisions entry
(a general open item): a defect names a specific piece of work, tracks
who it's assigned to for fixing (a contractor or subcontractor), and
optionally how much retention money is held against it until it's
verified fixed. Fields are Title, Location, Category (free text, with
suggestions like "Civil" or "Electrical"), Description, Assigned To,
Due Date, Status, Retention Held ($), and Notes.

Status runs the normal path OPEN → RECTIFIED (the contractor says it's
done) → VERIFIED (the PM has confirmed it), with a DISPUTED status for a
defect whose existence or cause is contested — common during a Defects
Liability Period. `dateClosed` stamps automatically the moment status
becomes VERIFIED, the same auto-stamp pattern used elsewhere in the app.
The panel sorts the most outstanding defects first (open and disputed
ahead of rectified-but-unverified, verified ones last) and its header
shows a running "N outstanding of total" count.

The Dashboard has a portfolio-wide **Open Defects** panel alongside
Needs Attention, Open Actions, Expiring Permits, and Open SQE Issues,
listing every non-verified defect across the portfolio with a link back
to its project. Open to any logged-in user to edit.

## Payment Claims

Each project has a **Payment Claims** register — the contract-
administration counterpart to Cash Flow's monthly forecast/actual
entries, which are the PM's own budget tracking rather than a formal
claim-and-certify record. A claim has a Claim Number, an optional
Period Ending date, a Claimed Amount (what the contractor asked for),
a Certified Amount (what the PM actually certifies — often less, so
it's a separate field rather than the claimed amount rewritten in
place), a Status, the date submitted, and Notes.

Status runs the normal path SUBMITTED → CERTIFIED → PAID, with a
DISPUTED status for a claim the PM contests. Certification and payment
are tracked as two independent auto-stamped dates rather than one:
`dateCertified` stamps the moment status first reaches CERTIFIED *or*
PAID (both imply certification happened, even if a claim is certified
and paid in the same step) and clears if moved back to
SUBMITTED/DISPUTED; `datePaid` stamps only on reaching PAID and clears
otherwise. The panel header shows the total certified to date and a
running "N outstanding" count (anything not yet PAID), sorted with
disputed and submitted claims first.

The Dashboard has a portfolio-wide **Payment Claims Outstanding** panel
alongside the other exception panels, listing every claim across the
portfolio still awaiting certification or payment with a link back to
its project. Open to any logged-in user to edit.

## Risks & Opportunities

Each project has a **Risks & Opportunities** register — one shared `Risk`
model with a `type` discriminator, since both track the same structure
(only the polarity of the underlying uncertainty differs). Each entry has
a Title, Type (Risk or Opportunity), Category (free text), Description,
an owner, an optional due date, and a status of Open, Mitigating, or
Closed, changeable inline from the panel (a status `<select>` per row) or
from the full edit form.

Likelihood and consequence are rated on a standard 5×5 matrix — Rare
through Almost Certain, Insignificant through Severe — captured twice:
an **Inherent** rating (before any mitigation) is required on every
entry, and an optional **Residual** rating (after mitigation) can be
added once a response is in place. `frontend/src/riskScoring.ts` maps
each rating to a 1-5 value, multiplies likelihood × consequence for a
score from 1 to 25, and bands it Low/Medium/High/Critical — this scoring
is computed client-side rather than persisted, so changing the band
thresholds doesn't require a migration. The panel sorts by inherent
score (highest first) and shows both score badges side by side when a
residual rating exists, so the effect of mitigation is visible at a
glance.

The Dashboard has its own portfolio-wide **Top Risks & Opportunities**
panel, listing the highest-scored open items across every project with a
link back to each one — matching the Risks panel's per-project register
without needing to open every project to see what needs attention.

Like Variations, a risk is live data with no per-month snapshot — its
current state and status history (via the Activity panel) are what
matter. Open to any logged-in user to edit, matching Tasks, Attachments,
Milestones, and Variations.

## Requests for Information

Each project has a **Requests for Information (RFIs)** register — a
formal question raised to a designer, consultant, or client that needs
an answer before work can proceed (a specification ambiguity, a missing
detail, a site condition needing direction). A request has an RFI
Number, Subject, Question, who it was raised to, a Status of Open/
Answered/Closed, the date raised, a Response, and Notes.

`dateRequired` — the date a response is due — is the contractually
meaningful deadline, distinct from `dateRaised`, the same role
`Task.dueDate` plays for tasks: only an Open RFI can be overdue or due
soon (`frontend/src/rfiMeta.ts`'s `isRfiOverdue`/`isRfiDueSoon`, mirroring
`taskMeta.ts`). `dateAnswered` stamps automatically the moment status
first reaches Answered or Closed (both imply a response exists, the same
dual-implication pattern Payment Claims' `dateCertified` uses) and clears
if moved back to Open. The panel sorts open and answered RFIs ahead of
closed ones and flags overdue items in red.

The Dashboard has a portfolio-wide **Open RFIs** panel listing every
non-closed RFI across every project, overdue ones first, then soonest
due — and the notification bell now folds in overdue/due-soon RFIs
alongside task deadlines and expiring permits/insurance, so a late
response shows up wherever a PM is already looking. Open to any
logged-in user to edit.

## Document Register

Each project has a **Document Register** — a controlled-document list for
drawings, specifications, reports, and other project documents subject to
revision control, distinct from **Attachments** (arbitrary uploaded files
with no revision or status lifecycle). A document has a Document Number,
Title, Category (Drawing, Specification, Report, Correspondence, As-Built —
with suggestions, freeform text), Revision, a Status of Draft/For Review/
Approved/Superseded, an Issue Date, a Description, and Notes.

The status models a standard document-control lifecycle: a document is
drafted, put out for review, approved for use (e.g. Issued For
Construction), and eventually superseded by a later revision — a new
revision is added as a new record rather than overwriting the old one, so
the register keeps a full revision history rather than deleting anything.
The panel sorts documents awaiting action (For Review, then Draft) ahead
of Approved (current, in-use) documents, with Superseded revisions sinking
to the bottom (`frontend/src/documentMeta.ts`'s `documentStatusRank`,
the same status-rank pattern every other register uses). Open to any
logged-in user to edit.

## Community Enquiries & Complaints

Each project has a **Community Enquiries & Complaints** register — a log
of public enquiries and complaints about construction activity (noise,
traffic, dust, site access), distinct from **Stakeholders** (a contacts
list) and **Requests for Information** (technical questions to a
designer/consultant/client, not the public). An enquiry has an optional
Reference, a Category (Noise/Traffic/Dust/Access/Other), how it was
received (Source), the complainant's contact details, a Description, the
Date Received, a Status of Open/In Progress/Resolved/Closed, who it's
Assigned To, a Resolution, and Notes.

`dateResolved` stamps automatically the moment status first reaches
Resolved or Closed (both imply the matter is dealt with) and clears if
moved back to Open or In Progress — the same dual-implication auto-stamp
pattern RFIs' `dateAnswered` and Payment Claims' `dateCertified` use. The
panel sorts open and in-progress enquiries ahead of resolved/closed ones
(`frontend/src/enquiryMeta.ts`'s `enquiryStatusRank`).

The Dashboard's Alerts tab has a portfolio-wide **Open Enquiries** panel
listing every non-resolved, non-closed enquiry across every project.
Open to any logged-in user to edit.

## Safety, Quality & Environment

Each project has an **SQE** register for logging safety, quality, and
environmental issues: a Category (Safety/Quality/Environment), a
Severity (Low/Medium/High/Critical), Title, Description, Corrective
Action, the date it occurred, and a status of Open/In Progress/Closed
(changeable inline, like Actions & Decisions).

Severity here is rated directly on a 4-band scale rather than through
Risk's likelihood × consequence matrix — an SQE record documents
something that already happened, so there's no "likelihood" left to
assess once it's occurred, only how severe it turned out to be.
`dateClosed` stamps automatically the moment status becomes Closed, the
same pattern Actions & Decisions and Variations use for their own
closing dates.

The dashboard's portfolio-wide **Open SQE Issues** panel lists every
open issue across every project, most severe first, linking back to its
project — sitting alongside Needs Attention, Open Actions, and Permits
Expiring Soon as a fourth view into what needs a PM's attention today.

Like the other registers, an SQE record is live data with no per-month
snapshot. Open to any logged-in user to edit.

## Actions & Decisions

Each project has an **Actions & Decisions** register — one shared
`ActionItem` model with a `type` discriminator, the same pattern as
Risk/Opportunity. It's deliberately separate from Tasks: a Task is a
general to-do, while an Action or Decision is raised in a specific
context (a design review, a site meeting) and tracked back to that
origin. Both share a Title, Category (free text), Description, an
owner, an optional due date, and a status of Open, In Progress, or Done,
changeable inline from the panel or the full edit form.

A **Decision** is, by nature, usually already resolved the moment it's
recorded — there's no work left to do, just a record of what was agreed
— so creating one defaults its status straight to Done rather than Open
the way a new Action does; both remain fully editable afterwards (a
decision can be revisited and reopened) since the type only changes the
starting point, not what's allowed. `dateClosed` stamps automatically
the moment status becomes Done, and clears if it moves off Done again —
the same pattern `dateDecided` uses on a Variation.

The Dashboard has its own portfolio-wide **Open Actions** panel, listing
every open Action/Decision across every project — the ones with a due
date first, soonest (or most overdue) at the top — each linking back to
its project. It sits beside the Needs Attention panel since both answer
the same question: what does a PM need to look at today, across the
whole portfolio, without opening every project one by one.

Like Risks and Variations, an action item is live data with no per-month
snapshot. Open to any logged-in user to edit, matching Tasks,
Attachments, Milestones, Variations, and Risks.

## Meeting Minutes

Each project has a **Meeting Minutes** register — a simple log of project
meetings (progress meetings, design reviews, site meetings), distinct
from **Actions & Decisions** (a single decision or action, not a full
meeting record). A meeting has a Meeting Date, Type (free text, with
suggestions like "Progress Meeting" or "Design Review"), Location,
Attendees (freeform), a Summary, an optional Next Meeting Date, and
Notes.

Like Site Visits, this is a plain log with no status workflow — nothing
to mark open or closed, just a record of what happened. The panel sorts
by meeting date, most recent first. Open to any logged-in user to edit.

## Correspondence

Each project has a **Correspondence Register** — a log of formal letters
and notices exchanged with consultants and contractors (a notice of
delay, a show-cause notice, a formal direction, a contractual notice),
distinct from **RFIs** (a technical question needing an answer to
proceed with works) and **Community Enquiries** (correspondence with the
public, not a project party). An entry has a Reference, a Direction of
Incoming/Outgoing, the Correspondent, a Subject, a Summary, the Date
Sent, an optional Response Due date, a Status of Open/Closed, and Notes.

`responseDueDate` is the contractually meaningful deadline, the same role
`Rfi.dateRequired` plays for RFIs: only an Open item can be overdue or
due soon (`frontend/src/correspondenceMeta.ts`'s
`isCorrespondenceOverdue`/`isCorrespondenceDueSoon`). `dateClosed` stamps
automatically the moment status reaches Closed and clears if moved back
to Open — a single-implication version of the dual-implication pattern
`Rfi.dateAnswered` uses, since Correspondence has only one closing status.
The panel sorts open correspondence ahead of closed and flags overdue
items in red.

The Dashboard has a portfolio-wide **Open Correspondence** panel listing
every non-closed entry across every project, overdue ones first, then
soonest due. Open to any logged-in user to edit.

## Stakeholders

Each project has a **Stakeholders** register — a simple contact
directory of the people and organizations with a stake in the project (a
landholder, a council contact, a community group): Name, Role,
Organization, Email, and Phone, with free-text Notes on expand. Unlike
every other register on this page, a stakeholder has no status or
lifecycle of its own — it's a directory entry, not something that moves
through states — so there's nothing to track a transition for beyond the
plain fact of an edit. No portfolio-wide view exists for this one;
stakeholders are inherently project-specific in a way that doesn't
aggregate meaningfully across the portfolio the way an open risk or an
expiring permit does. Open to any logged-in user to edit.

## Permits & Approvals

Each project has a **Permits & Approvals** register for tracking
environmental, planning, and regulatory approvals: Title, Category (free
text, with suggestions like "Environmental" or "Cultural Heritage"),
Reference Number, Issuing Authority, a Status of Pending/Approved/
Rejected (changeable inline), Date Applied, Date Approved, an Expiry
Date, and Notes.

Whether an approved permit is **Expiring Soon** (within 60 days) or
**Expired** is computed from its expiry date against the current time,
the same way a project's overdue state is computed rather than stored —
`frontend/src/permitMeta.ts` — so it can never drift stale the way a
manually-set "expired" status would the moment nobody's looking. Only an
Approved permit can meaningfully expire; a Pending or Rejected one was
never in force. The dashboard's portfolio-wide **Permits Expiring Soon**
panel lists every flagged permit across every project, soonest first,
linking back to its project — sitting alongside Needs Attention and Open
Actions as a third view into what needs a PM's attention today. Open to
any logged-in user to edit.

## Subcontractors

Each project has a **Subcontractors** register — the trade contractors
engaged on the project, distinct from `Project.contractor` (a single
freeform field naming just the head contractor). A subcontractor has a
Company Name, Trade (free text, with suggestions like "Electrical" or
"Concreting"), contact details, an optional Contract Value, Start/End
Dates, a Status of Engaged/Active/Completed/Terminated (changeable
inline), an Insurance Expiry date, and Notes.

Whether a subcontractor's insurance is **Expiring Soon** (within 60 days)
or **Expired** is computed from that date against the current time rather
than stored — the same computed-not-stored pattern Permits' expiry state
uses (`frontend/src/subcontractorMeta.ts`). Only an Engaged or Active
subcontractor's insurance still matters; a Completed or Terminated one is
no longer on site. The panel sorts currently-on-site subcontractors first
(Active, then Engaged but not yet started), with Completed/Terminated
sinking to the bottom. The Dashboard's Alerts tab has a portfolio-wide
**Subcontractor Insurance Expiring Soon** panel listing every flagged
subcontractor across every project, soonest first. Open to any logged-in
user to edit.

## Performance Reviews

Each project has a **Performance Reviews** register — periodic scorecards
for the consultants and contractors engaged on the project, distinct from
**Subcontractors** (a static engagement record with no ongoing
assessment) and **Safety, Quality & Environment** (a one-off incident,
not a scheduled review). A review has the Consultant/Contractor being
reviewed (freeform, matching the same pattern as `Subcontractor
.companyName` and `Project.contractor` rather than a foreign key, since a
review may cover the head contractor, a named subcontractor, or a design
consultant), an optional Review Period label (e.g. "Q3 2026"), a Review
Date, four 1-5 ratings — Quality, Safety, Timeliness, Communication — and
Comments.

The overall score is computed client-side as the average of the four
ratings and is never stored, the same computed-not-stored pattern Risk's
likelihood x consequence score uses (`frontend/src/performanceMeta.ts`).
A score below 2.5 is banded "Needs Improvement" and flags the review on
the Dashboard's portfolio-wide **Low Performing Contractors** panel,
worst-scoring first; "Satisfactory" (2.5-3.5), "Good" (3.5-4.5), and
"Excellent" (4.5+) round out the bands. The project panel sorts
lowest-scoring reviews first. Open to any logged-in user to edit.

## Insurance & Warranties

Each project has an **Insurance & Warranties** register — one shared
`InsuranceWarranty` model with a `type` discriminator (Insurance or
Warranty), the same discriminator pattern used elsewhere (Risk/
Opportunity, Lesson Learned, ChecklistItem), since both track the same
shape: who provides the cover, a reference number, what's covered, and
when it lapses. Fields are Title, Type, Provider (the insurer, or the
manufacturer/contractor for a warranty), Reference Number, Coverage
Details (free text — what's covered and for how much), Start Date,
Expiry Date, and Notes.

Unlike Permits & Approvals there's no application workflow — a policy
or warranty is in force from the moment it's entered — so there's no
status field. Whether an item is **Expiring Soon** (within 60 days) or
**Expired** is computed from its expiry date against the current time,
the same reasoning as `permitMeta.ts`'s expiry logic but without the
Approved-status gate (`frontend/src/insuranceWarrantyMeta.ts`). The
dashboard's portfolio-wide **Insurance & Warranties Expiring Soon**
panel lists every flagged item across every project, soonest first,
linking back to its project — alongside the other exception panels.
Open to any logged-in user to edit.

## Lessons Learned

Each project has a **Lessons Learned** register — one shared
`LessonLearned` model with a `type` discriminator (what went well vs.
what to improve), the same Risk/Opportunity-style pattern used
elsewhere. Each entry has a Title, Category, a description of what
happened, and a Recommendation for future projects.

Unlike the other registers, a lesson's value is less about tracking it
to closure and more about it being **findable later** — by a PM starting
a new pump station project, say, wanting to know what past pump station
projects learned. The dashboard header has its own **Lessons Learned**
page (`/lessons-learned`), separate from the per-project panel, listing
every lesson across the whole portfolio with type and category filters
plus a text search, each linking back to its project (and that project's
asset type, for exactly that "what have we learned about this kind of
asset" use case). Open to any logged-in user to edit.

## Project Health

Every project gets a live **Health** rating — Green/Amber/Red — computed
from data that's already there, rather than typed in by hand. This is
distinct from a Monthly Report's `budgetHealth`/`scheduleHealth`, which
are a PM's own judgement call as of that report's month: Project Health
recalculates on every page load from whatever the project's schedule,
cash flow, and risk register currently say, so a project that's drifted
off track shows up immediately rather than waiting for the next report.

`frontend/src/health.ts` rates three dimensions independently, then takes
the worst of the three as the overall rating:

- **Schedule** — Red if the project is past its *revised* completion
  date (Target Completion plus any approved EOT claims' granted days —
  see Extension of Time Claims above) and it isn't Defects
  Liability/Complete/Cancelled; Amber if that revised date is within the
  next 30 days; Green otherwise. This is deliberately different from the
  dashboard's "Overdue" stat and the project table, which always reflect
  the literal contractual date rather than the revised one
- **Budget** — Red if the Forecast Total (from Cash Flow) exceeds the
  project's current budget (revised by any approved Variations); Amber
  once it passes 90% of that budget; Green otherwise, and Green when
  there's no cash flow data yet rather than guessing
- **Risk** — Red if any open Risk (not an Opportunity, not Closed) has a
  Critical inherent score; Amber for High; Green otherwise

The dashboard's **Needs Attention** panel lists every project rated
Amber or Red portfolio-wide, naming which dimension(s) triggered it and
linking straight to the project — the exception-surfacing view of what a
PM should look at today, rather than a database they have to go dig
through. The same rating shows as a compact badge in the dashboard's
project table (hover for the per-dimension breakdown) and as the full
Schedule/Budget/Risk breakdown in each project's own header.

## Cash Flow

Each project has a **Cash Flow** panel — the source report's monthly
actual/forecast breakdown. Every entry is one project, one month, one
type (Actual or Forecast) and an amount; adding an entry for a month that
already has one of that type overwrites it rather than erroring, so
correcting a figure is just re-entering it.

Above the entry list, a stat row shows Approved Budget and Included
Contingency (from the project's own fields) alongside three figures
computed live from the entries, matching the "(formula)" cells in the
source report:

- **Expenditure to Date** — the sum of all Actual entries
- **Forecast Total** — Expenditure to Date plus the sum of all Forecast
  entries
- **Variance** — the project's current budget (Approved Budget, revised
  by any Approved variations — see Variations above) minus Forecast
  Total, shown in red if the project is forecast to run over

When at least one variation has been approved, two extra stats appear —
**Approved Variations** (their total cost impact) and **Revised Budget**
— so the original figure and its revision are both visible side by side
rather than the original quietly being replaced.

Like Milestones, this is live data rather than a per-month snapshot — an
Actual figure doesn't need re-editing once entered, and a Forecast is
expected to be revised as the project progresses. Open to any logged-in
user to edit, matching Tasks, Attachments, and Milestones.

## Formatted Report View

Clicking **View** on a monthly report opens it as its own page at
`/projects/:id/reports/:reportId`, laid out like the source document —
Project Information, Current Status, Cash Flows, and Schedule / Major
Milestones as the same four blue-headed sections, with a "Print / Save as
PDF" button. There's no server-side PDF generation (no headless-browser
dependency to run in Docker); it uses the browser's own print dialog,
which on every modern browser includes a "Save as PDF" destination, so a
board-ready PDF is one click and one native dialog away.

The Project Information and Current Status sections come straight from
that report's locked snapshot, so they show the record as it was for that
month. The Cash Flows and Schedule / Major Milestones sections, though,
pull from the **live** Milestones and Cash Flow data described above —
opening an old report shows those exactly as they stand today, not as
they stood in that reporting month. That's the tradeoff of keeping
milestones and cash flow live rather than re-snapshotting them every
month (see those sections above); it matches what the real report is
generally used for (the current state of schedule and spend), and it's
the only way this view can exist without also snapshotting those tables
monthly, which no one asked for.

## Project Closeout Report

Every project detail page has a **Closeout Report** button in its header,
opening a printable summary at `/projects/:id/closeout-report` — the
counterpart to the Monthly Report view above, but a single point-in-time
rollup of a project's *final* outcomes rather than one month's status.
It pulls together, into the same blue-headed section layout with a
"Print / Save as PDF" button:

- **Final Budget Outcome** — original approved budget, approved variations
  total, the resulting final budget (via the same `revisedBudget()` helper
  the Variations panel uses), final expenditure (the sum of `ACTUAL` cash
  flow entries), the variance between them, contract value, and the full
  variations table.
- **Final Schedule Outcome** — original target completion, approved EOT
  days, the resulting revised completion date (via `revisedCompletionDate()`),
  actual completion date, overall milestone completion, and the full EOT
  claims table.
- **Commissioning & Handover** — checklist completion percentage and a list
  of any items not yet Complete or Not Applicable.
- **Defects & Punch List** — a list of any defects still Open or Disputed.
- **Outstanding RFIs** — a list of any RFIs not yet Closed.
- **Lessons Learned** — the project's full list, with description and
  recommendation for each.

Like the Monthly Report view, this reads **live** data — milestones,
variations, EOT claims, checklist items, defects, RFIs, and lessons
learned as they stand today — rather than a locked snapshot, since a
closeout report is generated once, at (or after) project completion, not
monthly. The shared print-page chrome (`ReportSection`, `ReportField`,
`NarrativeBlock`, `HealthRow`) was factored out of the Monthly Report view
into `components/ReportPrimitives.tsx` so both report pages share the same
layout building blocks.

## Dark Mode

A sun/moon toggle — in the header next to the notification bell on every
app page, and top-right on the login page — switches the whole app between
light and dark. It's built on Tailwind's class-based dark mode
(`darkMode: "class"`): a `ThemeContext` toggles a `dark` class on `<html>`
and persists the choice to `localStorage`, defaulting to the OS's
`prefers-color-scheme` on first visit. Every page, panel, table, and modal
carries `dark:` variants, and the hand-rolled charts read their colors from
theme-aware tokens in `frontend/src/charts/palette.ts` (light/dark pairs
for grid lines, axis text, and the Actual/Forecast categorical pair —
re-validated for the dark chart surface with the same `dataviz` palette
checker used for light mode).

The **Formatted Report View** (`/projects/:id/reports/:reportId`) is the
one page that deliberately ignores the toggle and always renders light —
it's a print/document view meant to look the same on paper regardless of
which theme you're browsing in, so it carries no `dark:` classes at all.

## Site Visits

Each project has a **Site Visits** panel — a mobile-friendly field log for
the visits a project manager makes to site, since that's typically entered
from a phone standing in the field rather than at a desk. A visit records
Date, Time, Location (free text, with a **📍 Use current** button that
fills it from the browser's Geolocation API as `lat, lng`), Notes (what was
observed), and Discussion Notes (points raised or agreed with the
contractor/site team). Entries render as a stack of full-width cards rather
than the app's usual table layout — tables don't fit a narrow screen, and a
project typically has far fewer site visits than tasks or activity-log
entries, so a card per visit costs little vertical space. Each card expands
in place to show its Notes/Discussion Notes, matching the Monthly Reports
panel's expand-on-tap pattern. Like Milestones and Cash Flow entries, a
site visit is live, editable data with no month-based snapshotting — each
visit is already its own point-in-time record by nature.

Building this surfaced a pre-existing mobile layout bug: the page header's
Edit/Delete/theme-toggle/notification-bell/account-menu button row, and the
Tasks panel's "Add a task" row, didn't wrap on a narrow screen — native
`<input type="date">`/`<input type="time">` controls have a minimum
intrinsic width that doesn't shrink, so at phone width the row overflowed
sideways and forced the entire page's layout viewport wider than the
device, breaking pinch-zoom-to-fit for the whole page (not just those
rows). Fixed by allowing those rows to wrap (`flex-wrap`) across the
Dashboard, Project Detail, Reports, and Admin Users headers, and giving the
Site Visit form's own Date/Time fields a single column on narrow screens
(`grid-cols-1 sm:grid-cols-2`) rather than forcing them side by side.

### Site Photos

Each site visit card has a **Photos** section with two upload paths: **📷
Take Photo** (`<input type="file" accept="image/*" capture="environment">`,
which opens the device's camera directly on a phone) and **🖼 Add from
Gallery** (a plain multi-select file picker). Uploaded photos appear as a
thumbnail grid, click-through to the full image.

GPS coordinates and the capture time are read server-side from each
photo's own EXIF tags at upload time (`backend/src/exif.ts`, via the
`exifr` package) — never trusted from the client, the same way file type
is validated server-side for every other upload in this app. A photo
without a GPS tag (location services were off, or it came from a gallery
rather than the camera) still uploads and shows in the thumbnail grid,
just tagged "no GPS" and left off the map.

Above the site visit list, a **Site Photos** section shows every photo
across the project's site visits (not just the one being edited), with a
**Gallery / Map** toggle between two views of the same photo set
(`SitePhotosGallery.tsx` / `SitePhotosMap.tsx`, switched by local state in
`SiteVisitsPanel.tsx` — Gallery is the default, since it works with or
without GPS data):

- **Gallery** is a responsive grid of larger thumbnails, most recent
  first, each flagged with a 📍 badge if geotagged. Clicking one opens a
  full-size lightbox with Previous/Next navigation (buttons, on-screen
  arrows, or the ← → and Esc keys), a caption showing the visit's
  location and date, file size, uploader, and GPS coordinates if present,
  and a Delete action — so browsing and deleting photos no longer
  requires opening each site visit's own small thumbnail row.
- **Map** plots every geotagged photo across the project's site visits,
  with a pin per photo — clicking one opens a popup with that photo's
  thumbnail, the visit's location, and its date. This is the one
  component in the app that reaches for a mapping library: unlike the
  hand-rolled SVG/HTML charts everywhere else, real map tiles can't be
  drawn by hand, so it uses **Leaflet** with **OpenStreetMap** tiles (no
  API key required). The marker is a small inline-SVG pin via a Leaflet
  `divIcon` rather than Leaflet's bundled marker images, which sidesteps
  a well-known bundler issue where `Icon.Default`'s image paths resolve
  relative to the `leaflet` package rather than the built app and 404 in
  production.

Each site visit's own expanded card still has its small **Photos** grid
for uploading (📷 Take Photo / 🖼 Add from Gallery) and quick deletion
scoped to that visit — the project-wide Gallery/Map views are for
browsing and don't change how photos are added.

## Training & Induction Records

Each project has a **Training & Induction Records** register — site
inductions and competency certifications held by people working for a
consultant or contractor on the project (a site induction, a White Card,
Working at Heights, Confined Space, First Aid), distinct from
**Subcontractor** (a company-level engagement record) and the
**Safety, Quality & Environment** register (a one-off incident, not an
ongoing qualification). A record has a Person Name, Company, Training Type
(freeform, with suggestions), a Completion Date, an optional Expiry Date, a
Certificate Number, and Notes.

`expiryDate` is optional since some records — a one-off site induction, say
— never expire; when present it follows the same computed-not-stored
expiry pattern as Insurance & Warranties: no status field, just the date
compared against "now" (`frontend/src/trainingMeta.ts`'s
`isTrainingExpired`/`isTrainingExpiringSoon`). The panel sorts expired
records first, then expiring soon, then everything else.

The Dashboard has a portfolio-wide **Training Expiring Soon** panel
listing every expired or soon-to-expire record across every project,
soonest first. Open to any logged-in user to edit.

## Toolbox Talks

Each project has a **Toolbox Talks** log — routine on-site safety
briefings (a pre-start talk on manual handling, working at heights,
traffic management), distinct from **Meeting Minutes** (a project,
design, or progress meeting with the project team) and the
**Safety, Quality & Environment** register (a one-off incident, not a
routine briefing). A talk has a Date, Topic (freeform, with
suggestions), who Conducted it, Attendees (freeform), Key Points, and
Notes.

Like Meeting Minutes and Site Visits, this is a plain log with no status
workflow and no portfolio-wide Dashboard panel — it's too
project-specific to aggregate. The panel sorts by talk date, most recent
first. Open to any logged-in user to edit.

## Environmental Monitoring

Each project has an **Environmental Monitoring** register — routine
compliance readings (noise, dust, turbidity, vibration, groundwater
level) taken against a licence or approval condition limit, distinct
from the **Safety, Quality & Environment** register (a one-off incident,
not a scheduled quantitative sample). A reading has a Parameter
(freeform, with suggestions), Location, Monitoring Date, a Reading value
and Unit, an optional Limit value and Limit Type (must-not-exceed or
must-not-fall-below), Corrective Action, and Notes.

`limitValue` is optional — some readings are recorded for information
only, with no licence condition attached. When present, whether a
reading is an **exceedance** is computed from the reading against the
limit and limit type rather than stored, the same computed-not-stored
pattern as the expiry checks (`frontend/src/environmentalMeta.ts`'s
`isExceedance`). The panel sorts exceedances first, then most recent.

The Dashboard has a portfolio-wide **Environmental Exceedances** panel
listing every exceedance across every project, most recent first. Open
to any logged-in user to edit.

## Site Safety Inspections

Each project has a **Site Safety Inspections** register — scheduled or
ad-hoc compliance walks and audits of site conditions and contractor
practices, distinct from the **Safety, Quality & Environment** register
(a one-off incident that already happened, not a proactive assessment)
and **Toolbox Talks** (a briefing delivered to workers, not an
inspection of the site). An inspection has an Inspection Type (freeform,
with suggestions), Date, who Conducted it, Location, an optional
compliance Score (0-100), Findings, Corrective Action, and a status of
Open/In Progress/Closed for tracking any corrective action through to
completion.

`dateClosed` stamps automatically the moment status becomes Closed, the
same pattern the SQE register uses for its own closing date. The panel
sorts open/in-progress inspections first, then lowest score first within
each group.

The Dashboard has a portfolio-wide **Open Safety Inspections** panel
listing every open or in-progress inspection across every project,
lowest score first, linking back to its project. Open to any logged-in
user to edit.

## Tabbed Navigation

Both the Dashboard and a project's detail page had grown into one long
scroll as registers accumulated (the project page alone stacks ~20 panels).
Both now split their content into a horizontal tab bar
(`components/Tabs.tsx`, a generic underline tab bar reused by both pages)
so a screen only ever shows one section at a time:

- **Dashboard** — Projects (the filterable/searchable project table),
  Alerts (the eight portfolio-wide "needs attention" panels), Charts
  (spend-vs-budget and projects-by-status), Activity (upcoming deadlines,
  top risks, recent activity feed). The header and the four stat cards
  stay above the tabs, visible on every tab.
- **Project detail page** — Overview (Stakeholders, Actions & Decisions,
  Activity), Schedule (Milestones, Tasks, EOT Claims, Commissioning &
  Handover), Budget & Contract (Cash Flow, Variations, Payment Claims,
  Insurance & Warranties, Permits & Approvals), Quality & Risk (Risks &
  Opportunities, SQE, Defects & Punch List, RFIs, Document Register), Site
  & Records (Site Visits, Attachments, Monthly Reports, Lessons Learned).
  The header, description, and project info field grid stay above the
  tabs, visible on every tab.

Tab state is local to each page (`useState`, defaulting to the first tab)
rather than reflected in the URL — switching projects or navigating away
and back always starts from the default tab. Every panel that was already
on these pages is still there; this only changed which section of the
page shows it.

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
