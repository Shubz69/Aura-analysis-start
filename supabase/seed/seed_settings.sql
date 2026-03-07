-- Leaderboard field visibility defaults
insert into public.app_settings (key, value) values
('leaderboard_visibility', '{"total_trades":true,"win_rate":true,"avg_r":true,"total_pnl":true,"profit_factor":true,"consistency_score":true,"best_pair":true}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();
