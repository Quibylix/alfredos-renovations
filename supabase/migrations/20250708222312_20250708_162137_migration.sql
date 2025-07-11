alter table "public"."task" drop column "duration";

alter table "public"."task" add column "end_date" timestamp with time zone not null;


