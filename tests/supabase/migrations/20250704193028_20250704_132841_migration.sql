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
    "title" text not null,
    "description" text not null,
    "image_url" text,
    "sent_date" timestamp with time zone not null default now(),
    "parent_id" bigint,
    "employee_id" uuid not null,
    "project_id" bigint not null
);


alter table "public"."progress" enable row level security;

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

CREATE UNIQUE INDEX progress_pkey ON public.progress USING btree (id);

CREATE UNIQUE INDEX project_employee_pkey ON public.project_employee USING btree (project_id, employee_id);

CREATE UNIQUE INDEX project_pkey ON public.project USING btree (id);

alter table "public"."boss" add constraint "boss_pkey" PRIMARY KEY using index "boss_pkey";

alter table "public"."employee" add constraint "employee_pkey" PRIMARY KEY using index "employee_pkey";

alter table "public"."notification" add constraint "notification_pkey" PRIMARY KEY using index "notification_pkey";

alter table "public"."profile" add constraint "profile_pkey" PRIMARY KEY using index "profile_pkey";

alter table "public"."progress" add constraint "progress_pkey" PRIMARY KEY using index "progress_pkey";

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

alter table "public"."project" add constraint "project_boss_id_fkey" FOREIGN KEY (boss_id) REFERENCES boss(id) ON DELETE CASCADE not valid;

alter table "public"."project" validate constraint "project_boss_id_fkey";

alter table "public"."project_employee" add constraint "project_employee_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE not valid;

alter table "public"."project_employee" validate constraint "project_employee_employee_id_fkey";

alter table "public"."project_employee" add constraint "project_employee_project_id_fkey" FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE not valid;

alter table "public"."project_employee" validate constraint "project_employee_project_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_employee_progress(e_id uuid)
 RETURNS TABLE(id bigint, title text, description text, image_url text, sent_date timestamp with time zone, parent_id bigint, employee_id uuid, employee_full_name character varying, project_id bigint, project_title text)
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  return query (SELECT pg.id, pg.title, pg.description, pg.image_url, pg.sent_date, pg.parent_id,
  pg.employee_id, pf.full_name as employee_full_name, pg.project_id, pj.title as project_title
 from public.progress pg
  inner join public.project pj on pg.project_id = pj.id
  inner join public.employee e on pg.employee_id = e.id
  inner join public.profile pf on (pf.id = e.id and exists(select 1 from public.project_employee where project_employee.employee_id = e.id and project_employee.project_id = pj.id))
   where pg.employee_id = e_id and pg.parent_id is null);
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



revoke delete on table "storage"."migrations" from "anon";

revoke insert on table "storage"."migrations" from "anon";

revoke references on table "storage"."migrations" from "anon";

revoke select on table "storage"."migrations" from "anon";

revoke trigger on table "storage"."migrations" from "anon";

revoke truncate on table "storage"."migrations" from "anon";

revoke update on table "storage"."migrations" from "anon";

revoke delete on table "storage"."migrations" from "authenticated";

revoke insert on table "storage"."migrations" from "authenticated";

revoke references on table "storage"."migrations" from "authenticated";

revoke select on table "storage"."migrations" from "authenticated";

revoke trigger on table "storage"."migrations" from "authenticated";

revoke truncate on table "storage"."migrations" from "authenticated";

revoke update on table "storage"."migrations" from "authenticated";

revoke delete on table "storage"."migrations" from "postgres";

revoke insert on table "storage"."migrations" from "postgres";

revoke references on table "storage"."migrations" from "postgres";

revoke select on table "storage"."migrations" from "postgres";

revoke trigger on table "storage"."migrations" from "postgres";

revoke truncate on table "storage"."migrations" from "postgres";

revoke update on table "storage"."migrations" from "postgres";

revoke delete on table "storage"."migrations" from "service_role";

revoke insert on table "storage"."migrations" from "service_role";

revoke references on table "storage"."migrations" from "service_role";

revoke select on table "storage"."migrations" from "service_role";

revoke trigger on table "storage"."migrations" from "service_role";

revoke truncate on table "storage"."migrations" from "service_role";

