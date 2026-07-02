from flask import g, request, send_file

from app.services.teacher_service import (
    change_teacher_password,
    create_teacher_assignment,
    create_teacher_course,
    delete_teacher_assignment,
    delete_teacher_course,
    get_assignment_file_for_teacher,
    get_assignment_submissions,
    get_course_enrolled_students,
    get_submission_file_for_teacher,
    get_teacher_assignment_detail,
    get_teacher_assignments,
    get_teacher_course_detail,
    get_teacher_courses,
    serialize_teacher_profile,
    update_teacher_assignment,
    update_teacher_course,
    update_teacher_profile,
)
from app.utils.responses import error_response, success_response


def _assignment_form_data():
    return {
        "title": request.form.get("title"),
        "description": request.form.get("description"),
        "course_id": request.form.get("course_id"),
        "due_date": request.form.get("due_date"),
        "max_points": request.form.get("max_points"),
    }


def _first_error_message(errors, default="Validation failed"):
    if not errors:
        return default
    return next(iter(errors.values()))


def _get_teacher():
    teacher = g.current_user.teacher_profile
    if not teacher:
        return None, error_response("Teacher profile not found", status_code=404)
    return teacher, None


def teacher_profile():
    teacher, error = _get_teacher()
    if error:
        return error

    return success_response(data={"profile": serialize_teacher_profile(teacher)})


def teacher_update_profile():
    teacher, error = _get_teacher()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    profile, errors = update_teacher_profile(teacher, data)

    if errors:
        return error_response("Validation failed", status_code=400, errors=errors)

    return success_response(
        data={"profile": profile},
        message="Profile updated successfully",
    )


def teacher_change_password():
    teacher, error = _get_teacher()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    _, errors = change_teacher_password(teacher, data)

    if errors:
        return error_response(
            errors.get("current_password", "Password change failed"),
            status_code=400,
            errors=errors,
        )

    return success_response(message="Password changed successfully")


def teacher_courses():
    teacher, error = _get_teacher()
    if error:
        return error

    search = request.args.get("search", "").strip() or None
    return success_response(data={"courses": get_teacher_courses(teacher, search=search)})


def teacher_course_detail(course_id):
    teacher, error = _get_teacher()
    if error:
        return error

    course = get_teacher_course_detail(teacher, course_id)
    if not course:
        return error_response("Course not found", status_code=404)

    return success_response(data={"course": course})


def teacher_create_course():
    teacher, error = _get_teacher()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    course, errors = create_teacher_course(teacher, data)

    if errors:
        return error_response("Validation failed", status_code=400, errors=errors)

    return success_response(
        data={"course": course},
        message="Course created successfully",
        status_code=201,
    )


def teacher_update_course(course_id):
    teacher, error = _get_teacher()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    course, errors = update_teacher_course(teacher, course_id, data)

    if errors:
        status_code = 404 if errors.get("course") else 400
        message = errors.get("course", "Validation failed")
        return error_response(message, status_code=status_code, errors=errors)

    return success_response(
        data={"course": course},
        message="Course updated successfully",
    )


def teacher_delete_course(course_id):
    teacher, error = _get_teacher()
    if error:
        return error

    deleted, errors = delete_teacher_course(teacher, course_id)

    if not deleted:
        return error_response(
            errors.get("course", "Course not found"),
            status_code=404,
            errors=errors,
        )

    return success_response(message="Course deleted successfully")


def teacher_course_students(course_id):
    teacher, error = _get_teacher()
    if error:
        return error

    result = get_course_enrolled_students(teacher, course_id)
    if not result:
        return error_response("Course not found", status_code=404)

    return success_response(data=result)


def teacher_assignments():
    teacher, error = _get_teacher()
    if error:
        return error

    search = request.args.get("search", "").strip() or None
    course_id = request.args.get("course_id", type=int)

    return success_response(
        data={"assignments": get_teacher_assignments(teacher, search=search, course_id=course_id)}
    )


def teacher_assignment_detail(assignment_id):
    teacher, error = _get_teacher()
    if error:
        return error

    assignment = get_teacher_assignment_detail(teacher, assignment_id)
    if not assignment:
        return error_response("Assignment not found", status_code=404)

    return success_response(data={"assignment": assignment})


def teacher_create_assignment():
    teacher, error = _get_teacher()
    if error:
        return error

    assignment, errors = create_teacher_assignment(
        teacher,
        _assignment_form_data(),
        request.files.get("file"),
    )

    if errors:
        return error_response(_first_error_message(errors), status_code=400, errors=errors)

    return success_response(
        data={"assignment": assignment},
        message="Assignment created successfully",
        status_code=201,
    )


def teacher_update_assignment(assignment_id):
    teacher, error = _get_teacher()
    if error:
        return error

    remove_file = request.form.get("remove_file", "").lower() in {"1", "true", "yes"}
    assignment, errors = update_teacher_assignment(
        teacher,
        assignment_id,
        _assignment_form_data(),
        request.files.get("file"),
        remove_file=remove_file,
    )

    if errors:
        status_code = 404 if errors.get("assignment") else 400
        message = errors.get("assignment", _first_error_message(errors))
        return error_response(message, status_code=status_code, errors=errors)

    return success_response(
        data={"assignment": assignment},
        message="Assignment updated successfully",
    )


def teacher_delete_assignment(assignment_id):
    teacher, error = _get_teacher()
    if error:
        return error

    deleted, errors = delete_teacher_assignment(teacher, assignment_id)

    if not deleted:
        return error_response(
            errors.get("assignment", "Assignment not found"),
            status_code=404,
            errors=errors,
        )

    return success_response(message="Assignment deleted successfully")


def teacher_assignment_submissions(assignment_id):
    teacher, error = _get_teacher()
    if error:
        return error

    result = get_assignment_submissions(teacher, assignment_id)
    if not result:
        return error_response("Assignment not found", status_code=404)

    return success_response(data=result)


def teacher_assignment_file(assignment_id):
    teacher, error = _get_teacher()
    if error:
        return error

    file_path, assignment = get_assignment_file_for_teacher(teacher, assignment_id)
    if not file_path:
        return error_response("File not found", status_code=404)

    mimetype = assignment.mime_type or "application/octet-stream"
    if assignment.file_name and assignment.file_name.lower().endswith(".pdf"):
        mimetype = "application/pdf"

    return send_file(
        file_path,
        mimetype=mimetype,
        as_attachment=True,
        download_name=assignment.file_name,
    )


def teacher_submission_file(submission_id):
    teacher, error = _get_teacher()
    if error:
        return error

    file_path, submission = get_submission_file_for_teacher(teacher, submission_id)
    if not file_path:
        return error_response("File not found", status_code=404)

    mimetype = submission.mime_type or "application/octet-stream"
    if submission.file_name and submission.file_name.lower().endswith(".pdf"):
        mimetype = "application/pdf"

    return send_file(
        file_path,
        mimetype=mimetype,
        as_attachment=True,
        download_name=submission.file_name,
    )
