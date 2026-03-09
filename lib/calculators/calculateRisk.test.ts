import { describe, it, expect } from "vitest";
import { calculateRisk, getClosedTradeResult, calcClosedTradePnL, calcClosedTradePnLAndR, calcRMultiple } from "./calculateRisk";

describe("calculateRisk", () => {
  describe("XAUUSD BUY", () => {
    it("TEST 1: balance 10000, risk 5%, entry 2200, stop 2150, tp 2300", () => {
      const result = calculateRisk("XAUUSD", {
        accountBalance: 10000,
        riskPercent: 5,
        entry: 2200,
        stop: 2150,
        takeProfit: 2300,
        direction: "buy",
      });
      expect(result.riskAmount).toBe(500);
      expect(result.stopDistancePrice).toBe(50);
      expect(result.takeProfitDistancePrice).toBe(100);
      expect(result.riskReward).toBe(2);
      expect(result.positionSize).toBe(0.1);
      expect(result.potentialProfit).toBe(1000);
      expect(result.potentialLoss).toBe(500);
      expect(result.rMultiple).toBe(2);
      expect(result.positionUnitLabel).toBe("lots");
    });

    it("TEST 2: balance 10000, risk 10%, entry 2200, stop 2150, tp 2300", () => {
      const result = calculateRisk("XAUUSD", {
        accountBalance: 10000,
        riskPercent: 10,
        entry: 2200,
        stop: 2150,
        takeProfit: 2300,
        direction: "buy",
      });
      expect(result.riskAmount).toBe(1000);
      expect(result.positionSize).toBe(0.2);
      expect(result.potentialProfit).toBe(2000);
      expect(result.potentialLoss).toBe(1000);
    });
  });

  describe("EURUSD BUY", () => {
    it("TEST 3: balance 10000, risk 1%, entry 1.1, stop 1.095, tp 1.11", () => {
      const result = calculateRisk("EURUSD", {
        accountBalance: 10000,
        riskPercent: 1,
        entry: 1.1,
        stop: 1.095,
        takeProfit: 1.11,
        direction: "buy",
      });
      expect(result.riskAmount).toBe(100);
      expect(result.stopDistancePrice).toBeCloseTo(0.005, 5);
      expect(result.takeProfitDistancePrice).toBeCloseTo(0.01, 5);
      expect(result.stopDistanceAlt).toBeCloseTo(50, 0);
      expect(result.takeProfitDistanceAlt).toBeCloseTo(100, 0);
      expect(result.riskReward).toBeCloseTo(2, 2);
      expect(result.positionSize).toBeCloseTo(0.2, 1);
      expect(result.potentialProfit).toBeCloseTo(200, 0);
      expect(result.potentialLoss).toBeCloseTo(100, 0);
      expect(result.positionUnitLabel).toBe("lots");
    });
  });

  describe("Closed trade PnL", () => {
    it("getClosedTradeResult", () => {
      expect(getClosedTradeResult(100, 105, "buy")).toBe("win");
      expect(getClosedTradeResult(100, 95, "buy")).toBe("loss");
      expect(getClosedTradeResult(100, 100, "buy")).toBe("breakeven");
      expect(getClosedTradeResult(100, 95, "sell")).toBe("win");
    });
    it("calcRMultiple", () => {
      expect(calcRMultiple(100, 200)).toBe(2);
      expect(calcRMultiple(100, 0)).toBe(0);
    });
    it("calcClosedTradePnL XAUUSD BUY", () => {
      const pnl = calcClosedTradePnL("XAUUSD", 2200, 2300, 0.1, "buy");
      expect(pnl).toBe(1000); // 100 pts * 100 oz * 0.1 = 1000
    });
    it("calcClosedTradePnLAndR", () => {
      const out = calcClosedTradePnLAndR(2200, 2300, 0.1, 500, "buy", "XAUUSD");
      expect(out.pnl).toBe(1000);
      expect(out.rMultiple).toBe(2);
      expect(out.result).toBe("win");
    });
  });
});
