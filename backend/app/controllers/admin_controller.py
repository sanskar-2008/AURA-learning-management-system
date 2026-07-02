from flask import g, request

from app.services.admin_service import (
    delete_assignment,
    delete_course,
    get_admin_dashboard,
    get_assignment_detail,
    get_assignments,
    get_course_detail,
    get_courses,
    get_courses_for_select,
    get_students,
    get_teachers,
    serialize_admin_profile,
    set_user_active_status,
    update_admin_profile,
    update_assignment,
    update_course,
)
from app.utils.responses import error_response, success_response


def admin_dashboard():
    return success_response(data={"summary": get_admin_dashboard()})


def admin_students():
    search = request.args.get("search", "").strip() or None
    return success_response(data={"students": get_students(search)})


def admin_teachers():
    search = request.args.get("search", "").strip() or None
    return success_response(data={"teachers": get_teachers(search)})


def admin_update_user_status(user_id):
    data = request.get_json(silent=True) or {}
    is_active = data.get("is_active")

    if not isinstance(is_active, bool):
        return error_response("is_active must be true or false", status_code=400)

    user, errors = set_user_active_status(user_id, is_active, g.current_user)
    if errors:
        return error_response(next(iter(errors.values())), status_code=400, errors=errors)

    return success_response(
        data={"user": user},
        message="User account activated" if is_active else "User account deactivated",
    )


def admin_courses():
    search = request.args.get("search", "").strip() or None
    return success_response(data={"courses": get_courses(search)})


def admin_course_detail(course_id):
    course = get_course_detail(course_id)
    if not course:
        return error_response("Course not found", status_code=404)
    return success_response(data={"course": course})


def admin_update_course(course_id):
    data = request.get_json(silent=True) or {}
    course, errors = update_course(course_id, data)
    if errors:
        if errors.get("course"):
            return error_response(errors["course"], status_code=404, errors=errors)
        return error_response("Validation failed", status_code=400, errors=errors)

    return success_response(data={"course": course}, message="Course updated successfully")


def admin_delete_course(course_id):
    _, errors = delete_course(course_id)
    if errors:
        return error_response(errors["course"], status_code=404, errors=errors)
    return success_response(message="Course deleted successfully")


def admin_assignments():
    search = request.args.get("search", "").strip() or None
    return success_response(data={"assignments": get_assignments(search)})


def admin_assignment_detail(assignment_id):
    assignment = get_assignment_detail(assignment_id)
    if not assignment:
        return error_response("Assignment not found", status_code=404)
    return success_response(data={"assignment": assignment})


def admin_update_assignment(assignment_id):
    data = request.get_json(silent=True) or {}
    assignment, errors = update_assignment(assignment_id, data)
    if errors:
        if errors.get("assignment"):
            return error_response(errors["assignment"], status_code=404, errors=errors)
        return error_response("Validation failed", status_code=400, errors=errors)

    return success_response(
        data={"assignment": assignment},
        message="Assignment updated successfully",
    )


def admin_delete_assignment(assignment_id):
    _, errors = delete_assignment(assignment_id)
    if errors:
        return error_response(errors["assignment"], status_code=404, errors=errors)
    return success_response(message="Assignment deleted successfully")


def admin_courses_select():
    return success_response(data={"courses": get_courses_for_select()})


def admin_profile():
    return success_response(data={"profile": serialize_admin_profile(g.current_user)})


def admin_update_profile():
    data = request.get_json(silent=True) or {}
    profile, errors = update_admin_profile(g.current_user, data)
    if errors:
        return error_response("Validation failed", status_code=400, errors=errors)

    return success_response(data={"profile": profile}, message="Profile updated successfully")
