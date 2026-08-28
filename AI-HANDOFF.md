# AL OUN — AI HANDOFF

> **Shared operational context between Claude and ChatGPT.**
> Every factual claim below was verified against the repository, Supabase, or live deployment at the time of writing. Anything not verifiable is explicitly marked.
> **Last updated by:** Claude · **Against commit:** `e63592d`

---

## 1. Project Identity

| Field | Value |
|---|---|
| Arabic name | مجموعة العون للمحاماة والاستشارات القانونية |
| English name | AL OUN Law Firm & Legal Consultations |
| Jurisdiction | Kuwait |
| Establishment year | 2000 (per site content — **HUMAN REVIEW REQUIRED** for external claim use) |
| Current positioning | Kuwaiti legal institution, global standards; institution-first (not founder-personality-first) |
| Target audiences | Individuals · Companies · Business owners / investors · Foreign law firms and legal professionals |
| Corporate note | Site states AL OUN is part of AL OUN Holding Group (ALG) |

## 2. Final Product Vision

**Product end-state name: AL OUN Digital Legal Platform.** Use this label consistently.

It comprises **four connected layers**:

| Layer | What it is |
|---|---|
| **1. Institutional Presence** | Credibility through restraint and real substance — the firm as an institution, not a personal brand |
| **2. Legal Discovery** | Getting a visitor who lacks legal vocabulary to the right expertise: guided routing, grouped browsing, unified search across 48 real practice areas |
| **3. Structured Intake** | Attributed, conflict-check-aware, minimum-data request capture producing triageable matters — not "email us" |
| **4. Legal Operations** | The internal console where matters are tracked, assigned, annotated, and audited |

**Legal Operations is a layer within the platform — not the name of the product.**

**Knowledge / Insights** and **International Coordination** are not separate layers; they **grow across all four**: insights strengthen presence and feed discovery; international coordination shapes discovery, intake routing, and operations alike.

