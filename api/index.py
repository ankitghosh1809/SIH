"""Vercel entry point for the FastAPI application.

The application source lives in ``backend/app`` for local Docker development.
Vercel discovers Python functions in ``api/``, so this small adapter places the
backend package on the import path and exposes the ASGI application.
"""

from pathlib import Path
import sys


BACKEND_DIR = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.main import app  # noqa: E402

