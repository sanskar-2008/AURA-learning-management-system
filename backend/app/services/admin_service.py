from sqlalchemy import or_

from app.database.connection import db
from app.models.assignment import Assignment
from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.student import Student
from app.models.submission import Submission
from app.models.teacher import Teacher
from app.models.user import User, UserRole
from app.utils.validators import (
    validate_assignment_payload,
    validate_course_payload,
    validate_teacher_profile_update_payload,
)


def get_admin_dashboard():
    """Return system-wide totals for the admin dashboard."""
    return {
        "total_students": Student.query.count(),
        "total_teachers": Teacher.query.count(),
        "total_courses": Course.query.count(),
        "total_assignments": Assignment.query.count(),
    }


# --- User management ---------------------------------------------------------

def _serialize_user_account(user, extra=None):
    data = {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role.value,
        "is_active": user.is_active,
        "account_status": "active" if user.is_active else "inactive",
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }
    if extra:
        data.update(extra)
    return data


def get_students(search=None):
    query = Student.query.join(User)

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                User.first_name.ilike(term),
                User.last_name.ilike(term),
                User.email.ilike(term),
                Student.student_number.ilike(term),
            )
        )

    students = query.order_by(Student.id).all()
    return [
        _serialize_user_account(
            student.user,
            {"student_number": student.student_number, "student_id": student.student_number},
        )
        for student in students
        if student.user
    ]


def get_teachers(search=None):
    query = Teacher.query.join(User)

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                User.first_name.ilike(term),
                User.last_name.ilike(term),
                User.email.ilike(term),
                Teacher.employee_id.ilike(term),
            )
        )

    teachers = query.order_by(Teacher.id).all()
    return [
        _serialize_user_account(
            teacher.user,
            {"employee_id": teacher.employee_id, "teacher_id": teacher.employee_id},
        )
        for teacher in teachers
        if teacher.user
    ]


def set_user_active_status(user_id, is_active, current_admin):
    user = db.session.get(User, user_id)
    if not user:
        return None, {"user": "User not found"}

    if user.role == UserRole.ADMIN:
        return None, {"user": "Admin accounts cannot be modified"}

    if current_admin and user.id == current_admin.id:
        return None, {"user": "You cannot change your own account status"}

    user.is_active = is_active
    db.session.commit()

    return _serialize_user_account(user), None


# --- Course management -------------------------------------------------------

def _enrolled_count(course_id):
    return Enrollment.query.filter_by(
        course_id=course_id,
        status=EnrollmentStatus.ACTIVE,
    ).count()


def _serialize_course(course, detailed=False):
    teacher_name = course.teacher.user.full_name if course.teacher and course.teacher.user else None

    data = {
        "id": course.id,
        "title": course.title,
        "code": course.code,
        "description": course.description,
        "teacher_name": teacher_name,
        "teacher_id": course.teacher_id,
        "created_at": course.created_at.isoformat() if course.created_at else None,
        "enrolled_count": _enrolled_count(course.id),
    }

    if detailed:
        data["is_active"] = course.is_active

    return data


def get_courses(search=None):
    query = Course.query

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
    return [_serialize_course(course) for course in courses]


def get_course_detail(course_id):
    course = db.session.get(Course, course_id)
    if not course:
        return None
    return _serialize_course(course, detailed=True)


def update_course(course_id, data):
    course = db.session.get(Course, course_id)
    if not course:
        return None, {"course": "Course not found"}

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

    return _serialize_course(course, detailed=True), None


def delete_course(course_id):
    course = db.session.get(Course, course_id)
    if not course:
        return False, {"course": "Course not found"}

    db.session.delete(course)
    db.session.commit()
    return True, None


# --- Assignment management ---------------------------------------------------

def _submission_count(assignment_id):
    return Submission.query.filter_by(assignment_id=assignment_id).count()


def _serialize_assignment(assignment):
    course = assignment.course
    return {
        "id": assignment.id,
        "title": assignment.title,
        "description": assignment.description,
        "course_id": assignment.course_id,
        "course_code": course.code if course else None,
        "course_title": course.title if course else None,
        "due_date": assignment.due_date.isoformat() if assignment.due_date else None,
        "max_points": float(assignment.max_points),
        "created_at": assignment.created_at.isoformat() if assignment.created_at else None,
        "submission_count": _submission_count(assignment.id),
    }


def get_assignments(search=None):
    query = Assignment.query.join(Course)

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
    return [_serialize_assignment(assignment) for assignment in assignments]


def get_assignment_detail(assignment_id):
    assignment = db.session.get(Assignment, assignment_id)
    if not assignment:
        return None
    return _serialize_assignment(assignment)


def update_assignment(assignment_id, data):
    assignment = db.session.get(Assignment, assignment_id)
    if not assignment:
        return None, {"assignment": "Assignment not found"}

    errors, validated = validate_assignment_payload(data)
    if errors:
        return None, errors

    course = db.session.get(Course, validated["course_id"])
    if not course:
        return None, {"course_id": "Course not found"}

    assignment.course_id = validated["course_id"]
    assignment.title = validated["title"]
    assignment.description = validated["description"]
    assignment.due_date = validated["due_date"]
    assignment.max_points = validated["max_points"]
    db.session.commit()

    return _serialize_assignment(assignment), None


def delete_assignment(assignment_id):
    assignment = db.session.get(Assignment, assignment_id)
    if not assignment:
        return False, {"assignment": "Assignment not found"}

    db.session.delete(assignment)
    db.session.commit()
    return True, None


def get_courses_for_select():
    """Lightweight course list used to populate assignment edit dropdowns."""
    courses = Course.query.order_by(Course.title).all()
    return [
        {"id": course.id, "title": course.title, "code": course.code}
        for course in courses
    ]


# --- Profile -----------------------------------------------------------------

def serialize_admin_profile(user):
    return {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role.value,
        "account_status": "active" if user.is_active else "inactive",
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


def update_admin_profile(user, data):
    errors, validated = validate_teacher_profile_update_payload(data)
    if errors:
        return None, errors

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

    return serialize_admin_profile(user), None
