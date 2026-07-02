from datetime import datetime, timezone

from app.database.connection import db
from app.models.assignment import Assignment
from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.submission import Submission, SubmissionStatus
from app.models.user import User
from app.utils.file_upload import (
    get_assignment_absolute_path,
    get_submission_absolute_path,
    save_submission_file,
)
from app.utils.password import hash_password, verify_password
from app.utils.validators import validate_password_change_payload, validate_profile_update_payload


def _get_enrollment(student, course_id):
    return Enrollment.query.filter_by(
        student_id=student.id,
        course_id=course_id,
    ).first()


def _serialize_course(course, student=None, detailed=False):
    enrollment = _get_enrollment(student, course.id) if student else None
    teacher_name = course.teacher.user.full_name if course.teacher and course.teacher.user else None

    data = {
        "id": course.id,
        "code": course.code,
        "title": course.title,
        "description": course.description,
        "credits": course.credits,
        "teacher_name": teacher_name,
        "is_enrolled": enrollment is not None,
    }

    if detailed:
        data.update(
            {
                "start_date": course.start_date.isoformat() if course.start_date else None,
                "end_date": course.end_date.isoformat() if course.end_date else None,
                "enrollment_status": enrollment.status.value if enrollment else None,
                "enrolled_at": enrollment.enrolled_at.isoformat() if enrollment else None,
            }
        )

    return data


def _active_enrollments(student):
    return Enrollment.query.filter_by(
        student_id=student.id,
        status=EnrollmentStatus.ACTIVE,
    ).all()


def _enrolled_course_ids(student, active_only=False):
    query = Enrollment.query.filter_by(student_id=student.id)
    if active_only:
        query = query.filter_by(status=EnrollmentStatus.ACTIVE)
    return [enrollment.course_id for enrollment in query.all()]


def serialize_student_profile(student):
    user = student.user
    return {
        "student_number": student.student_number,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": user.full_name,
        "email": user.email,
        "account_status": "active" if user.is_active else "inactive",
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


def update_student_profile(student, data):
    errors, validated = validate_profile_update_payload(data)
    if errors:
        return None, errors

    user = student.user
    existing = User.query.filter(
        User.email == validated["email"],
        User.id != user.id,
    ).first()
    if existing:
        return None, {"email": "An account with this email already exists"}

    user.first_name = validated["first_name"]
    user.last_name = validated["last_name"]
    user.email = validated["email"]

    db.session.commit()
    return serialize_student_profile(student), None


def change_student_password(student, data):
    errors, validated = validate_password_change_payload(data)
    if errors:
        return None, errors

    user = student.user
    if not verify_password(user.password_hash, validated["current_password"]):
        return None, {"current_password": "Current password is incorrect"}

    user.password_hash = hash_password(validated["new_password"])
    db.session.commit()
    return True, None


def get_dashboard_summary(student):
    enrollments = _active_enrollments(student)
    course_ids = [enrollment.course_id for enrollment in enrollments]

    if not course_ids:
        return {
            "enrolled_courses": 0,
            "pending_assignments": 0,
            "completed_assignments": 0,
        }

    assignments = Assignment.query.filter(Assignment.course_id.in_(course_ids)).all()
    submissions = Submission.query.filter(
        Submission.student_id == student.id,
        Submission.assignment_id.in_([assignment.id for assignment in assignments]),
    ).all()
    submission_by_assignment = {submission.assignment_id: submission for submission in submissions}

    pending = 0
    completed = 0

    for assignment in assignments:
        submission = submission_by_assignment.get(assignment.id)
        if submission is None or submission.status != SubmissionStatus.GRADED:
            pending += 1
        if submission and submission.status == SubmissionStatus.GRADED:
            completed += 1

    return {
        "enrolled_courses": len(enrollments),
        "pending_assignments": pending,
        "completed_assignments": completed,
    }


def get_enrolled_courses(student):
    enrollments = (
        Enrollment.query.filter_by(student_id=student.id)
        .join(Course)
        .order_by(Enrollment.enrolled_at.desc())
        .all()
    )

    return [
        {
            **_serialize_course(enrollment.course, student),
            "enrollment_id": enrollment.id,
            "status": enrollment.status.value,
            "enrolled_at": enrollment.enrolled_at.isoformat(),
        }
        for enrollment in enrollments
    ]


def browse_courses(student, search=None, enrollable_only=False):
    query = Course.query.filter_by(is_active=True)

    if search:
        query = query.filter(Course.title.ilike(f"%{search}%"))

    if enrollable_only:
        enrolled_ids = _enrolled_course_ids(student)
        if enrolled_ids:
            query = query.filter(~Course.id.in_(enrolled_ids))

    query = query.order_by(Course.title)
    return [_serialize_course(course, student) for course in query.all()]


def get_course_detail(student, course_id):
    course = Course.query.filter_by(id=course_id, is_active=True).first()
    if not course:
        return None
    return _serialize_course(course, student, detailed=True)


def enroll_in_course(student, course_id):
    course = Course.query.filter_by(id=course_id, is_active=True).first()
    if not course:
        return None, {"course": "Course not found"}

    if _get_enrollment(student, course_id):
        return None, {"enrollment": "You are already enrolled in this course"}

    enrollment = Enrollment(
        student_id=student.id,
        course_id=course_id,
        status=EnrollmentStatus.ACTIVE,
    )
    db.session.add(enrollment)
    db.session.commit()

    return {
        "enrollment_id": enrollment.id,
        "course": _serialize_course(course, student, detailed=True),
    }, None


def _is_enrolled_in_course(student, course_id):
    return (
        Enrollment.query.filter_by(
            student_id=student.id,
            course_id=course_id,
            status=EnrollmentStatus.ACTIVE,
        ).first()
        is not None
    )


def _assignment_is_late(assignment):
    if not assignment.due_date:
        return False
    due = assignment.due_date
    if due.tzinfo is None:
        due = due.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) > due


