from flask import Blueprint

from app.controllers.auth_controller import (
    admin_captcha,
    admin_login_user,
    get_me,
    login_user,
    logout_user,
    signup_user,
)
from app.middleware.auth import login_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    return signup_user()


@auth_bp.route("/login", methods=["POST"])
def login():
    return login_user()


@auth_bp.route("/admin/captcha", methods=["GET"])
def admin_captcha_route():
    return admin_captcha()


@auth_bp.route("/admin/login", methods=["POST"])
def admin_login():
    return admin_login_user()


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    return logout_user()


@auth_bp.route("/me", methods=["GET"])
@login_required
def me():
    return get_me()
