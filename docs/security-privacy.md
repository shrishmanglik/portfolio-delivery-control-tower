# Security and privacy boundary

- All shipped fixtures are synthetic and visibly labelled.
- No employer, customer, patient, campaign, credential, or production-system data is included.
- No provider is connected and no authentication claim is made.
- The proposed Supabase schema uses tenant IDs, least-privilege membership checks, RLS on every table, append-only receipts, and append-only audit events.
- High-risk decisions cannot be self-approved in both Zod validation and the proposed database constraint.
- Browser URLs and logs do not contain restricted record payloads or secrets.
- Retention, data residency, SSO, regulatory classification, and export policy remain `UNKNOWN` until an owning organization defines them.

The receipt digest used by the local demo is deterministic integrity evidence, not a cryptographic signature. A production adapter should use SHA-256 or a signed ledger after the security authority defines its threat model.
