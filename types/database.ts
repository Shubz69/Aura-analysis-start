export type UserRole = "super_admin" | "admin" | "member";
export type TradeDirection = "buy" | "sell";
export type TradeResult = "win" | "loss" | "breakeven" | "open";
export type SessionType = "Asian" | "London" | "New York" | "London/NY Overlap" | null;

export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  role: UserRole;
  avatar_url: string | null;
  default_account_balance: number | null;
  default_risk_percent: number | null;
  created_at: string;
}

export interface Asset {
  id: string;
  symbol: string;
  display_name: string;
  asset_class: string;
  quote_type: string;
  pip_multiplier: number;
  pip_value_hint: number | null;
  contract_size_hint: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  pair: string;
  asset_id: string | null;
  asset_class: string;
  direction: TradeDirection;
  session: SessionType;
  account_balance: number;
  risk_percent: number;
  risk_amount: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  stop_loss_pips: number;
  take_profit_pips: number;
  rr: number;
  position_size: number;
  potential_profit: number;
  potential_loss: number;
  result: TradeResult;
  pnl: number;
  r_multiple: number;
  checklist_score: number;
  checklist_total: number;
  checklist_percent: number;
  trade_grade: string | null;
  validator_data?: string | null;
  notes: string | null;
  close_price: number | null;
  closed_at: string | null;
  close_notes: string | null;
  created_at: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ChecklistTemplateItem {
  id: string;
  template_id: string;
  label: string;
  sort_order: number;
  is_required: boolean;
}

export interface TradeChecklistItem {
  id: string;
  trade_id: string;
  checklist_item_label: string;
  passed: boolean;
}

export interface AppSetting {
  id: string;
  key: string;
  value: unknown;
  updated_at: string;
}

export interface TradeWithDetails extends Trade {
  trade_checklist_items?: TradeChecklistItem[];
  profile?: Profile;
}

export interface LeaderboardFieldVisibility {
  total_trades: boolean;
  win_rate: boolean;
  avg_r: boolean;
  total_pnl: boolean;
  profit_factor: boolean;
  consistency_score: boolean;
  best_pair: boolean;
}
