# NombaFlow — Email Templates

**Purpose:** Every automated email NombaFlow sends is defined in full here. The Backend Developer building the Resend integration copies these templates directly into the notification service.

**Email provider:** Resend
**From address:** `billing@nombaflow.com`
**Reply-to:** the merchant's email address, so customer replies go to the merchant directly
**Template engine:** React Email (integrates with Resend natively)

---

## 1. Template Variables Reference

These are the dynamic values injected into every template. The notification service resolves all of these before sending.

| Variable | Source | Example |
|---|---|---|
| `{{customerName}}` | `Customer.name` | Funmi Okoro |
| `{{merchantName}}` | `Merchant.businessName` | Greenfield Academy |
| `{{planName}}` | `Plan.name` | JSS1 Term Fees |
| `{{amount}}` | `Charge.amount` formatted | ₦35,000 |
| `{{date}}` | Timestamp formatted as "1 July 2026" | 1 July 2026 |
| `{{nextBillingDate}}` | `Subscription.nextBillingDate` formatted | 1 August 2026 |
| `{{retryDate}}` | `DunningAttempt.scheduledAt` formatted | 3 July 2026 at 9:00 AM |
| `{{failureReason}}` | Human-readable version of `Charge.failureCode` | Insufficient funds |
| `{{portalLink}}` | `https://nombaflow.com/portal/{{customerId}}` | Full URL |
| `{{currentYear}}` | Runtime | 2026 |

### Failure Code to Human-Readable Mapping

```typescript
const failureReasonMap: Record<string, string> = {
  insufficient_funds: "Insufficient funds on your card",
  card_declined: "Your card was declined by your bank",
  expired_card: "Your card has expired",
  invalid_card: "Your card details could not be verified",
  do_not_honor: "Your bank declined the transaction",
  network_error: "A network error occurred during processing",
  unknown: "The payment could not be processed"
};
```

---

## 2. Email 01 — Payment Success

**Trigger:** `payment_success` webhook received and processed
**To:** customer email
**Send timing:** immediately after webhook processing

**Subject:**
```
Payment confirmed — ₦{{amount}} for {{planName}}
```

**Body (plain text fallback):**
```
Hi {{customerName}},

Your payment of {{amount}} for {{planName}} has been received.

Payment date: {{date}}
Next payment: {{amount}} on {{nextBillingDate}}

If you have any questions, reach out to {{merchantName}} directly.

NombaFlow
```

**Body (HTML — React Email structure):**

```tsx
import {
  Body, Container, Head, Heading, Hr, Html,
  Preview, Section, Text, Link
} from "@react-email/components";

export const PaymentSuccessEmail = ({
  customerName,
  merchantName,
  planName,
  amount,
  date,
  nextBillingDate,
  portalLink,
}: PaymentSuccessEmailProps) => (
  <Html>
    <Head />
    <Preview>Payment confirmed — {amount} for {planName}</Preview>
    <Body style={{ backgroundColor: "#f9fafb", fontFamily: "Inter, sans-serif" }}>
      <Container style={{ maxWidth: "560px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", padding: "40px" }}>

        {/* Header bar */}
        <Section style={{ backgroundColor: "#F5A623", borderRadius: "6px", padding: "12px 20px", marginBottom: "32px" }}>
          <Text style={{ color: "#0D0D0D", fontWeight: "700", fontSize: "18px", margin: 0 }}>
            NombaFlow
          </Text>
        </Section>

        <Heading style={{ fontSize: "22px", color: "#111827", marginBottom: "8px" }}>
          Payment received
        </Heading>

        <Text style={{ color: "#6B7280", fontSize: "15px", marginBottom: "24px" }}>
          Hi {customerName}, your payment was processed successfully.
        </Text>

        {/* Summary box */}
        <Section style={{ backgroundColor: "#F0FDF4", borderRadius: "6px", padding: "20px", marginBottom: "24px" }}>
          <Text style={{ margin: "0 0 8px", color: "#111827", fontSize: "14px" }}>
            <strong>Plan:</strong> {planName}
          </Text>
          <Text style={{ margin: "0 0 8px", color: "#111827", fontSize: "14px" }}>
            <strong>Amount paid:</strong> {amount}
          </Text>
          <Text style={{ margin: "0 0 8px", color: "#111827", fontSize: "14px" }}>
            <strong>Date:</strong> {date}
          </Text>
          <Text style={{ margin: 0, color: "#111827", fontSize: "14px" }}>
            <strong>Next payment:</strong> {amount} on {nextBillingDate}
          </Text>
        </Section>

        <Link href={portalLink} style={{ color: "#F5A623", fontSize: "14px" }}>
          View your payment portal
        </Link>

        <Hr style={{ borderColor: "#E5E7EB", margin: "32px 0" }} />

        <Text style={{ color: "#9CA3AF", fontSize: "12px" }}>
          This email was sent on behalf of {merchantName}. If you have questions about this payment, contact them directly.
        </Text>
        <Text style={{ color: "#9CA3AF", fontSize: "12px" }}>
          © {new Date().getFullYear()} NombaFlow
        </Text>

      </Container>
    </Body>
  </Html>
);
```

