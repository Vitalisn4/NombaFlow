# NombaFlow — Screen Inventory & UI Spec

**Purpose:** This document tells the Full Stack Developer exactly what every screen needs to show, what data powers it, what actions are available, and what the empty and loading states look like. No screen should be built without a matching entry here.

**Rule:** If a screen is not in this document, it is not being built during the hackathon. If a new screen is needed, add it here first, confirm with the team, then build it.

---

## 1. Design System Tokens

These are agreed on before any screen is built. The Full Stack Developer puts these in the global CSS file at `apps/web/app/globals.css`.

### Colors

```css
:root {
  --color-brand-gold: #F5A623;
  --color-brand-black: #0D0D0D;
  --color-brand-white: #FFFFFF;

  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-info: #3B82F6;

  --color-surface: #F9FAFB;
  --color-surface-raised: #FFFFFF;
  --color-border: #E5E7EB;
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;
}
```

### Typography

```css
/* Headings: Inter, weight 700 */
/* Body: Inter, weight 400 and 500 */
/* Mono (amounts, IDs): JetBrains Mono */

--font-heading: 'Inter', sans-serif;
--font-body: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Status Badge Colors

| Status | Background | Text |
|---|---|---|
| ACTIVE | `#DCFCE7` | `#15803D` |
| PAST_DUE | `#FEF9C3` | `#854D0E` |
| DUNNING | `#FEF3C7` | `#92400E` |
| SUSPENDED | `#FEE2E2` | `#991B1B` |
| CANCELLED | `#F3F4F6` | `#6B7280` |
| PENDING | `#EFF6FF` | `#1D4ED8` |

---

## 2. Shared Components

These components appear across multiple screens. Build them once, reuse everywhere.

### PageHeader
Props: `title`, `subtitle` (optional), `actions` (optional — buttons rendered top right)

### StatCard
Props: `label`, `value`, `trend` (optional — percentage up or down vs last period), `icon`
Used on: Dashboard Overview

### StatusBadge
Props: `status` (maps to colors in Section 1)
Used on: every screen showing a subscription or charge

### EmptyState
Props: `icon`, `title`, `description`, `actionLabel`, `onAction`
Every list screen needs this for when there is no data yet.

### LoadingSkeleton
A pulsing grey placeholder matching the shape of the content it replaces.
Rule: every screen that fetches data shows a skeleton for a maximum of 2 seconds before showing real data or an error.

### ConfirmDialog
Props: `title`, `description`, `confirmLabel`, `onConfirm`, `variant` (danger or default)
Used for: cancel subscription, delete plan, remove ajo member

---

## 3. Merchant Facing Screens

---

### Screen M01 — Register

**Route:** `/register`
**Access:** Public

**Purpose:** New merchant creates an account.

**Form fields:**
- Business name (required, max 100 chars)
- Email (required, valid email format)
- Password (required, min 8 chars, show/hide toggle)

**Actions:**
- Submit button: "Create account"
- Link to `/login` for existing merchants

**Success behavior:** redirect to `/onboarding`

**Error states:**
- Email already in use → inline error under email field: "An account with this email already exists"
- Server error → toast notification: "Something went wrong. Please try again."

**Loading state:** Submit button shows spinner and is disabled while request is in flight.

---

### Screen M02 — Login

**Route:** `/login`
**Access:** Public

**Purpose:** Returning merchant logs in.

**Form fields:**
- Email (required)
- Password (required, show/hide toggle)

**Actions:**
- Submit button: "Sign in"
- Link to `/register` for new merchants

**Success behavior:** redirect to `/dashboard`

**Error state:** wrong credentials → inline banner above form: "Incorrect email or password"

---

### Screen M03 — Onboarding: Connect Nomba Account

**Route:** `/onboarding`
**Access:** Authenticated merchants who have not yet connected Nomba

**Purpose:** First screen after registration. Merchant connects their Nomba account via OAuth credentials.

