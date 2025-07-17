alter table "public"."notification" add column "created_at" timestamp with time zone not null default now();

alter table "public"."profile" add column "fcm_token" text;