revoke update on table "storage"."migrations" from "service_role";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION storage.enforce_bucket_name_length()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION storage.add_prefixes(_bucket_id text, _name text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$function$
;

CREATE OR REPLACE FUNCTION storage.delete_prefix(_bucket_id text, _name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.delete_prefix_hierarchy_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.extension(name text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$function$
;

CREATE OR REPLACE FUNCTION storage.filename(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$function$
;

CREATE OR REPLACE FUNCTION storage.foldername(name text)
 RETURNS text[]
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$function$
;

CREATE OR REPLACE FUNCTION storage.get_level(name text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$
SELECT array_length(string_to_array("name", '/'), 1);
$function$
;

CREATE OR REPLACE FUNCTION storage.get_prefix(name text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$function$
;

CREATE OR REPLACE FUNCTION storage.get_prefixes(name text)
 RETURNS text[]
 LANGUAGE plpgsql
 IMMUTABLE STRICT
AS $function$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.get_size_by_bucket()
 RETURNS TABLE(size bigint, bucket_id text)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$function$
;

CREATE OR REPLACE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text)
 RETURNS TABLE(key text, id text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text)
 RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.objects_insert_prefix_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.objects_update_prefix_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.operation()
 RETURNS text
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.prefixes_insert_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text)
 RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
 LANGUAGE plpgsql
AS $function$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$function$
;

CREATE OR REPLACE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text)
 RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
 LANGUAGE plpgsql
 STABLE
AS $function$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$function$
;

CREATE OR REPLACE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text)
 RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
 LANGUAGE plpgsql
 STABLE
AS $function$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$function$
;

CREATE OR REPLACE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text)
 RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$function$
;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types) values ('media', 'media', true, 52428800, ARRAY['image/*', 'video/*']);

create policy "Give users authenticated upload access to media 1ps738_0"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'media'::text) AND (auth.role() = 'authenticated'::text)));


CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


revoke delete on table "auth"."audit_log_entries" from "dashboard_user";

revoke insert on table "auth"."audit_log_entries" from "dashboard_user";

revoke references on table "auth"."audit_log_entries" from "dashboard_user";

revoke select on table "auth"."audit_log_entries" from "dashboard_user";

revoke trigger on table "auth"."audit_log_entries" from "dashboard_user";

revoke truncate on table "auth"."audit_log_entries" from "dashboard_user";

revoke update on table "auth"."audit_log_entries" from "dashboard_user";

revoke delete on table "auth"."flow_state" from "dashboard_user";

revoke insert on table "auth"."flow_state" from "dashboard_user";

revoke references on table "auth"."flow_state" from "dashboard_user";

revoke select on table "auth"."flow_state" from "dashboard_user";

revoke trigger on table "auth"."flow_state" from "dashboard_user";

revoke truncate on table "auth"."flow_state" from "dashboard_user";

revoke update on table "auth"."flow_state" from "dashboard_user";

revoke delete on table "auth"."identities" from "dashboard_user";

revoke insert on table "auth"."identities" from "dashboard_user";

revoke references on table "auth"."identities" from "dashboard_user";

revoke select on table "auth"."identities" from "dashboard_user";

revoke trigger on table "auth"."identities" from "dashboard_user";

revoke truncate on table "auth"."identities" from "dashboard_user";

revoke update on table "auth"."identities" from "dashboard_user";

revoke delete on table "auth"."instances" from "dashboard_user";

revoke insert on table "auth"."instances" from "dashboard_user";

revoke references on table "auth"."instances" from "dashboard_user";

revoke select on table "auth"."instances" from "dashboard_user";

revoke trigger on table "auth"."instances" from "dashboard_user";

revoke truncate on table "auth"."instances" from "dashboard_user";

revoke update on table "auth"."instances" from "dashboard_user";

revoke delete on table "auth"."mfa_amr_claims" from "dashboard_user";

revoke insert on table "auth"."mfa_amr_claims" from "dashboard_user";

revoke references on table "auth"."mfa_amr_claims" from "dashboard_user";

revoke select on table "auth"."mfa_amr_claims" from "dashboard_user";

revoke trigger on table "auth"."mfa_amr_claims" from "dashboard_user";

revoke truncate on table "auth"."mfa_amr_claims" from "dashboard_user";

revoke update on table "auth"."mfa_amr_claims" from "dashboard_user";

revoke delete on table "auth"."mfa_challenges" from "dashboard_user";

revoke insert on table "auth"."mfa_challenges" from "dashboard_user";

revoke references on table "auth"."mfa_challenges" from "dashboard_user";

revoke select on table "auth"."mfa_challenges" from "dashboard_user";

revoke trigger on table "auth"."mfa_challenges" from "dashboard_user";

revoke truncate on table "auth"."mfa_challenges" from "dashboard_user";

revoke update on table "auth"."mfa_challenges" from "dashboard_user";

revoke delete on table "auth"."mfa_factors" from "dashboard_user";

revoke insert on table "auth"."mfa_factors" from "dashboard_user";

revoke references on table "auth"."mfa_factors" from "dashboard_user";

revoke select on table "auth"."mfa_factors" from "dashboard_user";

revoke trigger on table "auth"."mfa_factors" from "dashboard_user";

revoke truncate on table "auth"."mfa_factors" from "dashboard_user";

revoke update on table "auth"."mfa_factors" from "dashboard_user";

revoke delete on table "auth"."one_time_tokens" from "dashboard_user";

revoke insert on table "auth"."one_time_tokens" from "dashboard_user";

revoke references on table "auth"."one_time_tokens" from "dashboard_user";

