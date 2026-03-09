/**
 * Runs mandatory test cases and prints a validation summary to the terminal.
 * Run: npx tsx lib/calculators/run-mandatory-validation.ts
 */

import { calculateRisk } from "./calculateRisk";

interface CaseResult {
  name: string;
  passed: boolean;
  details: string[];
}

const cases: CaseResult[] = [];

// ─── TEST 1: XAUUSD BUY ───────────────────────────────────────────────────
(function test1() {
  const result = calculateRisk("XAUUSD", {
    accountBalance: 10000,
    riskPercent: 5,
    entry: 2200,
    stop: 2150,
    takeProfit: 2300,
    direction: "buy",
  });
  const expected = {
    riskAmount: 500,
    stopDistancePrice: 50,
    takeProfitDistancePrice: 100,
    riskReward: 2,
    positionSize: 0.1,
    potentialProfit: 1000,
    potentialLoss: 500,
    rMultiple: 2,
  };
  const details: string[] = [];
  let passed = true;
  if (result.riskAmount !== expected.riskAmount) {
    passed = false;
    details.push(`riskAmount: expected ${expected.riskAmount}, got ${result.riskAmount}`);
  }
  if (result.stopDistancePrice !== expected.stopDistancePrice) {
    passed = false;
    details.push(`stopDistancePrice: expected ${expected.stopDistancePrice}, got ${result.stopDistancePrice}`);
  }
  if (result.takeProfitDistancePrice !== expected.takeProfitDistancePrice) {
    passed = false;
    details.push(`takeProfitDistancePrice: expected ${expected.takeProfitDistancePrice}, got ${result.takeProfitDistancePrice}`);
  }
  if (result.riskReward !== expected.riskReward) {
    passed = false;
    details.push(`riskReward: expected ${expected.riskReward}, got ${result.riskReward}`);
  }
  if (result.positionSize !== expected.positionSize) {
    passed = false;
    details.push(`positionSize: expected ${expected.positionSize}, got ${result.positionSize}`);
  }
  if (result.potentialProfit !== expected.potentialProfit) {
    passed = false;
    details.push(`potentialProfit: expected ${expected.potentialProfit}, got ${result.potentialProfit}`);
  }
  if (result.potentialLoss !== expected.potentialLoss) {
    passed = false;
    details.push(`potentialLoss: expected ${expected.potentialLoss}, got ${result.potentialLoss}`);
  }
  if (result.rMultiple !== expected.rMultiple) {
    passed = false;
    details.push(`rMultiple: expected ${expected.rMultiple}, got ${result.rMultiple}`);
  }
  if (passed) details.push("All fields match expected values.");
  cases.push({
    name: "TEST 1: XAUUSD BUY (balance 10000, risk 5%, entry 2200, stop 2150, tp 2300)",
    passed,
    details,
  });
})();

// ─── TEST 2: XAUUSD BUY ───────────────────────────────────────────────────
(function test2() {
  const result = calculateRisk("XAUUSD", {
    accountBalance: 10000,
    riskPercent: 10,
    entry: 2200,
    stop: 2150,
    takeProfit: 2300,
    direction: "buy",
  });
  const expected = {
    riskAmount: 1000,
    positionSize: 0.2,
    potentialProfit: 2000,
    potentialLoss: 1000,
  };
  const details: string[] = [];
  let passed = true;
  if (result.riskAmount !== expected.riskAmount) {
    passed = false;
    details.push(`riskAmount: expected ${expected.riskAmount}, got ${result.riskAmount}`);
  }
  if (result.positionSize !== expected.positionSize) {
    passed = false;
    details.push(`positionSize: expected ${expected.positionSize}, got ${result.positionSize}`);
  }
  if (result.potentialProfit !== expected.potentialProfit) {
    passed = false;
    details.push(`potentialProfit: expected ${expected.potentialProfit}, got ${result.potentialProfit}`);
  }
  if (result.potentialLoss !== expected.potentialLoss) {
    passed = false;
    details.push(`potentialLoss: expected ${expected.potentialLoss}, got ${result.potentialLoss}`);
  }
  if (passed) details.push("All fields match expected values.");
  cases.push({
    name: "TEST 2: XAUUSD BUY (balance 10000, risk 10%, entry 2200, stop 2150, tp 2300)",
    passed,
    details,
  });
})();

// ─── TEST 3: EURUSD BUY ───────────────────────────────────────────────────
(function test3() {
  const result = calculateRisk("EURUSD", {
    accountBalance: 10000,
    riskPercent: 1,
    entry: 1.1,
    stop: 1.095,
    takeProfit: 1.11,
    direction: "buy",
  });
  const details: string[] = [];
  let passed = true;
  if (result.riskAmount !== 100) {
    passed = false;
    details.push(`riskAmount: expected 100, got ${result.riskAmount}`);
  }
  if (Math.abs(result.stopDistanceAlt! - 50) >= 1) {
    passed = false;
    details.push(`stopPips: expected ~50, got ${result.stopDistanceAlt}`);
  }
  if (Math.abs(result.takeProfitDistanceAlt! - 100) >= 1) {
    passed = false;
    details.push(`takeProfitPips: expected ~100, got ${result.takeProfitDistanceAlt}`);
  }
  if (Math.abs(result.riskReward - 2) >= 0.01) {
    passed = false;
    details.push(`riskReward: expected ~2, got ${result.riskReward}`);
  }
  if (Math.abs(result.positionSize - 0.2) >= 0.05) {
    passed = false;
    details.push(`positionSize: expected ~0.20 lots, got ${result.positionSize}`);
  }
  if (Math.abs(result.potentialProfit - 200) >= 5) {
    passed = false;
    details.push(`potentialProfit: expected ~200, got ${result.potentialProfit}`);
  }
  if (Math.abs(result.potentialLoss - 100) >= 5) {
    passed = false;
    details.push(`potentialLoss: expected ~100, got ${result.potentialLoss}`);
  }
  if (passed) details.push("All fields match expected values.");
  cases.push({
    name: "TEST 3: EURUSD BUY (balance 10000, risk 1%, entry 1.1, stop 1.095, tp 1.11)",
    passed,
    details,
  });
})();

// ─── Print summary ────────────────────────────────────────────────────────
console.log("\n========== MANDATORY TEST CASES - VALIDATION SUMMARY ==========\n");

cases.forEach((c, i) => {
  const status = c.passed ? "PASS" : "FAIL";
  const icon = c.passed ? "\u2713" : "\u2717";
  console.log(`  ${icon} TEST ${i + 1}: ${status}`);
  console.log(`     ${c.name}`);
  c.details.forEach((d) => console.log(`     - ${d}`));
  console.log("");
});

const total = cases.length;
const passedCount = cases.filter((c) => c.passed).length;
const failedCount = total - passedCount;

console.log("-------------------------------------------------------------------");
console.log(`  Total: ${total}  |  Passed: ${passedCount}  |  Failed: ${failedCount}`);
console.log("-------------------------------------------------------------------\n");

if (failedCount > 0) {
  process.exit(1);
}
