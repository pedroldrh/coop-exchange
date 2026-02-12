-- 001_tables.sql
-- Coop Order Exchange: schema, indexes, triggers, realtime

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- Tables
-- ============================================================

-- profiles (1-to-1 with auth.users)
create table profiles (
  id              uuid        primary key references auth.users on delete cascade,
  email           text        not null,
  name            text,
  role_preference text        not null default 'buyer'
                              check (role_preference in ('buyer', 'seller', 'admin')),
  rating_avg      numeric(3,2) not null default 0,
  completed_count int         not null default 0,
  cancel_count    int         not null default 0,
  is_banned       bool        not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- posts (seller availability listings)
create table posts (
  id                 uuid        primary key default gen_random_uuid(),
  seller_id          uuid        not null references profiles on delete cascade,
  status             text        not null default 'open'
                                 check (status in ('open', 'closed')),
  capacity_total     int         not null check (capacity_total >= 1),
  capacity_remaining int         not null check (capacity_remaining >= 0),
  location           text,
  notes              text,
  max_value_hint     numeric(6,2),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- requests (buyer order requests against a post)
create table requests (
  id                 uuid        primary key default gen_random_uuid(),
  post_id            uuid        not null references posts on delete cascade,
  buyer_id           uuid        not null references profiles on delete cascade,
  seller_id          uuid        not null references profiles on delete cascade,
  status             text        not null default 'requested'
                                 check (status in (
                                   'requested', 'accepted', 'ordered',
                                   'picked_up', 'completed', 'cancelled', 'disputed'
                                 )),
  items_text         text        not null,
  instructions       text,
  est_total          numeric(6,2),
  ordered_proof_path text,
  order_id_text      text,
  buyer_completed    bool        not null default false,
  seller_completed   bool        not null default false,
  cancel_reason      text,
  cancelled_by       uuid        references profiles,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- messages (chat between buyer and seller within a request)
create table messages (
  id          uuid        primary key default gen_random_uuid(),
  request_id  uuid        not null references requests on delete cascade,
  sender_id   uuid        not null references profiles on delete cascade,
  body        text        not null,
  created_at  timestamptz not null default now()
);

-- ratings (post-completion feedback)
create table ratings (
  id          uuid        primary key default gen_random_uuid(),
  request_id  uuid        not null references requests on delete cascade,
  rater_id    uuid        not null references profiles on delete cascade,
  ratee_id    uuid        not null references profiles on delete cascade,
  stars       int         not null check (stars >= 1 and stars <= 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (request_id, rater_id)
);

-- disputes (flagged transactions)
create table disputes (
  id          uuid        primary key default gen_random_uuid(),
  request_id  uuid        not null references requests on delete cascade,
  opener_id   uuid        not null references profiles on delete cascade,
  reason      text        not null,
  description text,
  status      text        not null default 'open'
                           check (status in ('open', 'resolved')),
  resolution  text,
  resolved_by uuid        references profiles,
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);

-- audit_log (immutable activity trail)
create table audit_log (
  id          uuid        primary key default gen_random_uuid(),
  request_id  uuid        references requests on delete set null,
  actor_id    uuid        references profiles on delete set null,
  action      text        not null,
  from_status text,
  to_status   text,
  metadata    jsonb       not null default '{}',
  created_at  timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================
create index idx_posts_status_seller    on posts    (status, seller_id);
create index idx_requests_buyer         on requests (buyer_id);
create index idx_requests_seller        on requests (seller_id);
create index idx_requests_status        on requests (status);
create index idx_requests_post          on requests (post_id);
create index idx_messages_request_time  on messages (request_id, created_at);
create index idx_ratings_ratee          on ratings  (ratee_id);
create index idx_audit_log_request      on audit_log(request_id);

-- ============================================================
-- Trigger function: auto-set updated_at
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger trg_posts_updated_at
  before update on posts
  for each row execute function set_updated_at();

create trigger trg_requests_updated_at
  before update on requests
  for each row execute function set_updated_at();

-- ============================================================
-- Trigger function: auto-create profile on auth.users insert
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Realtime
-- ============================================================
alter publication supabase_realtime add table requests;
alter publication supabase_realtime add table messages;
