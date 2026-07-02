from flask import g, request, send_file

from app.services.student_service import (
    browse_courses,
    change_student_password,
    enroll_in_course,
    get_assignment_detail,
    get_assignment_file_for_student,
    get_available_courses,
    get_course_detail,
    get_dashboard_summary,
    get_enrolled_courses,
    get_student_assignments,
    get_submission_file_for_student,
    serialize_student_profile,
    submit_assignment,
    update_student_profile,
)
from app.utils.responses import error_response, success_response


def _get_student():
    student = g.current_user.student_profile
    if not student:
        return None, error_response("Student profile not found", status_code=404)
    return student, None


def student_dashboard():
    student, error = _get_student()
    if error:
        return error

    return success_response(
        data={
            "profile": serialize_student_profile(student),
            "summary": get_dashboard_summary(student),
        }
    )


def student_courses():
    student, error = _get_student()
    if error:
        return error

    return success_response(data={"courses": get_enrolled_courses(student)})


def student_available_courses():
    student, error = _get_student()
    if error:
        return error

    return success_response(data={"courses": get_available_courses(student)})


def student_browse_courses():
    student, error = _get_student()
    if error:
        return error

    search = request.args.get("search", "").strip() or None
    enrollable_only = request.args.get("enrollable_only", "").lower() in {"1", "true", "yes"}

    return success_response(
        data={"courses": browse_courses(student, search=search, enrollable_only=enrollable_only)}
    )


def student_course_detail(course_id):
    student, error = _get_student()
    if error:
        return error

    course = get_course_detail(student, course_id)
    if not course:
        return error_response("Course not found", status_code=404)

    return success_response(data={"course": course})


def student_enroll(course_id):
    student, error = _get_student()
    if error:
        return error

    result, errors = enroll_in_course(student, course_id)
    if errors:
        return error_response(
            errors.get("enrollment", errors.get("course", "Enrollment failed")),
            status_code=400,
            errors=errors,
        )

    return success_response(
        data=result,
        message="Successfully enrolled in the course",
        status_code=201,
    )


def student_assignments():
    student, error = _get_student()
    if error:
        return error

    return success_response(data={"assignments": get_student_assignments(student)})


def student_assignment_detail(assignment_id):
    student, error = _get_student()
    if error:
        return error

    assignment = get_assignment_detail(student, assignment_id)
    if not assignment:
        return error_response("Assignment not found or access denied", status_code=404)

    return success_response(data={"assignment": assignment})


def student_submit_assignment(assignment_id):
    student, error = _get_student()
    if error:
        return error

    data = {
        "content": request.form.get("content"),
        "file_url": request.form.get("file_url"),
    }
    result, errors = submit_assignment(
        student,
        assignment_id,
        data,
        request.files.get("file"),
    )

    if errors:
        return error_response(
            errors.get("submission", errors.get("assignment", errors.get("content", "Submission failed"))),
            status_code=400,
            errors=errors,
        )

    return success_response(
        data={"assignment": result},
        message="Assignment submitted successfully",
        status_code=201,
    )


def student_assignment_file(assignment_id):
    student, error = _get_student()
    if error:
        return error

    file_path, assignment = get_assignment_file_for_student(student, assignment_id)
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


def student_submission_file(submission_id):
    student, error = _get_student()
    if error:
        return error

    file_path, submission = get_submission_file_for_student(student, submission_id)
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


def student_profile():
    student, error = _get_student()
    if error:
        return error

    return success_response(data={"profile": serialize_student_profile(student)})


def student_update_profile():
    student, error = _get_student()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    profile, errors = update_student_profile(student, data)

    if errors:
        return error_response("Validation failed", status_code=400, errors=errors)

    return success_response(
        data={"profile": profile},
        message="Profile updated successfully",
    )


def student_change_password():
    student, error = _get_student()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    _, errors = change_student_password(student, data)

    if errors:
        return error_response(
            errors.get("current_password", "Password change failed"),
            status_code=400,
            errors=errors,
        )

    return success_response(message="Password changed successfully")
