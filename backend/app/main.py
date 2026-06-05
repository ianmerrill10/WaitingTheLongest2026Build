from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .database import create_pool, close_pool
from .middleware.rate_limit import public_rate_limiter
from .routers import animals, status, batch, photos, organizations, public, meta


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create DB pool. Shutdown: close it."""
    await create_pool()
    yield
    await close_pool()


app = FastAPI(
    title="WaitingTheLongest.com API",
    description="Shelter Intake API + Public Read API for WaitingTheLongest.com",
    version=settings.api_version,
    lifespan=lifespan,
)

# CORS
origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Public endpoint rate limiting middleware
@app.middleware("http")
async def rate_limit_public_endpoints(request: Request, call_next):
    """Rate limit public endpoints to 100 req/min per IP."""
    if request.url.path.startswith("/v1/public"):
        client_ip = request.client.host if request.client else "unknown"
        if not await public_rate_limiter.acquire(client_ip):
            return JSONResponse(
                status_code=429,
                content={
                    "type": "about:blank",
                    "title": "Too Many Requests",
                    "status": 429,
                    "detail": "Rate limit exceeded. Max 100 requests per minute.",
                },
            )
    return await call_next(request)


# Register routers
app.include_router(animals.router)
app.include_router(status.router)
app.include_router(batch.router)
app.include_router(photos.router)
app.include_router(organizations.router)
app.include_router(public.router)
app.include_router(meta.router)


@app.get("/")
async def root():
    return {
        "name": "WaitingTheLongest.com API",
        "version": settings.api_version,
        "docs": "/docs",
    }
