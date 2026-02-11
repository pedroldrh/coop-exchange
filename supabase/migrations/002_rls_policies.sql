-- 002_rls_policies.sql
-- Coop Order Exchange: Row Level Security policies

-- ============================================================
-- Enable RLS on every table
-- ============================================================
alter table profiles  enable row level security;
alter table posts     enable row level security;
alter table requests  enable row level security;
alter table messages  enable row level security;
alter table ratings   enable row level security;
alter table disputes  enable row level security;
alter table audit_log enable row level security;

-- ============================================================
-- Helper: is the caller an admin?
-- ============================================================
-- Used inline:
--   exists (select 1 from profiles where id = auth.uid() and role_preference = 'admin')
--
-- Helper: is the caller banned?
--   not exists (select 1 from profiles where id = auth.uid() and is_banned = true)

-- ============================================================
-- PROFILES
-- ============================================================

-- SELECT: any authenticated user can read all profiles
create policy "profiles_select"
  on profiles for select
  to authenticated
  using (true);

-- INSERT: system only (handled by the on_auth_user_created trigger)
-- No insert policy for authenticated users.

-- UPDATE: users can only update their own row
create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- POSTS
-- ============================================================

-- SELECT: authenticated users can see open posts OR their own posts
create policy "posts_select"
  on posts for select
  to authenticated
  using (
    status = 'open'
    or seller_id = auth.uid()
  );

-- INSERT: authenticated, not banned, seller_id must be caller
create policy "posts_insert"
  on posts for insert
  to authenticated
  with check (
    seller_id = auth.uid()
    and not exists (
      select 1 from profiles where id = auth.uid() and is_banned = true
    )
  );

-- UPDATE: own posts only
create policy "posts_update_own"
  on posts for update
  to authenticated
  using  (seller_id = auth.uid())
  with check (seller_id = auth.uid());

-- ============================================================
-- REQUESTS
-- ============================================================

-- SELECT: buyer or seller of request, or admin
create policy "requests_select"
  on requests for select
  to authenticated
  using (
    buyer_id  = auth.uid()
    or seller_id = auth.uid()
    or exists (
      select 1 from profiles where id = auth.uid() and role_preference = 'admin'
    )
  );

-- INSERT: authenticated, not banned, buyer_id must be caller
create policy "requests_insert"
  on requests for insert
  to authenticated
  with check (
    buyer_id = auth.uid()
    and not exists (
      select 1 from profiles where id = auth.uid() and is_banned = true
    )
  );

-- UPDATE: no direct update policy — all mutations go through RPC functions
-- (security definer functions bypass RLS)

-- ============================================================
-- MESSAGES
-- ============================================================

-- SELECT: participant of the parent request
create policy "messages_select"
  on messages for select
  to authenticated
  using (
    exists (
      select 1 from requests r
      where r.id = request_id
        and (r.buyer_id = auth.uid() or r.seller_id = auth.uid())
    )
  );

-- INSERT: participant and not banned
create policy "messages_insert"
  on messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from requests r
      where r.id = request_id
        and (r.buyer_id = auth.uid() or r.seller_id = auth.uid())
    )
    and not exists (
      select 1 from profiles where id = auth.uid() and is_banned = true
    )
  );

-- ============================================================
-- RATINGS
-- ============================================================

-- SELECT: any authenticated user
create policy "ratings_select"
  on ratings for select
  to authenticated
  using (true);

-- INSERT: participant of a completed request who has not already rated
create policy "ratings_insert"
  on ratings for insert
  to authenticated
  with check (
    rater_id = auth.uid()
    and exists (
      select 1 from requests r
      where r.id = request_id
        and r.status = 'completed'
        and (r.buyer_id = auth.uid() or r.seller_id = auth.uid())
    )
    and not exists (
      select 1 from ratings rt
      where rt.request_id = request_id
        and rt.rater_id = auth.uid()
    )
  );

-- ============================================================
-- DISPUTES
-- ============================================================

-- SELECT: participant of the parent request or admin
create policy "disputes_select"
  on disputes for select
  to authenticated
  using (
    exists (
      select 1 from requests r
      where r.id = request_id
        and (r.buyer_id = auth.uid() or r.seller_id = auth.uid())
    )
    or exists (
      select 1 from profiles where id = auth.uid() and role_preference = 'admin'
    )
  );

-- INSERT: participant of the request
create policy "disputes_insert"
  on disputes for insert
  to authenticated
  with check (
    opener_id = auth.uid()
    and exists (
      select 1 from requests r
      where r.id = request_id
        and (r.buyer_id = auth.uid() or r.seller_id = auth.uid())
    )
  );

-- UPDATE: admin only (for resolution)
create policy "disputes_update_admin"
  on disputes for update
  to authenticated
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role_preference = 'admin'
    )
  )
  with check (
    exists (
      select 1 from profiles where id = auth.uid() and role_preference = 'admin'
    )
  );

-- ============================================================
-- AUDIT_LOG
-- ============================================================

-- SELECT: participant of the linked request or admin
create policy "audit_log_select"
  on audit_log for select
  to authenticated
  using (
    exists (
      select 1 from requests r
      where r.id = request_id
        and (r.buyer_id = auth.uid() or r.seller_id = auth.uid())
    )
    or exists (
      select 1 from profiles where id = auth.uid() and role_preference = 'admin'
    )
  );

-- INSERT: via RPC / service role only — no direct insert policy for users
