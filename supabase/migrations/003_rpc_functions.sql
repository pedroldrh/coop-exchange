-- 003_rpc_functions.sql
-- Coop Order Exchange: RPC functions (security definer)

-- ============================================================
-- 1. accept_request
-- ============================================================
create or replace function accept_request(p_request_id uuid)
returns requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req   requests;
  v_post  posts;
begin
  -- Fetch the request
  select * into v_req from requests where id = p_request_id;
  if not found then
    raise exception 'Request not found';
  end if;

  -- Caller must be the seller
  if v_req.seller_id <> auth.uid() then
    raise exception 'Only the seller can accept a request';
  end if;

  -- Status must be 'requested'
  if v_req.status <> 'requested' then
    raise exception 'Request must be in "requested" status to accept (current: %)', v_req.status;
  end if;

  -- Check capacity
  select * into v_post from posts where id = v_req.post_id for update;
  if v_post.capacity_remaining < 1 then
    raise exception 'No remaining capacity on this post';
  end if;

  -- Update request status
  update requests
    set status = 'accepted'
  where id = p_request_id
  returning * into v_req;

  -- Decrement capacity, auto-close if zero
  update posts
    set capacity_remaining = capacity_remaining - 1,
        status = case
          when capacity_remaining - 1 = 0 then 'closed'
          else status
        end
  where id = v_req.post_id;

  -- Audit
  insert into audit_log (request_id, actor_id, action, from_status, to_status)
  values (p_request_id, auth.uid(), 'accept_request', 'requested', 'accepted');

  return v_req;
end;
$$;

-- ============================================================
-- 2. decline_request
-- ============================================================
create or replace function decline_request(p_request_id uuid)
returns requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req requests;
begin
  select * into v_req from requests where id = p_request_id;
  if not found then
    raise exception 'Request not found';
  end if;

  if v_req.seller_id <> auth.uid() then
    raise exception 'Only the seller can decline a request';
  end if;

  if v_req.status <> 'requested' then
    raise exception 'Request must be in "requested" status to decline (current: %)', v_req.status;
  end if;

  update requests
    set status        = 'cancelled',
        cancelled_by  = auth.uid(),
        cancel_reason = 'Declined by seller'
  where id = p_request_id
  returning * into v_req;

  insert into audit_log (request_id, actor_id, action, from_status, to_status)
  values (p_request_id, auth.uid(), 'decline_request', 'requested', 'cancelled');

  return v_req;
end;
$$;

-- ============================================================
-- 3. mark_paid
-- ============================================================
create or replace function mark_paid(
  p_request_id     uuid,
  p_paid_proof_path text default null,
  p_paid_reference  text default null
)
returns requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req requests;
begin
  select * into v_req from requests where id = p_request_id;
  if not found then
    raise exception 'Request not found';
  end if;

  if v_req.buyer_id <> auth.uid() then
    raise exception 'Only the buyer can mark a request as paid';
  end if;

  if v_req.status <> 'accepted' then
    raise exception 'Request must be in "accepted" status to mark paid (current: %)', v_req.status;
  end if;

  if p_paid_proof_path is null and p_paid_reference is null then
    raise exception 'Must provide either a proof screenshot path or a payment reference';
  end if;

  update requests
    set status          = 'paid',
        paid_proof_path = coalesce(p_paid_proof_path, paid_proof_path),
        paid_reference  = coalesce(p_paid_reference, paid_reference)
  where id = p_request_id
  returning * into v_req;

  insert into audit_log (request_id, actor_id, action, from_status, to_status)
  values (p_request_id, auth.uid(), 'mark_paid', 'accepted', 'paid');

  return v_req;
end;
$$;

-- ============================================================
-- 4. mark_ordered
-- ============================================================
create or replace function mark_ordered(
  p_request_id       uuid,
  p_ordered_proof_path text default null,
  p_order_id_text      text default null
)
returns requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req requests;
begin
  select * into v_req from requests where id = p_request_id;
  if not found then
    raise exception 'Request not found';
  end if;

  if v_req.seller_id <> auth.uid() then
    raise exception 'Only the seller can mark a request as ordered';
  end if;

  if v_req.status <> 'paid' then
    raise exception 'Request must be in "paid" status to mark ordered (current: %)', v_req.status;
  end if;

  if p_ordered_proof_path is null and p_order_id_text is null then
    raise exception 'Must provide either an order proof screenshot path or an order ID';
  end if;

  update requests
    set status             = 'ordered',
        ordered_proof_path = coalesce(p_ordered_proof_path, ordered_proof_path),
        order_id_text      = coalesce(p_order_id_text, order_id_text)
  where id = p_request_id
  returning * into v_req;

  insert into audit_log (request_id, actor_id, action, from_status, to_status)
  values (p_request_id, auth.uid(), 'mark_ordered', 'paid', 'ordered');

  return v_req;
