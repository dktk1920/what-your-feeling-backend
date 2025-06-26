from datetime import datetime
from redis_emotion import save_emotion_analysis, get_emotion_history

# 테스트 데이터
user_id = "testuser01"
message = "요즘 너무 즐겁고 행복해!"
sentiment = "긍정"
keywords = ["행복", "즐거움", "기쁨"]
timestamp = datetime.now().isoformat()

# 저장
save_emotion_analysis(user_id, timestamp, message, sentiment, keywords)
print("✅ 감정 분석 결과 저장 완료")

# 조회
history = get_emotion_history(user_id)
print("🧾 최근 감정 히스토리:")
for record in history:
    print(record)
