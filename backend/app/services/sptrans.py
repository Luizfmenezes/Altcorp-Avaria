"""Cliente da API Olho Vivo (SPTrans).

A API exige autenticação por token: um POST em /Login/Autenticar devolve um
cookie de sessão usado nas chamadas seguintes. O cookie expira, então o cliente
re-autentica de forma transparente quando recebe 401/403.

Token: cadastre-se em https://www.sptrans.com.br/desenvolvedores/ e configure
OLHOVIVO_TOKEN no .env.
"""
import threading
import httpx
from app.core.config import settings


class SPTransError(RuntimeError):
    pass


class SPTransClient:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._authenticated = False
        self._client = httpx.Client(
            base_url=settings.OLHOVIVO_BASE_URL,
            timeout=httpx.Timeout(12.0),
        )

    @property
    def configured(self) -> bool:
        return bool(settings.OLHOVIVO_TOKEN)

    def _authenticate(self) -> None:
        if not self.configured:
            raise SPTransError("OLHOVIVO_TOKEN não configurado no backend.")
        resp = self._client.post("/Login/Autenticar", params={"token": settings.OLHOVIVO_TOKEN})
        resp.raise_for_status()
        if resp.text.strip().lower() != "true":
            raise SPTransError("Falha na autenticação com a API Olho Vivo (token inválido).")
        self._authenticated = True

    def _get(self, path: str, params: dict | None = None) -> httpx.Response:
        with self._lock:
            if not self._authenticated:
                self._authenticate()
        resp = self._client.get(path, params=params)
        if resp.status_code in (401, 403):
            # Sessão expirou — re-autentica uma vez e repete.
            with self._lock:
                self._authenticated = False
                self._authenticate()
            resp = self._client.get(path, params=params)
        resp.raise_for_status()
        return resp

    def search_lines(self, term: str) -> list[dict]:
        """Busca linhas por número, nome ou destino."""
        data = self._get("/Linha/Buscar", params={"termosBusca": term}).json()
        return [
            {
                "line_code": item.get("cl"),
                "circular": item.get("lc"),
                "sign": item.get("lt"),
                "direction": item.get("sl"),
                "main_terminal": item.get("tp"),
                "secondary_terminal": item.get("ts"),
            }
            for item in (data or [])
        ]

    def positions_by_line(self, line_code: int) -> dict:
        """Posições de todos os veículos de uma linha."""
        data = self._get("/Posicao/Linha", params={"codigoLinha": line_code}).json() or {}
        return {
            "timestamp": data.get("hr"),
            "vehicles": [_map_vehicle(v) for v in data.get("vs", [])],
        }

    def locate_by_prefix(self, prefix: str) -> dict | None:
        """Varre todas as posições da frota e devolve o veículo cujo prefixo casa.

        O Olho Vivo identifica veículos pelo prefixo (campo `p`), não pela placa.
        """
        wanted = prefix.strip().lstrip("0").upper()
        data = self._get("/Posicao").json() or {}
        for line in data.get("l", []):
            for v in line.get("vs", []):
                fleet = str(v.get("p", "")).lstrip("0").upper()
                if fleet and fleet == wanted:
                    mapped = _map_vehicle(v)
                    mapped["line_sign"] = line.get("c")
                    mapped["timestamp"] = data.get("hr")
                    return mapped
        return None


def _map_vehicle(v: dict) -> dict:
    return {
        "fleet_prefix": v.get("p"),
        "accessible": v.get("a"),
        "updated_at": v.get("ta"),
        "lat": v.get("py"),
        "lng": v.get("px"),
    }


sptrans = SPTransClient()
