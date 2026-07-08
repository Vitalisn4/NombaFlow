"""Generates synthetic customer payment history data for training the dunning retry-prediction model."""
import json
import random
from datetime import datetime, timedelta

random.seed(42)

FAILURE_REASONS = ["insufficient_funds", "card_declined", "do_not_honour", "expired_card"]


def generate_customer(customer_id: str) -> dict:
    is_salary_day_customer = random.random() < 0.55
    historical_payment_day_of_month = random.randint(1, 7) if is_salary_day_customer else random.randint(1, 28)
    historical_payment_day_of_week = random.randint(0, 6)
    failure_reason_code = random.choices(FAILURE_REASONS, weights=[0.45, 0.30, 0.15, 0.10])[0]
    retry_success_history = round(random.betavariate(2, 2), 2)
    time_since_last_success_days = random.randint(1, 90)

    if failure_reason_code == "insufficient_funds":
        base_offset = 48 if is_salary_day_customer else 24
    elif failure_reason_code in ("card_declined", "do_not_honour"):
        base_offset = 24
    else:
        base_offset = 168

    confidence_adjustment = (1 - retry_success_history) * 24
    optimal_offset_hours = base_offset + confidence_adjustment
    optimal_offset_hours += random.gauss(0, 4)
    optimal_offset_hours = max(6, round(optimal_offset_hours, 1))

    num_history_events = random.choice([0, 1, 2, 3, 4, 5, 8, 12, 20])

    return {
        "customerId": customer_id,
        "historical_payment_day_of_week": historical_payment_day_of_week,
        "historical_payment_day_of_month": historical_payment_day_of_month,
        "failure_reason_code": failure_reason_code,
        "retry_success_history": retry_success_history,
        "time_since_last_success_days": time_since_last_success_days,
        "num_history_events": num_history_events,
        "optimal_retry_offset_hours": optimal_offset_hours,
    }


def main(n=1000, out_path="data/dunning_training_data.jsonl"):
    with open(out_path, "w") as f:
        for i in range(n):
            f.write(json.dumps(generate_customer(f"cust_{i:05d}")) + "\n")
    print(f"Wrote {n} records to {out_path}")


if __name__ == "__main__":
    main()
