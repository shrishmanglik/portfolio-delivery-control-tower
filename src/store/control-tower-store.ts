"use client";

import { create } from "zustand";
import { engagements as seedEngagements } from "@/src/domain/fixtures";
import { recordDecision, validateSyntheticFinancialSnapshot } from "@/src/services/portfolio-service";
import type { DecisionInput, Engagement, ReviewReceipt } from "@/src/domain/types";

interface ControlTowerState {
  engagements: Engagement[];
  selectedEngagementId: string;
  receipts: ReviewReceipt[];
  refreshState: "idle" | "loading" | "complete" | "error";
  refreshError: string | null;
  selectEngagement: (id: string) => void;
  validateSyntheticSnapshot: () => Promise<void>;
  resetDemo: () => void;
  submitDecision: (input: DecisionInput) => ReturnType<typeof recordDecision>;
}

export const useControlTowerStore = create<ControlTowerState>((set, get) => ({
  engagements: seedEngagements,
  selectedEngagementId: seedEngagements[0]?.id ?? "",
  receipts: [],
  refreshState: "idle",
  refreshError: null,
  selectEngagement: (id) => set({ selectedEngagementId: id }),
  validateSyntheticSnapshot: async () => {
    set({ refreshState: "loading", refreshError: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const result = validateSyntheticFinancialSnapshot(get().engagements, new Date().toISOString());
      if (!result.accepted) {
        set({ refreshState: "error", refreshError: `The mocked import failed validation (${result.errors[0]?.path ?? "unknown field"}). The last accepted snapshot remains active.` });
        return;
      }
      set({ engagements: result.data, refreshState: "complete" });
    } catch {
      set({ refreshState: "error", refreshError: "The mocked import failed. The last accepted snapshot remains active." });
    }
  },
  resetDemo: () => set({ engagements: seedEngagements, receipts: [], refreshState: "idle", refreshError: null, selectedEngagementId: seedEngagements[0]?.id ?? "" }),
  submitDecision: (input) => {
    const result = recordDecision(input, new Date().toISOString());
    if (result.ok) set((state) => ({ receipts: [result.receipt, ...state.receipts] }));
    return result;
  },
}));
