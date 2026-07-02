from datetime import datetime, timezone

from app.database.connection import db
from app.models.assignment import Assignment
from app.models.attendance import Attendance, AttendanceStatus
from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.fee import Fee, FeeStatus
from app.models.parent_student import ParentStudent
from app.models.student import Student
from app.models.submission import Submission, SubmissionStatus
from app.models.user import User
from app.utils.password import hash_password, verify_password
from app.utils.validators import (
    validate_link_child_payload,
    validate_parent_profile_update_payload,
    validate_password_change_payload,
)


def _serialize_child(student, link=None):
    user = student.user
    return {
        "id": student.id,
        "student_id": student.student_number,
        "student_number": student.student_number,
        "full_name": user.full_name if user else None,
        "first_name": user.first_name if user else None,
        "last_name": user.last_name if user else None,
        "email": user.email if user else None,
        "grade_level": student.grade_level,
        "linked_at": link.created_at.isoformat() if link and link.created_at else None,
    }


def get_parent_children(parent):
    children = []
    for link in parent.student_links:
        if link.student and link.student.user:
            children.append(_serialize_child(link.student, link))
    return children


def _get_linked_student(parent, student_id):
    link = ParentStudent.query.filter_by(
        parent_id=parent.id,
        student_id=student_id,
    ).first()
    if not link or not link.student:
        return None
    return link.student


def link_child(parent, data):
    errors, validated = validate_link_child_payload(data)
    if errors:
        return None, errors

    student = Student.query.filter_by(student_number=validated["student_number"]).first()
    if not student:
        return None, {"student_number": "Student not found."}

    existing = ParentStudent.query.filter_by(
        parent_id=parent.id,
        student_id=student.id,
    ).first()
    if existing:
        return None, {"student_number": "This child is already linked to your account."}

    link = ParentStudent(parent_id=parent.id, student_id=student.id)
    db.session.add(link)
    db.session.commit()

    return _serialize_child(student, link), None


def _active_enrollments(student):
    return Enrollment.query.filter_by(
        student_id=student.id,
        status=EnrollmentStatus.ACTIVE,
    ).all()


def _enrolled_course_ids(student):
    return [enrollment.course_id for enrollment in _active_enrollments(student)]


def _serialize_course_for_parent(course, enrollment=None):
    teacher_name = course.teacher.user.full_name if course.teacher and course.teacher.user else None
    return {
        "id": course.id,
        "code": course.code,
        "title": course.title,
        "description": course.description,
        "teacher_name": teacher_name,
        "credits": course.credits,
        "start_date": course.start_date.isoformat() if course.start_date else None,
        "end_date": course.end_date.isoformat() if course.end_date else None,
        "is_active": course.is_active,
        "enrollment_status": enrollment.status.value if enrollment else None,
        "enrolled_at": enrollment.enrolled_at.isoformat() if enrollment and enrollment.enrolled_at else None,
        "final_grade": enrollment.final_grade if enrollment else None,
    }


def _calculate_attendance_percentage(student):
    records = Attendance.query.filter_by(student_id=student.id).all()
    if not records:
        return 0

    present_count = sum(
        1
        for record in records
        if record.status
        in (AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.EXCUSED)
    )
    return round((present_count / len(records)) * 100, 1)


def _calculate_pending_assignments(student):
    course_ids = _enrolled_course_ids(student)
    if not course_ids:
        return 0

    assignments = Assignment.query.filter(Assignment.course_id.in_(course_ids)).all()
    submissions = {
        submission.assignment_id: submission
        for submission in Submission.query.filter_by(student_id=student.id).all()
    }

    pending = 0
    for assignment in assignments:
        submission = submissions.get(assignment.id)
        if submission is None:
            pending += 1
    return pending


def _calculate_outstanding_fees(student):
    fees = Fee.query.filter(
        Fee.student_id == student.id,
        Fee.status.in_([FeeStatus.PENDING, FeeStatus.OVERDUE]),
    ).all()
    return sum(float(fee.amount) for fee in fees)


