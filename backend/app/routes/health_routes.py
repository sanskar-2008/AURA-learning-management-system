from flask import Blueprint

from app.controllers.health_controller import health_check

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health():
    return health_check()
