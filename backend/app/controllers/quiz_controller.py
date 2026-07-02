from flask import g, request

from app.services.quiz_service import (
    create_teacher_quiz,
    delete_teacher_quiz,
    get_parent_child_quiz_results,
    get_student_quiz_for_attempt,
    get_student_quiz_result,
    get_student_quizzes,
    get_teacher_quiz_detail,
    get_teacher_quiz_results,
    get_teacher_quizzes,
    submit_student_quiz,
    update_teacher_quiz,
)
from app.utils.responses import error_response, success_response


def _get_teacher():
    teacher = g.current_user.teacher_profile
    if not teacher:
        return None, error_response("Teacher profile not found", status_code=404)
    return teacher, None


def _get_student():
    student = g.current_user.student_profile
    if not student:
        return None, error_response("Student profile not found", status_code=404)
    return student, None


def _get_parent():
    parent = g.current_user.parent_profile
    if not parent:
        return None, error_response("Parent profile not found", status_code=404)
    return parent, None


def _first_error_message(errors):
    if not errors:
        return "Validation failed"
    return next(iter(errors.values()))


def teacher_quizzes():
    teacher, error = _get_teacher()
    if error:
        return error
    course_id = request.args.get("course_id", type=int)
    return success_response(data={"quizzes": get_teacher_quizzes(teacher, course_id)})


def teacher_quiz_detail(quiz_id):
    teacher, error = _get_teacher()
    if error:
        return error
    quiz = get_teacher_quiz_detail(teacher, quiz_id)
    if not quiz:
        return error_response("Quiz not found", status_code=404)
    return success_response(data={"quiz": quiz})


def teacher_create_quiz():
    teacher, error = _get_teacher()
    if error:
        return error
    quiz, errors = create_teacher_quiz(teacher, request.get_json(silent=True) or {})
    if errors:
        return error_response(_first_error_message(errors), status_code=400, errors=errors)
    return success_response(data={"quiz": quiz}, message="Quiz created successfully", status_code=201)


def teacher_update_quiz(quiz_id):
    teacher, error = _get_teacher()
    if error:
        return error
    quiz, errors = update_teacher_quiz(teacher, quiz_id, request.get_json(silent=True) or {})
    if errors:
        status = 404 if errors.get("quiz") else 400
        return error_response(_first_error_message(errors), status_code=status, errors=errors)
    return success_response(data={"quiz": quiz}, message="Quiz updated successfully")


def teacher_delete_quiz(quiz_id):
    teacher, error = _get_teacher()
    if error:
        return error
    deleted, errors = delete_teacher_quiz(teacher, quiz_id)
    if not deleted:
        return error_response(errors.get("quiz", "Quiz not found"), status_code=404, errors=errors)
    return success_response(message="Quiz deleted successfully")


def teacher_quiz_results(quiz_id):
    teacher, error = _get_teacher()
    if error:
        return error
    result = get_teacher_quiz_results(teacher, quiz_id)
    if not result:
        return error_response("Quiz not found", status_code=404)
    return success_response(data=result)


def student_quizzes():
    student, error = _get_student()
    if error:
        return error
    return success_response(data={"quizzes": get_student_quizzes(student)})


def student_quiz_detail(quiz_id):
    student, error = _get_student()
    if error:
        return error
    quiz, errors = get_student_quiz_for_attempt(student, quiz_id)
    if errors:
        return error_response(_first_error_message(errors), status_code=400, errors=errors)
    return success_response(data={"quiz": quiz})


def student_submit_quiz(quiz_id):
    student, error = _get_student()
    if error:
        return error
    attempt, errors = submit_student_quiz(student, quiz_id, request.get_json(silent=True) or {})
    if errors:
        return error_response(_first_error_message(errors), status_code=400, errors=errors)
    return success_response(
        data={"attempt": attempt},
        message="Quiz submitted successfully",
        status_code=201,
    )


def student_quiz_result(quiz_id):
    student, error = _get_student()
    if error:
        return error
    result = get_student_quiz_result(student, quiz_id)
    if not result:
        return error_response("Quiz result not found", status_code=404)
    return success_response(data=result)


def parent_child_quiz_results(student_id):
    parent, error = _get_parent()
    if error:
        return error
    results = get_parent_child_quiz_results(parent, student_id)
    if results is None:
        return error_response("Child not found or not linked", status_code=404)
    return success_response(data={"results": results})
