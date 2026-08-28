# AL OUN — COMPLETE PROJECT SYNCHRONIZATION BRIEF

**Prepared by Claude for ChatGPT.**
**Verified against `origin/main` = `e63592d`, live Supabase, and live deployment at time of writing.**

**Category legend used throughout:**
`[VERIFIED]` = confirmed against repo/DB/live now · `[PREVIOUS DECISION]` = agreed earlier, still governing · `[HUMAN CLAIM]` = asserted by client, not technically verifiable · `[NOT VERIFIED]` = untested · `[OBSOLETE]` = superseded, must not return.

---

## 1. EXECUTIVE PROJECT DEFINITION

**The business.** AL OUN (مجموعة العون للمحاماة والاستشارات القانونية) is a Kuwaiti law firm and legal consultancy. Site content states it was founded in 2000 and is part of AL OUN Holding Group (ALG) `[HUMAN CLAIM]`. It has **two real professionals** `[VERIFIED]`.

**The audience.** Four distinct groups, and the product treats them as genuinely distinct: (1) individuals with a legal problem, (2) Kuwaiti companies and business owners, (3) investors, (4) foreign law firms and legal professionals seeking Kuwait coverage or offering reciprocal coordination.

**Kuwait context.** Arabic is the primary language and the primary market language — not a translation layer. RTL is a first-class design constraint, not an afterthought. Kuwait's legal-advertising rules constrain marketing copy and have **not** been verified against current statute `[NOT VERIFIED]`. CITRA data-protection expectations (explicit consent, bilingual privacy policy, disclosure of storage location, cross-border transfer notice, 72-hour breach notification) are documented requirements the firm must confirm.

**Institutional positioning.** The governing decision is **institution over founder personality** `[PREVIOUS DECISION]`. The founder is visible and clearly identified, but the site does not read as a personal brand. This shaped the professionals page redesign directly.

**International ambition — carefully bounded.** AL OUN coordinates across jurisdictions. It does **not** have foreign offices, does **not** hold foreign practice licences, and has **zero** approved partner firms `[VERIFIED — network.partner_firms is empty]`. The product must never imply otherwise. The ambition is to become a credible *coordination gateway*, which is a real and defensible position, rather than to imitate a global firm's footprint.

### What are we ultimately trying to build?

A **legal operations product**, not a brochure site. Concretely, an integrated system where:

- A visitor who **cannot name their own legal problem** is still routed correctly (expertise discovery + guided routing).
- Expertise pages are **connected** — each practice area linking to the professionals who handle it and the insights written about it — rather than being 48 isolated leaf pages.
- Intake is **structured and attributed**: every request carries its intent and origin, is conflict-check-aware, and collects the minimum necessary data before a secure channel is opened.
- International enquiries are **triaged into three honest journeys** rather than one ambiguous "contact us".
- The firm's expertise is **evidenced through published, legally approved writing** rather than asserted.
- The back office receives **triageable structured matters**, not undifferentiated email.
- The whole thing **scales** — schema separation was done on day one specifically so growth does not force re-architecture.

---

## 2. BUSINESS / STAKEHOLDER GOALS

**Dr. Haitham (the lawyer, legal authority).** Wants institutional credibility appropriate to a serious Kuwaiti practice; retains final approval over every legal and factual claim. He is the approval gate for practice-area categorization, professional-to-expertise mappings, credentials, disclaimers, and any published legal content.

**The user (product owner, operator).** Wants BigLaw-quality execution at the firm's real scale — without fabrication. Has repeatedly and correctly enforced: verify before claiming, no invented content, no destructive git operations, explicit push approval, and precise verification vocabulary. Retains sole authority to authorize commits and pushes.

**Commercially.** Qualified enquiries that arrive pre-routed and pre-contextualized. Phase C exists precisely so the firm can eventually see *which* surfaces produce *which* kinds of matters.

**Reputationally.** In a small legal market, an overstatement is a lasting liability. Restraint is a feature. Empty states are shown honestly rather than filled with placeholders.

**Internationally.** Credibility with foreign firms depends on being precise about what coordination means. A foreign firm can detect an inflated network claim immediately.

**What must never be overstated.** Foreign offices · licensed foreign practice · partner relationships · team size · credentials · rankings/awards/testimonials (none exist and none may be invented) · security posture.

---

## 3. CURRENT BRAND / VISUAL DIRECTION

### Accepted and current `[VERIFIED / PREVIOUS DECISION]`

- **Direction:** institutional · premium · modern · restrained. Editorial BigLaw feel: strong hierarchy, confident typography, thin rules over heavy cards, generous but controlled spacing.

#### Colors — source and implementation are related but NOT identical

**⚠️ This distinction was previously stated incorrectly. Correcting it here.**

**A. Brand-source / client-derived colors** `[VERIFIED — measured from client-supplied SVG, documented in the identity document]`

| Value | Meaning |
|---|---|
| `#141E36` | Official ink, measured from client SVG (supersedes PNG-derived `#111A31` and `#2A3F91`) |
| `#30A1D9` | Cyan derived from the logo arc |

Governing rules from the identity document: navy:cyan ≈ 85:15 · cyan is never a section background · `#30A1D9` is banned as text on light (2.91:1 — fails) · logo gradient permitted only as a 2–4px rule, never as a background · no gold, no warm color.

**B. Current implementation tokens** `[VERIFIED — read directly from src/app/tokens.css]`

| Token | Value | Role |
|---|---|---|
| `--ground` | `#0E1826` | Deep cool navy — dominant ground |
| `--surface` | `#131F30` | Surface |
| `--surface-2` | `#1B2A3E` | Raised surface |
| `--surface-3` | `#25374D` | Hover / nested |
| `--clay` | `#3D6B92` | Fills / CTA |
| `--clay-bright` | `#6FA3CC` | Brighter blue — accent text/lines on dark |
| `--clay-600` | `#325A7B` | Pressed state |
| `--platinum` | `#F3F5F7` | Primary text — near-white, cool |
| `--platinum-2` | `#B7C1CC` | Secondary text |
| `--platinum-3` | `#7C8896` | Muted text |
| `--light-ground` | `#F4F6F8` | Light ground |

**Critical fact: `#141E36` and `#30A1D9` do not appear anywhere in `tokens.css`** `[VERIFIED — zero occurrences]`. The implementation runs a **cooler, related-but-distinct palette**. Legacy aliases exist for compatibility (`--navy`, `--espresso`, `--graphite`, `--ivory`, `--blue`, and notably `--gold: var(--clay)` — gold is aliased to the blue, consistent with the no-warm-color rule).

**Do not describe the source measurements as the implemented palette, or vice versa.** Reconciling the two — deciding whether implementation should move toward source, or the source document should record the implemented system as the accepted evolution — is an open `[HUMAN REVIEW REQUIRED]` question that has not been raised with the client.
- **Typography:** IBM Plex Sans Arabic + IBM Plex Sans (OFL, variable, self-hosted). Arabic needs ~6–8% larger optical size. **`letter-spacing: 0` on Arabic always.** No faux bold, no uppercase, no unadjusted justify. Cairo and Tajawal explicitly rejected as over-used in the Gulf market. Actual installed font packages `[VERIFIED]`: IBM Plex Sans Arabic, Noto Naskh Arabic, Noto Serif, Archivo Variable.
- **Motion:** restrained. Subtle reveals and understated hover only. `prefers-reduced-motion` respected. No theatrical scroll effects. No GSAP.
- **3D policy:** none. No 3D scenes, no WebGL showpieces.
- **Image philosophy:** real photography of the actual firm where available; no stock-legal clichés; no generated faces; no invented imagery.
- **Institutional/founder balance:** founder clearly identified; both professionals presented with **equal visual weight**.

### REJECTED / OBSOLETE — must not return `[OBSOLETE]`

- AI-beige / gold-on-black palettes. **No gold, no warm color of any kind** — the brand contains none.
- Gavels, scales, courthouse columns, stock "justice" imagery.
- Glassmorphism · gradient blobs · neon · floating shadows everywhere · excessive rounded rectangles.
- SaaS-style card grids for professionals.
- Fake directory UX (search/filters/pagination/alphabet index) for two people.
- Fake urgency · scarcity · social proof · testimonials · ratings. `AggregateRating`/`Review` structured data explicitly prohibited.
- Machine-translated publishing.
- The earlier hero-plus-small-card professionals layout (founder large, second professional as a minor card) — deliberately replaced.

---

## 4. CURRENT SITE INFORMATION ARCHITECTURE `[VERIFIED — enumerated from repo]`

**43 route files under `src/app/[locale]/`.** All routes are locale-prefixed (`/ar/…`, `/en/…`).

