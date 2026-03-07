import { describe, it, expect } from "vitest";
import {
  calcRiskAmount,
  calcStopLossDistance,
  calcTakeProfitDistance,
  calcRR,
  calcPositionSize,
  calcPotentialProfit,
  calcPotentialLoss,
  calcTradeGrade,
  calcChecklistPercent,
} from "./trade-calculations";

describe("trade-calculations", () => {
  describe("EURUSD", () => {
    const symbol = "EURUSD";
    const balance = 10000;
    const riskPercent = 1;
    const entry = 1.085;
    const stop = 1.083;
    const tp = 1.09;

    it("calcRiskAmount", () => {
      expect(calcRiskAmount(balance, riskPercent)).toBe(100);
    });

    it("calcStopLossDistance (pips)", () => {
      const pips = calcStopLossDistance(entry, stop, symbol);
      expect(pips).toBeCloseTo(20, 5);
    });

    it("calcTakeProfitDistance (pips)", () => {
      const pips = calcTakeProfitDistance(entry, tp, symbol);
      expect(pips).toBeCloseTo(50, 5);
    });

    it("calcRR", () => {
      expect(calcRR(entry, stop, tp)).toBeCloseTo(2.5, 5);
    });

    it("calcPositionSize and PnL", () => {
      const size = calcPositionSize({
        balance,
        riskPercent,
        entry,
        stop,
        symbol,
      });
      expect(size).toBeGreaterThan(0);
      const potentialProfit = calcPotentialProfit(entry, tp, size, symbol);
      const potentialLoss = calcPotentialLoss(entry, stop, size, symbol);
      expect(Math.abs(potentialLoss - 100)).toBeLessThan(1);
      expect(Math.abs(potentialProfit - 250)).toBeLessThan(2);
    });
  });

  describe("GBPJPY", () => {
    const symbol = "GBPJPY";
    const balance = 25000;
    const riskPercent = 0.5;
    const entry = 191.2;
    const stop = 190.8;
    const tp = 192.3;

    it("calcStopLossDistance and RR", () => {
      const slPips = calcStopLossDistance(entry, stop, symbol);
      expect(slPips).toBeCloseTo(40, 5);
      const tpPips = calcTakeProfitDistance(entry, tp, symbol);
      expect(tpPips).toBeCloseTo(110, 5);
      expect(calcRR(entry, stop, tp)).toBeCloseTo(2.75, 2);
    });

    it("calcPositionSize", () => {
      const size = calcPositionSize({
        balance,
        riskPercent,
        entry,
        stop,
        symbol,
      });
      expect(size).toBeGreaterThan(0);
      const riskAmount = calcRiskAmount(balance, riskPercent);
      expect(riskAmount).toBe(125);
    });
  });

  describe("XAUUSD", () => {
    const symbol = "XAUUSD";
    const balance = 15000;
    const riskPercent = 1;
    const entry = 2900;
    const stop = 2888;
    const tp = 2928;

    it("calcStopLossDistance (points)", () => {
      const pts = calcStopLossDistance(entry, stop, symbol);
      expect(pts).toBe(120);
    });

    it("calcPositionSize", () => {
      const size = calcPositionSize({
        balance,
        riskPercent,
        entry,
        stop,
        symbol,
      });
      expect(size).toBeGreaterThan(0);
    });
  });

  describe("US30", () => {
    const symbol = "US30";
    const balance = 20000;
    const riskPercent = 1;
    const entry = 42000;
    const stop = 41850;
    const tp = 42350;

    it("calcStopLossDistance (points)", () => {
      const pts = calcStopLossDistance(entry, stop, symbol);
      expect(pts).toBe(150);
    });

    it("calcRR", () => {
      expect(calcRR(entry, stop, tp)).toBeCloseTo(2.33, 2);
    });
  });

  describe("BTCUSD", () => {
    const symbol = "BTCUSD";
    const balance = 12000;
    const riskPercent = 1;
    const entry = 92000;
    const stop = 90500;
    const tp = 95000;

    it("calcStopLossDistance", () => {
      const pts = calcStopLossDistance(entry, stop, symbol);
      expect(pts).toBe(1500);
    });

    it("calcPositionSize", () => {
      const size = calcPositionSize({
        balance,
        riskPercent,
        entry,
        stop,
        symbol,
      });
      expect(size).toBeGreaterThan(0);
    });
  });

  describe("calcTradeGrade", () => {
    it("returns A+ for 100%", () => {
      expect(calcTradeGrade(100)).toBe("A+");
    });
    it("returns A for 80-99%", () => {
      expect(calcTradeGrade(85)).toBe("A");
      expect(calcTradeGrade(99)).toBe("A");
    });
    it("returns B for 60-79%", () => {
      expect(calcTradeGrade(70)).toBe("B");
    });
    it("returns C below 60%", () => {
      expect(calcTradeGrade(50)).toBe("C");
    });
  });

  describe("calcChecklistPercent", () => {
    it("returns 0 for 0 total", () => {
      expect(calcChecklistPercent(5, 0)).toBe(0);
    });
    it("returns 100 for full score", () => {
      expect(calcChecklistPercent(7, 7)).toBe(100);
    });
    it("rounds correctly", () => {
      expect(calcChecklistPercent(5, 7)).toBe(71);
    });
  });
});
