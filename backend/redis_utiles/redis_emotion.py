# redis_emotion_client.py
from redis import Redis
import json

redis = Redis(host="localhost", port=6379, decode_responses=True)

def save_emotion_analysis(user_id: str, timestamp: str, message: str, emotion: str, keywords: list):
    key = f"chat:emotion:{user_id}"
    data = {
        "userId": user_id,
        "timestamp": timestamp,
        "message": message,
        "emotion": emotion,
        "keywords": keywords,
    }
    redis.rpush(key, json.dumps(data))

def get_emotion_history(user_id: str, limit: int = 10):
    key = f"chat:emotion:{user_id}"
    raw_data = redis.lrange(key, -limit, -1)
    return [json.loads(entry) for entry in raw_data]