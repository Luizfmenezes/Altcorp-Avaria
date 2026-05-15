import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from app.core.config import settings
from typing import BinaryIO
import uuid


class StorageService:
    def __init__(self) -> None:
        self.client = boto3.client(
            "s3",
            endpoint_url=f"http{'s' if settings.MINIO_SECURE else ''}://{settings.MINIO_ENDPOINT}",
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            config=Config(signature_version="s3v4"),
            region_name="us-east-1",
        )
        self.bucket = settings.MINIO_BUCKET
        self._ensure_bucket()

    def _ensure_bucket(self) -> None:
        try:
            self.client.head_bucket(Bucket=self.bucket)
        except ClientError:
            try:
                self.client.create_bucket(Bucket=self.bucket)
            except ClientError:
                pass

    def upload(self, file_obj: BinaryIO, content_type: str, prefix: str = "photos") -> str:
        key = f"{prefix}/{uuid.uuid4().hex}"
        self.client.upload_fileobj(
            file_obj,
            self.bucket,
            key,
            ExtraArgs={"ContentType": content_type or "application/octet-stream"},
        )
        return key

    def public_url(self, key: str) -> str:
        return f"{settings.MINIO_PUBLIC_URL}/{self.bucket}/{key}"

    def presigned_get(self, key: str, expires: int = 3600) -> str:
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=expires,
        )


storage = StorageService()
