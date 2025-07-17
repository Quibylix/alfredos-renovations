create table "public"."profile_fcm_token" (
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone,
    "profile_id" uuid not null,
    "token" text not null
);


alter table "public"."profile_fcm_token" enable row level security;

alter table "public"."profile" drop column "fcm_token";

CREATE UNIQUE INDEX profile_fcm_token_pkey ON public.profile_fcm_token USING btree (token);

CREATE UNIQUE INDEX profile_fcm_token_token_key ON public.profile_fcm_token USING btree (token);

alter table "public"."profile_fcm_token" add constraint "profile_fcm_token_pkey" PRIMARY KEY using index "profile_fcm_token_pkey";

alter table "public"."profile_fcm_token" add constraint "profile_fcm_token_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE not valid;

alter table "public"."profile_fcm_token" validate constraint "profile_fcm_token_profile_id_fkey";

alter table "public"."profile_fcm_token" add constraint "profile_fcm_token_token_key" UNIQUE using index "profile_fcm_token_token_key";

grant delete on table "public"."profile_fcm_token" to "anon";

grant insert on table "public"."profile_fcm_token" to "anon";

grant references on table "public"."profile_fcm_token" to "anon";

grant select on table "public"."profile_fcm_token" to "anon";

grant trigger on table "public"."profile_fcm_token" to "anon";

grant truncate on table "public"."profile_fcm_token" to "anon";

grant update on table "public"."profile_fcm_token" to "anon";

grant delete on table "public"."profile_fcm_token" to "authenticated";

grant insert on table "public"."profile_fcm_token" to "authenticated";

grant references on table "public"."profile_fcm_token" to "authenticated";

grant select on table "public"."profile_fcm_token" to "authenticated";

grant trigger on table "public"."profile_fcm_token" to "authenticated";

grant truncate on table "public"."profile_fcm_token" to "authenticated";

grant update on table "public"."profile_fcm_token" to "authenticated";

grant delete on table "public"."profile_fcm_token" to "service_role";

grant insert on table "public"."profile_fcm_token" to "service_role";

grant references on table "public"."profile_fcm_token" to "service_role";

grant select on table "public"."profile_fcm_token" to "service_role";

grant trigger on table "public"."profile_fcm_token" to "service_role";

grant truncate on table "public"."profile_fcm_token" to "service_role";

grant update on table "public"."profile_fcm_token" to "service_role";


