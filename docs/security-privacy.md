# Security and privacy boundary

- All shipped fixtures are synthetic and visibly labelled.
- No employer, customer, patient, campaign, credential, or production-system data is included.
- No provider is connected and no authentication claim is made.
- The proposed Supabase schema uses composite tenant/parent foreign keys, role-scoped write policies, RLS on every table, and append-only decisions, receipts, and audit events.
- Decision writes bind both submitter and approver to permitted roles in the same tenant; receipt keys bind the decision and engagement identities together.
- High-risk decisions cannot be self-approved in both Zod validation and the proposed database constraint.
- Browser URLs and logs do not contain restricted record payloads or secrets.
- The lockfile pins patched PostCSS and Sharp transitive versions; `npm audit --audit-level=high` returns zero known vulnerabilities at build time.
- Retention, data residency, SSO, regulatory classification, and export policy remain `UNKNOWN` until an owning organization defines them.

The receipt digest used by the local demo is deterministic integrity evidence, not a cryptographic signature. A production adapter should use SHA-256 or a signed ledger after the security authority defines its threat model.
