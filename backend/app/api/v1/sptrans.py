import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.deps import require_web_access
from app.models.user import User
from app.services.sptrans import sptrans, SPTransError

router = APIRouter()


@router.get("/status")
def status(_: User = Depends(require_web_access)):
    """Indica se a integração Olho Vivo está configurada."""
    return {"configured": sptrans.configured}


@router.get("/lines")
def search_lines(
    q: str = Query(..., min_length=2, description="Número, nome ou destino da linha"),
    _: User = Depends(require_web_access),
):
    try:
        return sptrans.search_lines(q)
    except SPTransError as e:
        raise HTTPException(503, str(e))
    except httpx.HTTPError as e:
        raise HTTPException(502, f"Erro ao consultar a API Olho Vivo: {e}")


@router.get("/positions")
def positions(
    line_code: int = Query(..., description="Código da linha (cl)"),
    _: User = Depends(require_web_access),
):
    try:
        return sptrans.positions_by_line(line_code)
    except SPTransError as e:
        raise HTTPException(503, str(e))
    except httpx.HTTPError as e:
        raise HTTPException(502, f"Erro ao consultar a API Olho Vivo: {e}")


@router.get("/locate")
def locate(
    prefix: str = Query(..., min_length=1, description="Prefixo de frota do veículo"),
    _: User = Depends(require_web_access),
):
    """Localiza um veículo da frota pelo prefixo na malha SPTrans."""
    try:
        vehicle = sptrans.locate_by_prefix(prefix)
    except SPTransError as e:
        raise HTTPException(503, str(e))
    except httpx.HTTPError as e:
        raise HTTPException(502, f"Erro ao consultar a API Olho Vivo: {e}")
    if not vehicle:
        raise HTTPException(404, "Veículo não encontrado em operação no momento.")
    return vehicle
