from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta, timezone
from typing import Annotated
from app.core.database import get_db
from app.core.deps import require_web_access
from app.models.inspection import Inspection
from app.models.damage import Damage
from app.models.vehicle import Vehicle
from app.models.user import User

router = APIRouter()


@router.get("/metrics")
def metrics(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_web_access)],
):
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    week_with_damage = (
        db.query(func.count(func.distinct(Inspection.vehicle_id)))
        .filter(Inspection.performed_at >= week_ago, Inspection.status == "with_damage")
        .scalar() or 0
    )
    total_inspections_week = (
        db.query(func.count(Inspection.id)).filter(Inspection.performed_at >= week_ago).scalar() or 0
    )
    total_vehicles = db.query(func.count(Vehicle.id)).scalar() or 0
    total_damages_month = (
        db.query(func.count(Damage.id))
        .join(Inspection, Damage.inspection_id == Inspection.id)
        .filter(Inspection.performed_at >= month_ago)
        .scalar() or 0
    )

    daily = (
        db.query(
            func.date_trunc("day", Inspection.performed_at).label("day"),
            func.count(Inspection.id).label("total"),
        )
        .filter(Inspection.performed_at >= month_ago)
        .group_by("day")
        .order_by("day")
        .all()
    )
    daily_series = [{"day": r[0].date().isoformat(), "total": int(r[1])} for r in daily]

    intervals_hours: list[float] = []
    last_seen_by_vehicle: dict[int, datetime] = {}
    inspection_timestamps = (
        db.query(Inspection.vehicle_id, Inspection.performed_at)
        .order_by(Inspection.vehicle_id, Inspection.performed_at)
        .all()
    )
    for vehicle_id, performed_at in inspection_timestamps:
        previous = last_seen_by_vehicle.get(vehicle_id)
        if previous and performed_at:
            intervals_hours.append((performed_at - previous).total_seconds() / 3600)
        if performed_at:
            last_seen_by_vehicle[vehicle_id] = performed_at

    avg_hours_between_inspections = (
        round(sum(intervals_hours) / len(intervals_hours), 1) if intervals_hours else None
    )

    return {
        "vehicles_with_damage_week": int(week_with_damage),
        "inspections_week": int(total_inspections_week),
        "total_vehicles": int(total_vehicles),
        "damages_month": int(total_damages_month),
        "avg_hours_between_inspections": avg_hours_between_inspections,
        "daily": daily_series,
    }


@router.get("/top-vehicles")
def top_vehicles(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_web_access)],
):
    rows = (
        db.query(
            Vehicle.id,
            Vehicle.plate,
            Vehicle.model,
            func.count(Damage.id).label("damages"),
        )
        .join(Inspection, Inspection.vehicle_id == Vehicle.id)
        .join(Damage, Damage.inspection_id == Inspection.id)
        .group_by(Vehicle.id)
        .order_by(desc("damages"))
        .limit(10)
        .all()
    )
    return [
        {"id": r[0], "plate": r[1], "model": r[2], "damages": int(r[3])}
        for r in rows
    ]


@router.get("/heatmap")
def heatmap(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_web_access)],
):
    rows = (
        db.query(Damage.area_code, func.count(Damage.id))
        .group_by(Damage.area_code)
        .order_by(desc(func.count(Damage.id)))
        .all()
    )
    return [{"area": r[0], "count": int(r[1])} for r in rows]


@router.get("/heatmap-points")
def heatmap_points(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_web_access)],
):
    rows = (
        db.query(Damage.x_pct, Damage.y_pct, Damage.severity)
        .filter(Damage.x_pct.isnot(None), Damage.y_pct.isnot(None))
        .all()
    )
    return [{"x": float(r[0]), "y": float(r[1]), "severity": r[2]} for r in rows]
