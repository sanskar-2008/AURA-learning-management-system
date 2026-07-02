from app.services.health_service import get_health_status
from app.utils.responses import success_response


def health_check():
    """Handle health check requests."""
    return success_response(data=get_health_status(), message="API is running")