**Public:**
`/` homepage · `/services` expertise index · `/services/[slug]` practice detail · `/team` professionals · `/team/[slug]` professional detail · `/international` · `/international/for-law-firms` · `/international/refer-a-matter` · `/international/partner-with-us` · `/insights` · `/insights/[slug]` · `/contact` · `/faq` · `/careers` · `/about` · `/privacy` · `/terms` · `/[...notfound]`

**Authenticated (member):**
`/account/sign-in` · `/account/sign-up` · `/account/forgot-password` · `/account/reset-password` · `/account/my-requests` · `/account/matters` · `/account/matters/[id]`

**Admin (role-gated):**
`/admin` · `/admin/consultations` · `/admin/referrals` · `/admin/partnerships` · `/admin/practice-areas` (+ `/new`, `/[id]`) · `/admin/insights` (+ `/new`, `/[id]`) · `/admin/members` · `/admin/partner-firms` (+ `/new`, `/[id]`) · `/admin/matters` (+ `/new`, `/[id]`) · `/admin/audit`

**Public navigation order** `[LIVE VERIFIED]`: Practice Areas (mega menu) → Professionals → International (dropdown) → Insights → The Firm (About, Careers) → Contact. **No Dashboard/admin link appears in public navigation or footer.** Footer contains a "بوابة الأعضاء" (member portal) sign-in link — that is the account layer, not admin.

---

## 5. CURRENT HOMEPAGE STATE `[LIVE VERIFIED]`

- **Hero:** focused — search field + exactly two CTAs ("أحتاج مساعدة قانونية" → `/contact?intent=legalConsultation&from=/ar`, "ابحث عن مجال" → `/services`). Vector mark watermark, background imagery, `revalidate = 60`.
- **CTA logic:** the primary CTA now carries both intent and source attribution (Phase C).
- **Dual fork:** client/firm split sits immediately below the hero.
- **Expertise placement:** practice areas moved **up** (now section 3, previously 4).
- **Trust/institution story:** "Who we are", institutional legacy, why clients choose us, and founder content were **merged into one section** during UX Phase 1 to reduce fragmentation.
- **Counters:** real values — founded 2000, 25+ years, **48 practice areas**, 4 arbitration centres. The 48 figure is live-data-driven with a corrected fallback (was hardcoded 12).
- **Professionals:** not featured on the homepage as a grid; the dedicated page carries them.
- **International:** represented via the dual fork and navigation.
- **Insights behavior:** section is **completely hidden** when zero approved articles exist — no "coming soon" placeholder `[PREVIOUS DECISION]`.
- **Footer:** practice areas, links, contact, newsletter subscribe, legal links, ALG attribution.
- **Still weak:** no guided routing for the undecided visitor (the Legal Path Finder gap); homepage insights surface is inert until content exists.

---

## 6. EXPERTISE SYSTEM

- **48 active practice areas** `[VERIFIED — count = 48]`.
- **Storage:** `public.practice_areas` (id, sort_order, is_active, created_at, updated_at) + `public.practice_area_translations` (per-locale row carrying slug, title, summary, body, status, legal_approved).
- **Translations:** separate rows per locale — **not JSONB**. Slug and status are independent per language `[PREVIOUS DECISION]`.
- **Uniqueness:** `UNIQUE (locale, slug)` and `UNIQUE (practice_area_id, locale)` `[VERIFIED]`. **Slugs are unique per locale, not globally** — this materially affects any slug resolution and is handled correctly in Phase C.
- **Approval behavior:** public queries filter `status='published'` AND `legal_approved=true`. The legal-approval gate is enforced at data level, not UI level `[PREVIOUS DECISION]`.
- **Search/filter UX** `[LIVE VERIFIED]`: text search + 10 category chips; they combine as **AND** (verified live: 37 results after text → 21 after adding a chip). No-results state offers clear-filters plus a soft contact CTA.
- **Grouping implementation:** 10 UX groups defined **in code only** at `src/lib/practice-area-groups.js`. **No `category_id` column exists on `practice_areas`** `[VERIFIED]`. A `categories` table exists but is an unlinked scaffold.
- **Is grouping legally approved?** **NO — `[HUMAN REVIEW REQUIRED]`.** Dr. Haitham has not signed off on the area→group assignments. This is flagged in the code itself.
- **Related practices:** each detail page shows other published areas. Working.
- **Missing relationships:** practice area ↔ professional and practice area ↔ insight relationships **do not exist**. No schema, no data.
- **Planned Expertise 2.0:** `Practice → Related Practices → Professionals → Insights → Contact Path` (the Kim & Chang connective model), using only real AL OUN content. Blocked on mapping approval and content.

**The 48 slugs (English locale, sort order)** `[VERIFIED]`:

```
constitutional-law, cassation-appeals, administrative-public-law, commercial-arbitration,
dispute-resolution, intellectual-property, capital-markets, corporate-commercial,
contracts-civil, litigation, labour-employment, real-estate, banking-finance,
competition-law, cyber-crime, education-law, energy-mining, hospitality-hotels,
infrastructure, insurance, islamic-finance, sports-law, tmt, transport, aviation,
consumer-protection, distribution-agency, environmental-law, family-business-wealth,
franchising, funds, healthcare-law, heritage-protection, international-trade,
legislative-drafting, mergers-acquisitions, private-client, private-notary,
private-equity, privatization, projects, public-procurement, railways,
regulatory-compliance, restructuring-insolvency, securitization-derivatives,
shipping-maritime, recreation-leisure
```

---

## 7. PROFESSIONALS SYSTEM

- **Real team size: 2** `[VERIFIED]` — Dr. Haitham Ahmed Al Oun (`haitham-al-aoun`, founder/chairman) and Bader Saif Abdullah Askar Al-Rashidi (`bader-saif-al-rashidi`, tier `partner`).
- **Data source: `src/lib/team-data.js` — code, not database** `[VERIFIED]`. Photos at `/media/founder-haitham.jpg` and `/media/team-bader-saif.jpg`.
- **Available fields:** `name, role, title, bio, creds[]` for both; Bader additionally has `education[]` and `experience[]`.
- **Page architecture** `[LIVE VERIFIED]`: compact institutional hero ("خبرة قانونية تقودها الممارسة" / "Legal expertise shaped by practice") → both professionals on a **single unified `on-ivory` background** separated by a **thin editorial rule** with generous spacing → alternating image/text direction on desktop only → restrained closing CTA before the footer.
- **Latest refinement (`162cd43`):** replaced the earlier two-section light/dark alternation (which read as two stacked homepage sections) with the unified background; replaced the detail page's bulleted `pointList` with **editorial proof lines** (stacked, hairline-separated, max 4, verbatim from `creds[]`); added the closing CTA linking to `/contact?intent=legalConsultation`.
- **Equal-weight decision** `[PREVIOUS DECISION]`: the earlier layout gave Bader a small card with no bio and no credentials while Haitham got the full treatment. Both now receive identical structural treatment. Founder identity remains clear through role and title, not through visual dominance.
- **Mapping to expertise: does not exist.** Must be produced as a **review sheet** for Dr. Haitham's explicit per-mapping approval before anything is created. **Never inferred from biography text** `[PREVIOUS DECISION]`.
- **Why no filters:** search/filter/pagination for two people is fake directory UX.
- **Why no DB CMS:** migration + RLS + admin UI cost is unjustified at this size. Trigger for revisiting: roughly 4–5+ real professionals.

---

## 8. INTERNATIONAL SYSTEM

**Three journeys, live** `[LIVE VERIFIED]`:

- **A — Inbound: "I need Kuwait counsel."** Foreign client/company/firm needs Kuwait representation. → `/contact?intent=kuwaitCounsel&from=/ar/international`.
- **B — Outbound: "I have a matter outside Kuwait."** Kuwaiti client needs coordination abroad. → `/contact?intent=internationalMatter&from=/ar/international`. Added in UX Phase 1 (previously the page served three personas with a two-card fork).
- **C — "Work with AL OUN."** Foreign firms / professional cooperation. → `/international/for-law-firms`, with `/refer-a-matter` and `/partner-with-us` as the operational sub-routes.

**Real data:** `network.jurisdictions` — **11 rows** `[VERIFIED]`. Note: an earlier internal document said 10; **the correct number is 11**. Displayed as a network graphic with a caption explicitly framing it as *coordination scope*, not a claim of a standing partnership in each jurisdiction.

**What does NOT prove a real relationship:** the jurisdictions list. It is geographic coordination scope only.

**`network.partner_firms` = 0 rows** `[VERIFIED]` — deliberately empty until a real, approved partnership exists. There is no public partner directory.

