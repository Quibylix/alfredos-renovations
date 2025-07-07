alter table "public"."task" add column "boss_id" uuid not null;

alter table "public"."task" add constraint "task_boss_id_fkey" FOREIGN KEY (boss_id) REFERENCES boss(id) ON DELETE CASCADE not valid;

alter table "public"."task" validate constraint "task_boss_id_fkey";


