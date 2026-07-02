from flask import Flask

from app.utils.responses import error_response


def register_error_handlers(app: Flask):
    """Register global error handlers for the application."""

    @app.errorhandler(404)
    def not_found(_error):
        return error_response("Resource not found", status_code=404)

    @app.errorhandler(405)
    def method_not_allowed(_error):
        return error_response("Method not allowed", status_code=405)

    @app.errorhandler(500)
    def internal_server_error(_error):
        return error_response("Internal server error", status_code=500)
