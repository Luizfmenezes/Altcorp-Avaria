from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    DATABASE_URL: str = "postgresql+psycopg://avarias:avarias_secret@postgres:5432/avarias"

    JWT_SECRET: str = "change_me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 720

    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin123"
    MINIO_BUCKET: str = "avarias-photos"
    MINIO_SECURE: bool = False
    MINIO_PUBLIC_URL: str = "http://localhost:9000"

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174"

    SEED_ADMIN_EMAIL: str = "admin@altcorp.com"
    SEED_ADMIN_PASSWORD: str = "admin123"

    # SPTrans Olho Vivo — token obtido em https://www.sptrans.com.br/desenvolvedores/
    OLHOVIVO_TOKEN: str = ""
    OLHOVIVO_BASE_URL: str = "http://api.olhovivo.sptrans.com.br/v2.1"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
