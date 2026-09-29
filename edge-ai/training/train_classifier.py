"""Train a small hazard classifier.

WARNING: this trains on SYNTHETIC data generated from simple rules. It demonstrates the
pipeline only. The printed accuracy says nothing about real-world performance.
Replace generate_data() with real labelled sensor logs before making any claims.
"""
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report
import joblib

LABELS = ["normal", "fire", "flood", "pollution"]
rng = np.random.default_rng(0)


def generate_data(n=4000):
    # features: temp_c, humidity, pm25, water_mm, flame_flag
    X, y = [], []
    for _ in range(n):
        label = rng.integers(0, 4)
        temp, hum, pm, water, flame = rng.uniform(20, 38), rng.uniform(30, 90), rng.uniform(5, 80), rng.uniform(0, 100), 0
        if label == 1:
            temp, pm, hum, flame = rng.uniform(55, 90), rng.uniform(100, 400), rng.uniform(10, 40), int(rng.random() < 0.7)
        elif label == 2:
            water, hum = rng.uniform(250, 800), rng.uniform(80, 100)
        elif label == 3:
            pm = rng.uniform(200, 500)
        X.append([temp, hum, pm, water, flame]); y.append(label)
    return np.array(X), np.array(y)


if __name__ == "__main__":
    X, y = generate_data()
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=0)
    model = DecisionTreeClassifier(max_depth=5, random_state=0).fit(Xtr, ytr)
    print(classification_report(yte, model.predict(Xte), target_names=LABELS))
    joblib.dump(model, "../models/hazard_tree.joblib")
    print("Saved ../models/hazard_tree.joblib (synthetic-data demo model)")
    # TODO: export to C (e.g. emlearn / micromlgen) and run on the ESP32 root node.
