# Alfredo's Renovations

A web application to manage projects and tasks for Alfredo Renovations company.

## Prerequisites

- Node.js (v18 or later)
- Pnpm (v8 or later)
- A supabase project

## Tests

### Prerequisites

- Node.js (v18 or later)
- Pnpm (v8 or later)
- Docker (only for the e2e tests)

### Running the tests

1. Run `pnpm install` to install the dependencies.
2. Run `pnpm supabase:reset:test` to configure a local supabase instance for the tests.
3. Configure the `.env.test.local` file following the `.env.example` file with the database information showed in the terminal after running the command in step 2.
4. Run `pnpm test:e2e` to run the e2e tests. This will start a docker container with a supabase instance and run the tests against it.

The next time you run the tests you can just run `pnpm test:e2e` again, the container will be reused.

