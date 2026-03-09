/**
 * Central instrument configuration for the risk calculator.
 * Each instrument has metadata and a calculationMode so the engine uses the correct formula.
 */

export type AssetClass =
  | "forex"
  | "commodity"
  | "index"
  | "stock"
  | "future"
  | "crypto";

export type CalculationMode =
  | "forex"
  | "commodity"
  | "index_cfd"
  | "stock_share"
  | "future_contract"
  | "crypto_lot"
  | "crypto_units";

export interface InstrumentSpec {
  symbol: string;
  displayName: string;
  assetClass: AssetClass;
  contractSize: number;
  tickSize: number;
  tickValuePerLot?: number;
  pipSize?: number;
  pointSize?: number;
  pricePrecision: number;
  minLot?: number;
  maxLot?: number;
  lotStep?: number;
  /** For index CFDs: $ per point per lot. */
  valuePerPointPerLot?: number;
  /** For JPY pairs: pip value in quote; convert to USD with 1/price. */
  quoteCurrency: string;
  baseCurrency?: string;
  calculationMode: CalculationMode;
  /** Futures: whole contracts only. */
  wholeContractsOnly?: boolean;
}

function spec(
  symbol: string,
  displayName: string,
  assetClass: AssetClass,
  calculationMode: CalculationMode,
  opts: Partial<InstrumentSpec>
): InstrumentSpec {
  return {
    symbol,
    displayName,
    assetClass,
    calculationMode,
    contractSize: 0,
    tickSize: 0,
    pricePrecision: 2,
    quoteCurrency: "USD",
    ...opts,
  };
}

