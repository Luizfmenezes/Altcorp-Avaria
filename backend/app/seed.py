from app.core.database import SessionLocal
from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User, Role
from app.models.vehicle import Vehicle


def run() -> None:
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == settings.SEED_ADMIN_EMAIL).first():
            db.add(User(
                name="Administrador",
                email=settings.SEED_ADMIN_EMAIL,
                hashed_password=hash_password(settings.SEED_ADMIN_PASSWORD),
                role=Role.ADMIN.value,
                is_active=True,
            ))
            print(f"[seed] admin created: {settings.SEED_ADMIN_EMAIL} / {settings.SEED_ADMIN_PASSWORD}")

        if not db.query(User).filter(User.email == "analista@altcorp.com").first():
            db.add(User(
                name="Ana Lista",
                email="analista@altcorp.com",
                hashed_password=hash_password("analista123"),
                role=Role.ANALYST.value,
                is_active=True,
            ))
            print("[seed] analyst created: analista@altcorp.com / analista123")

        if not db.query(User).filter(User.email == "inspetor@altcorp.com").first():
            db.add(User(
                name="João Inspetor",
                email="inspetor@altcorp.com",
                hashed_password=hash_password("inspetor123"),
                role=Role.INSPECTOR.value,
                is_active=True,
            ))
            print("[seed] inspector created: inspetor@altcorp.com / inspetor123")

        sample_vehicles = [
            ("ABC1D23", "1001", "Mercedes-Benz O500", "bus"),
            ("XYZ4E56", "1002", "Volvo B270F", "bus"),
            ("DEF7G89", "1003", "Marcopolo Paradiso", "bus"),
            ("GHI0J12", "C-101", "Fiat Strada", "car"),
            ("JKL3M45", "C-102", "Volkswagen Saveiro", "car"),
        ]
        for plate, prefix, model, vt in sample_vehicles:
            if not db.query(Vehicle).filter(Vehicle.plate == plate).first():
                db.add(Vehicle(plate=plate, prefix=prefix, model=model, vehicle_type=vt, year=2022))
                print(f"[seed] vehicle: {plate}")
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run()
