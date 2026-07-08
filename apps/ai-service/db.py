"""
Minimal DB access layer for the AI service.
Read-only queries against the shared Postgres database.
"""
import os
import psycopg2
import psycopg2.extras

DATABASE_URL = os.environ["DATABASE_URL"]


def get_connection():
    return psycopg2.connect(DATABASE_URL)


def get_active_subscriptions(merchant_id: str) -> list[dict]:
    query = """
        SELECT
            s.id AS subscription_id,
            p.amount AS amount,
            p.interval AS interval,
            p."intervalCount" AS interval_count,
            s."nextBillingDate" AS next_billing_date
        FROM "Subscription" s
        JOIN "Plan" p ON p.id = s."planId"
        WHERE s."merchantId" = %s
          AND s.status = 'ACTIVE'
    """
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query, (merchant_id,))
            return [dict(row) for row in cur.fetchall()]


def get_historical_success_rate(merchant_id: str) -> float:
    query = """
        SELECT
            COUNT(*) FILTER (WHERE status = 'SUCCESS') AS succeeded,
            COUNT(*) FILTER (WHERE status != 'INITIATED') AS total
        FROM "Charge"
        WHERE "merchantId" = %s
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (merchant_id,))
            succeeded, total = cur.fetchone()
            if not total:
                return 0.85
            return round(succeeded / total, 4)


def get_at_risk_amount(merchant_id: str) -> float:
    query = """
        SELECT COALESCE(SUM(p.amount), 0) AS at_risk
        FROM "Subscription" s
        JOIN "Plan" p ON p.id = s."planId"
        WHERE s."merchantId" = %s
          AND s.status IN ('PAST_DUE', 'DUNNING')
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (merchant_id,))
            (at_risk,) = cur.fetchone()
            return float(at_risk)
