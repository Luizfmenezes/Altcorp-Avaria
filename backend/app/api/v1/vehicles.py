from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
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
    return query.order_by(Vehicle.plate).limit(200).all()


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
    return v


@router.patch("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(vehicle_id: int, payload: VehicleUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin_or_analyst)):
    v = db.get(Vehicle, vehicle_id)
    if not v:
        raise HTTPException(404, "Veículo não encontrado")
    data = payload.model_dump(exclude_unset=True)
    if "plate" in data:
        data["plate"] = data["plate"].upper().strip()
    for k, val in data.items():
        setattr(v, k, val)
    db.commit()
    db.refresh(v)
    return v


@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db), _: User = Depends(require_web_access)):
    v = db.get(Vehicle, vehicle_id)
    if not v:
        raise HTTPException(404, "Veículo não encontrado")
    return v


@router.get("/{vehicle_id}/history", response_model=List[InspectionOut])
def vehicle_history(vehicle_id: int, db: Session = Depends(get_db), _: User = Depends(require_web_access)):
    v = db.get(Vehicle, vehicle_id)
    if not v:
        raise HTTPException(404, "Veículo não encontrado")
    insps = (
        db.query(Inspection)
        .filter(Inspection.vehicle_id == vehicle_id)
        .order_by(Inspection.performed_at.desc())
        .all()
    )
    out: List[InspectionOut] = []
    for i in insps:
        out.append(
            InspectionOut(
                id=i.id,
                vehicle_id=i.vehicle_id,
                vehicle_plate=v.plate,
                vehicle_model=v.model,
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
    return v
