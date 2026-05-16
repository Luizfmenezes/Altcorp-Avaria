from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True)
    plate = Column(String(15), nullable=False, unique=True, index=True)
    prefix = Column(String(20), nullable=True)
    model = Column(String(120), nullable=False)
    chassis = Column(String(60), nullable=True)
    year = Column(Integer, nullable=True)
    vehicle_type = Column(String(20), nullable=False, default="bus")
    default_photo_key = Column(String(512), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    inspections = relationship("Inspection", back_populates="vehicle", cascade="all, delete-orphan")
