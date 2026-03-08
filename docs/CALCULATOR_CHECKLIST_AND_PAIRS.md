# Trade Calculator: Checklist, Pair Dropdown, and Example Pricing

## 1. Checklist questions config

**File:** `lib/config/checklistDefault.ts`

- **Checklist items:** `DEFAULT_CHECKLIST_ITEMS` (10 items):
  1. Trend aligned with higher timeframe bias  
  2. Liquidity sweep confirmed  
  3. Market structure confirmed  
  4. Session is valid for this setup  
  5. Risk is within allowed limit  
  6. Entry is at a key level / POI  
  7. Confluence is present  
  8. RR is acceptable for the setup  
  9. Trade follows my trading plan  
  10. I am not forcing this trade  

- **Helpers:** `calcChecklistPercent(score, total)`, `checklistPercentToGrade(percent)` (100→A+, 80–99→A, 60–79→B, &lt;60→C), `CHECKLIST_TOTAL` (10).

---

## 2. Pair / asset metadata

**File:** `lib/config/auraAnalysisAssets.ts`

- **Content:** All supported instruments (forex majors/crosses, metals, energy, indices, crypto) with `symbol`, `displayName`, `assetClass`, `distanceType`, `pipMultiplier`, `pricePrecision`, `quantityPrecision`, `contractSizeHint`, `pipValueHint`, `quoteType`.
- **API:** `getAssetMetadata(symbol)`, `getAllAssetMetadata()`.
- **Example prices:** `lib/config/assetExamples.ts` — `getPriceExample(symbol)`, `getEntryPlaceholder(symbol)`, `getStopPlaceholder(symbol)`, `getTpPlaceholder(symbol)` for placeholders and helper text.

---

## 3. Pair dropdown component

**File:** `components/calculator/PairSelect.tsx`

- **Role:** Searchable pair selector used on the calculator.
- **Props:** `value`, `options` (`{ symbol, displayName }[]`), `onValueChange`, `placeholder`, `className`, `disabled`.
- **Behaviour:** Click opens dropdown with search input; list is filtered by symbol/displayName; choosing an option sets value and closes. Options come from `assets` (or fallback) mapped to `{ symbol, displayName }`.

---

## 4. Checklist section component

**File:** `components/calculator/ChecklistSection.tsx`

- **Role:** Renders the pre-trade checklist on the calculator page.
- **Props:** `items` (from `DEFAULT_CHECKLIST_ITEMS`), `checked` (`Set<string>` of item ids), `onToggle(id)`.
- **UI:** Card with “Pre-trade checklist” and live **Score (e.g. 7/10)**, **Percent (e.g. 70%)**, **Grade (A+/A/B/C)**. Each item is a clickable row with a checkbox-style button; toggling updates the set and the displayed score/percent/grade.

---

## 5. Checklist scoring

- **checklistScore** = number of checked items (`checked.size`).
- **checklistTotal** = `CHECKLIST_TOTAL` (10).
- **checklistPercent** = `(checklistScore / checklistTotal) * 100`, rounded.
- **tradeGrade** = `checklistPercentToGrade(checklistPercent)` (100→A+, 80–99→A, 60–79→B, &lt;60→C).
- Score, percent, and grade update live as the user ticks/unticks items.

---

## 6. Placeholders / examples by pair

**File:** `lib/config/assetExamples.ts`

- **Source:** Map of symbol → `{ entry, stop, tp }` (example prices).
- **Usage:** When a pair is selected, the form uses:
  - **Placeholders:** `getEntryPlaceholder(pair)`, `getStopPlaceholder(pair)`, `getTpPlaceholder(pair)` for the Entry / Stop loss / Take profit inputs.
  - **Helper text:** “e.g. &lt;value&gt;” under each of those fields when an example exists.
- **Precision:** `assetConfig.pricePrecision` from `lib/config/auraAnalysisAssets.ts` is used to set the input `step` (e.g. 0.0001 for 4 decimals, 1 for indices).

---

## 7. Pair dropdown data source (DB vs fallback)

- **Calculator page:** `app/aura-analysis/calculator/page.tsx` passes `assets={DEFAULT_CALCULATOR_ASSETS}`.
- **DEFAULT_CALCULATOR_ASSETS:** Built in `lib/calculator-defaults.ts` by `buildDefaultCalculatorAssets()`, which maps `getAllAssetMetadata()` (from `lib/config/auraAnalysisAssets.ts`) into the `Asset[]` shape. So the dropdown uses **local config** as the default.
- **Future:** If the app later fetches assets from the DB, the page can pass `assets={apiAssets.length ? apiAssets : DEFAULT_CALCULATOR_ASSETS}` so the dropdown never stays empty.

---

## 8. Example save payload

After “Save trade” (with checklist and calculations filled), the payload passed to `onSave` looks like:

```json
{
  "pair": "EURUSD",
  "direction": "buy",
  "accountBalance": 10000,
  "riskPercent": 1,
  "entryPrice": 1.085,
  "stopLoss": 1.083,
  "takeProfit": 1.09,
  "session": "London",
  "notes": "Optional notes",
  "computed": {
    "riskAmount": 100,
    "stopLossPips": 20,
    "takeProfitPips": 50,
    "rr": 2.5,
    "positionSize": 0.05,
    "potentialProfit": 250,
    "potentialLoss": 100,
    "rMultiple": 2.5,
    "checklistScore": 7,
    "checklistTotal": 10,
    "checklistPercent": 70,
    "tradeGrade": "A"
  },
  "checklist": {
    "checklistScore": 7,
    "checklistTotal": 10,
    "checklistPercent": 70,
    "tradeGrade": "A",
    "checklistItems": [
      { "id": "trend", "label": "Trend aligned with higher timeframe bias", "passed": true },
      { "id": "liquidity", "label": "Liquidity sweep confirmed", "passed": true },
      …
    ]
  }
}
```

All calculated fields, checklist totals, grade, and per-item checklist results are included for persistence or API submission.

---

## Quick test: first pair and values

**Test the full calculator flow with this first:**

1. **Pair:** Leave as **EURUSD** (or select it from the dropdown and confirm the list is searchable and selection sticks).
2. **Direction:** Buy.
3. **Account balance:** **10000**
4. **Risk %:** **1**
5. **Entry:** **1.085** (or 1.0850)
6. **Stop loss:** **1.083** (or 1.0830)
7. **Take profit:** **1.09** (or 1.0900)
8. **Checklist:** Tick at least 6–7 items and watch **Score**, **Percent**, and **Grade** update in both the checklist card and the Calculated panel.
9. **Calculated panel should show:** Risk amount **$100.00**, Stop loss **20 pips**, Take profit **50 pips**, Risk:reward **2.50**, Position size **0.05 lots**, Potential profit ~**$250**, Potential loss ~**$100**, R multiple **2.50**, plus Checklist score **X/10**, **Y%**, Grade **A** or **B**.
10. **Save:** Click **Save trade**. If checklist &lt; 60% you should see the warning and be able to choose “Go back” or “Save anyway”. If ≥ 60%, save completes and the payload includes `checklist` and `computed` with all fields above.

Then change the pair to **XAUUSD** or **US30** and confirm the placeholders and “e.g.” helper text change (e.g. 2650 / 2642 / 2666 for XAUUSD, or 42000 / 41850 / 42350 for US30), and that the Calculated panel uses “pts” and “contracts” where appropriate.
