import logging

import requests

from config import Config

logger = logging.getLogger(__name__)


class HostAPIClient:
    def __init__(self):
        self.base_url = Config.HOST_API_URL
        self.headers = {"X-API-Key": Config.HOST_API_KEY}

    def _get(self, path: str, params: dict | None = None) -> dict | list | None:
        try:
            resp = requests.get(
                f"{self.base_url}{path}",
                headers=self.headers,
                params=params,
                timeout=5,
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.warning("Host API unavailable (%s): %s", path, e)
            return None

    def get_stats(self) -> dict:
        data = self._get("/api/admin/stats")
        return data if data else {
            "total_bookings": 0,
            "total_revenue": 0,
            "active_hosts": 0,
            "active_rooms": 0,
            "pending_verifications": 0,
            "reported_rooms": 0,
            "open_disputes": 0,
        }

    def get_revenue(self, period: str = "30d") -> list:
        return self._get("/api/admin/stats/revenue", params={"period": period}) or []

    def get_booking_stats(self, period: str = "30d") -> list:
        return self._get("/api/admin/stats/bookings", params={"period": period}) or []

    def is_available(self) -> bool:
        try:
            resp = requests.get(f"{self.base_url}/api/admin/stats", headers=self.headers, timeout=3)
            return resp.status_code == 200
        except Exception:
            return False


host_api = HostAPIClient()
