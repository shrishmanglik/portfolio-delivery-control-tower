import { EngagementRecord } from "@/components/engagement-record";
export default async function EngagementPage({ params }: { params: Promise<{ engagementId: string }> }) { const { engagementId } = await params; return <EngagementRecord id={engagementId} />; }
