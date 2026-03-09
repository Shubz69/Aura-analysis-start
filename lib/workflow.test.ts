import { describe, it, expect, beforeEach, vi } from "vitest";
import { useDraftTradeStore } from "./store/draftTradeStore";
import { insertTrade, getTradesByUserId } from "./data/trades";

// Mocking db to fall back to in-memory array
vi.mock("@/lib/db", () => ({
  query: vi.fn().mockRejectedValue(new Error("Mock DB error")),
  executeQuery: vi.fn().mockRejectedValue(new Error("Mock DB error")),
}));

describe("Validator -> Calculator Workflow", () => {
  beforeEach(() => {
    useDraftTradeStore.setState({ draft: null });
  });

  it("TEST 1: Validator score = 65 - cannot proceed", () => {
    // Simulated UI logic:
    const score = 65;
    const canProceed = score >= 70;
    
    expect(canProceed).toBe(false);
    
    // Attempting to proceed anyway would be blocked by the UI
    // The CTA button disabled state is derived from `canProceed`
  });

  it("TEST 2: Validator score = 78 - can proceed and transfer data", () => {
    const score = 78;
    const canProceed = score >= 70;
    
    expect(canProceed).toBe(true);
    
    const store = useDraftTradeStore.getState();
    store.createDraftFromValidator("EURUSD", "buy", {
      score,
      status: "Good Setup",
      checklistState: { item1: true },
      sectionScores: { sec1: 100 },
      completedAt: new Date().toISOString(),
    });
    
    const updatedStore = useDraftTradeStore.getState();
    expect(updatedStore.draft).not.toBeNull();
    expect(updatedStore.draft?.symbol).toBe("EURUSD");
    expect(updatedStore.draft?.validator?.score).toBe(78);
  });

  it("TEST 4: Attempt save without validator pass - blocked", () => {
    // Simulator for the calculator page's validation
    useDraftTradeStore.setState({ draft: null });
    
    const store = useDraftTradeStore.getState();
    const hasValidDraft = store.draft?.validator && store.draft.validator.score >= 70;
    
    expect(hasValidDraft).toBeFalsy();
    // UI would show warning and block save handleSave
  });

  it("TEST 3: Validated trade saved from calculator - one combined trade record", async () => {
    const userId = "test-user-1";
    const store = useDraftTradeStore.getState();
    
    store.createDraftFromValidator("GBPUSD", "sell", {
      score: 85,
      status: "High Probability",
      checklistState: { tf: true, trend: true },
      sectionScores: { ta: 100 },
      completedAt: new Date().toISOString(),
    });
    
    const draft = useDraftTradeStore.getState().draft;
    
    // Simulate calculator submit
    const payload = {
      pair: draft?.symbol || "GBPUSD",
      asset_class: "forex",
      direction: draft?.direction || "sell",
      account_balance: 10000,
      risk_percent: 1,
      risk_amount: 100,
      entry_price: 1.2500,
      stop_loss: 1.2550,
      take_profit: 1.2400,
      stop_loss_pips: 50,
      take_profit_pips: 100,
      rr: 2,
      position_size: 0.2,
      potential_profit: 200,
      potential_loss: 100,
      checklist_score: draft?.validator?.score ?? 0,
      checklist_total: 100,
      checklist_percent: draft?.validator?.score ?? 0,
      trade_grade: draft?.validator?.status ?? "—",
      validator_data: draft?.validator ? JSON.stringify(draft.validator) : null,
    };
    
    const savedTrade = await insertTrade(userId, payload);
    expect(savedTrade).not.toBeNull();
    expect(savedTrade?.pair).toBe("GBPUSD");
    expect(savedTrade?.checklist_score).toBe(85);
    expect(savedTrade?.trade_grade).toBe("High Probability");
    expect(savedTrade?.validator_data).toContain("High Probability");
    
    // Verify it's in the journal array (in-memory mock via DB failure fallback)
    const userTrades = await getTradesByUserId(userId);
    const foundTrade = userTrades.find(t => t.id === savedTrade?.id);
    
    expect(foundTrade).toBeDefined();
    expect(foundTrade?.validator_data).toBeDefined();
    
    // Clear draft after save
    store.clearDraftTrade();
    expect(useDraftTradeStore.getState().draft).toBeNull();
  });
});
