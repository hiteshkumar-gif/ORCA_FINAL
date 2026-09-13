# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from apscheduler.schedulers.background import BackgroundScheduler
# pyrefly: ignore [missing-import]
import uvicorn
from contextlib import asynccontextmanager

from backend.config import settings
from backend.api.router import router
from backend.services.monitoring_service import monitoring_service

# Initialize Background Scheduler for Living Decisions
scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start APScheduler for monitoring
    scheduler.add_job(
        monitoring_service.check_active_decisions,
        'interval',
        minutes=settings.MONITORING_INTERVAL_MINUTES,
        id='orca_living_decision_monitor'
    )
    scheduler.start()
    yield
    # Shutdown
    scheduler.shutdown()

app = FastAPI(
    title="ORCA — Marine Ecosystem Reasoning with Collaborative Agents",
    description="Full-Stack Agentic AI Marine Intelligence & Decision-Support Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS to accept all dev requests seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=settings.PORT, reload=settings.DEBUG)
