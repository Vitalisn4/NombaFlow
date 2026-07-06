"""Trains a LightGBM regressor to predict optimal retry offset (hours) for a failed payment."""
import json
import joblib
import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

DATA_PATH = "data/dunning_training_data.jsonl"
MODEL_OUT_PATH = "models/dunning_model.pkl"

FAILURE_REASON_MAP = {"insufficient_funds": 0, "card_declined": 1, "do_not_honour": 2, "expired_card": 3}
FEATURE_COLUMNS = [
    "historical_payment_day_of_week",
    "historical_payment_day_of_month",
    "failure_reason_code_encoded",
    "retry_success_history",
    "time_since_last_success_days",
]
TARGET_COLUMN = "optimal_retry_offset_hours"


def load_data(path: str) -> pd.DataFrame:
    records = [json.loads(line) for line in open(path)]
    df = pd.DataFrame(records)
    df["failure_reason_code_encoded"] = df["failure_reason_code"].map(FAILURE_REASON_MAP)
    return df


def train():
    df = load_data(DATA_PATH)
    trainable = df[df["num_history_events"] >= 3]

    X = trainable[FEATURE_COLUMNS]
    y = trainable[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = lgb.LGBMRegressor(n_estimators=200, max_depth=5, learning_rate=0.05, random_state=42, verbosity=-1)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    print(f"Test MAE: {mae:.2f} hours (n={len(X_test)})")

    joblib.dump(
        {"model": model, "feature_columns": FEATURE_COLUMNS, "failure_reason_map": FAILURE_REASON_MAP},
        MODEL_OUT_PATH,
    )
    print(f"Saved model to {MODEL_OUT_PATH}")


if __name__ == "__main__":
    train()