end;
$$;

-- ============================================================
-- 5. mark_picked_up
-- ============================================================
create or replace function mark_picked_up(p_request_id uuid)
returns requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req requests;
begin
  select * into v_req from requests where id = p_request_id;
  if not found then
    raise exception 'Request not found';
  end if;

  if v_req.buyer_id <> auth.uid() then
    raise exception 'Only the buyer can mark a request as picked up';
  end if;

  if v_req.status <> 'ordered' then
    raise exception 'Request must be in "ordered" status to mark picked up (current: %)', v_req.status;
  end if;

  update requests
    set status = 'picked_up'
  where id = p_request_id
  returning * into v_req;

  insert into audit_log (request_id, actor_id, action, from_status, to_status)
  values (p_request_id, auth.uid(), 'mark_picked_up', 'ordered', 'picked_up');

  return v_req;
end;
$$;

-- ============================================================
-- 6. mark_completed
-- ============================================================
create or replace function mark_completed(p_request_id uuid)
returns requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req       requests;
  v_old_status text;
begin
  select * into v_req from requests where id = p_request_id for update;
  if not found then
    raise exception 'Request not found';
  end if;

  if auth.uid() <> v_req.buyer_id and auth.uid() <> v_req.seller_id then
    raise exception 'Only the buyer or seller can mark a request as completed';
  end if;

  if v_req.status not in ('picked_up', 'ordered') then
    raise exception 'Request must be in "picked_up" or "ordered" status to mark completed (current: %)', v_req.status;
  end if;

  v_old_status := v_req.status;

  -- Set the appropriate completion flag
  if auth.uid() = v_req.buyer_id then
    update requests
      set buyer_completed = true,
          status = case
            when seller_completed = true then 'completed'
            else status
          end
    where id = p_request_id
    returning * into v_req;
  else
    update requests
      set seller_completed = true,
          status = case
            when buyer_completed = true then 'completed'
            else status
          end
    where id = p_request_id
    returning * into v_req;
  end if;

  -- Increment completed_count for both parties if status just became completed
  if v_req.status = 'completed' and v_old_status <> 'completed' then
    update profiles set completed_count = completed_count + 1 where id = v_req.buyer_id;
    update profiles set completed_count = completed_count + 1 where id = v_req.seller_id;
  end if;

  insert into audit_log (request_id, actor_id, action, from_status, to_status, metadata)
  values (
    p_request_id,
    auth.uid(),
    'mark_completed',
    v_old_status,
    v_req.status,
    jsonb_build_object(
      'buyer_completed',  v_req.buyer_completed,
      'seller_completed', v_req.seller_completed
    )
  );

  return v_req;
end;
$$;

-- ============================================================
-- 7. cancel_request
-- ============================================================
create or replace function cancel_request(
  p_request_id uuid,
  p_reason     text default null
)
returns requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req       requests;
  v_old_status text;
begin
  select * into v_req from requests where id = p_request_id for update;
  if not found then
    raise exception 'Request not found';
  end if;

  if auth.uid() <> v_req.buyer_id and auth.uid() <> v_req.seller_id then
    raise exception 'Only the buyer or seller can cancel a request';
  end if;

  if v_req.status not in ('requested', 'accepted', 'paid') then
    raise exception 'Cannot cancel a request in "%" status', v_req.status;
  end if;

  -- Reason required if past 'requested'
  if v_req.status <> 'requested' and (p_reason is null or p_reason = '') then
    raise exception 'A cancellation reason is required when status is beyond "requested"';
  end if;

  v_old_status := v_req.status;

  -- If cancelling after acceptance, restore post capacity
  if v_req.status in ('accepted', 'paid') then
    update posts
      set capacity_remaining = capacity_remaining + 1,
          status = 'open'
    where id = v_req.post_id;
  end if;

  -- Cancel the request
  update requests
    set status        = 'cancelled',
        cancelled_by  = auth.uid(),
        cancel_reason = coalesce(p_reason, 'Cancelled')
  where id = p_request_id
  returning * into v_req;

  -- Increment cancel_count on the canceller's profile
  update profiles
    set cancel_count = cancel_count + 1
  where id = auth.uid();

  insert into audit_log (request_id, actor_id, action, from_status, to_status, metadata)
  values (
    p_request_id,
    auth.uid(),
    'cancel_request',
    v_old_status,
    'cancelled',
    jsonb_build_object('reason', coalesce(p_reason, 'Cancelled'))
  );

  return v_req;
end;
$$;

