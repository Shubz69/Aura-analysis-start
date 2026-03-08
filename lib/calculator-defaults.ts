import type { Asset } from "@/types";
import { getAllAssetMetadata } from "@/lib/config/auraAnalysisAssets";

/**
 * Build Asset[] from config metadata. Used when DB/assets API returns empty.
 * Single source of truth: lib/config/auraAnalysisAssets.ts
 */
export function buildDefaultCalculatorAssets(): Asset[] {
  const meta = getAllAssetMetadata();
  return meta.map((a, i) => ({
    id: `def-${a.symbol.toLowerCase()}-${i}`,
    symbol: a.symbol,
    display_name: a.displayName,
    asset_class: a.assetClass,
    quote_type: a.quoteType,
    pip_multiplier: a.pipMultiplier,
    pip_value_hint: a.pipValueHint,
    contract_size_hint: a.contractSizeHint,
    is_active: true,
    created_at: "",
  }));
}

/** Default assets for Trade Calculator when DB/assets API returns empty. */
export const DEFAULT_CALCULATOR_ASSETS: Asset[] = buildDefaultCalculatorAssets();