**Network schema (7 tables)** `[VERIFIED]`: `countries`, `jurisdictions`, `partner_firms`, `partner_contacts`, `partner_practice_areas`, `partnership_applications`, `referrals`.

**Public claims allowed:** coordination across jurisdictions; direct Kuwait practice; arbitration experience (subject to human verification).

**Public claims NOT allowed:** foreign offices; licensed foreign practice; "global network"; named partner firms; reciprocal arrangements — none until verified and approved.

**Long-term goal:** operational international capability — a real partner directory with real status tracking, referral lifecycle management, and jurisdiction-aware routing. Architecture supports this; **data does not exist yet**.

---

## 9. CONTACT / INTAKE SYSTEM

### The 8 intents `[VERIFIED from INTENT_CONFIG in code, LIVE VERIFIED in browser]`

**Form intents (5) — open ContactForm directly:**
`legalConsultation` · `corporate` · `kuwaitCounsel` · `internationalMatter` · `general`

**Redirect intents (3) — never reach the consultation form:**
`foreignFirm` → `/international/for-law-firms` · `professionalCoop` → `/international/partner-with-us` · `career` → `/careers`

**ContactIntentRouter behavior** `[VERIFIED]`: reads `?intent=` via `useSearchParams()` inside a Suspense boundary (required for SSG). Unknown or missing intent → silent fallback to the default 8-option selector, no crash. Redirect intents use `router.replace()` (not `push`) so the back button does not re-trigger the redirect. `kuwaitCounsel` and `internationalMatter` were deliberately made **form**-type rather than redirect-type to prevent a bounce loop back to `/international`.

### Phase C — Persist Intent + Source Attribution (complete)

**New columns on `ops.consultation_requests`** `[VERIFIED]`, all nullable:

| Column | Constraint |
|---|---|
| `intent` | CHECK ∈ {legalConsultation, corporate, kuwaitCounsel, internationalMatter, general} |
| `source_route` | server-sanitized to internal path shape, ≤100 chars |
| `source_type` | CHECK ∈ {homepage, practice_area, international, contact, other} |
| `international_path` | CHECK ∈ {kuwaitCounsel, internationalMatter} |

Pre-existing and reused: `practice_area_id` (FK → `practice_areas`, ON DELETE SET NULL) and `preferred_locale` (NOT NULL, CHECK ∈ {ar, en}).

**Attribution mechanism:** each source page appends `&from=/<locale>/<path>` to its existing `?intent=` link. **No `sessionStorage`, no `document.referrer`, no new dependency, no global state** — a deliberate design constraint.

**Server-side processing (all in the RPC):**

1. `v_locale` normalized first: `ar`/`en` accepted, anything else → `'ar'`. The normalized value is used both for the fallback path and for the stored `preferred_locale`.
2. `intent` allowlisted; anything else silently normalized to NULL (the request still succeeds — attribution is not a gate).
3. `source_route` validated by regex `^/(ar|en)(/[a-z0-9-]{1,60}){0,4}$` plus a 100-char cap; invalid → fallback to `/<v_locale>/contact` (never NULL in this flow).
4. `source_type` **derived server-side** from the sanitized route.
5. `international_path` **derived server-side** from intent only.
6. `practice_area_id` **resolved server-side** by extracting the slug from the validated route and querying with `locale` + `is_active` + `status='published'` + `legal_approved=true`. **Client-supplied `p_practice_area_id` is deliberately not used as a fallback** — verified that zero real callers populate it. The parameter is retained only for structural backward compatibility.

**Current RPC signature (12 args, single function, no overload)** `[VERIFIED]`:

```
submit_consultation(p_full_name, p_client_type, p_preferred_contact, p_preferred_locale,
  p_phone, p_email, p_practice_area_id uuid, p_routing_note,
  p_ip_hash, p_user_agent, p_intent, p_source_route)
SECURITY DEFINER · search_path = ''
```

**The PUBLIC execute incident — important.** Adding parameters changes a PostgreSQL function's *signature*, so `CREATE OR REPLACE` would have created a **second overloaded function** rather than replacing the original (PostgREST ambiguity risk). Correct pattern used: explicit `DROP` of the exact 10-arg signature → `CREATE` → explicit `GRANT`. **However**, `CREATE FUNCTION` grants EXECUTE to `PUBLIC` by default, and post-execution verification caught exactly that: `PUBLIC` appeared in the grants. It was immediately `REVOKE`d and the revocation was **registered as its own migration** so a fresh replay of history reaches the safe end state. Final grants `[VERIFIED]`: `anon`, `authenticated`, `service_role`, `postgres` — **no PUBLIC**.

**Migration history mechanism** `[VERIFIED — this corrects a common assumption]`: this project has **no `supabase/migrations/` folder**. The `supabase/` directory contains only `README.md`, `security-hardening.sql`, `update_my_member.sql`. The real source of truth is Supabase's internal `supabase_migrations.schema_migrations` registry, regenerated locally via `supabase db pull`. Phase C registered three entries: `phase_c_intent_source_attribution`, `phase_c_revoke_public_execute`, `phase_c_locale_normalization`.

**Live verification result:**

- `LIVE VERIFIED` (real browser, end-to-end, stored values confirmed then deleted): Homepage AR (`homepage`, `/ar`) · Practice Area AR (`practice_area`, `/ar/services/commercial-arbitration`, **correct `practice_area_id` resolved**) · International Kuwait Counsel (`international`, `international_path=kuwaitCounsel`).
- `SERVER VERIFIED` (direct REST): locale normalization ×6 (`ar`, `en`, `xx`, `ar?secret=x`, `../../evil`, 5000-char string — all normalized safely, no raw value stored) · malicious `from=` ×4 · direct-visit fallback · invalid-intent normalization · 10-arg backward compatibility · constraints · signature uniqueness · grant parity.
- `TOOL INCONCLUSIVE`: full end-to-end submission for International Matter Abroad and the English flow — Turnstile failed to initialize under automation after clean retries.
- **Verdict: PASS WITH TOOL LIMITATION.** All test records deleted; verified zero remain.

**Attribution trust model — must be preserved.** `source_route` and `source_type` are **analytics/intake metadata only**. A user can hand-edit the query parameter. The server sanitizes, allowlists path shape, and derives type — but **cannot prove the user actually came from that page**. They must **never** be used for authorization, RLS decisions, privilege decisions, legal eligibility, or trusted audit evidence. This is documented as a comment inside the SQL function itself.

---

## 10. ADMIN / OPERATIONS

**Exists and functional** `[VERIFIED — routes enumerated]`: `/admin` dashboard · consultations · referrals · partnerships · practice areas (list/new/edit) · insights (list/new/edit) · members · partner firms (list/new/edit) · matters (list/new/edit) · audit log.

Supporting components exist: `AdminNav`, `AdminTable`, `ArticleEditor`, `MembersTable`, `NewPracticeAreaForm`, `NewPartnerFirmForm`, `EditPartnerFirmForm`, `NewMatterForm`, `MatterFilesPanel`.

**Existing operational fields on consultation requests** (pre-Phase C): `stage`, `assigned_to`, `internal_notes`, `conflict_checked_by`, `conflict_checked_at`. `conflict_check` is an explicit lifecycle stage `[PREVIOUS DECISION]`.

**Not built:** Phase C attribution fields are **not yet surfaced in the admin UI** — deliberately deferred to Phase I so Phase C could be verified in isolation.

**Future Operations Console direction (PLANNED, NOT BUILT):** surface intent/source columns, filter by intent, and expose the existing stage/assignment/notes fields more usefully. Assessment: the existing fields already cover roughly 90% of a lightweight intake console. **This is explicitly not a CRM build.**

---

## 11. AUTH / ACCOUNT SYSTEM

- **Routes:** sign-in, sign-up, forgot-password, reset-password, my-requests, matters, matters/[id] `[VERIFIED]`.
- **Roles:** stored on `public.profiles`. Admin routes are role-gated.
- **Signup protection:** `handle_new_user` **hardcodes `role='member'`** — a new user cannot self-assign a privileged role `[VERIFIED in prior deep audit]`.
- **Self-escalation protection:** `profiles_update_own_name` prevents a user from changing their own role `[VERIFIED in prior deep audit]`.
- **Public Dashboard removal:** the Dashboard/admin link was removed from header (desktop + mobile) and confirmed absent from the footer. A wasted per-page `getCurrentMember()` fetch was removed from the layout at the same time `[LIVE VERIFIED]`.
- **Member features:** `my-requests` and `matters` with a file panel exist.
- **Verification status:** RLS and role gating `VERIFIED`. Session/JWT configuration, CORS configuration, and storage policies for matter files: `[NOT VERIFIED]` — not inspected in the audits performed.

---

