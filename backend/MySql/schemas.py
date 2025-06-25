from pydantic import BaseModel, EmailStr
from datetime import date

class UserCreate(BaseModel):
    userId: str
    name: str
    password: str
    email: EmailStr
    birthDate: date
    gender: str
