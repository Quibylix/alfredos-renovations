# Alfredo's Renovations

A web application to manage projects and tasks for Alfredo Renovations company.

## Prerequisites

- Node.js (v18 or later)
- Pnpm (v8 or later)
- A supabase project

## Supabase configuration

1. Create a new Supabase project.
2. Disable email confirmation in the authentication settings.
3. Disable allow new users to sign up in the authentication settings.
4. Create a bucket in Supabase Storage named `images`, set as public, the mime type to `image/*`, and the max-file size to 5MB.
5. Run the `src/features/db/supabase/schema.sql` script in the sql editor to create the database schema and set the policies.

