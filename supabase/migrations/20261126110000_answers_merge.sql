-- atomic merge of one onboarding answer (parallel saves never overwrite each other)
create or replace function public.merge_answers(uid uuid, patch jsonb) returns void
language sql security definer set search_path = public as $$
  update public.profiles set answers = coalesce(answers, '{}'::jsonb) || patch where id = uid
$$;
revoke execute on function public.merge_answers(uuid, jsonb) from public, anon, authenticated;
