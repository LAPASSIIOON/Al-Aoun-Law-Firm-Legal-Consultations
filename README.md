# AL OUN — Digital Legal Platform

## Overview

A bilingual digital platform for **AL OUN Law Firm & Legal Consultations** (مجموعة العون للمحاماة والاستشارات القانونية), a Kuwaiti law firm and legal consultancy.

**Arabic is the primary language; English is secondary.** Arabic is the primary market language, not a translation layer — RTL is a first-class design constraint throughout.

The platform is not a brochure site. It combines:

- an **institutional law-firm website**
- **expertise discovery** across the firm's practice areas
- **structured legal intake** with attribution and conflict-check awareness
- **international coordination** journeys
- **member and admin layers** for operations

It is a conventional web application. It does not use AI for legal advice, diagnosis, or automated analysis.

## Current Product Scope

| Area | State |
| --- | --- |
| Practice areas | 48 active areas, stored in the database with per-locale translations |
| Professionals | 2 professionals, currently stored in code (see Architecture) |
| International | Three distinct journeys: inbound Kuwait counsel · outbound matters abroad · professional cooperation |
| Insights | Infrastructure complete (tables, admin editor, legal-approval gating). **Zero articles currently exist**, and the homepage section is deliberately hidden while empty |
| Consultation intake | Two-step form with intent and source attribution, server-side validation, rate limiting, and bot protection |
| Member portal | Sign-in/up, password reset, requests and matters with file access |
| Admin operations | Consultations, referrals, partnership applications, practice areas, insights, members, partner firms, matters, audit log |

Two facts worth stating plainly rather than hiding:

- **Zero insights articles exist.** The system is built; the content is not yet written and approved.
- **Zero approved partner firms exist.** The partner tables are intentionally empty until a real partnership is verified and approved. The platform describes international **coordination** — it does not claim foreign offices or licensed foreign practice.

## Tech Stack

Exact versions from `package.json`:

| Dependency | Version |
| --- | --- |
| `next` | 15.5.23 |
| `react` / `react-dom` | 19.1.0 |
| `next-intl` | 4.13.6 |
| `@supabase/supabase-js` | 2.112.3 |
| `@supabase/ssr` | ^0.12.4 |
| `@fontsource/ibm-plex-sans-arabic` | 5.3.0 |
| `@fontsource/noto-naskh-arabic` | ^5.3.0 |
| `@fontsource/noto-serif` | ^5.3.0 |
| `@fontsource-variable/archivo` | ^5.3.0 |

Also in use: **Supabase** (Postgres, Auth), **Cloudflare Turnstile** (bot protection on intake forms), and **Vercel** (deployment).

Ten production dependencies total, four of which are self-hosted font packages. Dependency additions require justification.

## Architecture

- **Next.js App Router.** All public routes live under `src/app/[locale]/` and are locale-prefixed (`/ar/…`, `/en/…`).
- **Localization** via `next-intl`, with message catalogs in `messages/ar.json` and `messages/en.json`. Styling uses CSS logical properties — there is no separate RTL stylesheet.
- **Supabase schema separation**, established from the start so growth is additive rather than structural:
  - `public` — content (practice areas, articles, FAQs, matters, profiles)
  - `ops` — intake requests, audit log, rate limits
  - `network` — international entities (countries, jurisdictions, partner firms, referrals)
  - `portal` — client-portal data
- **RLS-first.** Row Level Security is enabled on every table across all four schemas.
- **Practice-area translations live in the database** — separate rows per locale, each with its own slug, status, and legal-approval flag. Public queries filter on both.
- **Professionals are currently stored in code** (`src/lib/team-data.js`) rather than the database. This is deliberate at a team size of two; a database migration is not justified until the team grows meaningfully.
- **Intake RPCs** are `SECURITY DEFINER` with pinned `search_path`, performing their own server-side validation.

## Repository Governance

**Contributors and AI agents must read these before making changes:**

- **`AI-HANDOFF.md`** — current verified project state, architecture, roadmap, and open work
- **`AI-WORKFLOW.md`** — permanent operating rules and safety requirements
- **`AI-SYNC-BRIEF.md`** — full project context and history, including past corrections

**`origin/main` is the source of truth for application code.** Local working copies are not authoritative. Database schema and functions are verified against the live Supabase project, not assumed from files.

## Development

```bash
npm install
npm run dev      # development server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # lint
```

Supabase environment variables are required for data-driven pages to render.

## Safety / Contribution Rules

Summarized here; **`AI-WORKFLOW.md` holds the full rules.**

- Check `git status` before touching anything.
- No destructive git operations — no `reset --hard`, no `clean`, no unapproved `stash`.
- No database, auth, or RLS changes without explicit scope and a documented rollback.
- Build must pass before committing.
- No commit or push without explicit approval.
- **Verify Arabic encoding after any operation touching Arabic files** — byte-level, not a visual glance.
- No invented legal claims, credentials, professionals, partner relationships, testimonials, or rankings. Factual and legal claims require human approval.

## Deployment

Deployed on **Vercel**. Production currently runs on a `vercel.app` subdomain.

**Custom domain, official firm email, and production email-sending configuration are Launch Gate tasks** — commercially important before launch, but they do not block current development. No future domain is hardcoded here.

## Current Roadmap

```
0. AI Governance + Documentation Sync    ✓ Complete
1. Mobile Reality Baseline               ← Next
2. Legal Path Finder
3. Admin Attribution / Intake Operations
4. Unified Search
5. Professionals ↔ Expertise Approval
6. Expertise 2.0
7. Insights Launch
8. International 2.0
9. Security + Privacy Hardening
10. Accessibility + Performance
11. Launch Gate
```

See **`AI-HANDOFF.md`** for the full roadmap with dependencies, priorities, and open work.
