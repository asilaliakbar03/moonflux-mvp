-- ============================================================
-- MoonFluxx Database Schema
-- Run this in Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ── USERS ─────────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id                  uuid primary key default gen_random_uuid(),
  wallet_address      text unique not null,
  username            text,
  avatar_url          text,
  bio                 text,
  twitter_handle      text,
  total_volume_traded numeric default 0,
  tokens_launched     integer default 0,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── TOKENS ────────────────────────────────────────────────────────────────────
create table if not exists public.tokens (
  id                      uuid primary key default gen_random_uuid(),
  mint_address            text unique not null,
  name                    text not null,
  ticker                  text not null,
  icon                    text default '',
  description             text,
  creator_id              text not null,  -- wallet address of creator
  bonding_curve_progress  numeric default 0,
  graduated               boolean default false,
  metadata_uri            text,
  category                text default 'general',
  created_at              timestamptz default now()
);

-- ── TRADES ────────────────────────────────────────────────────────────────────
create table if not exists public.trades (
  id             uuid primary key default gen_random_uuid(),
  token_id       uuid references public.tokens(id) on delete cascade,
  wallet_address text not null,
  type           text check (type in ('buy', 'sell')) not null,
  sol_amount     numeric not null,
  token_amount   numeric not null,
  price_usd      numeric default 0,
  tx_signature   text unique not null,
  created_at     timestamptz default now()
);

-- ── COMMENTS ──────────────────────────────────────────────────────────────────
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  token_id   uuid references public.tokens(id) on delete cascade,
  user_id    uuid references public.users(id) on delete cascade,
  text       text not null,
  created_at timestamptz default now()
);

-- ── PRICE ALERTS ──────────────────────────────────────────────────────────────
create table if not exists public.price_alerts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.users(id) on delete cascade,
  token_id     uuid references public.tokens(id) on delete cascade,
  condition    text check (condition in ('above', 'below')) not null,
  target_price numeric not null,
  active       boolean default true,
  created_at   timestamptz default now()
);

-- ── WATCHLIST ─────────────────────────────────────────────────────────────────
create table if not exists public.watchlist (
  user_id    uuid references public.users(id) on delete cascade,
  token_id   uuid references public.tokens(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, token_id)
);

-- ── INDEXES ───────────────────────────────────────────────────────────────────
create index if not exists idx_tokens_created_at    on public.tokens(created_at desc);
create index if not exists idx_trades_token_id      on public.trades(token_id);
create index if not exists idx_trades_wallet        on public.trades(wallet_address);
create index if not exists idx_comments_token_id    on public.comments(token_id);
create index if not exists idx_price_alerts_user    on public.price_alerts(user_id);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────
alter table public.users         enable row level security;
alter table public.tokens        enable row level security;
alter table public.trades        enable row level security;
alter table public.comments      enable row level security;
alter table public.price_alerts  enable row level security;
alter table public.watchlist     enable row level security;

-- Allow public read on tokens and trades (anyone can see the market)
create policy "Public read tokens"  on public.tokens  for select using (true);
create policy "Public read trades"  on public.trades  for select using (true);
create policy "Public read comments" on public.comments for select using (true);

-- Allow service role full access (our API routes use service_role key)
create policy "Service role full access users"   on public.users         for all using (true);
create policy "Service role full access tokens"  on public.tokens        for all using (true);
create policy "Service role full access trades"  on public.trades        for all using (true);
create policy "Service role full access comments" on public.comments     for all using (true);
create policy "Service role full access alerts"  on public.price_alerts  for all using (true);
create policy "Service role full access watch"   on public.watchlist     for all using (true);
