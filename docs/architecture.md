# Architecture

## Decision

The implemented vertical is a Next.js 16 application with a deterministic domain core, typed service boundaries, a synthetic in-memory adapter, and an unapplied Supabase persistence contract.

The browser never decides portfolio health. `src/domain/health.ts` calculates it from explicit inputs and configured thresholds. Zod validates blocked work and separation of duties. Scope changes produce an explicit invalidation receipt. Review decisions produce canonical, stable local digests.

## Boundaries

```text
Next.js routes and accessible UI
        |
typed portfolio service
        |
deterministic domain controls
        |
synthetic adapter (implemented) | Supabase adapter (schema proposed, not connected)
```

- `app/api/v1/portfolio`: versioned read boundary over the synthetic accepted snapshot.
- `app/api/v1/reviews`: validates authority and returns a review receipt or field errors.
- `src/domain`: framework-free calculations, validation, invalidation, and receipt generation.
- `src/store`: client-only demo orchestration; resetting cannot modify an external system.
- `supabase/migrations`: proposed relational/tenant contract. It has not been applied anywhere.

## Deterministic / AI / human split

| Layer | Authority |
|---|---|
| Deterministic software | Validation, health calculation, thresholds, scope invalidation, receipt digest, source freshness |
| AI (proposed only) | Draft neutral summaries from already accepted records; never changes calculations or approvals |
| Human | Scope, staffing, finance classification, client commitment, high-risk approval, risk closure, lesson promotion |

## Reversibility

The live demo is fixture-backed and can reset without loss. A rejected import leaves the last accepted array unchanged. Proposed database receipts use linked corrections and deny updates/deletes to authenticated users. No migration was run and no provider was changed.

## Rejected alternatives

- AI-generated health summaries: rejected because inference cannot be operating authority.
- Browser-only untyped calculations: rejected because they create multiple truth implementations.
- Real provider integration for a portfolio artifact: rejected because credentials, customer systems, and private data are outside authority.
