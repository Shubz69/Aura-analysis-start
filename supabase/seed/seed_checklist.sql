-- Default checklist template (fixed id for reproducible seed)
insert into public.checklist_templates (id, name, description, is_default, is_active) values
('a0000000-0000-0000-0000-000000000001', 'Default Trade Checklist', 'Standard pre-trade checklist for manual trading.', true, true)
on conflict (id) do update set name = excluded.name, description = excluded.description, is_default = excluded.is_default, is_active = excluded.is_active;

-- Insert items for default template (skip if already present)
insert into public.checklist_template_items (template_id, label, sort_order, is_required)
select 'a0000000-0000-0000-0000-000000000001'::uuid, v.label, v.sort_order, v.is_required
from (values
  ('Trend aligned', 1, true),
  ('Liquidity sweep confirmed', 2, true),
  ('Session valid', 3, true),
  ('Structure confirmed', 4, true),
  ('Risk under max allowed', 5, true),
  ('Confluence present', 6, true),
  ('HTF bias aligned', 7, true)
) as v(label, sort_order, is_required)
where not exists (select 1 from public.checklist_template_items c where c.template_id = 'a0000000-0000-0000-0000-000000000001'::uuid and c.label = v.label);
