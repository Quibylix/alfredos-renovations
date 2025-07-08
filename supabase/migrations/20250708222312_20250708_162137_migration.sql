alter table "public"."task" drop column "duration";

alter table "public"."task" add column "end_date" timestamp with time zone not null;

grant delete on table "public"."boss" to "prisma";

grant insert on table "public"."boss" to "prisma";

grant references on table "public"."boss" to "prisma";

grant select on table "public"."boss" to "prisma";

grant trigger on table "public"."boss" to "prisma";

grant truncate on table "public"."boss" to "prisma";

grant update on table "public"."boss" to "prisma";

grant delete on table "public"."employee" to "prisma";

grant insert on table "public"."employee" to "prisma";

grant references on table "public"."employee" to "prisma";

grant select on table "public"."employee" to "prisma";

grant trigger on table "public"."employee" to "prisma";

grant truncate on table "public"."employee" to "prisma";

grant update on table "public"."employee" to "prisma";

grant delete on table "public"."message" to "prisma";

grant insert on table "public"."message" to "prisma";

grant references on table "public"."message" to "prisma";

grant select on table "public"."message" to "prisma";

grant trigger on table "public"."message" to "prisma";

grant truncate on table "public"."message" to "prisma";

grant update on table "public"."message" to "prisma";

grant delete on table "public"."message_media" to "prisma";

grant insert on table "public"."message_media" to "prisma";

grant references on table "public"."message_media" to "prisma";

grant select on table "public"."message_media" to "prisma";

grant trigger on table "public"."message_media" to "prisma";

grant truncate on table "public"."message_media" to "prisma";

grant update on table "public"."message_media" to "prisma";

grant delete on table "public"."notification" to "prisma";

grant insert on table "public"."notification" to "prisma";

grant references on table "public"."notification" to "prisma";

grant select on table "public"."notification" to "prisma";

grant trigger on table "public"."notification" to "prisma";

grant truncate on table "public"."notification" to "prisma";

grant update on table "public"."notification" to "prisma";

grant delete on table "public"."profile" to "prisma";

grant insert on table "public"."profile" to "prisma";

grant references on table "public"."profile" to "prisma";

grant select on table "public"."profile" to "prisma";

grant trigger on table "public"."profile" to "prisma";

grant truncate on table "public"."profile" to "prisma";

grant update on table "public"."profile" to "prisma";

grant delete on table "public"."project" to "prisma";

grant insert on table "public"."project" to "prisma";

grant references on table "public"."project" to "prisma";

grant select on table "public"."project" to "prisma";

grant trigger on table "public"."project" to "prisma";

grant truncate on table "public"."project" to "prisma";

grant update on table "public"."project" to "prisma";

grant delete on table "public"."task" to "prisma";

grant insert on table "public"."task" to "prisma";

grant references on table "public"."task" to "prisma";

grant select on table "public"."task" to "prisma";

grant trigger on table "public"."task" to "prisma";

grant truncate on table "public"."task" to "prisma";

grant update on table "public"."task" to "prisma";

grant delete on table "public"."task_assignment" to "prisma";

grant insert on table "public"."task_assignment" to "prisma";

grant references on table "public"."task_assignment" to "prisma";

grant select on table "public"."task_assignment" to "prisma";

grant trigger on table "public"."task_assignment" to "prisma";

grant truncate on table "public"."task_assignment" to "prisma";

grant update on table "public"."task_assignment" to "prisma";

grant delete on table "public"."task_media" to "prisma";

grant insert on table "public"."task_media" to "prisma";

grant references on table "public"."task_media" to "prisma";

grant select on table "public"."task_media" to "prisma";

grant trigger on table "public"."task_media" to "prisma";

grant truncate on table "public"."task_media" to "prisma";

grant update on table "public"."task_media" to "prisma";


