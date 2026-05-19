from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class DamageIn(BaseModel):
    area_code: str
    severity: str = "medium"
    description: Optional[str] = None
    x_pct: Optional[float] = None
    y_pct: Optional[float] = None


class DamageOut(DamageIn):
    id: int

    class Config:
        from_attributes = True


class PhotoOut(BaseModel):
    id: int
    object_key: str
    url: Optional[str] = None
    content_type: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class InspectionCreate(BaseModel):
    client_uuid: Optional[str] = None
    vehicle_plate: str
    vehicle_prefix: Optional[str] = None
    inspection_type: str
    status: str = "approved"
    notes: Optional[str] = None
    damages: List[DamageIn] = []
    performed_at: Optional[datetime] = None


class InspectionOut(BaseModel):
    id: int
    vehicle_id: int
    vehicle_plate: Optional[str] = None
    vehicle_prefix: Optional[str] = None
    vehicle_model: Optional[str] = None
    vehicle_type: Optional[str] = None
    vehicle_default_photo_url: Optional[str] = None
    inspector_id: Optional[int]
    inspector_name: Optional[str] = None
    inspection_type: str
    status: str
    notes: Optional[str]
    performed_at: datetime
    damages: List[DamageOut] = []
    photos: List[PhotoOut] = []

    class Config:
        from_attributes = True
