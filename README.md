# Portfolio Delivery Control Tower

An evidence-bound operating workspace for portfolio leaders to detect when commitments, staffing, work in progress, financials, risks, and decision authority no longer agree.

This repository is a real, runnable product vertical—not a landing-page mockup. It ships a deterministic health engine, typed service/API boundaries, synthetic adapters, an accessible multi-view interface, authority controls, scope invalidation, audit receipts, tests, and operator documentation.

> Evidence boundary: the workflow and data are synthetic. This project does not claim employer affiliation, customer demand, production deployment, commercial outcomes, users, revenue, or access to any target company's systems or data.

## The problem

Portfolio reviews often ask each function to restate its own status while the material failure lives between those systems: a commitment is still visible, but the estimate is invalid; staffing is approved, but for the wrong scope; a forecast moved, but nobody classified why; a decision is overdue, but has no authority owner.

The Control Tower makes those joins explicit:

```text
commitment → scope → estimate → staffing → WIP → risk → decision → outcome → learning
```

## Primary user

The primary user is a portfolio director coordinating project, account, resource, functional, finance, and executive stakeholders. Each stakeholder keeps their existing authority. The product exposes the shared operating contract and prevents software or AI from silently assuming consequential authority.

## Implemented workflow

1. The portfolio opens `UNKNOWN` because the financial source is nine days old and unvalidated.
2. The evidence inspector shows the exact source version and deterministic reason.
3. A mocked, atomic import validates a current synthetic snapshot.
4. Health recalculates into the actual threshold result—`AT RISK` or `WATCH`, never automatic green.
5. The review workspace records a portfolio tradeoff with separate submitter and approver identities.
6. A stable receipt preserves source versions, authority, next action, and digest.
7. The proof workspace distinguishes implemented local evidence, proposed persistence, and remaining unknowns.

## Architecture

```text
Next.js 16 App Router + React 19 + TypeScript
                │
        typed service boundary
                │
 deterministic domain core (health, validation,
 scope invalidation, receipts, import transaction)
                │
 synthetic adapter [implemented] ┆ Supabase adapter [schema only]
```

- Tailwind CSS v4 and shadcn-style Radix primitives provide the interface layer.
- Zustand owns reversible local demo state.
- React Hook Form + Zod enforce review authority and field contracts.
- Versioned Next.js route handlers expose portfolio and review boundaries.
- The proposed Supabase migration uses RLS on every table, composite tenant/parent keys, role-scoped writes, and append-only decisions/receipts/audit events.

See [architecture](docs/architecture.md), [security and privacy](docs/security-privacy.md), and the [operator runbook](docs/operator-runbook.md).

## Deterministic / AI / human authority

| Layer | Allowed |
|---|---|
| Deterministic software | Health, source freshness, thresholds, blocked-work completeness, import validation, scope invalidation, receipt generation |
| AI — proposed, not connected | Draft neutral summaries from already accepted records; suggest review questions |
| Human | Scope, estimate approval, staffing allocation, financial classification, client commitments, high-risk approvals, risk closure, lesson promotion |

AI cannot alter calculations, approvals, source history, or receipts.

## Reproducible demo

```powershell
git clone https://github.com/shrishmanglik/portfolio-delivery-control-tower.git
cd portfolio-delivery-control-tower
git switch dev/portfolio-delivery-control-tower-initial-build
npm.cmd ci
npm.cmd run dev
```

Open `http://localhost:3000/portfolio`, follow the seven implemented workflow steps above, then inspect `/proof`.

The implemented workflow needs no `.env` file, credential, provider account, or external data.

## Quality gates

```powershell
npm.cmd run test
npm.cmd run test:mutation
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

The mutation control disables the source-integrity detector, requires the critical suite to fail, restores the detector, and requires the clean control to pass. The repository also tests complete nested-import validation, rejected-import rollback, high-risk separation of duties, blocked-work completeness, scope invalidation, stable receipts, synthetic-data boundaries, tenant-bound foreign keys, role-aware RLS writes, and RLS-checker mutations.

## Security and privacy

- Synthetic fixtures only; every account is visibly marked `(synthetic)`.
- No credentials, provider configuration, customer identifiers, or production endpoints.
- Least-privilege tenant boundary in the proposed persistence contract.
- RLS enabled for every proposed table; role-aware writes and tenant-bound parent keys are checked by a mutation-sensitive deterministic test.
- High-risk self-approval rejected in Zod and by a proposed SQL constraint.
- Review receipts and audit events are append-only in the proposed schema.
- Retention, SSO, residency, regulatory classification, and export policy remain `UNKNOWN` pending an owning organization's decisions.

## Commercial hypothesis

Complex client-service portfolios may pay for a review layer that finds cross-system contradictions without replacing systems of record. This is a hypothesis, not demand proof. No customer interviews, willingness-to-pay evidence, users, revenue, or outcomes are claimed. See [commercial hypothesis](docs/commercial-hypothesis.md).

## Implemented versus proposed

| Capability | State |
|---|---|
| Synthetic three-engagement vertical | Implemented and locally testable |
| Deterministic health with reasons | Implemented and mutation-tested |
| WIP, resources, financials, risks, reviews, learning, proof views | Implemented |
| Stable local review receipt | Implemented; not a cryptographic signature |
| Import rejection with last-accepted rollback | Implemented |
| Supabase relational schema and RLS policies | Proposed source contract; not applied |
| Authentication, SSO, external adapters, provider observability | Proposed / `UNKNOWN` |
| Runtime AI assistance | Not implemented |
| Deployment, customers, demand, revenue, outcomes | `UNKNOWN` |

## Roadmap

1. Obtain operator validation using redacted, authorized schemas—not target-company data.
2. Threat-model and independently review the Supabase adapter before applying it.
3. Implement authenticated tenant roles and provider-backed import idempotency.
4. Add signed SHA-256 receipt envelopes after the owning security authority defines key management.
5. Measure whether operators reach material decisions faster or with fewer unsupported commitments; do not claim value before that evidence exists.

## Repository evidence

- Blueprint digest and publication boundary: [docs/blueprint-digest.md](docs/blueprint-digest.md)
- Architecture and rollback: [docs/architecture.md](docs/architecture.md)
- Operator workflow and recovery: [docs/operator-runbook.md](docs/operator-runbook.md)
- Security and privacy: [docs/security-privacy.md](docs/security-privacy.md)
- Evidence manifest: [docs/evidence-manifest.md](docs/evidence-manifest.md) (completed at PR handoff)
- Interactive build report: [docs/reports/latest.html](docs/reports/latest.html) (self-contained and offline-safe)

## License

Source-visible portfolio work sample. No open-source license is granted by this repository.
