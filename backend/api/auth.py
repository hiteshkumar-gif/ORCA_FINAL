import hashlib
from datetime import datetime
from typing import Optional
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database.database import get_db
from backend.models.models import User

auth_router = APIRouter(prefix="/auth")

class RegisterRequest(BaseModel):
    name: str
    email: str
    phone_number: str = "+91 98765 43210"
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class SMSConfigPayload(BaseModel):
    phone_number: str
    sms_alerts_enabled: bool = True
    wave_alert_threshold_m: float = 2.0

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@auth_router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    user = User(
        name=payload.name,
        email=payload.email,
        phone_number=payload.phone_number,
        password_hash=hash_password(payload.password),
        sms_alerts_enabled=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "status": "success",
        "token": f"token-{user.id}",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone_number": user.phone_number,
            "sms_alerts_enabled": user.sms_alerts_enabled
        }
    }

@auth_router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or user.password_hash != hash_password(payload.password):
        # Quick Demo Login fallback if email contains demo
        if payload.email in ["demo@orca.ai", "fisherman@orca.ai"]:
            if not user:
                user = User(
                    name="Captain Hitesh (Fisherman)",
                    email=payload.email,
                    phone_number="+91 98765 43210",
                    password_hash=hash_password(payload.password),
                    sms_alerts_enabled=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "status": "success",
        "token": f"token-{user.id}",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone_number": user.phone_number,
            "sms_alerts_enabled": user.sms_alerts_enabled
        }
    }

@auth_router.get("/me")
def get_me(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        user = User(
            name="Captain Hitesh (Fisherman)",
            email="fisherman@orca.ai",
            phone_number="+91 98765 43210",
            sms_alerts_enabled=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone_number": user.phone_number,
        "sms_alerts_enabled": user.sms_alerts_enabled,
        "wave_alert_threshold_m": user.wave_alert_threshold_m
    }

@auth_router.post("/sms-config")
def update_sms_config(payload: SMSConfigPayload, db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        user = User(
            name="Captain Hitesh (Fisherman)",
            email="fisherman@orca.ai",
            phone_number=payload.phone_number,
            sms_alerts_enabled=payload.sms_alerts_enabled
        )
        db.add(user)
    else:
        user.phone_number = payload.phone_number
        user.sms_alerts_enabled = payload.sms_alerts_enabled
        user.wave_alert_threshold_m = payload.wave_alert_threshold_m

    db.commit()
    db.refresh(user)

    return {
        "status": "success",
        "message": f"SMS Alert Settings updated. Emergency alerts will be sent automatically to {user.phone_number}.",
        "phone_number": user.phone_number,
        "sms_alerts_enabled": user.sms_alerts_enabled
    }
