from sqlalchemy import or_

from app.database.connection import db
from app.models.assignment import Assignment
from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.submission import Submission
from app.models.user import User
from app.utils.file_upload import (
    delete_assignment_file,
    delete_submission_file,
    get_assignment_absolute_path,
    get_submission_absolute_path,
    save_assignment_file,
)
from app.utils.validators import (
    validate_assignment_payload,
    validate_course_payload,
    validate_password_change_payload,
    validate_teacher_profile_update_payload,
)


def _get_teacher_course(teacher, course_id):
    return Course.query.filter_by(id=course_id, teacher_id=teacher.id).first()


def serialize_teacher_profile(teacher):
    user = teacher.user
    return {
        "employee_id": teacher.employee_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": user.full_name,
        "email": user.email,
        "account_status": "active" if user.is_active else "inactive",
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


def update_teacher_profile(teacher, data):
    errors, validated = validate_teacher_profile_update_payload(data)
    if errors:
        return None, errors

    user = teacher.user
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
    return serialize_teacher_profile(teacher), None


def change_teacher_password(teacher, data):
    errors, validated = validate_password_change_payload(data)
    if errors:
        return None, errors

    user = teacher.user
    if not verify_password(user.password_hash, validated["current_password"]):
        return None, {"current_password": "Current password is incorrect"}

    user.password_hash = hash_password(validated["new_password"])
    db.session.commit()
    return True, None


def _enrolled_count(course_id):
    return Enrollment.query.filter_by(
        course_id=course_id,
        status=EnrollmentStatus.ACTIVE,
    ).count()


def serialize_teacher_course(course, detailed=False):
    teacher_name = course.teacher.user.full_name if course.teacher and course.teacher.user else None

    data = {
        "id": course.id,
        "title": course.title,
        "code": course.code,
        "description": course.description,
        "teacher_name": teacher_name,
        "created_at": course.created_at.isoformat() if course.created_at else None,
        "enrolled_count": _enrolled_count(course.id),
    }

    if detailed:
        data["is_active"] = course.is_active

    return data


def get_teacher_courses(teacher, search=None):
    query = Course.query.filter_by(teacher_id=teacher.id)

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Course.title.ilike(term),
                Course.code.ilike(term),
                Course.description.ilike(term),
            )
        )

    courses = query.order_by(Course.created_at.desc()).all()
    return [serialize_teacher_course(course) for course in courses]


def get_teacher_course_detail(teacher, course_id):
    course = _get_teacher_course(teacher, course_id)
    if not course:
        return None
    return serialize_teacher_course(course, detailed=True)


def create_teacher_course(teacher, data):
    errors, validated = validate_course_payload(data)
    if errors:
        return None, errors

    existing = Course.query.filter_by(code=validated["code"]).first()
    if existing:
        return None, {"code": "A course with this code already exists"}

    course = Course(
        teacher_id=teacher.id,
        title=validated["title"],
        code=validated["code"],
        description=validated["description"],
    )
    db.session.add(course)
    db.session.commit()

    return serialize_teacher_course(course, detailed=True), None


def update_teacher_course(teacher, course_id, data):
    course = _get_teacher_course(teacher, course_id)
    if not course:
        return None, {"course": "Course not found or access denied"}

    errors, validated = validate_course_payload(data)
    if errors:
        return None, errors

    existing = Course.query.filter(
        Course.code == validated["code"],
        Course.id != course.id,
    ).first()
    if existing:
        return None, {"code": "A course with this code already exists"}

    course.title = validated["title"]
    course.code = validated["code"]
    course.description = validated["description"]
    db.session.commit()

    return serialize_teacher_course(course, detailed=True), None


def delete_teacher_course(teacher, course_id):
    course = _get_teacher_course(teacher, course_id)
    if not course:
        return False, {"course": "Course not found or access denied"}

    db.session.delete(course)
    db.session.commit()
    return True, None