---

## 3. Email 02 — Payment Failed

**Trigger:** `payment_failed` webhook received and dunning scheduled
**To:** customer email
**Send timing:** immediately after dunning attempt is scheduled

**Subject:**
```
Action needed — payment of {{amount}} for {{planName}} failed
```

**Body (plain text fallback):**
```
Hi {{customerName}},

We tried to charge {{amount}} for {{planName}} on {{date}} but the payment did not go through.

Reason: {{failureReason}}

We will automatically try again on {{retryDate}}. Please make sure your card is ready by then.

To update your card details before the retry:
{{portalLink}}

If you have questions, contact {{merchantName}}.

NombaFlow
```

**Body (HTML — React Email structure):**

```tsx
export const PaymentFailedEmail = ({
  customerName,
  merchantName,
  planName,
  amount,
  date,
  failureReason,
  retryDate,
  portalLink,
}: PaymentFailedEmailProps) => (
  <Html>
    <Head />
    <Preview>Action needed — your payment of {amount} did not go through</Preview>
    <Body style={{ backgroundColor: "#f9fafb", fontFamily: "Inter, sans-serif" }}>
      <Container style={{ maxWidth: "560px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", padding: "40px" }}>

        {/* Header bar */}
        <Section style={{ backgroundColor: "#F5A623", borderRadius: "6px", padding: "12px 20px", marginBottom: "32px" }}>
          <Text style={{ color: "#0D0D0D", fontWeight: "700", fontSize: "18px", margin: 0 }}>
            NombaFlow
          </Text>
        </Section>

        {/* Warning banner */}
        <Section style={{ backgroundColor: "#FEF9C3", borderRadius: "6px", padding: "12px 16px", marginBottom: "24px" }}>
          <Text style={{ margin: 0, color: "#854D0E", fontSize: "14px", fontWeight: "600" }}>
            Payment unsuccessful
          </Text>
        </Section>

        <Heading style={{ fontSize: "22px", color: "#111827", marginBottom: "8px" }}>
          We could not process your payment
        </Heading>

        <Text style={{ color: "#6B7280", fontSize: "15px", marginBottom: "24px" }}>
          Hi {customerName}, there was an issue with your payment for {planName}.
        </Text>

        {/* Details box */}
        <Section style={{ backgroundColor: "#FFF7ED", borderRadius: "6px", padding: "20px", marginBottom: "24px" }}>
          <Text style={{ margin: "0 0 8px", color: "#111827", fontSize: "14px" }}>
            <strong>Plan:</strong> {planName}
          </Text>
          <Text style={{ margin: "0 0 8px", color: "#111827", fontSize: "14px" }}>
            <strong>Amount:</strong> {amount}
          </Text>
          <Text style={{ margin: "0 0 8px", color: "#111827", fontSize: "14px" }}>
            <strong>Failed on:</strong> {date}
          </Text>
          <Text style={{ margin: "0 0 8px", color: "#111827", fontSize: "14px" }}>
            <strong>Reason:</strong> {failureReason}
          </Text>
          <Text style={{ margin: 0, color: "#111827", fontSize: "14px" }}>
            <strong>Next retry:</strong> {retryDate}
          </Text>
        </Section>

        <Text style={{ color: "#374151", fontSize: "15px", marginBottom: "20px" }}>
          We will automatically try the payment again on <strong>{retryDate}</strong>.
          Please ensure your card has sufficient funds before then.
        </Text>

        {/* CTA */}
        <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
          <Link
            href={portalLink}
            style={{
              backgroundColor: "#F5A623",
              color: "#0D0D0D",
              padding: "12px 24px",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "14px",
              textDecoration: "none",
              display: "inline-block"
            }}
          >
            Update payment card
          </Link>
        </Section>

        <Hr style={{ borderColor: "#E5E7EB", margin: "32px 0" }} />

        <Text style={{ color: "#9CA3AF", fontSize: "12px" }}>
          Sent on behalf of {merchantName}. © {new Date().getFullYear()} NombaFlow
        </Text>
      </Container>
    </Body>
  </Html>
);
```

