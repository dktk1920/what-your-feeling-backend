from sqlalchemy import Column, String, Date
from .database import Base

class User(Base):
    __tablename__ = "users"

    userId = Column(String(100), primary_key=True)  # ✅ userId가 PK
    name = Column(String(100), nullable=False)
    password = Column(String(255), nullable=False)
    email = Column(String(100), nullable=False)
    gender = Column(String(10))
    birthDate = Column(Date)
