import { describe, it, expect } from "vitest";
import { calculateFromFixedSize } from "./fixedSizeCalculator";
import { validateTradeInput } from "./validateTradeInput";

describe("validateTradeInput", () => {
  it("TEST 2: GBPUSD invalid forex price scale - entry 10265 rejected", () => {
    const result = validateTradeInput({
      symbol: "GBPUSD",
      accountBalance: 10000,
      entry: 10265,
      stop: 10253,
      takeProfit: 1.28,
      direction: "buy",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Invalid") || e.includes("reasonable"))).toBe(true);
  });

  it("GBPUSD valid structure passes", () => {
    const result = validateTradeInput({
      symbol: "GBPUSD",
      accountBalance: 10000,
      entry: 1.265,
      stop: 1.2638,
      takeProfit: 1.28,
      direction: "buy",
    });
    expect(result.valid).toBe(true);
  });
});

describe("calculateFromFixedSize", () => {
  describe("TEST 1: GBPUSD valid forex price", () => {
    it("entry 1.2650, stop 1.2638, tp 1.28, 5 lots -> stopPips 12, tpPips 150, loss 600, profit 7500", () => {
      const result = calculateFromFixedSize("GBPUSD", {
        accountBalance: 10000,
        entry: 1.265,
        stop: 1.2638,
        takeProfit: 1.28,
        positionSize: 5,
        direction: "buy",
      });
      expect(result.stopDistancePrice).toBeCloseTo(0.0012, 6);
      expect(result.takeProfitDistancePrice).toBeCloseTo(0.015, 6);
      expect(result.stopDistanceAlt).toBeCloseTo(12, 1);   // 0.0012 / 0.0001 = 12 pips
      expect(result.takeProfitDistanceAlt).toBeCloseTo(150, 1); // 0.015 / 0.0001 = 150 pips
      expect(result.potentialLoss).toBeCloseTo(600, 0);    // 12 pips * $10/lot * 5 lots
      expect(result.potentialProfit).toBeCloseTo(7500, 0); // 150 pips * $10/lot * 5 lots
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe("TEST 6: AAPL shares", () => {
    it("entry 200, stop 195, tp 210, 20 shares -> loss 100, profit 200", () => {
      const result = calculateFromFixedSize("AAPL", {
        accountBalance: 10000,
        entry: 200,
        stop: 195,
        takeProfit: 210,
        positionSize: 20,
        direction: "buy",
      });
      expect(result.potentialLoss).toBe(100); // (200-195)*20
      expect(result.potentialProfit).toBe(200); // (210-200)*20
    });
  });

  describe("TEST 7: ES futures", () => {
    it("uses tick math and whole contracts", () => {
      const result = calculateFromFixedSize("ES", {
        accountBalance: 50000,
        entry: 4500,
        stop: 4490,
        takeProfit: 4520,
        positionSize: 2,
        direction: "buy",
      });
      // 10 pts stop = 40 ticks (0.25), 20 pts tp = 80 ticks. tickValue 12.5 per contract
      expect(result.potentialLoss).toBe(40 * 12.5 * 2); // 1000
      expect(result.potentialProfit).toBe(80 * 12.5 * 2); // 2000
    });
  });

  describe("XAUUSD fixed 1.00 lot", () => {
    it("entry 2500, tp 2700, stop 2490 -> profit 20000, loss 1000", () => {
      const result = calculateFromFixedSize("XAUUSD", {
        accountBalance: 10000,
        entry: 2500,
        stop: 2490,
        takeProfit: 2700,
        positionSize: 1,
        direction: "buy",
      });
      expect(result.positionSize).toBe(1);
      expect(result.potentialProfit).toBe(20000); // (2700-2500)*100*1
      expect(result.potentialLoss).toBe(1000);    // (2500-2490)*100*1
    });

    it("same trade, stop 2495 -> profit still 20000, loss 500", () => {
      const result = calculateFromFixedSize("XAUUSD", {
        accountBalance: 10000,
        entry: 2500,
        stop: 2495,
        takeProfit: 2700,
        positionSize: 1,
        direction: "buy",
      });
      expect(result.potentialProfit).toBe(20000);
      expect(result.potentialLoss).toBe(500);
    });

    it("same trade, stop 2485 -> profit still 20000, loss 1500", () => {
      const result = calculateFromFixedSize("XAUUSD", {
        accountBalance: 10000,
        entry: 2500,
        stop: 2485,
        takeProfit: 2700,
        positionSize: 1,
        direction: "buy",
      });
      expect(result.potentialProfit).toBe(20000);
      expect(result.potentialLoss).toBe(1500);
    });
  });
});
