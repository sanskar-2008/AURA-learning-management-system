from flask import Blueprint

from app.controllers.quiz_controller import (
    student_quiz_detail,
    student_quiz_result,
    student_quizzes,
    student_submit_quiz,
)
from app.controllers.grade_controller import student_grades
from app.controllers.material_controller import student_course_materials, student_material_file
from app.controllers.student_controller import (
    student_assignment_detail,
    student_assignment_file,
    student_assignments,
    student_available_courses,
    student_browse_courses,
    student_change_password,
    student_course_detail,
    student_courses,
    student_dashboard,
    student_enroll,
    student_profile,
    student_submission_file,
    student_submit_assignment,
    student_update_profile,
)
from app.middleware.auth import role_required
from app.models.user import UserRole

student_bp = Blueprint("student", __name__)


@student_bp.route("/dashboard", methods=["GET"])
@role_required(UserRole.STUDENT)
def dashboard():
    return student_dashboard()


@student_bp.route("/courses/browse", methods=["GET"])
@role_required(UserRole.STUDENT)
def browse():
    return student_browse_courses()


@student_bp.route("/courses/<int:course_id>", methods=["GET"])
@role_required(UserRole.STUDENT)
def course_detail(course_id):
    return student_course_detail(course_id)


@student_bp.route("/courses/<int:course_id>/enroll", methods=["POST"])
@role_required(UserRole.STUDENT)
def enroll(course_id):
    return student_enroll(course_id)


@student_bp.route("/courses", methods=["GET"])
@role_required(UserRole.STUDENT)
def courses():
    return student_courses()


@student_bp.route("/courses/available", methods=["GET"])
@role_required(UserRole.STUDENT)
def available_courses():
    return student_available_courses()


@student_bp.route("/assignments/<int:assignment_id>", methods=["GET"])
@role_required(UserRole.STUDENT)
def assignment_detail(assignment_id):
    return student_assignment_detail(assignment_id)


@student_bp.route("/assignments/<int:assignment_id>/submit", methods=["POST"])
@role_required(UserRole.STUDENT)
def submit_assignment_route(assignment_id):
    return student_submit_assignment(assignment_id)


@student_bp.route("/assignments/<int:assignment_id>/file", methods=["GET"])
@role_required(UserRole.STUDENT)
def assignment_file(assignment_id):
    return student_assignment_file(assignment_id)


@student_bp.route("/submissions/<int:submission_id>/file", methods=["GET"])
@role_required(UserRole.STUDENT)
def submission_file(submission_id):
    return student_submission_file(submission_id)


@student_bp.route("/assignments", methods=["GET"])
@role_required(UserRole.STUDENT)
def assignments():
    return student_assignments()


@student_bp.route("/profile", methods=["GET"])
@role_required(UserRole.STUDENT)
def profile():
    return student_profile()


@student_bp.route("/profile", methods=["PUT"])
@role_required(UserRole.STUDENT)
def update_profile():
    return student_update_profile()


@student_bp.route("/profile/password", methods=["PUT"])
@role_required(UserRole.STUDENT)
def change_password():
    return student_change_password()


@student_bp.route("/courses/<int:course_id>/materials", methods=["GET"])
@role_required(UserRole.STUDENT)
def course_materials(course_id):
    return student_course_materials(course_id)


@student_bp.route("/materials/<int:material_id>/file", methods=["GET"])
@role_required(UserRole.STUDENT)
def material_file(material_id):
    return student_material_file(material_id)


@student_bp.route("/grades", methods=["GET"])
@role_required(UserRole.STUDENT)
def grades():
    return student_grades()


@student_bp.route("/quizzes", methods=["GET"])
@role_required(UserRole.STUDENT)
def quizzes():
    return student_quizzes()


@student_bp.route("/quizzes/<int:quiz_id>", methods=["GET"])
@role_required(UserRole.STUDENT)
def quiz_detail(quiz_id):
    return student_quiz_detail(quiz_id)


@student_bp.route("/quizzes/<int:quiz_id>/submit", methods=["POST"])
@role_required(UserRole.STUDENT)
def submit_quiz(quiz_id):
    return student_submit_quiz(quiz_id)


@student_bp.route("/quizzes/<int:quiz_id>/result", methods=["GET"])
@role_required(UserRole.STUDENT)
def quiz_result(quiz_id):
    return student_quiz_result(quiz_id)
