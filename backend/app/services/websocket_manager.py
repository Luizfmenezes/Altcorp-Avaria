from fastapi import WebSocket
from typing import List
import json
import asyncio


class ConnectionManager:
    def __init__(self) -> None:
        self.active: List[WebSocket] = []
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self.active.append(ws)

    async def disconnect(self, ws: WebSocket) -> None:
        async with self._lock:
            if ws in self.active:
                self.active.remove(ws)

    async def broadcast(self, payload: dict) -> None:
        msg = json.dumps(payload, default=str)
        async with self._lock:
            stale = []
            for ws in self.active:
                try:
                    await ws.send_text(msg)
                except Exception:
                    stale.append(ws)
            for s in stale:
                if s in self.active:
                    self.active.remove(s)


manager = ConnectionManager()
