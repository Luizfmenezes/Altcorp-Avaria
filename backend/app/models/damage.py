from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Damage(Base):
    __tablename__ = "damages"

    id = Column(Integer, primary_key=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False)
    area_code = Column(String(40), nullable=False, index=True)
    severity = Column(String(20), nullable=False, default="medium")
    description = Column(Text, nullable=True)
    x_pct = Column(Float, nullable=True)
    y_pct = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    inspection = relationship("Inspection", back_populates="damages")
    photos = relationship("Photo", back_populates="damage")
