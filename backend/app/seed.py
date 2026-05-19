from app.core.database import SessionLocal
from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User, Role


def run() -> None:
    """Cria o usuário Administrador na primeira inicialização.

    Produção: nenhuma conta demo nem veículo de exemplo é inserido.
    O cadastro da frota é feito pela própria aplicação (import XLSX / formulário).
    """
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
            print(f"[seed] admin created: {settings.SEED_ADMIN_EMAIL}")
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run()
