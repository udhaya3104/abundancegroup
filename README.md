# Nucleus — Zero Rent CRM

An interactive CRM prototype for a coworking workspace business, with a light dashboard and a simulated customer qualification journey.

## Run locally

Requires Node.js 22.13 or newer and pnpm.

```sh
pnpm install
pnpm run dev
```

Open the local address printed by the development server (normally http://127.0.0.1:5173).

```sh
pnpm run build
```

## Demo modules

- Overview with pipeline metrics and priority leads
- Lead profiles with sample AI intent scores
- WhatsApp conversation preview
- Ad enquiry → welcome → requirement collection → sales assignment simulation
- Campaign and bulk messaging overview
- Proposals, quotations, invoices and rental agreement overview
- Billing and accounts dashboard
- Integration cards and automation settings

## Prototype scope

All records and messages are fictional demo data. AI scores, lead capture, WhatsApp delivery, integration connection statuses, financial figures and document actions are simulated. Live provider connections, authentication, persistent records, actual document generation and messaging require backend implementation and provider credentials. Some controls illustrate planned workflows.

## Project

Built with React, TypeScript and Vinext/Vite. Main UI lives in `app/page.tsx`; shared layout styles are in `app/globals.css`, with the light palette and readability refinements in `app/light-theme.css`.

Generated output, dependencies, local runtime state and environment files are excluded from Git.