def _display_status(submission):
    return "submitted" if submission else "pending"


def _serialize_assignment(assignment, submission=None):
    has_attachment = bool(assignment.stored_name)
    submission_file_url = None
    submission_file_name = None
    if submission:
        if submission.stored_name:
            submission_file_url = f"/api/student/submissions/{submission.id}/file"
            submission_file_name = submission.file_name
        elif submission.file_url:
            submission_file_url = submission.file_url

    return {
        "id": assignment.id,
        "title": assignment.title,
        "description": assignment.description,
        "course_id": assignment.course_id,
        "course_code": assignment.course.code,
        "course_title": assignment.course.title,
        "due_date": assignment.due_date.isoformat() if assignment.due_date else None,
        "max_points": float(assignment.max_points),
        "status": _display_status(submission),
        "submission_status": submission.status.value if submission else None,
        "submitted_at": submission.submitted_at.isoformat() if submission else None,
        "grade": float(submission.grade) if submission and submission.grade is not None else None,
        "feedback": submission.feedback if submission else None,
        "content": submission.content if submission else None,
        "file_url": submission_file_url,
        "file_name": submission_file_name,
        "has_attachment": has_attachment,
        "attachment_name": assignment.file_name if has_attachment else None,
        "attachment_url": f"/api/student/assignments/{assignment.id}/file" if has_attachment else None,
        "is_submitted": submission is not None,
    }


def _get_assignment_for_student(student, assignment_id):
    assignment = db.session.get(Assignment, assignment_id)
    if not assignment or not _is_enrolled_in_course(student, assignment.course_id):
        return None
    return assignment


def get_available_courses(student):
    return browse_courses(student, enrollable_only=True)


def get_student_assignments(student):
    course_ids = _enrolled_course_ids(student, active_only=True)

    if not course_ids:
        return []

    assignments = (
        Assignment.query.filter(Assignment.course_id.in_(course_ids))
        .join(Course)
        .order_by(Assignment.due_date.asc().nullslast(), Assignment.title)
        .all()
    )
    submissions = Submission.query.filter_by(student_id=student.id).all()
    submission_by_assignment = {submission.assignment_id: submission for submission in submissions}

    return [
        _serialize_assignment(assignment, submission_by_assignment.get(assignment.id))
        for assignment in assignments
    ]


def get_assignment_detail(student, assignment_id):
    assignment = _get_assignment_for_student(student, assignment_id)
    if not assignment:
        return None

    submission = Submission.query.filter_by(
        student_id=student.id,
        assignment_id=assignment_id,
    ).first()
    return _serialize_assignment(assignment, submission)


def submit_assignment(student, assignment_id, data, file_storage=None):
    assignment = _get_assignment_for_student(student, assignment_id)
    if not assignment:
        return None, {"assignment": "Assignment not found or access denied"}

    existing = Submission.query.filter_by(
        student_id=student.id,
        assignment_id=assignment_id,
    ).first()
    if existing:
        return None, {"submission": "You have already submitted this assignment"}

    content = (data.get("content") or "").strip()
    file_url = (data.get("file_url") or "").strip() or None
    has_upload = file_storage and file_storage.filename

    if not content and not file_url and not has_upload:
        return None, {"content": "Please provide your answer text or upload a file"}

    status = SubmissionStatus.LATE if _assignment_is_late(assignment) else SubmissionStatus.SUBMITTED

    submission = Submission(
        student_id=student.id,
        assignment_id=assignment_id,
        content=content or None,
        file_url=file_url,
        status=status,
    )
    db.session.add(submission)
    db.session.flush()

    if has_upload:
        file_metadata, file_errors = save_submission_file(assignment_id, student.id, file_storage)
        if file_errors:
            db.session.rollback()
            return None, file_errors
        submission.file_name = file_metadata["file_name"]
        submission.stored_name = file_metadata["stored_name"]
        submission.file_size = file_metadata["file_size"]
        submission.mime_type = file_metadata["mime_type"]
        submission.file_url = f"/api/student/submissions/{submission.id}/file"

    db.session.commit()

    return _serialize_assignment(assignment, submission), None


def get_assignment_file_for_student(student, assignment_id):
    assignment = _get_assignment_for_student(student, assignment_id)
    if not assignment or not assignment.stored_name:
        return None, None

    file_path = get_assignment_absolute_path(assignment.id, assignment.stored_name)
    if not file_path.is_file():
        return None, None

    return file_path, assignment


def get_submission_file_for_student(student, submission_id):
    submission = db.session.get(Submission, submission_id)
    if not submission or submission.student_id != student.id or not submission.stored_name:
        return None, None

    file_path = get_submission_absolute_path(
        submission.assignment_id,
        submission.student_id,
        submission.stored_name,
    )
    if not file_path.is_file():
        return None, None

    return file_path, submission