revoke select on table "auth"."one_time_tokens" from "dashboard_user";

revoke trigger on table "auth"."one_time_tokens" from "dashboard_user";

revoke truncate on table "auth"."one_time_tokens" from "dashboard_user";

revoke update on table "auth"."one_time_tokens" from "dashboard_user";

revoke delete on table "auth"."refresh_tokens" from "dashboard_user";

revoke insert on table "auth"."refresh_tokens" from "dashboard_user";

revoke references on table "auth"."refresh_tokens" from "dashboard_user";

revoke select on table "auth"."refresh_tokens" from "dashboard_user";

revoke trigger on table "auth"."refresh_tokens" from "dashboard_user";

revoke truncate on table "auth"."refresh_tokens" from "dashboard_user";

revoke update on table "auth"."refresh_tokens" from "dashboard_user";

revoke delete on table "auth"."saml_providers" from "dashboard_user";

revoke insert on table "auth"."saml_providers" from "dashboard_user";

revoke references on table "auth"."saml_providers" from "dashboard_user";

revoke select on table "auth"."saml_providers" from "dashboard_user";

revoke trigger on table "auth"."saml_providers" from "dashboard_user";

revoke truncate on table "auth"."saml_providers" from "dashboard_user";

revoke update on table "auth"."saml_providers" from "dashboard_user";

revoke delete on table "auth"."saml_relay_states" from "dashboard_user";

revoke insert on table "auth"."saml_relay_states" from "dashboard_user";

revoke references on table "auth"."saml_relay_states" from "dashboard_user";

revoke select on table "auth"."saml_relay_states" from "dashboard_user";

revoke trigger on table "auth"."saml_relay_states" from "dashboard_user";

revoke truncate on table "auth"."saml_relay_states" from "dashboard_user";

revoke update on table "auth"."saml_relay_states" from "dashboard_user";

revoke delete on table "auth"."schema_migrations" from "dashboard_user";

revoke insert on table "auth"."schema_migrations" from "dashboard_user";

revoke references on table "auth"."schema_migrations" from "dashboard_user";

revoke select on table "auth"."schema_migrations" from "dashboard_user";

revoke trigger on table "auth"."schema_migrations" from "dashboard_user";

revoke truncate on table "auth"."schema_migrations" from "dashboard_user";

revoke update on table "auth"."schema_migrations" from "dashboard_user";

revoke delete on table "auth"."schema_migrations" from "postgres";

revoke insert on table "auth"."schema_migrations" from "postgres";

revoke references on table "auth"."schema_migrations" from "postgres";

revoke trigger on table "auth"."schema_migrations" from "postgres";

revoke truncate on table "auth"."schema_migrations" from "postgres";

revoke update on table "auth"."schema_migrations" from "postgres";

revoke delete on table "auth"."sessions" from "dashboard_user";

revoke insert on table "auth"."sessions" from "dashboard_user";

revoke references on table "auth"."sessions" from "dashboard_user";

revoke select on table "auth"."sessions" from "dashboard_user";

revoke trigger on table "auth"."sessions" from "dashboard_user";

revoke truncate on table "auth"."sessions" from "dashboard_user";

revoke update on table "auth"."sessions" from "dashboard_user";

revoke delete on table "auth"."sso_domains" from "dashboard_user";

revoke insert on table "auth"."sso_domains" from "dashboard_user";

revoke references on table "auth"."sso_domains" from "dashboard_user";

revoke select on table "auth"."sso_domains" from "dashboard_user";

revoke trigger on table "auth"."sso_domains" from "dashboard_user";

revoke truncate on table "auth"."sso_domains" from "dashboard_user";

revoke update on table "auth"."sso_domains" from "dashboard_user";

revoke delete on table "auth"."sso_providers" from "dashboard_user";

revoke insert on table "auth"."sso_providers" from "dashboard_user";

revoke references on table "auth"."sso_providers" from "dashboard_user";

revoke select on table "auth"."sso_providers" from "dashboard_user";

revoke trigger on table "auth"."sso_providers" from "dashboard_user";

revoke truncate on table "auth"."sso_providers" from "dashboard_user";

revoke update on table "auth"."sso_providers" from "dashboard_user";

revoke delete on table "auth"."users" from "dashboard_user";

revoke insert on table "auth"."users" from "dashboard_user";

revoke references on table "auth"."users" from "dashboard_user";

revoke select on table "auth"."users" from "dashboard_user";

revoke trigger on table "auth"."users" from "dashboard_user";

revoke truncate on table "auth"."users" from "dashboard_user";

revoke update on table "auth"."users" from "dashboard_user";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION auth.email()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$function$
;

CREATE OR REPLACE FUNCTION auth.jwt()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$function$
;

CREATE OR REPLACE FUNCTION auth.role()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$function$
;

CREATE OR REPLACE FUNCTION auth.uid()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$function$
;


