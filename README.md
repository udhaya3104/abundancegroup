# Abundance Group — Workspace CRM

A light-mode CRM for demonstrating the complete zero-base-rental coworking sales journey. Demo records are fictional; changes persist in the current browser using localStorage.

## Run locally

Requires Node.js 22.13+ and pnpm.

```sh
pnpm install
pnpm run dev
```

Open the address printed by the server, normally http://127.0.0.1:5173.

```sh
pnpm test
pnpm run build
pnpm exec tsc --noEmit --incremental false
```

## Working local features

- Overview metrics computed from saved leads, activities, tasks and payments.
- Lead creation/editing, duplicate-phone checks, search, business/source/stage filters, scoring, sales assignment, pipeline stage changes, notes, archive/restore and CSV export.
- Lead-specific conversations, saved messages, welcome/follow-up templates, suggested replies, customer-reply simulation, unread/closed inbox filters and small image/text attachments.
- Bulk campaigns with audience segmentation, opt-in checks, personalised previews, drafts, scheduling, local dispatch history, cancellation and CSV export. Scheduled campaigns run only when **Run due campaigns** is selected; this is not a background service.
- Editable proposals, quotations, invoices and sample agreements, issued-document customer/business snapshots, status changes, duplication, printable previews, HTML downloads and browser print/save-as-PDF.
- Partial/full payment records, invoice balances, receipt exports, expense editing, dated cash-flow views and accounts CSV exports.
- Demo integration configuration and test enquiries/messages for WhatsApp, Meta, Google, LinkedIn, Justdial, email and local qualification.
- Business/tax/deposit settings, automation switches, message templates, routing team roles, validated JSON backup import/export and notifications.
- Customer-journey simulation that creates linked leads, messages, visits, quotations, agreements and invoices in the same CRM.

## Demo versus production

The CRM is operational **locally**, not connected to live providers. WhatsApp/email/SMS delivery, ad webhooks, OAuth, GPT calls and agreement signatures are explicitly simulated. Scoring uses local rules, not GPT. No API secrets are requested or stored in the browser.

Production requires a server/database, authentication and permission enforcement, secure provider credentials, webhook validation, background jobs, real messaging delivery and e-signature integration. Team roles here control routing choices, not security permissions. Sample taxes and agreement terms are editable demonstration values, not verified commercial/legal terms.

Browser storage is device/profile-specific and limited. Export backups regularly; clearing site data removes local records. Attachments are limited to 200 KB and backup imports to 4 MB. Existing data is retained if validation or saving fails.

Exports also display copyable file contents and a direct Save file link as a fallback for embedded browsers that do not handle automatic downloads.

## Implementation

`components/crm/crm-app.tsx` contains the operational UI. `lib/crm-model.ts` holds typed data, validation and shared business rules; `tests/crm-model.test.mjs` covers financial calculations, campaign segmentation, opt-ins, scoring and backup safety. `app/crm.css` and `app/light-theme.css` provide the light visual system.

Dependencies, generated builds, browser data, runtime state and environment files are excluded from Git.
