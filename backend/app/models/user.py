from enum import Enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.core.database import Base


class Role(str, Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    INSPECTOR = "inspector"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    email = Column(String(180), nullable=False, unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default=Role.INSPECTOR.value)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
