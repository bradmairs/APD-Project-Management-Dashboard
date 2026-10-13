# Changelog

Versioning: releases are numbered `X.YY`. A small change or fix bumps the last
digit (1.0 -> 1.01); a larger or more significant update bumps the tenth
(1.01 -> 1.1). `package.json` uses the matching semver (1.01 = 1.0.1,
1.1 = 1.1.0). The current version is in `VERSION`.

## 1.22 - 2026-10-13

- Cash flow entries can now be **changed between forecast and actual**: a one-click "Mark as actual" on forecast rows (pre-fills the amount so you can enter the real spend), and the Edit dialog now lets you change the Type. If the month already has an entry of the new type it is replaced; the change is logged and can be undone. New `PUT /api/cashflow/:id`
- The app version is shown on the dashboard header (next to "Water Authority")

## 1.21 - 2026-10-13

- Admins can **permanently delete** a user from Manage Users (with confirmation). Their records stay and keep their name; their access ends immediately. Admins can't delete themselves

## 1.2 - 2026-10-13

- **Two-factor authentication (TOTP)**: any user can turn on a 6-digit authenticator-app code at sign-in (user menu -> Two-Factor Auth), with QR enrolment, 10 one-time recovery codes, and password + code to turn it off; admins can reset a locked-out user from Manage Users. Opt-in per account; includes a migration adding four columns to `User`
- `AUTH_COOKIE_NAME` env var (optional) so two instances on one host can keep separate logins

## 1.1 - 2026-10-12

- New **Delays** register on every project's Schedule tab: log delay events (cause, responsible party, dates, days lost, critical path, mitigation, related EOT reference), mark them Ongoing/Resolved, with CSV export, search and activity log

## 1.01 - 2026-10-11

- Docker Compose now uses bind mounts under `./data/` (databases and uploads) instead of named volumes, so all data sits next to `docker-compose.yml`

## 1.0 - 2026-10-11

First numbered release. Includes everything built to date: the project,
register, dashboard and health features, plus the latest batch:

- GitHub Actions CI and Vitest unit tests (budget maths, health, risk scoring, task dates, CSV, search ranking)
- Ranked global search across all registers
- Export CSV on every register
- Inline due-date editing for Tasks and Actions on the dashboard; clickable stat cards
- Contract Value removed from the project form; dashboard budget card shows total approved budget
- Excel edition of the tracker (`excel-tracker/`) as a reference alternative
