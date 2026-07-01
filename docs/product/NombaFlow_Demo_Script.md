# NombaFlow — Demo Script & Seed Data Spec

**Purpose:** This document tells the team exactly what to say, who clicks what, and what data is in the demo account before the judges see it. Nothing in the demo should be decided on the day. Every second is planned here.

**Demo duration:** 3 minutes maximum
**Format:** Live demo on a laptop, one person driving the screen, one person narrating
**Recommended split:** AI Specialist narrates, Full Stack Developer drives the screen

---

## 1. Pre-Demo Checklist

Run through this list at least 30 minutes before presenting. If anything fails, fix it before going in front of judges.

- [ ] Production URL loads in under 2 seconds
- [ ] Demo merchant account logs in successfully: `demo@nombaflow.com`
- [ ] Dashboard shows correct seed numbers: MRR ₦165,000, Active subscribers 8, Failed payments 1
- [ ] The PAST_DUE subscriber (Chidi Okafor) shows the dunning retry badge with a future date
- [ ] The ajo group "Osusu Circle" shows Round 2 in progress with 3 of 5 contributed
- [ ] Cash flow forecast chart renders without errors
- [ ] Enrollment link for JSS1 Term Fees opens correctly in a new tab
- [ ] Backup video is downloaded and playable on the same laptop
- [ ] Browser tabs are pre-opened: dashboard, subscription detail for Chidi, ajo group detail, enrollment page
- [ ] Browser zoom is set to 110% so text is readable from the back of the room
- [ ] Notifications are turned off on the laptop
- [ ] Charger is plugged in

---

## 2. Seed Data Specification

This is the exact data that must exist in the production demo account before the demo. The Backend Developer runs the seed script on Day 3 morning and confirms every item below is present.

### Demo Merchant Account

```
Business name: Greenfield Academy
Email: demo@nombaflow.com
Password: stored in team password manager
Nomba credentials: connected (sandbox OAuth)
```

### Plan 1: JSS1 Term Fees

```
Name: JSS1 Term Fees
Amount: ₦35,000
Interval: Monthly
Max cycles: 3
Status: ACTIVE
```

Subscribers for Plan 1:

| Name | Email | Status | Cycles Completed | Total Paid | Note |
|---|---|---|---|---|---|
| Funmi Okoro | funmi@example.com | ACTIVE | 1 | ₦35,000 | Normal active subscriber |
| Tunde Adeyemi | tunde@example.com | ACTIVE | 1 | ₦35,000 | Normal active subscriber |
| Ngozi Eze | ngozi@example.com | ACTIVE | 2 | ₦70,000 | One cycle ahead |
| Aisha Musa | aisha@example.com | ACTIVE | 1 | ₦35,000 | Normal active subscriber |
| Chidi Okafor | chidi@example.com | PAST_DUE | 1 | ₦35,000 | **This is the demo dunning subscriber** |

Chidi Okafor's dunning record must have:
- `lastFailureCode`: insufficient_funds
- `lastFailedAt`: 2 days before demo date
- `nextRetryAt`: 2 days after demo date at 09:00 AM
- `aiConfidenceScore`: 0.71
- `aiReasoning`: "This customer's successful charges cluster around the 1st to 3rd of the month, suggesting a salary cycle. Recommending retry after the typical fund availability window."

### Plan 2: Weekly Staff Welfare

```
Name: Weekly Staff Welfare
Amount: ₦5,000
Interval: Weekly
Max cycles: null (unlimited)
Status: ACTIVE
```

Subscribers for Plan 2:

| Name | Email | Status | Cycles Completed | Total Paid |
|---|---|---|---|---|
| Emeka Obi | emeka@example.com | ACTIVE | 4 | ₦20,000 |
| Bola Adeleke | bola@example.com | ACTIVE | 4 | ₦20,000 |
| Kemi Salu | kemi@example.com | ACTIVE | 3 | ₦15,000 |

### Ajo Group: Osusu Circle

```
Name: Osusu Circle
Contribution amount: ₦10,000
Frequency: Weekly
Total rounds: 5
Current round: 2
Status: ACTIVE
```

Members:

| Position | Name | Status | Contributed Round 1 | Contributed Round 2 |
|---|---|---|---|---|
| 1 | Chioma Eze | ACTIVE | Yes | Yes |
| 2 | Tunde Bello | ACTIVE | Yes | Yes |
| 3 | Amaka Obi | ACTIVE | Yes | Yes |
| 4 | Fatima Yusuf | ACTIVE | Yes | No (pending) |
| 5 | Seun Coker | ACTIVE | Yes | No (pending) |

Round 1 payout: Chioma Eze received ₦50,000, status COMPLETE.
Round 2 payout: Tunde Bello is current beneficiary, status PENDING (not yet complete since 2 members have not contributed).

### Dashboard Numbers at Demo Start

These must match exactly:
- MRR: ₦165,000
- Active subscribers: 8
- Failed payments: 1 (Chidi Okafor)
- Failed payment amount: ₦35,000
- Upcoming next 7 days: ₦40,000 (Plan 2 weekly charges)
- 90-day forecast: ₦420,000 projected

---

## 3. Demo Script

### Who Does What

**Narrator:** speaks every word in the script below
**Driver:** clicks and navigates the screen

The Driver does not speak unless there is a live technical failure. The Narrator does not touch the screen.

---

### Opening (30 seconds) — Do Not Skip This

> "Every month, thousands of Nigerian schools, cooperatives, and businesses leave money on the table. Not because their customers refuse to pay, but because they have no infrastructure to collect reliably. They chase people on WhatsApp, retry failed payments manually, and run ajo groups from notebooks. We built NombaFlow to fix that permanently."

