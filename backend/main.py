from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
from datetime import datetime
import os

# 🧩 내부 모듈
from MySql.database import SessionLocal, Base, engine
from MySql.models import User
from MySql.schemas import UserCreate
from redis_utiles.redis_client import save_chat_message, get_recent_messages, cache_user_info
from redis_utiles.redis_emotion import save_emotion_analysis, get_emotion_history
from services.emotion_classifier import classify_emotion, classify_emotion_gpt
# ✅ 환경변수 로드 및 OpenAI 클라이언트 설정
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ✅ DB 연결
print("✅ DB 연결 시도 전")
Base.metadata.create_all(bind=engine)
print("✅ DB 연결 성공 및 테이블 생성 완료")

# ✅ FastAPI 앱 초기화 및 CORS 설정
app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://192.168.0.193:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ✅ DB 세션 의존성 주입
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ 회원가입 API
@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    print("🚀 /signup 요청 도착!")
    print(f"📦 받은 데이터: {user.dict()}")

    if db.query(User).filter(User.userId == user.userId).first():
        print("⚠️ 이미 존재하는 아이디:", user.userId)
        raise HTTPException(status_code=400, detail="이미 사용 중인 아이디입니다.")

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
    db.refresh(new_user)

    cache_user_info(
        new_user.userId,
        {
            "name": new_user.name,
            "email": new_user.email,
            "gender": new_user.gender,
            "birthDate": str(new_user.birthDate),
        }
    )

    print("✅ 회원가입 성공:", new_user.userId)
    return {"message": "회원가입 성공", "userId": new_user.userId}


# ✅ 감정 분석 + 응답 생성 API
class ChatInput(BaseModel):
    userId: str
    message: str

@app.post("/chat")
def chat_with_ai(chat: ChatInput):
    print(f"🛠️ chat.userId: {chat.userId}")
    print(f"🛠️ chat.message: {chat.message}")
    print(f"[DEBUG] userId: {chat.userId}, message: {chat.message}")

    try:
        # 1️⃣ 감정 분석 + 키워드 추출 (우선 GPT 시도, 실패 시 로컬 규칙 사용)
        emotion, keywords = classify_emotion_gpt(chat.message, client)

        # 2️⃣ 최근 대화 내용 Redis에서 불러오기 (context)
        context = get_recent_messages(chat.userId)

        # 3️⃣ GPT 프롬프트 생성
        prompt = [
            {"role": "system", "content": "You are a warm, empathetic assistant replying in Korean."},
            {"role": "user", "content": chat.message},
        ]

        # 4️⃣ GPT 응답 생성 (OpenAI v1 방식)
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=prompt
            )
            reply_text = response.choices[0].message.content.strip()
        except Exception as gpt_error:
            print(f"⚠️ GPT 호출 실패: {gpt_error}")
            reply_text = "죄송합니다. 현재 답변을 생성할 수 없습니다."

        # 5️⃣ Redis 저장
        timestamp = datetime.now().isoformat()
        save_chat_message(
            user_id=chat.userId,
            timestamp=timestamp,
            message=chat.message,
            emotion=emotion,
            keywords=keywords,
        )
        save_emotion_analysis(
            user_id=chat.userId,
            timestamp=timestamp,
            message=chat.message,
            emotion=emotion,
            keywords=keywords,
        )

        return {
            "context": context,
            "reply": reply_text,
            "emotion": emotion,
        }

    except Exception as e:
        print(f"🔥 에러 발생: {e}")
        raise HTTPException(status_code=500, detail="AI response generation failed")


# ✅ 감정 히스토리 및 컨텍스트 조회용 API
@app.get("/chat/context/{user_id}")
def get_chat_context(user_id: str):
    messages = get_recent_messages(user_id)
    return {"recent_messages": messages}

@app.get("/chat/emotions/{user_id}")
def get_emotions(user_id: str, limit: int = 10):
    records = get_emotion_history(user_id, limit)
    return {"emotion_history": records}
