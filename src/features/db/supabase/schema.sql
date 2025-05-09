create table public.profile (
  id uuid not null,
  full_name character varying(30) not null,
  registration_date timestamp with time zone null default now(),
  constraint profile_pkey primary key (id),
  constraint profile_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.boss (
  id uuid not null,
  constraint boss_pkey primary key (id),
  constraint boss_id_fkey foreign KEY (id) references profile (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.employee (
  id uuid not null,
  constraint employee_pkey primary key (id),
  constraint employee_id_fkey foreign KEY (id) references profile (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.project (
  id bigint generated always as identity not null,
  title text not null,
  boss_id uuid not null,
  constraint project_pkey primary key (id),
  constraint project_boss_id_fkey foreign KEY (boss_id) references boss (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.project_employee (
  project_id bigint not null,
  employee_id uuid not null,
  constraint project_employee_pkey primary key (project_id, employee_id),
  constraint project_employee_employee_id_fkey foreign KEY (employee_id) references employee (id) on delete CASCADE,
  constraint project_employee_project_id_fkey foreign KEY (project_id) references project (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.progress (
  id bigint generated always as identity not null,
  title text not null,
  description text not null,
  image_url text null,
  sent_date timestamp with time zone not null default now(),
  parent_id bigint null,
  employee_id uuid not null,
  project_id bigint not null,
  constraint progress_pkey primary key (id),
  constraint progress_employee_id_fkey foreign KEY (employee_id) references employee (id) on delete CASCADE,
  constraint progress_parent_id_fkey foreign KEY (parent_id) references progress (id) on delete CASCADE,
  constraint progress_project_id_fkey foreign KEY (project_id) references project (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.notification (
  id bigint generated always as identity not null,
  title text not null,
  description text not null,
  redirection_link text not null,
  profile_id uuid not null,
  constraint notification_pkey primary key (id),
  constraint notification_profile_id_fkey foreign KEY (profile_id) references profile (id) on delete CASCADE
) TABLESPACE pg_default;

create or replace function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public.profile (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  if new.raw_user_meta_data->>'role' = 'boss' then
    insert into public.boss (id)
    values (new.id);
  elsif new.raw_user_meta_data->>'role' = 'employee' then
    insert into public.employee (id)
    values (new.id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profile enable row level security;
alter table public.boss enable row level security;
alter table public.employee enable row level security;
alter table public.project enable row level security;
alter table public.project_employee enable row level security;
alter table public.progress enable row level security;
alter table public.notification enable row level security;

create schema private;

create or replace function private.get_user_role()
returns text
language plpgsql
security definer set search_path=''
as $$
declare
  user_role text;
begin
  if (select auth.uid() as uid) in (select id from public.boss) then
    user_role := 'boss';
  elsif (select auth.uid() as uid) in (select id from public.employee) then
    user_role := 'employee';
  else
    user_role := 'anon';
  end if;

  return user_role;
end;
$$;

create or replace function private.is_employee_boss(e_id uuid)
returns boolean
language plpgsql
security definer set search_path=''
as $$
begin
  return ((( SELECT private.get_user_role() AS get_user_role) = 'boss'::text) AND (( SELECT auth.uid() AS uid) IN ( SELECT project.boss_id
   FROM public.project
  WHERE (project.id IN ( SELECT project_employee.project_id
           FROM public.project_employee
          WHERE (project_employee.employee_id = e_id))))));
end;
$$;

create or replace function private.is_progress_boss(p_id bigint)
returns boolean
language plpgsql
security definer set search_path=''
as $$
begin
  return ((( SELECT private.get_user_role() AS get_user_role) = 'boss'::text) AND (( SELECT auth.uid() AS uid) IN ( SELECT project.boss_id
   FROM public.project
  WHERE (project.id = p_id))));
end;
$$;

create or replace function private.is_boss(p_id uuid)
returns boolean
language plpgsql
security definer set search_path=''
as $$
begin
  return (( SELECT private.get_user_role() AS get_user_role) = 'boss'::text) AND (p_id IN ( SELECT id from public.employee));
end;
$$;

create or replace function private.is_progress_creator(e_id uuid, p_id bigint)
returns boolean
language plpgsql
security definer set search_path=''
as $$
begin
  return ((( SELECT private.get_user_role() AS get_user_role) = 'employee'::text) AND ((( SELECT auth.uid() AS uid) = e_id) AND (p_id IN ( SELECT project_employee.project_id
   FROM public.project_employee
  WHERE (project_employee.employee_id = e_id)))) AND (exists(select 1 from public.project_employee where project_employee.employee_id = e_id and project_employee.project_id = p_id)));
end;
$$;

create or replace function private.is_employee_of_project(p_id bigint)
returns boolean
language plpgsql
security definer set search_path=''
as $$
begin
  return (((SELECT private.get_user_role() AS get_user_role) = 'employee'::text) AND ((SELECT auth.uid() AS uid) IN (SELECT project_employee.employee_id
   FROM public.project_employee
  WHERE (project_employee.project_id = p_id))));
end;
$$;

create or replace function private.is_project_employee_boss(p_id bigint)
returns boolean
language plpgsql
security definer set search_path=''
as $$
begin
  return ((( SELECT private.get_user_role() AS get_user_role) = 'boss'::text) AND (( SELECT auth.uid()) IN (SELECT project.boss_id
   FROM public.project
  WHERE project.id = p_id)));
end;
$$;

create or replace function private.is_project_employee_boss(p_id bigint)
returns boolean
language plpgsql
security definer set search_path=''
as $$
begin
  return ((( SELECT private.get_user_role() AS get_user_role) = 'boss'::text) AND (( SELECT auth.uid()) IN (SELECT project.boss_id
   FROM public.project
  WHERE project.id = p_id)));
end;
$$;

create policy "Enable users to see their own profile"
  on public.profile
  as permissive
  for select
  to authenticated
  using (
    ((SELECT auth.uid() AS uid) = id));

create policy "Enable bosses to see their employees profiles"
  on public.profile
  as permissive
  for select
  to authenticated
  using (
    (SELECT private.is_boss(profile.id) AS is_profile_boss));

create policy "Enable bosses to see their own data"
  on public.boss
  as permissive
  for select
  to authenticated
  using (
    ((SELECT auth.uid() AS uid) = id));

create policy "Enable employees to see their own data"
  on public.employee
  as permissive
  for select
  to authenticated
  using (
    ((SELECT auth.uid() AS uid) = id));

create policy "Enable bosses to see their employees data"
  on public.employee
  as permissive
  for select
  to authenticated
  using (
    ((SELECT private.get_user_role() AS get_user_role) = 'boss'::text));

create policy "Enable bosses to see their own projects"
  on public.project
  as permissive
  for select
  to authenticated
  using (
    (((SELECT private.get_user_role() AS get_user_role) = 'boss'::text)
      AND ((SELECT auth.uid() AS uid) = boss_id)));

create policy "Allow bosses to update their own projects"
  on public.project
  as permissive
  for update
  to authenticated
  using (
    (((SELECT private.get_user_role() AS get_user_role) = 'boss'::text)
      AND ((SELECT auth.uid() AS uid) = boss_id)))
  with check (
    (((SELECT private.get_user_role() AS get_user_role) = 'boss'::text)
      AND ((SELECT auth.uid() AS uid) = boss_id)));

create policy "Enable bosses to create new projects"
  on public.project
  as permissive
  for insert
  to authenticated
  with check (
    (((SELECT private.get_user_role() AS get_user_role) = 'boss'::text)
      AND ((SELECT auth.uid() AS uid) = boss_id)));

create policy "Enable employees to see the projects they are part of"
  on public.project
  as permissive
  for select
  to authenticated
  using (
    (SELECT private.is_employee_of_project(project.id) AS is_employee_of_project));

create policy "Enable employees to see the project-employee relationships they are part of"
  on public.project_employee
  as permissive
  for select
  to authenticated
  using (
    (((SELECT private.get_user_role() AS get_user_role) = 'employee'::text)
      AND ((SELECT auth.uid() AS uid) = employee_id)));

create policy "Enable bosses to see the project-employee relationships they are part of"
  on public.project_employee
  as permissive
  for select
  to authenticated
  using (
    (SELECT private.is_project_employee_boss(project_employee.project_id) AS is_project_employee_boss));

create policy "Enable bosses to create project-employee relationships"
  on public.project_employee
  as permissive
  for insert
  to authenticated
  with check (
    (SELECT private.is_project_employee_boss(project_employee.project_id) AS is_project_employee_boss));

create policy "Enable bosses to delete project-employee relationships"
  on public.project_employee
  as permissive
  for delete
  to authenticated
  using (
    (SELECT private.is_project_employee_boss(project_employee.project_id) AS is_project_employee_boss));

create policy "Enable bosses to see the progress of their projects"
  on public.progress
  as permissive
  for select
  to authenticated
  using (
    (SELECT private.is_progress_boss(progress.project_id) AS is_progress_boss));

create policy "Enable employees to see the progress of their projects"
  on public.progress
  as permissive
  for select
  to authenticated
  using (
    (SELECT private.is_progress_creator(progress.employee_id, progress.project_id) AS is_progress_creator));

create policy "Enable employees to create progress"
  on public.progress
  as permissive
  for insert
  to authenticated
  with check (
    (SELECT private.is_progress_creator(progress.employee_id, progress.project_id) AS is_progress_creator));

create policy "Give users authenticated upload access to images"
  on storage.objects
  for insert
  to authenticated
  with check (
    (bucket_id = 'images' AND auth.role() = 'authenticated'));

create or replace function public.get_employee_progress(e_id uuid)
returns table (
  id bigint,
  title text,
  description text,
  image_url text,
  sent_date timestamp with time zone,
  parent_id bigint,
  employee_id uuid,
  employee_full_name varchar(30),
  project_id bigint,
  project_title text
)
language plpgsql
security invoker set search_path=''
as $$
begin
  return query (SELECT pg.id, pg.title, pg.description, pg.image_url, pg.sent_date, pg.parent_id,
  pg.employee_id, pf.full_name as employee_full_name, pg.project_id, pj.title as project_title
 from public.progress pg
  inner join public.project pj on pg.project_id = pj.id
  inner join public.employee e on pg.employee_id = e.id
  inner join public.profile pf on (pf.id = e.id and exists(select 1 from public.project_employee where project_employee.employee_id = e.id and project_employee.project_id = pj.id))
   where pg.employee_id = e_id and pg.parent_id is null);
end;
$$;