**Content:**
- Heading: "Connect your Nomba account"
- Short explanation: "Enter your Nomba API credentials from the developer dashboard. Nomba uses OAuth — you need your Client ID, Client Secret, and Account ID."
- Link to [Nomba developer docs](https://developer.nomba.com/docs/getting-started/get-api-keys) (opens in new tab)
- Text input labeled "Client ID"
- Password input labeled "Client Secret"
- Text input labeled "Account ID" with helper text: "Found in your Nomba dashboard under account settings"
- Submit button: "Connect"

**Success behavior:** redirect to `/dashboard` with a success toast: "Nomba connected. You are ready to start billing."

**Error state:** invalid credentials → inline error under the form: "We could not validate these credentials. Double check your Client ID, Client Secret, and Account ID in your Nomba dashboard."

**Skip option:** small link below the button: "Set this up later" — redirects to `/dashboard` with a persistent yellow banner reminding them to connect Nomba.

---

### Screen M04 — Dashboard Overview

**Route:** `/dashboard`
**Access:** Authenticated merchants

**Purpose:** The main merchant home screen. Shows the financial health of their billing at a glance.

**Layout:** top stat row, then two columns (chart left, activity right)

**Top stat row — 4 StatCards:**
1. Monthly Recurring Revenue: `analytics.mrr` formatted as ₦X,XXX
2. Active Subscribers: `analytics.activeSubscribers`
3. Failed Payments: `analytics.failedPaymentsCount` with amount `analytics.failedPaymentsAmount`
4. Upcoming (next 7 days): `analytics.upcomingCharges.next7Days`

**Left column — Cash Flow Forecast Chart:**
- Line chart using Recharts
- X axis: monthly dates for the next 4 months
- Y axis: naira amounts
- Two lines: "Expected" (dashed) and "Collected" (solid)
- Collected line only has data up to today's date; future dates show as projected
- Data from: `GET /analytics/forecast/:merchantId`
- If AI service is unavailable, show a placeholder card: "Forecast temporarily unavailable"

**Right column — Recent Activity Feed:**
- Last 10 webhook events in chronological order
- Each item shows: customer name, event type (paid / failed / enrolled), amount, time ago
- Clicking an item navigates to that subscription detail

**Empty state (no plans yet):** replace the stat row and chart with a centered empty state. Icon: chart. Title: "You have not set up any plans yet." Action button: "Create your first plan"

**Loading state:** skeleton cards for the stat row, skeleton lines for the chart.

---

### Screen M05 — Plans List

**Route:** `/dashboard/plans`
**Access:** Authenticated merchants

**Purpose:** Shows all billing plans the merchant has created.

**Content:**
- Page header: "Plans" with action button "New Plan" (navigates to M06)
- Table or card list of plans

**Each plan shows:**
- Plan name
- Amount and interval (e.g. "₦35,000 / month")
- Active subscriber count
- Status badge
- Action: "View" button navigating to M07

**Empty state:** Icon: clipboard. Title: "No plans yet." Description: "Create a plan to start collecting recurring payments." Action: "Create Plan"

---

### Screen M06 — Create Plan

**Route:** `/dashboard/plans/new`
**Access:** Authenticated merchants

**Purpose:** Merchant creates a new billing plan.

**Form fields:**
- Plan name (required, max 100 chars)
- Description (optional, max 300 chars)
- Plan type: radio buttons — "Standard" or "Ajo / Esusu Group"
  - Selecting "Ajo" redirects to Screen M10 (Create Ajo Group) instead
- Amount in NGN (required, numeric, min ₦100)
- Billing interval: dropdown — Weekly / Monthly / Quarterly / Annually
- Number of billing cycles: number input or "Unlimited" toggle
- Trial days: number input, default 0

**Actions:**
- "Create Plan" — submits form, then redirects to M07 on success
- "Cancel" — navigates back to M05

**Success behavior:** redirect to M07 (Plan Detail) for the newly created plan, with a toast: "Plan created. Share the enrollment link with your customers."

---

### Screen M07 — Plan Detail

**Route:** `/dashboard/plans/:id`
**Access:** Authenticated merchants

**Purpose:** Shows everything about one plan including its subscribers and enrollment link.

**Top section:**
- Plan name, amount, interval, status badge
- "Enrollment Link" card: the full URL with a copy button and a QR code (generated client-side)
- Edit and Archive buttons

**Subscriber tabs:**
- Tab "Active" — lists active subscribers
- Tab "Past Due" — lists subscribers in PAST_DUE or DUNNING
- Tab "All" — all subscribers regardless of status

**Each subscriber row shows:**
- Customer name and email
- Status badge
- Total paid
- Next billing date
- If PAST_DUE or DUNNING: show retry badge with `dunning.nextRetryAt`
- "View" button → navigates to M09 (Subscription Detail)

**Empty state (no subscribers):** "Nobody has enrolled yet. Share the enrollment link to get started."

---

### Screen M08 — Subscription Detail

**Route:** `/dashboard/subscriptions/:id`
**Access:** Authenticated merchants

**Purpose:** Full record for one subscriber. This is the screen judges will look at during the AI dunning demo moment.

**Content:**
- Customer name, email, phone
- Plan name with link back to M07
- Subscription status badge
- Cycles: "2 of 3 completed"
- Total paid
- Next billing date

**Dunning section (visible only when `dunning.active === true`):**
- Amber banner at top of page: "Payment failed — retry scheduled"
- Failure reason: "Insufficient funds on [date]"
- AI retry prediction box:
  - "Next retry: [date and time]"
  - Confidence indicator (e.g. a small progress bar labeled "AI confidence: 71%")
  - AI reasoning text in italics: `dunning.aiReasoning`

**Charge History table:**
- Columns: Date, Amount, Status, Attempt #
- Most recent charge first

**Actions:**
- "Cancel Subscription" button → opens ConfirmDialog (danger variant)
- "Pause Subscription" button → opens ConfirmDialog (default variant)

---

### Screen M09 — Settings

**Route:** `/dashboard/settings`
**Access:** Authenticated merchants

**Purpose:** Merchant manages their account details and Nomba connection.

**Sections:**
- Business details: name (editable), email (read only)
- Nomba connection: shows "Connected" with a green badge or "Not connected" with a link to reconnect
- Danger zone: "Delete account" (out of scope for hackathon, show as disabled with tooltip)

---

### Screen M10 — Ajo Groups List

**Route:** `/dashboard/ajo`
**Access:** Authenticated merchants

**Purpose:** Shows all ajo groups.

**Each group card shows:**
- Group name
- Contribution amount and frequency
- Current round / total rounds (e.g. "Round 2 of 5")
- Current beneficiary name
- Member count
- Status badge
- "View" button → navigates to M11

**Action button:** "New Ajo Group" → navigates to M11 Create form

---

### Screen M11 — Create Ajo Group

**Route:** `/dashboard/ajo/new`
**Access:** Authenticated merchants

**Purpose:** Coordinator sets up a rotating savings group.

**Form fields:**
- Group name (required)
- Contribution amount in NGN (required)
- Frequency: Weekly / Monthly (dropdown)
- Members section: a repeating form where coordinator adds each member in rotation order
  - Each member: name (required), email (required), phone (optional)
  - Add Member button adds a new row
  - Drag to reorder (sets the rotation position)

**Actions:**
- "Create Group" → POST /ajo-groups → redirect to M12
- "Cancel"

---

### Screen M12 — Ajo Group Detail

**Route:** `/dashboard/ajo/:id`
**Access:** Authenticated merchants

**Purpose:** Shows the full state of an ajo group round by round.

**Top section:**
- Group name, amount, frequency
- Current round progress: "Round 2 of 5"
- Current beneficiary: name + payout status badge

**Members table:**
- Columns: Position, Name, Enrolled, Contributed This Round, Status
- Rows with green check or amber X for contribution status

**Rounds history:**
- Previous rounds: beneficiary name, payout status, payout date

**Enrollment link:** same copy-and-share card as M07, generates one shared enrollment link for all members

---

## 4. Customer Facing Screens

---

### Screen C01 — Enrollment Page

**Route:** `/enroll/:planId`
**Access:** Public (anyone with the link)

**Purpose:** First page a customer sees when the merchant shares an enrollment link.

**Content:**
- Merchant business name at the top (fetched from plan's merchant)
- Plan name
- Plan description
- Amount and billing interval, displayed clearly: "You will be charged ₦35,000 every month"
- Number of billing cycles or "Ongoing"
- "Enroll Now" button → navigates to C02

**Error state (plan not found or archived):**
- Centered message: "This enrollment link is no longer active. Contact [merchant name] for more information."

**Design note:** this screen is the first impression a customer has of NombaFlow. It must look trustworthy. Clean white background, plan details clearly laid out, the Nomba and NombaFlow logos at the bottom as trust signals.

---

### Screen C02 — Enrollment Form

**Route:** `/enroll/:planId/details`
**Access:** Public

**Purpose:** Customer enters their personal details before being sent to Nomba Checkout.

**Form fields:**
- Full name (required)
- Email address (required)
- Phone number (required, Nigerian format)

**Actions:**
- "Continue to payment" → POST /customers/enroll → redirects browser to `checkoutLink`

**Loading state:** after submit, the button becomes a spinner and the message "Redirecting to secure checkout..." appears. Do not let the customer click twice.

---

### Screen C03 — Enrollment Success

**Route:** `/enroll/:planId/success`
**Access:** Public (redirect target after Nomba Checkout)

**Purpose:** Confirmation page after card tokenisation completes.

**Content:**
- Large green checkmark
- "You are enrolled"
- Plan name and amount summary
- "A confirmation email has been sent to [email]"
- Link to customer portal: "Manage your subscription"

**No API call needed on this screen.** The real enrollment confirmation happens via webhook on the backend.

---

### Screen C04 — Customer Self-Service Portal

**Route:** `/portal/:customerId`
**Access:** Public (accessed via a unique link, no login required for hackathon MVP)

**Purpose:** Customer can see their subscription status and payment history.

**Content:**
- Customer name greeting at top
- Plan name and status badge
- Next billing date and amount
- Cycles completed (e.g. "1 of 3 payments made")
- "Update payment card" button → calls PATCH /customers/:id/card → redirects to Nomba Checkout for re-tokenisation
- Payment history table: date, amount, status for each charge

**Dunning notice (visible when subscription is PAST_DUE or DUNNING):**
- Amber banner: "Your last payment failed. We will try again on [retryDate]."
- "Update your card" button prominently placed

**Empty payment history:** "No payments yet. Your first payment will be charged on [nextBillingDate]."

---

## 5. Screen Count Summary

| Category | Count |
|---|---|
| Auth screens (register, login) | 2 |
| Onboarding | 1 |
| Merchant dashboard screens | 9 |
| Customer facing screens | 4 |
| **Total** | **16 screens** |

---

## 6. Responsive Behavior

All merchant dashboard screens are built desktop-first (minimum 1024px viewport). The enrollment and customer portal screens must be fully functional on mobile (minimum 375px viewport), because customers will open the enrollment link on their phones.

The Demo Seed account will be demoed on a laptop. Judges do not need to see mobile views unless time allows.
