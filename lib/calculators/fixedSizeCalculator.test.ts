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
    it("entry 1.0265, stop 1.0253, tp 1.28, 5 lots -> stopPips 12, tpPips 2535, loss 600, profit 126750, R:R 211.25", () => {
      const result = calculateFromFixedSize("GBPUSD", {
        accountBalance: 10000,
        entry: 1.0265,
        stop: 1.0253,
        takeProfit: 1.28,
        positionSize: 5,
        direction: "buy",
      });
      expect(result.stopDistancePrice).toBeCloseTo(0.0012, 6);
      expect(result.takeProfitDistancePrice).toBeCloseTo(0.2535, 6);
      expect(result.stopDistanceAlt).toBeCloseTo(12, 1);
      expect(result.takeProfitDistanceAlt).toBeCloseTo(2535, 1);
      expect(result.potentialLoss).toBeCloseTo(600, 0);
      expect(result.potentialProfit).toBeCloseTo(126750, 0);
      expect(result.riskReward).toBeCloseTo(211.25, 2);
      // Sanity warnings (e.g. extreme R:R) may appear; no validation errors
      expect(result.warnings.some((w) => w.includes("Invalid") || w.includes("reasonable"))).toBe(false);
    });
  });

  describe("TEST 6: EURUSD standard forex", () => {
    it("entry 1.1, stop 1.095, tp 1.11, 1 lot -> 50 pips stop, 100 pips tp, loss 500, profit 1000", () => {
      const result = calculateFromFixedSize("EURUSD", {
        accountBalance: 10000,
        entry: 1.1,
        stop: 1.095,
        takeProfit: 1.11,
        positionSize: 1,
        direction: "buy",
      });
      expect(result.stopDistanceAlt).toBeCloseTo(50, 1);
      expect(result.takeProfitDistanceAlt).toBeCloseTo(100, 1);
      expect(result.potentialLoss).toBeCloseTo(500, 0);
      expect(result.potentialProfit).toBeCloseTo(1000, 0);
    });
  });

  describe("TEST 7: USDJPY JPY pip logic", () => {
    it("uses correct pip size 0.01 and pip value per lot", () => {
      const result = calculateFromFixedSize("USDJPY", {
        accountBalance: 10000,
        entry: 150,
        stop: 149.5,
        takeProfit: 151,
        positionSize: 1,
        direction: "buy",
      });
      expect(result.stopDistanceAlt).toBeCloseTo(50, 1);
      expect(result.takeProfitDistanceAlt).toBeCloseTo(100, 1);
      const pipValuePerLot = (100_000 * 0.01) / 150;
      expect(result.potentialLoss).toBeCloseTo(50 * pipValuePerLot * 1, 0);
      expect(result.potentialProfit).toBeCloseTo(100 * pipValuePerLot * 1, 0);
    });
  });

  describe("TEST 8: AAPL shares", () => {
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

  describe("TEST 9: ES futures", () => {
    it("uses tick math and whole contracts", () => {
      const result = calculateFromFixedSize("ES", {
        accountBalance: 50000,
        entry: 4500,
        stop: 4490,
        takeProfit: 4520,
        positionSize: 2,
        direction: "buy",
      });
      expect(result.potentialLoss).toBe(40 * 12.5 * 2);
      expect(result.potentialProfit).toBe(80 * 12.5 * 2);
    });
  });

  describe("TEST 10: BTCUSD crypto units", () => {
    it("profit/loss = price distance * units", () => {
      const result = calculateFromFixedSize("BTCUSD", {
        accountBalance: 10000,
        entry: 50000,
        stop: 49000,
        takeProfit: 52000,
        positionSize: 0.1,
        direction: "buy",
      });
      expect(result.potentialLoss).toBeCloseTo(1000 * 0.1, 0);
      expect(result.potentialProfit).toBeCloseTo(2000 * 0.1, 0);
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
