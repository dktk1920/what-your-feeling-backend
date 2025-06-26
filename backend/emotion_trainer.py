import csv
import json
import os
import re
import sys
from collections import Counter, defaultdict


def tokenize(text: str):
    return re.findall(r"[가-힣a-zA-Z]+", text)


def train(files, top_n=10):
    emotion_counts: dict[str, Counter] = defaultdict(Counter)
    for path in files:
        with open(path, encoding="utf-8") as f:
            reader = csv.DictReader(f)
            if not reader.fieldnames:
                continue
            # Determine column names
            if "message" in reader.fieldnames and "emotion" in reader.fieldnames:
                msg_field, emo_field = "message", "emotion"
            elif "text" in reader.fieldnames and "label" in reader.fieldnames:
                msg_field, emo_field = "text", "label"
            else:
                msg_field, emo_field = reader.fieldnames[0], reader.fieldnames[1]

            for row in reader:
                message = row.get(msg_field, "")
                emotion = row.get(emo_field, "neutral")
                for word in tokenize(message):
                    emotion_counts[emotion][word] += 1

    rules = {
        emotion: [w for w, _ in counter.most_common(top_n)]
        for emotion, counter in emotion_counts.items()
    }
    out_path = os.path.join(os.path.dirname(__file__), "emotion_rules.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(rules, f, ensure_ascii=False, indent=2)
    print(f"Saved emotion rules to {out_path}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python emotion_trainer.py file1.csv [file2.csv ...]")
        sys.exit(1)
    train(sys.argv[1:])
