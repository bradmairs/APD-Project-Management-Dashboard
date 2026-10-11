# APD Project Tracker (Excel edition)

A spreadsheet version of the APD Project Management Dashboard that keeps all data in one
`.xlsx` file you store in your company's OneDrive / SharePoint. No server, database or login to host.

| File | What it is |
|---|---|
| `APD_Project_Tracker.xlsx` | Working copy with one example record per sheet (project "Pump Station Refurbishment (example)") so you can see the expected format. Delete the example rows before real use. |
| `APD_Project_Tracker_BLANK.xlsx` | Same workbook, empty. |
| `vba/` | Optional macros (search, activity log, recurring tasks, PDF export, backup, email digest). See below. |
| `build_workbook.py` | Generator for both workbooks (`python3 build_workbook.py out/`). Needs `openpyxl`. Change a register's columns or lists here and rebuild. |

## What carries over from the web tool

| Web tool feature | In the workbook |
|---|---|
| Projects with status, budgets, dates | `Projects` sheet |
| Project Health (schedule / budget / risk RAG, overall) | Formulas on `Projects`, same 95% / 115% rules, EOT-revised dates, effective budget, Actual-supersedes-Forecast |
| Dashboard stat cards, portfolio table, alerts, Today & Upcoming, top risks | `Dashboard` |
| Tasks (recurring), Actions & Decisions | `Tasks`, `Actions` (recurrence needs the macro) |
| Risks (5x5 scoring), RFIs, Defects, Variations, EOT, Cash Flow, Milestones, Payment Claims, Contracts, Subcontractors, Permits, Insurance & Warranties, Stakeholders, Meeting Minutes, Correspondence, Documents, SQE, Safety Inspections, Environmental Monitoring, Site Visits, Training, Toolbox Talks, Lessons Learned, Enquiries, Tenders, Performance Reviews, Commissioning/Handover checklist | One sheet each, with dropdowns, date/number checks, computed flags (overdue, expiring, exceedance, scores) |
| Spend vs budget S-curve, projects by status, risk bands | `Charts` |
| Monthly report / closeout style one-pager | `Project Summary` (pick a project; print or use the PDF macro) |
| Timeline / Gantt | `Gantt` (selected project's milestones) |
| Global search | `Search` sheet + macro (or Ctrl+F, Within: Workbook) |
| Activity history | `Activity Log` (macro) |
| CSV export / import | Excel's own Save As CSV and copy-paste |
| Saved views, bulk edit | Excel filters, Custom Views, multi-cell paste |

## Not reproducible in a spreadsheet

Per-user logins, roles and per-project permissions (use the OneDrive/SharePoint sharing settings instead),
file attachments and site-photo upload with GPS map (link to SharePoint folders instead), scheduled
background emails (use a Power Automate flow), and the local AI features (excluded as requested).

## Installing the macros (optional)

The workbook works without macros; they add search, the activity log, recurring tasks, and the PDF / backup /
email helpers. They could not be embedded in the generated file, so import them once:

1. Open `APD_Project_Tracker.xlsx` in **Excel desktop**, then **File > Save As > Excel Macro-Enabled Workbook (.xlsm)**.
2. Press **Alt+F11**. For each of `modSearch.bas`, `modReports.bas`, `modDigest.bas`: **File > Import File...**
3. In the Project pane, double-click **ThisWorkbook** and paste the contents of `vba/ThisWorkbook.txt`.
4. Double-click the **Search** sheet object and paste `vba/SheetSearch.txt`.
5. Save. Run macros from **Alt+F8**: `RunSearch`, `ExportProjectSummaryPDF`, `BackupWorkbook`, `DraftDigestEmail`, `ShowAllRows`. **Ctrl+Shift+F** jumps to Search.

These macros have **not been run in Excel** (the build environment has no Excel); test on a copy first.
Macros run only in Excel desktop, not Excel for the web. Many organisations block macros in files
downloaded or stored on SharePoint; ask IT to allow the file, add its folder as a Trusted Location, or sign the macros.

## Storing it in the company tenant

Save the file in an IT-approved OneDrive for Business or SharePoint library, then control access with the
library's sharing settings (Edit for the team, View for stakeholders). Version History gives restore points.
Several people can co-author the same file; avoid sorting a register while others edit it.
Row capacity is fixed (Projects 100, Tasks 1,000, Cash Flow 2,000, others 500); extend by copying the last row down.

## Better options to consider

Excel is the quickest way to get going, but a spreadsheet has no real permissions, no audit trail you can
trust (anyone can edit the log), and is fragile at scale. In rough order of preference:

1. **Host this web app on company infrastructure.** The security concern is where the data lives, not the
   software. Ask IT to run the existing Docker app on an approved server or Azure subscription with the
   company's Entra ID sign-in and backups. You keep every feature, including per-user access and the audit log.
2. **Microsoft Lists / SharePoint lists + Power Apps (+ Power BI)** if your tenant licenses them. Native to
   Microsoft 365, governed by IT, real permissions, and Power Automate gives scheduled emails.
3. **Planner / Project for the web** if you mainly need task and schedule tracking rather than budgets and registers.
4. This Excel workbook, as a stop-gap or for small teams.