-- ============================================================
-- 8. open_dispute
-- ============================================================
create or replace function open_dispute(
  p_request_id  uuid,
  p_reason      text,
  p_description text default null
)
returns requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req requests;
begin
  select * into v_req from requests where id = p_request_id for update;
  if not found then
    raise exception 'Request not found';
  end if;

  if auth.uid() <> v_req.buyer_id and auth.uid() <> v_req.seller_id then
    raise exception 'Only the buyer or seller can open a dispute';
  end if;

  if v_req.status not in ('ordered', 'picked_up', 'completed') then
    raise exception 'Cannot dispute a request in "%" status', v_req.status;
  end if;

  -- If completed, must be within 24 hours
  if v_req.status = 'completed' then
    if v_req.updated_at < now() - interval '24 hours' then
      raise exception 'Disputes on completed requests must be opened within 24 hours of completion';
    end if;
  end if;

  -- Create the dispute row
  insert into disputes (request_id, opener_id, reason, description)
  values (p_request_id, auth.uid(), p_reason, p_description);

  -- Move request to disputed
  update requests
    set status = 'disputed'
  where id = p_request_id
  returning * into v_req;

  insert into audit_log (request_id, actor_id, action, from_status, to_status, metadata)
  values (
    p_request_id,
    auth.uid(),
    'open_dispute',
    v_req.status,
    'disputed',
    jsonb_build_object('reason', p_reason)
  );

  return v_req;
end;
$$;

-- ============================================================
-- 9. resolve_dispute
-- ============================================================
create or replace function resolve_dispute(
  p_dispute_id  uuid,
  p_resolution  text
)
returns disputes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dispute disputes;
  v_is_admin boolean;
begin
  -- Admin check
  select exists (
    select 1 from profiles where id = auth.uid() and role_preference = 'admin'
  ) into v_is_admin;

  if not v_is_admin then
    raise exception 'Only admins can resolve disputes';
  end if;

  select * into v_dispute from disputes where id = p_dispute_id for update;
  if not found then
    raise exception 'Dispute not found';
  end if;

  if v_dispute.status <> 'open' then
    raise exception 'Dispute is already resolved';
  end if;

  update disputes
    set status      = 'resolved',
        resolution  = p_resolution,
        resolved_by = auth.uid(),
        resolved_at = now()
  where id = p_dispute_id
  returning * into v_dispute;

  insert into audit_log (request_id, actor_id, action, from_status, to_status, metadata)
  values (
    v_dispute.request_id,
    auth.uid(),
    'resolve_dispute',
    'open',
    'resolved',
    jsonb_build_object('resolution', p_resolution)
  );

  return v_dispute;
end;
$$;

-- ============================================================
-- 10. submit_rating
-- ============================================================
create or replace function submit_rating(
  p_request_id uuid,
  p_stars      int,
  p_comment    text default null
)
returns ratings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req     requests;
  v_ratee   uuid;
  v_rating  ratings;
  v_new_avg numeric(3,2);
  v_count   int;
begin
  -- Validate stars
  if p_stars < 1 or p_stars > 5 then
    raise exception 'Stars must be between 1 and 5';
  end if;

  select * into v_req from requests where id = p_request_id;
  if not found then
    raise exception 'Request not found';
  end if;

  if v_req.status <> 'completed' then
    raise exception 'Can only rate completed requests (current: %)', v_req.status;
  end if;

  if auth.uid() <> v_req.buyer_id and auth.uid() <> v_req.seller_id then
    raise exception 'Only participants can rate this request';
  end if;

  -- Determine who is being rated
  if auth.uid() = v_req.buyer_id then
    v_ratee := v_req.seller_id;
  else
    v_ratee := v_req.buyer_id;
  end if;

  -- Check for duplicate
  if exists (
    select 1 from ratings
    where request_id = p_request_id and rater_id = auth.uid()
  ) then
    raise exception 'You have already rated this request';
  end if;

  -- Insert rating
  insert into ratings (request_id, rater_id, ratee_id, stars, comment)
  values (p_request_id, auth.uid(), v_ratee, p_stars, p_comment)
  returning * into v_rating;

  -- Update running average on the ratee's profile
  select count(*)::int, coalesce(avg(stars), 0)
    into v_count, v_new_avg
    from ratings
   where ratee_id = v_ratee;

  update profiles
    set rating_avg = round(v_new_avg, 2)
  where id = v_ratee;

  insert into audit_log (request_id, actor_id, action, metadata)
  values (
    p_request_id,
    auth.uid(),
    'submit_rating',
    jsonb_build_object('stars', p_stars, 'ratee', v_ratee)
  );

  return v_rating;
end;
$$;
