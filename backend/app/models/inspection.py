from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True)
    client_uuid = Column(String(64), nullable=True, unique=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    inspector_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    # Prefixo informado pelo inspetor no momento da vistoria (pode diferir do cadastro).
    vehicle_prefix = Column(String(20), nullable=True)
    inspection_type = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False, default="approved")
    notes = Column(Text, nullable=True)
    performed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    vehicle = relationship("Vehicle", back_populates="inspections")
    inspector = relationship("User")
    damages = relationship("Damage", back_populates="inspection", cascade="all, delete-orphan")
    photos = relationship("Photo", back_populates="inspection", cascade="all, delete-orphan")
