from functools import wraps

from flask import g, session

from app.database.connection import db
from app.models.user import User
from app.utils.responses import error_response


def login_required(view):
    """Require an authenticated session to access a route."""

    @wraps(view)
    def wrapped(*args, **kwargs):
        user_id = session.get("user_id")
        if not user_id:
            return error_response("Authentication required", status_code=401)

        user = db.session.get(User, user_id)
        if not user or not user.is_active:
            session.clear()
            return error_response("Authentication required", status_code=401)

        g.current_user = user
        return view(*args, **kwargs)

    return wrapped


def role_required(*roles):
    """Require the current user to have one of the specified roles."""

    def decorator(view):
        @wraps(view)
        @login_required
        def wrapped(*args, **kwargs):
            if g.current_user.role not in roles:
                return error_response("You do not have permission to access this resource", status_code=403)
            return view(*args, **kwargs)

        return wrapped

    return decorator
