
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from MySql.database import SessionLocal
from MySql.models import User
from MySql.schemas import UserCreate
from MySql.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext


#데이터 유효성 검사와 직렬화/역직렬화를 쉽게 하기 위해 사용하는 코드
from pydantic import BaseModel
#redis 추가된 부분
from redis.redis_client import save_chat_message, get_recent_messages, cache_user_info
from redis.redis_emotion import save_emotion_analysis, get_emotion_history
from emotion_classifier import classify_emotion
from datetime import datetime

# DB 초기화
print("✅ DB 연결 시도 전")
Base.metadata.create_all(bind=engine)

print("✅ DB 연결 성공 및 테이블 생성 완료")

app = FastAPI()

#테스트용 임시 저장 주소
origins = [
    "http://localhost:3000",
    "http://192.168.0.193:3000",  # 실제 프론트 주소
]

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 배포 시 도메인으로 변경
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 비밀번호 해싱 도구
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# DB 세션 의존성 주입
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    print("🚀 /signup 요청 도착!")
    print(f"📦 받은 데이터: {user.dict()}")

    # 아이디 중복 확인
    if db.query(User).filter(User.userId == user.userId).first():
        print("⚠️ 이미 존재하는 아이디:", user.userId)
        raise HTTPException(status_code=400, detail="이미 사용 중인 아이디입니다.")

    # 비밀번호 해싱
    hashed_password = pwd_context.hash(user.password)

    new_user = User(
        userId=user.userId,
        name=user.name,
        password=hashed_password,
        email=user.email,
        birthDate=user.birthDate,
        gender=user.gender,
    )

    db.add(new_user)
    db.commit()
    cache_user_info(
        new_user.userId,
        {
            "name": new_user.name,
            "email": new_user.email,
            "gender": new_user.gender,
            "birthDate": str(new_user.birthDate),
        }
    )
    db.refresh(new_user)

    print("✅ 회원가입 성공:", new_user.userId)
    return {"message": "회원가입 성공", "userId": new_user.userId}

class ChatInput(BaseModel):
    userId: str
    message: str

@app.post("/chat")
def chat(chat: ChatInput):
    save_chat_message(chat.userId, chat.message)
    context = get_recent_messages(chat.userId)

    try:
        emotion, keywords = classify_emotion(chat.message)
        save_emotion_analysis(
            chat.userId,
            datetime.now().isoformat(),
            chat.message,
            emotion,
            keywords,
        )
    except Exception as e:
        print(f"Emotion classification failed: {e}")
        emotion = "unknown"

    # Echo the detected emotion in both the reply message and a dedicated field
    return {"context": context, "reply": emotion, "emotion": emotion}

@app.get("/chat/context/{user_id}")
def get_chat_context(user_id: str):
    messages = get_recent_messages(user_id)
    return {"recent_messages": messages}

@app.get("/chat/emotions/{user_id}")
def get_emotions(user_id: str, limit: int = 10):
    records = get_emotion_history(user_id, limit)
    return {"emotion_history": records}
