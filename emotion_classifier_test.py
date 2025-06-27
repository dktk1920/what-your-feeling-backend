import pandas as pd
from transformers import pipeline

# ✅ 정확한 파일 경로
csv_path = "C:/wtf/WTF 1차 Alpha Test Data - Row Data.csv"

# 🔹 1. CSV 로드
df = pd.read_csv(csv_path)

# 🔹 2. 감정 분류 모델 로드
classifier = pipeline(
    "text-classification",
    model="Jinuuuu/KoELECTRA_fine_tunning_emotion",
    tokenizer="Jinuuuu/KoELECTRA_fine_tunning_emotion"
)

# 🔹 3. 50개만 테스트 (또는 전체 df 사용 가능)
df = df.head(50)

# 🔹 4. 감정 예측
df["emotion_label"] = df["user_message"].apply(lambda x: classifier(x)[0]["label"] if pd.notna(x) else "unknown")
df["confidence"] = df["user_message"].apply(lambda x: classifier(x)[0]["score"] if pd.notna(x) else 0.0)

# ✅ [직접 수정 가능] 감정 이름 보정
emotion_label_map = {
    "행복": "행복",
    "슬픔": "슬픔",
    "상처": "슬픔",
    "불안": "불안",
    "당황": "불안",
    "분노": "분노"
}
df["mapped_emotion"] = df["emotion_label"].map(emotion_label_map).fillna("기타")

# ✅ [직접 수정 가능] 대분류
emotion_group_map = {
    "행복": "긍정",
    "슬픔": "부정",
    "상처": "부정",
    "분노": "부정",
    "불안": "불안정",
    "당황": "불안정"
}
df["emotion_group"] = df["emotion_label"].map(emotion_group_map).fillna("기타")

# 🔹 5. 결과 출력
for _, row in df.iterrows():
    print(f"[{row['user_message']}] → 감정: {row['mapped_emotion']} / 대분류: {row['emotion_group']} (신뢰도: {row['confidence']:.2f})")

def safe_strip(value):
    return str(value).strip() if pd.notna(value) else "입력값 없음"

print("======= 사용자 감정 + 문맥 해석 =======")
for _, row in df.iterrows():
    ai = row['ai_response']
    user = row['user_message']
    emo = row['mapped_emotion']
    conf = row['confidence']
    # 결측값 처리 후 키워드 체크

    if pd.notna(user):
        if "하자" in user or "좋아" in user or "그래" in user:
            explanation = "AI의 제안에 긍정적 반응을 보임"
        elif "몰라" in user or "어떻게" in user:
            explanation = "AI의 질문에 혼란/무기력 반응"
        elif "하기 싫다" in user or "싫어" in user:
            explanation = "AI의 기대에 반대하는 감정 표현"
        elif "망했어" in user or "안돼" in user:
            explanation = "AI 질문 후 절망/불안 응답"
        else:
            explanation = "사용자 반응에 따라 감정 유추"
    else:
        explanation = "입력값 없음"

    print(f"\n🤖 AI 응답: {safe_strip(ai)}")
    print(f"👤 사용자: {safe_strip(user)}")
    print(f"→ 감정: {emo} ({conf:.2f})")
    print(f"→ 해석: {explanation}")