def _serialize_enrolled_student(enrollment):
    student = enrollment.student
    if not student or not student.user:
        return None

    user = student.user
    return {
        "enrollment_id": enrollment.id,
        "student_id": student.id,
        "student_number": student.student_number,
        "full_name": user.full_name,
        "email": user.email,
        "enrolled_at": enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None,
    }


def get_course_enrolled_students(teacher, course_id):
    course = _get_teacher_course(teacher, course_id)
    if not course:
        return None

    enrollments = (
        Enrollment.query.filter_by(
            course_id=course_id,
            status=EnrollmentStatus.ACTIVE,
        )
        .order_by(Enrollment.enrolled_at.desc())
        .all()
    )

    students = []
    for enrollment in enrollments:
        serialized = _serialize_enrolled_student(enrollment)
        if serialized:
            students.append(serialized)

    return {
        "course": serialize_teacher_course(course),
        "students": students,
    }


def _get_teacher_assignment(teacher, assignment_id):
    assignment = db.session.get(Assignment, assignment_id)
    if not assignment or assignment.course.teacher_id != teacher.id:
        return None
    return assignment


def _submission_count(assignment_id):
    return Submission.query.filter_by(assignment_id=assignment_id).count()


def _assignment_attachment_fields(assignment):
    has_file = bool(assignment.stored_name)
    return {
        "has_file": has_file,
        "file_name": assignment.file_name,
        "file_size": assignment.file_size,
        "file_url": f"/api/teacher/assignments/{assignment.id}/file" if has_file else None,
        "attachment_url": f"/api/student/assignments/{assignment.id}/file" if has_file else None,
    }


def serialize_teacher_assignment(assignment):
    return {
        "id": assignment.id,
        "title": assignment.title,
        "description": assignment.description,
        "course_id": assignment.course_id,
        "course_code": assignment.course.code,
        "course_title": assignment.course.title,
        "due_date": assignment.due_date.isoformat() if assignment.due_date else None,
        "max_points": float(assignment.max_points),
        "created_at": assignment.created_at.isoformat() if assignment.created_at else None,
        "submission_count": _submission_count(assignment.id),
        **_assignment_attachment_fields(assignment),
    }


def get_teacher_assignments(teacher, search=None, course_id=None):
    query = (
        Assignment.query.join(Course)
        .filter(Course.teacher_id == teacher.id)
    )

    if course_id:
        query = query.filter(Assignment.course_id == course_id)

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Assignment.title.ilike(term),
                Assignment.description.ilike(term),
                Course.title.ilike(term),
                Course.code.ilike(term),
            )
        )

    assignments = query.order_by(Assignment.created_at.desc()).all()
    return [serialize_teacher_assignment(assignment) for assignment in assignments]


def get_teacher_assignment_detail(teacher, assignment_id):
    assignment = _get_teacher_assignment(teacher, assignment_id)
    if not assignment:
        return None
    return serialize_teacher_assignment(assignment)


def create_teacher_assignment(teacher, data, file_storage=None):
    errors, validated = validate_assignment_payload(data)
    if errors:
        return None, errors

    course = _get_teacher_course(teacher, validated["course_id"])
    if not course:
        return None, {"course_id": "Course not found or access denied"}

    assignment = Assignment(
        course_id=validated["course_id"],
        title=validated["title"],
        description=validated["description"],
        due_date=validated["due_date"],
        max_points=validated["max_points"],
    )
    db.session.add(assignment)
    db.session.flush()

    if file_storage and file_storage.filename:
        file_metadata, file_errors = save_assignment_file(assignment.id, file_storage)
        if file_errors:
            db.session.rollback()
            return None, file_errors
        assignment.file_name = file_metadata["file_name"]
        assignment.stored_name = file_metadata["stored_name"]
        assignment.file_size = file_metadata["file_size"]
        assignment.mime_type = file_metadata["mime_type"]

    db.session.commit()

    return serialize_teacher_assignment(assignment), None


