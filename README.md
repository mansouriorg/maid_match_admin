# MaidMatch - admin

The back office of MaidMatch, a home-cleaning service in France. The team logs
in to see booking requests as they arrive, assign a staff member, follow each
intervention, and set the hourly rate.

This is one of three projects that work together:

| Project | Role | Main tools |
| --- | --- | --- |
| [maid_match](https://github.com/mansouriorg/maid_match) | Public booking site | Next.js 16, React 19, Tailwind CSS 4, Zustand |
| [maid_match_admin](https://github.com/mansouriorg/maid_match_admin) | Back office for the team | Next.js 16, Socket.IO client |
| [maid_match_serveur](https://github.com/mansouriorg/maid_match_serveur) | REST API and live notifications | NestJS 11, Prisma 7, PostgreSQL |

## What it does

- Dashboard: the latest requests, key numbers, and a live notification as soon
  as a visitor sends a booking, without reloading the page.
- Request page: the customer, the home, the days the customer is available,
  the assigned staff member, the status, the price and the payment.
- A weekly planning of the interventions.
- Staff directory: profiles, skills, languages, and a form to add a person.
- Audit log: which admin changed what, and when.
- Settings: company details and the hourly rate used for the estimates.
- Works on phones: a menu button replaces the sidebar on small screens.

Not built yet, and shown disabled or hidden on purpose: saving internal notes
on a request, downloading a CV, and the staff filters.

## Login and session

The login page (`app/page.tsx`) calls `POST /auth/login` on the API set in
`NEXT_PUBLIC_API_URL`. The API answers `{ "access_token": "..." }`. The token is
kept in local storage and in a cookie named `adminToken`, and `lib/api.ts` sends
it as `Authorization: Bearer <token>` on every call.

- `proxy.ts` only checks that the cookie looks like a JWT that has not expired.
  It is a convenience that sends visitors to the login page. It cannot check the
  signature, so the API refuses every request without a valid token.
- When the API answers 401 "Unauthorized", the session is cleared and the login
  page is shown.

## Times

Every booking time is shown and typed in Paris time (Europe/Paris), wherever the
admin is. The API stores times in UTC. The conversions are in `lib/time.ts`.

## Live notifications

The admin opens a Socket.IO connection to the API only while a session is valid
(`lib/socket.ts`, `components/SocketListener.tsx`). It sends the login token when
it connects, and the API refuses a socket without a valid token.

## Run it locally

Requirements: Node.js 24.22.1 or newer (`nvm use` picks version 24 from
`.nvmrc`) and pnpm 10. The API must be running on http://localhost:3000, and you
need an admin account (see "Before the first start" in the API README).

    cp .env.example .env
    pnpm install
    pnpm dev -p 3002

Then open http://localhost:3002 and log in.

## Settings

- `NEXT_PUBLIC_API_URL`: address of the API (default http://localhost:3000).
  This value is public: it ends up in the browser.

## Checks

    pnpm exec eslint .
    pnpm exec tsc --noEmit
    pnpm build

## Where things are

- `app/`: the login page (`app/page.tsx`), dashboard, planning, request page,
  staff, audit log and settings.
- `components/`: sidebar, dashboard numbers, new intervention form, live
  notification listener.
- `lib/`: `api.ts` (calls with the token), `auth.ts` (session), `socket.ts`,
  `time.ts` (Paris time).
- `proxy.ts`: sends visitors without a session to the login page.

## Dependencies

pnpm only installs package versions that are at least 14 days old
(`minimumReleaseAge` in `pnpm-workspace.yaml`). This protects against a
malicious version being published and installed before anyone notices. A
security fix that cannot wait is listed by name under
`minimumReleaseAgeExclude` and pinned to an exact version in `overrides`.
