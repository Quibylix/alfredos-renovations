drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.handle_new_user();

drop table if exists public.notification;

drop table if exists public.progress;

drop table if exists public.project_employee;

drop table if exists public.project;

drop table if exists public.employee;

drop table if exists public.boss;

drop table if exists public.profile;

create table public.profile (
  id uuid references auth.users on delete cascade not null primary key,
  full_name VARCHAR(30) not null,
  registration_date timestamp default now()
);

create table public.boss (id uuid references public.profile on delete cascade not null primary key);

create table public.employee (id uuid references public.profile on delete cascade not null primary key);

create table public.project (
  id bigint generated always as identity primary key,
  title text not null,
  boss_id uuid references public.boss
);

create table public.project_employee (
  project_id bigint references public.project,
  employee_id uuid references public.employee,
  primary key (project_id, employee_id)
);

create table public.progress (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null,
  image_url text,
  sent_date timestamp not null default now(),
  parent_id bigint references public.progress,
  employee_id uuid references public.employee,
  project_id bigint references public.project
);

create table public.notification (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null,
  redirection_link text not null,
  profile_id uuid references public.profile
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
