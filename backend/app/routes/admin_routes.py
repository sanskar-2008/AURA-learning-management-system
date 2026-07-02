from flask import Blueprint

from app.controllers.admin_controller import (
    admin_assignment_detail,
    admin_assignments,
    admin_course_detail,
    admin_courses,
    admin_courses_select,
    admin_dashboard,
    admin_delete_assignment,
    admin_delete_course,
    admin_profile,
    admin_students,
    admin_teachers,
    admin_update_assignment,
    admin_update_course,
    admin_update_profile,
    admin_update_user_status,
)
from app.middleware.auth import role_required
from app.models.user import UserRole

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/dashboard", methods=["GET"])
@role_required(UserRole.ADMIN)
def dashboard():
    return admin_dashboard()


@admin_bp.route("/students", methods=["GET"])
@role_required(UserRole.ADMIN)
def students():
    return admin_students()


@admin_bp.route("/teachers", methods=["GET"])
@role_required(UserRole.ADMIN)
def teachers():
    return admin_teachers()


@admin_bp.route("/users/<int:user_id>/status", methods=["PUT"])
@role_required(UserRole.ADMIN)
def update_user_status(user_id):
    return admin_update_user_status(user_id)


@admin_bp.route("/courses", methods=["GET"])
@role_required(UserRole.ADMIN)
def courses():
    return admin_courses()


@admin_bp.route("/courses/select", methods=["GET"])
@role_required(UserRole.ADMIN)
def courses_select():
    return admin_courses_select()


@admin_bp.route("/courses/<int:course_id>", methods=["GET"])
@role_required(UserRole.ADMIN)
def course_detail(course_id):
    return admin_course_detail(course_id)


@admin_bp.route("/courses/<int:course_id>", methods=["PUT"])
@role_required(UserRole.ADMIN)
def update_course(course_id):
    return admin_update_course(course_id)


@admin_bp.route("/courses/<int:course_id>", methods=["DELETE"])
@role_required(UserRole.ADMIN)
def delete_course(course_id):
    return admin_delete_course(course_id)


@admin_bp.route("/assignments", methods=["GET"])
@role_required(UserRole.ADMIN)
def assignments():
    return admin_assignments()


@admin_bp.route("/assignments/<int:assignment_id>", methods=["GET"])
@role_required(UserRole.ADMIN)
def assignment_detail(assignment_id):
    return admin_assignment_detail(assignment_id)


@admin_bp.route("/assignments/<int:assignment_id>", methods=["PUT"])
@role_required(UserRole.ADMIN)
def update_assignment(assignment_id):
    return admin_update_assignment(assignment_id)


@admin_bp.route("/assignments/<int:assignment_id>", methods=["DELETE"])
@role_required(UserRole.ADMIN)
def delete_assignment(assignment_id):
    return admin_delete_assignment(assignment_id)


@admin_bp.route("/profile", methods=["GET"])
@role_required(UserRole.ADMIN)
def profile():
    return admin_profile()


@admin_bp.route("/profile", methods=["PUT"])
@role_required(UserRole.ADMIN)
def update_profile():
    return admin_update_profile()
