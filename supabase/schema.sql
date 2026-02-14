create table if not exists pricing_base (
  id bigserial primary key,
  discipline text not null unique,
  base_rate bigint not null,
  unit_type text not null,
  min_charge numeric not null,
  phase_weights jsonb not null
);

create table if not exists complexity_multiplier (
  class text primary key,
  multiplier numeric not null
);

create table if not exists travel_tier (
  tier int primary key,
  cost bigint not null
);

create table if not exists visualization_rates (
  type text primary key,
  rate bigint not null
);

create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  inputs jsonb not null,
  outputs jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into pricing_base (discipline, base_rate, unit_type, min_charge, phase_weights)
values (
  'Planning',
  15800000,
  'per_ha',
  2,
  '[{"phase":"Diagnostic","percentage":15},{"phase":"Conceptual","percentage":25},{"phase":"Schematic","percentage":60}]'::jsonb
)
on conflict (discipline) do update
set
  base_rate = excluded.base_rate,
  unit_type = excluded.unit_type,
  min_charge = excluded.min_charge,
  phase_weights = excluded.phase_weights;

insert into pricing_base (discipline, base_rate, unit_type, min_charge, phase_weights)
values (
  'Building',
  200000,
  'per_sqm',
  100,
  '[{"phase":"Conceptual & Schematic","percentage":35},{"phase":"DED","percentage":65}]'::jsonb
)
on conflict (discipline) do update
set
  base_rate = excluded.base_rate,
  unit_type = excluded.unit_type,
  min_charge = excluded.min_charge,
  phase_weights = excluded.phase_weights;

insert into complexity_multiplier (class, multiplier)
values ('A', 1.0), ('B', 1.15), ('C', 1.30)
on conflict (class) do update set multiplier = excluded.multiplier;

insert into travel_tier (tier, cost)
values (0, 0), (1, 19000000), (2, 28000000), (3, 43000000)
on conflict (tier) do update set cost = excluded.cost;

insert into visualization_rates (type, rate)
values ('manView', 2900000), ('birdView', 4800000), ('animationPerMin', 950000)
on conflict (type) do update set rate = excluded.rate;
