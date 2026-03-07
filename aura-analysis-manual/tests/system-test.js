/**
 * Aura Analysis system test (run with: node tests/system-test.js)
 * Tests: calculator engine, auth helpers, response shapes. No DB required.
 */
const path = require('path');

// Load calc engine from src (Node env)
const calcPath = path.join(__dirname, '../src/utils/auraAnalysisCalculations.js');
const calc = require(calcPath);

// Auth (needs JWT - we'll test verifyToken with a real signed token)
const jwt = require('jsonwebtoken');
const auth = require('../api/utils/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

let passed = 0;
let failed = 0;

function ok(name, condition, detail = '') {
  if (condition) {
    passed++;
    console.log('  OK:', name, detail ? `(${detail})` : '');
    return true;
  }
  failed++;
  console.log('  FAIL:', name, detail);
  return false;
}

function eq(name, actual, expected) {
  const match = actual === expected || (Number(actual) === Number(expected) && !Number.isNaN(Number(expected)));
  if (!match) console.log('    expected:', expected, 'got:', actual);
  return ok(name, match, `expected ${expected}, got ${actual}`);
}

function near(name, actual, expected, tolerance = 0.01) {
  const a = Number(actual);
  const e = Number(expected);
  const match = !Number.isNaN(a) && !Number.isNaN(e) && Math.abs(a - e) <= tolerance;
  if (!match) console.log('    expected ~', expected, 'got:', actual);
  return ok(name, match, `expected ~${expected}, got ${actual}`);
}

console.log('\n=== 1. Trade calculator engine ===\n');

const assets = [
  { symbol: 'EURUSD', pip_multiplier: 10000, quote_type: 'USD' },
  { symbol: 'USDJPY', pip_multiplier: 100, quote_type: 'JPY' },
  { symbol: 'XAUUSD', pip_multiplier: 10, quote_type: 'USD' },
  { symbol: 'NAS100', pip_multiplier: 1, quote_type: 'USD' },
];

// EURUSD: entry 1.085, SL 1.083, TP 1.09 -> 20 pips SL, 50 pips TP, RR 2.5
const riskAmount = calc.calcRiskAmount(10000, 1);
ok('calcRiskAmount(10000, 1) = 100', riskAmount === 100);

const slPips = calc.calcStopLossDistance(1.085, 1.083, 'EURUSD', assets);
ok('calcStopLossDistance EURUSD 1.085->1.083 = 20 pips', Math.abs(slPips - 20) < 0.01);

const tpPips = calc.calcTakeProfitDistance(1.085, 1.09, 'EURUSD', assets);
ok('calcTakeProfitDistance EURUSD 1.085->1.09 = 50 pips', Math.abs(tpPips - 50) < 0.01);

const rr = calc.calcRR(1.085, 1.083, 1.09);
near('calcRR = 2.5', rr, 2.5);

const positionSize = calc.calcPositionSize({
  balance: 10000,
  riskPercent: 1,
  entry: 1.085,
  stop: 1.083,
  symbol: 'EURUSD',
  assets,
});
ok('calcPositionSize returns positive number', positionSize > 0 && typeof positionSize === 'number');

const potentialProfit = calc.calcPotentialProfit(1.085, 1.09, positionSize, 'EURUSD', assets);
const potentialLoss = calc.calcPotentialLoss(1.085, 1.083, positionSize, 'EURUSD', assets);
ok('calcPotentialProfit/Loss return numbers', typeof potentialProfit === 'number' && typeof potentialLoss === 'number');

near('Risk amount equals potential loss (approx)', potentialLoss, 100, 5);

// R multiple
const rMult = calc.calcRMultiple(100, 250);
eq('calcRMultiple(100 risk, 250 pnl) = 2.5', rMult, 2.5);

// Checklist / grade
eq('calcChecklistPercent(7,7) = 100', calc.calcChecklistPercent(7, 7), 100);
eq('calcTradeGrade(100) = A+', calc.calcTradeGrade(100), 'A+');
eq('calcTradeGrade(85) = A', calc.calcTradeGrade(85), 'A');
eq('calcTradeGrade(65) = B', calc.calcTradeGrade(65), 'B');
eq('calcTradeGrade(50) = C', calc.calcTradeGrade(50), 'C');

// Consistency score (needs array of trades)
const mockTrades = [
  { result: 'win', checklist_percent: 100, risk_percent: 1, r_multiple: 1.5 },
  { result: 'loss', checklist_percent: 80, risk_percent: 1, r_multiple: -1 },
];
const consistency = calc.calcConsistencyScore(mockTrades);
ok('calcConsistencyScore returns 0-100 number', typeof consistency === 'number' && consistency >= 0 && consistency <= 100);

console.log('\n=== 2. Auth (JWT + role helpers) ===\n');

const payload = { id: 1, email: 'test@test.com', role: 'user' };
const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
const decoded = auth.verifyToken('Bearer ' + token);
ok('verifyToken(Bearer <valid>) returns decoded payload', decoded && decoded.id === 1);

ok('verifyToken(invalid) returns null', auth.verifyToken('Bearer invalid') === null);
ok('verifyToken(empty) returns null', auth.verifyToken('') === null);

const superUser = { id: 1, email: 'shubzfx@gmail.com', role: 'user' };
ok('isSuperAdminOverride(shubzfx) true', auth.isSuperAdminOverride(superUser) === true);
ok('getEffectiveRole(shubzfx) = super_admin', auth.getEffectiveRole(superUser) === 'super_admin');

const normalUser = { id: 2, email: 'other@test.com', role: 'user' };
ok('getEffectiveRole(user) = user', auth.getEffectiveRole(normalUser) === 'user');

ok('BLOCKED_ROLES includes premium', auth.BLOCKED_ROLES.includes('premium'));
ok('ALLOWED_ROLES includes user', auth.ALLOWED_ROLES.includes('user'));

console.log('\n=== 3. API route module loading ===\n');

const me = require('../api/aura-analysis/me');
ok('api/aura-analysis/me exports function', typeof me === 'function');

const assetsApi = require('../api/aura-analysis/assets/index');
ok('api/aura-analysis/assets/index exports function', typeof assetsApi === 'function');

const tradesIndex = require('../api/aura-analysis/trades/index');
ok('api/aura-analysis/trades/index exports function', typeof tradesIndex === 'function');

const overview = require('../api/aura-analysis/analytics/overview');
ok('api/aura-analysis/analytics/overview exports function', typeof overview === 'function');

const leaderboard = require('../api/aura-analysis/analytics/leaderboard');
ok('api/aura-analysis/analytics/leaderboard exports function', typeof leaderboard === 'function');

// No separate login API: Aura Analysis uses existing Aura FX auth (users table + JWT).

console.log('\n=== Summary ===\n');
console.log('Passed:', passed);
console.log('Failed:', failed);
process.exit(failed > 0 ? 1 : 0);
