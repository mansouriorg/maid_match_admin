This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Admin login

The login page (`app/page.tsx`) calls `POST /auth/login` on the API set in `NEXT_PUBLIC_API_URL`.
The API answers `{ "access_token": "..." }`. The token is kept in local storage and in a cookie
named `adminToken`, and `lib/api.ts` sends it as `Authorization: Bearer <token>` on every call.

- `proxy.ts` only checks that the cookie looks like a JWT that has not expired. It is a convenience
  that sends visitors to the login page. It cannot check the signature, so the API must refuse
  requests without a valid token.
- When the API answers 401 "Unauthorized", the session is cleared and the login page is shown.

## Times

Every booking time is shown and typed in Paris time (Europe/Paris), wherever the
admin is. The API stores times in UTC. The conversions are in `lib/time.ts`.

## Live notifications

The admin opens a Socket.IO connection to the API only while a session is valid
(`lib/socket.ts`, `components/SocketListener.tsx`). It sends the login token when it
connects, and the API refuses a socket without a valid token.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
