from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
import json, asyncio
from datetime import datetime
from app.core.database import get_db
from app.core.deps import require_web_access, require_inspector
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.inspection import Inspection
from app.models.damage import Damage
from app.models.photo import Photo
from app.schemas.inspection import InspectionCreate, InspectionOut, DamageOut, PhotoOut
from app.services.storage import storage
from app.services.websocket_manager import manager

router = APIRouter()


def _serialize(i: Inspection) -> InspectionOut:
    return InspectionOut(
        id=i.id,
        vehicle_id=i.vehicle_id,
        vehicle_plate=i.vehicle.plate if i.vehicle else None,
        vehicle_model=i.vehicle.model if i.vehicle else None,
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


@router.get("", response_model=List[InspectionOut])
def list_inspections(
    limit: int = Query(50, le=200),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_web_access),
):
    q = db.query(Inspection)
    if status:
        q = q.filter(Inspection.status == status)
    items = q.order_by(desc(Inspection.performed_at)).limit(limit).all()
    return [_serialize(i) for i in items]


@router.get("/{inspection_id}", response_model=InspectionOut)
def get_inspection(inspection_id: int, db: Session = Depends(get_db), _: User = Depends(require_web_access)):
    i = db.get(Inspection, inspection_id)
    if not i:
        raise HTTPException(404, "Vistoria não encontrada")
    return _serialize(i)


@router.post("", response_model=InspectionOut, status_code=201)
async def create_inspection(
    payload: InspectionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_inspector),
):
    vehicle = db.query(Vehicle).filter(Vehicle.plate == payload.vehicle_plate.upper().strip()).first()
    if not vehicle:
        raise HTTPException(404, f"Placa {payload.vehicle_plate} não cadastrada")

    if payload.client_uuid:
        existing = db.query(Inspection).filter(Inspection.client_uuid == payload.client_uuid).first()
        if existing:
            return _serialize(existing)

    insp = Inspection(
        client_uuid=payload.client_uuid,
        vehicle_id=vehicle.id,
        inspector_id=user.id,
        inspection_type=payload.inspection_type,
        status=payload.status,
        notes=payload.notes,
        performed_at=payload.performed_at or datetime.utcnow(),
    )
    db.add(insp)
    db.flush()
    for d in payload.damages:
        db.add(Damage(
            inspection_id=insp.id,
            area_code=d.area_code,
            severity=d.severity,
            description=d.description,
            x_pct=d.x_pct,
            y_pct=d.y_pct,
        ))
    db.commit()
    db.refresh(insp)
    out = _serialize(insp)
    asyncio.create_task(manager.broadcast({"event": "inspection.created", "data": out.model_dump(mode="json")}))
    return out


@router.post("/{inspection_id}/photos", response_model=PhotoOut, status_code=201)
async def upload_photo(
    inspection_id: int,
    file: UploadFile = File(...),
    damage_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    user: User = Depends(require_inspector),
):
    insp = db.get(Inspection, inspection_id)
    if not insp:
        raise HTTPException(404, "Vistoria não encontrada")
    content = await file.read()
    import io
    key = storage.upload(io.BytesIO(content), file.content_type or "image/jpeg", prefix=f"inspections/{inspection_id}")
    photo = Photo(
        inspection_id=inspection_id,
        damage_id=damage_id,
        object_key=key,
        content_type=file.content_type,
        size_bytes=len(content),
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return PhotoOut(
        id=photo.id,
        object_key=photo.object_key,
        url=storage.public_url(photo.object_key),
        content_type=photo.content_type,
        created_at=photo.created_at,
    )
