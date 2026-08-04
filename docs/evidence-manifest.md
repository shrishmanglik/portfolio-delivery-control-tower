# Evidence manifest

Generated for PR review on 2026-08-01 and reconciled after merge/deployment on 2026-08-03. Each evidence layer has a separate claim ceiling.

## Local implementation truth — VERIFIED

| Claim | Evidence |
|---|---|
| Clean starting branch | Clone of public `main` at `51e032cf1401e7dbdab626836fd2ede39a5b0010`; initial status contained no changes |
| Blueprint read completely | SHA-256 `E5F67CADFE15F74E6CA8F3AB9DD756A2629AFD3C569E59493F9B2DBAC8A3F2A3`; 17,736 bytes; 365 lines |
| Failing-before control | Critical suite exit 1; 3/3 tests failed against the intentionally incomplete always-green baseline |
| Passing-after suite | `npm.cmd run test`: 8 files passed, 21 tests passed, 0 failed |
| Review repair controls | Partial nested import rejected; rejected adapter snapshot preserves prior reference; tenant-key and role-helper mutations are killed |
| Mutation control | `npm.cmd run test:mutation`: clean pass, disabled detector killed, restored pass; the entire control was repeated twice |
| Type safety | `npm.cmd run typecheck`: exit 0 |
| Static quality | `npm.cmd run lint`: exit 0, zero warnings after repair |
| Production build | `npm.cmd run build`: exit 0; Next.js 16.2.12 emitted 14 routes |
| Browser journey | Initial UNKNOWN, accepted synthetic financial snapshot, residual contradictory-scope UNKNOWN, failed self-approval, distinct-approver receipt |
| Keyboard path | Sort selection changed by keyboard; table row inspection changed by keyboard Enter |
| Export | Browser download produced `portfolio-control-tower-synthetic-export.json` |
| Responsive layout | 390 px viewport measured `clientWidth=390`, `scrollWidth=390`, `overflow=false` |
| Browser console | Clean rerun returned 0 errors and 0 warnings |
| Secret scan | Known-positive search matched; credential-pattern scan returned zero matches; no `.env` file present |
| Dependency audit | An August 3 advisory invalidated the prior PostCSS 8.5.18 pin; corrective head `8d4fd61` resolves PostCSS 8.5.25 and Sharp 0.35.0, and a distinct reviewer verified full `npm audit --json` at 0 vulnerabilities |

Local visual evidence is generated under ignored `output/playwright/`; it proves local rendering only.

## GitHub committed truth — VERIFIED

- Repository: `https://github.com/shrishmanglik/portfolio-delivery-control-tower`
- Visibility: `PUBLIC` from GitHub repository metadata.
- Default branch: `main`.
- Task branch: `dev/portfolio-delivery-control-tower-initial-build`.
- Base SHA: `51e032cf1401e7dbdab626836fd2ede39a5b0010`.
- Core implementation commit: `579d073959a19a940a3316f98a91857beeaf5b85`.
- Product/UI/documentation commit: `e151ca26717a0ed5d299588db44b465376169510`.
- Initial evidence commit: `69c3df09366b6860233a320c3619dbacc1a01e80`.
- Distinct-review repair commit: `13d3b00a246734dad2e6873126ee29bddf29d380`.
- Dependency-audit repair commit: `0f116fbb796998c42e120c3d213cdc28b9d3e4fc`.
- Current-advisory repair commit: `8d4fd6148d2c3c02c102e7a90f1a9f493dcc61fa`.
- Pull request: `https://github.com/shrishmanglik/portfolio-delivery-control-tower/pull/1`.
- Merge: `0be76ad17bf57793a313fd23f2b35dee98ea54f1` on `main`; PR #1 merged at `2026-08-04T00:29:59Z` under explicit founder authority.

## Provider truth

| Provider claim | State | Evidence boundary |
|---|---|---|
| GitHub PR validation | VERIFIED on merged code/security head | Run `30865532967` completed real install, 21 tests, typecheck, lint, and 14-route build steps successfully on `8d4fd6148d2c3c02c102e7a90f1a9f493dcc61fa` |
| Production deployment | VERIFIED | Vercel deployment `dpl_EhextdkCxVwuvdTmW1oouLg9xvnm`, target `production`, state `READY`, canonical alias `https://portfolio-delivery-control-tower.vercel.app` |
| Live browser journey | VERIFIED | Canonical URL completed UNKNOWN, validated snapshot, self-approval rejection, distinct receipt, API 200, zero UI console errors, and 390 px no-overflow checks |
| Supabase schema applied | NOT PERFORMED | SQL is a proposed source contract only |
| Authentication / SSO configured | UNKNOWN | No provider inspection or mutation authorized |
| External project/resource/finance adapters | NOT CONNECTED | Synthetic local adapters only |

## Commercial and organizational truth — GAP

- Customers, users, validated demand, willingness to pay, outcomes, benchmarks, revenue, and employer adoption remain `UNKNOWN`.
- The blueprint is candidate-authored design input, not proof of target-company process, need, endorsement, or affiliation.

## Governance gaps — CORRECTED / OPEN

- CORRECTED: the original dispatch used stale `C:\MDS` authority paths. Parent verification established `C:\AGI` as current Tier 1 and the live role canon confirms that root.
- OPEN: the generic `feature-build` task contract still names retired persona `implementer`; current Development Studio charter supersedes it with typed personas.
- OPEN: no project-specific backlog row existed. The founder-authorized work order supplied concrete scope, acceptance criteria, repository, branch, reviewer boundary, and proof conditions.
- No canon file was modified because the collision surface was restricted to this isolated repository.

## Distinct review repair

The first independent reviewer returned `REVISE` after finding an unreachable mocked-import failure, an incomplete runtime import schema, and presence-only RLS tests. The builder repaired those boundaries; this statement is implementation history, not a review verdict on the repair. A separate reviewer must adjudicate the updated head.

The initial re-review was correctly blocked when concurrent builder dependency work made the shared checkout mutable. The final reviewer was therefore directed to an immutable clean checkout. Four hosted validations ran before the August 3 merge request; the evidence-only second run was avoidable, while the third and fourth were corrective runs for review findings and dependency advisories. This already exceeded the intended single-run CI budget and remains a recorded governance defect.

Immediately before merge, a newly published moderate PostCSS advisory proved the previous high-threshold audit was adjacent to the stricter zero-known-vulnerability question. PostCSS was updated to 8.5.25, a distinct reviewer returned `APPROVE`, and a fifth hosted validation passed before merge. Direct browser navigation to the raw JSON API also requests `/favicon.ico`, which returns 404; the API itself returns 200 and UI routes remain console-clean.
