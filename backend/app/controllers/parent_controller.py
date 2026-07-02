from flask import g, request

from app.services.parent_service import (
    change_parent_password,
    get_child_assignments,
    get_child_attendance,
    get_child_course_detail,
    get_child_courses,
    get_child_fees,
    get_child_grades,
    get_child_learning_dashboard,
    get_child_profile,
    get_child_progress,
    get_parent_children,
    get_parent_dashboard,
    link_child,
    pay_child_fee,
    serialize_parent_profile,
    update_parent_profile,
)
from app.utils.responses import error_response, success_response


def _get_parent():
    parent = g.current_user.parent_profile
    if not parent:
        return None, error_response("Parent profile not found", status_code=404)
    return parent, None


def parent_dashboard():
    parent, error = _get_parent()
    if error:
        return error

    student_id = request.args.get("student_id", type=int)
    return success_response(data=get_parent_dashboard(parent, student_id=student_id))


def parent_children():
    parent, error = _get_parent()
    if error:
        return error

    return success_response(data={"children": get_parent_children(parent)})


def parent_link_child():
    parent, error = _get_parent()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    child, errors = link_child(parent, data)

    if errors:
        status_code = 404 if errors.get("student_number") == "Student not found." else 400
        message = errors.get("student_number", "Validation failed")
        return error_response(message, status_code=status_code, errors=errors)

    return success_response(
        data={"child": child},
        message="Child linked successfully",
        status_code=201,
    )


def parent_child_profile(student_id):
    parent, error = _get_parent()
    if error:
        return error

    profile = get_child_profile(parent, student_id)
    if not profile:
        return error_response("Child not found or access denied", status_code=404)

    return success_response(data={"profile": profile})


def parent_child_courses(student_id):
    parent, error = _get_parent()
    if error:
        return error

    courses = get_child_courses(parent, student_id)
    if courses is None:
        return error_response("Child not found or access denied", status_code=404)

    return success_response(data={"courses": courses})


def parent_child_course_detail(student_id, course_id):
    parent, error = _get_parent()
    if error:
        return error

    course = get_child_course_detail(parent, student_id, course_id)
    if not course:
        return error_response("Course not found or access denied", status_code=404)

    return success_response(data={"course": course})


def parent_child_assignments(student_id):
    parent, error = _get_parent()
    if error:
        return error

    assignments = get_child_assignments(parent, student_id)
    if assignments is None:
        return error_response("Child not found or access denied", status_code=404)

    return success_response(data={"assignments": assignments})


def parent_child_attendance(student_id):
    parent, error = _get_parent()
    if error:
        return error

    attendance = get_child_attendance(parent, student_id)
    if attendance is None:
        return error_response("Child not found or access denied", status_code=404)

    return success_response(data=attendance)


def parent_child_grades(student_id):
    parent, error = _get_parent()
    if error:
        return error

    grades = get_child_grades(parent, student_id)
    if grades is None:
        return error_response("Child not found or access denied", status_code=404)

    return success_response(data=grades)


def parent_child_progress(student_id):
    parent, error = _get_parent()
    if error:
        return error

    progress = get_child_progress(parent, student_id)
    if progress is None:
        return error_response("Child not found or access denied", status_code=404)

    return success_response(data={"progress": progress})


def parent_child_learning_dashboard(student_id):
    parent, error = _get_parent()
    if error:
        return error

    dashboard = get_child_learning_dashboard(parent, student_id)
    if dashboard is None:
        return error_response("Child not found or access denied", status_code=404)

    return success_response(data=dashboard)


def parent_child_fees(student_id):
    parent, error = _get_parent()
    if error:
        return error

    fees_data = get_child_fees(parent, student_id)
    if fees_data is None:
        return error_response("Child not found or access denied", status_code=404)

    return success_response(data=fees_data)


def parent_pay_fee(student_id, fee_id):
    parent, error = _get_parent()
    if error:
        return error

    fee, errors = pay_child_fee(parent, student_id, fee_id)
    if errors:
        status_code = 404 if errors.get("fee") or errors.get("student") else 400
        message = next(iter(errors.values()))
        return error_response(message, status_code=status_code, errors=errors)

    return success_response(data={"fee": fee}, message="Fee payment submitted successfully")


def parent_profile():
    parent, error = _get_parent()
    if error:
        return error

    return success_response(data={"profile": serialize_parent_profile(parent)})


def parent_update_profile():
    parent, error = _get_parent()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    profile, errors = update_parent_profile(parent, data)

    if errors:
        return error_response("Validation failed", status_code=400, errors=errors)

    return success_response(
        data={"profile": profile},
        message="Profile updated successfully",
    )


def parent_change_password():
    parent, error = _get_parent()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    _, errors = change_parent_password(parent, data)

    if errors:
        return error_response(
            errors.get("current_password", "Password change failed"),
            status_code=400,
            errors=errors,
        )

    return success_response(message="Password changed successfully")
