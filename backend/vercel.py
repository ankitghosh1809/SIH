"""Vercel Services entry point for the FastAPI backend.

The service is mounted at ``/api``. Vercel strips that prefix before invoking
the ASGI app, while the established API contract already declares routes under
``/api/v1``. This adapter restores the prefix before forwarding the request so
the contract remains unchanged for both the frontend and external API clients.
"""

from app.main import app as fastapi_app


async def app(scope, receive, send):
    if scope["type"] in {"http", "websocket"}:
        scope = dict(scope)
        scope["path"] = "/api" + scope["path"]
        scope["raw_path"] = b"/api" + scope.get("raw_path", b"")
    await fastapi_app(scope, receive, send)
