import os
import uuid
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger("orca.sms")

class BaseSMSProvider(ABC):
    @abstractmethod
    def send_sms(self, phone_number: str, message: str) -> Dict[str, Any]:
        pass

class TwilioSMSProvider(BaseSMSProvider):
    def __init__(self, account_sid: str, auth_token: str, from_number: str):
        self.account_sid = account_sid
        self.auth_token = auth_token
        self.from_number = from_number

    def send_sms(self, phone_number: str, message: str) -> Dict[str, Any]:
        try:
            # pyrefly: ignore [missing-import]
            from twilio.rest import Client
            client = Client(self.account_sid, self.auth_token)
            msg = client.messages.create(
                body=message,
                from_=self.from_number,
                to=phone_number
            )
            return {
                "status": "DELIVERED",
                "provider": "Twilio Live SMS",
                "sid": msg.sid,
                "phone_number": phone_number,
                "timestamp": datetime.utcnow().isoformat(),
                "is_live": True
            }
        except Exception as e:
            logger.error(f"Twilio SMS Error: {e}")
            return {"status": "FAILED", "error": str(e), "is_live": True}

class DemoSMSProvider(BaseSMSProvider):
    def send_sms(self, phone_number: str, message: str) -> Dict[str, Any]:
        sms_id = f"SMS-{str(uuid.uuid4())[:8].upper()}"
        print(f"\n=======================================================")
        print(f"📱 [AUTOMATIC SMS ALERT DISPATCHED]")
        print(f"   Recipient Phone: {phone_number}")
        print(f"   SMS ID:          {sms_id}")
        print(f"   Time:            {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
        print(f"   Content:         {message}")
        print(f"=======================================================\n")

        return {
            "status": "DELIVERED",
            "provider": "ORCA Automated SMS Dispatcher (DEMO DATA)",
            "sms_id": sms_id,
            "phone_number": phone_number,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            "is_live": False
        }

class SMSService:
    def __init__(self):
        twilio_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        twilio_auth = os.getenv("TWILIO_AUTH_TOKEN", "")
        twilio_from = os.getenv("TWILIO_PHONE_NUMBER", "")

        if twilio_sid and twilio_auth and twilio_from:
            self.provider = TwilioSMSProvider(twilio_sid, twilio_auth, twilio_from)
        else:
            self.provider = DemoSMSProvider()

    def dispatch_alert_sms(self, phone_number: str, decision_code: str, old_rec: str, new_rec: str, reason: str) -> Dict[str, Any]:
        """Format and dispatch automatic emergency SMS alert to fisherman / operator."""
        clean_phone = phone_number if phone_number else "+91 98765 43210"
        
        sms_text = (
            f"🚨 ORCA MARINE ALERT ({decision_code}): "
            f"Sea condition shift detected! Recommendation changed from {old_rec} → {new_rec}. "
            f"Reason: {reason}. Check ORCA Command Center immediately."
        )

        return self.provider.send_sms(clean_phone, sms_text)

sms_service = SMSService()
