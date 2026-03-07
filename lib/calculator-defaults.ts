import type { Asset } from "@/types";

/** Default assets for Trade Calculator when DB/assets API returns empty. */
export const DEFAULT_CALCULATOR_ASSETS: Asset[] = [
  { id: "def-eurusd", symbol: "EURUSD", display_name: "EUR/USD", asset_class: "forex", quote_type: "USD", pip_multiplier: 10000, pip_value_hint: 10, contract_size_hint: 100000, is_active: true, created_at: "" },
  { id: "def-gbpjpy", symbol: "GBPJPY", display_name: "GBP/JPY", asset_class: "forex", quote_type: "JPY", pip_multiplier: 100, pip_value_hint: 10, contract_size_hint: null, is_active: true, created_at: "" },
  { id: "def-xauusd", symbol: "XAUUSD", display_name: "XAU/USD (Gold)", asset_class: "metals", quote_type: "USD", pip_multiplier: 10, pip_value_hint: 1, contract_size_hint: 100, is_active: true, created_at: "" },
  { id: "def-us30", symbol: "US30", display_name: "US30", asset_class: "indices", quote_type: "USD", pip_multiplier: 1, pip_value_hint: 1, contract_size_hint: null, is_active: true, created_at: "" },
  { id: "def-nas100", symbol: "NAS100", display_name: "NAS100", asset_class: "indices", quote_type: "USD", pip_multiplier: 1, pip_value_hint: 1, contract_size_hint: null, is_active: true, created_at: "" },
  { id: "def-btcusd", symbol: "BTCUSD", display_name: "BTC/USD", asset_class: "crypto", quote_type: "USD", pip_multiplier: 1, pip_value_hint: 1, contract_size_hint: null, is_active: true, created_at: "" },
  { id: "def-gbpusd", symbol: "GBPUSD", display_name: "GBP/USD", asset_class: "forex", quote_type: "USD", pip_multiplier: 10000, pip_value_hint: 10, contract_size_hint: 100000, is_active: true, created_at: "" },
  { id: "def-usdjpy", symbol: "USDJPY", display_name: "USD/JPY", asset_class: "forex", quote_type: "JPY", pip_multiplier: 100, pip_value_hint: 10, contract_size_hint: null, is_active: true, created_at: "" },
  { id: "def-audusd", symbol: "AUDUSD", display_name: "AUD/USD", asset_class: "forex", quote_type: "USD", pip_multiplier: 10000, pip_value_hint: 10, contract_size_hint: 100000, is_active: true, created_at: "" },
  { id: "def-xagusd", symbol: "XAGUSD", display_name: "XAG/USD (Silver)", asset_class: "metals", quote_type: "USD", pip_multiplier: 100, pip_value_hint: 0.5, contract_size_hint: 5000, is_active: true, created_at: "" },
];
