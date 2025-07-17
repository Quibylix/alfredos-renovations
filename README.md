# Alfredo's Renovations

A web application to manage projects and tasks for Alfredo Renovations company.

## Prerequisites

- Node.js (v18 or later)
- Pnpm (v8 or later)
- A supabase project

### Firebase configuration

1. Create a Firebase Cloud Messaging project and add the following environment variables to your `.env.local` file:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
  - `FIREBASE_SERVICE_ACCOUNT_JSON`
2. Modify the firebase configuration in the service worker file `public/firebase-messaging-sw.js` to include the Firebase Cloud Messaging configuration. 

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

