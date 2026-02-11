-- 004_donation_model.sql
-- Update mark_ordered to allow skipping the paid step (donation model)

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
  v_from_status text;
begin
  select * into v_req from requests where id = p_request_id;
  if not found then
    raise exception 'Request not found';
  end if;

  if v_req.seller_id <> auth.uid() then
    raise exception 'Only the seller can mark a request as ordered';
  end if;

  -- Allow transition from either 'accepted' or 'paid' (donation model skips paid)
  if v_req.status not in ('accepted', 'paid') then
    raise exception 'Request must be in "accepted" or "paid" status to mark ordered (current: %)', v_req.status;
  end if;

  v_from_status := v_req.status;

  update requests
    set status              = 'ordered',
        ordered_proof_path  = coalesce(p_ordered_proof_path, ordered_proof_path),
        order_id_text       = coalesce(p_order_id_text, order_id_text)
  where id = p_request_id
  returning * into v_req;

  insert into audit_log (request_id, actor_id, action, from_status, to_status)
  values (p_request_id, auth.uid(), 'mark_ordered', v_from_status, 'ordered');

  return v_req;
end;
$$;
