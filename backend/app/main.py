from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api import routes
from app.ml import ml_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting GENEVA API...")
    init_db()
    
    # Try to load dataset and models
    ml_service.load_dataset()
    ml_service.load_models()
    
    print("GENEVA API started successfully")
    yield
    
    # Shutdown
    print("Shutting down GENEVA API...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI Cardiovascular Risk Visualization & Prediction System for IIT Mandi Multimodal AI Hackathon 2026",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(routes.router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.VERSION,
        "description": "AI Cardiovascular Risk Visualization & Prediction System",
        "hackathon": "IIT Mandi Multimodal AI Hackathon 2026 - Track A",
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/health",
        "disclaimer": "For research and educational use only. Not a substitute for professional medical diagnosis."
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)