def get_parent_dashboard(parent, student_id=None):
    children = get_parent_children(parent)
    if not children:
        return {"has_children": False, "children": [], "summary": None, "selected_child": None}

    selected = None
    if student_id:
        selected = next((child for child in children if child["id"] == student_id), None)
    if not selected:
        selected = children[0]

    student = _get_linked_student(parent, selected["id"])
    summary = {
        "total_enrolled_courses": len(_active_enrollments(student)),
        "pending_assignments": _calculate_pending_assignments(student),
        "attendance_percentage": f"{_calculate_attendance_percentage(student)}%",
        "outstanding_fees": _calculate_outstanding_fees(student),
    }

    return {
        "has_children": True,
        "children": children,
        "selected_child": selected,
        "summary": summary,
    }


def get_child_profile(parent, student_id):
    student = _get_linked_student(parent, student_id)
    if not student:
        return None

    link = ParentStudent.query.filter_by(
        parent_id=parent.id,
        student_id=student.id,
    ).first()
    return _serialize_child(student, link)


def get_child_courses(parent, student_id):
    student = _get_linked_student(parent, student_id)
    if not student:
        return None

    enrollments = _active_enrollments(student)
    return [
        _serialize_course_for_parent(enrollment.course, enrollment)
        for enrollment in enrollments
    ]


def get_child_course_detail(parent, student_id, course_id):
    student = _get_linked_student(parent, student_id)
    if not student:
        return None

    enrollment = Enrollment.query.filter_by(
        student_id=student.id,
        course_id=course_id,
        status=EnrollmentStatus.ACTIVE,
    ).first()
    if not enrollment or not enrollment.course:
        return None

    return _serialize_course_for_parent(enrollment.course, enrollment)


def _serialize_assignment_for_parent(assignment, submission=None):
    return {
        "id": assignment.id,
        "title": assignment.title,
        "description": assignment.description,
        "course_id": assignment.course_id,
        "course_code": assignment.course.code,
        "course_title": assignment.course.title,
        "due_date": assignment.due_date.isoformat() if assignment.due_date else None,
        "max_points": float(assignment.max_points),
        "status": "submitted" if submission else "pending",
        "submission_status": submission.status.value if submission else None,
        "submitted_at": submission.submitted_at.isoformat() if submission else None,
        "grade": float(submission.grade) if submission and submission.grade is not None else None,
        "is_submitted": submission is not None,
    }


def get_child_assignments(parent, student_id):
    student = _get_linked_student(parent, student_id)
    if not student:
        return None

    course_ids = _enrolled_course_ids(student)
    if not course_ids:
        return []

    assignments = (
        Assignment.query.filter(Assignment.course_id.in_(course_ids))
        .join(Course)
        .order_by(Assignment.due_date.asc().nullslast(), Assignment.title)
        .all()
    )
    submissions = {
        submission.assignment_id: submission
        for submission in Submission.query.filter_by(student_id=student.id).all()
    }

    return [
        _serialize_assignment_for_parent(assignment, submissions.get(assignment.id))
        for assignment in assignments
    ]


def get_child_attendance(parent, student_id):
    student = _get_linked_student(parent, student_id)
    if not student:
        return None

    records = (
        Attendance.query.filter_by(student_id=student.id)
        .order_by(Attendance.date.desc())
        .all()
    )

    return {
        "attendance_percentage": _calculate_attendance_percentage(student),
        "records": [
            {
                "id": record.id,
                "course_id": record.course_id,
                "course_title": record.course.title if record.course else None,
                "date": record.date.isoformat() if record.date else None,
                "status": record.status.value,
                "notes": record.notes,
            }
            for record in records
        ],
    }


def get_child_grades(parent, student_id):
    student = _get_linked_student(parent, student_id)
    if not student:
        return None

    enrollments = _active_enrollments(student)
    course_grades = [
        {
            "course_id": enrollment.course_id,
            "course_code": enrollment.course.code,
            "course_title": enrollment.course.title,
            "final_grade": enrollment.final_grade,
        }
        for enrollment in enrollments
    ]

    submissions = (
        Submission.query.filter_by(student_id=student.id)
        .filter(Submission.grade.isnot(None))
        .all()
    )
    assignment_grades = [
        {
            "assignment_id": submission.assignment_id,
            "assignment_title": submission.assignment.title,
            "course_title": submission.assignment.course.title,
            "grade": float(submission.grade),
            "max_points": float(submission.assignment.max_points),
        }
        for submission in submissions
    ]

    return {
        "course_grades": course_grades,
        "assignment_grades": assignment_grades,
        "mark_records": get_parent_child_grade_records_inline(student),
    }


