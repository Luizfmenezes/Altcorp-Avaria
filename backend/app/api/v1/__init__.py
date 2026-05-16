from fastapi import APIRouter
from app.api.v1 import auth, users, vehicles, inspections, dashboard, ws, sptrans

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["vehicles"])
api_router.include_router(inspections.router, prefix="/inspections", tags=["inspections"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(sptrans.router, prefix="/sptrans", tags=["sptrans"])
api_router.include_router(ws.router, prefix="/ws", tags=["websocket"])
