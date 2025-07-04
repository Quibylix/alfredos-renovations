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
4. Create a bucket in Supabase Storage named `media`, set as public, the mime type to `image/*, video/*`, and the max-file size to 50MB.
5. Run the `src/features/db/supabase/schema.sql` script in the sql editor to create the database schema and set the policies.

## Tests

### Prerequisites

- Node.js (v18 or later)
- Pnpm (v8 or later)
- Docker (only for the e2e tests)

### Running the tests

1. Run `pnpm install` to install the dependencies.
2. Run `pnpm supabase:start:test` to start a local supabase instance for the tests.
3. Configure the supabase instance as shown in the [supabase configuration](#supabase-configuration) section.
3. Configure the `.env.test.local` file following the `.env.example` file with the database information showed in the terminal after running the command in step 2.
4. Run `pnpm test:e2e` to run the e2e tests. This will start a docker container with a supabase instance and run the tests against it.

The next time you run the tests you can just run `pnpm test:e2e` again, the container will be reused.

