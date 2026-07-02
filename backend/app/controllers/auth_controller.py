from flask import request

from app.services.auth_service import (
    admin_login,
    generate_admin_captcha,
    get_current_user,
    login,
    logout,
    serialize_user,
    signup,
)
from app.utils.responses import error_response, success_response


def signup_user():
    data = request.get_json(silent=True) or {}
    user, errors = signup(data)

    if errors:
        return error_response("Validation failed", status_code=400, errors=errors)

    return success_response(
        data={"user": user, "redirect_to": user["redirect_to"]},
        message="Account created successfully",
        status_code=201,
    )


def login_user():
    data = request.get_json(silent=True) or {}
    user, errors = login(data)

    if errors:
        status = 401 if "credentials" in errors else 400
        return error_response(
            errors.get("credentials", "Validation failed"),
            status_code=status,
            errors=errors,
        )

    return success_response(
        data={"user": user, "redirect_to": user["redirect_to"]},
        message="Logged in successfully",
    )


def admin_captcha():
    captcha = generate_admin_captcha()
    return success_response(data={"captcha": captcha})


def admin_login_user():
    data = request.get_json(silent=True) or {}
    user, errors = admin_login(data)

    if errors:
        status = 401 if "credentials" in errors else 400
        return error_response(
            errors.get("credentials", "Validation failed"),
            status_code=status,
            errors=errors,
        )

    return success_response(
        data={"user": user, "redirect_to": user["redirect_to"]},
        message="Logged in successfully",
    )


def logout_user():
    logout()
    return success_response(message="Logged out successfully")


def get_me():
    user = get_current_user()
    if not user:
        return error_response("Authentication required", status_code=401)

    return success_response(data={"user": serialize_user(user)})
