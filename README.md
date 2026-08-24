# Roomi — Portfolio (MERN)

A full-stack developer portfolio with a public site and a secure, database-driven admin panel. Content (profile, projects, skills, contact messages) is managed through the admin UI rather than hardcoded, so the site is effectively a small CMS.

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios, react-hot-toast
- **Backend:** Node.js, Express 5, MongoDB (Mongoose)
- **Auth:** JWT + bcrypt, role-based access control
- **Media:** Cloudinary (project images + CV upload)
- **Email:** Brevo transactional API (contact notifications + auto-reply)
- **Hardening:** Helmet, CORS allow-list, express-rate-limit, express-validator

## Project structure

```
My Portfolio/
├── client/            # React + Vite frontend
│   └── src/
│       ├── components/ (home, admin, common)
│       ├── pages/      (Home, Work, Skills, About, Contact, Admin, Login, Signup)
│       ├── context/    (AuthContext)
│       └── services/   (axios instance)
└── server/            # Express API
    ├── config/         (db, cloudinary)
    ├── controllers/    (auth, project, skill, message, profile)
    ├── middleware/     (auth, requireAdmin, validate, rateLimit, upload, errorHandler)
    ├── models/         (User, Admin, Project, Skill, Message, Profile)
    ├── routes/
    └── seed.js         (creates the admin account)
```

## Getting started

### Prerequisites
- Node.js 18+
- A MongoDB database (Atlas or local)
- A Cloudinary account
- A Brevo account with a verified sender address (for contact emails)

### 1. Backend

```bash
cd server
cp .env.example .env      # then fill in your real values
npm install
npm run seed              # creates the admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev               # starts on http://localhost:5000
```