## 12. DATABASE ARCHITECTURE `[VERIFIED — enumerated from information_schema]`

**Four schemas, separated from day one** `[PREVIOUS DECISION]` — the single most valuable early architectural choice, because it makes essentially every planned feature additive rather than structural.

| Schema | Contents `[VERIFIED — filtered by table_type]` |
|---|---|
| **public** | **12 base tables:** `articles`, `article_translations`, `categories`, `category_translations`, `faqs`, `faq_translations`, `matters`, `matter_files`, `newsletter_subscribers`, `practice_areas`, `practice_area_translations`, `profiles`<br>**+ 2 views:** `v_active_countries`, `v_active_jurisdictions` |
| **ops** (3 base tables, 0 views) | `consultation_requests`, `audit_log`, `rate_limits` |
| **network** (7 base tables, 0 views) | `countries`, `jurisdictions`, `partner_firms`, `partner_contacts`, `partner_practice_areas`, `partnership_applications`, `referrals` |
| **portal** (1 base table, 0 views) | `members` — effectively unused, deny-by-default |

**Count reconciliation:** an earlier draft stated "public = 14". That figure counted **base tables + views together**. The verified split is **12 base tables + 2 views**. Only `public` has views; the other three schemas have zero.

**RLS: enabled on 100% of tables across all four schemas — 0 exceptions** `[VERIFIED]`.

**Translation pattern:** separate translation tables throughout (practice areas, articles, FAQs, categories) — never JSONB. Independent `slug` and `status` per locale.

**Key RPCs** `[VERIFIED]`:

- `submit_consultation` — `SECURITY DEFINER`, 12 args (see §9)
- `submit_referral` — `SECURITY DEFINER`, 12 args
- `submit_partnership_application` — `SECURITY DEFINER`, 13 args
- `search_site(p_query text, p_locale text)` — **`SECURITY INVOKER`** (not DEFINER), correctly so
- Newsletter subscription RPC exists

**SECURITY DEFINER pattern:** all three intake RPCs use `SECURITY DEFINER` with `search_path = ''` and perform their own validation. A prior deep audit examined 32 SECURITY DEFINER functions: **administrative functions are admin-gated, while the explicitly public submission RPCs are reachable by `anon` through their intended grants and rely on internal validation** — which is the correct design for public intake. No IDOR found.

**Audit:** `ops.audit_log` receives an entry on consultation submission (`consultation.submitted` with reference and client type).

**Rate limiting:** `ops.check_rate_limit` — Postgres-based, no Redis, deliberately (fewer cross-border data paths) `[PREVIOUS DECISION]`. Consultations: 5/hour per IP hash.

**Live row counts** `[VERIFIED]`: 48 active practice areas · 0 articles · 11 jurisdictions · 0 partner firms · 5 consultation requests (real, not test).

**Dead code noted previously:** `enforce_legal_approval()` exists but is wired to no trigger. A `DROP FUNCTION` proposal was documented and **not executed**.

---

## 13. SECURITY STATE

**Correct phrasing: "No vulnerability found in the audits conducted so far."** Never "100% secure."

### VERIFIED

- RLS on 100% of tables, all four schemas.
- **SECURITY DEFINER functions were audited (32 functions). Administrative functions are admin-gated; explicitly public submission RPCs remain callable only through their intended grants and internal validation.** No IDOR found. *(This wording corrects an earlier over-broad claim that "all 32 are admin-gated" — the three intake RPCs are intentionally `SECURITY DEFINER` and intentionally reachable by `anon` through scoped grants, which is the correct design for public intake, not a gap.)*
- Role escalation blocked at two points (`handle_new_user`, `profiles_update_own_name`).
- **Server-side phone validation** added to all three intake RPCs (digit count ≥7 after stripping non-digits) — closing a real gap where validation had been client-side only. Tested live via REST: 6 cases across 3 RPCs, all passed, test data cleaned.
- Phase C server-side validation: intent allowlist, path regex + length cap, locale normalization, server-side practice-area resolution.
- **Phase C privilege incident found and fixed:** unintended `PUBLIC` EXECUTE grant after `DROP`+`CREATE`, revoked and registered as its own migration. Grants verified to match pre-migration exactly.
- Rate limiting active (Postgres-based).
- Turnstile deployed and **verified working through successful real submissions during live QA**. (Automation-session initialization failures are TOOL INCONCLUSIVE — not evidence of a site failure, and not evidence of a successful bot rejection either.)
- Security headers applied (X-Frame-Options, HSTS, etc.).
- `search_site` correctly uses SECURITY INVOKER.
- Attribution explicitly excluded from any authorization role.

### NOT VERIFIED

- Storage policies for matter files.
- Session/JWT configuration specifics.
- CORS configuration.
- Backup and restore procedure — never documented or tested.
- Penetration testing — never performed.
- Dependency vulnerability scan — not run in these sessions.
- Automated RLS test suite — does not exist.

### DEFERRED

- **CSP** — deliberately deferred with the reason documented in `next.config.mjs`. Planned approach: `Report-Only` first, measure breakage against Turnstile and Maps, then enforce.
- Analytics and error monitoring — zero installed.

**Standing rule** `[PREVIOUS DECISION]`: the system is not described as secure until automated RLS tests, header checks, rate-limit tests, dependency scanning, and manual review of every input point are all complete.

---

## 14. PRIVACY / LEGAL-SAFETY STATE

- **Minimum sensitive data** `[PREVIOUS DECISION, implemented]`: the consultation form **does not collect case facts**. Rationale: conflict-of-interest exposure, confidentiality, and attack surface. It collects only enough to route and triage; substantive discussion happens after conflict check on a secure channel. Form microcopy states this explicitly.
- **Conflict-check philosophy:** `conflict_check` is an explicit lifecycle stage, and the public "how consultation works" section names it as step 2 — visible process as a trust signal rather than a hidden internal step.
- **Attorney-client disclaimer:** the form already displays "تقديم الطلب لا يُنشئ علاقة موكّل بمحامٍ، ولا يُعدّ بذاته استشارة قانونية." **The precise legal sufficiency of this wording is `[HUMAN REVIEW REQUIRED]` — Dr. Haitham must approve final wording. Claude will not draft final legal language.**
- **Privacy policy:** `/privacy` and `/terms` exist. Content adequacy `[NOT VERIFIED]`.
- **Retention policy:** does not exist yet. Needed before launch.
- **CITRA requirements** documented: explicit consent, bilingual policy before service delivery, disclosure of storage duration and location, cross-border transfer notice (neither Vercel nor Supabase has a Kuwait region), 72-hour breach notification, access/correction/erasure rights. **The firm must verify current statutory text.**
- **Privacy by design in Phase C:** `source_route` is regex-constrained so it structurally cannot contain query strings, hashes, external domains, or user-entered text. Verified with four hostile inputs.

---

## 15. SEARCH

- **Implementation:** `public.search_site(p_query text, p_locale text)` — `SECURITY INVOKER` `[VERIFIED]`.
- **Arabic handling** `[PREVIOUS DECISION, implemented]`: PostgreSQL has **no Arabic stemmer**. The solution is `simple` configuration + `pg_trgm` trigram matching + a normalization function handling alef variants, yaa, taa marbuta, and diacritics.
- **What it indexes: practice areas only** `[VERIFIED]`.
- **What it does NOT index:** professionals, FAQs, insights, international pages. A visitor searching "بدر" or "أسئلة شائعة" finds nothing despite the content existing.
- **Planned unified search (Phase H):** the function already carries a `kind` discriminator column, so extension is `UNION ALL` additions in the existing pattern — **no restructure, and no paid search service is justified at this content volume**. Proposed ranking: exact title → professional → practice area → FAQ → body content.

---

## 16. INSIGHTS

- **Tables:** `public.articles` + `public.article_translations` `[VERIFIED]`.
- **Admin:** `/admin/insights` with list, new, and edit routes plus an `ArticleEditor` component `[VERIFIED]`.
- **Legal approval:** `legal_approved` gating enforced at data level — nothing publishes without it `[PREVIOUS DECISION]`.
- **Current approved article count: 0** `[VERIFIED]`.
- **Why the homepage hides them:** showing "coming soon" placeholders on a law firm site reads as unfinished. Hiding the section entirely is honest and looks deliberate `[PREVIOUS DECISION]`.
- **Recommended minimum viable editorial launch: 3–5 approved pieces** — enough to activate related-content surfaces without looking sparse. **The blocker is human content, not engineering.**
- **Future relationships:** article ↔ practice area, article ↔ author/professional, plus jurisdiction and topic fields. Schema additions would be small and nullable. Not built.

---

## 17. SEO / STRUCTURED DATA

