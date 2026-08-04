import { canonicalize, stableReceiptDigest } from "@/src/domain/receipts";
import type { Engagement } from "@/src/domain/types";

export function buildSyntheticExport(engagements: Engagement[]) {
  const payload = { schema: "portfolio-delivery-control-tower.export.v1", synthetic: true, providerState: "UNKNOWN", engagements };
  return { ...payload, digest: stableReceiptDigest(payload), canonicalJson: canonicalize(payload) };
}
