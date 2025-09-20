# VisaPilot Platform

VisaPilot is a full-stack platform for international students planning their studies abroad. The application combines guided consultations, curated study packages, and travel booking tools so prospective students can plan end-to-end journeys in one place.

## Current MVP Highlights

- **Flight search & booking:** Users can search Duffel's inventory, review itineraries with VisaPilot's $75 service fee automatically applied, and complete bookings using the Duffel balance model.
- **Study package payments:** The study tiers and add-ons flow is wired to Stripe Checkout, enabling students to complete purchases from the UI.
- **AI-powered support:** Consultation summaries, document checklists, and the AI course finder are available to guide both advisors and students.
- **Consultation scheduling:** Students can request appointments through the site. Bookings are stored on the server and surfaced in the admin dashboard for manual follow-up.

## Launch-Critical Roadmap

These items are required before marketing the application to a wider audience:

1. **Harden appointment storage** – Replace the JSON file with a persistent database (e.g., Firebase Firestore) so meetings survive restarts and scale with traffic.
2. **Protect the admin suite** – Introduce authentication (Firebase Auth, NextAuth.js, or similar) and gate all routes under `/admin`.
3. **Automate notifications** – Send confirmation emails (and optionally reminders) to both students and staff after bookings or payment events.
4. **Swap placeholder content** – Finalize imagery, copywriting, and admin dashboard summaries so they reflect production messaging.
5. **Production readiness** – Complete end-to-end QA for every flow, then deploy the Next.js frontend (Vercel) and Node/Express services (Fly.io, Render, or similar) with environment variables configured.

Refer to [`ROADMAP.md`](ROADMAP.md) for detailed implementation tasks and nice-to-have enhancements.

## Repository Structure

```text
src/            # Next.js application (app router)
server/         # Express service for Duffel bookings & markup handling
components.json # shadcn/ui registry
```

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn or npm

Install dependencies:

```bash
yarn install
# or
npm install
```

### Environment Variables

Create a `.env.local` file at the project root and set the following keys:

```bash
DUFFEL_ACCESS_TOKEN=...
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:9002  # optional, used in Stripe helpers
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

The Express server in `server/` also expects `DUFFEL_ACCESS_TOKEN`. Create `server/.env` if you run it locally.

### Admin access & notifications

- `ADMIN_ALLOWED_EMAIL` (optional) – Email address that is allowed to access the admin panel. Defaults to `anthonyluci69@gmail.com`.
- `ADMIN_SHARED_SECRET` (optional) – Shared passphrase required during admin login. Defaults to `change-me`; update this in production.
- `TEAM_NOTIFICATIONS_EMAIL` (optional) – Additional address that should receive operational emails. MapleLeed always copies `anthonyluci69@gmail.com`.
- `EMAIL_FROM_ADDRESS` – Customise the sender identity for transactional email.

Admin access now relies on matching the configured email and shared secret—no Firebase client configuration is required for sign-in. All bookings, invoices, travel orders, and incident alerts are automatically delivered to `anthonyluci69@gmail.com`.

### Running the App Locally

Start the Next.js frontend on port 9002:

```bash
yarn dev
```

Start the Duffel Express bridge in another terminal:

```bash
cd server
npm install
npm start
```

The travel workflow relies on both services running concurrently.

### Useful Scripts

- `yarn lint` – Run Next.js lint checks.
- `yarn build` – Compile the production build.
- `yarn typecheck` – Run TypeScript in `--noEmit` mode.

## Testing & QA Checklist

- Book a consultation and confirm the record appears in the admin dashboard.
- Purchase each study package and add-on combination through Stripe Checkout.
- Search for flights, review itineraries, and complete a booking end-to-end.
- Validate that AI tools return relevant summaries, checklists, and course matches.

## Deployment Notes

- Deploy the Next.js app to Vercel (or another preferred platform) with the same environment variables configured as in development.
- Deploy the Express Duffel bridge to a Node-compatible host such as Fly.io or Render, and point the frontend to its public URL.
- Configure analytics and monitoring before launch to track conversions and identify regressions quickly.
- Apply the Firestore and Storage rules found in `firebase/firestore.rules` and `firebase/storage.rules` to secure appointment/order data while making the marketing assets folder publicly readable:

  ```bash
  firebase deploy --only firestore:rules
  firebase deploy --only storage:rules
  ```

## Contributing

1. Create a feature branch.
2. Make changes and ensure `yarn lint` passes.
3. Submit a pull request with a summary of changes and testing evidence.

---

For a detailed backlog of enhancements—AI tooling, admin automation, and internationalization plans—continue to maintain [`ROADMAP.md`](ROADMAP.md).