- **Files present** `[VERIFIED]`: `src/app/sitemap.js`, `src/app/robots.js`, `src/app/manifest.js`.
- **Structured data implemented and live** `[LIVE VERIFIED on sampled pages]`: `LegalService` (practice detail), `Person` (professional detail), `FAQPage` (FAQ, matching visible text), `BreadcrumbList` (added in UX Phase 1 across 6 call sites: services/[slug], team/[slug], insights/[slug], for-law-firms, partner-with-us, refer-a-matter).
- **`Article` schema:** not implemented — correct, since zero articles exist.
- **Prohibited:** `AggregateRating` and `Review` `[PREVIOUS DECISION]`.
- **hreflang/canonical:** `altLangs()` helper is used in `generateMetadata` across locale routes.
- **⚠️ LAUNCH ISSUE — STILL PRESENT `[VERIFIED]`:** the Vercel preview URL is **hardcoded** as `BASE_URL` in **three files**: `src/app/robots.js`, `src/app/sitemap.js`, and `src/components/Breadcrumbs.js`. All three must be updated (ideally centralized to one env-driven constant) at domain launch, or robots, sitemap, and BreadcrumbList JSON-LD will all point at the preview domain.

---

## 18. PERFORMANCE

- **Build state** `[VERIFIED]`: compiles successfully; 78/78 static pages generated.
- **JS sizes** `[VERIFIED from build output]`: shared first-load JS ≈ 103 kB; homepage ≈ 196 kB first load; contact ≈ 131 kB; services ≈ 129 kB; middleware ≈ 105 kB.
- **Dependency discipline:** 10 production dependencies total, 4 of which are fonts. Explicitly rejected: framer-motion, date-fns, icon libraries, react-hook-form, Prisma/Drizzle, Redux/Zustand `[PREVIOUS DECISION]`.
- **Image optimization:** Next.js Image in use; logo previously reduced from 367 kB to ~40 kB; new photography compressed (boardroom ≈ 57 kB, poster ≈ 65 kB).
- **Caching/revalidation** `[VERIFIED]`: homepage `revalidate = 60`; services, insights, international `revalidate = 300`.
- **Core Web Vitals: `[NOT VERIFIED]`** — never measured.
- **Lighthouse: `[NOT VERIFIED]`** — never run.
- **Mobile performance: `[NOT VERIFIED]`.**
- **Standing rule:** measure a baseline before optimizing. Current figures are asset weights, not user-experienced metrics.

---

## 19. ACCESSIBILITY

- **Reduced motion:** `prefers-reduced-motion` respected `[VERIFIED in code]`.
- **RTL/LTR:** CSS logical properties throughout — no separate RTL stylesheet `[PREVIOUS DECISION, implemented]`. Direction attributes verified live (`dir="rtl"` on `/ar`, `dir="ltr"` on `/en`). The professionals page image-reversal was verified to behave correctly in RTL.
- **Contrast:** computed and corrected on at least two occasions (chips verified at 7.28:1; `#30A1D9` banned as light-background text at 2.91:1; input borders set to `#7B818E` at 3.91:1 to satisfy 1.4.11; `#484A49` documented as failing at 2.06:1 on the dark background and restricted to borders/decoration).
- **Semantic structure:** skip-link present; heading order maintained; breadcrumb nav landmark present.
- **Keyboard navigation: `[NOT VERIFIED]`** — never tested end-to-end, particularly the mega menu and multi-step form.
- **Screen reader: `[NOT VERIFIED]`** — never tested with VoiceOver/NVDA.
- **Mobile touch targets: `[NOT VERIFIED]`.**

---

## 20. CURRENT IMAGES / ASSETS

**Brand assets present** `[VERIFIED]`: `public/brand/` contains `al-aoun-mark.svg`, `logo-full-ar-color.{png,webp}`, `logo-full-en-color.{png,webp}`, `mark-watermark.png`.

**⚠️ Vector asset status — corrected after direct file inspection.** An earlier version of this brief implied broadly that no genuine vector asset exists. **That is wrong.** Precisely:

- **`public/brand/al-aoun-mark.svg` IS a genuine vector** `[VERIFIED — 5 real `<path>` elements, zero `<image>`, no base64, `viewBox` present]`. The mark is usable at any scale today.
- **Separately**, the two client-supplied lockup files (`1.svg`, `2.svg`) were inspected and found to be **raster images wrapped in an SVG container** (`<image>` + base64), not editable paths. `2.svg` (navy on light) is usable as-is and tests at 16.55:1 contrast.
- **Therefore:** the *mark* is solved; the **full official editable bilingual logo/lockup system** may still require client-provided production vector assets for free scaling or large-format print.

**Remaining brand-asset gaps** `[from the identity document]`:
- **Complete knockout version for dark backgrounds: not delivered.** What was supplied has a navy arc that nearly vanishes on the dark background (**1.1:1 — total failure**). Flagged as `[CLIENT APPROVAL REQUIRED]`: is this intended or a file defect? No answer assumed.
- Supplied files sit on an opaque grey card (`#919191`), not true transparency. Transparent-background lockups needed for every lockup variant.
- Favicon derivation (thickened flat monogram) still outstanding.
- Wordmark and Arabic/English lockup composition rules outstanding.

**Content imagery** `[VERIFIED]`:

- **43 practice-area `.webp` images** in `public/practice-areas/` — for 48 areas, so **5 areas lack imagery** (the detail page has a `hasImage()` guard).
- Team photos: `/media/founder-haitham.jpg`, `/media/team-bader-saif.jpg`.
- About page: real meeting-room photograph at `public/about/boardroom.webp` (1520×533 panoramic) in the story section, plus an autoplay office video (`office-interior.webm`/`.mp4`) in a deliberate 9:16 portrait frame with `object-fit: contain`.
- Hero: background imagery plus vector mark watermark (`HeroMarkWatermark`, `HeroImageBackground` components).

**Imagery that was criticized:** the previous About-page story image was replaced at the client's request with the real meeting-room photograph. During that exchange **Claude made a genuine error** — removing the office video the client had never asked to touch. It was fully restored, and the correct image (a different element entirely) was replaced instead.

**FULL IMAGE AUDIT — NOT VERIFIED.** No systematic review of every image for quality, licensing, datedness, or genericness has been performed. The 5 missing practice-area images are known; beyond that, treat image quality as unassessed.

**Current plan for generated premium imagery: none agreed.** Do not assume one exists.

---

## 21. OLD PACKAGES / DEPLOYMENT HISTORY

**Pre-existing features that still matter** (built before the recent phases, must not regress): FAQ page with `FAQPage` JSON-LD · newsletter subscribe in the footer · vector mark watermark · footer dark lockup · favicon and web manifest · account/member portal · full admin console · Turnstile on intake forms · Postgres rate limiting.

**Recent commit history** `[VERIFIED]`:

```
e63592d  feat(phase-c): persist consultation intent and source attribution
554797d  fix: restore office video, correct the actual story-section photo
e73fa65  fix: replace autoplay office video with static meeting-room photo
b285187  content: replace office interior poster with real meeting room photo
162cd43  refine: unified professionals page background, editorial proof lines, closing CTA
2aec128  redesign: equal-weight professional profiles on team page
843724c  feat: implement approved UX phase 1
38eea9d  fix: restore Arabic homepage encoding
```

**Destructive old apply scripts vs. current workflow — important history.** Earlier `apply.ps1` scripts in this project contained `git reset --hard`, `git clean`, and automatic commit/push. These are now **permanently banned**. Every package must be **safe review-only by default**: `check → copy → build → diff → STOP`. Running any legacy script containing those operations is prohibited.

---

## 22. GIT / DEPLOYMENT WORKFLOW