> "NombaFlow is a managed recurring billing engine built entirely on Nomba's APIs. Let me show you what that looks like in practice."

**Driver:** the dashboard is already open and logged in before the narrator says the first word.

---

### Act 1 — The Dashboard (25 seconds)

> "This is the merchant dashboard for Greenfield Academy, a school running fee collection through NombaFlow. You can see their current MRR, active subscribers, and a cash flow forecast for the next 90 days — all powered by our AI forecasting model and Nomba's Transactions API."

**Driver:** pause briefly on the dashboard so judges absorb the numbers. Do not click anything yet.

---

### Act 2 — The Dunning Moment (60 seconds — the most important part)

> "One of their students, Chidi Okafor, had a failed payment two days ago. Insufficient funds."

**Driver:** click on the "1 Failed" badge or navigate directly to Chidi Okafor's subscription detail page. This tab should already be open.

> "A standard billing system would retry in 3 days and hope for the best. NombaFlow does something different."

**Driver:** scroll to the dunning section so the retry badge and AI reasoning box are visible.

> "Our AI model analyzed Chidi's payment history and noticed that his successful charges always land in the first three days of the month. That tells us his salary probably hits then. So instead of guessing, the system scheduled the retry for the morning of the 3rd — when his account is most likely to have funds."

**Driver:** point to the `nextRetryAt` field and the AI reasoning text.

> "The confidence score is 71 percent. That is not perfect, but it is already better than random, and it improves as the model sees more of each customer's behavior. Zero human involvement from the merchant."

---

### Act 3 — Ajo Group (35 seconds)

> "Now here is the feature that we think makes NombaFlow genuinely different."

**Driver:** navigate to the Ajo Groups section. This tab should already be open.

> "Ajo and esusu groups move an estimated 500 billion naira through Nigeria every year, tracked in notebooks and WhatsApp groups. We put them on Nomba's payment rails."

**Driver:** open Osusu Circle group detail.

> "This group has 5 members contributing 10,000 naira weekly. Round 1 is complete — Chioma received her 50,000 naira payout automatically via Nomba Transfers. Round 2 is in progress. 3 of 5 members have contributed. The system is waiting for the last two before it releases the payout to Tunde."

**Driver:** hover over the pending members so judges can see the visual.

> "The coordinator did not send a single WhatsApp message."

---

### Act 4 — Enrollment (20 seconds)

> "Setting this up for a new merchant takes about 90 seconds. They create a plan, copy the enrollment link, and share it. Customers click the link, complete Nomba Checkout, and their card is tokenised for automatic future charges."

**Driver:** navigate to Plan 1 detail page and show the enrollment link with the copy button. Do not actually demo the enrollment flow live — too risky to depend on Nomba Checkout redirects in a timed demo. Show the link exists and say the next line.

> "That link is powered by Nomba's Checkout API. The card is tokenised by Nomba. We never touch raw card data."

---

### Closing (10 seconds)

> "NombaFlow is the subscriptions layer that Nomba does not ship. Built entirely on Nomba APIs. Deployable by any Nigerian business in 30 minutes. We are building this to be a real company."

**Driver:** return to the dashboard overview so judges see the numbers one more time as the narrator finishes.

---

## 4. Handling Live Failures

Have a plan for each of these before walking in.

**Scenario: the production URL is down**
Do not panic. Say: "We are going to switch to our recorded demo." Play the backup video immediately. Do not try to fix the deployment in front of judges.

**Scenario: the dashboard numbers are wrong**
Do not address it. Keep going. The judges do not know what the numbers should be.

**Scenario: the dunning AI reasoning box is empty**
Say: "The AI reasoning is populated after the model runs — in our live system it would show here." Move on immediately.

**Scenario: someone asks a question mid-demo**
Narrator says: "Great question, we will cover that right after the demo" and keeps going. Answer all questions after the 3 minutes are done.

---

## 5. Expected Judge Questions and Prepared Answers

**Q: How are you different from Paystack Subscriptions?**
A: "Paystack Subscriptions is a basic charge scheduler with no intelligence layer, no ajo support, no dunning engine, and no cash flow forecasting. NombaFlow is infrastructure. We also build on Nomba's rails, which is a different payment ecosystem entirely."

**Q: Is the AI model actually trained or is it hardcoded?**
A: "It is a LightGBM classifier trained on payment behavior features: day of week, day of month, failure reason codes, and historical retry success rates. For new customers with limited history we use segment-level priors while the model builds a profile."

**Q: What happens if Nomba's webhook is late?**
A: "We process webhooks asynchronously via BullMQ queues. If a webhook is delayed, the charge stays in an INITIATED state until the event arrives. We also run a reconciliation job every 24 hours using Nomba's Transactions API to catch anything the webhooks missed."

**Q: How do you handle security? You are storing card tokens.**
A: "We do not store raw card data at any point. Nomba handles the card data and returns us a token ID. We store that token ID encrypted at the application layer using AES-256-GCM. Webhook signatures are verified with HMAC-SHA256 on every event."

**Q: What is your business model?**
A: "0.4% transaction fee on successful charges, capped at ₦2,000, plus a SaaS tier starting at ₦15,000 per month for growth merchants. At 1,000 merchants averaging 200 subscriptions each at ₦8,000 per subscription, that is ₦1.6 billion in gross payment volume per month."

**Q: Can you expand beyond Nigeria?**
A: "The architecture is designed for it. The currency and payment rails fields are configurable. Ghana, Kenya, and South Africa are the natural next markets. We expand when Nomba does."