const INSTRUMENTS: InstrumentSpec[] = [
  // ─── FOREX ─────────────────────────────────────────────────────────────
  spec("EURUSD", "EUR/USD", "forex", "forex", {
    contractSize: 100_000,
    pipSize: 0.0001,
    tickSize: 0.00001,
    pricePrecision: 5,
    quoteCurrency: "USD",
    lotStep: 0.01,
    minLot: 0.01,
    maxLot: 100,
  }),
  spec("GBPUSD", "GBP/USD", "forex", "forex", {
    contractSize: 100_000,
    pipSize: 0.0001,
    tickSize: 0.00001,
    pricePrecision: 5,
    quoteCurrency: "USD",
    lotStep: 0.01,
    minLot: 0.01,
    maxLot: 100,
  }),
  spec("USDJPY", "USD/JPY", "forex", "forex", {
    contractSize: 100_000,
    pipSize: 0.01,
    tickSize: 0.001,
    pricePrecision: 3,
    quoteCurrency: "JPY",
    lotStep: 0.01,
    minLot: 0.01,
    maxLot: 100,
  }),
  spec("USDCHF", "USD/CHF", "forex", "forex", {
    contractSize: 100_000,
    pipSize: 0.0001,
    tickSize: 0.00001,
    pricePrecision: 5,
    quoteCurrency: "CHF",
    lotStep: 0.01,
    minLot: 0.01,
    maxLot: 100,
  }),
  spec("AUDUSD", "AUD/USD", "forex", "forex", {
    contractSize: 100_000,
    pipSize: 0.0001,
    tickSize: 0.00001,
    pricePrecision: 5,
    quoteCurrency: "USD",
    lotStep: 0.01,
    minLot: 0.01,
    maxLot: 100,
  }),
  spec("USDCAD", "USD/CAD", "forex", "forex", {
    contractSize: 100_000,
    pipSize: 0.0001,
    tickSize: 0.00001,
    pricePrecision: 5,
    quoteCurrency: "CAD",
    lotStep: 0.01,
    minLot: 0.01,
    maxLot: 100,
  }),

  // ─── COMMODITIES ───────────────────────────────────────────────────────
  spec("XAUUSD", "XAU/USD (Gold)", "commodity", "commodity", {
    contractSize: 100,
    tickSize: 0.01,
    pointSize: 1,
    pricePrecision: 2,
    quoteCurrency: "USD",
    lotStep: 0.01,
    minLot: 0.01,
    maxLot: 100,
  }),
  spec("XAGUSD", "XAG/USD (Silver)", "commodity", "commodity", {
    contractSize: 5000,
    tickSize: 0.001,
    pointSize: 0.01,
    pricePrecision: 3,
    quoteCurrency: "USD",
    lotStep: 0.01,
    minLot: 0.01,
    maxLot: 100,
  }),
  spec("XTIUSD", "WTI Crude Oil (USOIL)", "commodity", "commodity", {
    contractSize: 1000,
    tickSize: 0.01,
    pricePrecision: 2,
    quoteCurrency: "USD",
    lotStep: 0.01,
    minLot: 0.01,
    maxLot: 100,
  }),
  spec("XBRUSD", "Brent Crude Oil (UKOIL)", "commodity", "commodity", {
    contractSize: 1000,
    tickSize: 0.01,
    pricePrecision: 2,
    quoteCurrency: "USD",
    lotStep: 0.01,
    minLot: 0.01,
    maxLot: 100,
  }),

  // ─── INDICES (CFD) ─────────────────────────────────────────────────────
  spec("US30", "US30 (Dow)", "index", "index_cfd", {
    contractSize: 1,
    pointSize: 1,
    valuePerPointPerLot: 1,
    tickSize: 1,
    pricePrecision: 0,
    quoteCurrency: "USD",
    lotStep: 0.01,
    minLot: 0.01,
    maxLot: 100,
  }),
  spec("NAS100", "NAS100 (Nasdaq)", "index", "index_cfd", {
    contractSize: 1,
    pointSize: 1,
    valuePerPointPerLot: 1,
    tickSize: 1,
    pricePrecision: 0,
    quoteCurrency: "USD",
    lotStep: 0.01,
    minLot: 0.01,
    maxLot: 100,
  }),
  spec("SPX500", "SPX500 (S&P 500)", "index", "index_cfd", {
    contractSize: 1,
    pointSize: 1,
    valuePerPointPerLot: 1,
    tickSize: 1,
    pricePrecision: 0,
    quoteCurrency: "USD",
    lotStep: 0.01,
    minLot: 0.01,
    maxLot: 100,
  }),
  spec("GER40", "GER40 (DAX)", "index", "index_cfd", {
    contractSize: 1,
    pointSize: 1,
    valuePerPointPerLot: 1,
    tickSize: 1,
    pricePrecision: 0,
    quoteCurrency: "USD",
    lotStep: 0.01,
    minLot: 0.01,
    maxLot: 100,
  }),

  // ─── STOCKS ─────────────────────────────────────────────────────────────
  spec("AAPL", "Apple", "stock", "stock_share", {
    contractSize: 1,
    tickSize: 0.01,
    pricePrecision: 2,
    quoteCurrency: "USD",
  }),
  spec("TSLA", "Tesla", "stock", "stock_share", {
    contractSize: 1,
    tickSize: 0.01,
    pricePrecision: 2,
    quoteCurrency: "USD",
  }),
  spec("NVDA", "NVIDIA", "stock", "stock_share", {
    contractSize: 1,
    tickSize: 0.01,
    pricePrecision: 2,
    quoteCurrency: "USD",
  }),

  // ─── FUTURES ───────────────────────────────────────────────────────────
  spec("ES", "E-mini S&P 500", "future", "future_contract", {
    contractSize: 50,
    tickSize: 0.25,
    tickValuePerLot: 12.5,
    pricePrecision: 2,
    quoteCurrency: "USD",
    wholeContractsOnly: true,
  }),
  spec("NQ", "E-mini Nasdaq", "future", "future_contract", {
    contractSize: 20,
    tickSize: 0.25,
    tickValuePerLot: 5,
    pricePrecision: 2,
    quoteCurrency: "USD",
    wholeContractsOnly: true,
  }),
  spec("GC", "Gold", "future", "future_contract", {
    contractSize: 100,
    tickSize: 0.1,
    tickValuePerLot: 10,
    pricePrecision: 2,
    quoteCurrency: "USD",
    wholeContractsOnly: true,
  }),
  spec("CL", "Crude Oil WTI", "future", "future_contract", {
    contractSize: 1000,
    tickSize: 0.01,
    tickValuePerLot: 10,
    pricePrecision: 2,
    quoteCurrency: "USD",
    wholeContractsOnly: true,
  }),
  spec("MGC", "Micro Gold", "future", "future_contract", {
    contractSize: 10,
    tickSize: 0.1,
    tickValuePerLot: 1,
    pricePrecision: 2,
    quoteCurrency: "USD",
    wholeContractsOnly: true,
  }),
  spec("MNQ", "Micro E-mini Nasdaq", "future", "future_contract", {
    contractSize: 2,
    tickSize: 0.25,
    tickValuePerLot: 0.5,
    pricePrecision: 2,
    quoteCurrency: "USD",
    wholeContractsOnly: true,
  }),

  // ─── CRYPTO (unit-based spot style) ────────────────────────────────────
  spec("BTCUSD", "BTC/USD", "crypto", "crypto_units", {
    contractSize: 1,
    tickSize: 0.01,
    pricePrecision: 2,
    quoteCurrency: "USD",
  }),
  spec("ETHUSD", "ETH/USD", "crypto", "crypto_units", {
    contractSize: 1,
    tickSize: 0.01,
    pricePrecision: 2,
    quoteCurrency: "USD",
  }),
];

