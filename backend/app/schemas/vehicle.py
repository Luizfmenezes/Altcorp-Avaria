from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class VehicleCreate(BaseModel):
    plate: str
    prefix: Optional[str] = None
    model: str
    chassis: Optional[str] = None
    year: Optional[int] = None
    vehicle_type: str = "bus"


class VehicleUpdate(BaseModel):
    plate: Optional[str] = None
    prefix: Optional[str] = None
    model: Optional[str] = None
    chassis: Optional[str] = None
    year: Optional[int] = None
    vehicle_type: Optional[str] = None
    is_active: Optional[bool] = None


class VehicleOut(BaseModel):
    id: int
    plate: str
    prefix: Optional[str]
    model: str
    chassis: Optional[str]
    year: Optional[int]
    vehicle_type: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
