from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str  # aceita username ou email — validação real é contra o banco
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserPublic"


class UserPublic(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


TokenResponse.model_rebuild()