Then **log in once** with `ADMIN_EMAIL` / `ADMIN_PASSWORD` to activate the admin account. Registering through the signup form never grants admin — see [Admin accounts](#admin-accounts).

### 2. Frontend

```bash
cd client
cp .env.example .env      # VITE_API_URL defaults to http://localhost:5000/api
npm install
npm run dev               # starts on http://localhost:5173
```

## Environment variables

All configuration lives in environment variables — no secret is hardcoded anywhere in the source. See [`server/.env.example`](server/.env.example) and [`client/.env.example`](client/.env.example) for the full annotated list.

| Variable | Side | Secret? |
| --- | --- | --- |
| `PORT`, `NODE_ENV` | Server | No |
| `CLIENT_URL` | Server | No — CORS allow-list (comma-separated origins) |
| `MONGO_URI` | Server | **Yes** — contains the DB password |
| `JWT_SECRET` | Server | **Yes** — signs every session token |
| `ADMIN_EMAIL` | Server | No |
| `ADMIN_PASSWORD` | Server | **Yes** — seed-time only, removable afterwards |
| `CLOUDINARY_CLOUD_NAME` | Server | No — appears in public delivery URLs |
| `CLOUDINARY_API_KEY` / `_API_SECRET` | Server | **Yes** |
| `BREVO_API_KEY` | Server | **Yes** |
| `BREVO_SENDER_EMAIL` / `_SENDER_NAME` | Server | No |
| `VITE_API_URL` | Client | No — public by design |

> **Never commit real `.env` files.** They are gitignored; only the `.env.example` templates are tracked.

### Client-side exposure rule

Vite inlines every `VITE_`-prefixed variable into the JavaScript bundle served to the browser (the same applies to `NEXT_PUBLIC_` in Next.js and `REACT_APP_` in Create React App). Anyone can read those values with View Source.

This app deliberately exposes exactly one: `VITE_API_URL`, which is just an address. **Never add a `VITE_` variable for an API secret, database URL, OAuth client secret, or signing key.** If the browser needs data that requires a secret, add a backend route that uses the secret server-side and returns only the result.

For reference, if this project later adds these services:

- **Supabase** — the `anon` key may go client-side *only if* Row Level Security is enabled on **every** table. Without RLS, that key exposes the entire database. The `service_role` key bypasses RLS and must never appear in client code, a `VITE_`/`NEXT_PUBLIC_` variable, or a committed file.
- **Stripe** — only the publishable key (`pk_…`) goes client-side. The secret key (`sk_…`) and webhook signing secret are server-side only.
- **OAuth client secrets, JWT signing secrets, OpenAI/SendGrid/Twilio/AWS keys** — server-side only, without exception.

## Secrets checklist before deploying

1. **Rotate anything that has ever been shared or committed.** Treat a secret as burned the moment it lands in git history, a screenshot, a chat message, or a log. Removing it from the current files is not enough — `git log -p` still has the old value, and so does every clone and fork. If a secret was ever committed, rotate it at the provider and then scrub history with [`git filter-repo`](https://github.com/newren/git-filter-repo) or [BFG](https://rtyley.github.io/bfg-repo-cleaner/), then force-push.
   - Rotate `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` (this logs out all existing sessions).
   - Rotate `BREVO_API_KEY` in Brevo → Settings → SMTP & API → API Keys (revoke the old one).
   - Rotate `CLOUDINARY_API_SECRET` in the Cloudinary console → Settings → Access Keys.
   - Rotate the MongoDB user password in Atlas → Database Access, then update `MONGO_URI`.
   - Change the admin password from the admin panel (Settings → Password).
2. **Set `NODE_ENV=production`** on the host, so 500 responses return a generic message instead of internal error text.
3. **Set `CLIENT_URL`** to your deployed frontend origin(s). If it is unset, CORS falls back to `http://localhost:5173` and the deployed frontend will be blocked.
4. **Use a strong, unique `ADMIN_PASSWORD`** for seeding, then remove it from the host's environment — after `npm run seed` the password lives hashed in the database and the variable is no longer needed.
5. **Set the environment variables in your host's dashboard** (Render/Vercel/Railway secret manager), not in a deployed file.
6. **Confirm nothing leaked into the build:** `npm run build --prefix client` then search `client/dist` for any secret value. Only `VITE_API_URL` should be present.

## Security model

- **Authentication:** JWT (7-day expiry), passwords hashed with bcrypt.
- **Session revocation:** every authenticated request re-checks the account against the database, so a token stops working the moment the account is deleted, disabled (`isActive: false`), or has its password changed. `passwordChangedAt` invalidates all tokens issued before it — changing your password really does end every other session, rather than leaving a stolen token valid for its full 7 days. The session that made the change gets a fresh token back.
- **Authorization:** Public read routes are open; every write/admin route is protected by `auth` **and** `requireAdmin`. The role is read from the database on each request, not trusted from the token claim, so a demotion takes effect immediately.
- **Email verification:** signup sends a 24-hour confirmation link (only a SHA-256 hash of the token is stored). Unverified accounts can use the site normally but receive no mail from it — which is what stops someone registering a stranger's address to make the site email them.
- **Input validation:** `express-validator` rules are enforced by a `validate` middleware on auth, contact, and skill routes.
- **Abuse protection:** Global rate limit on `/api`, stricter limits on auth endpoints and the contact form. HTML in contact emails is escaped. The contact auto-reply goes only to the sender's own confirmed account address, never to the free-text address in the form — otherwise the site's verified sender could be aimed at anyone.
- **Transport/headers:** Helmet security headers and a CORS origin allow-list.
- **Secret hygiene:** Every credential is read from `process.env`; none is hardcoded. [`server/utils/secrets.js`](server/utils/secrets.js) redacts credential-shaped strings (connection strings, bearer tokens, provider key formats, and the literal values of all secret env vars) plus emails and phone numbers from logs, and `sendServerError` keeps raw internal error messages out of API responses in production.

### Admin accounts

`npm run seed` is the **only** way an account becomes an admin. Registration always creates a plain `user`, and the role is never read from a request body.

This matters: an earlier version granted the admin role to whoever registered with `ADMIN_EMAIL`. Because that address is published on the contact page, anyone could have claimed the admin account on a fresh deploy — no password needed — since the seeded credentials live in the legacy `admins` collection and registration only checked `users`. Registration now also rejects addresses held in `admins`.

To promote an existing account, set `ADMIN_EMAIL` to its address and re-run `npm run seed`; it promotes in place instead of creating a duplicate.

## API overview

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/auth/register` \| `/login` | Public |
| POST | `/api/auth/verify-email` | Public (emailed token is the credential) |
| POST | `/api/auth/resend-verification` | Authenticated |
| GET | `/api/auth/me` \| `/is-admin` | Authenticated |
| PUT | `/api/auth/change-password` | Authenticated |
| DELETE | `/api/auth/me` | Authenticated (erases the caller's own data) |
| GET | `/api/projects` \| `/api/projects/:id` | Public |
| POST/PUT/DELETE | `/api/projects...` | Admin |
| GET | `/api/skills` | Public |
| POST/PUT/DELETE | `/api/skills...` | Admin |
| POST | `/api/messages` | Authenticated (rate-limited) |
| GET/PUT/DELETE | `/api/messages...` | Admin |
| GET | `/api/profile` | Public |
| PUT / upload | `/api/profile...` | Admin |
