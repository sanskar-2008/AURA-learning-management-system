from flask import g, request

from app.services.grade_service import (
    create_teacher_grade,
    delete_teacher_grade,
    get_parent_child_grade_records,
    get_student_grades,
    get_teacher_course_grades,
    get_teacher_grade_detail,
    get_teacher_grades,
    update_teacher_grade,
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


def teacher_grades():
    teacher, error = _get_teacher()
    if error:
        return error

    course_id = request.args.get("course_id", type=int)
    student_id = request.args.get("student_id", type=int)
    return success_response(data={"grades": get_teacher_grades(teacher, course_id, student_id)})


def teacher_course_grades(course_id):
    teacher, error = _get_teacher()
    if error:
        return error

    result = get_teacher_course_grades(teacher, course_id)
    if not result:
        return error_response("Course not found or access denied", status_code=404)
    return success_response(data=result)


def teacher_grade_detail(course_id, grade_id):
    teacher, error = _get_teacher()
    if error:
        return error

    grade = get_teacher_grade_detail(teacher, course_id, grade_id)
    if not grade:
        return error_response("Grade record not found", status_code=404)
    return success_response(data={"grade": grade})


def teacher_create_grade(course_id):
    teacher, error = _get_teacher()
    if error:
        return error

    grade, errors = create_teacher_grade(teacher, course_id, request.get_json(silent=True) or {})
    if errors:
        return error_response(_first_error_message(errors), status_code=400, errors=errors)
    return success_response(data={"grade": grade}, message="Marks saved successfully", status_code=201)


def teacher_update_grade(course_id, grade_id):
    teacher, error = _get_teacher()
    if error:
        return error

    grade, errors = update_teacher_grade(
        teacher,
        course_id,
        grade_id,
        request.get_json(silent=True) or {},
    )
    if errors:
        status = 404 if errors.get("grade") else 400
        return error_response(_first_error_message(errors), status_code=status, errors=errors)
    return success_response(data={"grade": grade}, message="Marks updated successfully")


def teacher_delete_grade(course_id, grade_id):
    teacher, error = _get_teacher()
    if error:
        return error

    deleted, errors = delete_teacher_grade(teacher, course_id, grade_id)
    if not deleted:
        return error_response(
            errors.get("grade", "Grade record not found"),
            status_code=404,
            errors=errors,
        )
    return success_response(message="Marks deleted successfully")


def student_grades():
    student, error = _get_student()
    if error:
        return error

    course_id = request.args.get("course_id", type=int)
    return success_response(data={"grades": get_student_grades(student, course_id)})


def parent_child_grade_records(student_id):
    parent, error = _get_parent()
    if error:
        return error

    grades = get_parent_child_grade_records(parent, student_id)
    if grades is None:
        return error_response("Child not found or not linked", status_code=404)
    return success_response(data={"grades": grades})
