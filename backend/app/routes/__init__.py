from app.routes.admin_routes import admin_bp
from app.routes.auth_routes import auth_bp
from app.routes.health_routes import health_bp
from app.routes.parent_routes import parent_bp
from app.routes.student_routes import student_bp
from app.routes.teacher_routes import teacher_bp


def register_routes(app):
    """Register all application blueprints."""
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(student_bp, url_prefix="/api/student")
    app.register_blueprint(teacher_bp, url_prefix="/api/teacher")
    app.register_blueprint(parent_bp, url_prefix="/api/parent")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