def update_teacher_assignment(teacher, assignment_id, data, file_storage=None, remove_file=False):
    assignment = _get_teacher_assignment(teacher, assignment_id)
    if not assignment:
        return None, {"assignment": "Assignment not found or access denied"}

    errors, validated = validate_assignment_payload(data)
    if errors:
        return None, errors

    course = _get_teacher_course(teacher, validated["course_id"])
    if not course:
        return None, {"course_id": "Course not found or access denied"}

    assignment.course_id = validated["course_id"]
    assignment.title = validated["title"]
    assignment.description = validated["description"]
    assignment.due_date = validated["due_date"]
    assignment.max_points = validated["max_points"]

    if remove_file and assignment.stored_name:
        delete_assignment_file(assignment.id, assignment.stored_name)
        assignment.file_name = None
        assignment.stored_name = None
        assignment.file_size = None
        assignment.mime_type = None

    if file_storage and file_storage.filename:
        if assignment.stored_name:
            delete_assignment_file(assignment.id, assignment.stored_name)
        file_metadata, file_errors = save_assignment_file(assignment.id, file_storage)
        if file_errors:
            return None, file_errors
        assignment.file_name = file_metadata["file_name"]
        assignment.stored_name = file_metadata["stored_name"]
        assignment.file_size = file_metadata["file_size"]
        assignment.mime_type = file_metadata["mime_type"]

    db.session.commit()

    return serialize_teacher_assignment(assignment), None


def delete_teacher_assignment(teacher, assignment_id):
    assignment = _get_teacher_assignment(teacher, assignment_id)
    if not assignment:
        return False, {"assignment": "Assignment not found or access denied"}

    if assignment.stored_name:
        delete_assignment_file(assignment.id, assignment.stored_name)

    for submission in assignment.submissions:
        if submission.stored_name:
            delete_submission_file(
                assignment.id,
                submission.student_id,
                submission.stored_name,
            )

    db.session.delete(assignment)
    db.session.commit()
    return True, None


def _serialize_teacher_submission(submission):
    student = submission.student
    if not student or not student.user:
        return None

    user = student.user
    has_file = bool(submission.stored_name)
    file_url = submission.file_url
    if has_file:
        file_url = f"/api/teacher/submissions/{submission.id}/file"

    return {
        "id": submission.id,
        "student_id": student.id,
        "student_number": student.student_number,
        "student_name": user.full_name,
        "submission_status": submission.status.value,
        "submitted_at": submission.submitted_at.isoformat() if submission.submitted_at else None,
        "content": submission.content,
        "file_url": file_url,
        "file_name": submission.file_name,
        "has_file": has_file,
        "grade": float(submission.grade) if submission.grade is not None else None,
    }


def get_assignment_submissions(teacher, assignment_id):
    assignment = _get_teacher_assignment(teacher, assignment_id)
    if not assignment:
        return None

    submissions = (
        Submission.query.filter_by(assignment_id=assignment_id)
        .order_by(Submission.submitted_at.desc())
        .all()
    )

    students = []
    for submission in submissions:
        serialized = _serialize_teacher_submission(submission)
        if serialized:
            students.append(serialized)

    return {
        "assignment": serialize_teacher_assignment(assignment),
        "submissions": students,
    }


def get_assignment_file_for_teacher(teacher, assignment_id):
    assignment = _get_teacher_assignment(teacher, assignment_id)
    if not assignment or not assignment.stored_name:
        return None, None

    file_path = get_assignment_absolute_path(assignment.id, assignment.stored_name)
    if not file_path.is_file():
        return None, None

    return file_path, assignment


def get_submission_file_for_teacher(teacher, submission_id):
    submission = db.session.get(Submission, submission_id)
    if not submission:
        return None, None

    assignment = _get_teacher_assignment(teacher, submission.assignment_id)
    if not assignment or not submission.stored_name:
        return None, None

    file_path = get_submission_absolute_path(
        submission.assignment_id,
        submission.student_id,
        submission.stored_name,
    )
    if not file_path.is_file():
        return None, None

    return file_path, submission
