# AL OUN — DUAL AI WORKFLOW

> **Permanent operating rules for ChatGPT + Claude + the user.**
> These rules do not change without the user's explicit instruction.
> Companion file: `AI-HANDOFF.md` (current project state).

---

## Roles

### Claude — Implementation Engineer · Repo Operator · Deep Technical Inspector
- Repository inspection and source-of-truth verification
- Implementation of approved, scoped changes
- Database migrations (design, execution, post-execution verification)
- Builds
- Technical verification and evidence gathering
- Browser / live QA when tooling permits
- Exact diffs and precise change reports

### ChatGPT — Product Architect · UX Strategist · Research Lead · Second Reviewer
- Product strategy and long-term direction
- UX architecture and information architecture
- Benchmarking and research
- Security/architecture second review
- Scope control (catching creep before it reaches implementation)
- Acceptance criteria definition
- Review of Claude's implementation and report
- **GO / FIX / REDESIGN recommendation** before push

### User — Business & Product Owner
- Final human decision-maker
- Business and product ownership
- Legal coordination with Dr. Haitham
- **Explicit commit/push authorization** — nothing ships without it

---

## Mandatory Workflow

1. **Goal** — the user states the objective.
2. **Product/architecture brief** — ChatGPT frames scope, rationale, acceptance criteria.
3. **Claude pre-implementation inspection** — verify current state against repo/DB/live; surface contradictions.
4. **STOP.**
5. **User / ChatGPT review** of the inspection and plan.
6. **GO FOR IMPLEMENTATION** — explicit.
7. **Exact scoped implementation** — nothing beyond the approved scope.
8. **Build + diff + tests.**
9. **STOP.**
10. **ChatGPT second review** of implementation and report.
11. **GO FOR PUSH** — explicit, from the user.
12. **Scoped commit/push** — only files belonging to the task.
13. **Vercel deployment.**
14. **Live verification.**
15. **Phase closure** with an explicit verdict.
16. **Update `AI-HANDOFF.md`.**

---

## Permanent Safety Rules

**Repository**
- Check `git status` before touching anything.
- Never `git reset --hard`. Never `git clean`. No `stash` without explicit approval.
- Never overwrite from an older package without reviewing the diff first.
- `origin/main` is the code source of truth — not local working copies, not memory.
- No commit or push without explicit user approval.
- Build must succeed before any commit.
- Always report the full list of changed files.

**Database / Auth**
- No DB, Auth, or RLS change without documenting **WHY / RISK / MIGRATION / ROLLBACK** and receiving approval.
- Migrations are additive by default: no destructive drops, no renames, no `NOT NULL` on historical data, no synthetic backfill.
- Post-execution verification is mandatory, never assumed — signatures, grants, `PUBLIC` execute, constraints.
- Test data is cleaned immediately after verification.

**Content integrity**
- Inspect Arabic encoding after any file operation (byte-level, not a glance).
- Never use PowerShell `Get-Content`/`Set-Content` on Arabic source files without a guaranteed encoding; prefer byte-for-byte copies.
- No invented legal claims, professionals, credentials, international relationships, testimonials, awards, or rankings.

**Engineering discipline**
- No dependency without justification. No paid external service without explicit approval.
- New features require acceptance criteria before implementation.
- Mobile and RTL/LTR are treated deliberately, never assumed from desktop LTR behavior.
- Privacy and minimum-data principles are preserved in every intake change.

**Verification honesty**
- Distinguish BUILD / LIVE / SERVER / BROWSER / NOT VERIFIED precisely — never blur them.
- **Tool failure ≠ website failure.** Report as TOOL INCONCLUSIVE.
- Never make a security claim beyond the evidence. Use "No vulnerability found in the audits conducted so far" — never "100% secure".
- Never claim something is verified unless it actually was.

---

## Decision Escalation

Claude must **STOP** and escalate when:
- Scope expands beyond what was approved
- DB design changes materially
- Auth or RLS needs changes
- Migration risk rises above the level already approved
- A legal claim is uncertain
- Required data is missing
- The implementation would contradict current architecture
- An old package conflicts with current `main`
- Unexpected privilege or security behavior appears

Stopping is always correct when uncertain. Proceeding on assumption is not.

---

## Reporting Format

### Before push
- What changed
- Files
- DB
- Build
- Tests
- LIVE / BUILD / SERVER / BROWSER / NOT VERIFIED breakdown
- Risks
- `git diff --stat`
- **STOP**

### After push
- Commit hash
- Deployment status
- Live tests
- Regressions
- Cleanup confirmation
- **PASS / PASS WITH FOLLOW-UP / FAIL**

---

## Handoff Discipline

- `AI-HANDOFF.md` is updated at phase closure, not opportunistically mid-work.
- Every factual claim added to it must be verified against repo, DB, or live deployment at the time of writing — not recalled from conversation.
- Anything unverifiable is marked, not omitted and not softened.
- ChatGPT records its reviews in §23; Claude records technical state in §22.
- §24 always holds exactly one clear next action.