Supporting characteristics of the end state: professional profiles carrying real professionals only; a scalable foundation (schema separation done from day one so growth doesn't require re-architecture).

Explicitly **not** part of the vision: fabricated international presence, invented rankings/awards, fake testimonials, AI legal advice, or automated legal diagnosis.

## 3. Current Production

| Field | Value | Status |
|---|---|---|
| Current main commit | `e63592df39ae79899c54291e69e9c9a0af4c9706` (`e63592d`) | VERIFIED |
| Commit subject | `feat(phase-c): persist consultation intent and source attribution` | VERIFIED |
| Production URL | `https://al-aoun-law-firm-legal-consultation.vercel.app` | LIVE VERIFIED |
| Repository | `github.com/LAPASSIIOON/Al-Aoun-Law-Firm-Legal-Consultations` (branch `main`) | VERIFIED |
| Framework | Next.js 15.5.23 (App Router), React 19 | VERIFIED |
| Deployment | Vercel | VERIFIED |
| DB / Auth | Supabase (project `ngyhplcnmedafjzotgho`) | VERIFIED |
| Languages | Arabic (primary, RTL) · English (secondary, LTR) via `next-intl` | VERIFIED |
| Bot protection | Cloudflare Turnstile | VERIFIED |
| Production dependencies | 10 total: 4 font packages, 2 Supabase, next, next-intl, react, react-dom | VERIFIED |

**Custom domain: NOT configured** — production is still on the `.vercel.app` subdomain.

## 4. Current Architecture

VERIFIED unless marked otherwise.

- **Routing:** Next.js App Router, all public routes nested under `src/app/[locale]/` — 43 `page.js` route files.
- **Localization:** `next-intl`; message catalogs at `messages/ar.json` and `messages/en.json`. CSS uses logical properties (no separate RTL stylesheet).
- **Supabase schemas (4, separated from day one):** `public` (**12 base tables + 2 views**) · `ops` (3 base tables) · `network` (7 base tables) · `portal` (1 base table, client data, effectively unused). `[VERIFIED — counts filtered by table_type; the 2 public views are `v_active_countries` and `v_active_jurisdictions`. An earlier "14" for public conflated base tables with views.]`
- **RLS:** enabled on **100%** of tables across all four schemas — 0 tables without RLS.
- **Auth/roles:** Supabase Auth; `profiles` table carries role. Admin routes are role-gated. New users are hardcoded to `role='member'` on signup.
- **Public/admin separation:** admin routes live under `/[locale]/admin/*`; **no Dashboard/admin link appears anywhere in public navigation or footer** (LIVE VERIFIED).
- **Practice areas:** 48 active rows in `public.practice_areas` + `public.practice_area_translations` (per-locale `slug`, `status`, `legal_approved`). UNIQUE constraint is `(locale, slug)` — slugs are unique **per locale**, not globally.
- **Practice-area grouping:** 10 UX groups defined **in code only** (`src/lib/practice-area-groups.js`). No `category_id` column exists on `practice_areas`. **HUMAN REVIEW REQUIRED** (legal accuracy).
- **Professionals:** 2 real professionals, stored **in code** at `src/lib/team-data.js`. No professionals table. Intentional at current scale.
- **Insights:** `public.articles` + `article_translations` with `legal_approved` gating. **0 articles exist.**
- **International/network:** `network.jurisdictions` (11 rows), `network.partner_firms` (**0 rows — intentionally empty**), `network.referrals`, partnership applications.
- **Intake flows:** consultation, referral, partnership application — each via its own `SECURITY DEFINER` RPC.
- **Key RPC:** `public.submit_consultation` — see §8.

## 5. Completed Major Phases

| Phase | What changed | Commit | Status |
|---|---|---|---|
| UX Phase 1 | Nav restructure (Professionals promoted to top level; Dashboard removed from all public nav), homepage restructure (focused hero, merged sections), practice-area category chips + search (AND behavior), international 3-path routing, contact intent routing (`ContactIntentRouter`), BreadcrumbList JSON-LD, homepage counter fix 12→48 | `843724c` | LIVE VERIFIED |
| Arabic encoding repair | Corrupted (double-encoded) Arabic in homepage restored | `38eea9d` | LIVE VERIFIED |
| Professionals redesign | Equal institutional weight for both professionals (replaced hero+small-card asymmetry); alternating image/text rhythm | `2aec128` | LIVE VERIFIED |
| Professionals refinement | Unified single background with thin editorial divider; editorial proof lines (replacing the detail page's bulleted list); restrained closing CTA before footer | `162cd43` | LIVE VERIFIED |
| Office/story imagery | Real meeting-room photograph placed in the About page story section; autoplay office video restored after a mistaken removal | `b285187`, `e73fa65`, `554797d` | LIVE VERIFIED |
| **Phase C — Persist Consultation Intent + Source Attribution** | 4 new nullable columns on `ops.consultation_requests` (`intent`, `source_route`, `source_type`, `international_path`); `submit_consultation` rebuilt with server-side allowlisting, path sanitization, source-type derivation, server-side practice-area resolution, locale normalization; `?from=` attribution added to homepage / international / practice-area CTAs | `e63592d` + 3 DB migrations | See §5a |

### 5a. Phase C verification detail
- **LIVE VERIFIED** (real browser, end-to-end, stored values confirmed then cleaned): Homepage AR · Practice Area AR (including correct `practice_area_id` resolution) · International Kuwait Counsel.
- **SERVER VERIFIED** (direct REST against live RPC): locale normalization (6 cases) · malicious `from=` values (external URL, protocol-relative, query-injected, hash-injected) · direct-visit fallback · invalid-intent normalization · backward compatibility with 10-argument callers · CHECK constraints · single function signature (no overload) · grants match pre-migration exactly.
- **TOOL INCONCLUSIVE:** full end-to-end submission for International Matter Abroad and for the English flow — Cloudflare Turnstile did not initialize in the automation environment after clean retries. **This is a tool limitation, not a site defect**; the same RPC mapping is SERVER VERIFIED.

## 6. Current UX / Product State

| Area | State |
|---|---|
| Homepage | Focused hero (search + 2 CTAs), dual client/firm fork, practice areas high in the page, merged "Why AL OUN" section, real counters (48 practice areas). Insights section **fully hidden** (0 approved articles). LIVE VERIFIED |
| Expertise / services | 48 real areas, 10 UX category chips + search combining as AND, no-results state with clear-filters and soft contact CTA. LIVE VERIFIED |
| Practice detail | Content, visual breadcrumb + BreadcrumbList JSON-LD, LegalService schema, related areas, consultation CTA carrying `intent` + `from`. LIVE VERIFIED (4 sample areas) |
| Professionals | Unified background, equal weight, editorial divider, proof lines from real credentials only, closing CTA. LIVE VERIFIED |
| International | 3 distinct paths (Kuwait counsel / matter abroad / work with AL OUN), jurisdictions network with real data, 3 sub-pages. LIVE VERIFIED |
| Contact / intake | 8 intents: 5 open the form (`legalConsultation`, `corporate`, `kuwaitCounsel`, `internationalMatter`, `general`), 3 redirect (`foreignFirm`, `professionalCoop`, `career`). Invalid/missing intent → default selector, no crash. Two-step form, conflict-check messaging, Turnstile. LIVE VERIFIED |
| Insights | Infrastructure complete, **0 content**. Section hidden site-wide where empty. |
| Search | `search_site` RPC with Arabic trigram support — **covers practice areas only**. Professionals, FAQ, insights, international pages are not searchable. |
| Admin | Functional console: consultations, referrals, partnerships, practice areas, insights, members, partner firms, matters, audit log. Phase C attribution fields **not yet surfaced in the UI** (deferred to Phase I by design). |
| Mobile | **NOT VERIFIED** — never tested on a real device or real mobile viewport. Longstanding known gap. |

## 7. Current Security State

**No vulnerability found in the audits conducted so far.** This statement is scoped to the audits actually performed; it is not a claim of comprehensive security.

| Control | State |
|---|---|
| RLS | Enabled on 100% of tables in `public`, `ops`, `network`, `portal` (0 exceptions) — VERIFIED |
| SECURITY DEFINER functions | Audited (32 functions). **Administrative functions are admin-gated; explicitly public submission RPCs remain callable only through their intended grants and internal validation** — the correct design for public intake. No IDOR found; `profiles_update_own_name` blocks self-role-escalation; `handle_new_user` hardcodes `role='member'` |
| `submit_consultation` | `SECURITY DEFINER`, `search_path = ''`, EXECUTE granted only to `anon`, `authenticated`, `service_role`, `postgres` — **no PUBLIC execute** (VERIFIED post-migration) |
| Server-side validation | Name length, contact presence, phone digit count (≥7), client-type allowlist, intent allowlist, `source_route` regex + 100-char cap, locale normalization — all server-side |
| Turnstile | Deployed on intake forms; **verified working through successful real submissions during live QA.** Initialization failures in some automated sessions are TOOL INCONCLUSIVE — evidence of neither a site failure nor a successful bot rejection |
| Rate limits | Postgres-based (`ops.check_rate_limit`), 5 consultations/hour per IP hash |
| Security headers | Applied (X-Frame-Options, HSTS, etc.) |
| CSP | **Deliberately deferred**, reason documented in `next.config.mjs` |
| Attribution trust model | `source_route`/`source_type` are **analytics/intake metadata only** — documented in SQL comments; must never be used for authorization, RLS, privilege, legal-eligibility, or trusted audit decisions |
| Backup / restore procedure | **NOT VERIFIED** — never documented or tested |
| Penetration testing | **NOT VERIFIED** — never performed |

## 8. Current DB / Supabase State

**Schemas:** `public` (**12 base tables + 2 views**) · `ops` (3) · `network` (7) · `portal` (1). All base tables RLS-enabled. `[VERIFIED — filtered by table_type]`

**`ops.consultation_requests` attribution fields (Phase C):**

| Column | Type | Constraint |
|---|---|---|
| `intent` | text NULL | CHECK ∈ {legalConsultation, corporate, kuwaitCounsel, internationalMatter, general} |
| `source_route` | text NULL | Server-sanitized to internal path shape only |
| `source_type` | text NULL | CHECK ∈ {homepage, practice_area, international, contact, other} |
| `international_path` | text NULL | CHECK ∈ {kuwaitCounsel, internationalMatter} |
| `preferred_locale` | text NOT NULL | CHECK ∈ {ar, en} — **pre-existed Phase C** |
| `practice_area_id` | uuid NULL | FK → `practice_areas(id)` ON DELETE SET NULL — **pre-existed Phase C** |

**Current `submit_consultation` signature (12 args):**
```
(p_full_name text, p_client_type text, p_preferred_contact text, p_preferred_locale text,
 p_phone text, p_email text, p_practice_area_id uuid, p_routing_note text,
 p_ip_hash text, p_user_agent text, p_intent text, p_source_route text)
```
Single function, no overload. `p_practice_area_id` is retained for structural backward compatibility but is **deliberately unused** in the insert — only the server-resolved practice area (from a validated `source_route`, filtered by locale + `is_active` + `status='published'` + `legal_approved=true`) is stored. Verified: zero real callers populate it.

**Migration mechanism (important):** this project does **not** use a `supabase/migrations/` folder. The `supabase/` directory holds only `README.md`, `security-hardening.sql`, `update_my_member.sql`. The real source of truth is Supabase's internal `supabase_migrations.schema_migrations` registry, regenerated locally via `supabase db pull` (documented in `supabase/README.md`). Phase C registered three entries: `phase_c_intent_source_attribution`, `phase_c_revoke_public_execute`, `phase_c_locale_normalization`.

**Critical PostgreSQL behavior learned:** adding parameters changes a function's signature, so `CREATE OR REPLACE` creates an **overload** rather than replacing. Correct pattern is explicit `DROP` of the exact old signature, then `CREATE`, then explicit `GRANT` — and `CREATE FUNCTION` grants EXECUTE to `PUBLIC` by default, so an explicit `REVOKE ... FROM public` must follow and be verified.

**Live data counts (verified):** 48 active practice areas · 0 articles · 11 jurisdictions · 0 partner firms · 5 consultation requests.

## 9. Current Content / Legal Review State

| Item | State |
|---|---|
| 48 practice areas | Real, live, published |
| 10 UX groupings | Code-only, **HUMAN REVIEW REQUIRED** — Dr. Haitham must confirm legal accuracy of each area→group assignment |
| Professionals ↔ practice-area mappings | **Do not exist.** Must never be inferred. Requires an explicit approval sheet reviewed by Dr. Haitham before any mapping is created |
| Insights content | **0 articles.** Minimum viable editorial launch proposed: 3–5 approved pieces |
| International claims | Coordination-only framing. Must never imply foreign offices or licensed foreign practice. **HUMAN REVIEW REQUIRED** before any expansion of claims |
| Professional credentials (PhD, arbitration roles, 25+ years, council chair, founded 2000) | Present in `team-data.js` from client-supplied data. **HUMAN REVIEW REQUIRED** before public launch |
| Kuwait legal-advertising rules | **NOT VERIFIED** — the firm must confirm compliance of marketing copy |
| CITRA data-protection compliance | Requirements documented; firm must verify current statutory text |
| Machine-translated publishing | Prohibited by standing decision |

## 10. Current Visual / Brand Direction

Accepted and current:
- Institutional · premium · modern · restrained.
- **Colors — source and implementation are distinct, do not conflate** `[VERIFIED]`:
  - *Brand-source (client-derived, identity document):* ink `#141E36`, cyan `#30A1D9`, ratio navy:cyan ≈ 85:15, cyan never a section background.
  - *Current implementation tokens (`src/app/tokens.css`):* `--ground #0E1826` · `--surface #131F30` · `--surface-2 #1B2A3E` · `--surface-3 #25374D` · `--clay #3D6B92` · `--clay-bright #6FA3CC` · `--platinum #F3F5F7`.
  - **`#141E36` and `#30A1D9` appear zero times in `tokens.css`.** The implemented palette is cooler and related-but-distinct. Reconciling the two is an open `[HUMAN REVIEW REQUIRED]` question.
- Editorial BigLaw feel: strong hierarchy, confident typography, generous but controlled spacing, thin rules over heavy cards.
- Restrained motion; `prefers-reduced-motion` respected.
- Typography: IBM Plex Sans Arabic + Latin companions; `letter-spacing: 0` on Arabic always.

Explicitly rejected (do not reintroduce): AI-beige / gold-on-black clichés · gavels, scales, courthouse imagery · glassmorphism · SaaS-style cards · gradient blobs · fake urgency, scarcity, or social proof · any warm/gold palette (no warm color exists in the brand).

## 11. Current Image / Asset Issues

- Real meeting-room photograph is live in the About story section (`public/about/boardroom.webp`).
- An autoplay office video (`office-interior.webm`/`.mp4`) is live on the About page in a deliberate 9:16 portrait frame.
- Practice-area imagery uses per-slug `.webp` files where present.
- **`public/brand/al-aoun-mark.svg` is a genuine vector** `[VERIFIED — 5 real `<path>` elements, no `<image>`, no base64]`. The mark itself is solved.
- Outstanding brand-asset gaps: the **full editable bilingual lockup system** may still need client-provided production vector assets (the supplied `1.svg`/`2.svg` lockups are raster-in-SVG wrappers), a complete knockout version for dark backgrounds, transparent-background lockups, and a derived favicon.

**FULL IMAGE AUDIT — NOT VERIFIED.** No systematic audit of every image for quality, licensing, or datedness has been performed.

## 12. Current Open Work

### P0
- **Documentation sync** — `README.md` and `package.json` description still describe a two-page prototype. **README REWRITE — REQUIRED · PACKAGE DESCRIPTION UPDATE — REQUIRED.**
- **Mobile Reality Baseline** — moved ahead of the Path Finder, because the Path Finder is mobile-first and must not be designed against unverified responsive assumptions.
- Legal Path Finder (guided routing for visitors who don't know the legal domain) — designed, not implemented.
- Insights editorial launch (3–5 approved pieces) — blocked on human content; **content preparation runs in parallel from now**.

*(Custom domain, official email, and production Resend configuration moved to **Launch Gate** — commercially critical, but they block no current development phase.)*

### P1
- Surface Phase C attribution in the admin console (Phase I).
- Extend `search_site` to professionals, FAQ, insights, international pages (Phase H).
- Professionals ↔ practice-area approval sheet (Phase E), then richer expertise pages (Phase D).
- International trust copy sharpening (Phase F).
- Accessibility pass: keyboard, screen reader, touch targets (Phase L).
- Security hardening plan execution, including staged CSP rollout (Phase J).

### P2
- Performance baseline measurement before any optimization (Phase M).
- `Article` structured data once articles exist.
- Analytics / error monitoring (currently zero installed).
- Team CMS migration — only if the team grows beyond ~4–5 professionals.

## 13. Current Recommended Roadmap

Revised sequence after ChatGPT review (Phase C complete):

**0. AI Governance + Documentation Sync → 1. Mobile Reality Baseline → 2. Legal Path Finder → 3. Admin Attribution / Intake Operations → 4. Unified Search → 5. Professionals ↔ Expertise Approval → 6. Expertise 2.0 → 7. Insights Launch → 8. International 2.0 → 9. Security + Privacy Hardening → 10. Accessibility + Performance → 11. Launch Gate.**

Dependencies: `Mobile Baseline → Path Finder` · `C ✅ → Admin Attribution` · `Approval → Expertise 2.0` · `Insights → Article schema`. Insights content preparation runs in parallel throughout, since its blocker is human/legal rather than engineering.

## 14. Current In-Progress Task

**Nothing is actively being implemented.** Phase C was closed with verdict **PASS WITH TOOL LIMITATION**. Test data fully cleaned (0 test records remain). The repository working tree matches `origin/main`.

## 15. Next Recommended Feature

**Legal Path Finder (Phase B).** Evidence still supports it: 48 practice areas and 3 international paths are presented to visitors who often cannot name their own legal domain, and no guided entry layer exists. It is deterministic (no AI API, no new dependency), bilingual, mobile-first, and additive — it sits above existing structure rather than replacing it. Phase C now makes its impact measurable, since intent and source are captured per request.

Design constraints already agreed: never presents itself as legal advice; never outputs a single definitive area; always shows 1–3 suggestions labelled as preliminary routing; rule table is code-based and requires Dr. Haitham's approval per rule.

## 16. Known Bugs / Risks

**Bugs:** none currently known.

**Limitations:**
- Search covers practice areas only.
- Phase C attribution not visible in admin UI yet (by design).
- Insights empty, so all related-content surfaces are inert.

**Tool limitations (not site defects):**
- Cloudflare Turnstile does not reliably initialize under browser automation → some end-to-end submissions are TOOL INCONCLUSIVE.
- Claude in Chrome screenshots and connectivity have intermittently timed out during QA.
- The local sandbox cannot reach Supabase, so data-driven pages return 404 locally — local verification of those pages is BUILD VERIFIED only.
- Real mobile viewport emulation is unavailable.

**Human review required:** practice-area groupings · professional credentials · international claims · Kuwait legal-advertising compliance · any attorney-client relationship disclaimer wording.

## 17. Launch Tasks

- Purchase and configure custom domain.
- Configure official firm email; verify Resend for production (notifications currently reach a personal Gmail).
- Canonical URLs, redirects, and sitemap updated to the final domain.
- Final verification of every factual and credential claim by Dr. Haitham.
- Launch security QA pass.
- Real-device mobile QA.
- Accessibility verification (keyboard + screen reader).
- Performance baseline (Core Web Vitals) measurement.
- Analytics and error monitoring decision.
- Backup/restore procedure documented and tested.

## 18. Human Approval Required

1. Practice-area UX groupings — legal accuracy (Dr. Haitham).
2. Professionals ↔ practice-area mappings — every mapping, before creation.
3. All professional credentials and biographical claims.
4. International positioning language.
5. Attorney-client relationship disclaimer wording.
6. Insights articles — via the existing `legal_approved` gate.
7. Any marketing copy, against Kuwait legal-advertising rules.
8. Every commit/push — explicit "GO FOR PUSH" from the user.

## 19. Important Product Decisions

Do not accidentally reverse:
- **Institution over founder personality.**
- **No fabricated international network** — coordination only; `partner_firms` stays empty until a real partnership is approved.
- **No invented professionals, credentials, articles, testimonials, awards, or rankings.**
- **No fake directory UX** — no filters/search/pagination for 2 professionals.
- **Equal professional weight** — founder identity stays clear without making the other professional look secondary.
- **No DB entities without real need** — practice-area grouping and professionals stay in code at current scale.
- **No Dashboard/admin link in public navigation or footer.**
- **Insights hidden entirely when no approved content** — no "coming soon" placeholders.
- **Intake collects no sensitive case facts before conflict check.**
- **Safe review → build → verify → commit → push workflow** — see `AI-WORKFLOW.md`.
- **Attribution metadata is never a security authority.**
- **Arabic encoding must be byte-verified after any file operation.**

## 20. Verification Vocabulary

| Term | Meaning |
|---|---|
| **LIVE VERIFIED** | Confirmed on the deployed production site through actual interaction or inspection |
| **BUILD VERIFIED** | Compiles and passes lint/type checks/static generation; runtime behavior not confirmed |
| **SERVER VERIFIED** | Backend behavior confirmed directly (e.g. REST call against the live RPC, SQL inspection) without a browser |
| **BROWSER VERIFIED** | Client-side behavior confirmed in a real browser (navigation, rendering, routing) without full data persistence confirmation |
| **NOT VERIFIED** | Not tested — never to be presented as working |
| **HUMAN REVIEW REQUIRED** | Correctness depends on a human (usually legal) judgment, not a technical check |
| **TOOL INCONCLUSIVE** | Tooling failed or was unavailable; **not** evidence of a site defect and never reported as failure |

## 21. Current Source-of-Truth Notes

| Domain | Source of truth |
|---|---|
| Application code | `origin/main` on GitHub. Local working copies are never authoritative |
| Database schema & functions | The live Supabase project — inspected via `pg_proc`, `information_schema`, `pg_constraint` |
| Migration history | `supabase_migrations.schema_migrations` inside Supabase (**not** a `supabase/migrations/` folder — that folder does not exist) |
| Live behavior | The deployed Vercel production site |
| Legal/factual claims | Dr. Haitham's explicit approval — never inferred from existing site copy |
| Brand values | The identity document (`قرارات الهوية والمعمارية`), measured from client-supplied source files |

Known trap: local `git status` can show phantom differences due to index artifacts from file-tool-created files. Always confirm with a direct content diff against `origin/main` before concluding anything changed.

## 22. Last Claude Technical State

Phase C delivered end-to-end: design → amendment cycles → atomic migration → server-side hardening → live verification → source-of-truth reconciliation. Three DB migrations registered. Application changes shipped in `e63592d` (6 files, +16/−8). Two genuine issues were caught by post-execution verification rather than assumed away: an unintended `PUBLIC` EXECUTE grant (revoked and registered as its own migration) and unnormalized locale input feeding path construction (fixed). Test data fully cleaned. Working tree matches `origin/main`.

## 23. Last ChatGPT Review State

**Reviewed by:** ChatGPT
**Reviewed against:** `origin/main` `e63592d`

**Scope:**
- Governance synchronization
- Roadmap
- Final product vision
- Documentation drift
- Security wording
- Brand source vs implementation
- Launch classification

**Verdict before this correction:** **FIX BEFORE PUSH — governance-only corrections.**

**Corrections requested and applied (5):**
1. Resolve the contradictory public-schema table count — resolved by direct `information_schema` query: **12 base tables + 2 views** (the earlier "14" conflated the two).
2. Correct Turnstile wording — removed the unwarranted inference that automation initialization failure proves successful bot rejection.
3. Correct the `IP_HASH_SALT` explanation — hashing is one-way regardless; a predictable salt weakens **pseudonymization** by enabling candidate-IP/dictionary matching.
4. Normalize the product name in §2 — **AL OUN Digital Legal Platform**, four layers, with Legal Operations as a layer rather than the product name.
5. Update this section.

**Prior round (same review cycle):** contradictions found in colors (source vs implementation), vector asset status, SECURITY DEFINER phrasing, mobile priority ordering, and domain/email classification — all corrected. Documentation drift (§36) and security hardening follow-up (§37) added to the Sync Brief.

**Status after corrections:** awaiting ChatGPT final governance confirmation.

## 24. Immediate Next Action

**Complete roadmap item #0 — Documentation Sync: rewrite `README.md` and update the `package.json` description**, both of which still describe the project as a two-page visual prototype and contradict the production application. This is small, low-risk, and unblocks these governance documents being treated as authoritative.

*(Then #1 Mobile Reality Baseline, then the Legal Path Finder brief — which must not be designed before mobile behavior is verified.)*
