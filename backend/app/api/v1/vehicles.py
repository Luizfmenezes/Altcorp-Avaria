from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime, date, timedelta
import io
from app.core.database import get_db
from app.core.deps import require_admin_or_analyst, require_web_access, get_current_user
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.inspection import Inspection
from app.models.damage import Damage
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleOut
from app.schemas.inspection import InspectionOut, DamageOut, PhotoOut
from app.services.storage import storage

router = APIRouter()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_PHOTO_BYTES = 8 * 1024 * 1024


def _serialize_vehicle(v: Vehicle) -> VehicleOut:
    return VehicleOut(
        id=v.id,
        plate=v.plate,
        prefix=v.prefix,
        model=v.model,
        chassis=v.chassis,
        year=v.year,
        vehicle_type=v.vehicle_type,
        is_active=v.is_active,
        default_photo_url=storage.public_url(v.default_photo_key) if v.default_photo_key else None,
        created_at=v.created_at,
    )


@router.get("", response_model=List[VehicleOut])
def list_vehicles(
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_web_access),
):
    query = db.query(Vehicle)
    if q:
        like = f"%{q.upper()}%"
        query = query.filter(or_(Vehicle.plate.ilike(like), Vehicle.prefix.ilike(like), Vehicle.model.ilike(like)))
    return [_serialize_vehicle(v) for v in query.order_by(Vehicle.plate).limit(200).all()]


@router.post("", response_model=VehicleOut, status_code=201)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db), _: User = Depends(require_admin_or_analyst)):
    plate = payload.plate.upper().strip()
    if db.query(Vehicle).filter(Vehicle.plate == plate).first():
        raise HTTPException(409, "Placa já cadastrada")
    v = Vehicle(
        plate=plate,
        prefix=payload.prefix,
        model=payload.model,
        chassis=payload.chassis,
        year=payload.year,
        vehicle_type=payload.vehicle_type,
    )
    db.add(v)
    db.commit()
    db.refresh(v)
    return _serialize_vehicle(v)


@router.patch("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(vehicle_id: int, payload: VehicleUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin_or_analyst)):
    v = db.get(Vehicle, vehicle_id)
    if not v:
        raise HTTPException(404, "Veículo não encontrado")
    data = payload.model_dump(exclude_unset=True)
    if "plate" in data and data["plate"]:
        plate = data["plate"].upper().strip()
        clash = db.query(Vehicle).filter(Vehicle.plate == plate, Vehicle.id != vehicle_id).first()
        if clash:
            raise HTTPException(409, "Placa já cadastrada em outro veículo")
        data["plate"] = plate
    for k, val in data.items():
        setattr(v, k, val)
    db.commit()
    db.refresh(v)
    return _serialize_vehicle(v)


@router.post("/{vehicle_id}/photo", response_model=VehicleOut)
def upload_default_photo(
    vehicle_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin_or_analyst),
):
    v = db.get(Vehicle, vehicle_id)
    if not v:
        raise HTTPException(404, "Veículo não encontrado")
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(415, "Formato inválido. Envie JPEG, PNG ou WebP.")
    content = file.file.read()
    if len(content) > MAX_PHOTO_BYTES:
        raise HTTPException(413, "Imagem maior que 8 MB.")
    key = storage.upload(io.BytesIO(content), file.content_type or "image/jpeg", prefix=f"vehicles/{vehicle_id}")
    v.default_photo_key = key
    db.commit()
    db.refresh(v)
    return _serialize_vehicle(v)


@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db), _: User = Depends(require_web_access)):
    v = db.get(Vehicle, vehicle_id)
    if not v:
        raise HTTPException(404, "Veículo não encontrado")
    return _serialize_vehicle(v)


@router.get("/{vehicle_id}/history", response_model=List[InspectionOut])
def vehicle_history(
    vehicle_id: int,
    day: Optional[str] = Query(None, description="Filtra por dia (YYYY-MM-DD)"),
    month: Optional[str] = Query(None, description="Filtra por mês (YYYY-MM)"),
    limit: Optional[int] = Query(None, ge=1, le=200, description="Limita aos últimos N registros"),
    db: Session = Depends(get_db),
    _: User = Depends(require_web_access),
):
    v = db.get(Vehicle, vehicle_id)
    if not v:
        raise HTTPException(404, "Veículo não encontrado")

    query = db.query(Inspection).filter(Inspection.vehicle_id == vehicle_id)

    if day:
        try:
            d = date.fromisoformat(day)
        except ValueError:
            raise HTTPException(422, "Parâmetro 'day' deve estar no formato YYYY-MM-DD")
        start = datetime(d.year, d.month, d.day)
        query = query.filter(
            Inspection.performed_at >= start,
            Inspection.performed_at < start + timedelta(days=1),
        )
    elif month:
        try:
            y, m = (int(p) for p in month.split("-"))
            start = datetime(y, m, 1)
            end = datetime(y + (m // 12), (m % 12) + 1, 1)
        except (ValueError, IndexError):
            raise HTTPException(422, "Parâmetro 'month' deve estar no formato YYYY-MM")
        query = query.filter(Inspection.performed_at >= start, Inspection.performed_at < end)

    query = query.order_by(Inspection.performed_at.desc())
    if limit:
        query = query.limit(limit)

    out: List[InspectionOut] = []
    for i in query.all():
        out.append(
            InspectionOut(
                id=i.id,
                vehicle_id=i.vehicle_id,
                vehicle_plate=v.plate,
                vehicle_model=v.model,
                vehicle_type=v.vehicle_type,
                vehicle_default_photo_url=storage.public_url(v.default_photo_key) if v.default_photo_key else None,
                inspector_id=i.inspector_id,
                inspector_name=i.inspector.name if i.inspector else None,
                inspection_type=i.inspection_type,
                status=i.status,
                notes=i.notes,
                performed_at=i.performed_at,
                damages=[DamageOut.model_validate(d) for d in i.damages],
                photos=[
                    PhotoOut(
                        id=p.id,
                        object_key=p.object_key,
                        url=storage.public_url(p.object_key),
                        content_type=p.content_type,
                        created_at=p.created_at,
                    )
                    for p in i.photos
                ],
            )
        )
    return out


@router.get("/by-plate/{plate}", response_model=VehicleOut)
def by_plate(plate: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    v = db.query(Vehicle).filter(Vehicle.plate == plate.upper().strip()).first()
    if not v:
        raise HTTPException(404, "Placa não encontrada")
    return _serialize_vehicle(v)
