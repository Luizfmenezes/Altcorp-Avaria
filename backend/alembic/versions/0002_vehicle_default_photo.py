"""vehicle default photo

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-16

"""
from alembic import op
import sqlalchemy as sa


revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("vehicles", sa.Column("default_photo_key", sa.String(length=512), nullable=True))


def downgrade() -> None:
    op.drop_column("vehicles", "default_photo_key")
