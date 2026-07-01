# NombaFlow — Product Requirements Document (PRD)

**Project:** NombaFlow — Managed Recurring Billing Engine on Nomba
**Hackathon:** Nomba × DevCareer Hackathon 2026
**Track:** Infrastructure Track — Subscriptions Engine
**Document version:** 1.0
**Team:** Backend Developer, Full Stack Developer, AI Specialist

---

## 1. Purpose of This Document

This PRD scopes exactly what we are building during the hackathon window. It exists so that all four of us agree on the same definition of "done" before anyone writes code. If a feature is not listed under MVP Scope, it is not part of the hackathon build, no matter how good the idea sounds on day two.

---

## 2. Problem We Are Solving

Nigerian businesses that collect money on a recurring schedule, schools, cooperatives, SaaS products, churches, clinics, have no managed billing infrastructure to build on. They either build it themselves on raw payment APIs, which takes months, or they do it manually through WhatsApp and spreadsheets, which loses money every month through missed and failed payments.

Nomba's own Subscriptions Engine track states this directly: Nomba exposes payment primitives but does not ship a managed subscriptions layer, so teams keep rebuilding it from scratch.

---

## 3. What We Are Building

A web platform with two sides:

**The merchant side** — a business owner logs in, creates billing plans, enrolls customers, and watches a dashboard show who has paid, who is overdue, and what is coming in the next 90 days.

**The customer side** — a person paying into a plan (a parent, a cooperative member, a subscriber) gets a simple page to enroll their card, see what they owe, and manage their own subscription.

Behind both sides sits the billing engine: a system that automatically charges customers on schedule using Nomba's APIs, and an AI layer that makes failed payment recovery smarter than a fixed retry schedule.

---

## 4. Who This Is For (Hackathon Demo Personas)

We will demo against two concrete personas to keep the story simple:

**Persona A — Adaeze, school bursar.** Manages fee collection for a set of students. Needs to create a fee plan, enroll parents, and see who has paid.

**Persona B — Emeka, ajo group coordinator.** Runs a rotating savings group. Needs to set up the group, add members, and have contributions and payouts happen automatically.

We are not building separate apps for these two. Both run through the same NombaFlow engine, just configured differently (a standard plan vs. an ajo group plan).

---

## 5. MVP Scope (What We Are Actually Building in the Hackathon)

### 5.1 Must Have (the demo does not work without these)

