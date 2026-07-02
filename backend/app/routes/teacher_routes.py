from flask import Blueprint

from app.controllers.quiz_controller import (
    teacher_create_quiz,
    teacher_delete_quiz,
    teacher_quiz_detail,
    teacher_quiz_results,
    teacher_quizzes,
    teacher_update_quiz,
)
from app.controllers.grade_controller import (
    teacher_course_grades,
    teacher_create_grade,
    teacher_delete_grade,
    teacher_grade_detail,
    teacher_grades,
    teacher_update_grade,
)
from app.controllers.material_controller import (
    teacher_course_materials,
    teacher_create_material,
    teacher_delete_material,
    teacher_material_detail,
    teacher_material_file,
    teacher_materials_overview,
    teacher_update_material,
)
from app.controllers.teacher_controller import (
    teacher_assignment_detail,
    teacher_assignment_file,
    teacher_assignment_submissions,
    teacher_assignments,
    teacher_change_password,
    teacher_course_detail,
    teacher_course_students,
    teacher_courses,
    teacher_create_assignment,
    teacher_create_course,
    teacher_delete_assignment,
    teacher_delete_course,
    teacher_profile,
    teacher_submission_file,
    teacher_update_assignment,
    teacher_update_course,
    teacher_update_profile,
)
from app.middleware.auth import role_required
from app.models.user import UserRole

teacher_bp = Blueprint("teacher", __name__)


@teacher_bp.route("/profile", methods=["GET"])
@role_required(UserRole.TEACHER)
def profile():
    return teacher_profile()


@teacher_bp.route("/profile", methods=["PUT"])
@role_required(UserRole.TEACHER)
def update_profile():
    return teacher_update_profile()


@teacher_bp.route("/profile/password", methods=["PUT"])
@role_required(UserRole.TEACHER)
def change_password():
    return teacher_change_password()


@teacher_bp.route("/courses", methods=["GET"])
@role_required(UserRole.TEACHER)
def courses():
    return teacher_courses()


@teacher_bp.route("/courses", methods=["POST"])
@role_required(UserRole.TEACHER)
def create_course():
    return teacher_create_course()


@teacher_bp.route("/courses/<int:course_id>", methods=["GET"])
@role_required(UserRole.TEACHER)
def course_detail(course_id):
    return teacher_course_detail(course_id)


@teacher_bp.route("/courses/<int:course_id>", methods=["PUT"])
@role_required(UserRole.TEACHER)
def update_course(course_id):
    return teacher_update_course(course_id)


@teacher_bp.route("/courses/<int:course_id>", methods=["DELETE"])
@role_required(UserRole.TEACHER)
def delete_course(course_id):
    return teacher_delete_course(course_id)


@teacher_bp.route("/courses/<int:course_id>/students", methods=["GET"])
@role_required(UserRole.TEACHER)
def course_students(course_id):
    return teacher_course_students(course_id)


@teacher_bp.route("/assignments", methods=["GET"])
@role_required(UserRole.TEACHER)
def assignments():
    return teacher_assignments()


@teacher_bp.route("/assignments", methods=["POST"])
@role_required(UserRole.TEACHER)
def create_assignment():
    return teacher_create_assignment()


@teacher_bp.route("/assignments/<int:assignment_id>", methods=["GET"])
@role_required(UserRole.TEACHER)
def assignment_detail(assignment_id):
    return teacher_assignment_detail(assignment_id)


@teacher_bp.route("/assignments/<int:assignment_id>", methods=["PUT"])
@role_required(UserRole.TEACHER)
def update_assignment(assignment_id):
    return teacher_update_assignment(assignment_id)


@teacher_bp.route("/assignments/<int:assignment_id>", methods=["DELETE"])
@role_required(UserRole.TEACHER)
def delete_assignment(assignment_id):
    return teacher_delete_assignment(assignment_id)


@teacher_bp.route("/assignments/<int:assignment_id>/submissions", methods=["GET"])
@role_required(UserRole.TEACHER)
def assignment_submissions(assignment_id):
    return teacher_assignment_submissions(assignment_id)


@teacher_bp.route("/assignments/<int:assignment_id>/file", methods=["GET"])
@role_required(UserRole.TEACHER)
def assignment_file(assignment_id):
    return teacher_assignment_file(assignment_id)


