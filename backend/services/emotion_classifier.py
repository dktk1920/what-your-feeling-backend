import json
import os
import re

# Load trained emotion rules if available
_RULE_PATH = os.path.join(os.path.dirname(__file__), "emotion_rules.json")
if os.path.exists(_RULE_PATH):
    with open(_RULE_PATH, encoding="utf-8") as f:
        EMOTION_RULES = json.load(f)
else:
    EMOTION_RULES = {}


# fallback keywords if no rules found
POSITIVE_KEYWORDS = ["행복", "좋아", "기쁨", "즐겁", "사랑", "감사"]
NEGATIVE_KEYWORDS = ["슬퍼", "우울", "싫어", "화나", "짜증", "불안"]


def classify_emotion(message: str):
    """Return detected emotion and matched keywords."""
    if EMOTION_RULES:
        scores = {}
        matches = {}
        for emotion, keywords in EMOTION_RULES.items():
            found = [kw for kw in keywords if kw in message]
            scores[emotion] = len(found)
            matches[emotion] = found
        if scores:
            best = max(scores, key=scores.get)
            if scores[best] > 0:
                return best, matches[best]

    # Fallback simple sentiment rules
    found_pos = [kw for kw in POSITIVE_KEYWORDS if kw in message]
    found_neg = [kw for kw in NEGATIVE_KEYWORDS if kw in message]
    if found_pos and not found_neg:
        return "positive", found_pos
    if found_neg and not found_pos:
        return "negative", found_neg
    if found_pos and found_neg:
        return "mixed", found_pos + found_neg
    return "neutral", []


def classify_emotion_gpt(message: str, client=None):
    """Use GPT to classify emotion and extract keywords."""
    if client is None:
        try:
            from openai import OpenAI
        except Exception:
            return classify_emotion(message)

        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    prompt = [
        {
            "role": "system",
            "content": (
                "You analyze the user's Korean message and return a JSON object with "
                "'emotion' and 'keywords'. Use simple labels such as '기쁨', '슬픔', "
                "'화남', '중립'."
            ),
        },
        {
            "role": "user",
            "content": message,
        },
    ]

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=prompt,
            temperature=0,
        )
        text = response.choices[0].message.content.strip()

        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if match:
                data = json.loads(match.group(0))
            else:
                raise

        emotion = data.get("emotion", "neutral")
        keywords = data.get("keywords", [])
        if isinstance(keywords, str):
            keywords = [keywords]
        return emotion, keywords
    except Exception:
        return classify_emotion(message)

