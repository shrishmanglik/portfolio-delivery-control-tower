# Operator runbook

## Primary workflow

1. Open `/portfolio`. Every engagement begins `UNKNOWN` because the synthetic finance source is stale and unvalidated.
2. Select a row and inspect its source version and deterministic reasons.
3. Choose **Validate latest snapshot**. The mocked adapter accepts a current synthetic snapshot atomically.
4. Confirm health recalculates into `AT RISK` or `WATCH` rather than becoming green by default.
5. Open `/reviews`, inspect source versions, and record the prepared high-risk tradeoff decision.
6. Confirm a receipt appears with different submitter/approver identities and a stable digest.
7. Open `/proof` and verify the boundary between implemented local evidence, proposed persistence, and UNKNOWN provider/commercial truth.

## Error, retry, and rollback

- Import validation failure: return row-level errors and preserve the last accepted snapshot.
- Render/runtime failure: the application error boundary states that the accepted state was preserved and offers retry.
- Rejected high-risk decision: no receipt is emitted; field-level authority errors remain visible.
- Demo rollback: **Reset synthetic demo** restores the original accepted fixtures and removes local receipts.
- Provider outage: not exercised because no provider is connected; the interface contract requires last-validated values plus timestamps and disables unsupported freshness claims.

## Local commands

```powershell
npm.cmd ci
npm.cmd run test
npm.cmd run test:mutation
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```

No `.env` file is required for the implemented synthetic workflow.