| Feature | Description | Owner |
|---|---|---|
| Merchant registration and login | Email/password sign up, NestJS JWT + httpOnly cookies | Full Stack + Backend (#6, #9) |
| Connect Nomba credentials | Merchant enters Client ID, Client Secret, and Account ID; backend obtains OAuth token | Backend |
| Create a billing plan | Name, amount, currency, billing interval (weekly/monthly), number of cycles | Backend |
| Customer enrollment link | Generate a shareable link, customer completes Nomba Checkout, card gets tokenised | Backend + Full Stack |
| Automatic charge execution | Scheduler checks due subscriptions and calls Nomba tokenized-card-payment API | Backend |
| Webhook handling | Receive `payment_success` / `payment_failed` from Nomba, update subscription status | Backend |
| Basic dunning (fallback) | If AI service is unavailable, retry on a fixed 24/48/72 hour schedule | Backend |
| AI smart retry prediction | Model predicts best retry time per customer based on payment history | AI Specialist |
| Merchant dashboard | Shows active subscriptions, MRR, failed payments, simple charts | Full Stack |
| Customer self-service portal | Customer sees their plan, payment history, can update card | Full Stack |
| Ajo group module | Create a group, add members, weekly contribution collection, automatic payout to current beneficiary via Nomba Transfers | Backend |
| Email notifications | Payment success, payment failed, retry scheduled (via Resend) | Backend |

### 5.2 Should Have (build if time allows after Must Haves are solid)

- 90-day cash flow forecast chart on merchant dashboard
- Customer churn risk score visible to merchant
- Natural language insight box ("why did revenue drop") powered by Claude Haiku
- CSV export of transaction history

### 5.3 Will Not Build During Hackathon (explicitly out of scope)

- Proration on mid-cycle plan changes
- Multi-currency support beyond NGN
- WhatsApp notifications (email only for the demo)
- POS integration
- Multi-tenant white-labeling
- Installment plans for one-time purchases (clinics use case is described in the pitch but not built)

If a judge asks about these, the answer is: "Architected for, scoped out of the hackathon build, documented in our roadmap."

---

## 6. Screen Inventory

Every screen the team needs to build is listed here. This is the complete list. If a screen is not here, it is not being built during the hackathon.

### Merchant Facing Screens

| Screen | Route | Purpose | Data Needed |
|---|---|---|---|
| Register | `/register` | New merchant signs up | businessName, email, password |
| Login | `/login` | Returning merchant logs in | email, password |
| Onboarding: Connect Nomba | `/onboarding` | First screen after registration; enter Client ID, Client Secret, Account ID | nomba credentials form |
| Dashboard Overview | `/dashboard` | MRR, active subscribers, failed payments, upcoming charges, 90-day forecast chart | Analytics overview endpoint |
| Plans List | `/dashboard/plans` | All billing plans with subscriber counts | GET /plans |
| Create Plan | `/dashboard/plans/new` | Form to create a new plan | POST /plans |
| Plan Detail | `/dashboard/plans/:id` | One plan's subscribers, charge history, status breakdown | GET /plans/:id |
| Subscription Detail | `/dashboard/subscriptions/:id` | One subscriber's full record, dunning status, retry badge | GET /subscriptions/:id |
| Ajo Groups List | `/dashboard/ajo` | All ajo groups with round progress | GET /ajo-groups |
| Create Ajo Group | `/dashboard/ajo/new` | Form to create group with member rotation list | POST /ajo-groups |
| Ajo Group Detail | `/dashboard/ajo/:id` | Round status, member contributions, next payout | GET /ajo-groups/:id |
| Settings | `/dashboard/settings` | Business name, email, Nomba connection status | GET /merchants/me |

### Customer Facing Screens

| Screen | Route | Purpose | Data Needed |
|---|---|---|---|
| Enrollment Page | `/enroll/:planId` | Public page customer lands on from merchant link | GET /plans/:id (public fields only) |
| Enrollment Form | `/enroll/:planId/details` | Customer enters name, email, phone | POST /customers/enroll |
| Checkout Redirect | `/enroll/:planId/checkout` | Intermediate page before Nomba Checkout redirect | `checkoutLink` from enrollment response |
| Enrollment Success | `/enroll/:planId/success` | Confirmation page after card tokenisation | Static, no API call |
| Customer Portal | `/portal/:customerId` | Customer sees plan, payment history, card update option | GET /customers/:id/portal |

**Total: 17 screens across merchant and customer sides.**

---

## 7. Notification Content

These are the three emails Resend sends automatically. Defined here so the Backend Developer does not write placeholder text that ends up in the demo.

### Email 1: Payment Success

**Subject:** Your payment of ₦{amount} was received

**Body:**
```
Hi {customerName},

Your payment of ₦{amount} for {planName} was received successfully on {date}.

Next payment: ₦{amount} on {nextBillingDate}.

If you have any questions, contact {merchantBusinessName} directly.
```

### Email 2: Payment Failed

**Subject:** We could not process your payment for {planName}

**Body:**
```
Hi {customerName},

We tried to charge ₦{amount} for {planName} on {date} but the payment did not go through.

Reason: {failureReason}

We will try again on {retryDate}. Please make sure your card has sufficient funds by then.

To update your card details before the retry, visit: {portalLink}
```

### Email 3: Retry Scheduled

**Subject:** Payment retry scheduled for {retryDate}

**Body:**
```
Hi {customerName},

We are scheduling another attempt to collect ₦{amount} for {planName}.

Retry date: {retryDate}

If your card details have changed, please update them before then: {portalLink}
```

---

## 8. Nomba Event to Business Outcome Mapping

This table tells every team member what happens inside the system when each Nomba event fires. The Full Stack Developer needs this to understand what drives UI state changes. The AI Specialist needs this to know exactly when the dunning model gets called.

| Nomba Event | What Our System Does | UI Change the Merchant Sees |
|---|---|---|
| `payment_success` | Subscription → ACTIVE, next billing date advances, charge recorded, success email sent | Subscriber badge turns green, total paid updates, next billing date updates |
| `payment_failed` | Subscription → PAST_DUE, AI dunning called, retry job scheduled, failure email sent | Subscriber badge turns amber, retry badge appears with predicted retry time |
| `payout_success` (ajo payout) | AjoPayout marked complete, rotation advances to next member | Ajo group round status updates, next beneficiary shown |
| `payout_failed` (ajo payout) | Coordinator alerted by email, payout marked failed | Ajo group shows payout failed badge |
| `payment_success` (enrollment, first charge) | Customer `nombaTokenKey` saved from `tokenizedCardData`, subscription created | New subscriber appears in plan, subscriber count increments |

---

## 9. Demo Seed Data Specification

This defines exactly what is pre-loaded in the production demo account. Whoever seeds the data on Day 3 follows this spec, no improvising under pressure.

**Demo merchant account:**
- Business name: Greenfield Academy
- Email: demo@nombaflow.com
- Password: agreed on Day 1, stored in shared team password manager

**Plan 1:** JSS1 Term Fees, ₦35,000, monthly, 3 cycles
- 4 active subscribers, each with 1 successful charge on record
- 1 subscriber in PAST_DUE with a visible dunning retry badge showing a future retry date

**Plan 2:** Weekly Staff Welfare, ₦5,000, weekly, unlimited
- 3 active subscribers, 2 successful charge cycles each

**Ajo Group:** Osusu Circle, ₦10,000 weekly, 5 members
- Round 1 complete (member 1 received payout)
- Round 2 in progress: 3 of 5 members contributed, 2 pending

**Dashboard numbers at demo start:**
- MRR: ₦165,000
- Active subscribers: 8
- Failed payments: 1
- 90-day forecast: ₦420,000

---

## 10. User Flows

### 6.1 Merchant Flow

```
1. Merchant visits NombaFlow, signs up with email and password
2. Lands on empty dashboard, prompted to connect Nomba credentials
3. Enters Client ID, Client Secret, and Account ID from Nomba developer dashboard
4. Clicks "Create Plan", fills in name, amount, interval, cycles
5. System generates a unique enrollment link for that plan
6. Merchant copies link, shares it with their customers (WhatsApp, email, in person)
7. Dashboard updates as customers enroll
8. On billing day, charges run automatically, dashboard reflects results live
9. If a charge fails, merchant sees a "retry scheduled" badge with the predicted time
10. Merchant can manually cancel, pause, or message a customer from their record
```

### 6.2 Customer Flow

```
1. Customer receives enrollment link from merchant
2. Opens link, sees plan details (amount, frequency, what it is for)
3. Enters basic details (name, email, phone)
4. Redirected to Nomba Checkout to enter card details
5. Card is tokenised and saved, customer is enrolled
6. Customer can return to a personal portal link anytime to see their payment history
7. If a charge fails, customer gets an email explaining what happened and when the retry will run
```

### 6.3 Ajo Group Flow

```
1. Coordinator creates an ajo group: name, contribution amount, frequency, list of members in rotation order
2. Each member enrolls their card via a shared link, same tokenisation flow as above
3. On the scheduled day, the system charges all members
4. Once all contributions are collected, the system transfers the full pot to that round's beneficiary via Nomba Transfers
5. Rotation automatically advances to the next member for the following round
6. Coordinator dashboard shows collection status per round and flags any member who has failed to pay
```

---

## 11. Success Criteria for the Hackathon Demo

We will know we are ready to submit when:

- A merchant can go from signup to a working enrollment link in under 2 minutes, live, in front of judges
- A test charge can be triggered and watched succeeding and failing in real time
- A failed charge visibly triggers the AI retry prediction with a believable, explainable reason
- The ajo group flow can be demonstrated end to end with at least 3 mock members
- The dashboard never shows a loading spinner for more than 2 seconds during the demo
- No team member needs to explain what is happening on screen because the UI is self-explanatory

---

## 12. Open Questions to Resolve as a Team Before Day 1

- Do we use Nomba's sandbox test cards, or do we need to request specific test credentials in advance?
- What is our fallback if Nomba's webhook delivery is delayed during the live demo? (Decision: we will have a "simulate webhook" button hidden behind a key combo for demo safety, never shown to judges unless something breaks live)
- Who is the single point of contact checking the Nomba developer Slack/Discord for API questions during build hours?

---

## 13. Document Dependencies

This PRD should be read alongside:

- **API Contract Document** — exact request and response shapes between frontend, backend, and AI service
- **Database Schema** (`docs/engineering/NombaFlow_Database_Schema.md`) — finalized before any model code is written
- **Nomba API Verified** (`docs/engineering/NombaFlow_Nomba_API_Verified.md`) — authoritative Nomba integration reference

---

*Any feature request that comes up mid-build gets checked against Section 5.3 before anyone touches it. If it is not on the Must Have or Should Have list, it waits for after the hackathon.*