@teacher_bp.route("/submissions/<int:submission_id>/file", methods=["GET"])
@role_required(UserRole.TEACHER)
def submission_file(submission_id):
    return teacher_submission_file(submission_id)


@teacher_bp.route("/materials", methods=["GET"])
@role_required(UserRole.TEACHER)
def materials_overview():
    return teacher_materials_overview()


@teacher_bp.route("/courses/<int:course_id>/materials", methods=["GET"])
@role_required(UserRole.TEACHER)
def course_materials(course_id):
    return teacher_course_materials(course_id)


@teacher_bp.route("/courses/<int:course_id>/materials", methods=["POST"])
@role_required(UserRole.TEACHER)
def create_material(course_id):
    return teacher_create_material(course_id)


@teacher_bp.route("/courses/<int:course_id>/materials/<int:material_id>", methods=["GET"])
@role_required(UserRole.TEACHER)
def material_detail(course_id, material_id):
    return teacher_material_detail(course_id, material_id)


@teacher_bp.route("/courses/<int:course_id>/materials/<int:material_id>", methods=["PUT"])
@role_required(UserRole.TEACHER)
def update_material(course_id, material_id):
    return teacher_update_material(course_id, material_id)


@teacher_bp.route("/courses/<int:course_id>/materials/<int:material_id>", methods=["DELETE"])
@role_required(UserRole.TEACHER)
def delete_material(course_id, material_id):
    return teacher_delete_material(course_id, material_id)


@teacher_bp.route("/materials/<int:material_id>/file", methods=["GET"])
@role_required(UserRole.TEACHER)
def material_file(material_id):
    return teacher_material_file(material_id)


@teacher_bp.route("/grades", methods=["GET"])
@role_required(UserRole.TEACHER)
def grades():
    return teacher_grades()


@teacher_bp.route("/courses/<int:course_id>/grades", methods=["GET"])
@role_required(UserRole.TEACHER)
def course_grades(course_id):
    return teacher_course_grades(course_id)


@teacher_bp.route("/courses/<int:course_id>/grades", methods=["POST"])
@role_required(UserRole.TEACHER)
def create_grade(course_id):
    return teacher_create_grade(course_id)


@teacher_bp.route("/courses/<int:course_id>/grades/<int:grade_id>", methods=["GET"])
@role_required(UserRole.TEACHER)
def grade_detail(course_id, grade_id):
    return teacher_grade_detail(course_id, grade_id)


@teacher_bp.route("/courses/<int:course_id>/grades/<int:grade_id>", methods=["PUT"])
@role_required(UserRole.TEACHER)
def update_grade(course_id, grade_id):
    return teacher_update_grade(course_id, grade_id)


@teacher_bp.route("/courses/<int:course_id>/grades/<int:grade_id>", methods=["DELETE"])
@role_required(UserRole.TEACHER)
def delete_grade(course_id, grade_id):
    return teacher_delete_grade(course_id, grade_id)


@teacher_bp.route("/quizzes", methods=["GET"])
@role_required(UserRole.TEACHER)
def quizzes():
    return teacher_quizzes()


@teacher_bp.route("/quizzes", methods=["POST"])
@role_required(UserRole.TEACHER)
def create_quiz():
    return teacher_create_quiz()


@teacher_bp.route("/quizzes/<int:quiz_id>", methods=["GET"])
@role_required(UserRole.TEACHER)
def quiz_detail(quiz_id):
    return teacher_quiz_detail(quiz_id)


@teacher_bp.route("/quizzes/<int:quiz_id>", methods=["PUT"])
@role_required(UserRole.TEACHER)
def update_quiz(quiz_id):
    return teacher_update_quiz(quiz_id)


@teacher_bp.route("/quizzes/<int:quiz_id>", methods=["DELETE"])
@role_required(UserRole.TEACHER)
def delete_quiz(quiz_id):
    return teacher_delete_quiz(quiz_id)


@teacher_bp.route("/quizzes/<int:quiz_id>/results", methods=["GET"])
@role_required(UserRole.TEACHER)
def quiz_results(quiz_id):
    return teacher_quiz_results(quiz_id)
