"""
HTTP client for calling Host-TiraNa API endpoints.
Used by Admin dashboard to fetch rooms, bookings, reviews, etc.
"""

import httpx
import logging
from typing import Optional, Dict, Any, List
from ..config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


class HostAPIClient:
    """Client for calling Host-TiraNa admin proxy endpoints."""

    def __init__(self):
        self.base_url = settings.HOST_API_BASE_URL.rstrip("/")
        self.timeout = 10.0

    async def _get(self, endpoint: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """Make GET request to Host API with error handling."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}{endpoint}", params=params)
                response.raise_for_status()
                return response.json()
        except httpx.ConnectError:
            logger.warning(f"Host API unavailable: {endpoint}")
            return None
        except httpx.TimeoutException:
            logger.warning(f"Host API timeout: {endpoint}")
            return None
        except Exception as e:
            logger.error(f"Host API error: {endpoint} - {str(e)}")
            return None

    async def _post(self, endpoint: str, data: Optional[Dict] = None) -> Optional[Dict]:
        """Make POST request to Host API with error handling."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(f"{self.base_url}{endpoint}", json=data)
                response.raise_for_status()
                return response.json()
        except httpx.ConnectError:
            logger.warning(f"Host API unavailable: {endpoint}")
            return None
        except httpx.TimeoutException:
            logger.warning(f"Host API timeout: {endpoint}")
            return None
        except Exception as e:
            logger.error(f"Host API error: {endpoint} - {str(e)}")
            return None

    # ─── Stats ─────────────────────────────────────────────────

    async def get_stats(self) -> Dict[str, Any]:
        """Get dashboard statistics from Host API."""
        result = await self._get("/api/admin/stats")
        return result or {
            "total_hosts": 0,
            "total_properties": 0,
            "total_bookings": 0,
            "total_revenue": 0
        }

    async def get_revenue_stats(self, period: str = "monthly") -> Dict[str, Any]:
        """Get revenue statistics."""
        result = await self._get("/api/admin/stats/revenue", {"period": period})
        return result or {"revenue": [], "total": 0}

    async def get_booking_stats(self, period: str = "monthly") -> Dict[str, Any]:
        """Get booking statistics."""
        result = await self._get("/api/admin/stats/bookings", {"period": period})
        return result or {"bookings": [], "total": 0}

    # ─── Rooms ─────────────────────────────────────────────────

    async def get_rooms(self, status: str = "", skip: int = 0, limit: int = 50) -> List[Dict]:
        """Get list of rooms from Host API."""
        params = {"skip": skip, "limit": limit}
        if status:
            params["status"] = status
        result = await self._get("/api/admin/rooms", params)
        return result.get("rooms", []) if result else []

    async def get_room(self, room_id: int) -> Optional[Dict]:
        """Get single room detail."""
        result = await self._get(f"/api/admin/rooms/{room_id}")
        return result.get("room") if result else None

    async def hide_room(self, room_id: int) -> bool:
        """Hide a room."""
        result = await self._post(f"/api/admin/rooms/{room_id}/hide")
        return result is not None

    async def show_room(self, room_id: int) -> bool:
        """Show a hidden room."""
        result = await self._post(f"/api/admin/rooms/{room_id}/show")
        return result is not None

    # ─── Bookings ──────────────────────────────────────────────

    async def get_bookings(self, status: str = "", skip: int = 0, limit: int = 50) -> List[Dict]:
        """Get list of bookings from Host API."""
        params = {"skip": skip, "limit": limit}
        if status:
            params["status"] = status
        result = await self._get("/api/admin/bookings", params)
        return result.get("bookings", []) if result else []

    async def get_booking(self, booking_id: int) -> Optional[Dict]:
        """Get single booking detail."""
        result = await self._get(f"/api/admin/bookings/{booking_id}")
        return result.get("booking") if result else None

    async def get_booking_timeline(self, booking_id: int) -> List[Dict]:
        """Get booking status timeline."""
        result = await self._get(f"/api/admin/bookings/{booking_id}/timeline")
        return result.get("timeline", []) if result else []

    # ─── Payments ──────────────────────────────────────────────

    async def get_payments(self, status: str = "", skip: int = 0, limit: int = 50) -> List[Dict]:
        """Get list of payments."""
        params = {"skip": skip, "limit": limit}
        if status:
            params["status"] = status
        result = await self._get("/api/admin/payments", params)
        return result.get("payments", []) if result else []

    async def get_payment(self, payment_id: int) -> Optional[Dict]:
        """Get single payment detail."""
        result = await self._get(f"/api/admin/payments/{payment_id}")
        return result.get("payment") if result else None

    # ─── Reviews ───────────────────────────────────────────────

    async def get_reviews(self, skip: int = 0, limit: int = 50) -> List[Dict]:
        """Get list of reviews."""
        params = {"skip": skip, "limit": limit}
        result = await self._get("/api/admin/reviews", params)
        return result.get("reviews", []) if result else []

    async def hide_review(self, review_id: int) -> bool:
        """Hide a review."""
        result = await self._post(f"/api/admin/reviews/{review_id}/hide")
        return result is not None

    async def show_review(self, review_id: int) -> bool:
        """Show a hidden review."""
        result = await self._post(f"/api/admin/reviews/{review_id}/show")
        return result is not None

    # ─── Withdrawals ───────────────────────────────────────────

    async def get_withdrawals(self, skip: int = 0, limit: int = 50) -> List[Dict]:
        """Get list of withdrawal requests."""
        params = {"skip": skip, "limit": limit}
        result = await self._get("/api/admin/withdrawals", params)
        return result.get("withdrawals", []) if result else []

    async def approve_withdrawal(self, withdrawal_id: int) -> bool:
        """Approve a withdrawal."""
        result = await self._post(f"/api/admin/withdrawals/{withdrawal_id}/approve")
        return result is not None

    async def reject_withdrawal(self, withdrawal_id: int) -> bool:
        """Reject a withdrawal."""
        result = await self._post(f"/api/admin/withdrawals/{withdrawal_id}/reject")
        return result is not None

    # ─── Verifications ─────────────────────────────────────────

    async def get_verifications(self, status: str = "", skip: int = 0, limit: int = 50) -> List[Dict]:
        """Get list of pending verifications."""
        params = {"skip": skip, "limit": limit}
        if status:
            params["status"] = status
        result = await self._get("/api/admin/verifications", params)
        return result.get("verifications", []) if result else []

    async def get_verification(self, verification_id: int) -> Optional[Dict]:
        """Get single verification detail."""
        result = await self._get(f"/api/admin/verifications/{verification_id}")
        return result.get("verification") if result else None

    async def approve_verification(self, verification_id: int) -> bool:
        """Approve a verification."""
        result = await self._post(f"/api/admin/verifications/{verification_id}/approve")
        return result is not None

    async def reject_verification(self, verification_id: int) -> bool:
        """Reject a verification."""
        result = await self._post(f"/api/admin/verifications/{verification_id}/reject")
        return result is not None

    # ─── Hosts & Guests ────────────────────────────────────────

    async def get_host(self, external_id: int) -> Optional[Dict]:
        """Get host profile."""
        result = await self._get(f"/api/admin/hosts/{external_id}")
        return result.get("host") if result else None

    async def get_host_wallet(self, external_id: int) -> Optional[Dict]:
        """Get host wallet."""
        result = await self._get(f"/api/admin/hosts/{external_id}/wallet")
        return result.get("wallet") if result else None

    async def get_guest(self, external_id: int) -> Optional[Dict]:
        """Get guest profile."""
        result = await self._get(f"/api/admin/guests/{external_id}")
        return result.get("guest") if result else None


# Singleton instance
host_api_client = HostAPIClient()


async def get_host_api_client():
    return host_api_client
