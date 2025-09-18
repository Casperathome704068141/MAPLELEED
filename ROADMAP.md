# VisaPilot: Launch Roadmap

This document translates the current MVP into a launch-ready product plan. Use it as the source of truth for engineering, content, and operations workstreams.

## ✅ MVP Pillars (Complete)

- **Flight search & booking:** Duffel integration delivers full search → itinerary review → booking with the $75 VisaPilot markup.
- **Study package payments:** Stripe Checkout is live for tiers and add-ons.
- **AI tools:** Consultation summaries, document checklists, and the AI course finder are functioning.
- **Appointment booking (v1):** Users can request consultations and the system persists them to the server-managed JSON store.

## 🚀 Launch Blockers (High Priority)

1. **Migrate appointments to a managed database**
   - [ ] Replace the JSON file with Firestore (or another persistent store).
   - [ ] Update admin pages to read/write from the database.
   - [ ] Introduce status management (new / confirmed / completed / cancelled).
2. **Secure the admin experience**
   - [ ] Choose an auth provider (Firebase Auth, NextAuth.js, Clerk, etc.).
   - [ ] Protect every route and API endpoint under `/admin`.
   - [ ] Add role-based access for future staff users.
3. **Automate transactional email**
   - [ ] Send confirmation emails to students and admins for bookings and purchases.
   - [ ] Template notifications for cancellations or reschedules.
   - [ ] Evaluate reminder emails (24 hours before consultation).
4. **Replace placeholder assets & copy**
   - [ ] Swap out stock/placeholder imagery across marketing and admin pages.
   - [ ] Refresh admin dashboard stats and labels with real data descriptions.
   - [ ] Confirm policy pages and links point to final legal content.
5. **Final QA & deployment**
   - [ ] Execute end-to-end smoke tests for every flow (booking, payments, AI tools, travel search).
   - [ ] Provision production hosting (Vercel + Fly.io/Render) and migrate environment variables.
   - [ ] Configure monitoring, analytics, and error reporting.

## 📈 Enhancements After Launch

### Admin automation
- [ ] CRUD for study resources with public-facing distribution.
- [ ] Export appointments and payments as CSV or integrate with a CRM.
- [ ] Dashboard insights powered by live metrics.

### AI tooling
- [ ] Persist generated summaries/checklists per student and allow edits.
- [ ] Add version history for regenerated outputs.
- [ ] Improve prompts with examples and domain-specific guardrails.

### Travel & monetization
- [ ] Expand beyond flights to include accommodations or ground transport.
- [ ] Track commissions/earnings inside the admin dashboard.
- [ ] Offer bundles that combine travel, study packages, and consultations.

### Experience polish
- [ ] Perform a responsive design audit across devices.
- [ ] Improve accessibility (ARIA, keyboard nav, focus states).
- [ ] Localize key flows for additional markets.

Maintain this roadmap collaboratively—update statuses after each milestone so the team always knows what is left before the public launch.
