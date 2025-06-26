import os
import json
import re

# fallback 키워드만 유지
POSITIVE_KEYWORDS = ["행복", "좋아", "기쁨", "즐겁", "사랑", "감사"]
NEGATIVE_KEYWORDS = ["슬퍼", "우울", "싫어", "화나", "짜증", "불안"]

def classify_emotion(message: str):
    """간단한 키워드 기반 fallback"""
    pos = [kw for kw in POSITIVE_KEYWORDS if kw in message]
    neg = [kw for kw in NEGATIVE_KEYWORDS if kw in message]
    if pos and not neg:
        return "positive", pos
    if neg and not pos:
        return "negative", neg
    if pos and neg:
        return "mixed", pos + neg
    return "neutral", []

def classify_emotion_gpt(message: str, client=None):
    """GPT 기반 감정 분석 — 실패 시 100% fallback"""
    if client is None:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        except Exception as e:
            print(f"[OpenAI 초기화 실패] {e}")
            return classify_emotion(message)

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "한국어 메시지를 분석해 반드시 다음 JSON 형식으로만 응답하세요:\n"
                        '{ "emotion": "기쁨", "keywords": ["사랑", "고마움"] }\n'
                        "⚠️ 설명 없이 JSON만 출력하세요. 가능한 감정: 기쁨, 슬픔, 화남, 불안, 중립"
                    )
                },
                {"role": "user", "content": message}
            ],
            temperature=0,
        )

        raw = response.choices[0].message.content.strip()
        print("[GPT 응답]", repr(raw))

        # GPT 응답이 비었거나 JSON이 아니면 fallback
        if not raw:
            raise ValueError("응답이 비었음")

        match = re.search(r"\{[\s\S]*?\}", raw)
        if not match:
            raise ValueError("JSON 구조가 없음")

        data = json.loads(match.group(0))
        emotion = data.get("emotion", "중립")
        keywords = data.get("keywords", [])

        if isinstance(keywords, str):
            keywords = [keywords]
        elif not isinstance(keywords, list):
            keywords = []

        return emotion, keywords

    except Exception as e:
        print(f"[GPT 처리 실패 → fallback] {e}")
        return classify_emotion(message)
