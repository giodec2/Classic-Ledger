create table if not exists public.managerial_workbooks (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists managerial_workbooks_user_updated_idx
  on public.managerial_workbooks (user_id, updated_at desc);

create or replace function public.set_managerial_workbook_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists managerial_workbooks_updated_at on public.managerial_workbooks;
create trigger managerial_workbooks_updated_at
before update on public.managerial_workbooks
for each row execute function public.set_managerial_workbook_updated_at();

alter table public.managerial_workbooks enable row level security;

drop policy if exists managerial_workbooks_select_owner on public.managerial_workbooks;
create policy managerial_workbooks_select_owner on public.managerial_workbooks
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists managerial_workbooks_insert_owner on public.managerial_workbooks;
create policy managerial_workbooks_insert_owner on public.managerial_workbooks
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists managerial_workbooks_update_owner on public.managerial_workbooks;
create policy managerial_workbooks_update_owner on public.managerial_workbooks
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists managerial_workbooks_delete_owner on public.managerial_workbooks;
create policy managerial_workbooks_delete_owner on public.managerial_workbooks
for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.managerial_workbooks to authenticated;
