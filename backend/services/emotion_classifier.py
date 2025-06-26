import os
import json

# 기본 감정 키워드 세트
POSITIVE_KEYWORDS = ["좋아", "행복", "기뻐", "설레", "사랑", "만족"]
NEGATIVE_KEYWORDS = ["슬퍼", "우울", "싫어", "화나", "짜증", "불안"]

EMOTION_RULES = {}  # 추후 json 로드 가능

# 🔧 로컬 키워드 기반 감정 분석 함수
def classify_emotion(message: str):
    found_pos = [kw for kw in POSITIVE_KEYWORDS if kw in message]
    found_neg = [kw for kw in NEGATIVE_KEYWORDS if kw in message]
    if found_pos and not found_neg:
        return "기쁨", found_pos
    if found_neg and not found_pos:
        return "슬픔", found_neg
    if found_pos and found_neg:
        return "혼합", found_pos + found_neg
    return "중립", []

# 🧠 GPT 기반 감정 분석 함수 + fallback 포함
def classify_emotion_gpt(message: str, client=None):
    """Use GPT to classify emotion and extract keywords. Fallback to rule-based method."""
    if client is None:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        except Exception as e:
            print(f"[GPT client init failed] {e}")
            return classify_emotion(message)

    prompt = [
        {
            "role": "system",
            "content": (
                "You are an assistant that analyzes the user's Korean message and responds ONLY in valid JSON format. "
                "Return only a compact one-line JSON like: {\"emotion\": \"기쁨\", \"keywords\": [\"행복\", \"좋아\"]}. "
                "Use only one of these emotions: 기쁨, 슬픔, 화남, 중립."
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
        content = response.choices[0].message.content
        if not content:
            raise ValueError("GPT response content is empty.")

        text = content.lstrip('\ufeff').strip()
        print(f"[GPT raw response] {text}")
        print(f"[GPT raw repr] {repr(text)}")

        if not text.startswith("{"):
            raise ValueError("GPT did not return JSON")

        data = json.loads(text)
        emotion = data.get("emotion", "중립")
        keywords = data.get("keywords", [])
        if isinstance(keywords, str):
            keywords = [keywords]
        return emotion, keywords

    except Exception as e:
        print(f"[GPT fallback] JSON decode error or request error: {e}")
        return classify_emotion(message)
