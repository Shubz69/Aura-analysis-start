import { describe, it, expect } from "vitest";
import { calculateFromFixedSize } from "./fixedSizeCalculator";

describe("calculateFromFixedSize", () => {
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