---

## 4. Email 03 — Retry Scheduled

**Trigger:** dunning attempt scheduled after AI prediction completes
**To:** customer email
**Send timing:** 24 hours before the scheduled retry time

**Subject:**
```
Reminder — payment retry for {{planName}} is scheduled for {{retryDate}}
```

**Body (plain text fallback):**
```
Hi {{customerName}},

This is a reminder that we will attempt to collect {{amount}} for {{planName}} on {{retryDate}}.

Please make sure your card has sufficient funds before then.

To update your payment card:
{{portalLink}}

NombaFlow — on behalf of {{merchantName}}
```

**Body (HTML — React Email structure):**

```tsx
export const RetryScheduledEmail = ({
  customerName,
  merchantName,
  planName,
  amount,
  retryDate,
  portalLink,
}: RetryScheduledEmailProps) => (
  <Html>
    <Head />
    <Preview>Payment retry for {planName} is scheduled for {retryDate}</Preview>
    <Body style={{ backgroundColor: "#f9fafb", fontFamily: "Inter, sans-serif" }}>
      <Container style={{ maxWidth: "560px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", padding: "40px" }}>

        <Section style={{ backgroundColor: "#F5A623", borderRadius: "6px", padding: "12px 20px", marginBottom: "32px" }}>
          <Text style={{ color: "#0D0D0D", fontWeight: "700", fontSize: "18px", margin: 0 }}>
            NombaFlow
          </Text>
        </Section>

        <Heading style={{ fontSize: "22px", color: "#111827", marginBottom: "8px" }}>
          Payment retry reminder
        </Heading>

        <Text style={{ color: "#6B7280", fontSize: "15px", marginBottom: "24px" }}>
          Hi {customerName}, we are scheduled to retry your payment for {planName}.
        </Text>

        <Section style={{ backgroundColor: "#EFF6FF", borderRadius: "6px", padding: "20px", marginBottom: "24px" }}>
          <Text style={{ margin: "0 0 8px", color: "#111827", fontSize: "14px" }}>
            <strong>Plan:</strong> {planName}
          </Text>
          <Text style={{ margin: "0 0 8px", color: "#111827", fontSize: "14px" }}>
            <strong>Amount:</strong> {amount}
          </Text>
          <Text style={{ margin: 0, color: "#111827", fontSize: "14px" }}>
            <strong>Retry scheduled:</strong> {retryDate}
          </Text>
        </Section>

        <Text style={{ color: "#374151", fontSize: "15px", marginBottom: "20px" }}>
          No action is needed if your card details are up to date.
          If you need to update your card, do so before the retry time.
        </Text>

        <Link href={portalLink} style={{ color: "#F5A623", fontSize: "14px" }}>
          Update payment card
        </Link>

        <Hr style={{ borderColor: "#E5E7EB", margin: "32px 0" }} />

        <Text style={{ color: "#9CA3AF", fontSize: "12px" }}>
          Sent on behalf of {merchantName}. © {new Date().getFullYear()} NombaFlow
        </Text>
      </Container>
    </Body>
  </Html>
);
```

---

## 5. Notification Service Integration Notes

### Resend setup

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPaymentSuccessEmail = async (data: PaymentSuccessEmailProps & { to: string; replyTo: string }) => {
  await resend.emails.send({
    from: "billing@nombaflow.com",
    to: data.to,
    replyTo: data.replyTo,
    subject: `Payment confirmed — ${data.amount} for ${data.planName}`,
    react: PaymentSuccessEmail(data),
  });
};
```

### When each email is sent

```
payment_success webhook received
  → queue notification job: type=PAYMENT_SUCCESS
  → notification worker picks up job
  → resolves all template variables from DB
  → calls sendPaymentSuccessEmail
  → logs notification record with status=SENT or status=FAILED

payment_failed webhook received + dunning scheduled
  → queue notification job: type=PAYMENT_FAILED
  → same worker pattern as above

dunning retry scheduled (24 hours before retryAt)
  → cron job checks DunningAttempt records where scheduledAt is in next 24h
  → for each, queue notification job: type=RETRY_SCHEDULED
  → same worker pattern
```

### Resend free tier limits

The free tier gives 3,000 emails per month. During the hackathon demo this is more than enough. Track usage at resend.com/overview. If the team is testing heavily and approaches the limit, temporarily disable the retry reminder emails since those are lowest priority.
