from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AdminAccount, SupportTicket
from ..schemas import DashboardStatsResponse
from ..middleware.admin_auth import get_current_admin
from ..services.host_api_client import HostAPIClient, get_host_api_client

router = APIRouter(prefix="/admin/dashboard", tags=["Admin Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
async def dashboard_stats(
    period: str = "monthly",
    db: Session = Depends(get_db),
    client: HostAPIClient = Depends(get_host_api_client),
    current_admin: AdminAccount = Depends(get_current_admin),
):
    open_tickets = db.query(SupportTicket).filter(SupportTicket.status == "open").count()

    host_stats = {}
    try:
        host_stats = await client.get_stats()
    except Exception as e:
        print(f"Error fetching stats from Host API: {e}")

    revenue_trend = []
    try:
        revenue_data = await client.get_revenue_stats(period)
        revenue_trend = revenue_data.get("trend", [])
    except Exception as e:
        print(f"Error fetching revenue stats: {e}")

    booking_trend = []
    try:
        booking_data = await client.get_booking_stats(period)
        booking_trend = booking_data.get("trend", [])
    except Exception as e:
        print(f"Error fetching booking stats: {e}")

    return DashboardStatsResponse(
        total_users=0,
        verified_users=0,
        unverified_users=0,
        active_listings=host_stats.get("active_listings", 0),
        total_bookings=host_stats.get("total_bookings", 0),
        revenue_this_month=host_stats.get("revenue_this_month", 0),
        pending_withdrawals=host_stats.get("pending_withdrawals", 0),
        open_support_tickets=open_tickets,
        revenue_trend=revenue_trend,
        booking_trend=booking_trend
    )
