drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.handle_new_user();

drop table if exists public.notification;

drop table if exists public.progress;

drop table if exists public.project_employee cascade;

drop table if exists public.project cascade;

drop table if exists public.employee;

drop table if exists public.boss;

drop table if exists public.profile;

create table public.profile (
  id uuid references auth.users on delete cascade not null primary key,
  full_name VARCHAR(30) not null,
  registration_date timestamp with time zone default now()
);

create table public.boss (id uuid references public.profile on delete cascade not null primary key);

create table public.employee (id uuid references public.profile on delete cascade not null primary key);

create table public.project (
  id bigint generated always as identity primary key,
  title text not null,
  boss_id uuid references public.boss on delete cascade not null
);

create table public.project_employee (
  project_id bigint references public.project on delete cascade not null,
  employee_id uuid references public.employee on delete cascade not null,
  primary key (project_id, employee_id)
);

create table public.progress (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null,
  image_url text,
  sent_date timestamp with time zone not null default now(),
  parent_id bigint references public.progress on delete cascade,
  employee_id uuid references public.employee on delete cascade not null,
  project_id bigint references public.project on delete cascade not null
);

create table public.notification (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null,
  redirection_link text not null,
  profile_id uuid references public.profile on delete cascade not null
);


create function public.handle_new_user()
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
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profile enable row level security;
alter table public.boss enable row level security;
alter table public.employee enable row level security;
alter table public.project enable row level security;
alter table public.project_employee enable row level security;
alter table public.progress enable row level security;
alter table public.notification enable row level security;

create policy "Enable users to view their own data only"
on "public"."profile"
as permissive
for select
to authenticated
using (
  ((select auth.uid() as uid) = id)
);

create policy "Enable bosses to see their employees data"
on "public"."profile"
as permissive
for select
to authenticated
using (
  (id in (select project_employee.employee_id
    from project_employee
    where (project_employee.project_id in (select project.id
            from project
            where (project.boss_id = (select auth.uid() as uid))))))
);

create policy "Enable employees to view their own data only"
on "public"."employee"
as permissive
for select
to authenticated
using (
  ((select auth.uid() as uid) = id)
);

create policy "Enable bosses to view the employees associated to their projects"
on "public"."employee"
as permissive
for select
to authenticated
using (
  (select auth.uid() as uid) in (select project.boss_id
    from project
    where (project.id in (select project_employee.project_id
            from project_employee
            where (project_employee.employee_id = employee.id))))
);

create policy "Enable bosses to view their own data only"
on "public"."boss"
as permissive
for select
to authenticated
using (
  ((select auth.uid() as uid) = id)
);

create policy "Enable employee to view their own progress"
on "public"."progress"
as permissive
for select
to authenticated
using (
  ((select auth.uid() as uid) = employee_id)
);

create policy "Enable insert for employees based on employee_id and project_id"
on "public"."progress"
as permissive
for insert
to authenticated
with check (
  ((select auth.uid() as uid) = employee_id) and (
    project_id in (select project_employee.project_id
      from project_employee
      where project_employee.employee_id = progress.employee_id))
);

create policy "Enable bosses to view the progress associated to their projects"
on "public"."progress"
as permissive
for select
to authenticated
using (
  (select auth.uid() as uid) in (select project.boss_id
    from project
    where (project.id = progress.project_id))
);

create policy "Enable bosses to view their projects"
on "public"."project"
as permissive
for select
to authenticated
using (
  (select auth.uid() as uid) = boss_id
);

create policy "Enable employees to view the projects where they are"
on "public"."project"
as permissive
for select
to authenticated
using (
  (select auth.uid() as uid) in (select project_employee.employee_id
    from project_employee
    where (project_employee.project_id = project.id)
  )
);

create policy "Enable employees to view their own data only"
on "public"."project_employee"
as permissive
for select
to authenticated
using (
  (select auth.uid() as uid) = employee_id
);

create policy "Enable bosses to view their projects data only"
on "public"."project_employee"
as permissive
for select
to authenticated
using (
  project_id in (select project.id
    from project
    where (project.boss_id = (select auth.uid() as uid)))
);