**The permanent workflow** (documented in `AI-WORKFLOW.md` and in the user's standing project instructions):

1. `git status` before touching anything. If the tree is not clean: no automatic reset, clean, or stash — surface the changes and ask.
2. Name the expected files before starting; justify any additional file before touching it.
3. Package as **safe review-only**: check clean tree → copy files → `npm run build` → show `git status` and `git diff --stat` → **STOP**.
4. Build must pass compile, lint, type checks, and static generation. Build failure → no commit, no push.
5. Verification typed by change kind (AR+EN, RTL+LTR, desktop+mobile, direct URL + navigation, success + error paths, live data).
6. Mandatory pre-commit report: what changed · files · build · verification · NOT VERIFIED items · risks.
7. **No commit or push without an explicit "GO FOR PUSH" from the user.**
8. On GO: scoped `git add` (named files only, never `-A`) → short clear commit → `git push origin main`.
9. After push: commit hash, deployment confirmation, live smoke test of affected pages.

**Absolutely banned:** `git reset --hard` · `git clean` · deleting local changes · blind overwrite · push before review · any legacy script containing auto-commit/push.

### The Arabic encoding incident — and the lesson

Commit `843724c` shipped with **corrupted Arabic** in `page.js` (double-encoded mojibake: `ظ…ظƒطھط¨` instead of `مكتب`). When the client reported it, **Claude incorrectly diagnosed it as a browser-side rendering issue** after checking a live page that was almost certainly serving a cached (correct) version. The client was right; Claude was wrong. The corruption was real, in the committed source, and the client fixed it himself in `38eea9d`.

**Lessons now permanent:**

- Never rely on a single post-deploy live check as proof — caching (`revalidate = 60` on the homepage) can show a stale-but-correct page.
- Verify the **source** at byte level, not just the rendered output.
- Never use PowerShell `Get-Content`/`Set-Content` on Arabic source files without a guaranteed encoding; prefer byte-for-byte copies.
- Run a programmatic mojibake scan after any operation touching Arabic files. This is now routine.

---

## 23. HUMAN-VERIFICATION ITEMS (before public launch)

Claude does not adjudicate any of these. Each requires Dr. Haitham or the user.

1. Founding year (2000) as an externally published claim.
2. "25+ years of experience."
3. Dr. Haitham's PhD in Constitutional Law from Cairo University (with distinction).
4. Admission before the Cassation and Constitutional courts (both professionals).
5. Chairmanship of the Scientific Advisory Council at the Kuwait Lawyers Association.
6. Bader's international arbitrator and legal mediator registrations/certifications.
7. Bader's accredited legal trainer role at the Kuwait Lawyers Association.
8. "4 accredited arbitration centres" counter claim.
9. Practice-area → UX group assignments (all 48) for legal accuracy.
10. Professional → practice-area mappings (must be created only after approval; never inferred).
11. All international positioning language — coordination vs. presence.
12. The attorney-client relationship disclaimer wording.
13. Privacy policy and terms content adequacy.
14. Compliance of all marketing copy with Kuwait legal-advertising rules.
15. Whether the logo arc vanishing on dark backgrounds is intended or a file defect.
16. Every insights article, via the `legal_approved` gate.

---

## 24. DOMAIN / EMAIL / LAUNCH STATE

**Still current: domain and email are launch-stage tasks, not done** `[VERIFIED]`.

- Production runs on `al-aoun-law-firm-legal-consultation.vercel.app`. **No custom domain.**
- Email notifications still route to a personal Gmail address — Resend is not configured for production sending from a firm domain. **This is critical: real client enquiries currently land in a personal inbox.**
- The site's displayed contact email is `Aloun.Law@gmail.com` — a Gmail address, not a firm-domain address.

**What changes at launch:** purchase domain and configure DNS · Vercel domain binding · **update the hardcoded `BASE_URL` in `robots.js`, `sitemap.js`, and `Breadcrumbs.js`** · verify Resend domain and sender · configure official firm email · canonical/hreflang confirmation against the real domain · resubmit sitemap · final claims verification · launch security QA · real-device mobile QA · accessibility pass · performance baseline · analytics/error-monitoring decision · documented backup/restore procedure.

---

## 25. COMPLETED ROADMAP

| Phase | Goal | Outcome | Commit | Verification |
|---|---|---|---|---|
| Pre-existing platform | Bilingual site, admin console, account layer, intake, FAQ, newsletter, brand assets | Live and functional | (various) | LIVE VERIFIED in use |
| Security corrective | Close client-only phone validation gap | Server-side validation in all 3 intake RPCs | DB only | SERVER VERIFIED (6 REST tests) |
| Dashboard removal | Remove admin surface from public nav | Removed from header (desktop+mobile) and confirmed absent from footer; wasted layout fetch removed | `843724c` | LIVE VERIFIED |
| BreadcrumbList | Structured breadcrumbs | JSON-LD across 6 call sites | `843724c` | LIVE VERIFIED |
| UX Phase 1 | Nav restructure, homepage restructure, expertise discovery, international 3-path, contact intent routing | All shipped | `843724c` | LIVE VERIFIED (chips, AND filter, no-results, clear-filters, all intent paths, back/forward) |
| Arabic encoding repair | Fix mojibake in homepage source | Restored | `38eea9d` | LIVE VERIFIED |
| Professionals redesign | Equal institutional weight | Replaced hero+small-card asymmetry | `2aec128` | LIVE VERIFIED |
| Professionals refinement | Unified background, editorial proof lines, closing CTA | Shipped | `162cd43` | LIVE VERIFIED |
| Imagery correction | Real firm photography in story section; video restored | Shipped | `b285187`, `e73fa65`, `554797d` | LIVE VERIFIED |
| **Phase C** | Persist intent + source attribution | 4 columns, RPC rebuilt with server-side derivation/validation, attribution on 3 CTA surfaces | `e63592d` + 3 migrations | **PASS WITH TOOL LIMITATION** (3 flows LIVE VERIFIED, remainder SERVER VERIFIED, 2 TOOL INCONCLUSIVE) |

---

## 26. CURRENT ROADMAP

### Execution sequence (revised after ChatGPT review)

| # | Item | Notes |
|---|---|---|
| **0** | **AI Governance + Documentation Sync** | These documents + README/package rewrite (see §36 Documentation Drift) |
| **1** | **Mobile Reality Baseline** | **Moved ahead of Path Finder** — see reasoning below |
| **2** | **Legal Path Finder** | Phase B — largest UX gap |
| **3** | **Admin Attribution / Intake Operations** | Phase I — depends on Phase C ✅ |
| **4** | **Unified Search** | Phase H — `search_site` extension |
| **5** | **Professionals ↔ Expertise Approval** | Phase E — gates #6 |
| **6** | **Expertise 2.0** | Phase D — depends on #5 and #7 |
| **7** | **Insights Launch** | Phase G — **content preparation runs in parallel from now**, since the blocker is human/legal, not engineering |
| **8** | **International 2.0** | Phase F — trust copy sharpening |
| **9** | **Security + Privacy Hardening** | Phase J — staged CSP, salt hardening, retention policy |
| **10** | **Accessibility + Performance** | Phases L + M |
| **11** | **Launch Gate** | See §24 — domain, email, Resend, hardcoded URLs, claims verification |

### MOBILE REALITY BASELINE — why it moved to #1

The previous brief marked mobile verification P0 but scheduled it late. That was a genuine contradiction. **The Legal Path Finder is explicitly mobile-first, so it must not be designed against unverified responsive assumptions.**

Scope of the baseline (deliberately narrower than a full launch audit):

- Real or properly supported viewport validation
- Major navigation (including the mega menu and mobile accordion)
- Contact flow end-to-end
- Typography and spacing at mobile sizes
- CTA and touch-target behavior
- RTL/LTR sanity check

The **full** accessibility audit (keyboard, screen reader) remains at #10. This is the minimum needed to design responsibly, not the complete pass.

### Launch Gate — reclassified

**Custom domain · official firm email · production Resend configuration** were previously listed under development P0. They are now **Launch Gate / Production Readiness**.

Reasoning: they are **commercially critical before launch** — notifications currently route to a personal/test Gmail address, which is a real operational exposure — but they **do not block any current product-development phase**. Nothing in #1–#10 waits on the domain.

### Dependencies

`C ✅ → I` · `E → D` · `G → Article schema` · `G → D (insights surfaces)` · `Mobile Baseline → Path Finder`. Insights content preparation is parallel throughout.

### Explicit constraints on this roadmap

- Do **not** build a professionals CMS at current team size.
- Do **not** invent partner relationships.
- Do **not** build an Industries taxonomy until real data justifies it.

---

## 27. LEGAL PATH FINDER

**Status: PLANNED — NOT IMPLEMENTED.** Zero code exists.

**Why it exists.** A visitor faces 48 practice areas and 3 international paths. The largest real audience segment cannot name their own legal domain. Every current entry point assumes they can. Benchmark firms (Kim & Chang, Latham) lead with "what do you need?" *before* the taxonomy, not after.

**Deterministic, not AI.** No LLM, no API call, no new dependency. A hand-authored rule table in code.

**Intended questions:**

1. **Where is the matter?** Kuwait · Outside Kuwait · Multiple countries · Not sure
2. **Who are you?** Individual · Company · Investor/business owner · Law firm/professional *(this answer short-circuits directly to the "Work with AL OUN" path, skipping Q3)*
3. **Roughly what kind of matter?** Dispute/case · Company/transaction · Contract · Employment · Real estate · Finance · Regulatory/compliance · Technology/data · Arbitration · Other/not sure

**Intended routing output:** 1–3 suggestions drawn from practice areas, international path, contact intent, and referral path.

**Non-negotiable safety constraints:**

- Never provides legal advice.
- Never diagnoses the matter.
- **Never outputs a single definitive answer** — always 1–3 suggestions.
- Always labelled with fixed copy: *"هذا توجيه أولي لا يُعدّ استشارة أو تصنيفًا نهائيًا للمسألة."*
- Bilingual, mobile-first, keyboard-accessible with `aria-live` result announcement.

**Data model:** `src/lib/path-finder-rules.js` — a `ROUTING_TABLE` of `{ when: {...}, result: {...} }` entries. Code rather than database because the rule count is small (~30–40 combinations), the rules are stable, and — critically — **legal review is easier on a reviewed code file than through a new admin UI**. Migratable to the database later only if rule complexity genuinely grows.

**Approval requirement:** **every routing rule requires Dr. Haitham's approval**, on the same basis as the practice-area groupings. Rules must not be inferred.

**Relation to Phase C:** Phase C is the prerequisite that makes the Path Finder *measurable*. Once it ships, its outputs can carry `intent` and `from`, so the firm will be able to see whether guided routing actually produces better-qualified enquiries. This is precisely why Phase C was recommended and executed **first**, ahead of the more visible feature.

---

## 28. WHAT WE SHOULD NOT BUILD YET

Intentionally deferred, with reasons:

- **Industries/sectors taxonomy** — no real sector data exists; it would be an invented second axis.
- **Professionals database + CMS** — 2 professionals; migration, RLS, and admin UI cost is unjustified. Revisit at ~4–5.
- **Paid search service (Algolia/Elastic)** — content volume does not remotely justify it; `search_site` extends trivially.
- **Public partner directory** — zero approved partnerships. Building the UI invites filling it with fiction.
- **Full CRM in admin** — existing stage/assignment/notes fields already cover most of the real need. Build the console, not a CRM.
- **Any unverified content** — no articles, credentials, mappings, or claims ahead of human approval.
- **Practice-area categories in the database** — code-level grouping is sufficient and easier to legally review.
- **New schema entities in anticipation of growth** — the `network`/`ops`/`portal` separation already absorbs growth. No speculative entities.
- **CSP enforcement without a Report-Only measurement phase.**
- **Performance optimization before a measured baseline.**

---

## 29. KNOWN TOOL LIMITATIONS

**These are tooling failures, not site defects. They must never be reported as site failures.**

- **Claude in Chrome instability** — screenshot capture (`Page.captureScreenshot`) times out intermittently across tabs; the extension has disconnected entirely for multi-minute periods on several occasions; tab renderers freeze. Mitigation found: `read_page` and `javascript_exec` often keep working when screenshots fail, and are more reliable evidence.
- **Turnstile under automation** — Cloudflare Turnstile is deployed and has **successfully completed real submissions during prior live QA**. In some automated browser sessions it failed to initialize; **those cases are TOOL INCONCLUSIVE and are not evidence of either a site failure or a successful bot rejection.** Reliable check when investigating: read the hidden `input[name="cf-turnstile-response"]` value directly — an empty value proves no token was issued, without depending on a screenshot.
- **Local Supabase connectivity** — the local sandbox cannot reach Supabase, so data-driven pages return 404 locally. Local verification of those pages is `BUILD VERIFIED` only, never `LIVE`.
- **Mobile viewport emulation** — unavailable. Mobile remains genuinely `NOT VERIFIED`.
- **Git index artifacts** — locally created files can show phantom `git status` differences. Always confirm with a direct content diff against `origin/main`.
- **`javascript_exec` cross-realm limitation** — setting React-controlled input values via the native setter throws "Illegal invocation"; use `find` + `form_input` instead.

**`TOOL INCONCLUSIVE` ≠ `FAILED`.** The former means we could not observe; the latter means we observed something broken. Never merge them.

---

## 30. CURRENT REPO STATE `[VERIFIED at time of writing]`

- **Branch:** `main`
- **HEAD (`origin/main`):** `e63592df39ae79899c54291e69e9c9a0af4c9706` (`e63592d`) — *"feat(phase-c): persist consultation intent and source attribution"*
- **Uncommitted changes:** new **untracked** documentation files only — `AI-HANDOFF.md`, `AI-WORKFLOW.md`, and this brief (`AI-SYNC-BRIEF.md`). **Not committed, not pushed.** Zero application code, zero DB, zero schema differences. Verified by direct content diff against `origin/main` on sampled source files (0 lines differ).
- **Test data:** zero test records remain in the database (verified by direct query).
- **Nothing is actively being implemented.**

---

## 31. CONTRADICTIONS / CORRECTIONS

**This section is deliberately blunt. These are things Claude got wrong or that turned out different from earlier assumptions.**

1. **Arabic encoding misdiagnosis — Claude's error.** Claude told the client the mojibake was a local browser/cache issue. It was real corruption in committed source. Cause: a live page was checked that was serving cached correct content, and that was treated as proof. The client was right.
2. **Removed a video that was never in scope — Claude's error.** Asked to replace an image, Claude replaced the *poster* of an autoplay video, then removed the video entirely when the poster change had no visible effect. The client had asked about a completely different image (`boardroom.webp` in the story section). Video restored; correct image replaced.
3. **`preferred_locale` CHECK constraint — claimed missing. It existed.** Reported as "NOT VALIDATED" based on a compound query whose result was misread. The constraint `CHECK (preferred_locale = ANY (ARRAY['ar','en']))` pre-existed Phase C. The attempted migration failed with "constraint already exists," which is how it was discovered. (The RPC-level *normalization* added was still worthwhile — the constraint alone would reject the whole request rather than degrade gracefully.)
4. **`PUBLIC` EXECUTE grant — a wrong assumption, caught by verification.** The original Phase C plan asserted "zero GRANT changes." In fact `CREATE FUNCTION` after `DROP` grants EXECUTE to `PUBLIC` by default. The user's insistence on mandatory post-execution privilege verification is the only reason this was caught. Revoked and registered as its own migration.
5. **`CREATE OR REPLACE` overload risk — corrected before execution, not after.** The initial migration design assumed replacement. The user flagged it; verification against PostgreSQL documentation confirmed that different argument types create an *overload*. The design changed to explicit `DROP` + `CREATE` + `GRANT`.
6. **Jurisdiction count: 11, not 10.** An earlier strategic document said 10. Direct query says 11.
7. **`practice_area_id` fallback direction — reversed after challenge.** Claude first proposed `coalesce(p_practice_area_id, v_resolved)`, which would have let an unverified client UUID win over server-resolved context. The user caught the contradiction with Claude's own stated principle. Corrected to server-resolved only.
8. **`supabase/migrations/` folder — does not exist.** Any assumption that this project uses conventional migration files is wrong. The registry inside Supabase is the source of truth.
9. **Broken-image false positive.** A programmatic check (`naturalWidth === 0`) reported a broken image on `/international`. Visual inspection proved it was fine — likely a Next.js blur placeholder artifact. Not logged as a bug.
10. **Superseded visual direction.** The professionals page went through two versions in quick succession; the light/dark alternating-section version (`2aec128`) is superseded by the unified-background version (`162cd43`). Do not treat the intermediate state as current.
11. **The official ink color changed.** `#2A3F91` (PNG-derived) and `#111A31` (estimate) are both obsolete. `#141E36`, measured from the client's SVG files, is the official ink.

---

## 32. FINAL END-STATE VISION (1–2 years)

### The label: **AL OUN Digital Legal Platform**

Use this one label consistently. Not "website", not "legal front-office system", not "portal" — one name, four connected layers:

| Layer | What it is |
|---|---|
| **1. Institutional Presence** | Credibility through restraint and real substance — the firm as an institution, not a personal brand |
| **2. Legal Discovery** | Getting a visitor who lacks legal vocabulary to the right expertise: guided routing, grouped browsing, unified search |
| **3. Structured Intake** | Attributed, conflict-check-aware, minimum-data request capture that produces triageable matters |
| **4. Legal Operations** | The internal console where those matters are tracked, assigned, and audited |

**Knowledge / Insights** and **International Coordination** are not separate layers — they **grow across all four**: insights strengthen presence and feed discovery; international coordination shapes discovery, intake routing, and operations alike.

**Explicitly excluded from this definition:** AI legal advice, automated legal diagnosis, client-facing analysis engines, chatbots.

### What each layer looks like when mature

**Expertise discovery.** A visitor arrives without legal vocabulary and reaches the right practice area in under a minute — through guided routing, grouped browsing, or unified search. The 48 areas are an asset rather than a wall.

**Knowledge.** A genuine, legally approved insights library where each piece connects to its practice area and its author, feeding related-content surfaces across the site. Modest in volume, real in substance. This is the firm's most credible proof of expertise.

**International coordination.** Three journeys, operationally supported: inbound Kuwait counsel with clear intake; outbound coordination with jurisdiction-aware routing; and a partner relationship layer that is only ever populated with *verified, approved* relationships. Honest coordination, precisely stated, is more credible to a foreign firm than an inflated network claim.

**Structured intake.** Every enquiry arrives with intent, source, and context attached; conflict-check-aware; minimum-data; routed to the right person automatically. The firm can see which surfaces produce which matters and act on it.

**Client/account layer.** The existing member portal matures into a place where an existing client tracks their matters and exchanges documents securely — building on `matters` and `matter_files`, which already exist.

**Operational workflows.** An operations console (not a CRM) where each request has status, assignment, internal notes, conflict-check state, and a full audit trail.

**Security and privacy.** RLS-first, minimum-data-by-design, CSP enforced after staged measurement, documented and tested backup/restore, retention policy in force, CITRA obligations verified and met.

**Scalable growth.** Adding professionals, jurisdictions, languages, or content requires *adding data*, not re-architecting. The four-schema separation already makes this true.

**Reputation and trust.** Trust from verified substance and visible process — conflict check explained, confidentiality stated, honest empty states, no dead ends — and never from urgency, scarcity, or manufactured social proof.

**Explicitly not part of this vision:** AI legal advice, chatbots, client-facing automated analysis, fabricated international presence, or any feature added because it sounds impressive.

---

## 33. WHAT CHATGPT SHOULD FOCUS ON

- **Product priorities** — is Legal Path Finder genuinely the right next build, or does insights content deserve to jump ahead given it's the deeper credibility gap?
- **UX architecture** — the Path Finder's question sequence and result presentation; how Expertise 2.0 should connect practice areas, professionals, and insights without inventing relationships.
- **Global benchmarking** — what Kim & Chang, Freshfields, Linklaters, Clifford Chance, Latham, and White & Case do structurally that applies at a 2-professional scale, and what emphatically does not.
- **Security architecture second review** — particularly the CSP rollout plan, the unverified areas (storage policies, JWT/session, CORS, backup/restore), and whether the attribution trust model is stated strongly enough.
- **International credibility** — the exact language separating "coordination" from "presence" in a way a foreign firm reads as honest rather than evasive.
- **Image and visual quality** — a real audit is missing. The 5 practice areas without imagery, the outstanding brand assets, and overall photographic quality need a strategic view.
- **Acceptance criteria** — define these *before* implementation for each remaining phase. This has been a recurring gap.
- **Avoiding overengineering** — actively police §28. Pressure toward premature CMS, taxonomies, and directories is the main risk to this project's integrity.
- **Launch readiness** — sequencing domain, email, hardcoded URL updates, claims verification, and QA passes into a coherent launch plan.

---

## 34. WHAT CLAUDE SHOULD FOCUS ON

- Repository inspection and source-of-truth verification (`origin/main`, never memory).
- Code implementation, strictly scoped to approved work.
- Supabase inspection: `pg_proc`, `information_schema`, `pg_constraint`, RLS state, grants.
- Migration design and execution — with mandatory post-execution verification of signatures, grants, `PUBLIC` execute, and constraints.
- Exact diffs and precise, honest change reports.
- Builds.
- Live browser verification when tooling permits, with accurate classification when it does not.
- Regression checks.
- Arabic encoding byte-level verification after every operation touching Arabic files.
- Stopping and escalating rather than assuming.

---

## 35. TOP 10 FACTS CHATGPT MUST NOT MISS

1. **`origin/main` is `e63592d`. Phase C is complete and live — PASS WITH TOOL LIMITATION. Nothing is currently in progress**, and the only uncommitted files are new untracked governance documents.
2. **There are exactly 2 real professionals, stored in code (`src/lib/team-data.js`), not in a database** — and this is a deliberate, correct decision at this scale. Do not propose a professionals CMS.
3. **48 practice areas are real and live, but their 10 UX groupings are code-only and NOT legally approved.** No `category_id` column exists. Dr. Haitham's approval is required before treating the grouping as authoritative.
4. **Zero insights articles exist.** The infrastructure is complete and the homepage section is deliberately hidden. This is the deepest credibility gap, and the blocker is human content, not engineering.
5. **Zero partner firms exist, and `network.partner_firms` stays empty until a real partnership is approved.** International positioning is coordination-only — never offices, never licensed foreign practice. The jurisdictions list (11, not 10) proves coordination scope, not relationships.
6. **This project has NO `supabase/migrations/` folder.** The migration source of truth is `supabase_migrations.schema_migrations` inside Supabase. Any plan assuming migration files is wrong.
7. **Phase C attribution (`source_route`/`source_type`) is analytics metadata ONLY** — never authorization, RLS, privilege, legal-eligibility, or trusted audit evidence. This is documented inside the SQL function itself and must be preserved.
8. **The Vercel preview URL is hardcoded as `BASE_URL` in three files** (`robots.js`, `sitemap.js`, `Breadcrumbs.js`). If the domain launches without updating all three, robots, sitemap, and BreadcrumbList JSON-LD will all point at the preview domain.
9. **Real client enquiries currently arrive at a personal Gmail address.** No custom domain, no production Resend configuration. This is arguably the most commercially urgent unresolved item.
10. **Mobile is genuinely NOT VERIFIED — it has never been tested on a real device or viewport.** Along with keyboard and screen reader testing, this is a real launch risk, not a formality. And the vocabulary distinction matters throughout this brief: `TOOL INCONCLUSIVE` never means the site failed.

---

---

## 36. DOCUMENTATION DRIFT `[VERIFIED — new, raised by ChatGPT review]`

**The repository's own documentation contradicts the production application.**

**`README.md`** still opens with *"مجموعة العون — نموذج بصري أولي"* (initial visual prototype) and describes the repository as *"a two-page visual model (homepage + one practice-area template) — before building the component system and the full site. It is not intended to be the final site."* `[VERIFIED — read directly]`

It also contains statements that are now obsolete: that no real logo file exists (a genuine vector mark now exists), that only 6 dependencies are used (there are 10), and a dependency table reflecting a prototype scope.

**`package.json` `description`** reads: *"مجموعة العون — الموقع الإلكتروني. نموذج بصري أولي (صفحتان: الرئيسية + مجال ممارسة) قبل بناء نظام المكوّنات الكامل."* `[VERIFIED]`

**Reality:** 43 routes, full admin console, member portal, four database schemas, 48 live practice areas, three intake RPCs, Phase C attribution — a production application, not a prototype.

**Status:**
- **README REWRITE — REQUIRED**
- **PACKAGE DESCRIPTION UPDATE — REQUIRED**

**Neither file was changed in this task, by instruction.** This section documents the drift only. Both belong in roadmap item #0 (AI Governance + Documentation Sync).

**Why this matters beyond tidiness:** `README.md` is the first thing a new contributor, auditor, or reviewing AI reads. Left as-is, it actively teaches wrong assumptions about project maturity and scope.

---

## 37. SECURITY HARDENING FOLLOW-UP — P1, NOT A BLOCKER

Raised by ChatGPT review. **Neither item was modified in this documentation task.**

### 37.1 IP hash salt fallback `[VERIFIED]`

`src/app/actions/consultation.js:13`:
```js
const salt = process.env.IP_HASH_SALT || 'al-aoun-default-salt';
```

If `IP_HASH_SALT` is unset in production, the code **silently falls back to a predictable, known static salt**.

**What this actually weakens (corrected wording):** hashing itself remains **one-way** — the salt is not what makes it irreversible. The salt protects against *guessing*. The IPv4 space is small enough to enumerate, so with a **known** salt an attacker can hash candidate IPs and match them against stored values — a dictionary/brute-force attack. A secret, unpredictable salt makes that infeasible. A predictable one therefore **weakens pseudonymization**, not the hash function.

**Recommended hardening:** prefer a **required production secret** — fail loudly (or refuse to hash) rather than degrading silently to a predictable value. Silent fallback to a weaker security posture is the specific anti-pattern here.

**Classification:** P1 hardening. Not a blocker, and not evidence of a current breach — but it should not survive to launch.

### 37.2 Resend HTML escaping `[NOT VERIFIED]`

User-provided values are interpolated into internal notification HTML sent through Resend. **Escaping and safe rendering have not been reviewed.** The audience is internal (firm staff), which lowers but does not eliminate the concern — HTML injection into an internal notification is still an injection.

**Action required:** review interpolation points and confirm proper escaping. **Not yet inspected — do not assume it is safe.**

---

**SYNC STATUS:
READY FOR CHATGPT FINAL REVIEW**
