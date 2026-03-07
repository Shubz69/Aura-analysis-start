/**
 * Run seed SQL files via Supabase client. Requires SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL.
 * Alternatively run the SQL files manually in Supabase SQL editor in order: migrations, then seed_assets.sql, seed_checklist.sql, seed_settings.sql.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSqlFile(name: string) {
  const path = join(process.cwd(), "supabase", "seed", name);
  const sql = readFileSync(path, "utf-8");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
  for (const stmt of statements) {
    if (stmt.toUpperCase().includes("INSERT") || stmt.toUpperCase().includes("UPDATE")) {
      const { error } = await supabase.rpc("exec_sql", { sql_query: stmt + ";" });
      if (error) console.warn(name, error.message);
    }
  }
  console.log("Ran", name);
}

async function main() {
  console.log("Seeding assets...");
  const assetsPath = join(process.cwd(), "supabase", "seed", "seed_assets.sql");
  const assetsSql = readFileSync(assetsPath, "utf-8");
  const { error: e1 } = await supabase.from("assets").upsert(
    [
      { symbol: "EURUSD", display_name: "EUR/USD", asset_class: "forex", quote_type: "USD", pip_multiplier: 10000, is_active: true },
      { symbol: "GBPUSD", display_name: "GBP/USD", asset_class: "forex", quote_type: "USD", pip_multiplier: 10000, is_active: true },
      { symbol: "USDJPY", display_name: "USD/JPY", asset_class: "forex", quote_type: "JPY", pip_multiplier: 100, is_active: true },
      { symbol: "XAUUSD", display_name: "Gold/USD", asset_class: "metals", quote_type: "USD", pip_multiplier: 10, is_active: true },
      { symbol: "US30", display_name: "Dow 30", asset_class: "indices", quote_type: "USD", pip_multiplier: 1, is_active: true },
      { symbol: "BTCUSD", display_name: "Bitcoin/USD", asset_class: "crypto", quote_type: "USD", pip_multiplier: 1, is_active: true },
    ],
    { onConflict: "symbol" }
  );
  if (e1) console.warn("Assets upsert:", e1.message);
  console.log("Seed run complete. For full asset list run seed_assets.sql in Supabase SQL editor.");
}

main().catch(console.error);
