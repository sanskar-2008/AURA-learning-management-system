from flask import Blueprint

from app.controllers.quiz_controller import parent_child_quiz_results
from app.controllers.parent_controller import (
    parent_change_password,
    parent_child_assignments,
    parent_child_attendance,
    parent_child_course_detail,
    parent_child_courses,
    parent_child_fees,
    parent_child_grades,
    parent_child_profile,
    parent_child_learning_dashboard,
    parent_child_progress,
    parent_children,
    parent_dashboard,
    parent_link_child,
    parent_pay_fee,
    parent_profile,
    parent_update_profile,
)
from app.middleware.auth import role_required
from app.models.user import UserRole

parent_bp = Blueprint("parent", __name__)


@parent_bp.route("/dashboard", methods=["GET"])
@role_required(UserRole.PARENT)
def dashboard():
    return parent_dashboard()


@parent_bp.route("/children", methods=["GET"])
@role_required(UserRole.PARENT)
def children():
    return parent_children()


@parent_bp.route("/children/link", methods=["POST"])
@role_required(UserRole.PARENT)
def link_child():
    return parent_link_child()


@parent_bp.route("/children/<int:student_id>/profile", methods=["GET"])
@role_required(UserRole.PARENT)
def child_profile(student_id):
    return parent_child_profile(student_id)


@parent_bp.route("/children/<int:student_id>/courses", methods=["GET"])
@role_required(UserRole.PARENT)
def child_courses(student_id):
    return parent_child_courses(student_id)


@parent_bp.route("/children/<int:student_id>/courses/<int:course_id>", methods=["GET"])
@role_required(UserRole.PARENT)
def child_course_detail(student_id, course_id):
    return parent_child_course_detail(student_id, course_id)


@parent_bp.route("/children/<int:student_id>/assignments", methods=["GET"])
@role_required(UserRole.PARENT)
def child_assignments(student_id):
    return parent_child_assignments(student_id)


@parent_bp.route("/children/<int:student_id>/attendance", methods=["GET"])
@role_required(UserRole.PARENT)
def child_attendance(student_id):
    return parent_child_attendance(student_id)


@parent_bp.route("/children/<int:student_id>/grades", methods=["GET"])
@role_required(UserRole.PARENT)
def child_grades(student_id):
    return parent_child_grades(student_id)


@parent_bp.route("/children/<int:student_id>/quizzes", methods=["GET"])
@role_required(UserRole.PARENT)
def child_quiz_results(student_id):
    return parent_child_quiz_results(student_id)


@parent_bp.route("/children/<int:student_id>/progress", methods=["GET"])
@role_required(UserRole.PARENT)
def child_progress(student_id):
    return parent_child_progress(student_id)


@parent_bp.route("/children/<int:student_id>/learning-dashboard", methods=["GET"])
@role_required(UserRole.PARENT)
def child_learning_dashboard(student_id):
    return parent_child_learning_dashboard(student_id)


@parent_bp.route("/children/<int:student_id>/fees", methods=["GET"])
@role_required(UserRole.PARENT)
def child_fees(student_id):
    return parent_child_fees(student_id)


@parent_bp.route("/children/<int:student_id>/fees/<int:fee_id>/pay", methods=["POST"])
@role_required(UserRole.PARENT)
def pay_fee(student_id, fee_id):
    return parent_pay_fee(student_id, fee_id)


@parent_bp.route("/profile", methods=["GET"])
@role_required(UserRole.PARENT)
def profile():
    return parent_profile()


@parent_bp.route("/profile", methods=["PUT"])
@role_required(UserRole.PARENT)
def update_profile():
    return parent_update_profile()


@parent_bp.route("/profile/password", methods=["PUT"])
@role_required(UserRole.PARENT)
def change_password():
    return parent_change_password()