def get_parent_child_grade_records_inline(student):
    from app.models.grade import Grade
    from app.services.grade_service import serialize_grade

    grades = (
        Grade.query.filter_by(student_id=student.id)
        .order_by(Grade.evaluated_at.desc())
        .all()
    )
    return [serialize_grade(item) for item in grades]


def get_child_progress(parent, student_id):
    student = _get_linked_student(parent, student_id)
    if not student:
        return None

    course_ids = _enrolled_course_ids(student)
    total_assignments = 0
    submitted_assignments = 0
    graded_assignments = 0
    grade_total = 0
    grade_count = 0

    if course_ids:
        assignments = Assignment.query.filter(Assignment.course_id.in_(course_ids)).all()
        total_assignments = len(assignments)
        submissions = {
            submission.assignment_id: submission
            for submission in Submission.query.filter_by(student_id=student.id).all()
        }
        for assignment in assignments:
            submission = submissions.get(assignment.id)
            if submission:
                submitted_assignments += 1
                if submission.grade is not None:
                    graded_assignments += 1
                    grade_total += float(submission.grade)
                    grade_count += 1

    average_grade = round(grade_total / grade_count, 2) if grade_count else None

    return {
        "enrolled_courses": len(course_ids),
        "total_assignments": total_assignments,
        "submitted_assignments": submitted_assignments,
        "graded_assignments": graded_assignments,
        "average_grade": average_grade,
        "attendance_percentage": _calculate_attendance_percentage(student),
    }


def get_child_learning_dashboard(parent, student_id):
    """Combined learning dashboard: courses, grades, assignments, and progress."""
    student = _get_linked_student(parent, student_id)
    if not student:
        return None

    return {
        "progress": get_child_progress(parent, student_id),
        "courses": get_child_courses(parent, student_id),
        "assignments": get_child_assignments(parent, student_id),
        "grades": get_child_grades(parent, student_id),
    }


def _serialize_fee(fee):
    return {
        "id": fee.id,
        "description": fee.description,
        "amount": float(fee.amount),
        "due_date": fee.due_date.isoformat() if fee.due_date else None,
        "paid_at": fee.paid_at.isoformat() if fee.paid_at else None,
        "status": fee.status.value,
    }


def get_child_fees(parent, student_id):
    student = _get_linked_student(parent, student_id)
    if not student:
        return None

    fees = Fee.query.filter_by(student_id=student.id).order_by(Fee.due_date.desc()).all()
    serialized = [_serialize_fee(fee) for fee in fees]
    pending_fees = [fee for fee in serialized if fee["status"] != FeeStatus.PAID.value]
    payment_history = [fee for fee in serialized if fee["status"] == FeeStatus.PAID.value]

    return {
        "fees": serialized,
        "pending_fees": pending_fees,
        "payment_history": payment_history,
    }


def pay_child_fee(parent, student_id, fee_id):
    student = _get_linked_student(parent, student_id)
    if not student:
        return None, {"student": "Access denied"}

    fee = Fee.query.filter_by(id=fee_id, student_id=student.id).first()
    if not fee:
        return None, {"fee": "Fee not found"}

    if fee.status == FeeStatus.PAID:
        return None, {"fee": "This fee has already been paid"}

    fee.status = FeeStatus.PAID
    fee.paid_at = datetime.now(timezone.utc)
    db.session.commit()

    return _serialize_fee(fee), None


def serialize_parent_profile(parent):
    user = parent.user
    return {
        "parent_id": f"PAR{parent.id:03d}",
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": user.full_name,
        "email": user.email,
        "account_status": "active" if user.is_active else "inactive",
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


def update_parent_profile(parent, data):
    errors, validated = validate_parent_profile_update_payload(data)
    if errors:
        return None, errors

    user = parent.user
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

    return serialize_parent_profile(parent), None


def change_parent_password(parent, data):
    errors, validated = validate_password_change_payload(data)
    if errors:
        return None, errors

    user = parent.user
    if not verify_password(user.password_hash, validated["current_password"]):
        return None, {"current_password": "Current password is incorrect"}

    user.password_hash = hash_password(validated["new_password"])
    db.session.commit()
    return True, None
