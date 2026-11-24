-- Zee Telephonics: website enquiry intake for the CRM database (Supabase).
-- Additive only: one new table and one function. Existing CRM tables are not changed.
-- The website never touches tables directly; only the server (service role) may call the function.

create table if not exists public.website_submissions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  ip_hash     text not null,
  user_agent  text,
  payload     jsonb not null,
  lead_id     uuid references public.leads (id) on delete set null,
  outcome     text not null default 'accepted'   -- accepted, rate_limited
);
create index if not exists website_submissions_ip_time_idx on public.website_submissions (ip_hash, created_at desc);
alter table public.website_submissions enable row level security;
-- No policies: not readable or writable by the public or by signed-in users. Service role only.

create or replace function public.create_website_lead(
  p_payload jsonb,
  p_ip_hash text,
  p_user_agent text,
  p_rate_limit int default 5
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_recent int;
  v_lead_id uuid;
  v_name text := btrim(coalesce(p_payload ->> 'full_name', ''));
  v_first text;
  v_last text;
  v_notes text;
begin
  select count(*) into v_recent from public.website_submissions
   where ip_hash = p_ip_hash and created_at > now() - interval '1 hour';
  if v_recent >= p_rate_limit then
    insert into public.website_submissions (ip_hash, user_agent, payload, outcome)
    values (p_ip_hash, left(p_user_agent, 255), jsonb_build_object('rate_limited', true), 'rate_limited');
    return jsonb_build_object('status', 'rate_limited');
  end if;

  v_first := split_part(v_name, ' ', 1);
  v_last := nullif(btrim(substr(v_name, length(v_first) + 1)), '');

  v_notes := concat_ws(E'\n',
    'Submitted through the website contact form.',
    case when coalesce(p_payload ->> 'team_size', '') <> '' then 'Team size: ' || (p_payload ->> 'team_size') end,
    case when coalesce(p_payload ->> 'source_page', '') <> '' then 'Page: ' || (p_payload ->> 'source_page') end,
    case when coalesce(p_payload ->> 'utm_source', '') <> '' then
      'Campaign: ' || concat_ws(' / ', nullif(p_payload ->> 'utm_source', ''), nullif(p_payload ->> 'utm_medium', ''), nullif(p_payload ->> 'utm_campaign', '')) end,
    'Consent: ' || coalesce(nullif(p_payload ->> 'consent_text', ''), 'not given')
  );

  insert into public.leads (first_name, last_name, company, email, phone, source, service_interest, message, notes)
  values (
    v_first,
    v_last,
    nullif(p_payload ->> 'company', ''),
    lower(p_payload ->> 'email'),
    nullif(p_payload ->> 'phone', ''),
    'website',
    nullif(p_payload ->> 'service', ''),
    p_payload ->> 'message',
    v_notes
  ) returning id into v_lead_id;

  insert into public.website_submissions (ip_hash, user_agent, payload, lead_id)
  values (p_ip_hash, left(p_user_agent, 255), p_payload, v_lead_id);

  return jsonb_build_object('status', 'ok', 'lead_id', v_lead_id);
end;
$$;

revoke all on function public.create_website_lead(jsonb, text, text, int) from public;
revoke all on function public.create_website_lead(jsonb, text, text, int) from anon, authenticated;
grant execute on function public.create_website_lead(jsonb, text, text, int) to service_role;
