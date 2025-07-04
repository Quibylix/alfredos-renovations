create schema if not exists "private";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.get_user_role()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION private.is_boss(p_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  return (( SELECT private.get_user_role() AS get_user_role) = 'boss'::text) AND (p_id IN ( SELECT id from public.employee));
end;
$function$
;

CREATE OR REPLACE FUNCTION private.is_employee_boss(e_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  return ((( SELECT private.get_user_role() AS get_user_role) = 'boss'::text) AND (( SELECT auth.uid() AS uid) IN ( SELECT project.boss_id
   FROM public.project
  WHERE (project.id IN ( SELECT project_employee.project_id
           FROM public.project_employee
          WHERE (project_employee.employee_id = e_id))))));
end;
$function$
;

CREATE OR REPLACE FUNCTION private.is_employee_of_project(p_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  return (((SELECT private.get_user_role() AS get_user_role) = 'employee'::text) AND ((SELECT auth.uid() AS uid) IN (SELECT project_employee.employee_id
   FROM public.project_employee
  WHERE (project_employee.project_id = p_id))));
end;
$function$
;

CREATE OR REPLACE FUNCTION private.is_progress_boss(p_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  return ((( SELECT private.get_user_role() AS get_user_role) = 'boss'::text) AND (( SELECT auth.uid() AS uid) IN ( SELECT project.boss_id
   FROM public.project
  WHERE (project.id = p_id))));
end;
$function$
;

CREATE OR REPLACE FUNCTION private.is_progress_creator(e_id uuid, p_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  return ((( SELECT private.get_user_role() AS get_user_role) = 'employee'::text) AND ((( SELECT auth.uid() AS uid) = e_id) AND (p_id IN ( SELECT project_employee.project_id
   FROM public.project_employee
  WHERE (project_employee.employee_id = e_id)))) AND (exists(select 1 from public.project_employee where project_employee.employee_id = e_id and project_employee.project_id = p_id)));
end;
$function$
;

CREATE OR REPLACE FUNCTION private.is_progress_media_boss(p_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  return ((( SELECT private.get_user_role() AS get_user_role) = 'boss'::text) AND (( SELECT auth.uid() AS uid) IN ( SELECT project.boss_id
   FROM public.project
  WHERE (project.id IN ( SELECT progress.project_id
           FROM public.progress
          WHERE (progress.id = p_id))))));
end;
$function$
;

CREATE OR REPLACE FUNCTION private.is_progress_media_employee(p_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  return ((( SELECT private.get_user_role() AS get_user_role) = 'employee'::text) AND (( SELECT auth.uid() AS uid) IN ( SELECT progress.employee_id
   FROM public.progress
  WHERE (progress.id = p_id))));
end;
$function$
;

CREATE OR REPLACE FUNCTION private.is_project_employee_boss(p_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  return ((( SELECT private.get_user_role() AS get_user_role) = 'boss'::text) AND (( SELECT auth.uid()) IN (SELECT project.boss_id
   FROM public.project
  WHERE project.id = p_id)));
end;
$function$
;


create table "public"."boss" (
    "id" uuid not null
);


alter table "public"."boss" enable row level security;

create table "public"."employee" (
    "id" uuid not null
);


alter table "public"."employee" enable row level security;

create table "public"."notification" (
    "id" bigint generated always as identity not null,
    "title" text not null,
    "description" text not null,
    "redirection_link" text not null,
    "profile_id" uuid not null
);


alter table "public"."notification" enable row level security;

create table "public"."profile" (
    "id" uuid not null,
    "full_name" character varying(30) not null,
    "registration_date" timestamp with time zone default now()
);


alter table "public"."profile" enable row level security;

create table "public"."progress" (
    "id" bigint generated always as identity not null,
    "title" text,
    "description" text,
    "sent_date" timestamp with time zone not null default now(),
    "parent_id" bigint,
    "employee_id" uuid not null,
    "project_id" bigint not null
);


alter table "public"."progress" enable row level security;

create table "public"."progress_media" (
    "id" bigint generated always as identity not null,
    "progress_id" bigint not null,
    "type" text not null,
    "url" text not null
);


alter table "public"."progress_media" enable row level security;

create table "public"."project" (
    "id" bigint generated always as identity not null,
    "title" text not null,
    "boss_id" uuid not null
);


alter table "public"."project" enable row level security;

create table "public"."project_employee" (
    "project_id" bigint not null,
    "employee_id" uuid not null
);


alter table "public"."project_employee" enable row level security;

CREATE UNIQUE INDEX boss_pkey ON public.boss USING btree (id);

CREATE UNIQUE INDEX employee_pkey ON public.employee USING btree (id);

CREATE UNIQUE INDEX notification_pkey ON public.notification USING btree (id);

CREATE UNIQUE INDEX profile_pkey ON public.profile USING btree (id);

CREATE UNIQUE INDEX progress_media_pkey ON public.progress_media USING btree (id);

CREATE UNIQUE INDEX progress_pkey ON public.progress USING btree (id);

CREATE UNIQUE INDEX project_employee_pkey ON public.project_employee USING btree (project_id, employee_id);

CREATE UNIQUE INDEX project_pkey ON public.project USING btree (id);

alter table "public"."boss" add constraint "boss_pkey" PRIMARY KEY using index "boss_pkey";

alter table "public"."employee" add constraint "employee_pkey" PRIMARY KEY using index "employee_pkey";

alter table "public"."notification" add constraint "notification_pkey" PRIMARY KEY using index "notification_pkey";

alter table "public"."profile" add constraint "profile_pkey" PRIMARY KEY using index "profile_pkey";

alter table "public"."progress" add constraint "progress_pkey" PRIMARY KEY using index "progress_pkey";

alter table "public"."progress_media" add constraint "progress_media_pkey" PRIMARY KEY using index "progress_media_pkey";

alter table "public"."project" add constraint "project_pkey" PRIMARY KEY using index "project_pkey";

alter table "public"."project_employee" add constraint "project_employee_pkey" PRIMARY KEY using index "project_employee_pkey";

alter table "public"."boss" add constraint "boss_id_fkey" FOREIGN KEY (id) REFERENCES profile(id) ON DELETE CASCADE not valid;

alter table "public"."boss" validate constraint "boss_id_fkey";

alter table "public"."employee" add constraint "employee_id_fkey" FOREIGN KEY (id) REFERENCES profile(id) ON DELETE CASCADE not valid;

alter table "public"."employee" validate constraint "employee_id_fkey";

alter table "public"."notification" add constraint "notification_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE not valid;

alter table "public"."notification" validate constraint "notification_profile_id_fkey";

alter table "public"."profile" add constraint "profile_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profile" validate constraint "profile_id_fkey";

alter table "public"."progress" add constraint "progress_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE not valid;

alter table "public"."progress" validate constraint "progress_employee_id_fkey";

alter table "public"."progress" add constraint "progress_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES progress(id) ON DELETE CASCADE not valid;

alter table "public"."progress" validate constraint "progress_parent_id_fkey";

alter table "public"."progress" add constraint "progress_project_id_fkey" FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE not valid;

alter table "public"."progress" validate constraint "progress_project_id_fkey";

alter table "public"."progress" add constraint "progress_title_description_check" CHECK ((((parent_id IS NULL) AND (title IS NOT NULL) AND (description IS NOT NULL)) OR (parent_id IS NOT NULL))) not valid;

alter table "public"."progress" validate constraint "progress_title_description_check";

alter table "public"."progress_media" add constraint "progress_media_progress_id_fkey" FOREIGN KEY (progress_id) REFERENCES progress(id) ON DELETE CASCADE not valid;

alter table "public"."progress_media" validate constraint "progress_media_progress_id_fkey";

alter table "public"."project" add constraint "project_boss_id_fkey" FOREIGN KEY (boss_id) REFERENCES boss(id) ON DELETE CASCADE not valid;

alter table "public"."project" validate constraint "project_boss_id_fkey";

alter table "public"."project_employee" add constraint "project_employee_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE not valid;

alter table "public"."project_employee" validate constraint "project_employee_employee_id_fkey";

alter table "public"."project_employee" add constraint "project_employee_project_id_fkey" FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE not valid;

alter table "public"."project_employee" validate constraint "project_employee_project_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_employee_progress(e_id uuid)
 RETURNS TABLE(id bigint, title text, description text, image_url text, sent_date timestamp with time zone, parent_id bigint, media jsonb, project jsonb, employee jsonb)
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  return query (
    select
      pg.id,
      pg.title,
      pg.description,
      pg.image_url,
      pg.sent_date,
      pg.parent_id,

      -- Aggregate media into JSONB array
      jsonb_agg(jsonb_build_object(
        'id', pm.id,
        'type', pm.type,
        'url', pm.url
      )) as media,

      -- Embed project info as JSONB
      jsonb_build_object(
        'id', pj.id,
        'title', pj.title
      ) as project,

      -- Embed employee info as JSONB
      jsonb_build_object(
        'id', pf.id,
        'full_name', pf.full_name
      ) as employee

    from public.progress pg
    left join public.progress_media pm on pg.id = pm.progress_id
    inner join public.project pj on pg.project_id = pj.id
    inner join public.employee e on pg.employee_id = e.id
    inner join public.profile pf on pf.id = e.id
    where pg.employee_id = e_id
      and pg.parent_id is null
      and exists (
        select 1
        from public.project_employee pe
        where pe.employee_id = e.id
          and pe.project_id = pj.id
      )
    group by pg.id, pg.title, pg.description, pg.image_url, pg.sent_date, pg.parent_id, pj.id, pj.title, pf.id, pf.full_name
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$
;

grant delete on table "public"."boss" to "anon";

grant insert on table "public"."boss" to "anon";

grant references on table "public"."boss" to "anon";

grant select on table "public"."boss" to "anon";

grant trigger on table "public"."boss" to "anon";

grant truncate on table "public"."boss" to "anon";

grant update on table "public"."boss" to "anon";

grant delete on table "public"."boss" to "authenticated";

grant insert on table "public"."boss" to "authenticated";

grant references on table "public"."boss" to "authenticated";

grant select on table "public"."boss" to "authenticated";

grant trigger on table "public"."boss" to "authenticated";

grant truncate on table "public"."boss" to "authenticated";

grant update on table "public"."boss" to "authenticated";

grant delete on table "public"."boss" to "service_role";

grant insert on table "public"."boss" to "service_role";

grant references on table "public"."boss" to "service_role";

grant select on table "public"."boss" to "service_role";

grant trigger on table "public"."boss" to "service_role";

grant truncate on table "public"."boss" to "service_role";

grant update on table "public"."boss" to "service_role";

grant delete on table "public"."employee" to "anon";

grant insert on table "public"."employee" to "anon";

grant references on table "public"."employee" to "anon";

grant select on table "public"."employee" to "anon";

grant trigger on table "public"."employee" to "anon";

grant truncate on table "public"."employee" to "anon";

grant update on table "public"."employee" to "anon";

grant delete on table "public"."employee" to "authenticated";

grant insert on table "public"."employee" to "authenticated";

grant references on table "public"."employee" to "authenticated";

grant select on table "public"."employee" to "authenticated";

grant trigger on table "public"."employee" to "authenticated";

grant truncate on table "public"."employee" to "authenticated";

grant update on table "public"."employee" to "authenticated";

grant delete on table "public"."employee" to "service_role";

grant insert on table "public"."employee" to "service_role";

grant references on table "public"."employee" to "service_role";

grant select on table "public"."employee" to "service_role";

grant trigger on table "public"."employee" to "service_role";

grant truncate on table "public"."employee" to "service_role";

grant update on table "public"."employee" to "service_role";

grant delete on table "public"."notification" to "anon";

grant insert on table "public"."notification" to "anon";

grant references on table "public"."notification" to "anon";

grant select on table "public"."notification" to "anon";

grant trigger on table "public"."notification" to "anon";

grant truncate on table "public"."notification" to "anon";

grant update on table "public"."notification" to "anon";

grant delete on table "public"."notification" to "authenticated";

grant insert on table "public"."notification" to "authenticated";

grant references on table "public"."notification" to "authenticated";

grant select on table "public"."notification" to "authenticated";

grant trigger on table "public"."notification" to "authenticated";

grant truncate on table "public"."notification" to "authenticated";

grant update on table "public"."notification" to "authenticated";

grant delete on table "public"."notification" to "service_role";

grant insert on table "public"."notification" to "service_role";

grant references on table "public"."notification" to "service_role";

grant select on table "public"."notification" to "service_role";

grant trigger on table "public"."notification" to "service_role";

grant truncate on table "public"."notification" to "service_role";

grant update on table "public"."notification" to "service_role";

grant delete on table "public"."profile" to "anon";

grant insert on table "public"."profile" to "anon";

grant references on table "public"."profile" to "anon";

grant select on table "public"."profile" to "anon";

grant trigger on table "public"."profile" to "anon";

grant truncate on table "public"."profile" to "anon";

grant update on table "public"."profile" to "anon";

grant delete on table "public"."profile" to "authenticated";

grant insert on table "public"."profile" to "authenticated";

grant references on table "public"."profile" to "authenticated";

grant select on table "public"."profile" to "authenticated";

grant trigger on table "public"."profile" to "authenticated";

grant truncate on table "public"."profile" to "authenticated";

grant update on table "public"."profile" to "authenticated";

grant delete on table "public"."profile" to "service_role";

grant insert on table "public"."profile" to "service_role";

grant references on table "public"."profile" to "service_role";

grant select on table "public"."profile" to "service_role";

grant trigger on table "public"."profile" to "service_role";

grant truncate on table "public"."profile" to "service_role";

grant update on table "public"."profile" to "service_role";

grant delete on table "public"."progress" to "anon";

grant insert on table "public"."progress" to "anon";

grant references on table "public"."progress" to "anon";

grant select on table "public"."progress" to "anon";

grant trigger on table "public"."progress" to "anon";

grant truncate on table "public"."progress" to "anon";

grant update on table "public"."progress" to "anon";

grant delete on table "public"."progress" to "authenticated";

grant insert on table "public"."progress" to "authenticated";

grant references on table "public"."progress" to "authenticated";

grant select on table "public"."progress" to "authenticated";

grant trigger on table "public"."progress" to "authenticated";

grant truncate on table "public"."progress" to "authenticated";

grant update on table "public"."progress" to "authenticated";

grant delete on table "public"."progress" to "service_role";

grant insert on table "public"."progress" to "service_role";

grant references on table "public"."progress" to "service_role";

grant select on table "public"."progress" to "service_role";

grant trigger on table "public"."progress" to "service_role";

grant truncate on table "public"."progress" to "service_role";

grant update on table "public"."progress" to "service_role";

grant delete on table "public"."progress_media" to "anon";

grant insert on table "public"."progress_media" to "anon";

grant references on table "public"."progress_media" to "anon";

grant select on table "public"."progress_media" to "anon";

grant trigger on table "public"."progress_media" to "anon";

grant truncate on table "public"."progress_media" to "anon";

grant update on table "public"."progress_media" to "anon";

grant delete on table "public"."progress_media" to "authenticated";

grant insert on table "public"."progress_media" to "authenticated";

grant references on table "public"."progress_media" to "authenticated";

grant select on table "public"."progress_media" to "authenticated";

grant trigger on table "public"."progress_media" to "authenticated";

grant truncate on table "public"."progress_media" to "authenticated";

grant update on table "public"."progress_media" to "authenticated";

grant delete on table "public"."progress_media" to "service_role";

grant insert on table "public"."progress_media" to "service_role";

grant references on table "public"."progress_media" to "service_role";

grant select on table "public"."progress_media" to "service_role";

grant trigger on table "public"."progress_media" to "service_role";

grant truncate on table "public"."progress_media" to "service_role";

grant update on table "public"."progress_media" to "service_role";

grant delete on table "public"."project" to "anon";

grant insert on table "public"."project" to "anon";

grant references on table "public"."project" to "anon";

grant select on table "public"."project" to "anon";

grant trigger on table "public"."project" to "anon";

grant truncate on table "public"."project" to "anon";

grant update on table "public"."project" to "anon";

grant delete on table "public"."project" to "authenticated";

grant insert on table "public"."project" to "authenticated";

grant references on table "public"."project" to "authenticated";

grant select on table "public"."project" to "authenticated";

grant trigger on table "public"."project" to "authenticated";

grant truncate on table "public"."project" to "authenticated";

grant update on table "public"."project" to "authenticated";

grant delete on table "public"."project" to "service_role";

grant insert on table "public"."project" to "service_role";

grant references on table "public"."project" to "service_role";

grant select on table "public"."project" to "service_role";

grant trigger on table "public"."project" to "service_role";

grant truncate on table "public"."project" to "service_role";

grant update on table "public"."project" to "service_role";

grant delete on table "public"."project_employee" to "anon";

grant insert on table "public"."project_employee" to "anon";

grant references on table "public"."project_employee" to "anon";

grant select on table "public"."project_employee" to "anon";

grant trigger on table "public"."project_employee" to "anon";

grant truncate on table "public"."project_employee" to "anon";

grant update on table "public"."project_employee" to "anon";

grant delete on table "public"."project_employee" to "authenticated";

grant insert on table "public"."project_employee" to "authenticated";

grant references on table "public"."project_employee" to "authenticated";

grant select on table "public"."project_employee" to "authenticated";

grant trigger on table "public"."project_employee" to "authenticated";

grant truncate on table "public"."project_employee" to "authenticated";

grant update on table "public"."project_employee" to "authenticated";

grant delete on table "public"."project_employee" to "service_role";

grant insert on table "public"."project_employee" to "service_role";

grant references on table "public"."project_employee" to "service_role";

grant select on table "public"."project_employee" to "service_role";

grant trigger on table "public"."project_employee" to "service_role";

grant truncate on table "public"."project_employee" to "service_role";

grant update on table "public"."project_employee" to "service_role";

create policy "Enable bosses to see their own data"
on "public"."boss"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));


create policy "Enable bosses to see their employees data"
on "public"."employee"
as permissive
for select
to authenticated
using ((( SELECT private.get_user_role() AS get_user_role) = 'boss'::text));


create policy "Enable employees to see their own data"
on "public"."employee"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));


create policy "Enable bosses to see their employees profiles"
on "public"."profile"
as permissive
for select
to authenticated
using (( SELECT private.is_boss(profile.id) AS is_profile_boss));


create policy "Enable users to see their own profile"
on "public"."profile"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));


create policy "Enable bosses to see the progress of their projects"
on "public"."progress"
as permissive
for select
to authenticated
using (( SELECT private.is_progress_boss(progress.project_id) AS is_progress_boss));


create policy "Enable employees to create progress"
on "public"."progress"
as permissive
for insert
to authenticated
with check (( SELECT private.is_progress_creator(progress.employee_id, progress.project_id) AS is_progress_creator));


create policy "Enable employees to see the progress of their projects"
on "public"."progress"
as permissive
for select
to authenticated
using (( SELECT private.is_progress_creator(progress.employee_id, progress.project_id) AS is_progress_creator));


create policy "Enable bosses to see the progress media of their projects"
on "public"."progress_media"
as permissive
for select
to authenticated
using (( SELECT private.is_progress_media_boss(progress_media.progress_id) AS is_progress_media_boss));


create policy "Enable employees to create progress media"
on "public"."progress_media"
as permissive
for insert
to authenticated
with check (( SELECT private.is_progress_media_employee(progress_media.progress_id) AS is_progress_media_employee));


create policy "Enable employees to see the progress media of their projects"
on "public"."progress_media"
as permissive
for select
to authenticated
using (( SELECT private.is_progress_media_employee(progress_media.progress_id) AS is_progress_media_employee));


create policy "Allow bosses to update their own projects"
on "public"."project"
as permissive
for update
to authenticated
using (((( SELECT private.get_user_role() AS get_user_role) = 'boss'::text) AND (( SELECT auth.uid() AS uid) = boss_id)))
with check (((( SELECT private.get_user_role() AS get_user_role) = 'boss'::text) AND (( SELECT auth.uid() AS uid) = boss_id)));


create policy "Enable bosses to create new projects"
on "public"."project"
as permissive
for insert
to authenticated
with check (((( SELECT private.get_user_role() AS get_user_role) = 'boss'::text) AND (( SELECT auth.uid() AS uid) = boss_id)));


create policy "Enable bosses to see their own projects"
on "public"."project"
as permissive
for select
to authenticated
using (((( SELECT private.get_user_role() AS get_user_role) = 'boss'::text) AND (( SELECT auth.uid() AS uid) = boss_id)));


create policy "Enable employees to see the projects they are part of"
on "public"."project"
as permissive
for select
to authenticated
using (( SELECT private.is_employee_of_project(project.id) AS is_employee_of_project));


create policy "Enable bosses to create project-employee relationships"
on "public"."project_employee"
as permissive
for insert
to authenticated
with check (( SELECT private.is_project_employee_boss(project_employee.project_id) AS is_project_employee_boss));


create policy "Enable bosses to delete project-employee relationships"
on "public"."project_employee"
as permissive
for delete
to authenticated
using (( SELECT private.is_project_employee_boss(project_employee.project_id) AS is_project_employee_boss));


create policy "Enable bosses to see the project-employee relationships they ar"
on "public"."project_employee"
as permissive
for select
to authenticated
using (( SELECT private.is_project_employee_boss(project_employee.project_id) AS is_project_employee_boss));


create policy "Enable employees to see the project-employee relationships they"
on "public"."project_employee"
as permissive
for select
to authenticated
using (((( SELECT private.get_user_role() AS get_user_role) = 'employee'::text) AND (( SELECT auth.uid() AS uid) = employee_id)));


create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types) values ('media', 'media', true, 52428800, ARRAY['image/*', 'video/*']);

create policy "Give users authenticated upload access to media"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'media'::text) AND (auth.role() = 'authenticated'::text)));