const bySymbol = new Map<string, InstrumentSpec>();
INSTRUMENTS.forEach((i) => bySymbol.set(i.symbol.toUpperCase(), i));

export function getInstrument(symbol: string): InstrumentSpec | null {
  return bySymbol.get(symbol.toUpperCase()) ?? null;
}

export function getInstrumentOrFallback(symbol: string): InstrumentSpec {
  const known = getInstrument(symbol);
  if (known) return known;
  const upper = symbol.toUpperCase();
  if (upper.includes("JPY") && !upper.includes("USD")) {
    return spec("USDJPY", symbol, "forex", "forex", {
      contractSize: 100_000,
      pipSize: 0.01,
      tickSize: 0.001,
      pricePrecision: 3,
      quoteCurrency: "JPY",
      lotStep: 0.01,
      minLot: 0.01,
      maxLot: 100,
    });
  }
  if (upper.includes("XAU") || upper.includes("GOLD")) {
    return spec(upper, symbol, "commodity", "commodity", {
      contractSize: 100,
      tickSize: 0.01,
      pointSize: 1,
      pricePrecision: 2,
      quoteCurrency: "USD",
      lotStep: 0.01,
      minLot: 0.01,
      maxLot: 100,
    });
  }
  if (["US30", "NAS100", "SPX500", "GER40"].some((s) => upper.includes(s))) {
    return spec(upper, symbol, "index", "index_cfd", {
      contractSize: 1,
      pointSize: 1,
      valuePerPointPerLot: 1,
      tickSize: 1,
      pricePrecision: 0,
      quoteCurrency: "USD",
      lotStep: 0.01,
      minLot: 0.01,
      maxLot: 100,
    });
  }
  if (["BTC", "ETH"].some((s) => upper.includes(s))) {
    return spec(upper, symbol, "crypto", "crypto_units", {
      contractSize: 1,
      tickSize: 0.01,
      pricePrecision: 2,
      quoteCurrency: "USD",
    });
  }
  return spec(upper, symbol, "forex", "forex", {
    contractSize: 100_000,
    pipSize: 0.0001,
    tickSize: 0.00001,
    pricePrecision: 5,
    quoteCurrency: "USD",
    lotStep: 0.01,
    minLot: 0.01,
    maxLot: 100,
  });
}

export function getAllInstruments(): InstrumentSpec[] {
  return [...INSTRUMENTS];
}
