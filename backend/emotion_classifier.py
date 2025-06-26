# Simple emotion classifier placeholder
# Returns sentiment (positive, negative, mixed, or neutral) and list of detected keywords

def classify_emotion(message: str):
    """Classify the sentiment of a message and extract keywords.

    This is a placeholder implementation based on keyword matching.
    """
    positive_keywords = ["행복", "좋아", "기쁨", "즐겁", "사랑", "감사"]
    negative_keywords = ["슬퍼", "우울", "싫어", "화나", "짜증", "불안"]

    found_positive = [kw for kw in positive_keywords if kw in message]
    found_negative = [kw for kw in negative_keywords if kw in message]

    if found_positive and not found_negative:
        sentiment = "positive"
        keywords = found_positive
    elif found_negative and not found_positive:
        sentiment = "negative"
        keywords = found_negative
    elif found_positive and found_negative:
        sentiment = "mixed"
        keywords = found_positive + found_negative
    else:
        sentiment = "neutral"
        keywords = []

    return sentiment, keywords
